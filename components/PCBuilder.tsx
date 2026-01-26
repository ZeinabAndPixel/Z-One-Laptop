// components/PCBuilder.tsx

import React, { useState, useEffect } from 'react';
import { 
  X, Cpu, HardDrive, Zap, Box, Monitor, CheckCircle, 
  ChevronRight, ChevronLeft, ShoppingCart, Loader2, AlertCircle 
} from 'lucide-react';
import { getProducts } from '../lib/db';
import { Product } from '../types';

// CAMBIO 1: Actualizamos la interfaz para aceptar la función de múltiples productos
interface PCBuilderProps {
  onClose: () => void;
  onAddMultipleToCart: (products: Product[]) => void;
}

const STEPS = [
  { id: 'cpu', title: 'Procesador', icon: Cpu, keywords: ['procesador', 'cpu', 'intel', 'amd', 'ryzen'] },
  { id: 'mobo', title: 'Tarjeta Madre', icon: Box, keywords: ['madre', 'motherboard', 'placa', 'mainboard'] },
  { id: 'ram', title: 'Memoria RAM', icon: HardDrive, keywords: ['ram', 'memoria', 'ddr4', 'ddr5'] },
  { id: 'gpu', title: 'Tarjeta Gráfica', icon: Monitor, keywords: ['grafica', 'gráfica', 'video', 'gpu', 'rtx', 'gtx'] },
  { id: 'storage', title: 'Almacenamiento', icon: HardDrive, keywords: ['disco', 'ssd', 'hdd', 'almacenamiento', 'nvme'] },
  { id: 'psu_case', title: 'Fuente / Gabinete', icon: Zap, keywords: ['fuente', 'poder', 'psu', 'gabinete', 'case'] },
];

