import React, { useState } from 'react';
import { 
  ShoppingCart, Search, User as UserIcon, Menu, 
  X, Cpu, Monitor, HardDrive, MessageSquare, 
  MapPin, Phone, Instagram, Send, LogOut, Check
} from 'lucide-react';
import { User, CartItem, Product } from '../types';

// DATOS DE PRUEBA
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
  const [isLoginOpen, setIsLoginOpen] = useState(false); // Estado para el modal de login
  const [activeTab, setActiveTab] = useState('home'); 
  
  // Estados para el formulario de login
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // --- LÓGICA DE LOGIN ---
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulación de validación (Acepta cualquier usuario por ahora)
    if (loginUser && loginPass) {
      const newUser: User = {
        username: loginUser,
        email: `${loginUser}@example.com`,
        created_at: new Date().toISOString()
      };
      onLoginSuccess(newUser);
      setIsLoginOpen(false);
      alert(`¡Bienvenida de nuevo, ${loginUser}!`);
    } else {
      alert("Por favor ingresa usuario y contraseña.");
    }
  };

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
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const totalCart = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      
      {/* 1. BANNER ACADÉMICO */}
      <div className="bg-orange-700/90 text-white text-center py-1 text-[10px] font-bold uppercase tracking-widest border-b border-orange-600">
        ⚠ Proyecto Académico - UGMA El Tigre - Simulación de E-Commerce
      </div>

      {/* 2. NAVBAR */}
      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
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

            {/* BOTÓN DE USUARIO / LOGIN */}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-cyan-400">{user.username}</span>
                <button onClick={onLogout} className="p-2 hover:bg-red-500/20 text-red-400 rounded-full" title="Cerrar Sesión">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button onClick={() => setIsLoginOpen(true)} className="p-2 hover:bg-slate-800 rounded-full transition-colors" title="Iniciar Sesión">
                <UserIcon className="w-5 h-5 text-slate-200" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* 3. CONTENIDO PRINCIPAL */}
      
      {/* --- HOME --- */}
      {activeTab === 'home' && (
        <>
          <section className="relative h-[500px] flex items-center overflow-hidden">
            <div className="absolute inset-0 z-0 bg-slate-900">
               {/* Imagen simulada de background */}
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
            </div>
            <div className="max-w-7xl mx-auto px-4 relative z-10 text-center md:text-left w-full">
              <span className="inline-block py-1 px-3 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold mb-4">
                VERSION 2.0 LIVE
              </span>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-white">
                INGENIERÍA <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">SIN LÍMITES.</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-xl mb-8">
                La nueva serie Z-One Titan ya está disponible en El Tigre. 
              </p>
              <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
                <button onClick={() => setActiveTab('catalog')} className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all">
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
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 h-64 flex items-center bg-slate-900">
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

      {/* --- CATÁLOGO --- */}
      {(activeTab === 'catalog' || activeTab === 'home') && (
        <section className="py-12 max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-1/4 space-y-8">
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Menu className="w-4 h-4 text-cyan-400" /> Filtros
                </h3>
                <div className="space-y-4">
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-300">
                    <option>Todo</option>
                    <option>Laptops</option>
                    <option>Componentes</option>
                  </select>
                </div>
              </div>
            </aside>

            <div className="w-full md:w-3/4">
              <h2 className="text-2xl font-bold mb-6">Nuestros Productos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_PRODUCTS.map(product => (
                  <div key={product.product_id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl hover:border-cyan-500/30 transition-all group">
                    <div className="aspect-video bg-slate-950 rounded-xl mb-4 overflow-hidden relative">
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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

      {/* --- PC BUILDER (Simple) --- */}
      {activeTab === 'builder' && (
        <section className="py-12 max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Constructor de PC</h2>
          <p className="text-slate-400">Selecciona tus componentes y obtén un 5% de descuento.</p>
          <div className="mt-8 p-8 border border-dashed border-slate-700 rounded-2xl">
            <p>Aquí irá el selector de componentes avanzado.</p>
            <button onClick={() => setActiveTab('catalog')} className="mt-4 text-cyan-400 underline">Volver al catálogo por ahora</button>
          </div>
        </section>
      )}

      {/* MODAL DE LOGIN */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 w-full max-w-md shadow-2xl animate-fade-in relative">
            <button 
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold mb-2 text-center">Bienvenido a Z-One</h2>
            <p className="text-slate-400 text-center mb-6 text-sm">Ingresa a tu cuenta para gestionar pedidos.</p>
            
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Usuario</label>
                <input 
                  type="text" 
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500"
                  placeholder="Ej: Zei"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Contraseña</label>
                <input 
                  type="password" 
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500"
                  placeholder="******"
                />
              </div>
              <button type="submit" className="w-full