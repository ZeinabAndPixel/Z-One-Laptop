import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Loader2, Minimize2 } from 'lucide-react';
import { getChatResponse } from '../services/gemini';
import { Product } from '../types';

interface ChatBotProps {
  products: Product[];
}

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
}

export const ChatBot: React.FC<ChatBotProps> = ({ products }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', role: 'bot', text: '¡Hola Ingeniero! Soy Z-One Bot. ¿Buscas una laptop para diseño, gaming o programación? Estoy aquí para asesorarte.' }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await getChatResponse(input, products);
      const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'bot', text: responseText };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      // Error handling handled inside getChatResponse usually, but fallback here just in case
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* Botón Flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[80] p-4 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all duration-300 hover:scale-110 flex items-center justify-center ${isOpen ? 'bg-slate-800 text-slate-400 rotate-90' : 'bg-cyan-600 text-white'}`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-8 h-8" />}
      </button>

      {/* Ventana de Chat */}
      <div className={`fixed bottom-24 right-6 z-[80] w-80 md:w-96 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-900/50 flex items-center justify-center border border-cyan-500/50">
              <Bot className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Z-One Bot</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wide">En Línea</span>
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
            <Minimize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 h-80 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-cyan-600 text-white rounded-br-none' 
                  : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 border border-slate-700">
                <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Escribe tu consulta..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-slate-600"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 disabled:text-slate-600 text-white p-2 rounded-full transition-colors flex items-center justify-center w-10 h-10 shadow-lg"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};