// CAMBIO 2: Desestructuramos el nuevo nombre del prop (onAddMultipleToCart)
const PCBuilder: React.FC<PCBuilderProps> = ({ onClose, onAddMultipleToCart }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [selections, setSelections] = useState<Record<string, Product | null>>({});
  const [loading, setLoading] = useState(true);

  // ... (El useEffect de carga de datos se queda IGUAL) ...
  useEffect(() => {
    async function loadData() {
      try {
        const rawProducts = await getProducts();
        const cleanCatalog = rawProducts.map((p: any) => {
          let cleanPrice = 0;
          if (typeof p.precio === 'number') cleanPrice = p.precio;
          else if (typeof p.precio === 'string') cleanPrice = parseFloat(p.precio);
          if (isNaN(cleanPrice)) cleanPrice = 0;
          const cleanImage = p.imagen_url || p.image || 'https://via.placeholder.com/150';

          return {
            id: p.id,
            name: p.nombre || 'Sin Nombre',
            category: (p.categoria || '').toLowerCase(),
            brand: p.marca || 'Genérico',
            price: cleanPrice,
            rating: 5,
            image: cleanImage,
            specs: p.descripcion ? p.descripcion.split(',') : [],
            stock: p.stock || 0
          } as Product;
        });
        setCatalog(cleanCatalog.filter(p => p.stock && p.stock > 0));
      } catch (error) {
        console.error("Error cargando builder:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const currentStepData = STEPS[currentStep];

  const stepProducts = catalog.filter(p => {
    const searchString = (p.category + ' ' + p.name).toLowerCase();
    return currentStepData.keywords.some(keyword => searchString.includes(keyword));
  });

  const handleSelect = (product: Product) => {
    setSelections(prev => ({ ...prev, [currentStepData.id]: product }));
    if (currentStep < STEPS.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 300);
    }
  };

  const totalPrice = Object.values(selections).reduce((sum, item) => {
    if (!item || typeof item.price !== 'number') return sum;
    return sum + item.price;
  }, 0);

  // CAMBIO 3: Reescribimos handleFinish para usar la función correcta
  const handleFinish = () => {
    // Filtramos solo los pasos donde se seleccionó algo (quitamos los null)
    const itemsToAdd = Object.values(selections).filter((item): item is Product => item !== null);
    
    if (itemsToAdd.length > 0) {
      onAddMultipleToCart(itemsToAdd);
    }
    onClose();
  };

  // ... (El resto del return y JSX se queda IGUAL) ...
  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col font-sans text-white animate-fade-in">
       {/* ... Aquí va todo el JSX del renderizado que ya tenías ... */}
       {/* Solo asegúrate de copiar todo el contenido del return original */}
       
       {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/20 p-2 rounded-lg text-cyan-400"><Cpu className="w-6 h-6" /></div>
          <div><h2 className="text-xl font-bold">PC Builder</h2></div>
        </div>
        <button onClick={onClose}><X className="text-slate-400 hover:text-white" /></button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-20 md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto">
          {STEPS.map((step, index) => {
            const isSelected = !!selections[step.id];
            const isActive = index === currentStep;
            return (
              <button key={step.id} onClick={() => setCurrentStep(index)} className={`flex items-center gap-3 p-4 border-l-4 w-full text-left transition-all ${isActive ? 'bg-slate-800 border-cyan-500 text-white' : 'border-transparent text-slate-500'}`}>
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-green-500/20 text-green-400' : 'bg-slate-800'}`}>
                  {isSelected ? <CheckCircle className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                </div>
                <div className="hidden md:block">
                  <span className="block text-sm font-bold">{step.title}</span>
                  <span className="text-xs opacity-60 truncate block w-32">{selections[step.id]?.name || 'Pendiente'}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Área Principal */}
        <div className="flex-1 flex flex-col bg-slate-950 relative">
          <div className="h-1 w-full bg-slate-800">
            <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }} />
          </div>

          <div className="flex-1 overflow-y-auto p-6 pb-32">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="text-cyan-400">Paso {currentStep + 1}:</span> {currentStepData.title}
            </h3>

            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cyan-500 w-10 h-10" /></div>
            ) : stepProducts.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl">
                <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-400">No hay productos disponibles aquí.</p>
                <p className="text-xs text-slate-600 mt-2">(Keywords: {currentStepData.keywords.join(', ')})</p>
                <button onClick={() => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))} className="mt-4 text-cyan-400 hover:underline">Saltar paso</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stepProducts.map(product => {
                  const isSelected = selections[currentStepData.id]?.id === product.id;
                  return (
                    <div key={product.id} onClick={() => handleSelect(product)} className={`cursor-pointer bg-slate-900 border rounded-xl overflow-hidden transition-all ${isSelected ? 'border-cyan-500 ring-1 ring-cyan-500' : 'border-slate-800 hover:border-slate-600'}`}>
                      <div className="h-40 bg-white p-4 flex items-center justify-center">
                        <img src={product.image} alt={product.name} className="max-h-full object-contain" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-sm line-clamp-2 mb-2 min-h-[2.5rem]">{product.name}</h4>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-cyan-400">${(product.price || 0).toFixed(2)}</span>
                          {isSelected && <span className="text-xs bg-cyan-500 text-black px-2 py-1 rounded font-bold">Elegido</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Total */}
          <div className="absolute bottom-0 w-full bg-slate-900 border-t border-slate-800 p-4 flex justify-between items-center shadow-2xl">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-xs text-slate-500 uppercase font-bold">Total</span>
                <p className="text-2xl font-bold text-white">${totalPrice.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))} disabled={currentStep === 0} className="px-4 py-2 rounded-lg bg-slate-800 text-white disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
              {currentStep === STEPS.length - 1 ? (
                <button onClick={handleFinish} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Terminar</button>
              ) : (
                <button onClick={() => setCurrentStep(prev => prev + 1)} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold flex items-center gap-2">Siguiente <ChevronRight className="w-5 h-5" /></button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PCBuilder;