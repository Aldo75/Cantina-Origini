import React from 'react';
import { useTranslation } from 'react-i18next';
import { Hammer, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Staff: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gold/20 blur-3xl rounded-full"></div>
          <Hammer size={80} className="text-gold relative animate-bounce" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif text-burgundy italic">
            {t('common.underConstruction')}
          </h1>
          <p className="text-earth/60 text-lg italic leading-relaxed">
            {t('common.underConstructionText')}
          </p>
        </div>

        <div className="pt-8">
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-3 bg-burgundy text-white px-8 py-4 rounded-full text-[11px] font-black tracking-[0.3em] uppercase hover:bg-gold transition-all shadow-xl group"
          >
            {t('common.backToShop')}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Staff;
