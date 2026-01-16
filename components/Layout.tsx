import React, { useState, useEffect } from 'react';
import { ShoppingCart, Menu, X, User, Home, Laptop, Cpu, Percent, Search, Rocket } from 'lucide-react';
import { CustomBanner } from '../types';
import { getBanner } from '../services/db';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onNavigate: (tab: string) => void;
  cartCount: number;
  onOpenCart: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onNavigate, cartCount, onOpenCart }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [heroImage, setHeroImage] = useState<CustomBanner | null>(null);

  useEffect(() => {
    // Cargar imagen de portada (hero_main)
    getBanner('hero_main').then(setHeroImage);
  }, []);

  const navItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'catalog', label: 'Laptops', icon: Laptop },
    { id: 'builder', label: 'Componentes', icon: Cpu },
    { id: 'offers', label: 'Ofertas', icon: Percent },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200 font-sans">
      
      {/* 1. BANNER ACADÉMICO (Estático) */}
      <div className="h-[40px] bg-orange-700 text-white flex items-center justify-center text-sm font-bold tracking-widest uppercase shadow-md z-50">
        PROYECTO ACADÉMICO - SITIO DE PRUEBA
      </div>

      {/* 2. SECCIÓN PORTADA (Z-One Cover) - Solo en Inicio */}
      {activeTab === 'home' && (
        <div className="w-full h-[350px] md:h-[450px] bg-slate-900 relative overflow-hidden">
          {heroImage ? (
            <img 
              src={heroImage.image_url} 
              alt="Z-One Cover" 
              className="w-full h-full object-cover opacity-90"
            />
          ) : (
             <div className="w-full h-full flex items-center justify-center text-slate-600 animate-pulse">
               Cargando Portada...
             </div>
          )}
        </div>
      )}

      {/* 3. BARRA DE NAVEGACIÓN (Navbar) */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Izquierda: Logo */}
            <div className="flex items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onNavigate('home')}>
              <div className="w-8 h-8 bg-cyan-500 rounded-sm flex items-center justify-center mr-2 shadow-[0_0_10px_rgba(6,182,212,0.5)]">
                <Rocket className="w-5 h-5 text-slate-950" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Z-ONE <span className="text-cyan-500">LAPTOP</span></span>
            </div>

            {/* Centro: Enlaces */}
            <div className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center space-x-1 text-sm font-medium transition-all duration-200 ${
                    activeTab === item.id 
                      ? 'text-cyan-500 border-b-2 border-cyan-500' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Derecha: Iconos */}
            <div className="hidden md:flex items-center space-x-5">
              <button className="text-slate-400 hover:text-cyan-500 transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button onClick={() => onNavigate('register')} className="text-slate-400 hover:text-cyan-500 transition-colors">
                <User className="w-5 h-5" />
              </button>
              <button 
                onClick={onOpenCart} 
                className="text-slate-400 hover:text-cyan-500 transition-colors relative group"
              >
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-cyan-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full shadow-lg animate-fade-in">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Menú Móvil */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-300">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Móvil */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-800">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`block px-3 py-2 rounded-md text-base font-medium w-full text-left ${
                     activeTab === item.id ? 'text-cyan-500 bg-slate-800' : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" /> {item.label}
                  </span>
                </button>
              ))}
               <button onClick={() => { onNavigate('register'); setIsMenuOpen(false); }} className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 w-full text-left">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4" /> Login / Registro
                  </span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-grow w-full">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">© 2024 Z-One Laptop. Hardware de Ingeniería Premium.</p>
          <p className="text-slate-600 text-xs mt-2">Base de Datos Conectada: Neon PostgreSQL (Cifrado SSL)</p>
        </div>
      </footer>
    </div>
  );
};