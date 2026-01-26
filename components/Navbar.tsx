import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Menu, X, Zap, User } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onSelectCategory: (category: string) => void;
  searchTerm: string;
  onSearchSubmit: (term: string) => void;
  user: any; 
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenOrders: () => void; // <--- Agrega esto
}

const Navbar: React.FC<NavbarProps> = ({ 
  cartCount, 
  onOpenCart, 
  onSelectCategory,
  searchTerm,
  onSearchSubmit,
  user,
  onOpenLogin,
  onLogout,
  onOpenOrders
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Estado local para manejar lo que escribe el usuario antes de dar Enter
  const [inputValue, setInputValue] = useState(searchTerm);

  // Sincronizar el input si se limpia externamente (ej: botón limpiar filtros)
  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (category: string) => {
    onSelectCategory(category);
    setIsMobileMenuOpen(false);
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(inputValue);
    // Scrollear al catálogo para ver resultados
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClearSearch = () => {
    setInputValue("");
    onSearchSubmit("");
  };

  return (
    <nav className={`sticky top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-slate-900/95 backdrop-blur-md border-b border-cyan-500/20 py-3 shadow-lg' : 'bg-slate-950 py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 group cursor-pointer shrink-0" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          <div className="bg-gradient-to-tr from-cyan-500 to-blue-600 p-2 rounded-lg transform group-hover:rotate-12 transition-transform">
            <Zap className="text-white w-6 h-6" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tighter hidden sm:block">
            Z-ONE <span className="text-cyan-400">LAPTOP</span>
          </h1>
          <h1 className="text-xl font-bold text-white tracking-tighter sm:hidden">
            Z-ONE
          </h1>
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center space-x-6 text-sm font-medium text-slate-300 shrink-0">
          <button onClick={() => handleNavClick('Todos')} className="hover:text-cyan-400 transition-colors">Inicio</button>
          <button onClick={() => handleNavClick('Laptops')} className="hover:text-cyan-400 transition-colors">Laptops</button>
          <button onClick={() => handleNavClick('Componentes')} className="hover:text-cyan-400 transition-colors">Componentes</button>
          <button onClick={() => handleNavClick('Todos')} className="hover:text-cyan-400 transition-colors text-cyan-400">Ofertas</button>
        </div>

        {/* Right Section: Search & User & Cart */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          
          {/* Desktop Search Form */}
          <div className="hidden md:block w-full max-w-xs">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors">
                <Search className="w-4 h-4" />
              </button>
              <input 
                type="text" 
                placeholder="Buscar y presionar Enter..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 text-slate-200 text-sm rounded-full pl-10 pr-10 py-2 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-500"
              />
              {inputValue && (
                <button 
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </form>
          </div>

          {/* Sección de Usuario */}
          {user ? (
            <div className="hidden md:flex items-center gap-4 mr-2">
              <div className="text-right">
                <p className="text-sm font-bold text-white leading-none">{user.nombre_completo}</p>
                <div className="flex gap-3 justify-end mt-1">
                   {/* NUEVO BOTÓN MIS PEDIDOS */}
                   <button onClick={onOpenOrders} className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3" /> Mis Pedidos
                   </button>
                   <span className="text-slate-600 text-[10px]">|</span>
                   <button onClick={onLogout} className="text-[10px] text-red-400 hover:underline">Cerrar Sesión</button>
                </div>
              </div>
              <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 font-bold border border-cyan-500">
                {user.nombre_completo.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <button onClick={onOpenLogin} className="hidden md:flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm font-medium">
              <User className="w-5 h-5" /> Login
            </button>
          )}

          {/* Botón del Carrito */}
          <div className="relative group cursor-pointer shrink-0" onClick={onOpenCart}>
            <ShoppingBag className="w-6 h-6 text-slate-300 group-hover:text-cyan-400 transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-cyan-500 text-slate-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                {cartCount}
              </span>
            )}
          </div>
          
          {/* Botón Menú Móvil */}
          <button 
            className="md:hidden text-slate-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-slate-900 border-b border-slate-800 p-4 flex flex-col space-y-4 shadow-xl animate-fade-in-up">
          {/* Mobile Search */}
          <div className="pb-2 border-b border-slate-800">
            <form onSubmit={handleSearchSubmit} className="relative">
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-4 h-4" />
              </button>
              <input 
                type="text" 
                placeholder="Buscar producto..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-full pl-10 pr-10 py-2 focus:outline-none focus:border-cyan-500"
              />
               {inputValue && (
                <button 
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </form>
          </div>

          <button onClick={() => handleNavClick('Todos')} className="text-left text-slate-300 hover:text-cyan-400">Inicio</button>
          <button onClick={() => handleNavClick('Laptops')} className="text-left text-slate-300 hover:text-cyan-400">Laptops</button>
          <button onClick={() => handleNavClick('Componentes')} className="text-left text-slate-300 hover:text-cyan-400">Componentes</button>
          <button onClick={() => handleNavClick('Todos')} className="text-left text-cyan-400 font-bold">Ofertas</button>
          
          {/* Opción de Login/Logout en Móvil */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            {user ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-bold">{user.nombre_completo}</span>
                </div>
                {/* Botón Móvil */}
                <button onClick={() => { onOpenOrders(); setIsMobileMenuOpen(false); }} className="w-full text-left flex items-center gap-2 text-cyan-400 text-sm">
                   <ShoppingBag className="w-4 h-4" /> Ver Mis Pedidos
                </button>
                <button onClick={onLogout} className="w-full text-left text-red-400 text-sm">Cerrar Sesión</button>
              </>
            ) : (
              <button onClick={onOpenLogin} className="flex items-center gap-2 text-slate-300 hover:text-white">
                <User className="w-4 h-4" /> Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;