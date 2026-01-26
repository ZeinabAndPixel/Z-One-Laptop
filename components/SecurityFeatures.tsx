import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, Lock } from 'lucide-react';

/**
 * Banner estático en la parte superior (No fijo, empuja el contenido)
 */
export const SecurityBanner: React.FC = () => {
  return (
    <div className="w-full bg-orange-600 text-white text-[10px] md:text-xs font-bold text-center py-2 px-4 uppercase tracking-widest flex items-center justify-center gap-2 relative z-50">
      <ShieldAlert className="w-3 h-3 md:w-4 md:h-4" />
      <span>Sitio de Prueba - No usar datos reales - Proyecto Académico</span>
    </div>
  );
};

/**
 * Modal de bloqueo inicial con advertencia académica
 */
export const SecurityModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Verificar si el usuario ya aceptó la advertencia en esta sesión/browser
    const hasAccepted = localStorage.getItem('security_warning_accepted');
    if (!hasAccepted) {
      // Pequeño delay para asegurar que el DOM esté listo y la animación se vea bien
      const timer = setTimeout(() => setIsOpen(true), 100);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('security_warning_accepted', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Overlay Oscuro Bloqueante */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md" />

      {/* Tarjeta del Modal */}
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-lg w-full shadow-2xl animate-fade-in-up">
        
        {/* Icono Header */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/30">
            <AlertTriangle className="w-10 h-10 text-orange-500" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-4 tracking-tight">
          ⚠️ AVISO DE PROYECTO ACADÉMICO
        </h2>

        <div className="space-y-4 text-slate-300 text-sm leading-relaxed mb-8">
          <p className="text-center">
            Estás accediendo a una <strong>simulación de tienda electrónica</strong> desarrollada exclusivamente con fines educativos y de demostración técnica.
          </p>
          
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex gap-3 items-start">
            <Lock className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li>No ingrese datos personales reales.</li>
              <li>No ingrese números de tarjetas de crédito reales.</li>
              <li>No se procesarán transacciones ni se realizarán envíos.</li>
            </ul>
          </div>
        </div>

        <button
          onClick={handleAccept}
          className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-extrabold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-[0.98] uppercase tracking-wide"
        >
          Entiendo y deseo continuar
        </button>
        
        <p className="mt-4 text-center text-xs text-slate-600">
          Al continuar, aceptas que este es un entorno de prueba sin valor comercial.
        </p>
      </div>
    </div>
  );
};