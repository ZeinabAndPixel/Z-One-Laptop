import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { getProducts } from '../services/db';
import { ProductModal } from './ProductModal';
import { Plus, Filter } from 'lucide-react';

interface CatalogProps {
  onAddToCart: (product: Product) => void;
}

export const Catalog: React.FC<CatalogProps> = ({ onAddToCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      
      {/* SIDEBAR IZQUIERDO (25%) */}
      <aside className="w-full md:w-1/4 space-y-6">
        <div className="glass-panel p-6 rounded-lg border-l-4 border-cyan-500">
          <div className="flex items-center gap-2 mb-4 text-white font-bold text-lg">
            <Filter className="w-5 h-5 text-cyan-500" /> FILTROS
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Categoría</label>
              <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-cyan-500 focus:outline-none text-sm">
                <option>Todas</option>
                <option>Laptops</option>
                <option>Componentes</option>
                <option>Accesorios</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Rango de Precio</label>
              <select className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-cyan-500 focus:outline-none text-sm">
                <option>Cualquiera</option>
                <option>$0 - $500</option>
                <option>$500 - $1500</option>
                <option>$1500+</option>
              </select>
            </div>

             <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded text-sm transition-colors mt-4">
               Aplicar Filtros
             </button>
          </div>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL (75%) */}
      <div className="w-full md:w-3/4">
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-800 pb-2">NUESTROS PRODUCTOS</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div 
              key={product.product_id}
              className="group glass-panel rounded-xl overflow-hidden hover:border-cyan-500/30 transition-all duration-300 cursor-pointer relative"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="aspect-[4/3] bg-slate-900/50 relative overflow-hidden">
                {/* Overlay Hover */}
                <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 transition-colors z-10" />
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(product);
                  }}
                  className="absolute bottom-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-cyan-500 hover:bg-cyan-400 text-white p-2 rounded-full shadow-lg inline-flex"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider bg-cyan-950/30 px-2 py-1 rounded">{product.category}</span>
                </div>
                <h3 className="text-md font-bold text-white mb-1 leading-tight group-hover:text-cyan-400 transition-colors">{product.name}</h3>
                <p className="text-lg font-light text-slate-200">${product.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={onAddToCart}
        />
      )}
    </div>
  );
};