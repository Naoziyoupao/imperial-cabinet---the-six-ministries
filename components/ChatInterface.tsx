
import React, { useEffect, useRef, useState } from 'react';
import { Minister, ChatMessage, MinisterSettings, Source, ModelPreset, ThemeConfig, AppLanguage } from '../types';
import { sendMessageToMinister } from '../services/geminiService';
import { Feather, Settings, X, Globe, Scroll, ExternalLink, Cpu, Link, Key, Server, Save, Trash2, BookMarked, PlusCircle, Tag, Image as ImageIcon, FileText, RotateCcw } from 'lucide-react';
import { MINISTRY_ICONS, AI_PRESETS, UI_LABELS } from '../constants';

interface ChatInterfaceProps {
  minister: Minister;
  history: ChatMessage[];
  settings: MinisterSettings;
  customPresets: ModelPreset[];
  globalApiKey?: string;
  theme: ThemeConfig;
  language: AppLanguage;
  onUpdateHistory: (ministerId: string, newHistory: ChatMessage[]) => void;
  onUpdateSettings: (ministerId: string, newSettings: MinisterSettings) => void;
  onAddPreset: (preset: ModelPreset) => void;
  onRemovePreset: (presetId: string) => void;
  onMissingApiKey: () => void;
}

// Reusable hook for resizing logic (Edge-based)
const useResizable = (initialW: number, initialH: number) => {
    const [size, setSize] = useState({ w: initialW, h: initialH });

    const initResize = (direction: 'right' | 'bottom' | 'corner', e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startW = size.w;
        const startH = size.h;

        const cursorMap = {
            'right': 'ew-resize',
            'bottom': 'ns-resize',
            'corner': 'nwse-resize'
        };
        document.body.style.cursor = cursorMap[direction];

        const onMouseMove = (moveEvent: MouseEvent) => {
            // Since the modal is centered using Flexbox, increasing width by X spreads it X/2 left and X/2 right.
            // To keep the mouse on the edge, we multiply the delta by 2.
            const deltaX = (moveEvent.clientX - startX) * 2;
            const deltaY = (moveEvent.clientY - startY) * 2;

            let newW = startW;
            let newH = startH;

            if (direction === 'right' || direction === 'corner') {
                newW = Math.max(300, startW + deltaX);
            }
            if (direction === 'bottom' || direction === 'corner') {
                newH = Math.max(200, startH + deltaY);
            }

            setSize({ w: newW, h: newH });
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            document.body.style.cursor = 'default';
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    return { size, initResize };
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  minister, 
  history, 
  settings,
  customPresets,
  globalApiKey,
  theme,
  language,
  onUpdateHistory,
  onUpdateSettings,
  onAddPreset,
  onRemovePreset,
  onMissingApiKey
}) => {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const colors = theme.colors;
  const labels = UI_LABELS[language];
  
  // Resizable States
  const settingsModalSize = useResizable(480, 650);
  const promptModalSize = useResizable(600, 500);

  // Image handling state
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local state for settings inputs
  const [customProvider, setCustomProvider] = useState<'google' | 'openai'>(settings.provider);
  const [customModelInput, setCustomModelInput] = useState(settings.model);
  const [customBaseUrl, setCustomBaseUrl] = useState(settings.baseUrl || '');
  const [customApiKey, setCustomApiKey] = useState(settings.apiKey || '');
  
  // Local state for Prompt Editor
  const [promptInput, setPromptInput] = useState('');
  
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

  // Initialize prompt input when editor opens or minister changes
  useEffect(() => {
    if (showPromptEditor) {
        setPromptInput(settings.customInstruction || minister.systemInstruction);
    }
  }, [showPromptEditor, settings.customInstruction, minister.systemInstruction]);

  useEffect(() => {
    if (scrollRef.current) {
        const { scrollHeight, clientHeight } = scrollRef.current;
        scrollRef.current.scrollTo({ top: scrollHeight - clientHeight, behavior: 'smooth' });
    }
  }, [history, isStreaming, pendingImages]); // Also scroll when images are added

  useEffect(() => {
    if (!isStreaming && !showSettings && !showPromptEditor) {
        inputRef.current?.focus();
    }
  }, [minister.id, isStreaming, showSettings, showPromptEditor]);

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

    // Use Custom Instruction if available, otherwise Default
    const effectiveInstruction = settings.customInstruction || minister.systemInstruction;

    try {
      const stream = await sendMessageToMinister(
        minister.id,
        userText,
        effectiveInstruction,
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
      
      const isMissingGlobalKey = error.message?.includes("Imperial Seal missing");
      const isMissingCustomKey = error.message?.includes("Custom Mandate missing");
      
      if (isMissingGlobalKey) {
        onMissingApiKey();
      } else if (isMissingCustomKey) {
        // If custom key is missing, open settings panel directly
        setShowSettings(true);
      }

      const errorSuffix = (isMissingGlobalKey || isMissingCustomKey)
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
  const togglePromptEditor = () => setShowPromptEditor(!showPromptEditor);

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

  const savePrompt = () => {
      // If input matches default, save as undefined to revert to default behavior (cleaner data)
      const isDefault = promptInput.trim() === minister.systemInstruction.trim();
      onUpdateSettings(minister.id, {
          ...settings,
          customInstruction: isDefault ? undefined : promptInput
      });
      setShowPromptEditor(false);
  };

  const revertPrompt = () => {
      setPromptInput(minister.systemInstruction);
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
    <div className={`flex flex-col h-full ${colors.mainBg} ${colors.mainText} relative`}>
      
      {/* Prompt Editor Overlay */}
      {showPromptEditor && (
        <div className="absolute inset-0 z-40 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div 
                className="bg-[#f5f2eb] border-4 border-[#855a28] rounded-lg shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200 max-w-[95vw] max-h-[95vh]"
                style={{ width: promptModalSize.size.w, height: promptModalSize.size.h }}
            >
                <div className="bg-[#855a28] text-amber-100 p-3 flex justify-between items-center border-b border-[#5c3d1a] flex-shrink-0">
                  <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      <h3 className="font-calligraphy text-xl tracking-widest">{labels.roleSettingsTitle}</h3>
                  </div>
                  <button type="button" onClick={togglePromptEditor} className="hover:bg-[#5c3d1a] rounded-full p-1 transition-colors">
                      <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-4 flex-1 flex flex-col overflow-hidden">
                    <p className="text-sm text-stone-600 font-serif mb-2 italic">
                        {labels.roleSettingsDesc} 
                        <span className="text-amber-700 ml-1 font-bold">(System Instruction)</span>
                    </p>
                    <textarea
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        className="flex-1 w-full p-4 bg-white border border-stone-300 rounded font-mono text-sm text-stone-800 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 focus:outline-none shadow-inner royal-scroll resize-none leading-relaxed"
                        placeholder="Enter the system prompt for this character..."
                    />
                </div>

                <div className="p-4 bg-[#e8e4da] border-t border-[#d6d1c4] flex justify-between gap-3 flex-shrink-0">
                  <button 
                    type="button"
                    onClick={revertPrompt}
                    className="flex items-center gap-2 px-4 py-2 text-stone-600 hover:text-amber-800 hover:bg-amber-100 rounded transition-colors font-serif text-sm border border-transparent hover:border-amber-200"
                    title="Revert to original default prompt"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{labels.resetDefault}</span>
                  </button>
                  <div className="flex gap-3">
                      <button 
                        type="button"
                        onClick={togglePromptEditor}
                        className="px-4 py-2 text-stone-600 hover:text-stone-900 font-serif text-sm"
                      >
                        {labels.cancel}
                      </button>
                      <button 
                        type="button"
                        onClick={savePrompt}
                        className="px-6 py-2 bg-amber-800 hover:bg-amber-700 text-white font-calligraphy tracking-widest rounded shadow-sm flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>{labels.savePersona}</span>
                      </button>
                  </div>
                </div>
                
                {/* Edge Resizers */}
                <div 
                    className="absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-amber-500/30 transition-colors z-20"
                    onMouseDown={(e) => promptModalSize.initResize('right', e)}
                />
                <div 
                    className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize hover:bg-amber-500/30 transition-colors z-20"
                    onMouseDown={(e) => promptModalSize.initResize('bottom', e)}
                />
                <div 
                    className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize hover:bg-amber-500/50 transition-colors z-30 rounded-tl"
                    onMouseDown={(e) => promptModalSize.initResize('corner', e)}
                />
            </div>
        </div>
      )}

      {/* Settings Overlay */}
      {showSettings && (
        <div className="absolute inset-0 z-40 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4">
           <div 
                className="bg-[#f5f2eb] border-4 border-[#855a28] rounded-lg shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200 max-w-[95vw] max-h-[95vh]"
                style={{ width: settingsModalSize.size.w, height: settingsModalSize.size.h }}
           >
              {/* ... existing settings header ... */}
              <div className="bg-[#855a28] text-amber-100 p-3 flex justify-between items-center border-b border-[#5c3d1a] flex-shrink-0">
                  <div className="flex items-center gap-2">
                      <Scroll className="w-5 h-5" />
                      <h3 className="font-calligraphy text-xl tracking-widest">{labels.secretEdict}</h3>
                  </div>
                  <button type="button" onClick={toggleSettings} className="hover:bg-[#5c3d1a] rounded-full p-1 transition-colors">
                      <X className="w-5 h-5" />
                  </button>
              </div>

              <div className="p-6 space-y-6 font-serif overflow-y-auto royal-scroll text-stone-800 flex-1">
                  {/* ... existing protocol/preset/library inputs ... */}
                  
                  {/* Protocol Selection */}
                  <div className="space-y-3">
                      <label className="flex items-center gap-2 text-stone-800 font-bold border-b border-stone-300 pb-1">
                          <Server className="w-4 h-4 text-amber-700" />
                          <span>{labels.protocol}</span>
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
                        <span>{labels.quickSummons}</span>
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
                          <p className="text-xs text-stone-500 uppercase tracking-wider">{labels.library}</p>
                      </div>
                      
                      {customPresets.length === 0 ? (
                         <div className="p-3 text-xs text-stone-400 bg-stone-100 rounded border border-dashed border-stone-300 text-center italic">
                            {labels.libraryEmpty}
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
                          <span>{labels.configEditor}</span>
                          <span className="flex-1 border-b border-stone-300 ml-2"></span>
                      </div>
                      
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs text-stone-500 font-bold font-sans flex items-center gap-1">
                            <Tag className="w-3 h-3" /> {labels.nameLabel}
                        </span>
                        <input 
                            type="text" 
                            value={presetName}
                            onChange={(e) => setPresetName(e.target.value)}
                            className="w-full pl-3 pt-6 pb-2 bg-amber-50/50 border border-stone-300 rounded text-sm font-bold text-amber-900 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 focus:outline-none shadow-sm transition-all placeholder-stone-300"
                            placeholder={labels.namePlaceholder}
                        />
                      </div>

                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs text-stone-500 font-bold font-sans">{labels.modelIdLabel}</span>
                        <input 
                            type="text" 
                            value={customModelInput}
                            onChange={(e) => setCustomModelInput(e.target.value)}
                            className="w-full pl-3 pt-6 pb-2 bg-white border border-stone-300 rounded text-sm font-mono text-stone-800 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 focus:outline-none shadow-sm transition-all"
                            placeholder={labels.modelIdPlaceholder}
                        />
                        <div className="absolute right-2 top-2 text-[10px] text-stone-400 font-sans italic">
                           {labels.apiString}
                        </div>
                      </div>

                      <div className="space-y-3">
                          <div className="space-y-1">
                             <label className="text-xs text-stone-500 font-bold uppercase tracking-wider ml-1">{labels.endpointLabel}</label>
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
                             <label className="text-xs text-stone-500 font-bold uppercase tracking-wider ml-1">{labels.keyLabel}</label>
                             <div className="flex items-center bg-white border border-stone-300 rounded p-1 focus-within:border-amber-600 focus-within:ring-1 focus-within:ring-amber-600 transition-all shadow-sm">
                                <Key className="w-4 h-4 text-stone-400 ml-2 mr-2 flex-shrink-0" />
                                <input 
                                    type="password" 
                                    value={customApiKey}
                                    onChange={(e) => setCustomApiKey(e.target.value)}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-mono text-stone-700 placeholder-stone-300"
                                    placeholder={globalApiKey ? `Using Global Key (Default)` : labels.keyPlaceholder}
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
                         {labels.addToLib}
                      </button>
                  </div>

                  {customProvider === 'google' && (
                    <div className="bg-stone-100 p-3 rounded border border-stone-200">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 font-bold text-stone-800">
                                <Globe className="w-4 h-4 text-amber-700" />
                                <span>{labels.searchTitle}</span>
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
                            {labels.searchDesc}
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
                    {labels.cancel}
                  </button>
                  <button 
                    type="button"
                    onClick={applySettings}
                    className="px-6 py-2 bg-red-800 hover:bg-red-700 text-white font-calligraphy tracking-widest rounded shadow-sm"
                  >
                    {labels.apply}
                  </button>
              </div>
              
              {/* Edge Resizers */}
              <div 
                  className="absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-amber-500/30 transition-colors z-20"
                  onMouseDown={(e) => settingsModalSize.initResize('right', e)}
              />
              <div 
                  className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize hover:bg-amber-500/30 transition-colors z-20"
                  onMouseDown={(e) => settingsModalSize.initResize('bottom', e)}
              />
              <div 
                  className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize hover:bg-amber-500/50 transition-colors z-30 rounded-tl"
                  onMouseDown={(e) => settingsModalSize.initResize('corner', e)}
              />
           </div>
        </div>
      )}

      <div className="h-2 bg-[#2a1a11] w-full shadow-md z-10"></div>

      {/* Header */}
      <div className={`p-4 border-b flex items-center justify-between shadow-sm sticky top-0 z-10 transition-colors duration-500 ${colors.headerBg} ${colors.headerText} ${colors.cardBorder}`}>
        <div className="flex items-center gap-4 min-w-0">
          <div className={`
            w-12 h-12 flex-shrink-0 flex items-center justify-center text-white shadow-inner rounded-sm
            ${minister.avatarColor} border-2 border-black/10
          `}>
            {MINISTRY_ICONS[minister.ministryId]}
          </div>
          <div className="min-w-0">
            <h2 className="text-2xl font-calligraphy truncate">{minister.chineseTitle}</h2>
            <div className="text-xs uppercase tracking-widest font-serif flex items-center gap-2 opacity-60">
                <span className="w-2 h-px bg-current"></span>
                {/* Only show Name in English mode */}
                <span className="truncate">{language === 'en' ? minister.name : minister.rank}</span>
                <span className="w-2 h-px bg-current"></span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
             <div className="hidden md:block border-2 border-red-800 rounded px-2 py-1 opacity-60 rotate-3 select-none mr-2">
                <span className="text-red-800 font-calligraphy text-xl">御覽</span>
             </div>
             
             {/* Role Setting Button */}
             <button
                type="button"
                onClick={togglePromptEditor}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-current bg-black/5 hover:bg-amber-100 hover:text-amber-900 transition-all opacity-70 hover:opacity-100 text-xs uppercase font-bold tracking-wider"
                title={labels.roleSettingsTitle}
             >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">{labels.roleSettings}</span>
             </button>

             <button 
               type="button"
               onClick={toggleSettings}
               className={`p-2 rounded-full transition-colors hover:bg-black/5 opacity-60 hover:opacity-100`}
               title={labels.ministerSettings}
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
                <div className="text-6xl mb-4 font-serif">?</div>
                <p className="font-serif">{language === 'zh' ? "请陛下宣召六部官员..." : "Summon the minister to the audience hall."}</p>
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
                    ? `${colors.buttonPrimary}` 
                    : `bg-stone-200 text-stone-700 border-2 border-stone-300`}
              `}>
                {msg.role === 'user' ? <span className="font-bold font-serif text-lg">帝</span> : <span className="font-calligraphy text-lg">臣</span>}
              </div>

              <div className={`
                relative p-5 font-serif text-md leading-loose shadow-sm flex flex-col gap-3
                ${msg.role === 'user' 
                  ? `${colors.userBubble} rounded-l-xl rounded-br-xl` 
                  : `${colors.aiBubble} rounded-r-xl rounded-bl-xl`}
                border
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
                   <div className="mt-2 pt-3 border-t border-dashed border-black/10">
                     <h4 className="text-xs font-bold opacity-60 mb-1 flex items-center gap-1">
                        <Scroll className="w-3 h-3" /> 
                        {labels.citations}
                     </h4>
                     <div className="flex flex-wrap gap-2">
                       {msg.sources.map((source, idx) => (
                         <a 
                           key={idx} 
                           href={source.uri} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="inline-flex items-center gap-1 text-xs bg-black/5 hover:bg-black/10 border border-black/10 rounded px-2 py-1 transition-colors truncate max-w-[200px]"
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
                <div className="flex items-center gap-2 font-serif italic text-sm">
                   <Feather className="w-4 h-4 animate-bounce" />
                   {labels.consulting}
                </div>
            </div>
        )}
      </div>

      {/* Input Area */}
      <div className={`relative p-4 border-t shadow-[0_-4px_10px_rgba(0,0,0,0.05)] transition-colors duration-500 ${colors.headerBg} ${colors.cardBorder}`}>
        <div className="max-w-4xl mx-auto relative">
            {/* Top info bar */}
            <div className="absolute -top-8 left-4 flex gap-4">
                 <div className={`text-xs font-serif italic opacity-70 flex items-center gap-1 ${colors.headerText}`}>
                    {labels.brushHint}
                 </div>
                 {settings.enableSearch && settings.provider === 'google' && (
                   <div className="text-xs text-green-700 font-serif font-bold flex items-center gap-1 opacity-80">
                      <Globe className="w-3 h-3" /> {labels.searching}
                   </div>
                 )}
                 <div className={`text-xs font-serif flex items-center gap-1 opacity-60 ${colors.headerText}`}>
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
                onPaste={handlePaste}
                placeholder={labels.inputPlaceholder}
                className={`w-full border-2 rounded-md p-4 pr-24 focus:outline-none focus:ring-0 resize-none h-28 royal-scroll font-serif placeholder:italic 
                   bg-white ${colors.mainText} ${colors.cardBorder} focus:border-amber-600
                `}
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
                    title={labels.uploadButton}
                >
                    <ImageIcon className="w-5 h-5" />
                </button>

                <button 
                    type="button"
                    onClick={handleSend}
                    disabled={(!input.trim() && pendingImages.length === 0) || isStreaming}
                    className={`
                        w-10 h-10 flex items-center justify-center rounded-sm transition-all duration-300 shadow-md
                        ${(!input.trim() && pendingImages.length === 0) || isStreaming 
                            ? 'bg-stone-400 text-white cursor-not-allowed' 
                            : `${colors.buttonPrimary} hover:scale-105`}
                    `}
                >
                    {isStreaming ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <span className="font-calligraphy text-lg">{labels.sendButton}</span>
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
