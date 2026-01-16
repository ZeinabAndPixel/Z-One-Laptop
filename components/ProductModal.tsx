import React, { useEffect, useState } from 'react';
import { Product, ProductSpecification } from '../types';
import { getProductSpecs } from '../services/db';
import { X, Cpu, HardDrive, Monitor, Zap, ShoppingCart } from 'lucide-react';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart }) => {
  const [specs, setSpecs] = useState<ProductSpecification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProductSpecs(product.product_id).then((data) => {
      setSpecs(data || null);
      setLoading(false);
    });
  }, [product.product_id]);

  const handleAdd = () => {
    onAddToCart(product);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl animate-fade-in flex flex-col md:flex-row">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-slate-400 hover:text-white bg-slate-800/50 rounded-full p-1"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 bg-slate-950 flex items-center justify-center p-8">
          <img 
            src={product.image_url} 
            alt={product.name} 
            className="max-w-full h-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
          />
        </div>

        {/* Info Section */}
        <div className="w-full md:w-1/2 p-8">
          <div className="mb-2 text-cyan-500 text-sm font-bold tracking-wider uppercase">{product.category}</div>
          <h2 className="text-3xl font-bold text-white mb-2">{product.name}</h2>
          <p className="text-2xl text-slate-200 font-light mb-6">${product.price.toLocaleString()}</p>

          <div className="space-y-6">
            <h3 className="text-lg font-medium text-slate-300 border-b border-slate-700 pb-2">Especificaciones Técnicas</h3>
            
            {loading ? (
              <div className="space-y-3">
                <div className="h-4 bg-slate-800 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-slate-800 rounded w-1/2 animate-pulse"></div>
                <div className="h-4 bg-slate-800 rounded w-5/6 animate-pulse"></div>
              </div>
            ) : specs ? (
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-slate-800 rounded text-cyan-500"><Cpu className="w-5 h-5"/></div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase">Procesador</div>
                    <div className="text-slate-200 font-medium">{specs.cpu}</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-slate-800 rounded text-cyan-500"><Zap className="w-5 h-5"/></div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase">Memoria y Gráficos</div>
                    <div className="text-slate-200">{specs.ram}</div>
                    <div className="text-slate-300 text-sm">{specs.gpu}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-slate-800 rounded text-cyan-500"><HardDrive className="w-5 h-5"/></div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase">Almacenamiento</div>
                    <div className="text-slate-200">{specs.storage}</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-slate-800 rounded text-cyan-500"><Monitor className="w-5 h-5"/></div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase">Pantalla</div>
                    <div className="text-slate-200">{specs.display}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-red-400 text-sm">Especificaciones no encontradas en base de datos.</div>
            )}
          </div>

          <div className="mt-8">
            <button 
              onClick={handleAdd}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded transition-colors shadow-lg shadow-cyan-900/20 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Añadir al Carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};