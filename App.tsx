
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Wine, User as UserIcon, LogOut, MessageCircle, Settings, Tag, Package, ClipboardList, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Product, CartItem, User, Order, Coupon, ShippingSettings, StripeSettings, SiteSettings } from './types';
import { WINES, LOGO_URL, BASE_IMG_URL } from './constants';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Proposta from './pages/Proposta';
import Premi from './pages/Premi';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Admin from './pages/Admin';
import AuthPage from './pages/AuthPage';
import Account from './pages/Account';
import Privacy from './pages/Privacy';
import Shipping from './pages/Shipping';
import Terms from './pages/Terms';
import Staff from './pages/Staff';
import AISommelier from './components/AISommelier';
import CookieBanner from './components/CookieBanner';
import { db, auth } from './firebase';
import { onSnapshot, collection, doc, setDoc, getDoc, getDocFromServer, query, where, orderBy } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { handleFirestoreError, OperationType } from './src/lib/firestore';


const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

const Navbar: React.FC<{ cartCount: number; user: User | null; onLogout: () => void; siteSettings: SiteSettings }> = ({ cartCount, user, onLogout, siteSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navLinks = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.shop'), path: '/shop' },
    { name: t('nav.proposta'), path: '/proposta' },
    { name: t('nav.premi'), path: '/premi' },
  ];

  const languages = [
    { code: 'it', label: 'IT' },
    { code: 'en', label: 'EN' },
    { code: 'de', label: 'DE' },
    { code: 'zh', label: 'ZH' }
  ];

  return (
    <nav className="fixed w-full z-50 glass-effect border-b border-mustard/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center group">
              <div className="bg-white p-1.5 rounded-lg shadow-sm group-hover:shadow-md transition-all">
                <img 
                  src={siteSettings.logoUrl} 
                  alt={siteSettings.name} 
                  className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </div>
            </Link>
          </div>
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`text-[11px] font-bold tracking-[0.2em] uppercase transition-all hover:text-lavender ${
                  location.pathname === link.path ? 'text-mustard border-b-2 border-mustard pb-1' : 'text-earth'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="hidden md:flex items-center space-x-6">
            {/* Language Switcher */}
            <div className="flex items-center space-x-3 border-r border-mustard/20 pr-6 mr-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={`text-[10px] font-black transition-all hover:text-mustard ${
                    i18n.language.startsWith(lang.code) ? 'text-mustard' : 'text-earth/40'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-6">
              {user ? (
                <div className="flex items-center space-x-6">
                  <Link to={user.role === 'ADMIN' ? '/admin' : '/account'} className="text-earth hover:text-mustard flex items-center gap-2">
                    <UserIcon size={22} className="text-mustard" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{user.role === 'ADMIN' ? t('nav.admin') : t('nav.account')}</span>
                  </Link>
                  <button onClick={onLogout} className="text-earth hover:text-red-600 transition-colors"><LogOut size={22} /></button>
                </div>
              ) : (
                <Link to="/auth" className="text-earth hover:text-mustard transition-colors"><UserIcon size={22} /></Link>
              )}
            </div>
            <Link to="/carrello" className="relative group p-2 bg-mustard/5 rounded-full hover:bg-mustard/10 transition-all">
              <ShoppingCart size={22} className="text-mustard group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-lavender text-white text-[9px] font-black rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
          <div className="md:hidden flex items-center space-x-6">
            <Link to="/carrello" className="relative">
              <ShoppingCart size={26} className="text-mustard" />
              {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-lavender text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">{cartCount}</span>}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-mustard">{isOpen ? <X size={32} /> : <Menu size={32} />}</button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-cream border-t border-mustard/10 shadow-2xl animate-in fade-in slide-in-from-top-4">
          <div className="px-6 pt-4 pb-8 space-y-2">
            <div className="flex items-center space-x-4 px-3 py-4 border-b border-mustard/5">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`text-xs font-black uppercase tracking-widest ${
                    i18n.language.startsWith(lang.code) ? 'text-mustard' : 'text-earth/40'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className="block px-3 py-5 text-lg font-serif italic text-earth border-b border-mustard/5" onClick={() => setIsOpen(false)}>{link.name}</Link>
            ))}
            {user ? (
              <Link to={user.role === 'ADMIN' ? '/admin' : '/account'} className="block px-3 py-5 text-lg font-bold text-mustard uppercase tracking-widest" onClick={() => setIsOpen(false)}>{user.role === 'ADMIN' ? t('nav.admin') : t('nav.account')}</Link>
            ) : (
              <Link to="/auth" className="block px-3 py-5 text-lg font-bold text-mustard uppercase tracking-widest" onClick={() => setIsOpen(false)}>{t('nav.login')}</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  const defaultShippingSettings: ShippingSettings = {
    italy: { cost: 1500, freeThreshold: 15000 },
    islands: { cost: 2500, freeThreshold: 25000 },
    europe: { cost: 3500, freeThreshold: 35000 },
    world: { cost: 6500, freeThreshold: 65000 },
    supportedCountries: ['Italia', 'Germania', 'Francia', 'Stati Uniti', 'Regno Unito', 'Giappone'],
    europeanCountries: ['Germania', 'Francia', 'Spagna', 'Austria', 'Belgio', 'Olanda', 'Portogallo']
  };

  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>(defaultShippingSettings);

  const [stripeSettings, setStripeSettings] = useState<StripeSettings>({
    publicKey: 'pk_test_51Mz...',
    secretKey: 'sk_test_51Mz...',
    mode: 'test'
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    name: 'Origini',
    logoUrl: LOGO_URL,
    baseImgUrl: BASE_IMG_URL,
    paymentSettings: {
      contrassegnoDiscount: 5,
      bonificoDiscount: 6,
      stripeEnabled: true,
      contrassegnoEnabled: true,
      bonificoEnabled: true,
      bankIban: 'IT14K0538740443000003943918',
      bankHolder: 'ORIGINI SRL SOCIETÀ AGRICOLA',
      bankName: 'BPER BANCA S.P.A.',
      bankBic: 'BPMOIT22XXX'
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const { t } = useTranslation();

  // Test Connection
  useEffect(() => {
    let active = true;
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (!active) return;
        if (
          error instanceof Error &&
          (error.name === 'AbortError' ||
           error.message.includes('The user aborted a request') ||
           error.message.toLowerCase().includes('abort'))
        ) {
          return;
        }
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();
    return () => {
      active = false;
    };
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          } else {
            // Fallback for admin or if doc doesn't exist yet
            const isAdmin = firebaseUser.email === 'difabrizioaldo@gmail.com' || firebaseUser.email === 'newgiotime@gmail.com' || firebaseUser.email === 'admin@terredelpoggio.it';
            const newUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              role: isAdmin ? 'ADMIN' : 'CUSTOMER',
              userType: 'PRIVATE'
            };
            setUser(newUser);
          }
        } catch (error) {
          if (
            error instanceof Error &&
            (error.name === 'AbortError' ||
             error.message.includes('The user aborted a request') ||
             error.message.toLowerCase().includes('abort'))
          ) {
            return;
          }
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setUser(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Listeners
  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Product);
      setProducts(data);
    }, (error) => {
      if (error.name === 'AbortError' || error.message.includes('The user aborted a request') || error.message.toLowerCase().includes('abort')) return;
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    const unsubCoupons = onSnapshot(collection(db, 'coupons'), (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Coupon);
      setCoupons(data);
    }, (error) => {
      if (error.name === 'AbortError' || error.message.includes('The user aborted a request') || error.message.toLowerCase().includes('abort')) return;
      handleFirestoreError(error, OperationType.LIST, 'coupons');
    });

    const unsubShipping = onSnapshot(doc(db, 'settings', 'shipping'), (doc) => {
      if (doc.exists()) setShippingSettings(doc.data() as ShippingSettings);
    }, (error) => {
      if (error.name === 'AbortError' || error.message.includes('The user aborted a request') || error.message.toLowerCase().includes('abort')) return;
      handleFirestoreError(error, OperationType.GET, 'settings/shipping');
    });

    const unsubSite = onSnapshot(doc(db, 'settings', 'site'), (doc) => {
      if (doc.exists()) setSiteSettings(doc.data() as SiteSettings);
    }, (error) => {
      if (error.name === 'AbortError' || error.message.includes('The user aborted a request') || error.message.toLowerCase().includes('abort')) return;
      handleFirestoreError(error, OperationType.GET, 'settings/site');
    });

    const unsubStripe = onSnapshot(doc(db, 'settings', 'stripe'), (doc) => {
      if (doc.exists()) setStripeSettings(doc.data() as StripeSettings);
    }, (error) => {
      if (error.name === 'AbortError' || error.message.includes('The user aborted a request') || error.message.toLowerCase().includes('abort')) return;
      handleFirestoreError(error, OperationType.GET, 'settings/stripe');
    });

    return () => {
      unsubProducts();
      unsubCoupons();
      unsubShipping();
      unsubSite();
      unsubStripe();
    };
  }, []);

  // Orders Listener - Role-based
  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }

    let q;
    if (user.role === 'ADMIN') {
      q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    } else {
      q = query(collection(db, 'orders'), where('userId', '==', user.id), orderBy('createdAt', 'desc'));
    }

    const unsubOrders = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as Order);
      setOrders(data);
    }, (error) => {
      if (error.name === 'AbortError' || error.message.includes('The user aborted a request') || error.message.toLowerCase().includes('abort')) {
        return;
      }
      // If we get a permission error on orders, it might be because the user doc hasn't propagated their role yet
      // or they are truly not authorized. We handle it gracefully.
      if (error.message.includes('insufficient permissions')) {
        console.warn('Orders permission denied - user role might not be synced yet or unauthorized.');
        setOrders([]);
      } else {
        handleFirestoreError(error, OperationType.LIST, 'orders');
      }
    });

    return () => unsubOrders();
  }, [user]);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Helper functions to update Firestore
  const updateProducts = async (newProducts: Product[]) => {
    // This is a bit inefficient for large lists, but works for small catalogs
    // Ideally we update individual docs in Admin.tsx
    setProducts(newProducts);
  };

  const updateOrders = async (newOrders: Order[]) => {
    setOrders(newOrders);
  };

  const updateCoupons = async (newCoupons: Coupon[]) => {
    setCoupons(newCoupons);
  };

  // Migration logic for image URLs if they are from the old root or missing the folder
  useEffect(() => {
    setProducts(prev => {
      let changed = false;
      const updated = prev.map(p => {
        const getFileName = (url: string) => {
          if (!url) return '';
          const parts = url.split('/');
          return parts[parts.length - 1];
        };

        const isOldUrl = (url: string) => 
          url.includes('storage.googleapis.com/cantina/') || 
          (url.includes('storage.googleapis.com/immagini-vino-27-03-26/') && !url.includes('CANTINA%20ORIGINI%20TUTTE'));

        if (isOldUrl(p.image) || isOldUrl(p.lifestyleImage)) {
          changed = true;
          return {
            ...p,
            image: isOldUrl(p.image) ? `${siteSettings.baseImgUrl}/${getFileName(p.image)}` : p.image,
            lifestyleImage: isOldUrl(p.lifestyleImage) ? `${siteSettings.baseImgUrl}/${getFileName(p.lifestyleImage)}` : p.lifestyleImage
          };
        }
        return p;
      });
      return changed ? updated : prev;
    });
  }, []);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const handleLogout = () => signOut(auth);
  const addOrder = async (order: Order) => {
    try {
      await setDoc(doc(db, 'orders', order.id), order);
      setCart([]);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `orders/${order.id}`);
    }
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-mustard border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-earth/60 font-serif italic">Caricamento Origini...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)} user={user} onLogout={handleLogout} siteSettings={siteSettings} />
        <main className="flex-grow pt-20">
          <Routes>
            <Route path="/" element={<Home wines={products} />} />
            <Route path="/shop" element={<Shop wines={products} onAddToCart={addToCart} user={user} />} />
            <Route path="/shop/:slug" element={<ProductDetail wines={products} onAddToCart={addToCart} user={user} />} />
            <Route path="/proposta" element={<Proposta />} />
            <Route path="/premi" element={<Premi />} />
            <Route path="/carrello" element={user ? <Cart cart={cart} onUpdateQty={updateQuantity} shippingSettings={shippingSettings} user={user} /> : <Navigate to="/auth" />} />
            <Route path="/checkout" element={user ? <Checkout cart={cart} user={user} onOrderComplete={addOrder} shippingSettings={shippingSettings} siteSettings={siteSettings} /> : <Navigate to="/auth" />} />
            <Route path="/auth" element={<AuthPage onLogin={setUser} />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/spedizioni" element={<Shipping settings={shippingSettings} user={user} />} />
            <Route path="/termini" element={<Terms />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/account" element={user ? <Account user={user} orders={orders.filter(o => o.userId === user.id)} onUpdateUser={setUser} /> : <Navigate to="/auth" />} />
            <Route path="/admin" element={user?.role === 'ADMIN' ? <Admin products={products} setProducts={setProducts} orders={orders} setOrders={setOrders} coupons={coupons} setCoupons={setCoupons} shippingSettings={shippingSettings} setShippingSettings={setShippingSettings} stripeSettings={stripeSettings} setStripeSettings={setStripeSettings} siteSettings={siteSettings} setSiteSettings={setSiteSettings} /> : <Navigate to="/" />} />
          </Routes>
        </main>
        <AISommelier cart={cart} />
        <CookieBanner />
        <footer className="bg-mustard text-cream py-6 border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center space-y-4">
              {/* Logo, Name and Main Info */}
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white p-1 rounded-lg shadow-sm mb-1">
                  <img src={siteSettings.logoUrl} alt={siteSettings.name} className="h-8 w-auto object-contain" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Origini</p>
                  <h3 className="font-brand-caps text-base font-bold tracking-tight text-white italic">
                    ORIGINI SRL SOCIETÀ AGRICOLA
                  </h3>
                </div>
              </div>

              {/* Contact Info - Ultra Compact */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[9px] text-white/60 uppercase tracking-widest font-bold">
                <span>{t('footer.address')}</span>
                <span className="hidden sm:inline opacity-30">•</span>
                <span>{t('footer.phone')}: 0871 198 1220 / 375 862 7573</span>
                <span className="hidden sm:inline opacity-30">•</span>
                <a href="mailto:info@terredelpoggio.it" className="hover:text-white transition-colors">{t('footer.email')}: info@terredelpoggio.it</a>
                <span className="hidden sm:inline opacity-30">•</span>
                <span>{t('footer.vat')}: 02774160697</span>
              </div>

              {/* Links and Copyright */}
              <div className="flex flex-col items-center gap-3 pt-2 border-t border-white/5 w-full">
                <div className="flex flex-wrap justify-center gap-x-6 text-[8px] uppercase font-black tracking-widest text-white/40">
                  <Link to="/spedizioni" className="hover:text-white transition-colors">{t('footer.shipping')}</Link>
                  <Link to="/termini" className="hover:text-white transition-colors">{t('footer.terms')}</Link>
                  <Link to="/privacy" className="hover:text-white transition-colors">{t('footer.privacy')}</Link>
                  <Link to="/staff" className="hover:text-white transition-colors">{t('footer.staff')}</Link>
                </div>
                <p className="text-[7px] text-white uppercase tracking-[0.5em] font-black">
                  {t('footer.copyright', { year: new Date().getFullYear(), name: siteSettings.name })}
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};
export default App;
