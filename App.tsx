
import React, { useState, useEffect } from 'react';
import { MINISTERS, THEMES, UI_LABELS } from './constants';
import { Minister, ChatMessage, MinisterSettings, ModelPreset, AppearanceSettings, AppLanguage } from './types';
import MinisterCard from './components/MinisterCard';
import ChatInterface from './components/ChatInterface';
import { getSystemApiKey } from './services/geminiService';
import { Info, Key, Save, CheckCircle2, AlertTriangle, Palette, Type, X, ChevronLeft, Languages } from 'lucide-react';

// Custom Hook for Resizable Logic (Edge-based)
const useResizable = (initialW: number, initialH: number) => {
    const [size, setSize] = useState({ w: initialW, h: initialH });

    const initResize = (direction: 'right' | 'bottom' | 'corner', e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startW = size.w;
        const startH = size.h;

        // Set cursor globally during drag to prevent flickering
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

// Custom Component for the Imperial Jade Seal (传国玉玺)
const ImperialSealIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    {/* The Seal Body (Square) */}
    <rect x="15" y="35" width="70" height="55" rx="4" className="text-current opacity-90" fill="currentColor" />
    
    {/* The Dragon Handle (Stylized) */}
    <path d="M30 35 C 30 15, 70 15, 70 35" stroke="currentColor" strokeWidth="8" fill="none" className="text-current opacity-80" />
    <circle cx="50" cy="25" r="6" className="text-amber-500" fill="currentColor" />
    
    {/* The Characters inside (Abstract strokes mimicking 'Emperor') */}
    <path d="M35 55 L 65 55 M 50 45 L 50 75 M 35 75 L 65 75 M 30 45 L 70 45" stroke="white" strokeWidth="3" opacity="0.8" />
  </svg>
);

const ApiKeyModal = ({ 
  isOpen, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSave: (key: string) => void 
}) => {
  const [tempKey, setTempKey] = useState('');
  const { size, initResize } = useResizable(480, 350);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4">
        <div 
            className="bg-stone-900/95 border-4 border-amber-800 rounded-lg shadow-2xl animate-in zoom-in-95 duration-200 relative flex flex-col max-w-[95vw] max-h-[95vh]"
            style={{ width: size.w, height: size.h }}
        >
            <div className="bg-amber-800 text-amber-100 p-3 flex justify-between items-center border-b border-amber-900 flex-shrink-0">
                 <div className="flex items-center gap-2">
                     <AlertTriangle className="w-5 h-5" />
                     <h3 className="font-calligraphy text-xl tracking-widest">圣旨 (Imperial Decree)</h3>
                 </div>
                 <button onClick={onClose} className="hover:bg-amber-900 rounded-full p-1">
                     <X className="w-5 h-5" />
                 </button>
            </div>
            
            <div className="p-6 text-center flex-1 overflow-y-auto royal-scroll">
                <p className="text-stone-300 text-sm mb-6 font-serif leading-relaxed">
                   The Imperial Treasury (Environment Variables) is empty. <br/>
                   You must supply your own <strong>Jade Seal (Google Gemini API Key)</strong> to summon the ministers.
                </p>
                
                <div className="space-y-4">
                    <div className="relative text-left">
                        <Key className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
                        <input 
                            type="password" 
                            placeholder="Enter Google Gemini API Key (AIza...)"
                            value={tempKey}
                            onChange={(e) => setTempKey(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-black/50 border border-stone-600 rounded text-amber-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none font-mono text-sm placeholder-stone-600"
                        />
                    </div>
                    <button 
                        onClick={() => onSave(tempKey)}
                        disabled={!tempKey}
                        className="w-full px-6 py-2 bg-amber-800 hover:bg-amber-700 text-white font-bold rounded shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all font-serif uppercase tracking-wider"
                    >
                        <Save className="w-4 h-4" />
                        Accept
                    </button>
                    <div className="pt-2">
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-stone-500 hover:text-amber-500 underline transition-colors">
                            Get a key from Google AI Studio
                        </a>
                    </div>
                </div>
            </div>

            {/* Edge Resizers */}
            <div 
                className="absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-amber-500/30 transition-colors z-20"
                onMouseDown={(e) => initResize('right', e)}
            />
            <div 
                className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize hover:bg-amber-500/30 transition-colors z-20"
                onMouseDown={(e) => initResize('bottom', e)}
            />
            <div 
                className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize hover:bg-amber-500/50 transition-colors z-30 rounded-tl"
                onMouseDown={(e) => initResize('corner', e)}
            />
        </div>
    </div>
  );
};

const AppearanceModal = ({ 
  isOpen, 
  onClose, 
  settings, 
  onUpdate 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  settings: AppearanceSettings, 
  onUpdate: (s: AppearanceSettings) => void 
}) => {
  const { size, initResize } = useResizable(400, 500);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-[#fdfbf7] border-4 border-amber-800 rounded-lg shadow-2xl animate-in zoom-in-95 duration-200 relative flex flex-col max-w-[95vw] max-h-[95vh]"
        style={{ width: size.w, height: size.h }}
      >
        <div className="bg-amber-800 text-amber-100 p-3 flex justify-between items-center border-b border-amber-900 flex-shrink-0">
             <div className="flex items-center gap-2">
                 <Palette className="w-5 h-5" />
                 <h3 className="font-calligraphy text-xl tracking-widest">内务府 (Internal Affairs)</h3>
             </div>
             <button onClick={onClose} className="hover:bg-amber-900 rounded-full p-1">
                 <X className="w-5 h-5" />
             </button>
        </div>
        <div className="p-6 space-y-6 font-serif text-stone-800 flex-1 overflow-y-auto royal-scroll">
            {/* Theme Selection */}
            <div className="space-y-3">
                <label className="flex items-center gap-2 font-bold text-stone-600 uppercase text-xs tracking-wider">
                   <Palette className="w-4 h-4" /> Palace Theme
                </label>
                <div className="grid grid-cols-1 gap-2">
                   <button 
                      onClick={() => onUpdate({ ...settings, themeId: 'classic' })}
                      className={`flex items-center gap-3 p-3 rounded border-2 transition-all text-left
                        ${settings.themeId === 'classic' ? 'border-amber-600 bg-amber-50' : 'border-stone-200 hover:border-stone-400'}
                      `}
                   >
                      <div className="w-8 h-8 rounded bg-stone-900 border border-stone-600 shadow-sm"></div>
                      <div>
                         <div className="font-bold">清雅书斋 (Classic)</div>
                         <div className="text-xs text-stone-500">Ink, Wood & Rice Paper</div>
                      </div>
                   </button>
                   <button 
                      onClick={() => onUpdate({ ...settings, themeId: 'imperial' })}
                      className={`flex items-center gap-3 p-3 rounded border-2 transition-all text-left
                        ${settings.themeId === 'imperial' ? 'border-amber-600 bg-amber-50' : 'border-stone-200 hover:border-stone-400'}
                      `}
                   >
                      <div className="w-8 h-8 rounded bg-gradient-to-r from-[#3a0000] via-[#660000] to-[#3a0000] border border-[#d4af37] shadow-sm"></div>
                      <div>
                         <div className="font-bold">皇极殿 (Imperial Gold)</div>
                         <div className="text-xs text-stone-500">Red Lacquer Pillar & Gold</div>
                      </div>
                   </button>
                </div>
            </div>

            <hr className="border-stone-200" />

            <div className="grid grid-cols-2 gap-4">
                {/* Language Selection */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 font-bold text-stone-600 uppercase text-xs tracking-wider">
                       <Languages className="w-4 h-4" /> Language
                    </label>
                    <div className="flex flex-col gap-2">
                        <button 
                            onClick={() => onUpdate({ ...settings, language: 'en' })}
                            className={`flex-1 py-2 rounded border transition-all text-sm ${settings.language === 'en' ? 'bg-amber-100 border-amber-500 text-amber-900 font-bold' : 'bg-stone-100 border-stone-200 text-stone-500'}`}
                        >
                            English (Mixed)
                        </button>
                        <button 
                            onClick={() => onUpdate({ ...settings, language: 'zh' })}
                            className={`flex-1 py-2 rounded border transition-all text-sm font-calligraphy ${settings.language === 'zh' ? 'bg-amber-100 border-amber-500 text-amber-900 font-bold' : 'bg-stone-100 border-stone-200 text-stone-500'}`}
                        >
                            全中文 (Full Chinese)
                        </button>
                    </div>
                </div>

                {/* Font Selection */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 font-bold text-stone-600 uppercase text-xs tracking-wider">
                       <Type className="w-4 h-4" /> Calligraphy Style
                    </label>
                    <div className="flex flex-col gap-2">
                        <button 
                            onClick={() => onUpdate({ ...settings, fontId: 'serif' })}
                            className={`flex-1 py-2 rounded border transition-all text-sm ${settings.fontId === 'serif' ? 'bg-amber-100 border-amber-500 text-amber-900 font-bold' : 'bg-stone-100 border-stone-200 text-stone-500'}`}
                        >
                            Standard (宋体)
                        </button>
                        <button 
                            onClick={() => onUpdate({ ...settings, fontId: 'sans' })}
                            className={`flex-1 py-2 rounded border transition-all font-calligraphy text-lg leading-none ${settings.fontId === 'sans' ? 'bg-amber-100 border-amber-500 text-amber-900' : 'bg-stone-100 border-stone-200 text-stone-500'}`}
                        >
                            Calligraphy (楷书)
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* Edge Resizers */}
        <div 
            className="absolute top-0 right-0 w-2 h-full cursor-ew-resize hover:bg-amber-500/30 transition-colors z-20"
            onMouseDown={(e) => initResize('right', e)}
        />
        <div 
            className="absolute bottom-0 left-0 w-full h-2 cursor-ns-resize hover:bg-amber-500/30 transition-colors z-20"
            onMouseDown={(e) => initResize('bottom', e)}
        />
        <div 
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize hover:bg-amber-500/50 transition-colors z-30 rounded-tl"
            onMouseDown={(e) => initResize('corner', e)}
        />
      </div>
    </div>
  );
};

// Initial welcome message when no minister is selected
const WelcomeScreen = ({ onOpenSettings, themeName, language }: { onOpenSettings: () => void, themeName: string, language: AppLanguage }) => {
  const labels = UI_LABELS[language];
  
  return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center relative overflow-hidden animate-in fade-in duration-700">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-current opacity-20 rounded-tl-3xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-current opacity-20 rounded-br-3xl"></div>
        
        <div className="w-32 h-32 mb-6 animate-pulse duration-[3000ms]">
          <ImperialSealIcon className="w-full h-full text-red-800" />
        </div>
        
        <h2 className="text-6xl font-calligraphy mb-6 tracking-widest opacity-90">
          {labels.welcomeTitle}
        </h2>
        
        {language === 'en' && (
            <p className="text-xl font-serif opacity-70 mb-2 uppercase tracking-[0.3em]">Imperial Cabinet</p>
        )}
        
        <div className="w-16 h-1 bg-current opacity-50 my-6"></div>
        
        <p className="max-w-md leading-loose font-serif opacity-80">
          {labels.welcomeSub}<br/>
          {language === 'en' && (
              <span className="text-sm opacity-60 italic mt-2 block">
                (Long live Your Majesty. The Six Ministers and their subordinates await your command.)
              </span>
          )}
        </p>
        
        <div className="mt-8 flex gap-4">
            <button 
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-current opacity-60 hover:opacity-100 transition-opacity bg-black/5 hover:bg-black/10"
            >
              <Palette className="w-4 h-4" />
              <span className="text-xs uppercase tracking-widest">{labels.welcomeButton}: {themeName}</span>
            </button>
        </div>
      </div>
  );
};

const App: React.FC = () => {
  const [selectedMinister, setSelectedMinister] = useState<Minister | null>(null);
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});
  
  // Tree Expansion State
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // --- PERSISTENCE LAYER ---
  
  // 1. Minister Settings
  const [ministerSettings, setMinisterSettings] = useState<Record<string, MinisterSettings>>(() => {
    if (typeof window !== 'undefined') {
        try {
            const saved = localStorage.getItem('imperial_minister_settings');
            return saved ? JSON.parse(saved) : {};
        } catch (e) { return {}; }
    }
    return {};
  });

  // 2. Global API Key
  const [globalApiKey, setGlobalApiKey] = useState<string>(() => {
     if (typeof window !== 'undefined') return localStorage.getItem('imperial_global_key') || '';
     return '';
  });

  // 3. Custom Presets
  const [customPresets, setCustomPresets] = useState<ModelPreset[]>(() => {
    if (typeof window !== 'undefined') {
        try {
            const saved = localStorage.getItem('imperial_library_presets');
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    }
    return [];
  });

  // 4. Appearance Settings
  const [appearance, setAppearance] = useState<AppearanceSettings>(() => {
    if (typeof window !== 'undefined') {
        try {
            const saved = localStorage.getItem('imperial_appearance');
            return saved ? JSON.parse(saved) : { themeId: 'classic', fontId: 'serif', language: 'en' };
        } catch (e) { return { themeId: 'classic', fontId: 'serif', language: 'en' }; }
    }
    return { themeId: 'classic', fontId: 'serif', language: 'en' };
  });

  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem('imperial_minister_settings', JSON.stringify(ministerSettings));
  }, [ministerSettings]);

  useEffect(() => {
    localStorage.setItem('imperial_library_presets', JSON.stringify(customPresets));
  }, [customPresets]);

  useEffect(() => {
    localStorage.setItem('imperial_global_key', globalApiKey);
  }, [globalApiKey]);

  useEffect(() => {
    localStorage.setItem('imperial_appearance', JSON.stringify(appearance));
  }, [appearance]);

  const handleMinisterSelect = (minister: Minister) => {
    setSelectedMinister(minister);
  };

  const toggleNode = (ministerId: string) => {
      setExpandedNodes(prev => ({
          ...prev,
          [ministerId]: !prev[ministerId]
      }));
  };

  const handleUpdateHistory = (ministerId: string, newHistory: ChatMessage[]) => {
    setChatHistories(prev => ({ ...prev, [ministerId]: newHistory }));
  };

  const handleUpdateSettings = (ministerId: string, newSettings: MinisterSettings) => {
    setMinisterSettings(prev => ({ ...prev, [ministerId]: newSettings }));
  };

  const handleAddPreset = (preset: ModelPreset) => {
    setCustomPresets(prev => [...prev, preset]);
  };

  const handleRemovePreset = (presetId: string) => {
    setCustomPresets(prev => prev.filter(p => p.id !== presetId));
  };

  const handleKeySave = (key: string) => {
    setGlobalApiKey(key);
    setShowKeyModal(false);
  };

  const getDefaultSettings = (): MinisterSettings => ({
     provider: 'google',
     model: 'gemini-2.5-flash',
     enableSearch: false
  });

  const systemApiKey = getSystemApiKey();
  const hasValidKey = (systemApiKey && systemApiKey.length > 0) || (globalApiKey && globalApiKey.length > 0);

  const currentTheme = THEMES[appearance.themeId] || THEMES.classic;
  const colors = currentTheme.colors;
  const fontClass = appearance.fontId === 'sans' ? 'font-calligraphy' : 'font-serif';
  
  // Ensure language defaults to 'en' if missing from old localStorage
  const currentLanguage = appearance.language || 'en';
  const labels = UI_LABELS[currentLanguage];

  // Recursive Renderer for the Tree
  const renderMinisterTree = (minister: Minister, depth: number = 0) => {
     const isExpanded = expandedNodes[minister.id];
     const hasChildren = minister.subordinates && minister.subordinates.length > 0;
     
     return (
        <div key={minister.id}>
            <MinisterCard 
                minister={minister}
                isActive={selectedMinister?.id === minister.id}
                onClick={handleMinisterSelect}
                theme={currentTheme}
                language={currentLanguage}
                isExpanded={isExpanded}
                onToggleExpand={() => toggleNode(minister.id)}
                depth={depth}
            />
            {hasChildren && isExpanded && (
                <div className="ml-0 transition-all duration-300">
                    {minister.subordinates!.map(sub => renderMinisterTree(sub, depth + 1))}
                </div>
            )}
        </div>
     );
  };

  return (
    <div className={`flex h-screen w-full ${colors.appBg} ${colors.mainText} ${fontClass} overflow-hidden selection:bg-red-900 selection:text-white transition-colors duration-700`}>
      
      <AppearanceModal 
        isOpen={showAppearanceModal} 
        onClose={() => setShowAppearanceModal(false)} 
        settings={appearance}
        onUpdate={setAppearance}
      />
      
      <ApiKeyModal 
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onSave={handleKeySave}
      />

      {/* Left Sidebar: The Cabinet */}
      <div className={`w-48 md:w-80 flex-shrink-0 flex flex-col border-r-4 ${colors.sidebarBg} ${colors.sidebarBorder} shadow-2xl relative z-20 transition-all duration-700`}>
        
        {/* Header - CLICKABLE TO RESET */}
        <div className="p-4 border-b border-black/20 flex flex-col items-center bg-black/10 backdrop-blur-sm relative flex-shrink-0">
            {/* Subtle texture overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-20 pointer-events-none"></div>
            
            <button 
              onClick={() => setSelectedMinister(null)}
              className="flex flex-col items-center group cursor-pointer outline-none w-full"
              title={labels.backButton}
            >
                <div className="mb-2 hidden md:block transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                    <ImperialSealIcon className="w-12 h-12 text-red-700 drop-shadow-lg" />
                </div>
                <h1 className={`text-2xl md:text-3xl font-calligraphy drop-shadow-md group-hover:text-amber-500 transition-colors ${colors.sidebarText} flex items-center justify-center gap-2`}>
                  {selectedMinister && <ChevronLeft className="w-5 h-5 md:hidden" />}
                  <span>{labels.cabinetTitle}</span>
                </h1>
            </button>
        </div>

        {/* Minister Tree List */}
        <div className="flex-1 overflow-y-auto p-2 royal-scroll">
          {MINISTERS.map((minister) => renderMinisterTree(minister))}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t border-black/20 text-[10px] text-center bg-black/20 hidden md:block font-serif ${colors.sidebarText} opacity-80`}>
           <div className="opacity-50 mb-1">紫禁城 · {labels.hallName}</div>
           {currentLanguage === 'en' && <div>Hall of Literary Brilliance</div>}
        </div>
      </div>

      {/* Main Content: Chat Area */}
      <div className={`flex-1 relative flex flex-col h-full ${colors.mainBg} transition-colors duration-700`}>
        
        {/* Global API Key Indicator/Revoke (Non-blocking) */}
        {hasValidKey && !systemApiKey && (
            <div className="absolute top-0 right-0 m-2 z-50 group">
                <div className="bg-green-900/80 hover:bg-stone-800 text-green-100 hover:text-amber-100 text-[10px] px-2 py-1 rounded-full border border-green-700/50 backdrop-blur-sm cursor-pointer flex items-center gap-1 transition-all shadow-sm"
                     onClick={() => { if(confirm("Revoke Imperial Seal (Clear API Key)?")) setGlobalApiKey(""); }}>
                    <CheckCircle2 className="w-3 h-3" />
                    <span className="font-serif">{labels.sealVerified}</span>
                    <span className="hidden group-hover:inline text-amber-500 ml-1">({labels.revokeKey})</span>
                </div>
            </div>
        )}

        {selectedMinister ? (
          <ChatInterface 
            key={selectedMinister.id} 
            minister={selectedMinister}
            history={chatHistories[selectedMinister.id] || []}
            settings={ministerSettings[selectedMinister.id] || getDefaultSettings()}
            customPresets={customPresets}
            globalApiKey={globalApiKey}
            theme={currentTheme}
            language={currentLanguage}
            onUpdateHistory={handleUpdateHistory}
            onUpdateSettings={handleUpdateSettings}
            onAddPreset={handleAddPreset}
            onRemovePreset={handleRemovePreset}
            onMissingApiKey={() => setShowKeyModal(true)}
          />
        ) : (
          <WelcomeScreen 
            onOpenSettings={() => setShowAppearanceModal(true)} 
            themeName={currentTheme.name}
            language={currentLanguage}
          />
        )}
      </div>
    </div>
  );
};

export default App;
