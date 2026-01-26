import React from 'react';
import { ArrowRight, Star } from 'lucide-react';

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

interface OfferBannerProps {
  onViewProduct?: (productName: string) => void;
}

export const OfferBanner: React.FC<OfferBannerProps> = ({ onViewProduct }) => {
  // Aquí eliges el nombre EXACTO del producto de tu base de datos que quieres promocionar
  const FEATURED_PRODUCT_NAME = "Lenovo V15"; 

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 mt-8">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 to-indigo-950 border border-indigo-500/30 shadow-2xl group cursor-pointer"
           onClick={() => onViewProduct && onViewProduct(FEATURED_PRODUCT_NAME)}>
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 p-8 md:p-12">
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/30">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> Recomendado del Mes
            </div>
            
            <h2 className="text-2xl md:text-4xl font-extrabold text-white">
              {FEATURED_PRODUCT_NAME}
            </h2>
            
            <p className="text-slate-400 max-w-md mx-auto md:mx-0">
              Descubre el rendimiento definitivo. Haz clic para ver detalles y especificaciones completas en nuestro catálogo.
            </p>

            <button 
              onClick={(e) => {
                e.stopPropagation(); // Evita doble clic
                onViewProduct && onViewProduct(FEATURED_PRODUCT_NAME);
              }}
              className="bg-indigo-600 text-white hover:bg-indigo-500 font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-indigo-900/50 flex items-center gap-2 mx-auto md:mx-0 text-sm group-hover:translate-x-2"
            >
              Ver Producto <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 w-full max-w-xs relative perspective-1000">
             <img 
               src="https://m.media-amazon.com/images/I/71Gxorija4L._AC_SX425_.jpg" 
               alt="Laptop Destacada" 
               className="relative z-10 w-full object-contain drop-shadow-2xl transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-2deg]"
             />
             {/* Sombra/Reflejo decorativo */}
             <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-black/50 blur-xl rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};