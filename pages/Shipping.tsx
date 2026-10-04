
import React from 'react';
import { Truck, ShieldCheck, Package, Globe, Clock, ChevronRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { ShippingSettings, User } from '../types';

interface ShippingProps {
  settings: ShippingSettings;
  user: User | null;
}

const Shipping: React.FC<ShippingProps> = ({ settings, user }) => {
  const { t } = useTranslation();
  const formatPrice = (cents: number | undefined) => {
    if (cents === undefined) return 'N/A';
    return `€ ${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-serif text-mustard italic">{t('shipping.title')}</h1>
        <p className="text-lavender tracking-[0.3em] uppercase text-sm font-bold">{t('shipping.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-mustard/5 space-y-4">
          <div className="flex items-center gap-3 text-mustard">
            <ShieldCheck size={24} className="text-lavender" />
            <h2 className="text-xl font-serif italic">{t('shipping.packagingTitle')}</h2>
          </div>
          <p className="text-earth/70 text-sm leading-relaxed">
            <Trans i18nKey="shipping.packagingText">
              Utilizziamo esclusivamente cantinette in <strong>cartone ondulato rinforzato</strong> e brevettato, progettate per assorbire gli urti e isolare termicamente le bottiglie durante il trasporto.
            </Trans>
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-mustard/5 space-y-4">
          <div className="flex items-center gap-3 text-mustard">
            <Clock size={24} className="text-lavender" />
            <h2 className="text-xl font-serif italic">{t('shipping.deliveryTitle')}</h2>
          </div>
          <p className="text-earth/70 text-sm leading-relaxed">
            {t('shipping.deliveryText')}
          </p>
        </div>
      </div>

      <div className="bg-mustard/5 p-10 rounded-3xl border border-mustard/10 space-y-8">
        <h2 className="text-2xl font-serif text-mustard italic text-center">{t('shipping.ratesTitle')}</h2>
        {user ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-bold text-earth/40 tracking-widest">{t('shipping.italyStandard')}</p>
              <p className="text-2xl font-serif text-mustard">{formatPrice(settings?.italy?.cost)}</p>
              <p className="text-[9px] text-earth/50">{t('shipping.freeFrom')} {formatPrice(settings?.italy?.freeThreshold)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-bold text-earth/40 tracking-widest">{t('shipping.islands')}</p>
              <p className="text-2xl font-serif text-mustard">{formatPrice(settings?.islands?.cost)}</p>
              <p className="text-[9px] text-earth/50">{t('shipping.freeFrom')} {formatPrice(settings?.islands?.freeThreshold)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-bold text-earth/40 tracking-widest">{t('shipping.europe')}</p>
              <p className="text-2xl font-serif text-mustard">{formatPrice(settings?.europe?.cost)}</p>
              <p className="text-[9px] text-earth/50">{t('shipping.freeFrom')} {formatPrice(settings?.europe?.freeThreshold)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-bold text-earth/40 tracking-widest">{t('shipping.world')}</p>
              <p className="text-2xl font-serif text-mustard">{formatPrice(settings?.world?.cost)}</p>
              <p className="text-[9px] text-earth/50">{t('shipping.freeFrom')} {formatPrice(settings?.world?.freeThreshold)}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Link to="/auth" className="inline-block text-sm text-mustard font-bold uppercase tracking-widest hover:text-lavender transition-colors border-b border-mustard">
              {t('shop.loginToSeePrice')}
            </Link>
          </div>
        )}
        <div className="pt-4 border-t border-mustard/10 text-center">
          <p className="text-[10px] text-earth/40 uppercase tracking-widest font-bold flex items-center justify-center gap-2">
            <MapPin size={12} /> {t('shipping.ratesSubtitle')}
          </p>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-3 text-mustard border-b border-mustard/10 pb-4">
          <Truck size={24} className="text-lavender" />
          <h2 className="text-2xl font-serif italic">{t('shipping.trackingTitle')}</h2>
        </div>
        <p className="text-earth/70 text-sm leading-relaxed">
          {t('shipping.trackingText')}
        </p>
      </section>

      <div className="text-center pt-8">
        <Link to="/shop" className="bg-mustard text-white px-10 py-4 rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-lavender transition-all shadow-xl inline-flex items-center gap-3">
          {t('common.backToShop')} <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default Shipping;
