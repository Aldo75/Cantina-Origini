
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import { User } from '../types';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Globe } from 'lucide-react';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../src/lib/firestore';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type') as 'PRIVATE' | 'BUSINESS' | null;
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'PRIVATE' | 'BUSINESS'>(typeParam || 'PRIVATE');

  useEffect(() => {
    if (typeParam) {
      setUserType(typeParam);
    }
  }, [typeParam]);
  const [companyName, setCompanyName] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    const trimmedEmail = email.trim();
    
    try {
      if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, trimmedEmail);
        setIsEmailSent(true);
        return;
      }

      if (mode === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);
        const firebaseUser = userCredential.user;
        
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          onLogin(userDoc.data() as User);
          if (userDoc.data().role === 'ADMIN') {
            navigate('/admin');
          } else {
            navigate('/shop');
          }
        } else {
          // Fallback for admin or if doc doesn't exist
          const isAdmin = email === 'difabrizioaldo@gmail.com' || email === 'admin@terredelpoggio.it' || email === 'newgiotime@gmail.com';
          const newUser: User = { id: firebaseUser.uid, email, role: isAdmin ? 'ADMIN' : 'CUSTOMER', userType: 'PRIVATE' };
          onLogin(newUser);
          navigate(isAdmin ? '/admin' : '/shop');
        }
      } else if (mode === 'register') {
        const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        const firebaseUser = userCredential.user;

        const isAdmin = trimmedEmail === 'difabrizioaldo@gmail.com' || trimmedEmail === 'admin@terredelpoggio.it' || trimmedEmail === 'newgiotime@gmail.com';
        const newUser: User = { 
          id: firebaseUser.uid, 
          email: trimmedEmail, 
          role: isAdmin ? 'ADMIN' : 'CUSTOMER',
          userType: userType,
          profile: { 
            name: '', 
            surname: '', 
            address: '', 
            city: '', 
            zip: '', 
            phone: '', 
            country: 'Italia',
            ...(userType === 'BUSINESS' ? { 
              companyName: companyName || '', 
              vatNumber: vatNumber || '' 
            } : {})
          }
        };

        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        onLogin(newUser);
        navigate(isAdmin ? '/admin' : '/shop');
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      if (err.code === 'auth/operation-not-allowed') {
        setError("L'autenticazione tramite email/password non è abilitata nella console Firebase. Abilitala nella sezione Authentication > Sign-in method.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Credenziali non valide. Controlla l'email e la password e riprova.");
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Email o password errati.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("Questa email è già associata a un account.");
      } else if (err.code === 'auth/weak-password') {
        setError("La password è troppo debole. Usa almeno 6 caratteri.");
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        onLogin(userDoc.data() as User);
        if (userDoc.data().role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate('/shop');
        }
      } else {
        const isAdmin = firebaseUser.email === 'difabrizioaldo@gmail.com' || firebaseUser.email === 'admin@terredelpoggio.it' || firebaseUser.email === 'newgiotime@gmail.com';
        const newUser: User = { 
          id: firebaseUser.uid, 
          email: firebaseUser.email || '', 
          role: isAdmin ? 'ADMIN' : 'CUSTOMER', 
          userType: 'PRIVATE' 
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
        onLogin(newUser);
        navigate(isAdmin ? '/admin' : '/shop');
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      if (
        err.code === 'auth/popup-closed-by-user' ||
        err.code === 'auth/cancelled-popup-request' ||
        err.name === 'AbortError' ||
        err.message?.includes('The user aborted a request') ||
        err.message?.toLowerCase().includes('aborted')
      ) {
        // Voluntary user cancellation, do not show error banner
        return;
      }
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="mx-auto w-20 h-20 bg-gold/10 flex items-center justify-center rounded-full text-gold">
          <CheckCircle2 size={48} />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-serif text-burgundy italic">{t('auth.emailSentTitle')}</h1>
          <p className="text-earth/70 text-sm leading-relaxed">
            <Trans i18nKey="auth.emailSentText" values={{ email }}>
              Abbiamo inviato le istruzioni per il ripristino della password a <strong>{email}</strong>. 
              Controlla la tua cartella di posta in arrivo.
            </Trans>
          </p>
        </div>
        <button 
          onClick={() => { setMode('login'); setIsEmailSent(false); }}
          className="text-burgundy font-bold uppercase tracking-widest text-xs underline underline-offset-8"
        >
          {t('auth.backToLogin')}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-24 px-4">
      <div className="bg-white p-8 rounded-lg shadow-xl border border-burgundy/5 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif text-burgundy italic">
            {mode === 'login' && t('auth.loginTitle')}
            {mode === 'register' && t('auth.registerTitle')}
            {mode === 'forgot' && t('auth.forgotTitle')}
          </h1>
          <p className="text-earth/60 text-sm">
            {mode === 'login' && t('auth.loginSub')}
            {mode === 'register' && t('auth.registerSub')}
            {mode === 'forgot' && t('auth.forgotSub')}
          </p>
        </div>

        {mode !== 'forgot' && (
          <div className="flex p-1 bg-cream rounded-lg border border-burgundy/10">
            <button
              onClick={() => setUserType('PRIVATE')}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${
                userType === 'PRIVATE' ? 'bg-burgundy text-white shadow-md' : 'text-earth/40 hover:text-burgundy'
              }`}
            >
              {t('auth.private')}
            </button>
            <button
              onClick={() => setUserType('BUSINESS')}
              className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${
                userType === 'BUSINESS' ? 'bg-burgundy text-white shadow-md' : 'text-earth/40 hover:text-burgundy'
              }`}
            >
              {t('auth.business')}
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="text-red-500 shrink-0" size={18} />
            <p className="text-xs text-red-600 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-earth/50">{t('auth.email')}</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-cream border border-burgundy/10 rounded-sm p-3 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy" 
              placeholder="esempio@mail.com"
            />
          </div>

          {mode === 'register' && userType === 'BUSINESS' && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-earth/50">{t('auth.companyName')}</label>
                <input 
                  type="text" 
                  required 
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full bg-cream border border-burgundy/10 rounded-sm p-3 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy" 
                  placeholder="Nome Azienda"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-earth/50">{t('auth.vatNumber')}</label>
                <input 
                  type="text" 
                  required 
                  value={vatNumber}
                  onChange={e => setVatNumber(e.target.value)}
                  className="w-full bg-cream border border-burgundy/10 rounded-sm p-3 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy" 
                  placeholder="IT01234567890"
                />
              </div>
            </>
          )}
          
          {mode !== 'forgot' && (
            <div className="space-y-1">
              <div className="flex justify-between items-end">
                <label className="text-[10px] uppercase font-bold tracking-widest text-earth/50">{t('auth.password')}</label>
                {mode === 'login' && (
                  <button 
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[10px] text-burgundy hover:text-gold transition-colors font-bold uppercase"
                  >
                    {t('auth.forgotPassword')}
                  </button>
                )}
              </div>
              <input 
                type="password" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-cream border border-burgundy/10 rounded-sm p-3 text-sm focus:outline-none focus:ring-1 focus:ring-burgundy" 
                placeholder="••••••••"
              />
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-burgundy text-white py-4 rounded font-bold tracking-widest uppercase hover:bg-gold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {mode === 'login' && t('auth.loginButton')}
            {mode === 'register' && t('auth.registerButton')}
            {mode === 'forgot' && t('auth.resetButton')}
          </button>
        </form>

        {mode !== 'forgot' && (
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-burgundy/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold">
                <span className="bg-white px-4 text-earth/30">Oppure continua con</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white border-2 border-burgundy/10 text-earth py-4 rounded font-bold tracking-widest uppercase hover:bg-cream transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <Globe size={18} className="text-burgundy" />
              Google
            </button>
          </div>
        )}

        <div className="text-center pt-4 border-t border-burgundy/5 space-y-4">
          {mode === 'forgot' ? (
            <button 
              onClick={() => setMode('login')}
              className="flex items-center justify-center gap-2 mx-auto text-sm text-earth/60 hover:text-burgundy transition-colors"
            >
              <ArrowLeft size={14} /> {t('auth.backToLogin')}
            </button>
          ) : (
            <button 
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-sm text-earth/60 hover:text-burgundy transition-colors underline underline-offset-4"
            >
              {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
