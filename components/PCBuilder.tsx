import React, { useState, useEffect } from 'react';
import { X, Check, Cpu, Monitor, Zap, HardDrive, Box, ShoppingCart, AlertCircle } from 'lucide-react';
import { getProducts } from '../lib/db';
import { Product } from '../types';

interface PCBuilderProps {
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

// Definimos las etapas del armado
const STEPS = [
  { id: 'processor', label: 'Procesador', icon: <Cpu className="w-5 h-5" />, categoryFilter: 'Procesadores' },
  { id: 'motherboard', label: 'Tarjeta Madre', icon: <Box className="w-5 h-5" />, categoryFilter: 'Tarjetas Madre' },
  { id: 'ram', label: 'Memoria RAM', icon: <Zap className="w-5 h-5" />, categoryFilter: 'Memorias RAM' },
  { id: 'storage', label: 'Almacenamiento', icon: <HardDrive className="w-5 h-5" />, categoryFilter: 'Almacenamiento' },
  { id: 'gpu', label: 'Tarjeta Gráfica', icon: <Monitor className="w-5 h-5" />, categoryFilter: 'Tarjetas Gráficas' },
  { id: 'case', label: 'Case / Gabinete', icon: <Box className="w-5 h-5" />, categoryFilter: 'Gabinetes' },
  { id: 'psu', label: 'Fuente de Poder', icon: <Zap className="w-5 h-5" />, categoryFilter: 'Fuentes de Poder' },
];

const PCBuilder: React.FC<PCBuilderProps> = ({ onClose, onAddToCart }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [selection, setSelection] = useState<Record<string, Product | null>>({});
  const [loading, setLoading] = useState(true);

  // Cargar inventario REAL y filtrar stock > 0
  useEffect(() => {
    async function loadParts() {
      try {
        const products = await getProducts();
        // Mapeo de seguridad para asegurar formato y SOLO STOCK > 0
        const validProducts = products
          .filter((p: any) => p.stock > 0) // <--- DOBLE SEGURIDAD AQUÍ
          .map((p: any) => ({
            id: p.id,
            name: p.nombre,
            price: Number(p.precio),
            image: p.imagen_url,
            category: p.categoria, // Asegúrate de que en tu BD las categorías coincidan (o ajusta los filtros arriba)
            specs: p.descripcion ? p.descripcion.split(',') : [],
            brand: p.marca,
            stock: p.stock
          }));
        
        setCatalog(validProducts);
      } catch (error) {
        console.error("Error loading builder parts:", error);
      } finally {
        setLoading(false);
      }
    }
    loadParts();
  }, []);

  const currentStepInfo = STEPS[activeStep];
  
  // Filtrar productos para el paso actual
  // Nota: Ajusta la lógica de 'includes' si tus categorías en BD son diferentes (ej: "Procesador" vs "Procesadores")
  const stepProducts = catalog.filter(p => 
    p.category.toLowerCase().includes(currentStepInfo.categoryFilter.toLowerCase().slice(0, 4)) 
  );

  const handleSelect = (product: Product) => {
    setSelection(prev => ({ ...prev, [currentStepInfo.id]: product }));
    if (activeStep < STEPS.length - 1) {
      setTimeout(() => setActiveStep(prev => prev + 1), 300); // Pequeña pausa para ver la selección
    }
  };

  const totalPrice = Object.values(selection).reduce((sum, item) => sum + (item?.price || 0), 0);
  const totalItems = Object.values(selection).filter(Boolean).length;

  const handleFinish = () => {
    // Agregar todo al carrito
    Object.values(selection).forEach(item => {
      if (item) onAddToCart(item);
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-md z-10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="text-cyan-400" /> PC Builder <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded">BETA</span>
          </h2>
          <p className="text-slate-400 text-xs">Arma tu equipo a medida con stock en tiempo real</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
          <X className="text-slate-400 hover:text-white" />
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar de Pasos (Izquierda) */}
        <div className="w-16 md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto">
          {STEPS.map((step, index) => {
            const isSelected = !!selection[step.id];
            const isActive = index === activeStep;
            
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(index)}
                className={`flex items-center gap-3 p-4 transition-all border-l-4 ${
                  isActive 
                    ? 'bg-slate-800 border-cyan-500 text-white' 
                    : 'border-transparent text-slate-500 hover:bg-slate-800/50 hover:text-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-green-500/20 text-green-400' : 'bg-slate-800'}`}>
                  {isSelected ? <Check className="w-4 h-4" /> : step.icon}
                </div>
                <div className="hidden md:block text-left">
                  <span className="block text-sm font-bold">{step.label}</span>
                  <span className="text-xs opacity-60">
                    {selection[step.id] ? selection[step.id]?.name.slice(0, 15) + '...' : 'Pendiente'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Área Principal de Selección */}
        <div className="flex-1 flex flex-col bg-slate-950 relative">
          {/* Barra de Progreso Superior */}
          <div className="h-1 w-full bg-slate-800">
            <div 
              className="h-full bg-cyan-500 transition-all duration-500" 
              style={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }} 
            />
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              Selecciona: <span className="text-cyan-400">{currentStepInfo.label}</span>
            </h3>

            {loading ? (
              <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-500"/></div>
            ) : stepProducts.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
                <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                <h4 className="text-slate-300 font-bold mb-2">No hay stock disponible</h4>
                <p className="text-slate-500 mb-6">Actualmente no tenemos piezas en esta categoría.</p>
                <button 
                  onClick={() => setActiveStep(prev => Math.min(prev + 1, STEPS.length - 1))}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white text-sm"
                >
                  Saltar este paso
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {stepProducts.map(product => (
                  <div 
                    key={product.id}
                    onClick={() => handleSelect(product)}
                    className={`cursor-pointer group relative bg-slate-900 rounded-xl overflow-hidden border transition-all hover:scale-[1.02] ${
                      selection[currentStepInfo.id]?.id === product.id 
                        ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]' 
                        : 'border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="h-40 bg-white p-4 flex items-center justify-center">
                      <img src={product.image} alt={product.name} className="max-h-full object-contain" />
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-white text-sm mb-1 line-clamp-2">{product.name}</h4>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-cyan-400 font-bold text-lg">${product.price}</span>
                        {selection[currentStepInfo.id]?.id === product.id && (
                          <span className="bg-cyan-500 text-slate-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" /> Elegido
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Flotante con Resumen */}
          <div className="bg-slate-900 border-t border-slate-800 p-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 z-20">
            <div className="flex items-center gap-8 w-full md:w-auto">
              <div>
                <span className="text-slate-500 text-xs uppercase font-bold block">Total Estimado</span>
                <span className="text-2xl font-bold text-white">${totalPrice}</span>
              </div>
              <div className="hidden md:block h-8 w-px bg-slate-700" />
              <div className="hidden md:block">
                <span className="text-slate-500 text-xs uppercase font-bold block">Progreso</span>
                <span className="text-sm text-slate-300">{totalItems} de {STEPS.length} componentes</span>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                disabled={activeStep === 0}
                className="flex-1 md:flex-none px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              
              {activeStep === STEPS.length - 1 ? (
                 <button 
                  onClick={handleFinish}
                  disabled={totalItems === 0}
                  className="flex-1 md:flex-none px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 disabled:opacity-50"
                >
                  <ShoppingCart className="w-5 h-5" /> Comprar Todo
                </button>
              ) : (
                <button 
                  onClick={() => setActiveStep(prev => prev + 1)}
                  className="flex-1 md:flex-none px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-cyan-900/20"
                >
                  Siguiente
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PCBuilder;