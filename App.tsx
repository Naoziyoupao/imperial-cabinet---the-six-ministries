import React, { useState, useEffect } from 'react';
import { MINISTERS } from './constants';
import { Minister, ChatMessage, MinisterSettings, ModelPreset } from './types';
import MinisterCard from './components/MinisterCard';
import ChatInterface from './components/ChatInterface';
import { getSystemApiKey } from './services/geminiService';
import { Info, Key, Save, CheckCircle2, AlertTriangle } from 'lucide-react';

// Custom Component for the Imperial Jade Seal (传国玉玺)
const ImperialSealIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="currentColor">
    {/* The Seal Body (Square) */}
    <rect x="15" y="35" width="70" height="55" rx="4" className="text-red-800" fill="currentColor" />
    
    {/* The Dragon Handle (Stylized) */}
    <path d="M30 35 C 30 15, 70 15, 70 35" stroke="currentColor" strokeWidth="8" fill="none" className="text-red-900" />
    <circle cx="50" cy="25" r="6" className="text-amber-500" fill="currentColor" />
    
    {/* The Characters inside (Abstract strokes mimicking 'Emperor') */}
    <path d="M35 55 L 65 55 M 50 45 L 50 75 M 35 75 L 65 75 M 30 45 L 70 45" stroke="white" strokeWidth="3" opacity="0.8" />
  </svg>
);

// Initial welcome message when no minister is selected
const WelcomeScreen = () => (
  <div className="h-full flex flex-col items-center justify-center text-stone-600 p-8 text-center bg-rice-paper relative overflow-hidden">
    {/* Decorative Background Elements */}
    <div className="absolute top-0 left-0 w-32 h-32 border-l-4 border-t-4 border-stone-300 opacity-50 rounded-tl-3xl"></div>
    <div className="absolute bottom-0 right-0 w-32 h-32 border-r-4 border-b-4 border-stone-300 opacity-50 rounded-br-3xl"></div>
    
    <div className="w-32 h-32 mb-6 opacity-90 animate-pulse duration-[3000ms]">
      <ImperialSealIcon className="w-full h-full text-red-800" />
    </div>
    
    <h2 className="text-6xl font-calligraphy text-stone-900 mb-6 tracking-widest">
      大清内阁
    </h2>
    <p className="text-xl font-serif text-amber-800 mb-2 uppercase tracking-[0.3em]">Imperial Cabinet</p>
    
    <div className="w-16 h-1 bg-amber-800 my-6"></div>
    
    <p className="max-w-md leading-loose font-serif text-stone-700">
      陛下万岁。六部尚书已在朝房候旨。<br/>
      <span className="text-sm text-stone-500 italic mt-2 block">
        (Long live Your Majesty. The Six Ministers await your command in the court room.)
      </span>
    </p>
    
    <p className="mt-8 text-sm text-stone-500 flex items-center gap-2">
      <span className="inline-block w-2 h-2 bg-red-800 rotate-45"></span>
      Select a name tablet on the left to summon a minister.
      <span className="inline-block w-2 h-2 bg-red-800 rotate-45"></span>
    </p>
  </div>
);

