
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ChatMessage, MinisterSettings, Source } from "../types";

// --- SAFE ENV ACCESS ---
export const getSystemApiKey = (): string => {
  // 1. Try Vite/ESM standard (safest for this project structure)
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
      // @ts-ignore
      return import.meta.env.VITE_API_KEY;
    }
  } catch (e) {
    // Ignore
  }

  // 2. Try Node/Webpack standard (process.env)
  // accessing 'process' directly can cause ReferenceError in some strict browser environments
  try {
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore
  }
  
  return '';
};

const DEFAULT_API_KEY = getSystemApiKey();

// --- GOOGLE GENAI CACHING ---
interface CachedSession {
  chat: Chat;
  configKey: string; 
}
const chatSessions: Record<string, CachedSession> = {};

const getSessionConfigKey = (settings: MinisterSettings) => {
  return `${settings.provider}-${settings.model}-${settings.enableSearch}-${settings.apiKey || 'def'}-${settings.baseUrl || 'def'}`;
};

export interface StreamResult {
  text?: string;
  sources?: Source[];
}

// --- OPENAI COMPATIBLE STREAMING FUNCTION ---
const streamOpenAI = async function* (
  apiKey: string,
  baseUrl: string,
  model: string,
  messages: any[]
): AsyncGenerator<StreamResult, void, unknown> {
  
  // Ensure URL ends with /chat/completions if not provided by user (heuristic)
  let url = baseUrl;
  if (!url.endsWith('/chat/completions')) {
    if (url.endsWith('/')) url = url.slice(0, -1);
    url = `${url}/chat/completions`;
  }

  const controller = new AbortController();
  // Set a connection timeout (e.g. 30 seconds) to prevent hanging
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: true,
        temperature: 0.7
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `API Error ${response.status}`;
      try {
        // Try to parse OpenAI style error format
        const errorJson = JSON.parse(errorText);
        if (errorJson.error && errorJson.error.message) {
          errorMsg += `: ${errorJson.error.message}`;
        } else {
          errorMsg += `: ${errorText.substring(0, 200)}`;
        }
      } catch (e) {
        errorMsg += `: ${errorText.substring(0, 200)}`;
      }
      throw new Error(errorMsg);
    }

    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep partial line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.slice(6);
          if (jsonStr === '[DONE]') return;
          
          try {
            const json = JSON.parse(jsonStr);
            const text = json.choices?.[0]?.delta?.content;
            
            if (text) {
              yield { text };
            }
          } catch (e) {
            // console.warn("JSON Parse error", e);
          }
        }
      }
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error("Connection timed out (30s limit). Check your network or API endpoint.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

// --- GOOGLE GENAI FUNCTION ---
const getOrCreateGoogleSession = async (
  ministerId: string, 
  systemInstruction: string, 
  history: ChatMessage[],
  settings: MinisterSettings
): Promise<Chat> => {
  const configKey = getSessionConfigKey(settings);
  const existingSession = chatSessions[ministerId];

  if (existingSession && existingSession.configKey === configKey) {
    return existingSession.chat;
  }

  // Use settings.apiKey first (user override or global key passed down), then fall back to system default
  const finalApiKey = settings.apiKey || DEFAULT_API_KEY;
  if (!finalApiKey) throw new Error("Imperial Seal missing (No Google API Key). Please set it in the top bar or minister settings.");

  const clientOptions: any = { apiKey: finalApiKey };
  if (settings.baseUrl) clientOptions.baseUrl = settings.baseUrl;

  const ai = new GoogleGenAI(clientOptions);
  
  // History handling for Google
  const previousHistory = history.map(msg => {
    let contentText = msg.text;
    // Ensure text is not empty for Google history, otherwise use placeholder
    if (!contentText || contentText.trim() === '') {
        contentText = "[Image/Media Content]"; 
    }
    return {
      role: msg.role,
      parts: [{ text: contentText }]
    };
  });

  const tools = settings.enableSearch ? [{ googleSearch: {} }] : undefined;

  const chat = ai.chats.create({
    model: settings.model,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
      topK: 40,
      tools: tools, 
    },
    history: previousHistory
  });

  chatSessions[ministerId] = { chat, configKey };
  return chat;
};

