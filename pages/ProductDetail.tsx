
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Droplets, FlaskConical, AlertCircle, Utensils, QrCode, Minus, Plus, Truck, ShieldCheck, FileText } from 'lucide-react';
import ProductSheet from '../components/ProductSheet';
import { useTranslation } from 'react-i18next';
import { Product, User } from '../types';

interface ProductDetailProps {
  wines: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
  user: User | null;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ wines, onAddToCart, user }) => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const navigate = useNavigate();
  const wine = wines.find(w => w.slug === slug);
  const [quantity, setQuantity] = useState(1);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  if (!wine) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-serif text-burgundy">{t('product.notFound')}</h1>
        <Link to="/shop" className="text-burgundy underline">{t('product.backToShop')}</Link>
      </div>
    );
  }

  const price = (user?.userType === 'BUSINESS' && wine.businessDiscountPercentage) 
    ? wine.priceInCents * (1 - wine.businessDiscountPercentage / 100) 
    : wine.priceInCents;

  const translatedPairings = t(`products.${wine.id}.pairings`, { returnObjects: true });
  const pairings = Array.isArray(translatedPairings) ? translatedPairings : wine.pairings;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      <Link to="/shop" className="inline-flex items-center text-sm font-bold tracking-widest uppercase text-earth hover:text-gold transition-colors">
        <ArrowLeft className="mr-2" size={16} /> {t('product.backToCatalog')}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-[3/4] bg-cream rounded-sm overflow-hidden">
            <img src={wine.image} alt={wine.name} className="w-full h-full object-cover" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square bg-cream rounded-sm overflow-hidden">
              <img src={wine.lifestyleImage} alt={`${wine.name} lifestyle`} className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square bg-burgundy/5 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <QrCode size={40} className="text-burgundy" />
              <p className="text-[10px] text-earth uppercase font-bold tracking-tighter">{t('product.qrInfo')}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          <div className="space-y-2">
            <p className="text-gold tracking-[0.3em] uppercase text-xs font-bold">{t(`shop.categories.${wine.category}`)} | {wine.vintage}</p>
            <h1 className="text-5xl font-serif text-burgundy italic">{t(`products.${wine.id}.name`, wine.name)}</h1>
            {user ? (
              <p className="text-2xl font-bold text-burgundy">
                € {(price / 100).toFixed(2)}
              </p>
            ) : (
              <Link to="/auth" className="inline-block text-sm text-gold font-bold uppercase tracking-widest hover:text-burgundy transition-colors border-b border-gold">
                {t('product.loginToSeePrice')}
              </Link>
            )}
          </div>

          <p className="text-earth/80 leading-relaxed text-lg font-light italic">
            "{t(`products.${wine.id}.description`, wine.description)}"
          </p>

          <div className="grid grid-cols-3 gap-8 border-y border-burgundy/10 py-8">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gold/10 text-gold rounded-full"><FlaskConical size={20} /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-earth/50">{t('product.alcohol')}</p>
                <p className="text-sm font-bold text-earth">{wine.alcohol}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gold/10 text-gold rounded-full"><Droplets size={20} /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-earth/50">{t('product.format')}</p>
                <p className="text-sm font-bold text-earth">{wine.liters} Lt</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gold/10 text-gold rounded-full"><AlertCircle size={20} /></div>
              <div>
                <p className="text-[10px] uppercase font-bold text-earth/50">{t('product.allergens')}</p>
                <p className="text-sm font-bold text-earth">
                  {wine.allergens === 'Contiene solfiti' ? t('product.containsSulfites') : wine.allergens}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {(wine.id === '5' || wine.id === 'wm7jd5qa2' || wine.id === '4' || wine.id === 'x83huvlj8' || wine.id === '6' || wine.id === 'u948fxtip' || wine.id === 'qdb3phmp6' || wine.id === '1' || wine.id === '5hz0vmiqu' || wine.id === '3' || wine.id === 'e1um7i60n') && (
              <button 
                onClick={() => setIsSheetOpen(true)}
                className="w-full border-2 border-gold text-gold py-4 px-8 rounded font-bold tracking-widest uppercase hover:bg-gold hover:text-white transition-all flex items-center justify-center gap-3"
              >
                <FileText size={20} /> {t('product.productSheet')}
              </button>
            )}
            <div className="flex items-center space-x-6">
              <div className="flex items-center border border-burgundy/20 rounded-full px-4 py-2">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 hover:text-gold"><Minus size={18}/></button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-1 hover:text-gold"><Plus size={18}/></button>
              </div>
              <button 
                onClick={() => {
                  if (!user) {
                    navigate('/auth');
                    return;
                  }
                  onAddToCart(wine, quantity);
                }}
                className="flex-grow bg-burgundy text-white py-4 px-8 rounded font-bold tracking-widest uppercase hover:bg-earth transition-all shadow-xl flex items-center justify-center"
              >
                {user ? t('product.addToCart') : t('product.loginToBuy')} <ShoppingBag className="ml-3" size={20} />
              </button>
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-center text-[10px] text-earth/40 uppercase tracking-widest">{t('product.freeShippingInfo')}</p>
              <div className="flex gap-4">
                <ShieldCheck size={16} className="text-gold" />
                <Truck size={16} className="text-gold" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasting Notes */}
      <section className="bg-white p-12 md:p-20 rounded-lg shadow-sm space-y-16">
        <h2 className="text-3xl font-serif text-center text-burgundy italic">{t('product.tastingTitle')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 border border-gold flex items-center justify-center rounded-full text-gold">I</div>
            <h3 className="font-bold tracking-widest uppercase text-xs">{t('product.visual')}</h3>
            <p className="text-sm text-earth/70 leading-relaxed italic">{t(`products.${wine.id}.visual`, wine.tastingNotes.visual)}</p>
          </div>
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 border border-gold flex items-center justify-center rounded-full text-gold">II</div>
            <h3 className="font-bold tracking-widest uppercase text-xs">{t('product.olfactory')}</h3>
            <p className="text-sm text-earth/70 leading-relaxed italic">{t(`products.${wine.id}.olfactory`, wine.tastingNotes.olfactory)}</p>
          </div>
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 border border-gold flex items-center justify-center rounded-full text-gold">III</div>
            <h3 className="font-bold tracking-widest uppercase text-xs">{t('product.gustatory')}</h3>
            <p className="text-sm text-earth/70 leading-relaxed italic">{t(`products.${wine.id}.gustatory`, wine.tastingNotes.gustatory)}</p>
          </div>
        </div>
      </section>

      {/* Pairings */}
      <section className="space-y-8">
        <div className="flex items-center justify-center space-x-4">
          <div className="h-px bg-gold flex-grow"></div>
          <h2 className="text-2xl font-serif italic text-burgundy flex items-center">
            <Utensils className="mr-3 text-gold" size={24} /> {t('product.pairings')}
          </h2>
          <div className="h-px bg-gold flex-grow"></div>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {pairings.map(pair => (
            <span key={pair} className="bg-cream border border-burgundy/10 px-8 py-3 rounded-full text-sm font-medium text-earth uppercase tracking-widest">
              {pair}
            </span>
          ))}
        </div>
      </section>

      {/* Product Sheet Modal */}
      <ProductSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)} 
        wine={wine} 
      />
    </div>
  );
};


export default ProductDetail;
