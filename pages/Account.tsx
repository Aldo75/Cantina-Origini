
import React, { useState } from 'react';
import { User, Order, UserProfile, OrderStatus } from '../types';
import { Package, MapPin, CreditCard, ChevronRight, Lock, ShieldCheck, Phone } from 'lucide-react';

interface AccountProps {
  user: User;
  orders: Order[];
  onUpdateUser: (user: User) => void;
}

const Account: React.FC<AccountProps> = ({ user, orders, onUpdateUser }) => {
  const [profile, setProfile] = useState<UserProfile>(user.profile || {
    name: '', surname: '', address: '', city: '', zip: '', phone: '', country: 'Italia'
  });

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [notification, setNotification] = useState<string | null>(null);
  const [errorNotification, setErrorNotification] = useState<string | null>(null);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ ...user, profile });
    setNotification("Profilo aggiornato con successo!");
    setErrorNotification(null);
    setTimeout(() => setNotification(null), 4000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      setErrorNotification("La nuova password e la conferma non coincidono.");
      setNotification(null);
      return;
    }
    setNotification("Password aggiornata con successo!");
    setErrorNotification(null);
    setPasswordForm({ current: '', new: '', confirm: '' });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-serif text-burgundy italic">Ciao, {profile.name || 'Cliente'}</h1>
        <p className="text-gold uppercase tracking-widest text-sm font-bold">Il tuo spazio personale</p>
      </div>

      {notification && (
        <div className="p-4 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-medium animate-in fade-in">
          {notification}
        </div>
      )}

      {errorNotification && (
        <div className="p-4 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-sm font-medium animate-in fade-in">
          {errorNotification}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded shadow-sm border border-burgundy/5 space-y-6">
            <h2 className="text-xl font-serif text-burgundy italic border-b border-burgundy/5 pb-4 flex items-center gap-2">
              <MapPin size={20} className="text-gold" /> Dati Spedizione
            </h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-earth/50">Nome</label>
                  <input 
                    type="text" 
                    placeholder="Es: Mario"
                    value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})}
                    className="bg-cream p-3 text-sm rounded-sm w-full focus:outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-earth/50">Cognome</label>
                  <input 
                    type="text" 
                    placeholder="Es: Rossi"
                    value={profile.surname} onChange={e => setProfile({...profile, surname: e.target.value})}
                    className="bg-cream p-3 text-sm rounded-sm w-full focus:outline-none" 
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-earth/50">Telefono (per il corriere)</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    placeholder="+39 333 1234567"
                    value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})}
                    className="bg-cream p-3 pl-10 text-sm rounded-sm w-full focus:outline-none" 
                  />
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/50" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-earth/50">Via e Numero Civico</label>
                <input 
                  type="text" 
                  placeholder="Es: Via delle Vigne, 12"
                  value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})}
                  className="bg-cream p-3 text-sm rounded-sm w-full focus:outline-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-earth/50">Città</label>
                  <input 
                    type="text" 
                    placeholder="Es: Teramo"
                    value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})}
                    className="bg-cream p-3 text-sm rounded-sm w-full focus:outline-none" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-earth/50">CAP</label>
                  <input 
                    type="text" 
                    placeholder="Es: 64100"
                    value={profile.zip} onChange={e => setProfile({...profile, zip: e.target.value})}
                    className="bg-cream p-3 text-sm rounded-sm w-full focus:outline-none" 
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-burgundy text-white py-3 rounded text-xs font-bold uppercase tracking-widest hover:bg-gold transition-all">
                Salva Modifiche Profilo
              </button>
            </form>
          </div>

          <div className="bg-white p-8 rounded shadow-sm border border-burgundy/5 space-y-6">
            <h2 className="text-xl font-serif text-burgundy italic border-b border-burgundy/5 pb-4 flex items-center gap-2">
              <Lock size={20} className="text-gold" /> Sicurezza
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-earth/50">Password Attuale</label>
                <input 
                  type="password" required
                  value={passwordForm.current} onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
                  className="bg-cream p-3 text-sm rounded-sm w-full focus:outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-earth/50">Nuova Password</label>
                <input 
                  type="password" required
                  value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                  className="bg-cream p-3 text-sm rounded-sm w-full focus:outline-none" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-earth/50">Conferma Nuova Password</label>
                <input 
                  type="password" required
                  value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                  className="bg-cream p-3 text-sm rounded-sm w-full focus:outline-none" 
                />
              </div>
              <button type="submit" className="w-full border border-burgundy text-burgundy py-3 rounded text-xs font-bold uppercase tracking-widest hover:bg-burgundy hover:text-white transition-all">
                Cambia Password
              </button>
            </form>
          </div>
        </div>

        {/* Order History */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded shadow-sm border border-burgundy/5 space-y-6">
            <h2 className="text-xl font-serif text-burgundy italic border-b border-burgundy/5 pb-4 flex items-center gap-2">
              <Package size={20} className="text-gold" /> Cronologia Ordini
            </h2>
            
            {orders.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <Package size={48} className="mx-auto text-gold/20" />
                <p className="text-earth/50 italic text-sm">Non hai ancora effettuato ordini.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map(order => (
                  <div key={order.id} className="border border-burgundy/5 p-6 rounded hover:bg-burgundy/5 transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs font-bold uppercase text-earth/50">Ordine #{order.id.slice(0,8)}</p>
                        <p className="text-sm font-serif text-burgundy italic">{new Date(order.createdAt).toLocaleDateString()}</p>
                        <p className="text-[9px] text-gold uppercase font-black tracking-widest mt-1">{order.paymentMethod}</p>
                      </div>
                      <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase ${
                        order.status === OrderStatus.SHIPPED ? 'bg-green-100 text-green-700' :
                        order.status === OrderStatus.CANCELLED ? 'bg-red-100 text-red-700' :
                        order.status === OrderStatus.PENDING ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status === OrderStatus.PENDING ? 'In Sospeso' :
                         order.status === OrderStatus.PAID ? 'Pagato' :
                         order.status === OrderStatus.SHIPPED ? 'Evaso' :
                         'Annullato'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                       <p className="text-sm text-earth/70">{order.items.length} {order.items.length === 1 ? 'vino' : 'vini'} • € {(order.totalAmount/100).toFixed(2)}</p>
                       <button className="text-burgundy text-xs font-bold uppercase tracking-widest flex items-center group-hover:text-gold transition-colors">
                         Dettagli <ChevronRight size={14} className="ml-1" />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
