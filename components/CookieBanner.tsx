
import React, { useState, useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('gdpr-consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('gdpr-consent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('gdpr-consent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-[70] animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-white rounded-2xl shadow-2xl border border-burgundy/10 p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 text-burgundy">
            <ShieldCheck size={24} className="text-gold" />
            <h3 className="font-serif text-lg font-bold italic">La tua Privacy</h3>
          </div>
          <button onClick={handleDecline} className="text-earth/40 hover:text-burgundy">
            <X size={20} />
          </button>
        </div>
        
        <p className="text-sm text-earth/70 leading-relaxed font-light">
          Utilizziamo i cookie per migliorare la tua esperienza di navigazione tra i nostri vigneti virtuali e per analizzare il traffico del sito. Scopri di più nella nostra <Link to="/privacy" className="text-gold underline underline-offset-4" onClick={() => setIsVisible(false)}>Cookie Policy</Link>.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button 
            onClick={handleAccept}
            className="flex-grow bg-burgundy text-white py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gold transition-all"
          >
            Accetta Tutti
          </button>
          <button 
            onClick={handleDecline}
            className="flex-grow border border-burgundy/20 text-burgundy py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-burgundy/5 transition-all"
          >
            Solo Necessari
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
