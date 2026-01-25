import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Cpu, 
  HardDrive, 
  Zap, 
  Box, 
  Monitor, 
  CheckCircle, 
  AlertTriangle, 
  Plus,
  Loader2
} from 'lucide-react';

export interface Product {
  id: string | number;
  name: string;
  category: string;
  brand: string;
  price: number;
  rating: number;
  image: string;
  specs: string[];
}

interface PCBuilderProps {
  onClose: () => void;
  onAddMultipleToCart: (products: Product[]) => void;
}

// --- CORRECCIÓN CLAVE: NOMBRES EXACTOS DE LA BASE DE DATOS ---
const DB_CATEGORY_MAP: Record<string, string> = {
  cpu: 'Procesadores',
  mobo: 'Tarjetas Madre',
  ram: 'Memorias RAM',       // <--- Antes decía 'RAM', por eso no las encontraba
  gpu: 'Tarjetas Gráficas',  // <--- Antes decía 'Gráficas', por eso salían cosas raras o nada
  storage: 'Almacenamiento',
  psu_case: 'Fuentes de Poder'
};

const STEPS = [
  { id: 'cpu', title: 'Procesador', icon: Cpu, desc: 'El cerebro de tu computadora' },
  { id: 'mobo', title: 'Tarjeta Madre', icon: Box, desc: 'La base de conectividad' },
  { id: 'ram', title: 'Memoria RAM', icon: HardDrive, desc: 'Multitarea y velocidad' },
  { id: 'gpu', title: 'Tarjeta de Video', icon: Monitor, desc: 'Potencia gráfica pura' },
  { id: 'storage', title: 'Almacenamiento', icon: HardDrive, desc: 'Espacio para tus juegos' },
  { id: 'psu_case', title: 'Fuente & Gabinete', icon: Zap, desc: 'Energía y Estilo' },
];

