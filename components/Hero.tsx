import React, { useEffect, useState } from 'react';
import { generateAcademicWarning } from '../services/gemini';
import { getBanner } from '../services/db';
import { CustomBanner } from '../types';
import { AlertTriangle, ChevronRight } from 'lucide-react';

export const Hero: React.FC = () => {
  const [warningText, setWarningText] = useState<string>('Initializing safety protocols...');
  const [banner, setBanner] = useState<CustomBanner | null>(null);

  useEffect(() => {
    // 1. Get AI Warning
    generateAcademicWarning().then(setWarningText);
    
    // 2. Get DB Banner
    getBanner('hero_main').then(setBanner);
  }, []);

  return (
    <div className="relative w-full">
      {/* AI Academic Warning Banner */}
      <div className="bg-amber-900/20 border-b border-amber-500/30 text-amber-200/90 text-xs font-mono py-2 px-4 flex items-center justify-center tracking-wide">
        <AlertTriangle className="w-3 h-3 mr-2 text-amber-500" />
        <span className="uppercase">[SYSTEM ADVISORY]:</span>
        <span className="ml-2 animate-pulse">{warningText}</span>
      </div>

      {/* Main Hero */}
      <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {banner ? (
          <>
            <div className="absolute inset-0 z-0">
               {/* Overlay gradient */}
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10" />
               <img 
                 src={banner.image_url} 
                 alt="Hero" 
                 className="w-full h-full object-cover opacity-60"
               />
            </div>
            
            <div className="relative z-20 max-w-4xl mx-auto text-center px-4">
              <div className="inline-block mb-4 px-3 py-1 border border-cyan-500/30 rounded-full bg-cyan-950/30 backdrop-blur-sm">
                 <span className="text-cyan-400 text-xs font-bold tracking-widest uppercase">Version 2.0 Live</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-2xl">
                {banner.title}
              </h1>
              <p className="text-xl text-slate-300 mb-8 font-light max-w-2xl mx-auto">
                {banner.subtitle}
              </p>
              <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-sm font-medium transition-all duration-300 flex items-center mx-auto hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                {banner.cta_text} <ChevronRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="text-slate-500 animate-pulse">Loading Custom Banners from Neon DB...</div>
        )}
      </div>
    </div>
  );
};