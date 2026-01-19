
import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductCard from './components/ProductCard';
import FilterSidebar from './components/FilterSidebar';
import CartDrawer from './components/CartDrawer';
import Checkout from './components/Checkout';
import PCBuilder from './components/PCBuilder';
import AuthModal from './components/AuthModal'; // Importar el nuevo componente
import Toast from './components/Toast';
import ChatAssistant from './components/ChatAssistant'; // <--- Añade esta línea
import { SecurityModal, SecurityBanner } from './components/SecurityFeatures';
import { getProducts, saveOrder } from './lib/db'; // Importamos la función de DB
import { Product, CartItem } from './types';
import { Zap, Monitor, MousePointer2, Filter, Search, MapPin, Phone, Mail, Loader2, Database } from 'lucide-react';

const App: React.FC = () => {
  // Estado de Datos
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
const [user, setUser] = useState<any>(null); // Estado para el usuario
  const [isAuthOpen, setIsAuthOpen] = useState(false); // Estado para abrir el modal
  // Estados de UI/Filtros
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [activeBrand, setActiveBrand] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState(""); 
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Cart State 
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Checkout & Builder State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  
  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
useEffect(() => {
    const savedUser = localStorage.getItem('z_one_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // 1. Efecto para cargar datos de Neon DB
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setIsLoading(true);
        const data = await getProducts();
        
        // Mapeo seguro en caso de que la DB devuelva nombres de columna en snake_case
        // Si tu DB ya usa camelCase, esto no rompe nada.
        // Mapeo corregido para coincidir con tu SQL de Neon
     const formattedData: Product[] = data.map((item: any) => ({
  id: item.id,
  name: item.nombre,           
  category: item.categoria,    
  brand: item.marca,           
  price: Number(item.precio), // Usamos 'precio' directo de tu tabla
  rating: 5,                  // Valor por defecto ya que la tabla no tiene rating
  image: item.imagen_url,     
  // AQUÍ ESTÁ LA MAGIA: Convertimos tu descripción de texto en una lista de specs
  specs: item.descripcion 
    ? item.descripcion.split(',').map((s: string) => s.trim()) 
    : ["Especificación estándar"]
}));

setProducts(formattedData);
      } catch (err) {
        console.error(err);
        setError("Error de conexión con el servidor. Intente más tarde.");
      } finally {
        // Pequeño delay artificial para que se aprecie la animación de carga si es muy rápido
        setTimeout(() => setIsLoading(false), 800);
      }
    };

    fetchCatalog();
  }, []);
   const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    localStorage.setItem('z_one_user', JSON.stringify(userData)); // Guardar sesión simple
    setToastMessage(`Bienvenido, ${userData.nombre_completo}`);
    setIsAuthOpen(false);
  };
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('z_one_user');
    setToastMessage("Has cerrado sesión");
  };
  // 2. Calcular filtros dinámicos basados en los datos cargados
  const derivedCategories = useMemo(() => ["Todos", ...new Set(products.map(p => p.category))], [products]);
  const derivedBrands = useMemo(() => ["Todas", ...new Set(products.map(p => p.brand))], [products]);

  // 3. Lógica de filtrado (igual que antes, pero usando 'products' del estado)
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const categoryMatch = activeCategory === "Todos" || product.category === activeCategory;
      const brandMatch = activeBrand === "Todas" || product.brand === activeBrand;
      const term = searchTerm.toLowerCase();
      const searchMatch = 
        product.name.toLowerCase().includes(term) || 
        product.brand.toLowerCase().includes(term) || 
        product.category.toLowerCase().includes(term);

      return categoryMatch && brandMatch && searchMatch;
    });
  }, [activeCategory, activeBrand, searchTerm, products]);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
    setToastMessage(`¡${product.name} añadido al carrito!`);
  };

  const addMultipleToCart = (products: Product[]) => {
    setCart(prevCart => {
      let newCart = [...prevCart];
      products.forEach(product => {
        const existingItemIndex = newCart.findIndex(item => item.id === product.id);
        if (existingItemIndex > -1) {
          newCart[existingItemIndex] = {
            ...newCart[existingItemIndex],
            quantity: newCart[existingItemIndex].quantity + 1
          };
        } else {
          newCart.push({ ...product, quantity: 1 });
        }
      });
      return newCart;
    });
    setToastMessage("¡PC Completa añadida al carrito!");
    setIsCartOpen(true);
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta;
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };
// Función para procesar y guardar la compra en la base de datos
  const handlePurchaseComplete = async (customerData: any) => {
    try {
      // Calculamos el total del carrito
      const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Llamamos a la función de la base de datos
      await saveOrder(customerData, total);
      
      // Si todo sale bien, limpiamos y cerramos
      clearCart();
      setIsCheckoutOpen(false);
      setToastMessage("¡Excelente! Tu pedido ha sido registrado en el sistema.");
    } catch (err) {
      console.error(err);
      setToastMessage("Hubo un error al guardar tu pedido. Intenta de nuevo.");
    }
  };
  const clearCart = () => {
    setCart([]);
  };

  const handleOpenCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleNavCategorySelect = (category: string) => {
    setActiveCategory(category);
    setActiveBrand("Todas");
    setSearchTerm("");
  };

  const totalItemsInCart = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ----------------------------------------------------------------------
  // LOADING SCREEN (Cyberpunk Style)
  // ----------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full blur-[100px]" />
        </div>

        <div className="z-10 flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Database className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-widest uppercase animate-pulse">
              Conectando a Neon DB
            </h2>
            <p className="text-cyan-500/80 font-mono text-sm">
              Sincronizando catálogo de productos...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------------------------
  // MAIN APP
  // ----------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500 selection:text-slate-900">
      <SecurityBanner />
      <SecurityModal />
{/* Agregar el Modal de Auth */}
      {isAuthOpen && (
        <AuthModal 
          onClose={() => setIsAuthOpen(false)} 
          onLoginSuccess={handleLoginSuccess} 
        />
      )}
      <Navbar 
        cartCount={totalItemsInCart} 
        onOpenCart={() => setIsCartOpen(true)}
        onSelectCategory={handleNavCategorySelect}
        searchTerm={searchTerm}
        onSearchSubmit={setSearchTerm}
        user={user}
        onOpenLogin={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />
      
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={handleOpenCheckout}
      />
{isCheckoutOpen && (
        <Checkout 
          cartItems={cart}
          onClose={() => setIsCheckoutOpen(false)}
          onClearCart={clearCart}
          onOrderComplete={handlePurchaseComplete} // <--- Añade esta línea
        />
      )}
    
      {isBuilderOpen && (
        <PCBuilder 
          onClose={() => setIsBuilderOpen(false)}
          onAddMultipleToCart={addMultipleToCart}
        />
      )}

      {toastMessage && (
        <Toast 
          message={toastMessage} 
          onClose={() => setToastMessage(null)} 
        />
      )}
      
      <main>
        <Hero onOpenBuilder={() => setIsBuilderOpen(true)} />
        
        {/* CATALOG SECTION */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="catalog">
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* Sidebar Column */}
            <div className="w-full md:w-64 flex-shrink-0">
               <button 
                className="md:hidden w-full flex items-center justify-center gap-2 bg-slate-900 text-white p-3 rounded-xl border border-slate-800 mb-6 hover:border-cyan-500/50 transition-colors"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              >
                <Filter className="w-5 h-5 text-cyan-400" />
                {mobileFiltersOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </button>

              <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} md:block`}>
                <FilterSidebar 
                  activeCategory={activeCategory}
                  activeBrand={activeBrand}
                  onSelectCategory={setActiveCategory}
                  onSelectBrand={setActiveBrand}
                  availableCategories={derivedCategories}
                  availableBrands={derivedBrands}
                  className="sticky top-24"
                />
              </div>
            </div>

            {/* Product Grid Column */}
            <div className="flex-1 w-full">
              {error ? (
                <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl text-center">
                  <h3 className="text-red-400 font-bold mb-2">Error de Carga</h3>
                  <p className="text-slate-400">{error}</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row justify-between items-end mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">Nuestros Productos</h2>
                      <p className="text-slate-400">Seleccionados por expertos para el máximo rendimiento.</p>
                    </div>
                    <div className="text-sm text-slate-500 mt-4 md:mt-0">
                      Mostrando <span className="text-cyan-400 font-bold">{filteredProducts.length}</span> resultados
                    </div>
                  </div>

                  {/* Grid de Productos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProducts.map((product) => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        onAddToCart={addToCart} 
                      />
                    ))}
                  </div>

                  {filteredProducts.length === 0 && (
                    <div className="text-center py-20 bg-slate-900/30 rounded-2xl border border-dashed border-slate-800 flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-slate-500" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No encontramos resultados</h3>
                      <p className="text-slate-400 mb-6 max-w-md">
                        No encontramos productos que coincidan con tu búsqueda. ¡Prueba con otros términos!
                      </p>
                      <button 
                        onClick={() => { setActiveCategory("Todos"); setActiveBrand("Todas"); setSearchTerm(""); }}
                        className="text-cyan-400 hover:text-cyan-300 font-medium text-sm border-b border-dashed border-cyan-400/50 hover:border-cyan-300 transition-colors"
                      >
                        Limpiar búsqueda y filtros
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </section>

        {/* FEATURES BANNER */}
        <section className="bg-gradient-to-r from-slate-900 to-slate-800 border-y border-slate-800 py-16">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 group hover:bg-slate-800/50 rounded-2xl transition-colors duration-300">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-cyan-400 border border-slate-700 group-hover:scale-110 transition-transform group-hover:border-cyan-500/50">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-white font-bold mb-2">Envío Flash</h3>
              <p className="text-sm text-slate-400">Recibe tu equipo en menos de 24 horas en zonas principales.</p>
            </div>
            <div className="p-6 group hover:bg-slate-800/50 rounded-2xl transition-colors duration-300">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-cyan-400 border border-slate-700 group-hover:scale-110 transition-transform group-hover:border-cyan-500/50">
                <Monitor className="w-6 h-6" />
              </div>
              <h3 className="text-white font-bold mb-2">Soporte Técnico</h3>
              <p className="text-sm text-slate-400">Expertos en hardware listos para ayudarte 24/7.</p>
            </div>
            <div className="p-6 group hover:bg-slate-800/50 rounded-2xl transition-colors duration-300">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-cyan-400 border border-slate-700 group-hover:scale-110 transition-transform group-hover:border-cyan-500/50">
                <MousePointer2 className="w-6 h-6" />
              </div>
              <h3 className="text-white font-bold mb-2">Garantía Gamer</h3>
              <p className="text-sm text-slate-400">Protección extendida contra defectos y caídas accidentales.</p>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER SIMPLIFICADO */}
      <footer className="bg-slate-950 py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Company Info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              Z-ONE <span className="text-cyan-400">LAPTOP</span>
            </h2>
            <p className="text-slate-500 max-w-md leading-relaxed">
              La tienda definitiva para entusiastas del hardware y gamers profesionales. 
              Elevamos tu juego al siguiente nivel con el mejor equipo del mercado.
            </p>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-4">
            <h4 className="text-white font-bold text-lg">Contacto Directo</h4>
            <ul className="space-y-3 text-slate-500 text-sm">
              <li className="flex items-center gap-2 md:flex-row-reverse hover:text-cyan-400 transition-colors">
                <Mail className="w-4 h-4" /> soporte@z-one.com
              </li>
              <li className="flex items-center gap-2 md:flex-row-reverse hover:text-cyan-400 transition-colors">
                <Phone className="w-4 h-4" /> +58 (424) 824-4869
              </li>
              <li className="flex items-center gap-2 md:flex-row-reverse hover:text-cyan-400 transition-colors">
                <MapPin className="w-4 h-4" /> Calle Bolivar, Venezuela
              </li>
            </ul>
          </div>

        </div>
        <div className="mt-16 pt-8 border-t border-slate-900 text-center text-slate-600 text-sm">
          © {new Date().getFullYear()} Z-One Laptop Store. Todos los derechos reservados.
        </div>
      
    
{/* 1. Sección de Notificaciones (Toast) */}
      {toastMessage && (
        <Toast 
          message={toastMessage} 
          onClose={() => setToastMessage(null)} 
        />
      )}

      {/* 2. AQUÍ AGREGAMOS EL ASISTENTE INTELIGENTE */}
      <ChatAssistant /> 

      </footer> {/* Asegúrate de cerrar el main si lo abriste arriba */}
    </div> // Este cierra el div principal de la App
  );
}; // Este cierra la función App


export default App;