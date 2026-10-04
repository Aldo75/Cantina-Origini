
import React from 'react';
import { Scale, FileText, AlertTriangle, CreditCard, RefreshCcw, ShieldCheck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';

const Terms: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-serif text-mustard italic">{t('terms.title')}</h1>
        <p className="text-lavender tracking-[0.3em] uppercase text-sm font-bold">{t('terms.subtitle')}</p>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-lg shadow-sm border border-mustard/5 space-y-12">
        
        <section className="bg-red-50 p-6 rounded-xl border border-red-100 flex gap-4">
          <AlertTriangle className="text-red-600 shrink-0" size={24} />
          <div className="space-y-1">
            <h3 className="font-bold text-red-900 text-sm uppercase tracking-wider">{t('terms.minorsTitle')}</h3>
            <p className="text-sm text-red-800/80 leading-relaxed">
              {t('terms.minorsText')}
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-mustard">
            <Scale size={24} className="text-lavender" />
            <h2 className="text-2xl font-serif italic">{t('terms.section1Title')}</h2>
          </div>
          <p className="text-earth/70 text-sm leading-relaxed">
            <Trans i18nKey="terms.section1Text">
              I presenti Termini e Condizioni disciplinano la vendita dei prodotti commercializzati da <strong>Origini Srl Società Agricola</strong> tramite il sito web. Ogni ordine d'acquisto trasmesso implica l'accettazione integrale delle presenti condizioni.
            </Trans>
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-mustard">
            <CreditCard size={24} className="text-lavender" />
            <h2 className="text-2xl font-serif italic">{t('terms.section2Title')}</h2>
          </div>
          <p className="text-earth/70 text-sm leading-relaxed">
            {t('terms.section2Text')}
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-mustard">
            <RefreshCcw size={24} className="text-lavender" />
            <h2 className="text-2xl font-serif italic">{t('terms.section3Title')}</h2>
          </div>
          <p className="text-earth/70 text-sm leading-relaxed">
            {t('terms.section3Text')}
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-mustard">
            <ShieldCheck size={24} className="text-lavender" />
            <h2 className="text-2xl font-serif italic">{t('terms.section4Title')}</h2>
          </div>
          <p className="text-earth/70 text-sm leading-relaxed">
            <Trans i18nKey="terms.section4Text">
              Garantiamo l'integrità e la qualità di ogni bottiglia che lascia la nostra cantina. In caso di bottiglie danneggiate durante il trasporto o difettose (es. sapore di tappo), invitiamo il cliente a contattare tempestivamente il nostro servizio clienti all'indirizzo <span className="font-bold text-mustard">info@terredelpoggio.it</span> fornendo documentazione fotografica.
            </Trans>
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-mustard">
            <FileText size={24} className="text-lavender" />
            <h2 className="text-2xl font-serif italic">{t('terms.section5Title')}</h2>
          </div>
          <p className="text-earth/70 text-sm leading-relaxed">
            {t('terms.section5Text')}
          </p>
        </section>

      </div>

      <div className="text-center pt-8">
        <Link to="/shop" className="bg-mustard text-white px-10 py-4 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-lavender transition-all shadow-xl inline-flex items-center gap-3">
          {t('common.backToShop')} <ChevronRight size={16} />
        </Link>
      </div>
      
      <div className="text-center">
        <p className="text-[10px] text-earth/40 uppercase tracking-[0.2em]">{t('terms.lastUpdate')}</p>
      </div>
    </div>
  );
};

export default Terms;
