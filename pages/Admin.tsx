
import React, { useState, useEffect } from 'react';
import { Product, Order, Coupon, ShippingSettings, WineCategory, OrderStatus, StripeSettings, SiteSettings } from '../types';
import { Plus, Edit, Trash2, Save, X, Globe, CreditCard, Tag, ClipboardList, Package, Phone, MapPin, User as UserIcon, Wine, Image as ImageIcon, Info, GlassWater, Utensils, Mail, Truck, Clock, CheckCircle2, RefreshCw, Database, AlertCircle, LayoutDashboard, TrendingUp, Users, Search, Settings, XCircle } from 'lucide-react';
import { WINES } from '../constants';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc, writeBatch, collection } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../src/lib/firestore';

interface AdminProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  coupons: Coupon[];
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
  shippingSettings: ShippingSettings;
  setShippingSettings: React.Dispatch<React.SetStateAction<ShippingSettings>>;
  stripeSettings: StripeSettings;
  setStripeSettings: React.Dispatch<React.SetStateAction<StripeSettings>>;
  siteSettings: SiteSettings;
  setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
}

const Admin: React.FC<AdminProps> = ({ products, setProducts, orders, setOrders, coupons, setCoupons, shippingSettings, setShippingSettings, stripeSettings, setStripeSettings, siteSettings, setSiteSettings }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'coupons' | 'shipping' | 'payments' | 'system'>('dashboard');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [countryInput, setCountryInput] = useState('');
  const [orderFilter, setOrderFilter] = useState<'PENDING_PAYMENT' | 'TO_PROCESS' | 'SHIPPED' | 'CANCELLED'>('PENDING_PAYMENT');
  const [productSearch, setProductSearch] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: 0, type: 'PERCENT' as 'PERCENT' | 'FIXED' });

  // Custom Modal State
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void } | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
  };

  const handleAddNew = () => {
    const newProd: Product = {
      id: '',
      name: '',
      slug: '',
      vintage: new Date().getFullYear(),
      grape: '',
      category: 'Rosso',
      priceInCents: 0,
      businessDiscountPercentage: 0,
      stock: 0,
      liters: '0.75',
      image: '',
      lifestyleImage: '',
      isAvailable: true,
      sulfites: true,
      alcohol: '13.0%',
      allergens: 'Contiene solfiti',
      description: '',
      tastingNotes: { visual: '', olfactory: '', gustatory: '' },
      pairings: []
    };
    setEditingProduct(newProd);
    setIsAddingNew(true);
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || isSaving) return;

    setIsSaving(true);
    const productToSave = {
      ...editingProduct,
      slug: editingProduct.slug || editingProduct.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
    };

    const id = isAddingNew ? Math.random().toString(36).substr(2, 9) : editingProduct.id;
    const finalProduct = { ...productToSave, id };

    try {
      await setDoc(doc(db, 'products', id), finalProduct);
      showNotification(isAddingNew ? "Prodotto aggiunto correttamente" : "Prodotto aggiornato correttamente");
      setEditingProduct(null);
      setIsAddingNew(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${id}`);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProduct = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Elimina Prodotto",
      message: "Sei sicuro di voler eliminare questo vino dal catalogo? L'azione è irreversibile.",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'products', id));
          showNotification("Prodotto eliminato correttamente");
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
        }
        setConfirmModal(null);
      }
    });
  };

  const addCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code) return;

    const id = editingCoupon ? editingCoupon.id : Math.random().toString(36).substr(2, 9);
    const coupon: Coupon = {
      id,
      code: newCoupon.code.toUpperCase(),
      discount: newCoupon.discount,
      type: newCoupon.type
    };

    try {
      await setDoc(doc(db, 'coupons', id), coupon);
      showNotification(editingCoupon ? "Coupon aggiornato" : "Coupon attivato con successo");
      setEditingCoupon(null);
      setNewCoupon({ code: '', discount: 0, type: 'PERCENT' });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `coupons/${id}`);
    }
  };

  const deleteCoupon = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Elimina Coupon",
      message: "Sei sicuro di voler eliminare questo codice sconto?",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'coupons', id));
          showNotification("Coupon rimosso");
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `coupons/${id}`);
        }
        setConfirmModal(null);
      }
    });
  };

  const saveShippingSettings = async (newSettings: ShippingSettings) => {
    try {
      await setDoc(doc(db, 'settings', 'shipping'), newSettings);
      showNotification("Logistica aggiornata!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/shipping');
    }
  };

  const addCountry = () => {
    if (countryInput && !shippingSettings.supportedCountries.includes(countryInput)) {
      const newSettings = {...shippingSettings, supportedCountries: [...shippingSettings.supportedCountries, countryInput]};
      saveShippingSettings(newSettings);
      setCountryInput('');
    }
  };

  const removeCountry = (c: string) => {
    const newSettings = {...shippingSettings, supportedCountries: shippingSettings.supportedCountries.filter(country => country !== c)};
    saveShippingSettings(newSettings);
  };

  const handleConfirmPayment = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Conferma Pagamento",
      message: "Vuoi segnare l'ordine come PAGATO? Questo confermerà la ricezione del pagamento (bonifico o altro).",
      onConfirm: async () => {
        try {
          const order = orders.find(o => o.id === id);
          if (order) {
            await setDoc(doc(db, 'orders', id), { ...order, status: OrderStatus.PAID });
            showNotification("Pagamento confermato");
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `orders/${id}`);
        }
        setConfirmModal(null);
      }
    });
  };

  const handleCancelOrder = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Annulla Ordine",
      message: "Sei sicuro di voler annullare questo ordine? L'azione è irreversibile.",
      onConfirm: async () => {
        try {
          const order = orders.find(o => o.id === id);
          if (order) {
            await setDoc(doc(db, 'orders', id), { ...order, status: OrderStatus.CANCELLED });
            showNotification("Ordine annullato");
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `orders/${id}`);
        }
        setConfirmModal(null);
      }
    });
  };

  const handleShipOrder = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Evadi Ordine",
      message: "Vuoi segnare l'ordine come EVASO e spedito?",
      onConfirm: async () => {
        try {
          const order = orders.find(o => o.id === id);
          if (order) {
            await setDoc(doc(db, 'orders', id), { ...order, status: OrderStatus.SHIPPED });
            showNotification("Ordine segnato come spedito");
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `orders/${id}`);
        }
        setConfirmModal(null);
      }
    });
  };

  const syncImageUrls = () => {
    setConfirmModal({
      isOpen: true,
      title: "Sincronizza Immagini",
      message: "Vuoi aggiornare tutti i percorsi delle immagini con la nuova radice del server? Questo risolverà i problemi di visualizzazione delle immagini caricate in precedenza.",
      onConfirm: async () => {
        const batch = writeBatch(db);
        products.forEach(p => {
          const getFileName = (url: string) => {
            if (!url) return '';
            const parts = url.split('/');
            return parts[parts.length - 1];
          };
          
          const imgName = getFileName(p.image);
          const lifestyleName = getFileName(p.lifestyleImage);

          const updatedProduct = {
            ...p,
            image: imgName ? `${siteSettings.baseImgUrl}/${imgName}` : p.image,
            lifestyleImage: lifestyleName ? `${siteSettings.baseImgUrl}/${lifestyleName}` : p.lifestyleImage
          };
          batch.set(doc(db, 'products', p.id), updatedProduct);
        });
        
        try {
          await batch.commit();
          showNotification("Percorsi immagini sincronizzati!");
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, 'products (batch)');
        }
        setConfirmModal(null);
      }
    });
  };

  const resetToDefaultCatalog = () => {
    setConfirmModal({
      isOpen: true,
      title: "Ripristina Catalogo",
      message: "Sei sicuro di voler ripristinare il catalogo predefinito? Tutti i prodotti aggiunti o modificati manualmente verranno persi.",
      onConfirm: async () => {
        const batch = writeBatch(db);
        // Delete existing
        products.forEach(p => {
          batch.delete(doc(db, 'products', p.id));
        });
        // Add defaults
        WINES.forEach(p => {
          batch.set(doc(db, 'products', p.id), p);
        });
        
        try {
          await batch.commit();
          showNotification("Catalogo ripristinato ai valori predefiniti");
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, 'products (reset)');
        }
        setConfirmModal(null);
      }
    });
  };

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'PENDING_PAYMENT') return o.status === OrderStatus.PENDING;
    if (orderFilter === 'TO_PROCESS') return o.status === OrderStatus.PAID;
    if (orderFilter === 'SHIPPED') return o.status === OrderStatus.SHIPPED;
    return o.status === OrderStatus.CANCELLED;
  });

  const pendingPaymentCount = orders.filter(o => o.status === OrderStatus.PENDING).length;
  const toProcessCount = orders.filter(o => o.status === OrderStatus.PAID).length;
  const shippedCount = orders.filter(o => o.status === OrderStatus.SHIPPED).length;
  const cancelledCount = orders.filter(o => o.status === OrderStatus.CANCELLED).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif text-mustard italic">Console Admin</h1>
          <p className="text-lavender uppercase tracking-widest text-xs font-bold">Gestione Origini</p>
        </div>
        
        <div className="flex bg-white rounded-full p-1 shadow-md border border-mustard/10 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'products', label: 'Vini', icon: Package },
            { id: 'orders', label: 'Ordini', icon: ClipboardList },
            { id: 'coupons', label: 'Coupon', icon: Tag },
            { id: 'shipping', label: 'Logistica', icon: Globe },
            { id: 'payments', label: 'Pagamenti', icon: CreditCard },
            { id: 'system', label: 'Sistema', icon: Database }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)} 
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-mustard text-white' : 'text-earth/60 hover:bg-mustard/5'}`}
            >
              <tab.icon size={12} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-2xl border border-mustard/5 overflow-hidden min-h-[650px]">
        {/* TAB: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="p-8 space-y-12">
            <h2 className="font-serif text-3xl text-mustard italic">Panoramica Attività</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-cream p-8 rounded-2xl border border-mustard/10 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-mustard/10 text-mustard rounded-xl"><TrendingUp size={24} /></div>
                  <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded">+12%</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-earth/40 tracking-widest">Vendite Totali</p>
                  <p className="text-3xl font-serif text-mustard italic">€ {(orders.filter(o => o.status === OrderStatus.PAID || o.status === OrderStatus.SHIPPED).reduce((acc, o) => acc + o.totalAmount, 0) / 100).toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-cream p-8 rounded-2xl border border-mustard/10 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-mustard/10 text-mustard rounded-xl"><Clock size={24} /></div>
                  <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded">{pendingPaymentCount}</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-earth/40 tracking-widest">Pagamenti In Sospeso</p>
                  <p className="text-3xl font-serif text-mustard italic">€ {(orders.filter(o => o.status === OrderStatus.PENDING).reduce((acc, o) => acc + o.totalAmount, 0) / 100).toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-cream p-8 rounded-2xl border border-mustard/10 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-mustard/10 text-mustard rounded-xl"><ClipboardList size={24} /></div>
                  <span className="text-[10px] font-black text-mustard bg-mustard/5 px-2 py-1 rounded">{orders.length}</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-earth/40 tracking-widest">Ordini Ricevuti</p>
                  <p className="text-3xl font-serif text-mustard italic">{orders.filter(o => o.status !== OrderStatus.CANCELLED).length}</p>
                </div>
              </div>

              <div className="bg-cream p-8 rounded-2xl border border-mustard/10 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-mustard/10 text-mustard rounded-xl"><Package size={24} /></div>
                  <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-1 rounded">{products.filter(p => p.stock < 10).length}</span>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-earth/40 tracking-widest">Stock Critico</p>
                  <p className="text-3xl font-serif text-mustard italic">{products.filter(p => p.stock < 10).length} <span className="text-sm font-sans not-italic text-earth/40">vini</span></p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-lavender border-b border-mustard/5 pb-3">Ultimi Ordini</h3>
                <div className="space-y-4">
                  {orders.slice(0, 5).map(o => (
                    <div key={o.id} className="flex justify-between items-center p-4 bg-white border border-mustard/5 rounded-xl hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-mustard/5 rounded-full flex items-center justify-center text-mustard font-bold text-xs">{o.userName.charAt(0)}</div>
                        <div>
                          <p className="text-xs font-bold text-mustard">{o.userName}</p>
                          <p className="text-[9px] text-earth/40 uppercase tracking-tighter">{new Date(o.createdAt).toLocaleDateString()} — {o.paymentMethod}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-mustard">€ {(o.totalAmount/100).toFixed(2)}</p>
                        <p className={`text-[8px] font-black uppercase tracking-widest ${
                          o.status === OrderStatus.SHIPPED ? 'text-green-600' : 
                          o.status === OrderStatus.CANCELLED ? 'text-red-600' :
                          o.status === OrderStatus.PENDING ? 'text-orange-600' :
                          'text-lavender'
                        }`}>
                          {o.status === OrderStatus.PENDING ? 'IN SOSPESO' : 
                           o.status === OrderStatus.PAID ? (o.paymentMethod === 'CONTRASSEGNO' ? 'DA EVADERE' : 'PAGATO') :
                           o.status === OrderStatus.SHIPPED ? 'EVASO' :
                           'ANNULLATO'}
                        </p>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <p className="text-xs italic text-earth/40 py-8 text-center">Nessun ordine recente.</p>}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-lavender border-b border-mustard/5 pb-3">Vini più venduti</h3>
                <div className="space-y-4">
                  {products.slice(0, 5).map(p => (
                    <div key={p.id} className="flex justify-between items-center p-4 bg-white border border-mustard/5 rounded-xl">
                      <div className="flex items-center gap-4">
                        <img src={p.image} alt={p.name} className="w-8 h-10 object-contain" />
                        <div>
                          <p className="text-xs font-bold text-mustard">{p.name}</p>
                          <p className="text-[9px] text-earth/40 uppercase tracking-tighter">{p.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-mustard">{p.stock} pz</p>
                        <p className="text-[8px] text-earth/40 uppercase tracking-widest">In Stock</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PRODOTTI */}
        {activeTab === 'products' && (
          <div className="overflow-x-auto">
             <div className="p-8 border-b border-mustard/10 flex flex-col md:flex-row justify-between items-center gap-6 bg-mustard/[0.02]">
                <div className="flex items-center gap-8 w-full md:w-auto">
                  <h2 className="font-serif text-2xl text-mustard italic whitespace-nowrap">Catalogo Etichette</h2>
                  <div className="relative flex-grow md:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-mustard/40" size={14} />
                    <input 
                      type="text" 
                      placeholder="Cerca vino..." 
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full bg-white pl-10 pr-4 py-2 rounded-full text-xs border border-mustard/10 focus:outline-none focus:ring-2 focus:ring-mustard/20"
                    />
                  </div>
                </div>
                <button onClick={handleAddNew} className="bg-mustard text-white px-8 py-3 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-lavender transition-all flex items-center gap-2 shadow-lg w-full md:w-auto justify-center">
                  <Plus size={14} /> Nuova Etichetta
                </button>
             </div>
             <table className="w-full text-left">
                <thead className="bg-mustard/5 text-[10px] uppercase font-bold tracking-widest text-earth/50 border-b border-mustard/10">
                  <tr>
                    <th className="px-8 py-5">Etichetta</th>
                    <th className="px-8 py-5">Scheda Tecnica</th>
                    <th className="px-8 py-5">Prezzo</th>
                    <th className="px-8 py-5">Stock</th>
                    <th className="px-8 py-5 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mustard/5">
                  {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).map(p => (
                    <tr key={p.id} className="hover:bg-lavender/[0.02] transition-colors">
                      <td className="px-8 py-5 flex items-center gap-4">
                        <div className="w-12 h-16 bg-cream rounded border border-mustard/10 p-1 flex items-center justify-center">
                          <img src={p.image} className="h-full object-contain" alt={p.name} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-mustard">{p.name}</p>
                          <p className="text-[10px] text-earth/40 uppercase tracking-tighter">{p.vintage} — {p.category}</p>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-[10px] text-earth/60 space-y-1 font-medium">
                          <p>Vitigno: <span className="font-bold text-mustard">{p.grape}</span></p>
                          <p>Alcol: <span className="font-bold text-mustard">{p.alcohol}</span></p>
                        </div>
                      </td>
                      <td className="px-8 py-5 font-bold text-mustard">€ {(p.priceInCents/100).toFixed(2)}</td>
                      <td className="px-8 py-5">
                        <span className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-full ${p.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-mustard/10 text-mustard'}`}>
                          {p.stock} pz
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setEditingProduct(p); setIsAddingNew(false); }} className="p-2 text-earth/20 hover:text-mustard transition-colors"><Edit size={18}/></button>
                          <button onClick={() => deleteProduct(p.id)} className="p-2 text-earth/20 hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        )}

        {/* TAB: ORDINI */}
        {activeTab === 'orders' && (
          <div className="p-8 space-y-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-mustard/10 pb-8">
              <h2 className="font-serif text-3xl text-mustard italic">Gestione Flussi</h2>
              <div className="flex bg-mustard/5 p-1 rounded-xl border border-mustard/10">
                <button 
                  onClick={() => setOrderFilter('PENDING_PAYMENT')}
                  className={`px-8 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-3 ${orderFilter === 'PENDING_PAYMENT' ? 'bg-mustard text-white shadow-xl' : 'text-earth/50 hover:text-mustard'}`}
                >
                  <Clock size={14} /> In Sospeso ({pendingPaymentCount})
                </button>
                <button 
                  onClick={() => setOrderFilter('TO_PROCESS')}
                  className={`px-8 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-3 ${orderFilter === 'TO_PROCESS' ? 'bg-mustard text-white shadow-xl' : 'text-earth/50 hover:text-mustard'}`}
                >
                  <Package size={14} /> Da Evadere ({toProcessCount})
                </button>
                <button 
                  onClick={() => setOrderFilter('SHIPPED')}
                  className={`px-8 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-3 ${orderFilter === 'SHIPPED' ? 'bg-mustard text-white shadow-xl' : 'text-earth/50 hover:text-mustard'}`}
                >
                  <Truck size={14} /> Archivio Evasi ({shippedCount})
                </button>
                <button 
                  onClick={() => setOrderFilter('CANCELLED')}
                  className={`px-8 py-3 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-3 ${orderFilter === 'CANCELLED' ? 'bg-mustard text-white shadow-xl' : 'text-earth/50 hover:text-mustard'}`}
                >
                  <XCircle size={14} /> Annullati ({cancelledCount})
                </button>
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-32 space-y-6">
                <div className="w-24 h-24 bg-mustard/5 rounded-full flex items-center justify-center mx-auto">
                  <Package size={40} className="text-mustard/20" />
                </div>
                <p className="italic text-earth/40 text-sm font-light">L'archivio selezionato è attualmente vuoto.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredOrders.map(o => (
                  <div key={o.id} className="border border-mustard/10 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <div className="bg-mustard/[0.03] p-8 border-b border-mustard/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-bold text-mustard uppercase bg-white border border-mustard/20 px-4 py-1.5 rounded-full shadow-sm">ORD-{o.id.slice(0,8)}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 ${
                            o.status === OrderStatus.SHIPPED ? 'bg-green-50 text-green-600' : 
                            o.status === OrderStatus.CANCELLED ? 'bg-red-50 text-red-600' :
                            o.status === OrderStatus.PENDING ? 'bg-orange-50 text-orange-600' :
                            'bg-lavender/20 text-lavender'
                          }`}>
                            {o.status === OrderStatus.SHIPPED ? <CheckCircle2 size={12} /> : 
                             o.status === OrderStatus.CANCELLED ? <XCircle size={12} /> :
                             <Clock size={12} />}
                            {o.status === OrderStatus.PENDING ? 'In Sospeso' : 
                             o.status === OrderStatus.PAID ? (o.paymentMethod === 'CONTRASSEGNO' ? 'Da Evadere' : 'Pagato') :
                             o.status === OrderStatus.SHIPPED ? 'Evaso' :
                             'Annullato'}
                          </span>
                        </div>
                        <p className="text-[10px] text-earth/40 uppercase tracking-widest font-bold ml-1">
                          {new Date(o.createdAt).toLocaleString('it-IT')} — {o.paymentMethod}
                          {o.paymentDiscountInCents > 0 && ` (Sconto: € ${(o.paymentDiscountInCents/100).toFixed(2)})`}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-earth/40 uppercase font-bold tracking-tighter mb-1">Totale Ordine</p>
                          <p className="text-3xl font-serif text-mustard italic">€ {(o.totalAmount/100).toFixed(2)}</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {o.status === OrderStatus.PENDING && (
                            <button 
                              onClick={() => handleConfirmPayment(o.id)}
                              className="bg-green-600 text-white px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg"
                            >
                              <CheckCircle2 size={14} /> Conferma Pagamento
                            </button>
                          )}
                          {o.status === OrderStatus.PAID && (
                            <button 
                              onClick={() => handleShipOrder(o.id)}
                              className="bg-mustard text-white px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-lavender transition-all flex items-center gap-2 shadow-lg"
                            >
                              <Truck size={14} /> Evadi Ordine
                            </button>
                          )}
                          {(o.status === OrderStatus.PENDING || o.status === OrderStatus.PAID) && (
                            <button 
                              onClick={() => handleCancelOrder(o.id)}
                              className="bg-red-50 text-red-600 border border-red-100 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-2 shadow-sm"
                            >
                              <XCircle size={14} /> Annulla Ordine
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-16">
                      <div className="space-y-6">
                        <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-lavender border-b border-mustard/5 pb-3">Dati Destinatario</h3>
                        <div className="space-y-3">
                          <p className="text-sm font-bold text-earth flex items-center gap-3"><UserIcon size={16} className="text-mustard" /> {o.userName}</p>
                          <p className="text-sm text-earth/70 italic flex items-start gap-3 leading-relaxed"><MapPin size={16} className="text-mustard mt-1 shrink-0" /> {o.userAddress}, {o.shippingCountry}</p>
                          <p className="text-sm font-bold flex items-center gap-3 text-mustard"><Phone size={16} /> {o.userPhone}</p>
                          <p className="text-xs text-earth/50 flex items-center gap-3"><Mail size={16} className="text-mustard" /> {o.userEmail}</p>
                        </div>
                      </div>
                      <div className="space-y-5">
                        <h3 className="text-xs font-bold uppercase tracking-[0.25em] text-lavender border-b border-mustard/5 pb-3">Dettaglio Articoli</h3>
                        <div className="space-y-3">
                          {o.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs text-earth bg-cream p-4 rounded-xl border border-mustard/5">
                              <span className="font-medium text-sm">{item.quantity}x <span className="text-mustard font-bold">{item.name}</span> <span className="text-earth/40">({item.vintage})</span></span>
                              <span className="font-bold text-mustard bg-white px-3 py-1 rounded shadow-sm">€ {((item.priceInCents * item.quantity)/100).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: COUPON */}
        {activeTab === 'coupons' && (
          <div className="p-10 space-y-12">
            <h2 className="font-serif text-3xl text-mustard italic">Marketing & Sconti</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
              <div className="bg-mustard/[0.03] p-8 rounded-2xl h-fit border border-mustard/10 space-y-8">
                <h3 className="text-xs font-bold uppercase tracking-widest text-lavender border-b border-mustard/5 pb-3">
                  {editingCoupon ? 'Modifica Codice' : 'Crea Nuovo Codice'}
                </h3>
                <form onSubmit={addCoupon} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-earth/50">Codice Coupon</label>
                    <input type="text" value={newCoupon.code} onChange={e => setNewCoupon({...newCoupon, code: e.target.value})} placeholder="ES: NATALE24" className="w-full bg-white p-4 rounded-xl text-sm focus:outline-none uppercase border border-mustard/10 focus:ring-2 focus:ring-mustard/20" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-earth/50">Valore</label>
                      <input type="number" value={newCoupon.discount} onChange={e => setNewCoupon({...newCoupon, discount: parseInt(e.target.value)})} className="w-full bg-white p-4 rounded-xl text-sm focus:outline-none border border-mustard/10" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-earth/50">Tipo</label>
                      <select value={newCoupon.type} onChange={e => setNewCoupon({...newCoupon, type: e.target.value as any})} className="w-full bg-white p-4 rounded-xl text-sm focus:outline-none border border-mustard/10">
                        <option value="PERCENT">%</option>
                        <option value="FIXED">€</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button type="submit" className="w-full bg-mustard text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-lavender transition-all shadow-lg">
                      {editingCoupon ? 'Salva Modifiche' : 'Attiva Coupon'}
                    </button>
                    {editingCoupon && (
                      <button 
                        type="button" 
                        onClick={() => {
                          setEditingCoupon(null);
                          setNewCoupon({ code: '', discount: 0, type: 'PERCENT' });
                        }} 
                        className="w-full bg-earth/10 text-earth/60 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-earth/20 transition-all"
                      >
                        Annulla
                      </button>
                    )}
                  </div>
                </form>
              </div>
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-lavender border-b border-mustard/5 pb-3">Codici Attivi</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {coupons.map(c => (
                    <div key={c.id} className="bg-white border border-mustard/10 p-6 rounded-2xl flex justify-between items-center shadow-sm group hover:border-mustard/40 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-mustard/10 text-mustard rounded-full"><Tag size={20} /></div>
                        <div>
                          <p className="font-bold text-mustard text-lg tracking-tight">{c.code}</p>
                          <p className="text-[10px] text-earth/40 uppercase font-black">-{c.discount}{c.type === 'PERCENT' ? '%' : '€'} Sconto</p>
                        </div>
                      </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              setEditingCoupon(c);
                              setNewCoupon({ code: c.code, discount: c.discount, type: c.type });
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} 
                            className="text-mustard/40 hover:text-mustard transition-colors p-2 bg-mustard/5 rounded-lg"
                            title="Modifica Coupon"
                          >
                            <Edit size={20} />
                          </button>
                          <button 
                            onClick={() => deleteCoupon(c.id)} 
                            className="text-red-600/40 hover:text-red-600 transition-colors p-2 bg-red-600/5 rounded-lg"
                            title="Elimina Coupon"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: LOGISTICA */}
        {activeTab === 'shipping' && (
          <div className="p-10 space-y-12">
            <h2 className="font-serif text-3xl text-mustard italic font-brand-caps">Spedizioni</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-10 bg-cream p-10 rounded-2xl border border-mustard/10 shadow-inner">
                <h3 className="text-xs font-bold uppercase tracking-widest text-lavender border-b border-mustard/5 pb-3">Configurazione Tariffe</h3>
                <div className="space-y-8">
                  {[
                    { key: 'italy', label: 'Italia Standard' },
                    { key: 'islands', label: 'Isole / Zone Periferiche' },
                    { key: 'europe', label: 'Europa' },
                    { key: 'world', label: 'Resto del Mondo' }
                  ].map(tier => (
                    <div key={tier.key} className="p-6 bg-white rounded-xl border border-mustard/10 space-y-4">
                      <h4 className="text-[10px] uppercase font-bold text-mustard tracking-widest">{tier.label}</h4>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase font-bold text-earth/40">Costo (€)</label>
                          <input 
                            type="number" 
                            value={((shippingSettings[tier.key as keyof ShippingSettings] as any)?.cost || 0) / 100} 
                            onChange={e => {
                              const newSettings = {
                                ...shippingSettings, 
                                [tier.key]: { ...(shippingSettings[tier.key as keyof ShippingSettings] as any || {}), cost: parseFloat(e.target.value) * 100 }
                              };
                              setShippingSettings(newSettings);
                            }} 
                            className="w-full bg-cream p-3 rounded-lg text-xs font-bold text-mustard focus:outline-none" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase font-bold text-earth/40">Soglia Gratis (€)</label>
                          <input 
                            type="number" 
                            value={((shippingSettings[tier.key as keyof ShippingSettings] as any)?.freeThreshold || 0) / 100} 
                            onChange={e => {
                              const newSettings = {
                                ...shippingSettings, 
                                [tier.key]: { ...(shippingSettings[tier.key as keyof ShippingSettings] as any || {}), freeThreshold: parseFloat(e.target.value) * 100 }
                              };
                              setShippingSettings(newSettings);
                            }} 
                            className="w-full bg-cream p-3 rounded-lg text-xs font-bold text-mustard focus:outline-none" 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => saveShippingSettings(shippingSettings)} className="bg-mustard text-white px-12 py-5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 hover:bg-lavender shadow-xl transition-all"><Save size={18} /> Salva Impostazioni</button>
                </div>
              </div>
              <div className="space-y-12">
                <div className="space-y-8">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-lavender border-b border-mustard/5 pb-3">Destinazioni Abilitate</h3>
                  <div className="flex gap-4">
                    <input type="text" placeholder="Nome nazione..." value={countryInput} onChange={e => setCountryInput(e.target.value)} className="flex-grow bg-white p-5 rounded-xl border border-mustard/10 text-sm" />
                    <button onClick={addCountry} className="bg-mustard text-white px-10 rounded-xl font-bold uppercase text-[10px] shadow-lg">Aggiungi</button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {shippingSettings.supportedCountries.map(c => (
                      <span key={c} className="bg-white border border-mustard/10 px-5 py-3 rounded-full text-[10px] font-bold text-mustard flex items-center gap-3 group shadow-sm hover:border-mustard transition-colors">
                        {c} <button onClick={() => removeCountry(c)} className="text-earth/20 hover:text-red-600 transition-colors"><X size={14}/></button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-lavender border-b border-mustard/5 pb-3">Nazioni Europee (Tariffa Europa)</h3>
                  <p className="text-[10px] text-earth/40 italic">Le nazioni in questa lista useranno la tariffa "Europa". Le altre nazioni abilitate useranno "Resto del Mondo".</p>
                  <div className="flex flex-wrap gap-3">
                    {shippingSettings.supportedCountries.map(c => (
                      <button 
                        key={c} 
                        onClick={() => {
                          const isEuro = shippingSettings.europeanCountries.includes(c);
                          setShippingSettings({
                            ...shippingSettings,
                            europeanCountries: isEuro 
                              ? shippingSettings.europeanCountries.filter(ec => ec !== c)
                              : [...shippingSettings.europeanCountries, c]
                          });
                        }}
                        className={`px-5 py-3 rounded-full text-[10px] font-bold transition-all border ${shippingSettings.europeanCountries.includes(c) ? 'bg-mustard text-white border-mustard shadow-md' : 'bg-white text-earth/40 border-mustard/10 hover:border-mustard/40'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PAGAMENTI */}
        {activeTab === 'payments' && (
          <div className="p-10 space-y-12">
            <h2 className="font-serif text-3xl text-mustard italic font-brand-caps">Pagamenti</h2>
            <div className="bg-cream border border-mustard/10 rounded-3xl p-12 shadow-2xl max-w-3xl mx-auto space-y-10">
               <div className="flex items-center gap-6 border-b border-mustard/10 pb-10">
                 <div className="bg-mustard text-white p-5 rounded-2xl shadow-xl"><CreditCard size={40} /></div>
                 <div>
                    <h3 className="font-serif text-2xl italic text-mustard">Metodi di Pagamento</h3>
                    <p className="text-xs text-earth/40 uppercase font-black tracking-widest">Attiva o disattiva le opzioni di pagamento</p>
                 </div>
               </div>
               <div className="space-y-6">
                 <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-mustard/10">
                   <div>
                     <p className="text-sm font-bold text-mustard uppercase tracking-widest">Stripe (Carte / Apple Pay)</p>
                     <p className="text-[10px] text-earth/40 uppercase">Pagamenti immediati e sicuri</p>
                   </div>
                   <button 
                     onClick={async () => {
                       const newSettings = {
                         ...siteSettings, 
                         paymentSettings: { ...siteSettings.paymentSettings, stripeEnabled: !siteSettings.paymentSettings.stripeEnabled }
                       };
                       setSiteSettings(newSettings);
                       try {
                         await setDoc(doc(db, 'settings', 'site'), newSettings);
                       } catch (error) {
                         handleFirestoreError(error, OperationType.WRITE, 'settings/site');
                       }
                     }}
                     className={`w-14 h-8 rounded-full transition-all relative ${siteSettings.paymentSettings.stripeEnabled ? 'bg-green-500' : 'bg-earth/20'}`}
                   >
                     <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${siteSettings.paymentSettings.stripeEnabled ? 'left-7' : 'left-1'}`} />
                   </button>
                 </div>

                 <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-mustard/10">
                   <div>
                     <p className="text-sm font-bold text-mustard uppercase tracking-widest">Contrassegno</p>
                     <p className="text-[10px] text-earth/40 uppercase">Paga alla consegna</p>
                   </div>
                   <button 
                     onClick={async () => {
                       const newSettings = {
                         ...siteSettings, 
                         paymentSettings: { ...siteSettings.paymentSettings, contrassegnoEnabled: !siteSettings.paymentSettings.contrassegnoEnabled }
                       };
                       setSiteSettings(newSettings);
                       try {
                         await setDoc(doc(db, 'settings', 'site'), newSettings);
                       } catch (error) {
                         handleFirestoreError(error, OperationType.WRITE, 'settings/site');
                       }
                     }}
                     className={`w-14 h-8 rounded-full transition-all relative ${siteSettings.paymentSettings.contrassegnoEnabled ? 'bg-green-500' : 'bg-earth/20'}`}
                   >
                     <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${siteSettings.paymentSettings.contrassegnoEnabled ? 'left-7' : 'left-1'}`} />
                   </button>
                 </div>

                 <div className="flex items-center justify-between p-6 bg-white rounded-2xl border border-mustard/10">
                   <div>
                     <p className="text-sm font-bold text-mustard uppercase tracking-widest">Bonifico Bancario</p>
                     <p className="text-[10px] text-earth/40 uppercase">Pagamento anticipato</p>
                   </div>
                   <button 
                     onClick={async () => {
                       const newSettings = {
                         ...siteSettings, 
                         paymentSettings: { ...siteSettings.paymentSettings, bonificoEnabled: !siteSettings.paymentSettings.bonificoEnabled }
                       };
                       setSiteSettings(newSettings);
                       try {
                         await setDoc(doc(db, 'settings', 'site'), newSettings);
                       } catch (error) {
                         handleFirestoreError(error, OperationType.WRITE, 'settings/site');
                       }
                     }}
                     className={`w-14 h-8 rounded-full transition-all relative ${siteSettings.paymentSettings.bonificoEnabled ? 'bg-green-500' : 'bg-earth/20'}`}
                   >
                     <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${siteSettings.paymentSettings.bonificoEnabled ? 'left-7' : 'left-1'}`} />
                   </button>
                 </div>
               </div>
             </div>

               <div className="bg-cream border border-mustard/10 rounded-3xl p-12 shadow-2xl max-w-3xl mx-auto space-y-10">
               <div className="flex items-center gap-6 border-b border-mustard/10 pb-10">
                 <div className="bg-mustard text-white p-5 rounded-2xl shadow-xl"><Settings size={40} /></div>
                 <div>
                    <h3 className="font-serif text-2xl italic text-mustard">Configurazione Stripe</h3>
                    <p className="text-xs text-earth/40 uppercase font-black tracking-widest">Protocollo Sicuro SSL/TLS</p>
                 </div>
               </div>
               <div className="space-y-8">
                 <div className="flex gap-4 p-2 bg-white rounded-full border border-mustard/10 shadow-inner">
                   <button onClick={() => setStripeSettings({...stripeSettings, mode: 'test'})} className={`flex-grow py-4 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${stripeSettings.mode === 'test' ? 'bg-mustard text-white shadow-xl' : 'text-earth/30'}`}>Modalità Test</button>
                   <button onClick={() => setStripeSettings({...stripeSettings, mode: 'live'})} className={`flex-grow py-4 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${stripeSettings.mode === 'live' ? 'bg-mustard text-white shadow-xl' : 'text-earth/30'}`}>Modalità Live</button>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-earth/50">API Public Key</label>
                      <input type="password" value={stripeSettings.publicKey} onChange={e => setStripeSettings({...stripeSettings, publicKey: e.target.value})} className="w-full bg-white p-5 rounded-2xl text-xs font-mono border border-mustard/10 shadow-sm" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-earth/50">API Secret Key</label>
                      <input type="password" value={stripeSettings.secretKey} onChange={e => setStripeSettings({...stripeSettings, secretKey: e.target.value})} className="w-full bg-white p-5 rounded-2xl text-xs font-mono border border-mustard/10 shadow-sm" />
                    </div>
                 </div>
                 <button 
                   onClick={async () => {
                     try {
                       await setDoc(doc(db, 'settings', 'stripe'), stripeSettings);
                       showNotification("Chiavi sincronizzate!");
                     } catch (error) {
                       handleFirestoreError(error, OperationType.WRITE, 'settings/stripe');
                     }
                   }} 
                   className="w-full bg-mustard text-white py-6 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-lavender shadow-2xl transition-all"
                 >
                   Sincronizza Gateway Pagamenti
                 </button>
               </div>
            </div>

            <div className="bg-cream border border-mustard/10 rounded-3xl p-12 shadow-2xl max-w-3xl mx-auto space-y-10">
               <div className="flex items-center gap-6 border-b border-mustard/10 pb-10">
                 <div className="bg-mustard text-white p-5 rounded-2xl shadow-xl"><Globe size={40} /></div>
                 <div>
                    <h3 className="font-serif text-2xl italic text-mustard">Dati Bonifico Bancario</h3>
                    <p className="text-xs text-earth/40 uppercase font-black tracking-widest">Informazioni per i pagamenti tramite bonifico</p>
                 </div>
               </div>
               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-earth/50">Intestatario</label>
                    <input 
                      type="text" 
                      value={siteSettings.paymentSettings.bankHolder || ''} 
                      onChange={e => setSiteSettings({
                        ...siteSettings, 
                        paymentSettings: { ...siteSettings.paymentSettings, bankHolder: e.target.value }
                      })} 
                      className="w-full bg-white p-5 rounded-2xl text-xs font-bold border border-mustard/10 shadow-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-earth/50">Banca</label>
                    <input 
                      type="text" 
                      value={siteSettings.paymentSettings.bankName || ''} 
                      onChange={e => setSiteSettings({
                        ...siteSettings, 
                        paymentSettings: { ...siteSettings.paymentSettings, bankName: e.target.value }
                      })} 
                      className="w-full bg-white p-5 rounded-2xl text-xs font-bold border border-mustard/10 shadow-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-earth/50">IBAN</label>
                    <input 
                      type="text" 
                      value={siteSettings.paymentSettings.bankIban || ''} 
                      onChange={e => setSiteSettings({
                        ...siteSettings, 
                        paymentSettings: { ...siteSettings.paymentSettings, bankIban: e.target.value }
                      })} 
                      className="w-full bg-white p-5 rounded-2xl text-xs font-mono border border-mustard/10 shadow-sm" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-earth/50">BIC/SWIFT</label>
                    <input 
                      type="text" 
                      value={siteSettings.paymentSettings.bankBic || ''} 
                      onChange={e => setSiteSettings({
                        ...siteSettings, 
                        paymentSettings: { ...siteSettings.paymentSettings, bankBic: e.target.value }
                      })} 
                      className="w-full bg-white p-5 rounded-2xl text-xs font-bold border border-mustard/10 shadow-sm" 
                    />
                  </div>
                  <button 
                    onClick={async () => {
                      try {
                        await setDoc(doc(db, 'settings', 'site'), siteSettings);
                        showNotification("Dati bonifico aggiornati!");
                      } catch (error) {
                        handleFirestoreError(error, OperationType.WRITE, 'settings/site');
                      }
                    }}
                    className="w-full bg-mustard text-white py-6 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-lavender shadow-2xl transition-all"
                  >
                    Salva Dati Bonifico
                  </button>
               </div>
            </div>

            <div className="bg-cream border border-mustard/10 rounded-3xl p-12 shadow-2xl max-w-3xl mx-auto space-y-10">
               <div className="flex items-center gap-6 border-b border-mustard/10 pb-10">
                 <div className="bg-mustard text-white p-5 rounded-2xl shadow-xl"><Tag size={40} /></div>
                 <div>
                    <h3 className="font-serif text-2xl italic text-mustard">Sconti Metodi di Pagamento</h3>
                    <p className="text-xs text-earth/40 uppercase font-black tracking-widest">Incentivi per pagamenti alternativi</p>
                 </div>
               </div>
               <div className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-earth/50">Sconto Contrassegno (%)</label>
                      <input 
                        type="number" 
                        value={siteSettings.paymentSettings.contrassegnoDiscount} 
                        onChange={e => setSiteSettings({
                          ...siteSettings, 
                          paymentSettings: { ...siteSettings.paymentSettings, contrassegnoDiscount: parseFloat(e.target.value) || 0 }
                        })} 
                        className="w-full bg-white p-5 rounded-2xl text-xs font-bold border border-mustard/10 shadow-sm" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-earth/50">Sconto Bonifico (%)</label>
                      <input 
                        type="number" 
                        value={siteSettings.paymentSettings.bonificoDiscount} 
                        onChange={e => setSiteSettings({
                          ...siteSettings, 
                          paymentSettings: { ...siteSettings.paymentSettings, bonificoDiscount: parseFloat(e.target.value) || 0 }
                        })} 
                        className="w-full bg-white p-5 rounded-2xl text-xs font-bold border border-mustard/10 shadow-sm" 
                      />
                    </div>
                 </div>
                 <button 
                   onClick={async () => {
                     try {
                       await setDoc(doc(db, 'settings', 'site'), siteSettings);
                       showNotification("Sconti pagamenti aggiornati!");
                     } catch (error) {
                       handleFirestoreError(error, OperationType.WRITE, 'settings/site');
                     }
                   }}
                   className="w-full bg-mustard text-white py-6 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-lavender shadow-2xl transition-all"
                 >
                   Salva Sconti Pagamenti
                 </button>
               </div>
            </div>
          </div>
        )}

        {/* TAB: SISTEMA */}
        {activeTab === 'system' && (
          <div className="p-10 space-y-12">
            <h2 className="font-serif text-3xl text-mustard italic font-brand-caps">Manutenzione Sistema</h2>
            
            <div className="bg-cream border border-mustard/10 rounded-3xl p-10 space-y-8 shadow-sm">
              <div className="flex items-center gap-4 text-mustard">
                <Settings size={24} />
                <h3 className="font-bold uppercase tracking-widest text-sm">Identità Sito</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-earth/50">Nome Sito</label>
                  <input type="text" value={siteSettings.name} onChange={e => setSiteSettings({...siteSettings, name: e.target.value})} className="w-full bg-white p-4 rounded-xl border border-mustard/10 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-earth/50">URL Logo</label>
                  <input type="text" value={siteSettings.logoUrl} onChange={e => setSiteSettings({...siteSettings, logoUrl: e.target.value})} className="w-full bg-white p-4 rounded-xl border border-mustard/10 text-sm" />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] uppercase font-bold text-earth/50">Radice Immagini (Base URL)</label>
                  <input type="text" value={siteSettings.baseImgUrl} onChange={e => setSiteSettings({...siteSettings, baseImgUrl: e.target.value})} className="w-full bg-white p-4 rounded-xl border border-mustard/10 text-sm" />
                </div>
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={async () => {
                    try {
                      await setDoc(doc(db, 'settings', 'site'), siteSettings);
                      showNotification("Impostazioni sito salvate!");
                    } catch (error) {
                      handleFirestoreError(error, OperationType.WRITE, 'settings/site');
                    }
                  }} 
                  className="bg-mustard text-white px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-lavender transition-all shadow-lg"
                >
                  Salva Identità
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-cream border border-mustard/10 rounded-3xl p-10 space-y-6 shadow-sm">
                <div className="flex items-center gap-4 text-mustard">
                  <RefreshCw size={24} />
                  <h3 className="font-bold uppercase tracking-widest text-sm">Sincronizzazione Immagini</h3>
                </div>
                <p className="text-sm text-earth/60 leading-relaxed">
                  Se le immagini dei prodotti non vengono visualizzate correttamente, usa questa funzione per aggiornare tutti i percorsi con la nuova radice del server.
                </p>
                <button 
                  onClick={syncImageUrls}
                  className="bg-mustard text-white px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-lavender transition-all shadow-lg flex items-center gap-2"
                >
                  <RefreshCw size={14} /> Sincronizza Ora
                </button>
              </div>

              <div className="bg-red-50 border border-red-100 rounded-3xl p-10 space-y-6 shadow-sm">
                <div className="flex items-center gap-4 text-red-600">
                  <AlertCircle size={24} />
                  <h3 className="font-bold uppercase tracking-widest text-sm">Ripristino Catalogo</h3>
                </div>
                <p className="text-sm text-red-600/60 leading-relaxed">
                  Attenzione: questa azione ripristinerà il catalogo vini ai valori predefiniti di fabbrica. Tutte le modifiche manuali andranno perse.
                </p>
                <button 
                  onClick={resetToDefaultCatalog}
                  className="bg-red-600 text-white px-8 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg flex items-center gap-2"
                >
                  <Trash2 size={14} /> Ripristina Default
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className={`fixed bottom-8 right-8 z-[200] px-8 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-8 flex items-center gap-4 ${notification.type === 'success' ? 'bg-mustard text-white' : 'bg-red-600 text-white'}`}>
          {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-[10px] font-bold uppercase tracking-widest">{notification.message}</span>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-earth/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-10 space-y-8">
            <div className="space-y-4">
              <h3 className="text-2xl font-serif text-mustard italic">{confirmModal.title}</h3>
              <p className="text-sm text-earth/60 leading-relaxed">{confirmModal.message}</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={confirmModal.onConfirm}
                className="flex-grow bg-mustard text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-lavender transition-all shadow-lg"
              >
                Conferma
              </button>
              <button 
                onClick={() => setConfirmModal(null)}
                className="flex-grow border-2 border-mustard text-mustard py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-mustard/5 transition-all"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE DI MODIFICA PRODOTTO */}
      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-earth/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-mustard p-8 flex justify-between items-center text-white">
              <h2 className="text-3xl font-serif italic font-brand-caps">{isAddingNew ? 'Nuova Origine' : 'Modifica Etichetta'}</h2>
              <button onClick={() => setEditingProduct(null)} className="hover:rotate-90 transition-transform duration-300"><X size={32} /></button>
            </div>
            
            <form onSubmit={saveProduct} className="flex-grow overflow-y-auto p-10 space-y-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-lavender border-b border-mustard/5 pb-3 flex items-center gap-3"><Info size={16}/> Informazioni Base</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-earth/40">Nome Vino</label>
                      <input type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full bg-cream p-4 rounded-xl text-sm border border-mustard/5 focus:ring-2 focus:ring-mustard/10 outline-none" required />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-earth/40">Annata</label>
                        <input type="number" value={editingProduct.vintage} onChange={e => setEditingProduct({...editingProduct, vintage: parseInt(e.target.value)})} className="w-full bg-cream p-4 rounded-xl text-sm border border-mustard/5" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-earth/40">Collezione</label>
                        <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value as WineCategory})} className="w-full bg-cream p-4 rounded-xl text-sm border border-mustard/5">
                          <option value="Rosso">Rosso</option>
                          <option value="Bianco">Bianco</option>
                          <option value="Rosato">Rosato</option>
                          <option value="Bollicine">Bollicine</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-earth/40">Prezzo Privati (€)</label>
                        <input type="number" step="0.01" value={editingProduct.priceInCents/100} onChange={e => setEditingProduct({...editingProduct, priceInCents: Math.round(parseFloat(e.target.value)*100)})} className="w-full bg-cream p-4 rounded-xl text-sm border border-mustard/5" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-earth/40">Sconto Dettaglio (%)</label>
                        <input type="number" value={editingProduct.businessDiscountPercentage || 0} onChange={e => setEditingProduct({...editingProduct, businessDiscountPercentage: parseInt(e.target.value)})} className="w-full bg-cream p-4 rounded-xl text-sm border border-mustard/5" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-earth/40">Inventario</label>
                        <input type="number" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})} className="w-full bg-cream p-4 rounded-xl text-sm border border-mustard/5" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-earth/40">Lt</label>
                        <input type="text" value={editingProduct.liters} onChange={e => setEditingProduct({...editingProduct, liters: e.target.value})} className="w-full bg-cream p-4 rounded-xl text-sm border border-mustard/5" required />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-lavender border-b border-mustard/5 pb-3 flex items-center gap-3"><ImageIcon size={16}/> Visual Identity</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-earth/40">URL Immagine Bottiglia</label>
                      <input type="text" value={editingProduct.image} onChange={e => setEditingProduct({...editingProduct, image: e.target.value})} className="w-full bg-cream p-4 rounded-xl text-sm border border-mustard/5" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-earth/40">URL Immagine Lifestyle</label>
                      <input type="text" value={editingProduct.lifestyleImage} onChange={e => setEditingProduct({...editingProduct, lifestyleImage: e.target.value})} className="w-full bg-cream p-4 rounded-xl text-sm border border-mustard/5" required />
                    </div>
                    <div className="grid grid-cols-2 gap-6 pt-4">
                       {editingProduct.image && <div className="h-32 bg-cream rounded-2xl flex items-center justify-center p-3 border border-mustard/10 shadow-inner"><img src={editingProduct.image} className="h-full object-contain" /></div>}
                       {editingProduct.lifestyleImage && <div className="h-32 bg-cream rounded-2xl overflow-hidden border border-mustard/10 shadow-inner"><img src={editingProduct.lifestyleImage} className="w-full h-full object-cover" /></div>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-mustard/5 pt-12">
                <div className="space-y-8">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-lavender border-b border-mustard/5 pb-3 flex items-center gap-3"><Wine size={16}/> Dati Tecnici</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-earth/40">Vitigno</label>
                      <input type="text" value={editingProduct.grape} onChange={e => setEditingProduct({...editingProduct, grape: e.target.value})} className="w-full bg-cream p-4 rounded-xl text-sm border border-mustard/5" required />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-earth/40">Gradazione</label>
                        <input type="text" value={editingProduct.alcohol} onChange={e => setEditingProduct({...editingProduct, alcohol: e.target.value})} className="w-full bg-cream p-4 rounded-xl text-sm border border-mustard/5" placeholder="es. 13.5 %" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-earth/40">Allergeni</label>
                        <input type="text" value={editingProduct.allergens} onChange={e => setEditingProduct({...editingProduct, allergens: e.target.value})} className="w-full bg-cream p-4 rounded-xl text-sm border border-mustard/5" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-earth/40">Descrizione</label>
                      <textarea value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full bg-cream p-4 rounded-xl text-sm border border-mustard/5 h-32 leading-relaxed" required />
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-lavender border-b border-mustard/5 pb-3 flex items-center gap-3"><GlassWater size={16}/> Note Sensoriali</h3>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-earth/40">Colore</label>
                      <input type="text" value={editingProduct.tastingNotes.visual} onChange={e => setEditingProduct({...editingProduct, tastingNotes: {...editingProduct.tastingNotes, visual: e.target.value}})} className="w-full bg-cream p-4 rounded-xl text-sm border border-mustard/5" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-earth/40">Odore</label>
                      <input type="text" value={editingProduct.tastingNotes.olfactory} onChange={e => setEditingProduct({...editingProduct, tastingNotes: {...editingProduct.tastingNotes, olfactory: e.target.value}})} className="w-full bg-cream p-4 rounded-xl text-sm border border-mustard/5" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-earth/40">Gusto</label>
                      <input type="text" value={editingProduct.tastingNotes.gustatory} onChange={e => setEditingProduct({...editingProduct, tastingNotes: {...editingProduct.tastingNotes, gustatory: e.target.value}})} className="w-full bg-cream p-4 rounded-xl text-sm border border-mustard/5" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold text-earth/40 flex items-center gap-2"><Utensils size={10}/> Abbinamenti (virgola per separare)</label>
                      <input type="text" value={editingProduct.pairings.join(', ')} onChange={e => setEditingProduct({...editingProduct, pairings: e.target.value.split(',').map(s => s.trim())})} className="w-full bg-cream p-4 rounded-xl text-sm border border-mustard/5" placeholder="Carni, Formaggi, Pesce" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="sticky bottom-0 bg-white pt-10 pb-4 border-t border-mustard/10 flex gap-6">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className={`flex-grow bg-mustard text-white py-6 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-lavender transition-all shadow-2xl flex items-center justify-center gap-3 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Salvataggio...
                    </>
                  ) : (
                    isAddingNew ? 'Salva Prodotto' : 'Salva Modifiche'
                  )}
                </button>
                <button type="button" onClick={() => setEditingProduct(null)} className="px-12 border-2 border-mustard text-mustard py-6 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-mustard/5 transition-all">Annulla</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Admin;
