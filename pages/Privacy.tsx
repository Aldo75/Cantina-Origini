
import React from 'react';
import { Shield, Lock, Eye, FileText, RefreshCw } from 'lucide-react';
import { useTranslation, Trans } from 'react-i18next';

const Privacy: React.FC = () => {
  const { t } = useTranslation();
  const [revoked, setRevoked] = React.useState(false);

  const handleRevoke = () => {
    localStorage.removeItem('gdpr-consent');
    setRevoked(true);
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-serif text-mustard italic">{t('privacy.title')}</h1>
        <p className="text-lavender tracking-[0.3em] uppercase text-sm font-bold">{t('privacy.subtitle')}</p>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-lg shadow-sm border border-mustard/5 space-y-12">
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-mustard">
            <Shield size={24} className="text-lavender" />
            <h2 className="text-2xl font-serif italic">{t('privacy.section1Title')}</h2>
          </div>
          <p className="text-earth/70 text-sm leading-relaxed">
            <Trans i18nKey="privacy.section1Text">
              Il titolare del trattamento è <strong>Origini Srl Società Agricola</strong>, con sede legale in Contrada Mortella, 67, 66030 Poggiofiorito (CH), Partita IVA: 02774160697. 
              Email di contatto: <a href="mailto:info@terredelpoggio.it" className="text-mustard">info@terredelpoggio.it</a>.
            </Trans>
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-mustard">
            <Eye size={24} className="text-lavender" />
            <h2 className="text-2xl font-serif italic">{t('privacy.section2Title')}</h2>
          </div>
          <ul className="list-disc list-inside text-earth/70 text-sm space-y-2 ml-4">
            <li>{t('privacy.section2List1')}</li>
            <li>{t('privacy.section2List2')}</li>
            <li>{t('privacy.section2List3')}</li>
          </ul>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-mustard">
            <Lock size={24} className="text-lavender" />
            <h2 className="text-2xl font-serif italic">{t('privacy.section3Title')}</h2>
          </div>
          <p className="text-earth/70 text-sm leading-relaxed">
            {t('privacy.section3Text')}
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-mustard">
            <FileText size={24} className="text-lavender" />
            <h2 className="text-2xl font-serif italic">{t('privacy.section4Title')}</h2>
          </div>
          <p className="text-earth/70 text-sm leading-relaxed">
            <Trans i18nKey="privacy.section4Text">
              In conformità al Regolamento UE 2016/679 (GDPR), hai il diritto di accedere ai tuoi dati, chiederne la rettifica, 
              la cancellazione o la limitazione del trattamento. Puoi esercitare questi diritti scrivendo a <a href="mailto:info@terredelpoggio.it" className="text-mustard">info@terredelpoggio.it</a>.
            </Trans>
          </p>
        </section>

        <section className="p-8 bg-mustard/5 rounded-lg border border-mustard/10 space-y-4 text-center">
          <h3 className="font-serif text-xl text-mustard italic">{t('privacy.cookieTitle')}</h3>
          <p className="text-sm text-earth/70">
            {t('privacy.cookieText')}
          </p>
          {revoked && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded text-xs font-semibold">
              {t('privacy.cookieRevokeAlert')}
            </div>
          )}
          <button 
            onClick={handleRevoke}
            className="inline-flex items-center gap-2 bg-mustard text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-lavender transition-all"
          >
            <RefreshCw size={16} /> {t('privacy.cookieButton')}
          </button>
        </section>
      </div>

      <div className="text-center">
        <p className="text-[10px] text-earth/40 uppercase tracking-[0.2em]">{t('privacy.lastUpdate')}</p>
      </div>
    </div>
  );
};

export default Privacy;
