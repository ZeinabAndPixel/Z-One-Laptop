import React from 'react';
import { X, Trash2, ShoppingBag, Plus, Minus, Zap } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string | number, delta: number) => void;
  onRemoveItem: (id: string | number) => void;
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem,
  onCheckout
}) => {
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-fade-in" 
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-slate-900 h-full shadow-2xl border-l border-slate-800 flex flex-col animate-fade-in-up" style={{animationDuration: '0.3s'}}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-cyan-400" />
            Tu Carrito ({totalItems})
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center border border-slate-700">
                <ShoppingBag className="w-10 h-10 opacity-30" />
              </div>
              <p>Tu carrito está vacío</p>
              <button 
                onClick={onClose}
                className="text-cyan-400 hover:text-cyan-300 font-medium text-sm"
              >
                Volver a la tienda
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 animate-fade-in-up group hover:border-cyan-500/30 transition-colors">
                {/* Image */}
                <div className="w-20 h-20 bg-slate-900 rounded-lg p-2 flex-shrink-0 border border-slate-800">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                </div>
                
                {/* Info & Controls */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-medium line-clamp-1">{item.name}</h3>
                      <p className="text-xs text-slate-400 mb-1">{item.brand}</p>
                    </div>
                    <button 
                      onClick={() => onRemoveItem(item.id)}
                      className="text-slate-600 hover:text-red-400 transition-colors"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-end mt-2">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 bg-slate-900 rounded-lg p-1 border border-slate-800">
                      <button 
                        onClick={() => onUpdateQuantity(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold text-white w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-cyan-400 font-bold">${(item.price * item.quantity).toLocaleString()}</p>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-slate-500">${item.price} c/u</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md space-y-4">
          <div className="space-y-2">
             <div className="flex justify-between items-center text-sm text-slate-400">
              <span>Productos ({totalItems})</span>
              <span>${totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold text-white">
              <span>Total a Pagar</span>
              <span className="text-cyan-400">${totalPrice.toLocaleString()}</span>
            </div>
          </div>
          
          <button 
            onClick={onCheckout}
            disabled={cartItems.length === 0}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5 fill-current" /> Proceder al Pago
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;