const PCBuilder: React.FC<PCBuilderProps> = ({ onClose, onAddMultipleToCart }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, Product>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const currentStep = STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === STEPS.length - 1;

  // --- CARGAR DATOS ---
  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      
      // Limpiamos la lista ANTES de cargar para que no veas los productos del paso anterior
      setProducts([]); 

      try {
        const categoryParam = DB_CATEGORY_MAP[currentStep.id];
        
        // Llamamos a la API
        const response = await fetch(`/api/products?categoria=${encodeURIComponent(categoryParam)}`);
        
        if (!response.ok) throw new Error("Error al conectar con inventario");

        const data = await response.json();

        if (isMounted) {
          const adaptedProducts: Product[] = Array.isArray(data) ? data.map((item: any) => ({
            id: item.id,
            name: item.nombre,
            brand: item.marca,
            category: item.categoria,
            price: Number(item.precio),
            rating: 5,
            image: item.imagen_url,
            specs: item.descripcion ? item.descripcion.split(',') : ['Estándar']
          })) : [];

          // Filtro extra de seguridad: Mostrar solo si hay stock (opcional, pero recomendado)
          // const inStock = adaptedProducts.filter((p: any) => p.stock > 0);
          
          setProducts(adaptedProducts);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error(err);
          setError("No se pudo cargar el inventario.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => { isMounted = false; };
  }, [currentStep.id]); // Se ejecuta cada vez que cambia el paso

  const handleSelectProduct = (product: Product) => {
    setSelections(prev => ({ ...prev, [currentStep.id]: product }));
  };

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    const parts = Object.values(selections);
    if (parts.length > 0) {
      onAddMultipleToCart(parts);
      onClose();
    }
  };

  const calculateTotal = () => {
    return Object.values(selections).reduce((sum, item) => sum + <item className="precio"></item>, 0);
  };

  const isStepComplete = (stepId: string) => !!selections[stepId];

  // --- INTERFAZ ---
  if (showExitConfirm) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl max-w-md w-full shadow-2xl">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">¿Salir del Armador?</h3>
            <p className="text-slate-400 mb-6">Perderás el progreso actual.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowExitConfirm(false)} className="flex-1 py-3 bg-slate-800 text-white font-bold rounded-xl">Cancelar</button>
              <button onClick={onClose} className="flex-1 py-3 bg-red-500/10 text-red-500 font-bold rounded-xl">Salir</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col text-white animate-fade-in">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/10 p-2 rounded-lg"><Cpu className="w-6 h-6 text-cyan-400" /></div>
          <div><h2 className="text-lg font-bold">PC Builder</h2><p className="text-xs text-slate-400">Arma tu equipo ideal</p></div>
        </div>
        <button onClick={() => setShowExitConfirm(true)}><X className="text-slate-400 hover:text-white" /></button>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Área Principal */}
        <div className="flex-1 flex flex-col relative">
          
          {/* Barra de Pasos */}
          <div className="bg-slate-900/50 p-4 overflow-x-auto border-b border-slate-800">
            <div className="flex items-center gap-4 min-w-max">
              {STEPS.map((step, idx) => (
                <div key={step.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                  currentStepIndex === idx ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 
                  selections[step.id] ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}>
                  {selections[step.id] ? <CheckCircle className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                  <span className="text-sm font-bold">{step.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grid de Productos */}
          <div className="flex-1 overflow-y-auto p-6">
            <h3 className="text-2xl font-bold mb-2">{currentStep.title}</h3>
            <p className="text-slate-400 mb-6">{currentStep.desc}</p>

            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-cyan-500" /></div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
                <p className="text-slate-500">No hay productos disponibles en esta categoría.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
                {products.map(product => {
                  const isSelected = selections[currentStep.id]?.id === product.id;
                  return (
                    <div key={product.id} onClick={() => handleSelectProduct(product)}
                      className={`cursor-pointer bg-slate-800/40 rounded-xl border-2 flex p-2 h-32 transition-all ${
                        isSelected ? 'border-cyan-500 bg-slate-800 shadow-lg shadow-cyan-500/20' : 'border-slate-700 hover:border-slate-500'
                      }`}>
                      <div className="w-32 bg-white rounded-lg p-2 flex items-center justify-center">
                        <img src={product.image} className="max-h-full max-w-full object-contain" alt="" />
                      </div>
                      <div className="flex-1 px-4 py-2 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold line-clamp-1">{product.name}</h4>
                          <p className="text-xs text-slate-400">{product.brand}</p>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-xl font-bold text-cyan-400">${product.price}</span>
                          {isSelected && <span className="bg-cyan-500 text-slate-900 text-xs font-bold px-2 py-1 rounded">Elegido</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer de Navegación */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center">
            <button onClick={handleBack} disabled={currentStepIndex === 0} className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white disabled:opacity-50">
              <ChevronLeft className="w-5 h-5 inline" /> Anterior
            </button>
            <div className="flex items-center gap-4">
              <div className="lg:hidden text-right">
                <span className="text-xs text-slate-400 block">Total</span>
                <span className="font-bold text-cyan-400">${calculateTotal()}</span>
              </div>
              {isLastStep ? (
                <button onClick={handleFinish} disabled={!isStepComplete(currentStep.id)} className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl flex items-center gap-2 disabled:opacity-50">
                  Terminar <Plus className="w-5 h-5" />
                </button>
              ) : (
                <button onClick={handleNext} disabled={!isStepComplete(currentStep.id)} className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl flex items-center gap-2 disabled:opacity-50">
                  Siguiente <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Panel Derecho (Resumen) - Solo Desktop */}
        <div className="hidden lg:flex w-80 bg-slate-900 border-l border-slate-800 flex-col">
          <div className="p-6 border-b border-slate-800"><h3 className="font-bold">Resumen</h3></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {STEPS.map(step => (
              <div key={step.id} className={`p-3 rounded-lg border text-sm ${selections[step.id] ? 'bg-slate-800 border-cyan-500/30' : 'border-slate-800 border-dashed'}`}>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-1">
                  <step.icon className="w-3 h-3" /> {step.title}
                </div>
                {selections[step.id] ? (
                  <div className="flex justify-between">
                    <span className="truncate w-32 font-bold">{selections[step.id].name}</span>
                    <span className="text-cyan-400">${selections[step.id].price}</span>
                  </div>
                ) : <span className="text-slate-600 italic">Pendiente...</span>}
              </div>
            ))}
          </div>
          <div className="p-6 bg-slate-950 border-t border-slate-800">
            <div className="flex justify-between items-end">
              <span className="text-slate-400">Total</span>
              <span className="text-3xl font-bold font-mono">${calculateTotal()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PCBuilder;