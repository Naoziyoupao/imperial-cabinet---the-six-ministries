import React from 'react';
import { Minister } from '../types';
import { MINISTRY_ICONS } from '../constants';

interface MinisterCardProps {
  minister: Minister;
  onClick: (minister: Minister) => void;
  isActive: boolean;
}

const MinisterCard: React.FC<MinisterCardProps> = ({ minister, onClick, isActive }) => {
  return (
    <div 
      onClick={() => onClick(minister)}
      className={`
        relative cursor-pointer transition-all duration-500 group
        flex flex-row items-stretch h-32 md:h-24
        border
        /* Tablet Shape: Rounded Top, Square Bottom */
        rounded-t-2xl rounded-b-sm
        ${isActive 
          ? 'border-amber-600/80 bg-stone-800 shadow-[0_0_15px_rgba(217,119,6,0.3)] translate-x-1' 
          : 'border-stone-800 bg-stone-900/60 hover:bg-stone-800 hover:border-stone-600 hover:translate-x-1'}
      `}
    >
      {/* Left: Color Strip / Icon */}
      <div className={`w-10 md:w-16 ${minister.avatarColor} flex items-center justify-center relative overflow-hidden rounded-tl-xl`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className={`text-white/90 transition-transform duration-700 ${isActive ? 'scale-110 rotate-0' : 'scale-90 opacity-70'}`}>
           {MINISTRY_ICONS[minister.id]}
        </div>
        {/* Vertical line decoration */}
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-black/30"></div>
      </div>
      
      {/* Right: Content */}
      <div className="flex-1 p-3 flex flex-col justify-center relative">
        {/* Background subtle pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>

        <div className="flex justify-between items-start">
           <div>
              <h3 className={`text-lg md:text-xl font-calligraphy tracking-widest mb-1 transition-colors ${isActive ? 'text-amber-400' : 'text-stone-300'}`}>
                {minister.chineseTitle}
              </h3>
              <p className="text-xs text-stone-500 font-serif uppercase tracking-wider hidden md:block">
                {minister.title}
              </p>
           </div>
           {/* Vertical text for the name on mobile or styled tablet feel */}
           <div className="h-full flex items-center">
             <div className={`
               w-6 h-6 rounded-full flex items-center justify-center border text-xs font-serif
               ${isActive ? 'bg-amber-900/50 border-amber-700 text-amber-200' : 'bg-stone-800 border-stone-700 text-stone-500'}
             `}>
                <span className="font-calligraphy">{minister.name.split(' ')[1].charAt(0)}</span>
             </div>
           </div>
        </div>
        
        <p className="text-[10px] text-stone-500 mt-2 line-clamp-1 hidden md:block italic">
          "{minister.personality.split(',')[0]}"
        </p>

        {/* Active Indicator - Red Seal "Approved" */}
        {isActive && (
            <div className="absolute bottom-[-5px] right-[-5px] md:bottom-1 md:right-1 border-2 border-red-800 rounded-sm p-0.5 flex items-center justify-center opacity-90 rotate-[-12deg] bg-rice-paper/10 backdrop-blur-sm">
                <span className="text-[10px] text-red-800 font-calligraphy leading-none px-1">准奏</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default MinisterCard;