
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageCircle, X, Send, Loader2, Wine } from 'lucide-react';
import { CartItem } from '../types';

interface AISommelierProps {
  cart: CartItem[];
}

const AISommelier: React.FC<AISommelierProps> = ({ cart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
      if (!apiKey) {
        setMessages(prev => [
          ...prev,
          {
            role: 'ai',
            text: "Benvenuto a Cantina Terre del Poggio! Per le nostre eccellenze come il Montepulciano d'Abruzzo DOC o il Pecorino Superiore, ti consiglio abbinamenti con piatti tradizionali della nostra terra o carni saporite."
          }
        ]);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const cartContext = cart.length > 0 
        ? `L'utente ha nel carrello: ${cart.map(i => `${i.name} (${i.vintage})`).join(', ')}.` 
        : "Il carrello dell'utente è vuoto.";

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userMessage,
        config: {
          systemInstruction: `Sei il Sommelier Virtuale della Cantina Terre del Poggio. 
          Aiuti gli utenti a scegliere il vino perfetto o ad abbinare i vini della cantina ai piatti.
          ${cartContext}
          Parla in modo elegante, esperto ma accogliente. Focus sul territorio di Poggiofiorito e l'influenza del mare Adriatico.
          Vini disponibili: Montepulciano, Pecorino, Cerasuolo, Trebbiano, Cococciola, Passerina.
          Rispondi in italiano.`,
        },
      });

      const aiText = response.text || "Mi dispiace, sto avendo difficoltà a connettermi alla cantina. Riprova più tardi.";
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error: any) {
      if (
        error?.name === 'AbortError' ||
        error?.message?.includes('The user aborted a request') ||
        error?.message?.toLowerCase().includes('abort')
      ) {
        console.warn('AI request was aborted');
        return;
      }
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "Si è verificato un errore nella degustazione virtuale. Riprova più tardi." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-burgundy text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center space-x-2 group"
        >
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-sm font-bold tracking-widest uppercase pl-0 group-hover:pl-2">Sommelier AI</span>
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="bg-cream w-[350px] sm:w-[400px] h-[500px] rounded-2xl shadow-2xl flex flex-col border border-burgundy/10 overflow-hidden">
          <div className="bg-burgundy p-4 flex justify-between items-center text-white">
            <div className="flex items-center space-x-2">
              <Wine className="text-gold" />
              <h3 className="font-serif text-lg font-bold">Sommelier Virtuale</h3>
            </div>
            <button onClick={() => setIsOpen(false)}><X size={20} /></button>
          </div>

          <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center mt-10 space-y-2">
                <Wine className="mx-auto text-gold mb-4" size={48} />
                <p className="text-earth font-serif text-lg italic">"Ogni vino ha una storia, vuoi che ti aiuti a trovare la tua?"</p>
                <p className="text-sm text-earth/60">Chiedimi abbinamenti o consigli sui nostri vini.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  m.role === 'user' ? 'bg-burgundy text-white' : 'bg-gold/10 text-earth border border-gold/20'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gold/10 p-3 rounded-lg">
                  <Loader2 size={20} className="animate-spin text-gold" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-burgundy/10 flex space-x-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Chiedi al sommelier..."
              className="flex-grow bg-cream rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="bg-burgundy text-white p-2 rounded-full hover:bg-earth transition-colors disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISommelier;
