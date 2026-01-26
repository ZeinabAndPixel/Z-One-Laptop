import React, { useState, ChangeEvent } from 'react';
import { X, CheckCircle, Store, Smartphone, CreditCard, Loader2, Upload, Copy } from 'lucide-react';
import { saveOrder } from '../lib/db';
import { CartItem } from '../types'; 

interface CheckoutProps {
  cartItems: CartItem[];
  onClose: () => void;
  onClearCart: () => void;
  onOrderComplete?: (data: any) => void;
  user?: any; // <--- Nuevo prop opcional
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, onClose, onClearCart, user }) => {
  const [step, setStep] = useState<'details' | 'confirmation'>('details');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    // Si existe usuario, usa sus datos, si no, cadena vacía
    fullName: user?.nombre_completo || '', 
    cedula: user?.cedula || '',
    phone: user?.telefono || '',
    email: user?.email || '',
    address: user?.direccion || '', 
    paymentMethod: 'store',
    reference: '',
    receiptImage: ''
  });
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Manejo de carga de imagen (Convertir a Base64 simple)
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, receiptImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    // 1. Validación General
    if (!formData.fullName || !formData.cedula || !formData.phone) {
      alert("Por favor completa los campos obligatorios: Nombre, Cédula y Teléfono.");
      return;
    }

    // 2. Validación Específica de Pago Móvil
    if (formData.paymentMethod === 'pago_movil') {
      if (!formData.reference || formData.reference.length < 4) {
        alert("Por favor ingresa los últimos 4 dígitos o la referencia completa del pago.");
        return;
      }
    }

    setLoading(true);
    try {
      const newOrderId = await saveOrder({
        ...formData,
        total: total
      }, cartItems);
      
      setOrderId(newOrderId);
      setStep('confirmation');
      onClearCart();
    } catch (error: any) {
      console.error(error);
      alert(`Error al procesar el pedido: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-700 shadow-2xl p-6 relative my-8">
        
        {/* Botón Cerrar */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {step === 'details' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Store className="text-cyan-400 w-6 h-6" /> 
                Finalizar Compra
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Total a pagar: <span className="text-cyan-400 font-bold">${total}</span>
              </p>
            </div>

            {/* Formulario de Datos Personales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 uppercase font-bold">Nombre Completo <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  placeholder="Ej: Zeinab Muslumani" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-cyan-500 focus:outline-none"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 uppercase font-bold">Cédula <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  placeholder="Ej: 30123456" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-cyan-500 focus:outline-none"
                  value={formData.cedula}
                  onChange={e => setFormData({...formData, cedula: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 uppercase font-bold">Teléfono <span className="text-red-500">*</span></label>
                <input 
                  type="tel"
                  placeholder="Ej: 0414-1234567" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-cyan-500 focus:outline-none"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500 uppercase font-bold">Dirección (Opcional)</label>
                <input 
                  type="text"
                  placeholder="Ej: Urb. Los Mangos..." 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:border-cyan-500 focus:outline-none"
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                />
              </div>
            </div>

            {/* Selección de Método de Pago */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider">Método de Pago</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setFormData({...formData, paymentMethod: 'pago_movil'})}
                  className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                    formData.paymentMethod === 'pago_movil' 
                    ? 'border-cyan-500 bg-cyan-500/10 text-white ring-1 ring-cyan-500' 
                    : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <div className="text-left">
                    <span className="block font-bold text-sm">Pago Móvil / Transferencia</span>
                    <span className="block text-xs opacity-70">Reportar pago ahora</span>
                  </div>
                </button>

                <button 
                  onClick={() => setFormData({...formData, paymentMethod: 'store'})}
                  className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                    formData.paymentMethod === 'store' 
                    ? 'border-cyan-500 bg-cyan-500/10 text-white ring-1 ring-cyan-500' 
                    : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <div className="text-left">
                    <span className="block font-bold text-sm">Pagar en Tienda</span>
                    <span className="block text-xs opacity-70">Efectivo / Punto</span>
                  </div>
                </button>
              </div>
            </div>

            {/* SECCIÓN CONDICIONAL: PAGO MÓVIL */}
            {formData.paymentMethod === 'pago_movil' && (
              <div className="bg-slate-950/50 border border-slate-700 rounded-xl p-4 animate-fade-in space-y-4">
                
                {/* Datos Bancarios */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                  <h4 className="text-cyan-400 font-bold text-sm mb-3 flex items-center gap-2">
                    <Copy className="w-4 h-4" /> Datos para el pago: 
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-slate-400">Banco:</span>
                    <span className="text-white font-mono font-bold">Banesco (0134)</span>

                    
                    <span className="text-slate-400">Teléfono:</span>
                    <span className="text-white font-mono font-bold">0414-1234567</span>
                    
                    <span className="text-slate-400">Numero de Cuenta:</span>
                    <span className="text-white font-mono font-bold">0134856455225569</span>
                    
                    <span className="text-slate-400">RIF:</span>
                    <span className="text-white font-mono font-bold">J-12.345.678</span>
                    
                    <span className="text-slate-400">Monto:</span>
                    <span className="text-green-400 font-mono font-bold">${total} USD (Tasa BCV)</span>
                  </div>
                </div>

                {/* Inputs de Referencia y Captura */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 uppercase font-bold">Referencia COMPLETA <span className="text-red-500">*</span></label>
                    <input 
                      type="text"
                      placeholder="Ej: 1234" 
                      maxLength={15}
                      className="w-full bg-slate-900 border border-slate-600 rounded-xl p-3 text-white focus:border-cyan-500 focus:outline-none"
                      value={formData.reference}
                      onChange={e => setFormData({...formData, reference: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs text-slate-500 uppercase font-bold">Comprobante (Opcional)</label>
                    <label className="flex items-center justify-center w-full p-3 border border-dashed border-slate-600 rounded-xl cursor-pointer hover:bg-slate-800 transition-colors bg-slate-900">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Upload className="w-4 h-4" />
                        <span className="truncate max-w-[150px]">
                          {formData.receiptImage ? "Imagen Cargada" : "Subir Capture"}
                        </span>
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>
                {formData.receiptImage && (
                    <p className="text-[10px] text-green-400 text-center">✓ Comprobante listo para enviar</p>
                )}
              </div>
            )}

            {/* Botón Confirmar */}
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl mt-4 shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <> <Loader2 className="w-5 h-5 animate-spin" /> Procesando... </>
              ) : (
                'Confirmar Pedido'
              )}
            </button>
          </div>
        )}

        {/* Pantalla de Confirmación (Éxito) */}
        {step === 'confirmation' && (
          <div className="text-center py-8 animate-fade-in-up">
            <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-green-500/20">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-2">¡Pedido Recibido!</h2>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              {formData.paymentMethod === 'pago_movil' 
                ? "Validaremos tu pago a la brevedad." 
                : "Te esperamos en tienda para completar el pago."}
            </p>
            
            <div className="bg-slate-950 p-6 rounded-2xl max-w-sm mx-auto border border-dashed border-slate-700 mb-8 relative group">
              <p className="text-slate-500 text-xs uppercase font-bold mb-2 tracking-widest">ID de Pedido</p>
              <p className="text-lg md:text-xl font-mono font-bold text-cyan-400 break-all select-all">
                {orderId}
              </p>
            </div>

            <button onClick={onClose} className="text-cyan-400 hover:underline">
              Volver al Catálogo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;