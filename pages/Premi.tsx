
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Trophy } from 'lucide-react';

const Premi: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 space-y-8">
      <div className="p-6 bg-burgundy/5 rounded-full">
        <Trophy size={64} className="text-burgundy animate-bounce" />
      </div>
      <div className="space-y-4 max-w-lg">
        <h1 className="text-4xl md:text-5xl font-serif text-burgundy italic">
          {t('common.underConstruction')}
        </h1>
        <p className="text-earth/70 text-lg leading-relaxed">
          {t('common.underConstructionText')}
        </p>
      </div>
      <div className="w-24 h-1 bg-gold/30 rounded-full"></div>
    </div>
  );
};

export default Premi;
