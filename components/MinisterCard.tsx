
import React from 'react';
import { Minister, ThemeConfig, AppLanguage } from '../types';
import { MINISTRY_ICONS, UI_LABELS } from '../constants';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface MinisterCardProps {
  minister: Minister;
  onClick: (minister: Minister) => void;
  isActive: boolean;
  theme: ThemeConfig;
  language: AppLanguage;
  isExpanded?: boolean;
  onToggleExpand?: (e: React.MouseEvent) => void;
  depth?: number; // For tree indentation
}

const MinisterCard: React.FC<MinisterCardProps> = ({ 
  minister, 
  onClick, 
  isActive, 
  theme,
  language,
  isExpanded = false,
  onToggleExpand,
  depth = 0 
}) => {
  const colors = theme.colors;
  const isTopLevel = depth === 0;
  const hasSubordinates = minister.subordinates && minister.subordinates.length > 0;
  const isFullChinese = language === 'zh';

  // 1. Top Level (Shangshu) - Large Card Style
  if (isTopLevel) {
    return (
      <div 
        onClick={() => onClick(minister)}
        className={`
          relative cursor-pointer transition-all duration-500 group
          flex flex-row items-stretch h-28 md:h-24
          border
          rounded-t-xl rounded-b-sm
          ${isActive 
            ? `${colors.cardActiveBorder} ${colors.cardActiveBg} shadow-[0_0_15px_rgba(217,119,6,0.3)] translate-x-1` 
            : `${colors.cardBorder} ${colors.cardBg} hover:brightness-125`}
        `}
      >
        {/* Left: Color Strip / Icon */}
        <div className={`w-10 md:w-14 ${minister.avatarColor} flex items-center justify-center relative overflow-hidden rounded-tl-lg`}>
          <div className="absolute inset-0 bg-black/20"></div>
          <div className={`text-white/90 transition-transform duration-700 ${isActive ? 'scale-110 rotate-0' : 'scale-90 opacity-70'}`}>
             {MINISTRY_ICONS[minister.ministryId]}
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-black/30"></div>
        </div>
        
        {/* Right: Content */}
        <div className="flex-1 p-2 md:p-3 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>

          <div className="flex justify-between items-start">
             <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                   <h3 className={`text-lg font-calligraphy tracking-widest transition-colors ${isActive ? colors.accent : colors.sidebarText} truncate`}>
                     {minister.chineseTitle}
                   </h3>
                </div>
                
                {/* Hide English Name in Full Chinese Mode */}
                {!isFullChinese && (
                  <p className={`text-[10px] uppercase tracking-wider opacity-60 ${colors.sidebarText}`}>
                    {minister.name}
                  </p>
                )}
                
                <div className={`text-[9px] mt-1 opacity-50 font-mono border border-dashed px-1 w-fit rounded ${colors.sidebarBorder} ${colors.sidebarText}`}>
                   {minister.rank}
                </div>
             </div>
             
             {/* Expand Toggle for Top Level */}
             {hasSubordinates && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if(onToggleExpand) onToggleExpand(e);
                  }}
                  className={`p-1 rounded-full hover:bg-white/10 transition-transform ${isExpanded ? 'rotate-90' : ''} ${colors.sidebarText}`}
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
             )}
          </div>

          {isActive && (
              <div className="absolute bottom-1 right-1 border border-red-800 rounded-sm p-0.5 opacity-90 rotate-[-12deg] bg-rice-paper/10 backdrop-blur-sm">
                  <span className="text-[8px] text-red-800 font-calligraphy leading-none">准奏</span>
              </div>
          )}
        </div>
      </div>
    );
  }

  // 2. Subordinate Level (Compact Tree Node)
  return (
    <div 
        className={`relative flex items-center py-1 pr-2 my-1 rounded cursor-pointer group transition-colors
            ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}
        `}
        style={{ paddingLeft: `${depth * 12 + 12}px` }} // Tree Indentation
        onClick={() => onClick(minister)}
    >
        {/* Tree Line Graphic */}
        <div className="absolute left-0 top-0 bottom-0 border-l border-dotted border-white/20" style={{ left: `${depth * 12 + 6}px` }}></div>
        <div className="absolute w-2 border-t border-dotted border-white/20" style={{ left: `${depth * 12 + 6}px`, top: '50%' }}></div>

        {/* Expand Toggle (if has children) */}
        <div 
            className="mr-2 flex-shrink-0 w-4 h-4 flex items-center justify-center cursor-pointer hover:bg-white/20 rounded"
            onClick={(e) => {
                e.stopPropagation();
                if(hasSubordinates && onToggleExpand) onToggleExpand(e);
                else onClick(minister);
            }}
        >
            {hasSubordinates ? (
                isExpanded ? <ChevronDown className="w-3 h-3 text-amber-500" /> : <ChevronRight className="w-3 h-3 opacity-50" />
            ) : (
                <div className="w-1 h-1 rounded-full bg-white/30"></div>
            )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
            <div className={`flex items-center gap-2 ${isActive ? 'text-amber-400' : colors.sidebarText}`}>
                <span className="font-calligraphy text-sm">{minister.chineseTitle}</span>
                <span className="text-[9px] opacity-50 font-mono bg-black/20 px-1 rounded">{minister.rank}</span>
            </div>
            {isActive && <span className="text-[8px] text-amber-600 font-serif block leading-none ml-1">{UI_LABELS[language].currentlyAudience}</span>}
        </div>
    </div>
  );
};

export default MinisterCard;
