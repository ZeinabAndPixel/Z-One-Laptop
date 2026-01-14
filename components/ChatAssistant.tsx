import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MessageSquare, Send, X } from 'lucide-react';

const ChatAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: string, text: string}[]>([]);

  const handleSend = async () => {
    // ESTO ES PARA DEPURAR (DEBUG)
const apiKey = import.meta.env.VITE_GOOGLE_AI_KEY;
console.log("¿Qué llave ve el código?:", apiKey ? "Una llave que empieza por " + apiKey.substring(0, 5) : "NADA (está vacía ❌)");
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', text: input };
    setMessages([...messages, userMsg]);
    console.log("¿Mi llave existe?", !!import.meta.env.VITE_GOOGLE_AI_KEY);
    setInput('');

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_KEY);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: "Eres el asistente experto de Z-ONE LAPTOP en El Tigre, Venezuela. Ayudas a clientes a elegir laptops potentes, componentes de pc, perifericos,etc. Sé amable y profesional."
      });

      const result = await model.generateContent(input);
      const response = await result.response;
      setMessages(prev => [...prev, { role: 'bot', text: response.text() }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Lo siento, Zei, hubo un error de conexión." }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[200]">
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} className="bg-cyan-500 p-4 rounded-full shadow-lg hover:scale-110 transition-transform">
          <MessageSquare className="text-slate-900" />
        </button>
      ) : (
        <div className="bg-slate-900 border border-slate-800 w-80 h-96 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
          <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
            <span className="text-cyan-400 font-bold">Z-One Bot</span>
            <button onClick={() => setIsOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-2 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={`${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block p-2 rounded-lg ${m.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-200'}`}>
                  {m.text}
                </span>
              </div>
            ))}
          </div>
          <div className="p-2 border-t border-slate-800 flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-white outline-none" placeholder="Pregúntame algo..." />
            <button onClick={handleSend} className="p-2 bg-cyan-500 rounded-lg text-slate-900"><Send className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAssistant;