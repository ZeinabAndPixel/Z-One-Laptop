import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Cpu, Gamepad2, Zap } from 'lucide-react';

interface HeroProps {
  onOpenBuilder?: () => void;
}

const SLIDES = [
  {
    id: 1,
    badge: "NUEVA SERIE RTX 40 YA DISPONIBLE",
    title: <>Poder Sin <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Límites</span>.</>,
    subtitle: "Diseño Sin Rival.",
    description: "Encuentra equipos de alto rendimiento diseñados para gaming competitivo y trabajo profesional.",
    icon: <Zap className="w-5 h-5 text-cyan-400" />,
    bgGradient: "from-cyan-500/20 to-blue-600/20"
  },
  {
    id: 2,
    badge: "ESTACIONES DE TRABAJO PRO",
    title: <>Crea Sin <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Interrupciones</span>.</>,
    subtitle: "Renderizado 3D en Tiempo Real.",
    description: "Workstations certificadas para arquitectos y editores. Potencia bruta para tus proyectos más exigentes.",
    icon: <Cpu className="w-5 h-5 text-purple-400" />,
    bgGradient: "from-purple-500/20 to-pink-600/20"
  },
  {
    id: 3,
    badge: "SETUP GAMER COMPLETO",
    title: <>Domina el <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Juego</span>.</>,
    subtitle: "Periféricos de Precisión.",
    description: "Teclados mecánicos, ratones ultraligeros y monitores de 240Hz. Todo lo que necesitas para la victoria.",
    icon: <Gamepad2 className="w-5 h-5 text-green-400" />,
    bgGradient: "from-green-500/20 to-emerald-600/20"
  }
];

const Hero: React.FC<HeroProps> = ({ onOpenBuilder }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play (opcional)
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 8000); // Cambia cada 8 segundos
    return () => clearInterval(timer);
  }, [currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  };

  return (
    <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden group">
      
      {/* Botones de Navegación (Flechas) */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-slate-800/50 hover:bg-slate-700/80 rounded-full text-white backdrop-blur-sm border border-slate-700 transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-slate-800/50 hover:bg-slate-700/80 rounded-full text-white backdrop-blur-sm border border-slate-700 transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Background decoration (Dynamic based on slide) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none transition-colors duration-1000">
        <div className={`absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[128px] bg-gradient-to-br ${SLIDES[currentSlide].bgGradient}`} />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center transition-all duration-500 transform key={currentSlide}">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-slate-200 text-xs font-bold mb-6 backdrop-blur-sm animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
          </span>
          {SLIDES[currentSlide].badge}
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight">
          {SLIDES[currentSlide].title}
          <br /> {SLIDES[currentSlide].subtitle}
        </h1>
        
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 min-h-[3.5rem]">
          {SLIDES[currentSlide].description}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] flex items-center justify-center gap-2"
          >
            Ver Catálogo <ChevronRight className="w-5 h-5" />
          </button>
          <button 
            onClick={onOpenBuilder}
            className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2 group hover:border-cyan-500/50"
          >
            Armar mi PC <Cpu className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
          </button>
        </div>
      </div>

      {/* Indicadores de Slide (Puntitos) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              idx === currentSlide ? 'bg-cyan-400 w-6' : 'bg-slate-600 hover:bg-slate-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;