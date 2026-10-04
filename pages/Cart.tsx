
import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import { CartItem, ShippingSettings, User } from '../types';

interface CartProps {
  cart: CartItem[];
  onUpdateQty: (id: string, delta: number) => void;
  shippingSettings: ShippingSettings;
  user: User | null;
}

const Cart: React.FC<CartProps> = ({ cart, onUpdateQty, shippingSettings, user }) => {
  const { t } = useTranslation();
  const itemsTotal = cart.reduce((acc, item) => acc + (item.priceInCents * item.quantity), 0);
  
  const businessDiscount = cart.reduce((acc, item) => {
    if (user?.userType === 'BUSINESS' && item.businessDiscountPercentage) {
      return acc + (item.priceInCents * (item.businessDiscountPercentage / 100) * item.quantity);
    }
    return acc;
  }, 0);

  const subtotal = itemsTotal - businessDiscount;
  
  // Default shipping estimate (Italy Standard)
  const italyTier = shippingSettings?.italy || { cost: 1500, freeThreshold: 15000 };
  const isFree = itemsTotal >= italyTier.freeThreshold;
  const estimatedShipping = isFree ? 0 : italyTier.cost;
  const total = subtotal + estimatedShipping;
  const vatAmount = total * 0.22 / 1.22;
  const taxableAmount = total - vatAmount;

  const missingForFree = italyTier.freeThreshold - itemsTotal;

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center space-y-8">
        <div className="mx-auto w-24 h-24 bg-burgundy/5 flex items-center justify-center rounded-full text-burgundy/20">
          <ShoppingBag size={48} />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-serif text-burgundy">{t('cart.empty')}</h1>
          <p className="text-earth/60">{t('cart.emptyText')}</p>
        </div>
        <Link to="/shop" className="inline-block bg-burgundy text-white px-10 py-4 rounded font-bold tracking-widest uppercase hover:bg-gold transition-all">
          {t('cart.backToShop')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif text-burgundy italic mb-12">{t('cart.title')}</h1>

      {!isFree && (
        <div className="bg-gold/10 border border-gold/20 p-6 rounded-lg mb-12 flex items-center gap-4 animate-pulse">
          <Truck className="text-gold" size={24} />
          <div className="space-y-1">
            <p className="text-sm text-earth">
              <Trans 
                i18nKey="cart.shippingPromo" 
                values={{ amount: (missingForFree / 100).toFixed(2) }}
                components={[<span className="font-bold" />, <span className="font-bold uppercase" />]}
              />
            </p>
            <p className="text-[10px] text-earth/50 italic">
              {t('cart.shippingPromoInfo')}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-burgundy/10 p-6 rounded-lg mb-12 flex items-center gap-4">
        <div className="w-10 h-10 bg-burgundy/5 rounded-full flex items-center justify-center flex-shrink-0">
          <ArrowRight className="text-burgundy" size={20} />
        </div>
        <p className="text-xs text-earth/80 leading-relaxed">
          <Trans 
            i18nKey="cart.bulkOrderContact"
            components={[
              <span className="font-bold" />,
              <a href="mailto:info@terredelpoggio.it" className="text-burgundy hover:text-gold transition-colors font-bold" />,
              <span className="font-bold text-burgundy" />
            ]}
          />
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-8">
          {cart.map(item => (
            <div key={item.id} className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 border-b border-burgundy/10 pb-8">
              <div className="w-24 h-32 bg-cream rounded-sm overflow-hidden flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-grow space-y-1 text-center sm:text-left">
                <p className="text-[10px] text-gold uppercase tracking-widest font-bold">{t(`shop.categories.${item.category}`)}</p>
                <h3 className="text-lg font-serif text-burgundy">{t(`products.${item.id}.name`, item.name)}</h3>
                <p className="text-xs text-earth/50">{item.grape}, {item.vintage}</p>
              </div>
              <div className="flex items-center border border-burgundy/20 rounded-full px-3 py-1">
                <button onClick={() => onUpdateQty(item.id, -1)} className="p-1 hover:text-gold"><Minus size={14}/></button>
                <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                <button onClick={() => onUpdateQty(item.id, 1)} className="p-1 hover:text-gold"><Plus size={14}/></button>
              </div>
              <div className="text-right w-full sm:w-24">
                <p className="font-bold text-burgundy">
                  € {((item.priceInCents * item.quantity) / 100).toFixed(2)}
                </p>
              </div>
              <button onClick={() => onUpdateQty(item.id, -item.quantity)} className="text-earth/30 hover:text-burgundy">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-burgundy/5 p-8 rounded-sm h-fit space-y-8">
          <h2 className="text-xl font-serif text-burgundy italic">{t('cart.summary')}</h2>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between text-earth/70">
              <span>{t('cart.subtotal')}</span>
              <span>€ {(itemsTotal / 100).toFixed(2)}</span>
            </div>
            {businessDiscount > 0 && (
              <div className="flex justify-between text-burgundy font-bold">
                <span>Sconto Dettaglio</span>
                <span>- € {(businessDiscount / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-earth/70">
              <span className="flex items-center gap-2">{t('cart.shippingEstimate')}</span>
              <span>{estimatedShipping === 0 ? t('common.free') : `€ ${(estimatedShipping / 100).toFixed(2)}`}</span>
            </div>
            <div className="pt-4 border-t border-burgundy/10 space-y-2">
              <div className="flex justify-between text-[10px] text-earth/40 uppercase tracking-widest">
                <span>{t('cart.taxableAmount')}</span>
                <span>€ {(taxableAmount / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-earth/40 uppercase tracking-widest">
                <span>{t('cart.vatAmount')}</span>
                <span>€ {(vatAmount / 100).toFixed(2)}</span>
              </div>
            </div>
            <div className="pt-2 flex justify-between font-bold text-lg text-burgundy">
              <span>{t('cart.total')}</span>
              <span>€ {(total / 100).toFixed(2)}</span>
            </div>
          </div>
          <Link 
            to="/checkout" 
            className="w-full block bg-burgundy text-white py-4 rounded text-center font-bold tracking-widest uppercase hover:bg-gold transition-all shadow-lg"
          >
            {t('cart.checkout')}
          </Link>
          <div className="space-y-4 pt-4 text-[10px] text-earth/50 uppercase tracking-widest leading-relaxed">
            <p className="flex items-center"><ArrowRight size={10} className="mr-2" /> {t('cart.features.packaging')}</p>
            <p className="flex items-center"><ArrowRight size={10} className="mr-2" /> {t('cart.features.international')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
