import React, { useState, useEffect, useMemo } from 'react';
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

// --- TIPOS (Definidos aquí para asegurar compatibilidad) ---
export interface Product {
  id: string | number; // Acepta UUID de Neon
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

// --- CONFIGURACIÓN ---
// Mapeo exacto entre los IDs de tus pasos y los nombres en tu Base de Datos Neon
const DB_CATEGORY_MAP: Record<string, string> = {
  cpu: 'Procesadores',
  mobo: 'Tarjetas Madre',
  ram: 'RAM',
  gpu: 'Gráficas',
  storage: 'Almacenamiento',
  psu_case: 'Fuentes de Poder' // La API debe manejar traer también Gabinetes si es necesario
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
  // --- ESTADOS ---
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, Product>>({});
  
  // Estado para datos remotos
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado de UI
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const currentStep = STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === STEPS.length - 1;

  // --- EFECTO: CARGAR DATOS DE NEON ---
  useEffect(() => {
    let isMounted = true; // Prevenir actualizaciones si el componente se desmonta

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      setProducts([]); // Limpiar productos anteriores visualmente

      try {
        const categoryParam = DB_CATEGORY_MAP[currentStep.id];
        if (!categoryParam) throw new Error("Categoría no mapeada");

        // IMPORTANTE: Asegúrate de que esta URL coincida con tu endpoint local o de producción
       
// ✅ BIEN: Esto llama a tu API funcionando (tanto en local como en la nube)
const response = await fetch(`/api/products?categoria=${encodeURIComponent(categoryParam)}`);
        if (!response.ok) {
          throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();

        if (isMounted) {
          // Transformación segura de datos (Neon -> Frontend)
          const adaptedProducts: Product[] = Array.isArray(data) ? data.map((item: any) => ({
            id: item.id,
            name: item.nombre || 'Producto sin nombre',
            brand: item.marca || 'Genérico',
            category: item.categoria,
            price: Number(item.precio) || 0, // Asegurar que sea número
            rating: 5, // Valor por defecto
            image: item.imagen_url || 'https://placehold.co/400x400?text=No+Image',
            // Convertir la descripción de texto a array, manejando nulos
            specs: item.descripcion ? item.descripcion.split(',').map((s: string) => s.trim()) : ['Estándar']
          })) : [];

          setProducts(adaptedProducts);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Error fetching parts:", err);
          setError(err.message || "Error al conectar con la base de datos");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => { isMounted = false; };
  }, [currentStep.id]);


  // --- HANDLERS ---
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
  //                                👇 Agregamos ": number" aquí
  return Object.values(selections).reduce((sum: number, item: Product) => sum + item.price, 0);
};

  const isStepComplete = (stepId: string) => !!selections[stepId];

  // --- RENDER ---
  
  // Modal de Confirmación de Salida
  if (showExitConfirm) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl max-w-md w-full shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">¿Estás seguro de salir?</h3>
            <p className="text-slate-400 mb-6">Perderás el progreso de tu configuración actual.</p>
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors"
              >
                Continuar
              </button>
              <button 
                onClick={onClose}
                className="flex-1 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 font-bold rounded-xl transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col overflow-hidden text-white">
      {/* HEADER */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/10 p-2 rounded-lg">
            <Cpu className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold">PC Builder Studio</h2>
            <p className="text-xs text-slate-400">Armado inteligente con Neon DB</p>
          </div>
        </div>
        <button 
          onClick={() => setShowExitConfirm(true)}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        
        {/* PANEL IZQUIERDO (Pasos y Productos) */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* BARRA DE PROGRESO (Scrollable) */}
          <div className="bg-slate-900/50 p-4 overflow-x-auto border-b border-slate-800">
            <div className="flex items-center min-w-max px-2 gap-4">
              {STEPS.map((step, idx) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
                    currentStepIndex === idx 
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' 
                      : selections[step.id] 
                        ? 'bg-green-500/10 border-green-500/50 text-green-400'
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}>
                    {selections[step.id] ? <CheckCircle className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                    <span className="text-sm font-bold whitespace-nowrap">{step.title}</span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`w-8 h-0.5 ml-4 ${idx < currentStepIndex ? 'bg-cyan-500/30' : 'bg-slate-800'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* GRID DE PRODUCTOS */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-5xl mx-auto">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{currentStep.title}</h3>
                <p className="text-slate-400">{currentStep.desc}</p>
              </div>

              {/* ESTADO LOADING */}
              {loading && (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
                  <p>Cargando componentes desde Neon...</p>
                </div>
              )}

              {/* ESTADO ERROR */}
              {!loading && error && (
                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl text-center">
                  <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-2" />
                  <p className="text-red-400 mb-4">{error}</p>
                  <button 
                    onClick={() => setCurrentStepIndex(currentStepIndex)} // Re-trigger effect
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              )}

              {/* ESTADO VACÍO */}
              {!loading && !error && products.length === 0 && (
                <div className="text-center text-slate-500 py-20 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
                  <p>No se encontraron productos disponibles en esta categoría.</p>
                </div>
              )}

              {/* LISTA DE PRODUCTOS */}
              {!loading && !error && products.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                  {products.map(product => {
                    const isSelected = selections[currentStep.id]?.id === product.id;
                    return (
                      <div 
                        key={product.id}
                        onClick={() => handleSelectProduct(product)}
                        className={`relative group cursor-pointer bg-slate-800/40 rounded-2xl border-2 transition-all duration-300 overflow-hidden flex flex-row h-40 ${
                          isSelected 
                            ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)] bg-slate-800' 
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="w-1/3 bg-white p-3 flex items-center justify-center">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Img';
                            }} 
                          />
                        </div>
                        <div className="flex-1 p-4 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-bold leading-tight mb-1 line-clamp-2">{product.name}</h4>
                              {isSelected && <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0" />}
                            </div>
                            <p className="text-xs text-slate-400 mb-2 line-clamp-1">
                              {product.brand} • {product.specs[0]}
                            </p>
                          </div>
                          <div className="flex justify-between items-end">
                            <span className="text-xl font-bold text-cyan-400">${product.price.toLocaleString()}</span>
                            <button className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              isSelected ? 'bg-cyan-500 text-slate-900' : 'bg-slate-700 text-white group-hover:bg-slate-600'
                            }`}>
                              {isSelected ? 'Seleccionado' : 'Seleccionar'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* BARRA DE NAVEGACIÓN INFERIOR */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-between items-center z-10">
            <button 
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 flex items-center gap-2 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" /> Anterior
            </button>
            
            <div className="flex items-center gap-4">
              {/* Total visible en móvil */}
              <div className="lg:hidden flex flex-col items-end mr-2">
                 <span className="text-xs text-slate-400">Total</span>
                 <span className="text-lg font-bold text-cyan-400">${calculateTotal().toLocaleString()}</span>
              </div>

              {isLastStep ? (
                <button 
                  onClick={handleFinish}
                  disabled={!isStepComplete(currentStep.id)}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Terminar <Plus className="w-5 h-5" />
                </button>
              ) : (
                <button 
                  onClick={handleNext}
                  disabled={!isStepComplete(currentStep.id)}
                  className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* PANEL DERECHO (Resumen) - Visible solo en Desktop */}
        <div className="hidden lg:flex w-96 bg-slate-900 border-l border-slate-800 flex-col">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-xl font-bold mb-1">Tu Configuración</h3>
            <p className="text-sm text-slate-400">Resumen en tiempo real</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {STEPS.map(step => {
              const selectedItem = selections[step.id];
              return (
                <div key={step.id} className={`p-4 rounded-xl border transition-all ${
                  selectedItem ? 'bg-slate-800/50 border-cyan-500/30' : 'bg-slate-900 border-slate-800 border-dashed'
                }`}>
                  <div className="flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <step.icon className="w-3 h-3" /> {step.title}
                  </div>
                  {selectedItem ? (
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-white mb-1 line-clamp-1">{selectedItem.name}</p>
                        <p className="text-xs text-slate-400">{selectedItem.brand}</p>
                      </div>
                      <p className="text-sm font-bold text-cyan-400">${selectedItem.price}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600 italic">Pendiente...</p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-6 bg-slate-950 border-t border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-400">Total Estimado</span>
              <span className="text-3xl font-bold text-white font-mono">${calculateTotal().toLocaleString()}</span>
            </div>
            {isLastStep && isStepComplete(currentStep.id) && (
              <p className="text-xs text-green-400 text-center animate-pulse">
                ¡Listo para agregar al carrito!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PCBuilder;