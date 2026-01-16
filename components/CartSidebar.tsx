import React, { useState, useEffect } from 'react';
import { X, Trash2, ShoppingBag, CreditCard, Loader2, Wrench, PackageCheck, Truck, Receipt, ArrowLeft, CheckCircle2, Plus, Minus } from 'lucide-react';
import { CartItem, DeliveryMethod, PaymentMethod, CheckoutData, User } from '../types';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  user: User | null;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onCheckout: (data: CheckoutData) => Promise<void>;
}

type CheckoutStep = 'cart' | 'details' | 'confirmation';

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, items, user, onRemove, onUpdateQuantity, onCheckout }) => {
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Logic States
  const [wantsAssembly, setWantsAssembly] = useState(false);
  
  // Form States
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pago_movil');
  const [formData, setFormData] = useState({
    fullName: '',
    cedula: '',
    fiscalAddress: '',
    phone: '',
    shippingAddress: '',
    paymentReference: ''
  });

  // Pre-fill data if user exists
  useEffect(() => {
    if (user && user.customer_data) {
      setFormData(prev => ({
        ...prev,
        fullName: user.customer_data?.full_name || '',
        cedula: user.customer_data?.cedula || '',
        fiscalAddress: user.customer_data?.address || '',
        phone: user.customer_data?.phone || ''
      }));
    }
  }, [user]);

  // --- CALCULOS FINANCIEROS ---
  const hasBuilderParts = items.some(i => i.isBuilderPart);
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Descuento del 5% solo si hay piezas de builder
  const builderSubtotal = items.filter(i => i.isBuilderPart).reduce((acc, i) => acc + (i.price * i.quantity), 0);
  const discountAmount = hasBuilderParts ? builderSubtotal * 0.05 : 0;
  
  const assemblyCost = (hasBuilderParts && wantsAssembly) ? 30 : 0;
  const taxableAmount = subtotal - discountAmount + assemblyCost;
  const taxAmount = taxableAmount * 0.16; // 16% IVA
  const finalTotal = taxableAmount + taxAmount;

  // --- HANDLERS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      alert("Por favor inicia sesión para continuar.");
      onClose(); 
      return;
    }
    setStep('details');
  };

  const handleFinalize = async () => {
    // Validaciones Estrictas
    if (!formData.fullName || !formData.cedula || !formData.fiscalAddress) {
      alert("Error: Los datos de facturación (Nombre, Cédula y Dirección) son obligatorios.");
      return;
    }
    if (deliveryMethod === 'delivery' && !formData.shippingAddress) {
      alert("Error: Por favor ingresa la dirección exacta para el Delivery.");
      return;
    }
    if (paymentMethod !== 'cash' && !formData.paymentReference) {
      alert("Error: El número de referencia es obligatorio para pagos digitales.");
      return;
    }

    setIsProcessing(true);
    
    const checkoutPayload: CheckoutData = {
      items,
      subtotal,
      discount: discountAmount,
      assemblyCost,
      tax: taxAmount,
      total: finalTotal,
      customer: {
        fullName: formData.fullName,
        cedula: formData.cedula,
        fiscalAddress: formData.fiscalAddress,
        phone: formData.phone
      },
      delivery: {
        method: deliveryMethod,
        shippingAddress: deliveryMethod === 'delivery' ? formData.shippingAddress : undefined
      },
      payment: {
        method: paymentMethod,
        reference: paymentMethod !== 'cash' ? formData.paymentReference : undefined
      }
    };

    await onCheckout(checkoutPayload);
    setIsProcessing(false);
    setStep('cart');
    setFormData(prev => ({ ...prev, paymentReference: '' }));
  };

  // --- RENDERIZADO ---
  return (
    <div className={`fixed inset-0 z-[60] flex justify-end transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className={`relative w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl transform transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {step === 'details' && (
              <button onClick={() => setStep('cart')} className="mr-2 text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <ShoppingBag className="w-5 h-5 text-cyan-500" />
            {step === 'cart' ? 'Tu Carrito' : 'Finalizar Pedido'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* --- STEP 1: CART REVIEW --- */}
        {step === 'cart' && (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                  <ShoppingBag className="w-16 h-16 opacity-20" />
                  <p>Tu carrito está vacío.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.product_id} className={`flex gap-4 bg-slate-950/50 p-4 rounded-lg border relative ${item.isBuilderPart ? 'border-cyan-900/50' : 'border-slate-800'}`}>
                    {item.isBuilderPart && (
                       <span className="absolute -top-2 -right-2 bg-cyan-900 text-cyan-200 text-[10px] px-2 py-0.5 rounded-full border border-cyan-700 shadow-sm">Kit Builder -5%</span>
                    )}
                    <div className="w-20 h-20 bg-slate-900 rounded overflow-hidden flex-shrink-0">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white line-clamp-1">{item.name}</h3>
                        <p className="text-xs text-slate-400 mt-1">{item.category}</p>
                      </div>
                      
                      <div className="flex justify-between items-end mt-2">
                         {/* Cantidad Controls */}
                         <div className="flex items-center space-x-2 bg-slate-900 rounded border border-slate-800">
                           <button 
                             onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                             className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-l"
                           >
                             <Minus className="w-3 h-3" />
                           </button>
                           <span className="text-xs font-mono font-bold text-white w-4 text-center">{item.quantity}</span>
                           <button 
                             onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                             className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-r"
                           >
                             <Plus className="w-3 h-3" />
                           </button>
                         </div>

                         <div className="text-right">
                           <div className="text-cyan-400 font-mono text-sm">${(item.price * item.quantity).toLocaleString()}</div>
                           <button onClick={() => onRemove(item.product_id)} className="text-[10px] text-slate-500 hover:text-red-400 mt-1 flex items-center gap-1 ml-auto">
                              <Trash2 className="w-3 h-3" /> Eliminar
                           </button>
                         </div>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Assembly Option */}
              {items.length > 0 && hasBuilderParts && (
                <div className="mt-4 p-4 bg-slate-950/80 border border-slate-700 rounded-lg">
                   <label className="flex items-start space-x-3 cursor-pointer group">
                     <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${wantsAssembly ? 'bg-cyan-600 border-cyan-600' : 'border-slate-600 group-hover:border-slate-400'}`}>
                       {wantsAssembly && <PackageCheck className="w-3 h-3 text-white" />}
                     </div>
                     <input type="checkbox" className="hidden" checked={wantsAssembly} onChange={(e) => setWantsAssembly(e.target.checked)} />
                     <div className="flex-1">
                       <div className="text-sm font-bold text-white flex items-center gap-2">
                         <Wrench className="w-4 h-4 text-cyan-500" /> Servicio de Armado Profesional
                       </div>
                       <p className="text-xs text-slate-400 mt-1">Gestión de cables, pasta térmica premium y pruebas de estrés.</p>
                       <p className="text-sm font-mono text-cyan-400 font-bold mt-1">+$30.00 USD</p>
                     </div>
                   </label>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900">
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-400">Total Estimado</span>
                <span className="text-2xl font-bold text-white font-mono">${finalTotal.toLocaleString()}</span>
              </div>
              <button 
                disabled={items.length === 0}
                onClick={handleProceedToCheckout}
                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold py-4 rounded flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)]"
              >
                CONTINUAR COMPRA
              </button>
            </div>
          </>
        )}

        {/* --- STEP 2: CHECKOUT FORM --- */}
        {step === 'details' && (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* 1. Datos de Facturación */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-white font-bold border-b border-slate-800 pb-2">
                  <Receipt className="w-5 h-5 text-cyan-500" /> Datos de Facturación (Obligatorio)
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs text-slate-400 block mb-1">Nombre Completo</label>
                    <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm focus:border-cyan-500 outline-none" placeholder="Nombre Legal" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Cédula / RIF (PK)</label>
                    <input name="cedula" value={formData.cedula} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm focus:border-cyan-500 outline-none" placeholder="V-12345678" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Teléfono</label>
                    <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm focus:border-cyan-500 outline-none" placeholder="0414-0000000" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-slate-400 block mb-1">Dirección Fiscal</label>
                    <input name="fiscalAddress" value={formData.fiscalAddress} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm focus:border-cyan-500 outline-none" placeholder="Dirección para la factura" />
                  </div>
                </div>
              </section>

              {/* 2. Logística */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-white font-bold border-b border-slate-800 pb-2">
                  <Truck className="w-5 h-5 text-cyan-500" /> Método de Entrega
                </div>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 bg-slate-950 rounded border border-slate-800 cursor-pointer hover:border-cyan-500/50 transition-colors">
                    <input type="radio" name="delivery" checked={deliveryMethod === 'pickup'} onChange={() => setDeliveryMethod('pickup')} className="accent-cyan-500" />
                    <div>
                      <span className="block text-sm text-white font-medium">Retirar en Tienda (Gratis)</span>
                      <span className="block text-xs text-cyan-400 font-bold">Sede Principal: El Tigre, Anzoátegui</span>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 p-3 bg-slate-950 rounded border border-slate-800 cursor-pointer hover:border-cyan-500/50 transition-colors">
                    <input type="radio" name="delivery" checked={deliveryMethod === 'delivery'} onChange={() => setDeliveryMethod('delivery')} className="accent-cyan-500" />
                    <div>
                      <span className="block text-sm text-white font-medium">Solicitar Delivery / Encomienda</span>
                      <span className="block text-xs text-slate-500">Cobro a Destino (Zoom / Tealca / MRW)</span>
                    </div>
                  </label>
                </div>
                {deliveryMethod === 'delivery' && (
                  <div className="animate-fade-in">
                    <label className="text-xs text-slate-400 block mb-1">Dirección de Entrega Exacta</label>
                    <textarea name="shippingAddress" value={formData.shippingAddress} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm h-20 focus:border-cyan-500 outline-none" placeholder="Estado, Ciudad, Oficina de Encomienda..." />
                  </div>
                )}
              </section>

              {/* 3. Pago */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-white font-bold border-b border-slate-800 pb-2">
                  <CreditCard className="w-5 h-5 text-cyan-500" /> Pasarela de Pago
                </div>
                <div>
                   <label className="text-xs text-slate-400 block mb-1">Método de Pago</label>
                   <select 
                      value={paymentMethod} 
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm mb-3 focus:border-cyan-500 outline-none"
                   >
                      <option value="pago_movil">Pago Móvil</option>
                      <option value="zelle">Zelle</option>
                      <option value="transfer">Transferencia Bancaria</option>
                      <option value="cash">Efectivo (En Tienda)</option>
                   </select>
                   
                   {paymentMethod !== 'cash' && (
                     <div className="animate-fade-in">
                       <label className="text-xs text-cyan-500 block mb-1 font-bold">Número de Referencia *</label>
                       <input name="paymentReference" value={formData.paymentReference} onChange={handleInputChange} className="w-full bg-slate-950 border border-cyan-500/50 rounded p-2 text-white text-sm focus:border-cyan-500 outline-none" placeholder="Ej: 123456" />
                     </div>
                   )}
                </div>
              </section>

              {/* Resumen Final */}
              <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2 shadow-lg">
                 <div className="flex justify-between text-xs text-slate-400">
                    <span>Subtotal</span> <span>${subtotal.toLocaleString()}</span>
                 </div>
                 {discountAmount > 0 && (
                   <div className="flex justify-between text-xs text-green-400 font-bold">
                      <span>Descuento Kit (5%)</span> <span>-${discountAmount.toLocaleString()}</span>
                   </div>
                 )}
                 {assemblyCost > 0 && (
                   <div className="flex justify-between text-xs text-cyan-400">
                      <span>Servicio de Armado</span> <span>+${assemblyCost.toLocaleString()}</span>
                   </div>
                 )}
                 <div className="flex justify-between text-xs text-slate-400">
                    <span>IVA (16%)</span> <span>${taxAmount.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-lg font-bold text-white border-t border-slate-800 pt-2 mt-2">
                    <span>TOTAL A PAGAR</span> <span>${finalTotal.toLocaleString()}</span>
                 </div>
              </div>

            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900">
               <button 
                onClick={handleFinalize}
                disabled={isProcessing}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                CONFIRMAR PEDIDO
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};