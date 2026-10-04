
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, ChevronDown, SlidersHorizontal, Plus, ShoppingBag, Wine, ArrowRight, FileText } from 'lucide-react';
import ProductSheet from '../components/ProductSheet';
import { useTranslation } from 'react-i18next';
import { Product, WineCategory, User } from '../types';
import { BASE_IMG_URL } from '../constants';

interface ShopProps {
  wines: Product[];
  onAddToCart: (product: Product) => void;
  user: User | null;
}

const Shop: React.FC<ShopProps> = ({ wines, onAddToCart, user }) => {
  const { t } = useTranslation();
  const catalogRef = React.useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const catParam = searchParams.get('cat') as WineCategory | null;
  
  const [selectedCategory, setSelectedCategory] = useState<WineCategory | 'All'>(catParam || 'All');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('name');
  const [sheetWine, setSheetWine] = useState<Product | null>(null);

  // Sincronizza lo stato quando il parametro nell'URL cambia (es. cliccando dal footer)
  useEffect(() => {
    if (catParam) {
      setSelectedCategory(catParam);
    } else {
      setSelectedCategory('All');
    }
  }, [catParam]);

  const categories: (WineCategory | 'All')[] = ['All', 'Rosso', 'Bianco', 'Rosato', 'Bollicine'];

  const filteredWines = useMemo(() => {
    let result = [...wines];
    if (selectedCategory !== 'All') {
      result = result.filter(w => w.category === selectedCategory);
    }
    
    if (sortBy === 'price-asc') result.sort((a, b) => a.priceInCents - b.priceInCents);
    if (sortBy === 'price-desc') result.sort((a, b) => b.priceInCents - a.priceInCents);
    if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [wines, selectedCategory, sortBy]);

  const handleCategoryChange = (cat: WineCategory | 'All') => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('cat');
    } else {
      searchParams.set('cat', cat);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Header Section - Style from Proposta */}
      <section className="relative h-[60vh] flex items-center justify-center text-center">
        <div className="absolute inset-0">
          <img 
            src={`${BASE_IMG_URL}/AN2A6860.jpg`} 
            className="w-full h-full object-cover"
            alt="Cellar Barrels"
          />
          <div className="absolute inset-0 bg-burgundy/60"></div>
        </div>
        <div className="relative space-y-4 px-4">
          <h1 className="text-5xl md:text-7xl font-serif text-white italic">{t('shopHeader.title')}</h1>
          <p className="text-gold tracking-[0.4em] uppercase text-sm font-bold">{t('shopHeader.subtitle', 'Tradizione e Avanguardia')}</p>
        </div>
      </section>

      {/* Description Section */}
      <section className="max-w-4xl mx-auto px-4 space-y-12 text-center">
        <p className="text-earth/70 text-xl md:text-2xl leading-relaxed font-light italic whitespace-pre-line">
          {t('shopHeader.text')}
        </p>
        
        <div className="flex items-center justify-center">
          <button 
            onClick={() => catalogRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-gold text-white py-5 px-12 rounded-full text-[11px] font-black tracking-[0.3em] uppercase hover:bg-white hover:text-mustard transition-all shadow-2xl group inline-flex items-center"
          >
            {t('hero.cta')} <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform" size={16} />
          </button>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Filters & Sorting */}
        <div ref={catalogRef} className="flex flex-col md:flex-row justify-between items-center border-y border-burgundy/10 py-6 gap-6">
        <div className="flex flex-wrap justify-center gap-4">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-6 py-2 text-xs font-bold tracking-widest uppercase rounded-full transition-all border ${
                selectedCategory === cat 
                ? 'bg-burgundy text-white border-burgundy' 
                : 'bg-white text-earth border-burgundy/10 hover:border-gold'
              }`}
            >
              {cat === 'All' ? t('shop.filterAll') : t(`shop.categories.${cat}`)}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          <SlidersHorizontal size={18} className="text-gold" />
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-sm font-bold uppercase tracking-wider text-earth focus:outline-none"
          >
            <option value="name">{t('shop.sortName')}</option>
            <option value="price-asc">{t('shop.sortPriceAsc')}</option>
            <option value="price-desc">{t('shop.sortPriceDesc')}</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
        {filteredWines.map(wine => (
          <div key={wine.id} className="group flex flex-col">
            <div className="relative aspect-[3/4] overflow-hidden bg-cream mb-6">
              <Link to={`/shop/${wine.slug}`}>
                <img 
                  src={wine.image} 
                  alt={wine.name}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                />
                {/* Secondary Image on Hover */}
                <img 
                  src={wine.lifestyleImage} 
                  alt={`${wine.name} lifestyle`}
                  className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                />
              </Link>
              {user && (
                <button 
                  onClick={() => onAddToCart(wine)}
                  className="absolute bottom-4 right-4 bg-burgundy text-white p-4 rounded-full shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:bg-gold"
                >
                  <Plus size={24} />
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] text-gold uppercase tracking-[0.3em] font-bold">{t(`shop.categories.${wine.category}`)}</p>
                  <Link to={`/shop/${wine.slug}`} className="block">
                    <h3 className="text-xl font-serif text-burgundy italic group-hover:text-gold transition-colors">
                      {t(`products.${wine.id}.name`, wine.name)}
                    </h3>
                  </Link>
                  {(wine.id === '5' || wine.id === 'wm7jd5qa2' || wine.id === '4' || wine.id === 'x83huvlj8' || wine.id === '6' || wine.id === 'u948fxtip' || wine.id === 'qdb3phmp6' || wine.id === '1' || wine.id === '5hz0vmiqu' || wine.id === '3' || wine.id === 'e1um7i60n') && (
                    <button 
                      onClick={() => setSheetWine(wine)}
                      className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold hover:text-burgundy transition-colors mt-2"
                    >
                      <FileText size={12} /> {t('product.productSheet')}
                    </button>
                  )}
                  <p className="text-sm text-earth/60 italic">{wine.grape}, {wine.vintage} — {wine.liters} Lt</p>
                </div>
                <div className="text-right">
                  {user ? (
                    <p className="text-lg font-bold text-burgundy">
                      € {((user?.userType === 'BUSINESS' && wine.businessDiscountPercentage 
                        ? wine.priceInCents * (1 - wine.businessDiscountPercentage / 100) 
                        : wine.priceInCents) / 100).toFixed(2)}
                    </p>
                  ) : (
                    <Link to="/auth" className="text-[10px] text-gold font-bold uppercase tracking-widest hover:text-burgundy transition-colors">
                      {t('shop.loginToSeePrice')}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredWines.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <Wine size={48} className="mx-auto text-gold/20" />
          <p className="text-earth/60 italic">{t('shop.noProducts')}</p>
          <button onClick={() => handleCategoryChange('All')} className="text-burgundy underline font-bold text-sm tracking-widest uppercase">
            {t('shop.showAll')}
          </button>
        </div>
      )}
      </div>
      {sheetWine && (
        <ProductSheet 
          isOpen={!!sheetWine} 
          onClose={() => setSheetWine(null)} 
          wine={sheetWine} 
        />
      )}
    </div>
  );
};

export default Shop;
