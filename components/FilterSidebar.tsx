import React from 'react';
import { Filter } from 'lucide-react';
import { CATEGORIES, BRANDS } from '../constants';

interface FilterSidebarProps {
  activeCategory: string;
  activeBrand: string;
  onSelectCategory: (category: string) => void;
  onSelectBrand: (brand: string) => void;
  availableCategories?: string[];
  availableBrands?: string[];
  className?: string;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  activeCategory,
  activeBrand,
  onSelectCategory,
  onSelectBrand,
  availableCategories,
  availableBrands,
  className = ''
}) => {
  return (
    <aside className={`
      ${className}
      bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6
      transition-all duration-300
    `}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Filter className="w-5 h-5 text-cyan-400" /> Filtros
        </h3>
        {(activeCategory !== 'Todos' || activeBrand !== 'Todas') && (
          <button
            onClick={() => { onSelectCategory('Todos'); onSelectBrand('Todas'); }}
            className="text-xs text-slate-500 hover:text-cyan-400 transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Categories Section */}
      <div className="mb-8">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Categorías</h4>
        <div className="space-y-3">
          {(availableCategories || CATEGORIES).map((cat) => (
            <label key={cat} className="flex items-center gap-3 cursor-pointer group select-none">
              <input
                type="radio"
                name="category"
                className="peer sr-only"
                checked={activeCategory === cat}
                onChange={() => onSelectCategory(cat)}
              />
              <div className="w-4 h-4 rounded-full border border-slate-600 peer-checked:border-cyan-500 peer-checked:bg-cyan-500 group-hover:border-cyan-400/50 transition-all shadow-[0_0_0_0_rgba(6,182,212,0)] peer-checked:shadow-[0_0_10px_rgba(6,182,212,0.4)] relative">
                 {/* Inner dot handled by bg change in this design style */}
              </div>
              <span className={`text-sm transition-colors duration-200 ${activeCategory === cat ? 'text-white font-medium' : 'text-slate-400 group-hover:text-slate-300'}`}>
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Brands Section */}
      <div>
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Marcas</h4>
        <div className="space-y-3">
          {(availableBrands || BRANDS).map((brand) => (
            <label key={brand} className="flex items-center gap-3 cursor-pointer group select-none">
               <input
                type="radio"
                name="brand"
                className="peer sr-only"
                checked={activeBrand === brand}
                onChange={() => onSelectBrand(brand)}
              />
              <div className="w-4 h-4 rounded-sm border border-slate-600 peer-checked:border-cyan-500 peer-checked:bg-cyan-500 group-hover:border-cyan-400/50 transition-all"></div>
              <span className={`text-sm transition-colors duration-200 ${activeBrand === brand ? 'text-white font-medium' : 'text-slate-400 group-hover:text-slate-300'}`}>
                {brand}
              </span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;