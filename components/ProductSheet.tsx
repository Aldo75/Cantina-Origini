
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Product } from '../types';

interface ProductSheetProps {
  isOpen: boolean;
  onClose: () => void;
  wine: Product;
}

const ProductSheet: React.FC<ProductSheetProps> = ({ isOpen, onClose, wine }) => {
  const { t } = useTranslation();
  
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-burgundy/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl flex flex-col md:flex-row"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-10 p-2 bg-burgundy text-white rounded-full hover:bg-gold transition-colors"
            >
              <X size={24} />
            </button>
 
            <div className="flex-grow p-8 md:p-12 space-y-10">
              <div className="space-y-2 border-b border-burgundy/10 pb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-burgundy/40">{t('product.productSheet')}</p>
                <h2 className="text-4xl font-serif text-burgundy italic">{t(`products.${wine.id}.sheet.title`)}</h2>
                <p className="text-gold font-bold tracking-[0.3em] uppercase text-xs">{t(`products.${wine.id}.sheet.type`)}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <section className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-burgundy/40 border-b border-burgundy/5 pb-1">{t('sheet.sections.vineyards')}</h3>
                    <div className="space-y-4 text-sm text-earth/80">
                      <div>
                        <p className="font-bold text-earth uppercase text-[10px]">{t('sheet.fields.zone')}</p>
                        <p>{t(`products.${wine.id}.sheet.zone`)}</p>
                      </div>
                      <div>
                        <p className="font-bold text-earth uppercase text-[10px]">{t('sheet.fields.grapes')}</p>
                        <p>{t(`products.${wine.id}.sheet.grapes`)}</p>
                      </div>
                      <div>
                        <p className="font-bold text-earth uppercase text-[10px]">{t('sheet.fields.harvest')}</p>
                        <p>{t(`products.${wine.id}.sheet.harvest`)}</p>
                      </div>
                      <div>
                        <p className="font-bold text-earth uppercase text-[10px]">{t('sheet.fields.vinification')}</p>
                        <p className="leading-relaxed">{t(`products.${wine.id}.sheet.vinification`)}</p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-burgundy/40 border-b border-burgundy/5 pb-1">{t('sheet.sections.characteristics')}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm text-earth/80">
                      <div>
                        <p className="font-bold text-earth uppercase text-[10px]">{t('sheet.fields.alcohol')}</p>
                        <p>{t(`products.${wine.id}.sheet.alcohol`)}</p>
                      </div>
                      <div>
                        <p className="font-bold text-earth uppercase text-[10px]">{t('sheet.fields.extract')}</p>
                        <p>{t(`products.${wine.id}.sheet.extract`)}</p>
                      </div>
                      <div>
                        <p className="font-bold text-earth uppercase text-[10px]">{t('sheet.fields.acidity')}</p>
                        <p>{t(`products.${wine.id}.sheet.acidity`)}</p>
                      </div>
                      <div>
                        <p className="font-bold text-earth uppercase text-[10px]">{t('sheet.fields.ph')}</p>
                        <p>{t(`products.${wine.id}.sheet.ph`)}</p>
                      </div>
                      <div>
                        <p className="font-bold text-earth uppercase text-[10px]">{t('sheet.fields.so2Total')}</p>
                        <p>{t(`products.${wine.id}.sheet.so2Total`)}</p>
                      </div>
                      <div>
                        <p className="font-bold text-earth uppercase text-[10px]">{t('sheet.fields.so2Free')}</p>
                        <p>{t(`products.${wine.id}.sheet.so2Free`)}</p>
                      </div>
                      <div>
                        <p className="font-bold text-earth uppercase text-[10px]">{t('sheet.fields.sugar')}</p>
                        <p>{t(`products.${wine.id}.sheet.sugar`)}</p>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="space-y-8">
                  <section className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-burgundy/40 border-b border-burgundy/5 pb-1">{t('sheet.sections.organoleptic')}</h3>
                    <div className="space-y-4 text-sm text-earth/80">
                      <div>
                        <p className="font-bold text-earth uppercase text-[10px]">{t('sheet.fields.color')}</p>
                        <p>{t(`products.${wine.id}.sheet.color`)}</p>
                      </div>
                      <div>
                        <p className="font-bold text-earth uppercase text-[10px]">{t('sheet.fields.odor')}</p>
                        <p className="leading-relaxed">{t(`products.${wine.id}.sheet.odor`)}</p>
                      </div>
                      <div>
                        <p className="font-bold text-earth uppercase text-[10px]">{t('sheet.fields.taste')}</p>
                        <p className="leading-relaxed">{t(`products.${wine.id}.sheet.taste`)}</p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-burgundy/40 border-b border-burgundy/5 pb-1">{t('sheet.sections.service')}</h3>
                    <div className="space-y-4 text-sm text-earth/80">
                      <div>
                        <p className="font-bold text-earth uppercase text-[10px]">{t('sheet.fields.temp')}</p>
                        <p>{t(`products.${wine.id}.sheet.temp`)}</p>
                      </div>
                      <div>
                        <p className="font-bold text-earth uppercase text-[10px]">{t('sheet.fields.pairings')}</p>
                        <p className="leading-relaxed">{t(`products.${wine.id}.sheet.pairings`)}</p>
                      </div>
                      <div>
                        <p className="font-bold text-earth uppercase text-[10px]">{t('sheet.fields.storage')}</p>
                        <p>{t(`products.${wine.id}.sheet.storage`)}</p>
                      </div>
                      <div>
                        <p className="font-bold text-earth uppercase text-[10px]">{t('sheet.fields.transport')}</p>
                        <p>{t(`products.${wine.id}.sheet.transport`)}</p>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </div>

            <div className="w-full md:w-[40%] bg-cream flex items-center justify-center overflow-hidden relative min-h-[400px]">
              <img 
                src={wine.image} 
                alt={wine.name} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-burgundy/5 pointer-events-none"></div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProductSheet;
