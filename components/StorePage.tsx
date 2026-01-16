import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, User as UserIcon, Grid, Settings, Plus, Filter, Rocket, ChevronRight, LogOut, LayoutDashboard } from 'lucide-react';
import { Product, CartItem, CustomBanner, User, CheckoutData } from '../types';
import { getProducts, getBanner } from '../services/db';
import { ProductModal } from './ProductModal';
import { CartSidebar } from './CartSidebar';
import { PCBuilder } from './PCBuilder';
import { Register } from './Register';
import { ChatBot } from './ChatBot';

interface StorePageProps {
  user: User | null;
  onLogout: () => void;
  onLoginSuccess: (user: User) => void;
}

export const StorePage: React.FC<StorePageProps> = ({ user, onLogout, onLoginSuccess }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [heroBanner, setHeroBanner] = useState<CustomBanner | null>(null);
  const [promoBanner, setPromoBanner] = useState<CustomBanner | null>(null);
  const [loading, setLoading] = useState(true);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeView, setActiveView] = useState<'store' | 'builder' | 'register'>('store');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Todas');

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prods, hero, promo] = await Promise.all([
          getProducts(),
          getBanner('hero_main'),
          getBanner('featured_promo')
        ]);
        setProducts(prods);
        setHeroBanner(hero || null);
        setPromoBanner(promo || null);
      } catch (error) {
        console.error("Error cargando datos de Neon DB", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const addToCart = (product: Product, isBuilderPart = false) => {
    setCartItems(prev => {
      const existing = prev.find(p => p.product_id === product.product_id);
      if (existing) {
        return prev.map(p => 
          p.product_id === product.product_id 
            ? { ...p, quantity: p.quantity + 1 } 
            : p
        );
      }
      return [...prev, { ...product, quantity: 1, isBuilderPart }];
    });
    if (!isBuilderPart) setIsCartOpen(true);
  };

  const updateCartQuantity = (id: string, newQty: number) => {
    if (newQty < 1) return;
    setCartItems(prev => prev.map(item => item.product_id === id ? { ...item, quantity: newQty } : item));
  };

  const addBuilderConfigToCart = (parts: Product[]) => {
    parts.forEach(part => addToCart(part, true));
    setIsCartOpen(true);
    setActiveView('store');
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product_id !== productId));
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // --- LÓGICA DE CLICK EN BANNER PROMOCIONAL ---
  const handlePromoClick = () => {
    if (!promoBanner?.target_route) return;

    // 1. Verificar si es un ID de producto interno
    const targetProduct = products.find(p => p.product_id === promoBanner.target_route);
    
    if (targetProduct) {
      setSelectedProduct(targetProduct);
    } else {
      // 2. Si no es un producto, asumir ruta externa (Link navigation simulation)
      window.location.href = promoBanner.target_route;
    }
  };

  // --- LÓGICA DE CHECKOUT AVANZADA ---
  const handleCheckout = async (data: CheckoutData) => {
    if (!user) return;

    // 1. Generar Tracking Code Único (Formato Z1-2026-XXXXX)
    const year = new Date().getFullYear();
    const randomChars = Math.random().toString(36).substring(2, 7).toUpperCase();
    const trackingCode = `Z1-${year}-${randomChars}`;

    console.log("--- INICIANDO TRANSACCIÓN DE PEDIDO NEON DB ---");
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simular latencia

    // 2. Simular Inserción de Cabecera de Orden (Respetando Relaciones FK)
    // Se inserta en 'orders' o 'purchases' vinculando al usuario y al cliente
    console.log(`[DB] INSERT INTO purchases (
      tracking_code: '${trackingCode}', 
      username_id: '${user.username}', 
      customer_cedula: '${data.customer.cedula}', 
      total_amount: ${data.total}, 
      tax_amount: ${data.tax}, 
      assembly_cost: ${data.assemblyCost}, 
      discount_applied: ${data.discount},
      status: 'PAID_VERIFYING',
      payment_method: '${data.payment.method}',
      payment_ref: '${data.payment.reference || 'CASH'}',
      delivery_method: '${data.delivery.method}',
      delivery_address: '${data.delivery.shippingAddress || 'EL TIGRE STORE'}'
    )`);

    // 3. Simular Inserción de Items
    data.items.forEach(item => {
      console.log(`[DB] INSERT INTO purchase_items (
         tracking_code: '${trackingCode}', 
         product_id: '${item.product_id}', 
         quantity: ${item.quantity}, 
         unit_price: ${item.price},
         is_builder_component: ${!!item.isBuilderPart}
      )`);
    });

    console.log("--- TRANSACCIÓN COMPLETADA EXITOSAMENTE ---");

    alert(`¡PEDIDO CONFIRMADO!\n\nCódigo de Rastreo: ${trackingCode}\n\nGracias por tu compra, ${data.customer.fullName}. Hemos enviado la factura y detalles a ${user.email}.`);
    
    setCartItems([]);
    setIsCartOpen(false);
  };

  if (activeView === 'register') {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
           <nav className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50">
              <button onClick={() => setActiveView('store')} className="flex items-center text-cyan-500 font-bold hover:text-white transition-colors">
                <ChevronRight className="rotate-180 mr-2" /> Volver a la Tienda
              </button>
           </nav>
           <Register onLogin={(u) => { onLoginSuccess(u); setActiveView('store'); }} />
        </div>
      );
  }

  if (activeView === 'builder') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200">
         <nav className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50 flex justify-between items-center">
            <button onClick={() => setActiveView('store')} className="flex items-center text-cyan-500 font-bold hover:text-white transition-colors">
              <ChevronRight className="rotate-180 mr-2" /> Volver a la Tienda
            </button>
            <div className="text-white font-bold">Modo Constructor</div>
         </nav>
         <PCBuilder onAddConfigToCart={addBuilderConfigToCart} />
      </div>
    );
  }

  const filteredProducts = activeCategory === 'Todas' 
    ? products 
    : products.filter(p => p.category === activeCategory.toLowerCase() || (activeCategory === 'Componentes' && p.category === 'component'));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30 relative">
      
      <div className="h-[40px] bg-orange-700 text-white flex items-center justify-center text-xs md:text-sm font-bold tracking-widest uppercase shadow-md z-[60] relative">
        PROYECTO ACADÉMICO - UGMA EL TIGRE - SITIO DE PRUEBA
      </div>

      <div className="relative w-full h-[400px] md:h-[500px] bg-slate-900 overflow-hidden">
        {heroBanner ? (
          <img src={heroBanner.image_url} alt="Hero Main" className="w-full h-full object-cover opacity-90" />
        ) : (
          <div className="w-full h-full flex items-center justify-center animate-pulse text-slate-600">Cargando Portada...</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
      </div>

      <nav className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center cursor-pointer group" onClick={() => setActiveView('store')}>
              <div className="w-10 h-10 bg-cyan-500 rounded flex items-center justify-center mr-3 shadow-[0_0_15px_rgba(6,182,212,0.5)] group-hover:shadow-[0_0_25px_rgba(6,182,212,0.7)] transition-shadow">
                <Rocket className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight leading-none">Z-ONE</h1>
                <span className="text-xs text-cyan-500 font-medium tracking-widest uppercase">Laptop v2</span>
              </div>
            </div>

            <div className="hidden md:flex space-x-8">
              {['Inicio', 'Laptops', 'Componentes', 'Soporte'].map((item) => (
                <button key={item} className="text-sm font-medium text-slate-400 hover:text-cyan-400 transition-colors">{item}</button>
              ))}
            </div>

            <div className="flex items-center space-x-6">
              <button className="text-slate-400 hover:text-white transition-colors"><Search className="w-5 h-5" /></button>
              
              {user ? (
                <div className="relative group">
                   <button className="flex items-center gap-2 text-white bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 hover:border-cyan-500 transition-colors">
                     <UserIcon className="w-4 h-4 text-cyan-500" />
                     <span className="text-xs font-bold">{user.username}</span>
                   </button>
                   <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-50 p-1">
                      <button className="flex items-center w-full px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded">
                        <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                      </button>
                      <button onClick={onLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-slate-800 hover:text-red-300 rounded">
                        <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
                      </button>
                   </div>
                </div>
              ) : (
                <button onClick={() => setActiveView('register')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                  <UserIcon className="w-5 h-5" />
                  <span className="text-xs font-medium">Ingresar</span>
                </button>
              )}

              <button onClick={() => setIsCartOpen(true)} className="text-slate-400 hover:text-cyan-500 transition-colors relative">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-cyan-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-lg animate-fade-in">{cartCount}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 mt-8 space-y-12">
        {promoBanner && (
          <div className="relative w-full h-[280px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 group">
             <img src={promoBanner.image_url} alt="Featured" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
             <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-center px-12">
                <div className="inline-block px-3 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded-full w-max mb-4 backdrop-blur-sm">
                  <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider">Oferta Limitada</span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-2 max-w-lg shadow-black drop-shadow-lg">{promoBanner.title}</h2>
                <button 
                  onClick={handlePromoClick}
                  className="w-max bg-cyan-600 hover:bg-cyan-500 text-slate-950 px-8 py-3 rounded-full font-bold text-sm transition-transform duration-300 hover:scale-105 shadow-lg flex items-center mt-6"
                >
                  {promoBanner.cta_text} <ChevronRight className="ml-1 w-4 h-4" />
                </button>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button 
            onClick={() => document.getElementById('main-catalog')?.scrollIntoView({ behavior: 'smooth' })}
            className="group bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 p-10 rounded-xl transition-all duration-300 flex items-center gap-6"
          >
             <div className="bg-slate-800 p-4 rounded-full group-hover:bg-cyan-950/50 transition-colors"><Grid className="w-10 h-10 text-cyan-500" /></div>
             <div className="text-left">
               <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">VER CATÁLOGO</h3>
               <p className="text-slate-400 mt-1">Explora colección completa</p>
             </div>
          </button>

          <button 
            onClick={() => setActiveView('builder')}
            className="group bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 p-10 rounded-xl transition-all duration-300 flex items-center gap-6"
          >
            <div className="bg-slate-800 p-4 rounded-full group-hover:bg-cyan-950/50 transition-colors"><Settings className="w-10 h-10 text-cyan-500" /></div>
             <div className="text-left">
               <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">ARMAR MI PC</h3>
               <p className="text-slate-400 mt-1">Constructor Inteligente</p>
             </div>
          </button>
        </div>
      </div>

      <section id="main-catalog" className="max-w-7xl mx-auto px-4 mt-16 mb-20 flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-1/4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 sticky top-24 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-800">
                <Filter className="w-5 h-5 text-cyan-500" />
                <h3 className="font-bold text-white text-lg">FILTROS</h3>
              </div>
              <div className="space-y-6">
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Categoría</label>
                   <div className="space-y-2">
                      {['Todas', 'Laptops', 'Componentes', 'Accesorios'].map(cat => (
                        <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                          <input type="radio" name="category" checked={activeCategory === cat} onChange={() => setActiveCategory(cat)} className="accent-cyan-500 w-4 h-4" />
                          <span className={`text-sm ${activeCategory === cat ? 'text-white font-medium' : 'text-slate-400 group-hover:text-slate-300'}`}>{cat}</span>
                        </label>
                      ))}
                   </div>
                </div>
              </div>
            </div>
          </aside>

          <section className="w-full lg:w-3/4">
            <h2 className="text-2xl font-bold text-white mb-6">NUESTROS PRODUCTOS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div 
                  key={product.product_id}
                  className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-cyan-500/50 transition-all cursor-pointer flex flex-col"
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="relative aspect-[4/3] bg-slate-950">
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                      className="absolute bottom-3 right-3 bg-cyan-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-5 flex-grow flex flex-col justify-between">
                     <div>
                       <span className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider bg-cyan-950/30 px-2 py-1 rounded mb-2 inline-block">{product.category}</span>
                       <h3 className="text-white font-bold group-hover:text-cyan-400 transition-colors">{product.name}</h3>
                     </div>
                     <div className="mt-4 text-xl text-slate-200 font-light">${product.price.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
      </section>

      {/* BOTON FLOTANTE CHATBOT */}
      <ChatBot products={products} />

      {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={(p) => addToCart(p)} />}
      
      <CartSidebar 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        user={user}
        onRemove={removeFromCart}
        onUpdateQuantity={updateCartQuantity}
        onCheckout={handleCheckout}
      />
    </div>
  );
};