// --- MAIN EXPORTED FUNCTION ---
export const sendMessageToMinister = async (
  ministerId: string, 
  message: string,
  systemInstruction: string,
  existingMessages: ChatMessage[],
  settings: MinisterSettings,
  images?: string[] // Array of Base64 Data URIs
): Promise<AsyncGenerator<StreamResult, void, unknown>> => {
  
  // PROVIDER: GOOGLE
  if (settings.provider === 'google') {
    try {
      const chatPromise = getOrCreateGoogleSession(ministerId, systemInstruction, existingMessages, settings);
      const chat = await Promise.race([
        chatPromise,
        new Promise<Chat>((_, reject) => setTimeout(() => reject(new Error("Connection timed out - Check API Key/Network")), 10000))
      ]);

      // Construct parts array strictly
      const parts: any[] = [];
      
      if (images && images.length > 0) {
        for (const imgUri of images) {
             // Extract base64 data and mime type. Format: data:image/jpeg;base64,.....
             const match = imgUri.match(/^data:(.+);base64,(.+)$/);
             if (match) {
                 parts.push({
                     inlineData: {
                         mimeType: match[1],
                         data: match[2]
                     }
                 });
             }
        }
      }

      // Add text part if message is not empty
      if (message && message.trim() !== "") {
         parts.push({ text: message });
      }

      // Validating Parts: Google SDK requires at least one part.
      if (parts.length === 0) {
          // If for some reason we have no images and no text (should be blocked by UI), add placeholder
          parts.push({ text: "..." });
      }

      // CRITICAL FIX: Pass 'message' property with the parts array, NOT 'contents'
      const resultPromise = chat.sendMessageStream({ message: parts });
      
      const result = await Promise.race([
          resultPromise,
          new Promise<any>((_, reject) => setTimeout(() => reject(new Error("Minister took too long to respond")), 20000))
      ]);

      async function* streamGenerator() {
        try {
          for await (const chunk of result) {
            const c = chunk as GenerateContentResponse;
            if (c.text) yield { text: c.text };
            
            const groundingMetadata = c.candidates?.[0]?.groundingMetadata;
            if (groundingMetadata?.groundingChunks) {
               const sources: Source[] = groundingMetadata.groundingChunks
                  .filter((chunk: any) => chunk.web)
                  .map((chunk: any) => ({
                    title: chunk.web.title || 'Imperial Archives',
                    uri: chunk.web.uri
                  }));
               if (sources.length > 0) yield { sources };
            }
          }
        } catch (streamError) {
          console.error("Google Stream interruption:", streamError);
          throw streamError;
        }
      }
      return streamGenerator();

    } catch (error) {
      console.error(`Google Provider Error:`, error);
      delete chatSessions[ministerId];
      throw error;
    }
  } 
  
  // PROVIDER: OPENAI / DEEPSEEK / ETC
  else {
    if (!settings.apiKey) {
        throw new Error("Custom Mandate missing (No API Key provided for custom provider).");
    }
    if (!settings.baseUrl) {
        throw new Error("Custom Mandate missing (No Base URL provided for custom provider).");
    }

    // Prepare history: Filter out empty messages to prevent "400 Bad Request"
    const validHistory = existingMessages.filter(m => 
      (m.text && m.text.trim().length > 0) || (m.images && m.images.length > 0)
    );

    const apiMessages = [
      { role: "system", content: systemInstruction },
      ...validHistory.map(m => { 
        const role = m.role === 'model' ? 'assistant' : m.role;
        // For OpenAI history simplicity, we map text. 
        // If text is empty (image only message in history), use placeholder.
        let content = m.text;
        if (!content || content.trim() === "") {
            content = "[Image attachment]";
        }
        return { role, content };
      }),
    ];

    // Current Message Construction
    let currentMessageContent: any = message;

    if (images && images.length > 0) {
        // Format as array for multimodal
        currentMessageContent = [];
        
        // Add Text if present
        if (message && message.trim()) {
             currentMessageContent.push({ type: "text", text: message });
        }
        
        // Add Images
        images.forEach(img => {
             currentMessageContent.push({
                type: "image_url",
                image_url: { url: img }
             });
        });
    }

    apiMessages.push({ role: "user", content: currentMessageContent });

    try {
      return streamOpenAI(settings.apiKey, settings.baseUrl, settings.model, apiMessages);
    } catch (error) {
      console.error(`OpenAI Provider Error:`, error);
      throw error;
    }
  }
};

export const resetMinisterMemory = (ministerId: string) => {
  delete chatSessions[ministerId];
};
