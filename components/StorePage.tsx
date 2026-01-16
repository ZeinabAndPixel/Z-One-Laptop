import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Search, User as UserIcon, Menu, 
  X, Cpu, Monitor, HardDrive, MessageSquare, 
  MapPin, Phone, Instagram, Send, ShieldCheck
} from 'lucide-react';
import { User, CartItem, Product } from '../types';

// --- DATOS DE PRUEBA (MOCK DATA) PARA QUE LA PÁGINA CARGUE ---
const MOCK_PRODUCTS: Product[] = [
  { product_id: '1', name: 'Z-One Titan X', price: 1500, category: 'laptop', image_url: 'https://images.unsplash.com/photo-1603302576837-6378864a232c', stock: 10 },
  { product_id: '2', name: 'Spectre 360', price: 1200, category: 'laptop', image_url: 'https://images.unsplash.com/photo-1593642632823-8f78536788c6', stock: 5 },
  { product_id: '3', name: 'RTX 4090 OC', price: 1600, category: 'component', image_url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704', stock: 3 },
  { product_id: '4', name: 'Intel Core i9', price: 580, category: 'component', image_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea', stock: 15 },
];

interface StorePageProps {
  user: User | null;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
}

export const StorePage: React.FC<StorePageProps> = ({ user, onLoginSuccess, onLogout }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // home, catalog, builder

  // --- LÓGICA DEL CARRITO ---
  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(item => item.product_id === product.product_id);
      if (exists) {
        return prev.map(item => item.product_id === product.product_id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product_id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const totalCart = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // --- RENDERIZADO ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      
      {/* 1. BANNER ACADÉMICO */}
      <div className="bg-orange-700/90 text-white text-center py-1 text-[10px] font-bold uppercase tracking-widest border-b border-orange-600">
        ⚠ Proyecto Académico - UGMA El Tigre - Simulación de E-Commerce
      </div>

      {/* 2. NAVBAR */}
      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center font-black text-slate-950">Z</div>
            <span className="text-xl font-bold tracking-tight">Z-ONE <span className="text-cyan-400">LAPTOP</span></span>
          </div>
          
          <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
            <button onClick={() => setActiveTab('home')} className={`hover:text-cyan-400 transition-colors ${activeTab === 'home' ? 'text-cyan-400' : ''}`}>Inicio</button>
            <button onClick={() => setActiveTab('catalog')} className={`hover:text-cyan-400 transition-colors ${activeTab === 'catalog' ? 'text-cyan-400' : ''}`}>Catálogo</button>
            <button onClick={() => setActiveTab('builder')} className={`hover:text-cyan-400 transition-colors ${activeTab === 'builder' ? 'text-cyan-400' : ''}`}>PC Builder</button>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-slate-800 rounded-full transition-colors relative" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart className="w-5 h-5 text-slate-200" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-cyan-500 text-slate-950 text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cart.length}
                </span>
              )}
            </button>
            <button className="p-2 hover:bg-slate-800 rounded-full transition-colors">
              <UserIcon className="w-5 h-5 text-slate-200" />
            </button>
          </div>
        </div>
      </nav>

      {/* 3. CONTENIDO PRINCIPAL CAMBIANTE */}
      {activeTab === 'home' && (
        <>
          {/* HERO SECTION */}
          <section className="relative h-[500px] flex items-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca4?q=80&w=1926&auto=format&fit=crop" className="w-full h-full object-cover opacity-40" alt="Hero" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
            </div>
            <div className="max-w-7xl mx-auto px-4 relative z-10 text-center md:text-left">
              <span className="inline-block py-1 px-3 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold mb-4">
                VERSION 2.0 LIVE
              </span>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-white">
                INGENIERÍA <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">SIN LÍMITES.</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-xl mb-8">
                La nueva serie Z-One Titan ya está disponible en El Tigre. Rendimiento extremo para ingenieros y gamers.
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
                <button onClick={() => setActiveTab('catalog')} className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                  VER CATÁLOGO
                </button>
                <button onClick={() => setActiveTab('builder')} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                  <Cpu className="w-4 h-4" /> ARMAR MI PC
                </button>
              </div>
            </div>
          </section>

          {/* OFERTA DESTACADA */}
          <section className="py-12 max-w-7xl mx-auto px-4">
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 h-64 flex items-center bg-slate-900 group">
              <div className="absolute inset-0">
                <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e" className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700" alt="Promo" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent" />
              </div>
              <div className="relative z-10 p-8 md:p-12 max-w-lg">
                <h3 className="text-3xl font-bold mb-2">Oferta Relámpago</h3>
                <p className="text-cyan-400 font-bold text-xl mb-4">-15% en Periféricos Logitech</p>
                <button onClick={() => setActiveTab('catalog')} className="px-6 py-2 bg-white text-slate-950 font-bold rounded-lg hover:bg-gray-200 transition-colors">
                  Ver Ofertas
                </button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* VISTA DE CATÁLOGO */}
      {(activeTab === 'catalog' || activeTab === 'home') && (
        <section className="py-12 max-w-7xl mx-auto px-4" id="catalog">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Filtros */}
            <aside className="w-full md:w-1/4 space-y-8">
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 sticky top-24">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Menu className="w-4 h-4 text-cyan-400" /> Filtros
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Categoría</label>
                    <select className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm focus:border-cyan-500 outline-none">
                      <option>Todo</option>
                      <option>Laptops</option>
                      <option>Componentes</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-2">Precio Máximo</label>
                    <input type="range" className="w-full accent-cyan-500" />
                  </div>
                </div>
              </div>
            </aside>

            {/* Grid Productos */}
            <div className="w-full md:w-3/4">
              <h2 className="text-2xl font-bold mb-6">Nuestros Productos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_PRODUCTS.map(product => (
                  <div key={product.product_id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl hover:border-cyan-500/30 transition-all group">
                    <div className="aspect-video bg-slate-950 rounded-xl mb-4 overflow-hidden relative">
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      {product.stock < 5 && (
                        <span className="absolute top-2 right-2 bg-red-500/90 text-white text-[10px] font-bold px-2 py-1 rounded">
                          ¡ÚLTIMOS {product.stock}!
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
                        <p className="text-xs text-slate-400 uppercase mt-1">{product.category}</p>
                      </div>
                      <span className="text-cyan-400 font-bold">${product.price}</span>
                    </div>
                    <button 
                      onClick={() => addToCart(product)}
                      className="w-full mt-4 py-2 bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-300 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" /> Agregar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
          <div className="col-span-1 md:col-span-1">
            <h4 className="text-xl font-black text-white mb-4">Z-ONE</h4>
            <p className="text-slate-400 leading-relaxed">
              Líderes en tecnología de alto rendimiento en Anzoátegui. Tradición y confianza desde El Tigre para toda Venezuela.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-white mb-4">Navegación</h5>
            <ul className="space-y-2 text-slate-400">
              <li><button onClick={() => setActiveTab('home')} className="hover:text-cyan-400">Inicio</button></li>
              <li><button onClick={() => setActiveTab('catalog')} className="hover:text-cyan-400">Catálogo</button></li>
              <li><button onClick={() => setActiveTab('builder')} className="hover:text-cyan-400">PC Builder</button></li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white mb-4">Soporte</h5>
            <ul className="space-y-2 text-slate-400">
              <li>Rastreo de Pedido</li>
              <li>Garantía</li>
              <li>Contacto</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-white mb-4">Contacto</h5>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-cyan-500"/> El Tigre, Anzoátegui</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-cyan-500"/> +58 412-000-0000</li>
              <li className="flex items-center gap-2"><Instagram className="w-4 h-4 text-cyan-500"/> @zonelaptop</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-slate-500 text-xs">
          <p>© 2026 Z-One Laptop. Desarrollado por <span className="text-cyan-400">Zei</span> para la UGMA (Prof. Tibayde Garcia).</p>
        </div>
      </footer>

      {/* SIDEBAR DEL CARRITO */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-slate-900 h-full shadow-2xl border-l border-slate-800 flex flex-col animate-fade-in">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-cyan-400" /> Tu Carrito
              </h2>
              <button onClick={() => setIsCartOpen(false)}><X className="w-6 h-6 text-slate-400 hover:text-white" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center text-slate-500 mt-10">Tu carrito está vacío.</div>
              ) : (
                cart.map(item => (
                  <div key={item.product_id} className="flex gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <img src={item.image_url} className="w-16 h-16 object-cover rounded-lg bg-slate-900" alt="" />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">{item.name}</h4>
                      <p className="text-cyan-400 font-bold mt-1">${item.price * item.quantity}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => updateQuantity(item.product_id, -1)} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center hover:bg-slate-700">-</button>
                        <span className="text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product_id, 1)} className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center hover:bg-slate-700">+</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 border-t border-slate-800 bg-slate-900">
              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Total</span>
                <span className="text-cyan-400">${totalCart.toFixed(2)}</span>
              </div>
              <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-cyan-900/20">
                PROCESAR PAGO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTÓN CHATBOT FLOTANTE */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center z-40 transition-all hover:scale-110"
      >
        <MessageSquare className="w-7 h-7" />
      </button>

      {/* VENTANA CHATBOT */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 h-[400px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden">
          <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2"><Monitor className="w-4 h-4 text-cyan-400"/> Asistente Z-One</h3>
            <button onClick={() => setIsChatOpen(false)}><X className="w-4 h-4 text-slate-400"/></button>
          </div>
          <div className="flex-1 p-4 bg-slate-950/50 overflow-y-auto">
            <div className="bg-slate-800 p-3 rounded-tr-xl rounded-bl-xl rounded-br-xl w-4/5 text-sm mb-2 text-slate-200">
              ¡Hola! Soy la IA de Z-One. ¿Buscas una laptop para ingeniería o gaming?
            </div>
          </div>
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
            <input type="text" placeholder="Escribe tu duda..." className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500" />
            <button className="p-2 bg-cyan-600 rounded-lg text-white hover:bg-cyan-500"><Send className="w-4 h-4"/></button>
          </div>
        </div>
      )}
    </div>
  );
};