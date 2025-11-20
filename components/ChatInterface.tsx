import React, { useEffect, useRef, useState } from 'react';
import { Minister, ChatMessage, MinisterSettings, Source, ModelPreset } from '../types';
import { sendMessageToMinister } from '../services/geminiService';
import { Feather, Settings, X, Globe, Scroll, ExternalLink, Cpu, Link, Key, Server, Save, Trash2, BookMarked, PlusCircle, Tag, Image as ImageIcon } from 'lucide-react';
import { MINISTRY_ICONS, AI_PRESETS } from '../constants';

interface ChatInterfaceProps {
  minister: Minister;
  history: ChatMessage[];
  settings: MinisterSettings;
  customPresets: ModelPreset[];
  globalApiKey?: string;
  onUpdateHistory: (ministerId: string, newHistory: ChatMessage[]) => void;
  onUpdateSettings: (ministerId: string, newSettings: MinisterSettings) => void;
  onAddPreset: (preset: ModelPreset) => void;
  onRemovePreset: (presetId: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  minister, 
  history, 
  settings,
  customPresets,
  globalApiKey,
  onUpdateHistory,
  onUpdateSettings,
  onAddPreset,
  onRemovePreset
}) => {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Image handling state
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local state for settings inputs
  const [customProvider, setCustomProvider] = useState<'google' | 'openai'>(settings.provider);
  const [customModelInput, setCustomModelInput] = useState(settings.model);
  const [customBaseUrl, setCustomBaseUrl] = useState(settings.baseUrl || '');
  const [customApiKey, setCustomApiKey] = useState(settings.apiKey || '');
  
  const [presetName, setPresetName] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Update local state when settings prop changes or modal opens
  useEffect(() => {
    if (showSettings) {
        setCustomProvider(settings.provider);
        setCustomModelInput(settings.model);
        setCustomBaseUrl(settings.baseUrl || '');
        setCustomApiKey(settings.apiKey || '');
        setPresetName(''); // Reset preset name on open
    }
  }, [settings, showSettings]);

  useEffect(() => {
    if (scrollRef.current) {
        const { scrollHeight, clientHeight } = scrollRef.current;
        scrollRef.current.scrollTo({ top: scrollHeight - clientHeight, behavior: 'smooth' });
    }
  }, [history, isStreaming, pendingImages]); // Also scroll when images are added

  useEffect(() => {
    if (!isStreaming && !showSettings) {
        inputRef.current?.focus();
    }
  }, [minister.id, isStreaming, showSettings]);

  // --- IMAGE HANDLING FUNCTIONS ---
  
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages: string[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        if (file.type.startsWith('image/')) {
           try {
             const base64 = await convertFileToBase64(file);
             newImages.push(base64);
           } catch (err) {
             console.error("Error converting file", err);
           }
        }
      }
      setPendingImages(prev => [...prev, ...newImages]);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const newImages: string[] = [];
    let hasImage = false;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        hasImage = true;
        const file = items[i].getAsFile();
        if (file) {
          try {
            const base64 = await convertFileToBase64(file);
            newImages.push(base64);
          } catch (err) {
            console.error("Error processing pasted image", err);
          }
        }
      }
    }

    if (hasImage && newImages.length > 0) {
      e.preventDefault(); // Prevent default paste if it's an image
      setPendingImages(prev => [...prev, ...newImages]);
    }
  };

  const removePendingImage = (index: number) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleTriggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // --- SEND LOGIC ---

  const handleSend = async () => {
    if ((!input.trim() && pendingImages.length === 0) || isStreaming) return;

    const userText = input.trim();
    const imagesToSend = [...pendingImages];
    
    setInput('');
    setPendingImages([]); // Clear pending images immediately
    setIsStreaming(true);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: Date.now(),
      images: imagesToSend.length > 0 ? imagesToSend : undefined
    };

    const historyWithUser = [...history, userMsg];
    onUpdateHistory(minister.id, historyWithUser);

    const aiMsgId = (Date.now() + 1).toString();
    const initialAiMsg: ChatMessage = {
      id: aiMsgId,
      role: 'model',
      text: '',
      timestamp: Date.now()
    };
    
    // Add placeholder AI message
    onUpdateHistory(minister.id, [...historyWithUser, initialAiMsg]);

    // Track accumulated text and sources outside try/catch to preserve them on error
    let fullText = '';
    let accumulatedSources: Source[] = [];

    // Merge Global API Key if specific one is missing
    const effectiveSettings: MinisterSettings = {
        ...settings,
        apiKey: settings.apiKey ? settings.apiKey : globalApiKey
    };

    try {
      const stream = await sendMessageToMinister(
        minister.id,
        userText,
        minister.systemInstruction,
        history, 
        effectiveSettings,
        imagesToSend // Pass images to service
      );

      let hasReceivedText = false;
      
      for await (const chunk of stream) {
        if (chunk.text) {
            hasReceivedText = true;
            fullText += chunk.text;
        }
        
        if (chunk.sources) {
            const newSources = chunk.sources.filter(s => !accumulatedSources.some(existing => existing.uri === s.uri));
            accumulatedSources = [...accumulatedSources, ...newSources];
        }

        onUpdateHistory(minister.id, [
            ...historyWithUser,
            { ...initialAiMsg, text: fullText, sources: accumulatedSources }
        ]);
      }

      if (!hasReceivedText && accumulatedSources.length === 0) {
          throw new Error("Minister remained silent (Empty response).");
      }

    } catch (error: any) {
      console.error("Communication breakdown:", error);
      
      const errorSuffix = error.message?.includes("Imperial Seal missing") 
        ? `\n\n[System Warning: The Minister cannot speak: ${error.message}]`
        : `\n\n[System Warning: Communication interrupted: ${error.message}]`;

      onUpdateHistory(minister.id, [
        ...historyWithUser,
        { 
            ...initialAiMsg, 
            text: fullText + errorSuffix,
            sources: accumulatedSources 
        }
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleSettings = () => setShowSettings(!showSettings);

  const applySettings = () => {
    onUpdateSettings(minister.id, {
        ...settings,
        provider: customProvider,
        model: customModelInput,
        baseUrl: customBaseUrl.trim() || undefined,
        apiKey: customApiKey.trim() || undefined
    });
    setShowSettings(false);
  };

  const handleSearchToggle = () => {
    onUpdateSettings(minister.id, { ...settings, enableSearch: !settings.enableSearch });
  };

  const loadPreset = (preset: ModelPreset | any) => {
      setCustomProvider(preset.provider);
      setCustomModelInput(preset.model || preset.id);
      setCustomBaseUrl(preset.baseUrl || '');
      setCustomApiKey(preset.apiKey || '');
      setPresetName(''); 
  };

  const handleSavePreset = () => {
    if (!customModelInput) {
        alert("Please enter a Model ID first.");
        return;
    }
    if (!presetName.trim()) {
        alert("Please enter a name for this preset.");
        return;
    }
    
    onAddPreset({
        id: Date.now().toString(),
        name: presetName.trim(),
        provider: customProvider,
        model: customModelInput,
        baseUrl: customBaseUrl,
        apiKey: customApiKey
    });
    
    setPresetName(''); 
  };

  return (
    <div className="flex flex-col h-full bg-rice-paper text-stone-800 relative">
      
      {/* Settings Overlay */}
      {showSettings && (
        <div className="absolute inset-0 z-40 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-[#f5f2eb] border-4 border-[#855a28] rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col relative">
              {/* ... existing settings header ... */}
              <div className="bg-[#855a28] text-amber-100 p-3 flex justify-between items-center border-b border-[#5c3d1a] flex-shrink-0">
                  <div className="flex items-center gap-2">
                      <Scroll className="w-5 h-5" />
                      <h3 className="font-calligraphy text-xl tracking-widest">密旨 (Secret Edict)</h3>
                  </div>
                  <button type="button" onClick={toggleSettings} className="hover:bg-[#5c3d1a] rounded-full p-1 transition-colors">
                      <X className="w-5 h-5" />
                  </button>
              </div>

              <div className="p-6 space-y-6 font-serif overflow-y-auto royal-scroll">
                  {/* ... existing protocol/preset/library inputs ... */}
                  
                  {/* Protocol Selection */}
                  <div className="space-y-3">
                      <label className="flex items-center gap-2 text-stone-800 font-bold border-b border-stone-300 pb-1">
                          <Server className="w-4 h-4 text-amber-700" />
                          <span>Communication Protocol</span>
                      </label>
                      <div className="flex bg-stone-200 p-1 rounded text-sm">
                          <button 
                             type="button"
                             onClick={() => setCustomProvider('google')}
                             className={`flex-1 py-1.5 rounded transition-all ${customProvider === 'google' ? 'bg-white text-stone-900 shadow-sm font-bold' : 'text-stone-500 hover:text-stone-700'}`}
                          >
                              Google GenAI
                          </button>
                          <button 
                             type="button"
                             onClick={() => setCustomProvider('openai')}
                             className={`flex-1 py-1.5 rounded transition-all ${customProvider === 'openai' ? 'bg-white text-stone-900 shadow-sm font-bold' : 'text-stone-500 hover:text-stone-700'}`}
                          >
                              Universal (OpenAI)
                          </button>
                      </div>
                  </div>

                  {/* Quick Presets */}
                  <div className="space-y-2">
                      <p className="text-xs text-stone-500 uppercase tracking-wider flex justify-between">
                        <span>Quick Summons (Presets)</span>
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                         {customProvider === 'google' ? (
                            <>
                                <button type="button" onClick={() => loadPreset(AI_PRESETS.GEMINI_FLASH)} className="p-2 text-xs border border-stone-300 rounded bg-white hover:bg-amber-50 text-left transition-colors">
                                    <div className="font-bold text-stone-700">Gemini Flash</div>
                                    <div className="text-[10px] text-stone-400">Fast & Agile</div>
                                </button>
                                <button type="button" onClick={() => loadPreset(AI_PRESETS.GEMINI_PRO)} className="p-2 text-xs border border-stone-300 rounded bg-white hover:bg-amber-50 text-left transition-colors">
                                    <div className="font-bold text-stone-700">Gemini Pro</div>
                                    <div className="text-[10px] text-stone-400">Deep & Wise</div>
                                </button>
                            </>
                         ) : (
                            <>
                                <button type="button" onClick={() => loadPreset(AI_PRESETS.DEEPSEEK_V3)} className="p-2 text-xs border border-stone-300 rounded bg-white hover:bg-amber-50 text-left transition-colors">
                                    <div className="font-bold text-blue-800">DeepSeek V3</div>
                                    <div className="text-[10px] text-stone-400">Smart & Cheap</div>
                                </button>
                                <button type="button" onClick={() => loadPreset(AI_PRESETS.DEEPSEEK_R1)} className="p-2 text-xs border border-stone-300 rounded bg-white hover:bg-amber-50 text-left transition-colors">
                                    <div className="font-bold text-blue-800">DeepSeek R1</div>
                                    <div className="text-[10px] text-stone-400">Reasoning Model</div>
                                </button>
                                <button type="button" onClick={() => loadPreset(AI_PRESETS.GPT_4O)} className="p-2 text-xs border border-stone-300 rounded bg-white hover:bg-amber-50 text-left transition-colors">
                                    <div className="font-bold text-green-800">GPT-4o</div>
                                    <div className="text-[10px] text-stone-400">OpenAI Flagship</div>
                                </button>
                            </>
                         )}
                      </div>
                  </div>

                   {/* Custom Library */}
                   <div className="space-y-2">
                      <div className="flex items-center gap-2 pt-2 mt-2 border-t border-stone-200">
                          <BookMarked className="w-3 h-3 text-amber-700" />
                          <p className="text-xs text-stone-500 uppercase tracking-wider">Imperial Library (My Models)</p>
                      </div>
                      
                      {customPresets.length === 0 ? (
                         <div className="p-3 text-xs text-stone-400 bg-stone-100 rounded border border-dashed border-stone-300 text-center italic">
                            The library is empty. Configure a model below and click "Add to Library".
                         </div>
                      ) : (
                          <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto royal-scroll pr-1">
                              {customPresets.map(preset => (
                                  <div key={preset.id} className="flex items-center p-2 text-xs border border-stone-300 rounded bg-amber-50/50 hover:bg-amber-100 group cursor-pointer transition-colors" onClick={() => loadPreset(preset)}>
                                      <div className="flex-1 text-left">
                                          <div className="font-bold text-amber-900">{preset.name}</div>
                                          <div className="text-[10px] text-stone-500 truncate">
                                            {preset.provider === 'google' ? 'Google' : 'OpenAI'} · {preset.model}
                                          </div>
                                      </div>
                                      <button 
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); onRemovePreset(preset.id); }}
                                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Burn Scroll (Delete)"
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>

                  <hr className="border-stone-300" />

                  {/* Editor */}
                  <div className="space-y-4">
                      <div className="flex items-center justify-center gap-2 text-stone-800 font-bold uppercase text-xs tracking-widest opacity-70">
                          <Settings className="w-3 h-3" />
                          <span>Configuration Editor</span>
                          <span className="flex-1 border-b border-stone-300 ml-2"></span>
                      </div>
                      
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs text-stone-500 font-bold font-sans flex items-center gap-1">
                            <Tag className="w-3 h-3" /> NAME
                        </span>
                        <input 
                            type="text" 
                            value={presetName}
                            onChange={(e) => setPresetName(e.target.value)}
                            className="w-full pl-3 pt-6 pb-2 bg-amber-50/50 border border-stone-300 rounded text-sm font-bold text-amber-900 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 focus:outline-none shadow-sm transition-all placeholder-stone-300"
                            placeholder="Name your preset (e.g. My GPT-4)"
                        />
                      </div>

                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs text-stone-500 font-bold font-sans">MODEL ID</span>
                        <input 
                            type="text" 
                            value={customModelInput}
                            onChange={(e) => setCustomModelInput(e.target.value)}
                            className="w-full pl-3 pt-6 pb-2 bg-white border border-stone-300 rounded text-sm font-mono text-stone-800 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 focus:outline-none shadow-sm transition-all"
                            placeholder={customProvider === 'google' ? "e.g., gemini-2.5-flash" : "e.g., deepseek-chat"}
                        />
                        <div className="absolute right-2 top-2 text-[10px] text-stone-400 font-sans italic">
                           API Model String
                        </div>
                      </div>

                      <div className="space-y-3">
                          <div className="space-y-1">
                             <label className="text-xs text-stone-500 font-bold uppercase tracking-wider ml-1">API Endpoint (Base URL)</label>
                             <div className="flex items-center bg-white border border-stone-300 rounded p-1 focus-within:border-amber-600 focus-within:ring-1 focus-within:ring-amber-600 transition-all shadow-sm">
                                <Globe className="w-4 h-4 text-stone-400 ml-2 mr-2 flex-shrink-0" />
                                <input 
                                    type="text" 
                                    value={customBaseUrl}
                                    onChange={(e) => setCustomBaseUrl(e.target.value)}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-mono text-stone-700 placeholder-stone-300"
                                    placeholder={customProvider === 'google' ? "https://generativelanguage.googleapis.com" : "https://api.deepseek.com/v1"}
                                />
                             </div>
                          </div>

                          <div className="space-y-1">
                             <label className="text-xs text-stone-500 font-bold uppercase tracking-wider ml-1">API Key (Specific Override)</label>
                             <div className="flex items-center bg-white border border-stone-300 rounded p-1 focus-within:border-amber-600 focus-within:ring-1 focus-within:ring-amber-600 transition-all shadow-sm">
                                <Key className="w-4 h-4 text-stone-400 ml-2 mr-2 flex-shrink-0" />
                                <input 
                                    type="password" 
                                    value={customApiKey}
                                    onChange={(e) => setCustomApiKey(e.target.value)}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-mono text-stone-700 placeholder-stone-300"
                                    placeholder={globalApiKey ? "Using Global Key (Default)" : "Enter specific key..."}
                                />
                             </div>
                          </div>
                      </div>

                      <button 
                        type="button"
                        onClick={handleSavePreset}
                        disabled={!presetName || !customModelInput}
                        className="w-full py-2.5 bg-white hover:bg-amber-50 border-2 border-dashed border-amber-300 hover:border-amber-500 text-amber-800 rounded flex items-center justify-center gap-2 transition-all font-bold text-xs uppercase tracking-wider group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                         <PlusCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                         Add Current Config to Library
                      </button>
                  </div>

                  {customProvider === 'google' && (
                    <div className="bg-stone-100 p-3 rounded border border-stone-200">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 font-bold text-stone-800">
                                <Globe className="w-4 h-4 text-amber-700" />
                                <span>Imperial Archives (Google Search)</span>
                            </div>
                            <button 
                                type="button"
                                onClick={handleSearchToggle}
                                className={`w-10 h-5 rounded-full p-0.5 transition-colors relative ${settings.enableSearch ? 'bg-green-700' : 'bg-stone-400'}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform ${settings.enableSearch ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </button>
                        </div>
                        <p className="text-xs text-stone-500 leading-relaxed">
                            Enable groundling to access real-time information via Google Search.
                        </p>
                    </div>
                  )}

              </div>
              {/* Footer */}
              <div className="p-4 bg-[#e8e4da] border-t border-[#d6d1c4] flex justify-end gap-3 flex-shrink-0">
                  <button 
                    type="button"
                    onClick={toggleSettings}
                    className="px-4 py-2 text-stone-600 hover:text-stone-900 font-serif text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="button"
                    onClick={applySettings}
                    className="px-6 py-2 bg-red-800 hover:bg-red-700 text-white font-calligraphy tracking-widest rounded shadow-sm"
                  >
                    Apply Edict (钦此)
                  </button>
              </div>
           </div>
        </div>
      )}

      <div className="h-2 bg-[#2a1a11] w-full shadow-md z-10"></div>

      <div className="p-4 border-b border-stone-300 bg-[#fdfbf7] flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className={`
            w-12 h-12 flex items-center justify-center text-white shadow-inner rounded-sm
            ${minister.avatarColor} border-2 border-stone-800/20
          `}>
            {MINISTRY_ICONS[minister.id]}
          </div>
          <div>
            <h2 className="text-2xl font-calligraphy text-stone-900">{minister.chineseTitle}</h2>
            <div className="text-xs text-stone-500 uppercase tracking-widest font-serif flex items-center gap-2">
                <span className="w-2 h-px bg-stone-400"></span>
                {minister.name}
                <span className="w-2 h-px bg-stone-400"></span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
             <div className="hidden md:block border-2 border-red-800 rounded px-2 py-1 opacity-60 rotate-3 select-none">
                <span className="text-red-800 font-calligraphy text-xl">御覽</span>
             </div>
             <button 
               type="button"
               onClick={toggleSettings}
               className="p-2 text-stone-600 hover:text-amber-800 hover:bg-stone-200 rounded-full transition-colors"
               title="Minister Settings"
             >
                <Settings className="w-6 h-6" />
             </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 royal-scroll"
      >
        {history.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full opacity-40">
                <div className="text-6xl mb-4 text-stone-300 font-serif">?</div>
                <p className="font-serif text-stone-500">Summon the minister to the audience hall.</p>
            </div>
        )}

        {history.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[95%] md:max-w-[80%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              
              <div className={`
                w-10 h-10 rounded-sm flex items-center justify-center flex-shrink-0 mt-1 shadow-md
                ${msg.role === 'user' 
                    ? 'bg-amber-500 text-amber-900 border-2 border-amber-600' 
                    : 'bg-stone-200 text-stone-700 border-2 border-stone-300'}
              `}>
                {msg.role === 'user' ? <span className="font-bold font-serif text-lg">帝</span> : <span className="font-calligraphy text-lg">臣</span>}
              </div>

              <div className={`
                relative p-5 font-serif text-md leading-loose shadow-sm flex flex-col gap-3
                ${msg.role === 'user' 
                  ? 'bg-amber-100 text-amber-900 border border-amber-200 rounded-l-xl rounded-br-xl' 
                  : 'bg-white text-stone-800 border border-stone-200 rounded-r-xl rounded-bl-xl'}
              `}>
                 {msg.role === 'model' && (
                    <div className="absolute -top-1 -left-1 text-stone-200 opacity-50 pointer-events-none">✦</div>
                 )}
                 
                 {/* Render Images */}
                 {msg.images && msg.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {msg.images.map((img, idx) => (
                            <div key={idx} className="relative border-4 border-white shadow-sm rotate-1 max-w-full">
                                <img src={img} alt="Scroll Attachment" className="max-h-64 object-contain" />
                            </div>
                        ))}
                    </div>
                 )}

                 <div className="whitespace-pre-wrap">{msg.text}</div>
                 
                 {msg.sources && msg.sources.length > 0 && (
                   <div className="mt-2 pt-3 border-t border-dashed border-stone-300">
                     <h4 className="text-xs font-bold text-stone-500 mb-1 flex items-center gap-1">
                        <Scroll className="w-3 h-3" /> 
                        Imperial Citations (注疏):
                     </h4>
                     <div className="flex flex-wrap gap-2">
                       {msg.sources.map((source, idx) => (
                         <a 
                           key={idx} 
                           href={source.uri} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="inline-flex items-center gap-1 text-xs bg-stone-100 hover:bg-stone-200 text-amber-800 border border-stone-300 rounded px-2 py-1 transition-colors truncate max-w-[200px]"
                         >
                           <ExternalLink className="w-3 h-3 flex-shrink-0" />
                           <span className="truncate">{source.title}</span>
                         </a>
                       ))}
                     </div>
                   </div>
                 )}
              </div>
            </div>
          </div>
        ))}
        
        {isStreaming && (
            <div className="flex justify-start w-full pl-16 opacity-60">
                <div className="flex items-center gap-2 text-stone-500 font-serif italic text-sm">
                   <Feather className="w-4 h-4 animate-bounce" />
                   The Minister is consulting the archives...
                </div>
            </div>
        )}
      </div>

      {/* Input Area */}
      <div className="relative p-4 bg-[#e8e4da] border-t border-[#d6d1c4] shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto relative">
            {/* Top info bar */}
            <div className="absolute -top-8 left-4 flex gap-4">
                 <div className="text-xs text-stone-500 font-serif italic opacity-70 flex items-center gap-1">
                    Imperial Brush (Paste images to upload)
                 </div>
                 {settings.enableSearch && settings.provider === 'google' && (
                   <div className="text-xs text-green-700 font-serif font-bold flex items-center gap-1 opacity-80">
                      <Globe className="w-3 h-3" /> Searching Archives
                   </div>
                 )}
                 <div className="text-xs text-stone-400 font-serif flex items-center gap-1 opacity-60">
                     <Cpu className="w-3 h-3" /> {settings.model}
                 </div>
            </div>
            
            {/* Image Preview Area */}
            {pendingImages.length > 0 && (
                <div className="flex gap-3 mb-2 overflow-x-auto royal-scroll pb-1">
                    {pendingImages.map((img, idx) => (
                        <div key={idx} className="relative group flex-shrink-0">
                            <div className="w-16 h-16 border-2 border-stone-300 bg-white rounded overflow-hidden">
                                <img src={img} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                            <button 
                                onClick={() => removePendingImage(idx)}
                                className="absolute -top-2 -right-2 bg-red-800 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste} // Handle paste event
                placeholder="Speak, Your Majesty..."
                className="w-full bg-white text-stone-900 border-2 border-stone-300 rounded-md p-4 pr-24 focus:outline-none focus:border-amber-700 focus:ring-0 resize-none h-28 royal-scroll font-serif placeholder:italic placeholder:text-stone-400"
                disabled={isStreaming}
            />
            
            {/* Action Buttons */}
            <div className="absolute right-4 bottom-4 flex gap-2">
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    multiple 
                    onChange={handleFileSelect} 
                />
                <button 
                    type="button"
                    onClick={handleTriggerFileSelect}
                    disabled={isStreaming}
                    className="w-10 h-10 flex items-center justify-center rounded-sm text-stone-500 bg-stone-100 hover:bg-stone-200 border border-stone-300 transition-all"
                    title="Present Painting (Upload Image)"
                >
                    <ImageIcon className="w-5 h-5" />
                </button>

                <button 
                    type="button"
                    onClick={handleSend}
                    disabled={(!input.trim() && pendingImages.length === 0) || isStreaming}
                    className={`
                        w-10 h-10 flex items-center justify-center rounded-sm text-white transition-all duration-300 shadow-md
                        ${(!input.trim() && pendingImages.length === 0) || isStreaming 
                            ? 'bg-stone-400 cursor-not-allowed' 
                            : 'bg-red-800 hover:bg-red-700 hover:scale-105'}
                    `}
                >
                    {isStreaming ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <span className="font-calligraphy text-lg">宣</span>
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;