const App: React.FC = () => {
  const [selectedMinister, setSelectedMinister] = useState<Minister | null>(null);
  const [chatHistories, setChatHistories] = useState<Record<string, ChatMessage[]>>({});
  
  // --- PERSISTENCE LAYER ---
  
  // 1. Minister Settings (Models, Providers)
  const [ministerSettings, setMinisterSettings] = useState<Record<string, MinisterSettings>>(() => {
    if (typeof window !== 'undefined') {
        try {
            const saved = localStorage.getItem('imperial_minister_settings');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    }
    return {};
  });

  // 2. Global API Key (User Input)
  const [globalApiKey, setGlobalApiKey] = useState<string>(() => {
     if (typeof window !== 'undefined') {
         return localStorage.getItem('imperial_global_key') || '';
     }
     return '';
  });

  // 3. Custom Presets (Library)
  const [customPresets, setCustomPresets] = useState<ModelPreset[]>(() => {
    if (typeof window !== 'undefined') {
        try {
            const saved = localStorage.getItem('imperial_library_presets');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }
    return [];
  });

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


  const handleMinisterSelect = (minister: Minister) => {
    setSelectedMinister(minister);
  };

  const handleUpdateHistory = (ministerId: string, newHistory: ChatMessage[]) => {
    setChatHistories(prev => ({
      ...prev,
      [ministerId]: newHistory
    }));
  };

  const handleUpdateSettings = (ministerId: string, newSettings: MinisterSettings) => {
    setMinisterSettings(prev => ({
        ...prev,
        [ministerId]: newSettings
    }));
  };

  const handleAddPreset = (preset: ModelPreset) => {
    setCustomPresets(prev => [...prev, preset]);
  };

  const handleRemovePreset = (presetId: string) => {
    setCustomPresets(prev => prev.filter(p => p.id !== presetId));
  };

  // Default Settings now include 'provider: google'
  const getDefaultSettings = (): MinisterSettings => ({
     provider: 'google',
     model: 'gemini-2.5-flash',
     enableSearch: false
  });

  // Temporary state for the input in the banner
  const [tempKeyInput, setTempKeyInput] = useState('');
  
  // Safe logic to check for key existence without crashing
  const systemApiKey = getSystemApiKey();
  const hasValidKey = (systemApiKey && systemApiKey.length > 0) || (globalApiKey && globalApiKey.length > 0);

  return (
    <div className="flex h-screen w-full bg-stone-950 text-stone-200 font-serif overflow-hidden selection:bg-red-900 selection:text-white">
      
      {/* Left Sidebar: The Cabinet */}
      <div className="w-24 md:w-80 flex-shrink-0 flex flex-col border-r-4 border-stone-900 bg-dark-wood shadow-2xl relative z-20">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-800/50 flex flex-col items-center bg-black/20 backdrop-blur-sm relative">
            {/* Subtle texture overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-20 pointer-events-none"></div>
            
            <div className="mb-4 hidden md:block transform hover:scale-105 transition-transform duration-500">
                <ImperialSealIcon className="w-16 h-16 text-red-700 drop-shadow-lg" />
            </div>
            <h1 className="text-3xl font-calligraphy text-stone-100 writing-vertical md:writing-mode-horizontal md:text-3xl md:tracking-[0.2em] drop-shadow-md">
              <span className="md:hidden">六部</span>
              <span className="hidden md:inline text-amber-500">六部尚书</span>
            </h1>
        </div>

        {/* Minister Grid List */}
        <div className="flex-1 overflow-y-auto p-2 md:p-4 space-y-4 royal-scroll">
          {MINISTERS.map((minister) => (
            <MinisterCard 
              key={minister.id}
              minister={minister}
              isActive={selectedMinister?.id === minister.id}
              onClick={handleMinisterSelect}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800/50 text-[10px] text-stone-500 text-center bg-black/40 hidden md:block font-serif">
           <div className="opacity-50 mb-1">紫禁城 · 文渊阁</div>
           <div>Hall of Literary Brilliance</div>
        </div>
      </div>

      {/* Main Content: Chat Area */}
      <div className="flex-1 relative flex flex-col h-full bg-rice-paper">
        
        {/* Global API Key Bar (Visible if no key found in ENV or Global State) */}
        {!hasValidKey ? (
            <div className="absolute top-0 left-0 right-0 bg-stone-900/95 border-b-4 border-amber-800 p-4 z-50 shadow-2xl flex flex-col items-center justify-center text-center animate-in slide-in-from-top duration-500 backdrop-blur-md">
                <div className="flex items-center gap-2 mb-2 text-amber-500">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="font-calligraphy text-xl tracking-widest">圣旨 (Imperial Decree)</h3>
                </div>
                <p className="text-stone-300 text-sm mb-4 max-w-lg font-serif">
                   The Imperial Treasury (Environment Variables) is empty. <br/>
                   You must supply your own <strong>Jade Seal (Google Gemini API Key)</strong> to summon the ministers.
                </p>
                <div className="flex items-center gap-2 w-full max-w-md">
                    <div className="relative flex-1">
                        <Key className="absolute left-3 top-2.5 w-4 h-4 text-stone-500" />
                        <input 
                            type="password" 
                            placeholder="Enter Google Gemini API Key (AIza...)"
                            value={tempKeyInput}
                            onChange={(e) => setTempKeyInput(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-black/50 border border-stone-600 rounded text-amber-100 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none font-mono text-sm placeholder-stone-600"
                        />
                    </div>
                    <button 
                        onClick={() => setGlobalApiKey(tempKeyInput)}
                        disabled={!tempKeyInput}
                        className="px-6 py-2 bg-amber-800 hover:bg-amber-700 text-white font-bold rounded shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all font-serif uppercase tracking-wider"
                    >
                        <Save className="w-4 h-4" />
                        Accept
                    </button>
                </div>
                <div className="mt-2">
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-stone-500 hover:text-amber-500 underline transition-colors">
                        Get a key from Google AI Studio
                    </a>
                </div>
            </div>
        ) : !systemApiKey ? (
             /* Small indicator if using user-provided key */
            <div className="absolute top-0 right-0 m-2 z-50 group">
                <div className="bg-green-900/80 hover:bg-stone-800 text-green-100 hover:text-amber-100 text-[10px] px-2 py-1 rounded-full border border-green-700/50 backdrop-blur-sm cursor-pointer flex items-center gap-1 transition-all shadow-sm"
                     onClick={() => { if(confirm("Revoke Imperial Seal (Clear API Key)?")) setGlobalApiKey(""); }}>
                    <CheckCircle2 className="w-3 h-3" />
                    <span className="font-serif">Seal Verified</span>
                    <span className="hidden group-hover:inline text-amber-500 ml-1">(Revoke)</span>
                </div>
            </div>
        ) : null}

        {selectedMinister ? (
          <ChatInterface 
            key={selectedMinister.id} 
            minister={selectedMinister}
            history={chatHistories[selectedMinister.id] || []}
            settings={ministerSettings[selectedMinister.id] || getDefaultSettings()}
            customPresets={customPresets}
            globalApiKey={globalApiKey}
            onUpdateHistory={handleUpdateHistory}
            onUpdateSettings={handleUpdateSettings}
            onAddPreset={handleAddPreset}
            onRemovePreset={handleRemovePreset}
          />
        ) : (
          <WelcomeScreen />
        )}
      </div>
    </div>
  );
};

export default App;