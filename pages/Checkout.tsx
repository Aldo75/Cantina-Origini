
import React, { useState, useMemo } from 'react';
import { ShieldCheck, CreditCard, Truck, Globe, ChevronDown, Phone } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';
import { CartItem, User, Order, OrderStatus, ShippingSettings, PaymentMethod, SiteSettings } from '../types';
import { useNavigate } from 'react-router-dom';

interface CheckoutProps {
  cart: CartItem[];
  user: User | null;
  onOrderComplete: (order: Order) => void;
  shippingSettings: ShippingSettings;
  siteSettings: SiteSettings;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, user, onOrderComplete, shippingSettings, siteSettings }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<'PROFILE' | 'PAYMENT'>('PROFILE');
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(() => {
    if (siteSettings.paymentSettings.stripeEnabled) return 'STRIPE';
    if (siteSettings.paymentSettings.contrassegnoEnabled) return 'CONTRASSEGNO';
    if (siteSettings.paymentSettings.bonificoEnabled) return 'BONIFICO';
    return 'STRIPE';
  });
  const navigate = useNavigate();
  const orderId = useMemo(() => 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase(), []);

  const [formData, setFormData] = useState({
    name: user?.profile?.name || '',
    surname: user?.profile?.surname || '',
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    address: user?.profile?.address || '',
    city: user?.profile?.city || '',
    zip: user?.profile?.zip || '',
    country: user?.profile?.country || 'Italia',
    isIsland: false
  });

  const [formError, setFormError] = useState<string | null>(null);

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  const itemsTotal = cart.reduce((acc, item) => acc + (item.priceInCents * item.quantity), 0);
  
  const businessDiscount = cart.reduce((acc, item) => {
    if (user?.userType === 'BUSINESS' && item.businessDiscountPercentage) {
      return acc + (item.priceInCents * (item.businessDiscountPercentage / 100) * item.quantity);
    }
    return acc;
  }, 0);

  const subtotal = itemsTotal - businessDiscount;
  
  const getShippingCost = () => {
    let tier = shippingSettings.italy; // Default to Italy
    
    if (formData.country === 'Italia') {
      tier = formData.isIsland ? shippingSettings.islands : shippingSettings.italy;
    } else if (shippingSettings.europeanCountries?.includes(formData.country)) {
      tier = shippingSettings.europe;
    } else {
      tier = shippingSettings.world;
    }

    // Safety guard if tier is still undefined for some reason
    if (!tier) return 0;

    // Use itemsTotal (undiscounted) for shipping threshold as per common business practice
    // and to ensure discount doesn't penalize user on shipping
    if (itemsTotal >= tier.freeThreshold) return 0;
    return tier.cost;
  };

  const shipping = getShippingCost();
  
  const paymentDiscountPercentage = paymentMethod === 'CONTRASSEGNO' 
    ? siteSettings.paymentSettings.contrassegnoDiscount 
    : paymentMethod === 'BONIFICO' 
      ? siteSettings.paymentSettings.bonificoDiscount 
      : 0;

  const paymentDiscountInCents = Math.round(subtotal * (paymentDiscountPercentage / 100));
  const total = subtotal + shipping - paymentDiscountInCents;
  const vatAmount = total * 0.22 / 1.22;
  const taxableAmount = total - vatAmount;

  const isProfileValid = () => {
    return (
      formData.name.trim().length > 1 &&
      formData.surname.trim().length > 1 &&
      formData.phone.trim().length > 5 &&
      formData.address.trim().length > 5 &&
      formData.city.trim().length > 1 &&
      formData.zip.trim().length >= 5
    );
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder: Order = {
      id: orderId,
      userId: user?.id || 'guest',
      userEmail: formData.email,
      userName: `${formData.name} ${formData.surname}`,
      userPhone: formData.phone,
      userAddress: `${formData.address}, ${formData.city} (${formData.zip})`,
      items: cart,
      totalAmount: total,
      shippingCost: shipping,
      status: (paymentMethod === 'STRIPE' || paymentMethod === 'CONTRASSEGNO') ? OrderStatus.PAID : OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      shippingCountry: formData.country,
      paymentMethod,
      paymentDiscountInCents
    };
    onOrderComplete(newOrder);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center space-y-8">
        <div className="mx-auto w-20 h-20 bg-green-100 flex items-center justify-center rounded-full text-green-600">
          <ShieldCheck size={48} />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-serif text-burgundy italic">{t('checkout.successTitle')}</h1>
          <p className="text-earth/60">
            <Trans 
              i18nKey="checkout.successText" 
              values={{ country: formData.country }}
              components={[<strong />]}
            />
          </p>
        </div>
        <div className="bg-burgundy/5 p-8 rounded border border-burgundy/10 text-left">
           <p className="text-[10px] uppercase font-bold tracking-widest text-earth/50">{t('checkout.shippingSummary')}</p>
           <p className="text-sm text-earth mt-2 font-bold">{formData.name} {formData.surname}</p>
           <p className="text-sm text-earth italic">{formData.address}, {formData.city}, {formData.country}</p>
           <p className="text-sm text-earth mt-1 flex items-center gap-2"><Phone size={12} className="text-gold" /> {formData.phone}</p>
        </div>
        <button onClick={() => navigate(user ? (user.role === 'ADMIN' ? '/admin' : '/account') : '/')} className="bg-burgundy text-white px-8 py-4 rounded font-bold uppercase tracking-widest text-xs hover:bg-gold transition-all">
          {user ? t('checkout.backToOrders') : t('checkout.backToBoutique')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-16">
        <div className="flex items-center gap-4">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-xs transition-all ${step === 'PROFILE' ? 'bg-burgundy text-white shadow-lg scale-110' : 'bg-green-100 text-green-600'}`}>
            {step === 'PROFILE' ? '1' : <ShieldCheck size={18} />}
          </div>
          <div className={`h-px w-16 transition-all ${step === 'PAYMENT' ? 'bg-green-600' : 'bg-burgundy/10'}`} />
          <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-xs transition-all ${step === 'PAYMENT' ? 'bg-burgundy text-white shadow-lg scale-110' : 'bg-burgundy/5 text-burgundy/30'}`}>
            2
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <form onSubmit={handlePay} className="space-y-12">
          {step === 'PROFILE' ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-3xl font-serif text-burgundy italic">{t('checkout.shippingInfo')}</h2>
                <p className="text-xs text-gold uppercase font-black tracking-widest">{t('checkout.shippingInfoSub')}</p>
              </div>
              
              <div className="space-y-6 bg-white p-8 border border-burgundy/10 rounded-sm shadow-sm">
                <div className="relative group">
                  <label className="text-[10px] uppercase font-bold text-earth/50 mb-1 block">{t('checkout.country')}</label>
                  <div className="relative">
                    <select 
                      value={formData.country} 
                      onChange={e => setFormData({...formData, country: e.target.value, isIsland: false})}
                      className="w-full bg-cream border-none rounded-sm p-4 text-sm focus:outline-none appearance-none cursor-pointer pr-10"
                    >
                      {shippingSettings.supportedCountries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <Globe className="absolute right-4 top-1/2 -translate-y-1/2 text-gold pointer-events-none" size={18} />
                  </div>
                </div>

                {formData.country === 'Italia' && (
                  <div className="flex items-center gap-3 p-4 bg-burgundy/5 border border-burgundy/10 rounded-sm">
                    <input 
                      type="checkbox" 
                      id="isIsland"
                      checked={formData.isIsland}
                      onChange={e => setFormData({...formData, isIsland: e.target.checked})}
                      className="w-4 h-4 accent-burgundy"
                    />
                    <label htmlFor="isIsland" className="text-xs font-bold text-burgundy uppercase tracking-widest cursor-pointer">
                      {t('checkout.islands')}
                    </label>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-earth/50">{t('checkout.name')}</label>
                    <input type="text" placeholder="Es: Mario" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-cream rounded-sm p-4 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy/20" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-earth/50">{t('checkout.surname')}</label>
                    <input type="text" placeholder="Es: Rossi" required value={formData.surname} onChange={e => setFormData({...formData, surname: e.target.value})} className="w-full bg-cream rounded-sm p-4 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy/20" />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-earth/50">{t('checkout.email')}</label>
                    <input type="email" placeholder="mario.rossi@esempio.it" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-cream rounded-sm p-4 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy/20" />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-earth/50">{t('checkout.phone')}</label>
                    <div className="relative">
                      <input type="tel" placeholder="+39 333 1234567" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-cream rounded-sm p-4 pl-12 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy/20" />
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/50" size={16} />
                    </div>
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] uppercase font-bold text-earth/50">{t('checkout.address')}</label>
                    <input type="text" placeholder="Es: Via delle Vigne, 12" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-cream rounded-sm p-4 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy/20" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-earth/50">{t('checkout.city')}</label>
                    <input type="text" placeholder="Es: Teramo" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-cream rounded-sm p-4 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy/20" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-earth/50">{t('checkout.zip')}</label>
                    <input type="text" placeholder="Es: 64100" required value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} className="w-full bg-cream rounded-sm p-4 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy/20" />
                  </div>
                </div>
              </div>

              {formError && (
                <div className="p-4 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold animate-in fade-in">
                  {formError}
                </div>
              )}

              <button 
                type="button"
                onClick={() => {
                  if (isProfileValid()) {
                    setFormError(null);
                    setStep('PAYMENT');
                  } else {
                    setFormError(t('checkout.invalidProfile', 'Per favore, inserisci dati di spedizione validi.'));
                  }
                }}
                className="w-full bg-burgundy text-white py-6 rounded font-bold tracking-widest uppercase hover:bg-gold transition-all shadow-xl flex items-center justify-center gap-3"
              >
                {t('checkout.confirmAndPay')}
              </button>
            </div>
          ) : (
            <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center justify-between border-b border-burgundy/10 pb-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-serif text-burgundy italic">{t('checkout.paymentMethod')}</h2>
                  <p className="text-[10px] text-earth/50 uppercase font-black tracking-widest">{t('checkout.paymentMethodSub')}</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setStep('PROFILE')}
                  className="text-[10px] font-bold text-burgundy uppercase tracking-widest hover:text-gold transition-colors flex items-center gap-1"
                >
                  {t('checkout.editAddress')}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {!siteSettings.paymentSettings.stripeEnabled && 
                 !siteSettings.paymentSettings.contrassegnoEnabled && 
                 !siteSettings.paymentSettings.bonificoEnabled && (
                  <div className="p-8 text-center bg-burgundy/5 border border-burgundy/10 rounded-sm">
                    <p className="text-sm text-burgundy font-bold uppercase tracking-widest">{t('checkout.noPaymentMethods')}</p>
                  </div>
                )}
                {siteSettings.paymentSettings.stripeEnabled && (
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('STRIPE')}
                    className={`p-6 border rounded-sm flex items-center justify-between transition-all ${paymentMethod === 'STRIPE' ? 'border-burgundy bg-burgundy/5' : 'border-burgundy/10 bg-white hover:bg-burgundy/5'}`}
                  >
                    <div className="flex items-center gap-4">
                      <CreditCard className="text-gold" size={24} />
                      <div className="text-left">
                        <p className="font-bold text-sm uppercase tracking-widest">{t('checkout.stripeTitle')}</p>
                        <p className="text-[10px] text-earth/50 uppercase">{t('checkout.stripeSub')}</p>
                      </div>
                    </div>
                    {paymentMethod === 'STRIPE' && <ShieldCheck className="text-burgundy" size={20} />}
                  </button>
                )}

                {siteSettings.paymentSettings.contrassegnoEnabled && (
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('CONTRASSEGNO')}
                    className={`p-6 border rounded-sm flex items-center justify-between transition-all ${paymentMethod === 'CONTRASSEGNO' ? 'border-burgundy bg-burgundy/5' : 'border-burgundy/10 bg-white hover:bg-burgundy/5'}`}
                  >
                    <div className="flex items-center gap-4">
                      <Truck className="text-gold" size={24} />
                      <div className="text-left">
                        <p className="font-bold text-sm uppercase tracking-widest">{t('checkout.contrassegnoTitle')}</p>
                        <p className="text-[10px] text-earth/50 uppercase">{t('checkout.contrassegnoSub', { discount: siteSettings.paymentSettings.contrassegnoDiscount })}</p>
                      </div>
                    </div>
                    {paymentMethod === 'CONTRASSEGNO' && <ShieldCheck className="text-burgundy" size={20} />}
                  </button>
                )}

                {siteSettings.paymentSettings.bonificoEnabled && (
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('BONIFICO')}
                    className={`p-6 border rounded-sm flex items-center justify-between transition-all ${paymentMethod === 'BONIFICO' ? 'border-burgundy bg-burgundy/5' : 'border-burgundy/10 bg-white hover:bg-burgundy/5'}`}
                  >
                    <div className="flex items-center gap-4">
                      <Globe className="text-gold" size={24} />
                      <div className="text-left">
                        <p className="font-bold text-sm uppercase tracking-widest">{t('checkout.bonificoTitle')}</p>
                        <p className="text-[10px] text-earth/50 uppercase">{t('checkout.bonificoSub', { discount: siteSettings.paymentSettings.bonificoDiscount })}</p>
                      </div>
                    </div>
                    {paymentMethod === 'BONIFICO' && <ShieldCheck className="text-burgundy" size={20} />}
                  </button>
                )}
              </div>

              {paymentMethod === 'STRIPE' && (
                <div className="bg-white border border-burgundy/10 rounded-sm p-6 space-y-6 animate-in fade-in slide-in-from-top-2">
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      placeholder="•••• •••• •••• ••••" 
                      required={paymentMethod === 'STRIPE'}
                      value={paymentData.cardNumber}
                      onChange={e => setPaymentData({...paymentData, cardNumber: e.target.value})}
                      className="w-full bg-cream rounded-sm p-4 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy" 
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="MM/AA" 
                        required={paymentMethod === 'STRIPE'}
                        value={paymentData.expiry}
                        onChange={e => setPaymentData({...paymentData, expiry: e.target.value})}
                        className="bg-cream rounded-sm p-4 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy" 
                      />
                      <input 
                        type="text" 
                        placeholder="CVC" 
                        required={paymentMethod === 'STRIPE'}
                        value={paymentData.cvc}
                        onChange={e => setPaymentData({...paymentData, cvc: e.target.value})}
                        className="bg-cream rounded-sm p-4 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy" 
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'BONIFICO' && (
                <div className="bg-burgundy/5 border border-burgundy/10 rounded-sm p-6 space-y-2 animate-in fade-in slide-in-from-top-2">
                  <p className="text-xs font-bold text-burgundy uppercase tracking-widest">{t('checkout.bankDetails')}</p>
                  <p className="text-sm text-earth font-bold">{t('checkout.bankIban')}: {siteSettings.paymentSettings.bankIban}</p>
                  <p className="text-sm text-earth">{t('checkout.bankHolder')}: <span className="font-bold">{siteSettings.paymentSettings.bankHolder}</span></p>
                  <p className="text-sm text-earth">{t('checkout.bankName')}: <span className="font-bold">{siteSettings.paymentSettings.bankName}</span></p>
                  <p className="text-sm text-earth">{t('checkout.bankBic')}: <span className="font-bold">{siteSettings.paymentSettings.bankBic}</span></p>
                  <p className="text-sm text-earth italic mt-2">{t('checkout.bankReason', { orderId })}</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={!siteSettings.paymentSettings.stripeEnabled && !siteSettings.paymentSettings.contrassegnoEnabled && !siteSettings.paymentSettings.bonificoEnabled}
                className="w-full bg-burgundy text-white py-6 rounded font-bold tracking-widest uppercase hover:bg-gold transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('checkout.payButton', { total: (total / 100).toFixed(2) })}
              </button>
            </div>
          )}
        </form>

        <div className="hidden lg:block">
           <div className="bg-white p-8 border border-burgundy/10 rounded-sm sticky top-32">
            <h3 className="text-xl font-serif text-burgundy italic mb-8">{t('checkout.summary')}</h3>
            <div className="space-y-6 mb-8">
              {cart.map(item => (
                <div key={item.id} className="flex space-x-4">
                   <div className="w-12 h-16 bg-cream flex-shrink-0 rounded-sm overflow-hidden">
                     <img src={item.image} className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-grow">
                     <p className="text-[10px] font-bold text-burgundy uppercase">{t(`products.${item.id}.name`, item.name)}</p>
                     <p className="text-[10px] text-earth/50">
                       {item.quantity} x € {((user?.userType === 'BUSINESS' && item.businessDiscountPercentage 
                         ? item.priceInCents * (1 - item.businessDiscountPercentage / 100) 
                         : item.priceInCents) / 100).toFixed(2)}
                     </p>
                   </div>
                   <p className="text-xs font-bold text-earth">
                     € {(((user?.userType === 'BUSINESS' && item.businessDiscountPercentage 
                       ? item.priceInCents * (1 - item.businessDiscountPercentage / 100) 
                       : item.priceInCents) * item.quantity) / 100).toFixed(2)}
                   </p>
                </div>
              ))}
            </div>
            <div className="pt-8 border-t border-burgundy/10 space-y-2">
               <div className="flex justify-between text-xs text-earth/70">
                 <span>{t('cart.subtotal')}</span>
                 <span>€ {(itemsTotal / 100).toFixed(2)}</span>
               </div>
               {businessDiscount > 0 && (
                 <div className="flex justify-between text-xs text-burgundy font-bold">
                   <span>Sconto Dettaglio</span>
                   <span>- € {(businessDiscount / 100).toFixed(2)}</span>
                 </div>
               )}
               <div className="flex justify-between text-xs text-earth/70">
                 <span className="flex items-center gap-1">
                   <Trans 
                     i18nKey="checkout.shippingForCountry" 
                     values={{ country: formData.country }}
                     components={[<span className="font-bold text-burgundy" />]}
                     defaults="Spedizione per <0>{{country}}</0>"
                   />
                 </span>
                 <span>{shipping === 0 ? t('checkout.free') : `€ ${(shipping/100).toFixed(2)}`}</span>
               </div>
               {paymentDiscountInCents > 0 && (
                 <div className="flex justify-between text-xs text-green-600 font-bold">
                   <span>{t('checkout.paymentDiscount', { method: paymentMethod === 'CONTRASSEGNO' ? t('checkout.contrassegnoTitle') : t('checkout.bonificoTitle') })}</span>
                   <span>- € {(paymentDiscountInCents / 100).toFixed(2)}</span>
                 </div>
               )}
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
               <div className="flex justify-between font-bold text-xl text-burgundy pt-2">
                 <span>{t('cart.total')}</span>
                 <span>€ {(total / 100).toFixed(2)}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
