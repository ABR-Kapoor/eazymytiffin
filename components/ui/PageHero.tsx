"use client";

import React, { memo } from 'react';
import { Search, X } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';

type PageHeroProps = {
  title: React.ReactNode;
  subtitle: string;
  themeColor: string;
  rightContent?: React.ReactNode;
  heroImages?: { src: string; bg: string }[];
  search?: string;
  setSearch?: (val: string) => void;
  children?: React.ReactNode;
};

export const PageHero = memo(function PageHero({ title, subtitle, themeColor, rightContent, heroImages, search = "", setSearch, children }: PageHeroProps) {
  const { isVegTheme: isVegOnly, setVegTheme: setIsVegOnly } = useThemeStore();
  return (
    <div 
      className="relative pt-10 pb-6 px-5 rounded-b-[32px] shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all duration-500 overflow-hidden -mx-4 lg:mx-0 min-h-[160px] flex flex-col"
      style={{ backgroundColor: themeColor }}
    >
      {/* Sunburst Rays */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.15]"
        style={{
          background: `repeating-conic-gradient(from 0deg at 15% 50%, #ffffff 0deg 8deg, transparent 8deg 16deg)`
        }}
      />

      {/* Top Section (Title + Right Content) */}
      <div className="relative z-10 flex flex-row items-center justify-between w-full">
        {/* Text Content */}
        <div className="flex flex-col items-start w-[65%] shrink-0">
          <h2 
            className="text-[#FFD700] text-[clamp(32px,10vw,48px)] font-black leading-[0.9] tracking-tighter drop-shadow-xl" 
            style={{ 
              fontFamily: "'Arial Black', Impact, sans-serif", 
              WebkitTextStroke: "1px #222", 
              textShadow: "0 2px 0 #222, 0 3px 0 #222, 0 4px 0 #222, 0 5px 0 #222" 
            }}
          >
            {title}
          </h2>
          
          <div className="mt-3 bg-[#E0F7FA] text-[#006064] px-4 py-1.5 rounded-full font-black text-[12px] sm:text-[14px] shadow-md border-2 border-white/80 whitespace-nowrap overflow-hidden text-ellipsis max-w-[110%] -ml-1 transform -rotate-2">
            {subtitle}
          </div>
        </div>

        {/* Graphic Content right */}
        {(heroImages || rightContent) && (
          <div className="flex-1 flex items-center justify-end h-full min-w-0 pr-2">
            <div className="relative w-full h-[100px] flex items-center justify-end">
              {heroImages ? (
                <div className="relative w-full h-full">
                  {heroImages.map((img, i) => {
                    const pos = [
                      { right: "50%", top: "0px", rotate: "-10deg", z: 10 },
                      { right: "25%", top: "16px", rotate: "5deg", z: 20 },
                      { right: "0%", top: "4px", rotate: "15deg", z: 30 },
                    ][i] || { right: "0%", top: "0px", rotate: "0deg", z: 1 };
                    return (
                      <div key={i} className="absolute" style={{ right: pos.right, top: pos.top, transform: `rotate(${pos.rotate})`, zIndex: pos.z }}>
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg" style={{ backgroundColor: img.bg }}>
                          <img src={img.src} alt="" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                rightContent
              )}
            </div>
          </div>
        )}
      </div>

      {/* Search Bar & Veg Toggle container */}
      {setSearch && (
        <div className="mt-6 flex items-center gap-3 relative z-20 w-full">
          {/* Search Bar */}
          <div className="flex-1 bg-white rounded-[16px] px-4 h-[52px] flex items-center shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
            <Search size={22} className="text-[#6B7280] mr-3 shrink-0" strokeWidth={2} />
            <input
              type="text"
              placeholder={`Search for 'Eazy food'`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-[15px] text-[#4B5563] placeholder-[#6B7280] font-medium min-w-0"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mr-3 text-[#93959F]"
              >
                <X size={18} />
              </button>
            )}
          </div>
          
          {/* Compact Veg Toggle */}
          <button
            onClick={() => setIsVegOnly(!isVegOnly)}
            className="bg-white rounded-[16px] p-2 flex flex-col items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-colors shrink-0 min-w-[56px] h-[52px]"
          >
            <span className="text-[11px] font-bold text-gray-600 tracking-wide mb-1 leading-none">VEG</span>
            <div className="flex items-center gap-1.5">
              <div className={`w-3.5 h-3.5 border-[1.5px] flex items-center justify-center rounded-[3px] ${isVegOnly ? 'border-[#0F8A65]' : 'border-[#E23744]'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isVegOnly ? 'bg-[#0F8A65]' : 'bg-[#E23744]'}`} />
              </div>
              <div className={`w-7 h-4 rounded-full relative transition-colors duration-300 ${isVegOnly ? 'bg-[#0F8A65]' : 'bg-[#e2e2e7]'}`}>
                <div className={`absolute top-[2px] w-3 h-3 bg-white rounded-full transition-all duration-300 shadow-sm ${isVegOnly ? 'left-[14px]' : 'left-[2px]'}`} />
              </div>
            </div>
          </button>
        </div>
      )}

      {children}
    </div>
  );
});