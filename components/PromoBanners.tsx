import React from 'react';
import { ArrowRight, Timer } from 'lucide-react';

export const CoverBanner: React.FC = () => {
  return (
    <div className="w-full relative overflow-hidden group border-b border-slate-800">
      <div className="w-full h-48 md:h-80 lg:h-96 relative">
        <img 
          src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2000" 
          alt="Z-One Portada" 
          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <span className="bg-cyan-500 text-slate-900 text-[10px] md:text-xs font-bold px-2 py-1 rounded mb-2 uppercase tracking-wider inline-block">
            Oficial
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg">
            Z-ONE <span className="text-cyan-400">UNIVERSE</span>
          </h1>
        </div>
      </div>
    </div>
  );
};

export const OfferBanner: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 mt-8">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900 to-purple-900 border border-indigo-500/30 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="inline-flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold animate-pulse border border-yellow-500/50">
              <Timer className="w-4 h-4" /> Oferta Relámpago
            </div>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white">
              MasterBook Pro X <span className="text-cyan-400">-20% OFF</span>
            </h2>
            <button className="bg-white text-indigo-900 hover:bg-indigo-50 font-bold py-3 px-6 rounded-xl transition-colors shadow-lg flex items-center gap-2 mx-auto md:mx-0 text-sm">
              Ver Oferta <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 w-full max-w-xs relative">
             <img 
               src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=800" 
               alt="Laptop Oferta" 
               className="relative z-10 w-full object-contain drop-shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500"
             />
          </div>
        </div>
      </div>
    </div>
  );
};