import React, { useState, useEffect } from 'react';
import { PCBuilderPart, PartType, Product } from '../types';
import { getPCParts } from '../services/db';
import { CheckCircle2, Cpu, Settings, Disc, RefreshCw, Box, Zap, Monitor, ArrowRight, SkipForward, ShoppingCart, AlertCircle } from 'lucide-react';

interface PCBuilderProps {
  onAddConfigToCart: (parts: Product[]) => void;
}

const STEPS = [
  { id: 1, type: PartType.CPU, label: 'Procesador', icon: Cpu },
  { id: 2, type: PartType.MOTHERBOARD, label: 'Placa Base', icon: Settings },
  { id: 3, type: PartType.RAM, label: 'Memoria RAM', icon: Disc },
  { id: 4, type: PartType.GPU, label: 'Tarjeta Gráfica', icon: Monitor, optional: true },
  { id: 5, type: PartType.STORAGE, label: 'Almacenamiento', icon: Disc }, 
  { id: 6, type: PartType.PSU, label: 'Fuente de Poder', icon: Zap },
  { id: 7, type: PartType.CASE, label: 'Gabinete (Case)', icon: Box },
];

export const PCBuilder: React.FC<PCBuilderProps> = ({ onAddConfigToCart }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [partsCache, setPartsCache] = useState<Record<string, PCBuilderPart[]>>({});
  const [selectedParts, setSelectedParts] = useState<Record<string, PCBuilderPart>>({});
  const [loading, setLoading] = useState(false);

  const currentStep = STEPS[currentStepIndex];

  // Cargar partes al cambiar de paso
  useEffect(() => {
    loadPartsForStep(currentStep.type);
  }, [currentStepIndex]);

  const loadPartsForStep = async (type: PartType) => {
    if (partsCache[type]) return; 
    setLoading(true);
    const data = await getPCParts(type);
    setPartsCache(prev => ({ ...prev, [type]: data }));
    setLoading(false);
  };

  const handleSelectPart = (part: PCBuilderPart) => {
    setSelectedParts(prev => {
      // Compatibilidad CPU -> Mobo
      if (currentStep.type === PartType.CPU) {
        const { [PartType.MOTHERBOARD]: _, [PartType.RAM]: __, ...rest } = prev;
        return { ...rest, [PartType.CPU]: part };
      }
      // Compatibilidad Mobo -> RAM
      if (currentStep.type === PartType.MOTHERBOARD) {
        const { [PartType.RAM]: _, ...rest } = prev;
        return { ...rest, [PartType.MOTHERBOARD]: part };
      }
      return { ...prev, [currentStep.type]: part };
    });
    
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleSkipStep = () => {
    // Si se salta, asegurarnos de que no haya nada seleccionado para este paso
    setSelectedParts(prev => {
        const newParts = { ...prev };
        delete newParts[currentStep.type];
        return newParts;
    });

    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const resetBuilder = () => {
    setCurrentStepIndex(0);
    setSelectedParts({});
  };

  // --- LÓGICA DE FILTRADO ---
  const getFilteredParts = () => {
    const rawParts = partsCache[currentStep.type] || [];
    if (currentStep.type === PartType.MOTHERBOARD) {
      const cpu = selectedParts[PartType.CPU];
      if (cpu) return rawParts.filter(p => p.socket_type === cpu.socket_type);
    }
    if (currentStep.type === PartType.RAM) {
      const mobo = selectedParts[PartType.MOTHERBOARD];
      if (mobo) return rawParts.filter(p => p.supported_ram_type === mobo.supported_ram_type);
    }
    return rawParts;
  };

  const currentPartsList = getFilteredParts();

  // --- TOTALES Y DESCUENTO ---
  const selectedPartsList = Object.values(selectedParts) as PCBuilderPart[];
  const totalPrice = selectedPartsList.reduce((acc, p) => acc + p.price, 0);
  const discount = totalPrice * 0.05;

  const handleFinish = () => {
    const productsToAdd = selectedPartsList.map(part => ({
      product_id: part.part_id,
      name: part.name,
      price: part.price,
      category: 'component' as const,
      image_url: part.image_url,
      stock: 10
    }));
    onAddConfigToCart(productsToAdd);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR DE PROGRESO */}
        <div className="w-full lg:w-1/4">
           <div className="sticky top-24 space-y-6">
              <div className="glass-panel p-6 rounded-lg border-l-4 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                <h2 className="text-2xl font-bold text-white mb-1">Constructor PC</h2>
                <p className="text-xs text-cyan-400 mb-4 font-mono uppercase">Descuento Kit -5% Aplicado</p>
                <div className="text-3xl font-light text-white">${totalPrice.toLocaleString()}</div>
                <div className="text-sm text-green-400">Ahorras: ${discount.toLocaleString()}</div>
              </div>

              <div className="space-y-1 bg-slate-900 rounded-lg p-2 border border-slate-800">
                {STEPS.map((step, idx) => {
                  const isCompleted = !!selectedParts[step.type];
                  const isCurrent = idx === currentStepIndex;
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStepIndex(idx)}
                      className={`w-full flex items-center p-3 rounded transition-all ${
                        isCurrent ? 'bg-cyan-900/30 border-l-2 border-cyan-500' : 'hover:bg-slate-800'
                      }`}
                    >
                      <step.icon className={`w-4 h-4 mr-3 ${isCompleted ? 'text-green-500' : isCurrent ? 'text-cyan-400' : 'text-slate-600'}`} />
                      <div className="text-left flex-1">
                        <div className={`text-sm font-medium ${isCurrent ? 'text-white' : 'text-slate-400'}`}>
                            {step.label}
                            {step.optional && <span className="ml-2 text-[10px] text-slate-500 uppercase border border-slate-700 px-1 rounded">Opcional</span>}
                        </div>
                        {selectedParts[step.type] && (
                          <div className="text-[10px] text-slate-500 truncate max-w-[150px]">{selectedParts[step.type].name}</div>
                        )}
                      </div>
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2">
                <button onClick={resetBuilder} className="flex-1 flex items-center justify-center p-3 rounded border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                  <RefreshCw className="w-4 h-4 mr-2" /> Reiniciar
                </button>
                {/* Habilitar botón si se completaron los pasos críticos (Todos menos GPU opcional) */}
                {Object.keys(selectedParts).length >= (STEPS.length - 1) && (
                   <button onClick={handleFinish} className="flex-1 flex items-center justify-center p-3 rounded bg-cyan-600 text-white hover:bg-cyan-500 font-bold shadow-lg transition-colors animate-pulse">
                     <ShoppingCart className="w-4 h-4 mr-2" /> Añadir Kit
                   </button>
                )}
              </div>
           </div>
        </div>

        {/* ÁREA DE SELECCIÓN */}
        <div className="w-full lg:w-3/4">
          <div className="glass-panel p-6 rounded-lg min-h-[600px] flex flex-col">
             <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
               <div>
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <currentStep.icon className="w-6 h-6 text-cyan-500" />
                    Paso {currentStepIndex + 1}: {currentStep.label}
                  </h3>
                  {currentStep.optional && (
                      <div className="flex items-center mt-2 text-sm text-slate-400">
                          <AlertCircle className="w-4 h-4 mr-2 text-cyan-500" />
                          Este componente no es obligatorio para el funcionamiento básico.
                      </div>
                  )}
               </div>
               
               {currentStep.optional && (
                 <button 
                    onClick={handleSkipStep} 
                    className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors border border-slate-700 hover:border-cyan-500"
                 >
                   Omitir este paso <SkipForward className="w-4 h-4 ml-2" />
                 </button>
               )}
             </div>

             {loading ? (
               <div className="flex-1 flex items-center justify-center text-cyan-500 animate-pulse">
                 Consultando inventario compatible...
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                 {currentPartsList.length > 0 ? (
                   currentPartsList.map(part => (
                     <div 
                        key={part.part_id} 
                        onClick={() => handleSelectPart(part)} 
                        className={`bg-slate-950 p-4 rounded border cursor-pointer flex justify-between items-center group transition-all relative overflow-hidden ${selectedParts[currentStep.type]?.part_id === part.part_id ? 'border-cyan-500 ring-1 ring-cyan-500' : 'border-slate-800 hover:border-cyan-500'}`}
                      >
                       <div className="flex items-center gap-4 relative z-10">
                         <div className="w-16 h-16 bg-slate-900 rounded flex items-center justify-center text-slate-600">
                           <img src={part.image_url} className="w-full h-full object-cover rounded opacity-80" alt="" />
                         </div>
                         <div>
                            <div className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{part.name}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              {part.socket_type && <span className="mr-2">Socket: {part.socket_type}</span>}
                              {part.wattage && <span>{part.wattage}W</span>}
                            </div>
                         </div>
                       </div>
                       <div className="text-right relative z-10">
                          <div className="text-cyan-500 font-mono text-lg font-bold">${part.price}</div>
                          <button className="text-xs text-slate-500 group-hover:text-white mt-1 flex items-center justify-end w-full">
                            Seleccionar <ArrowRight className="w-3 h-3 ml-1" />
                          </button>
                       </div>
                       <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/5 transition-colors z-0" />
                     </div>
                   ))
                 ) : (
                   <div className="col-span-2 text-center py-12 text-slate-500 italic border border-dashed border-slate-800 rounded">
                     No se encontraron componentes compatibles.
                     <button onClick={() => setCurrentStepIndex(prev => prev - 1)} className="block mx-auto mt-4 text-cyan-500 hover:underline">
                       Volver atrás
                     </button>
                   </div>
                 )}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};