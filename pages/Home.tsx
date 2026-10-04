
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight, Wind, Anchor, Waves, User, Building2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Product } from '../types';
import { BASE_IMG_URL } from '../constants';

interface HomeProps {
  wines: Product[];
}

const Home: React.FC<HomeProps> = ({ wines }) => {
  const { t } = useTranslation();
  const bestSellers = wines.slice(0, 3);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="space-y-0 pb-0">
      {/* Hero Section - Cinematic & Immersive */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://storage.googleapis.com/immagini-vino-27-03-26/Filemail.com%20-%20CANTINA%20ORIGINI%20TUTTE/DJI_0196.jpg" 
            alt="Vigneti Terre del Poggio Majella" 
            className="w-full h-full object-cover scale-105 animate-pulse-slow"
          />
          <div className="absolute inset-0 bg-black/40 hero-gradient"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="relative z-10 text-center max-w-4xl px-4"
        >
          <span className="inline-block text-gold tracking-[0.6em] uppercase text-[10px] font-black mb-6">
            {t('hero.location')}
          </span>
          <h1 className="text-5xl md:text-7xl font-serif leading-tight text-white mb-12 whitespace-pre-line">
            {t('hero.title')}
          </h1>
          <div className="flex flex-col sm:flex-row items-center justify-center">
            <Link 
              to="/shop" 
              className="bg-gold text-white py-5 px-12 rounded-full text-[11px] font-black tracking-[0.3em] uppercase hover:bg-white hover:text-mustard transition-all shadow-2xl group"
            >
              {t('hero.cta')} <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform inline" size={16} />
            </Link>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/50"
        >
          <span className="text-[9px] uppercase tracking-[0.4em] mb-4">Scroll</span>
          <div className="w-px h-12 bg-white/20 relative overflow-hidden">
            <motion.div 
              animate={{ y: [0, 48, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full h-1/3 bg-gold"
            />
          </div>
        </motion.div>
      </section>

      {/* The Vision - Split Layout */}
      <section className="py-32 bg-cream overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={itemVariants}
              className="relative"
            >
              <div className="absolute -top-10 -left-10 text-[120px] font-serif text-mustard/5 leading-none select-none">01</div>
              <h2 className="text-5xl md:text-6xl font-serif text-mustard italic mb-8 leading-tight">
                {t('vision.title')}
              </h2>
              <p className="text-earth/70 text-lg leading-relaxed font-light mb-10">
                {t('vision.text')}
              </p>
              <Link 
                to="/shop" 
                className="bg-gold text-white py-5 px-12 rounded-full text-[11px] font-black tracking-[0.3em] uppercase hover:bg-white hover:text-mustard transition-all shadow-2xl group inline-block"
              >
                {t('vision.cta')} <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform inline" size={16} />
              </Link>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-sm shadow-2xl">
                <img 
                  src="https://storage.googleapis.com/immagini-vino-27-03-26/Filemail.com%20-%20CANTINA%20ORIGINI%20TUTTE/AN2A0544B.jpg" 
                  alt="Vigneti Terre del Poggio" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                />
              </div>
              <div className="absolute -bottom-12 -right-12 w-64 h-64 border border-mustard/20 -z-10 hidden md:block"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filosofia - Split Layout (Copy of Origini) */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative lg:order-2"
            >
              <div className="absolute -top-10 -left-10 text-[120px] font-serif text-mustard/5 leading-none select-none">02</div>
              <h2 className="text-5xl md:text-6xl font-serif text-mustard italic mb-8 leading-tight">
                {t('filosofia.title')}
              </h2>
              <p className="text-earth/70 text-lg leading-relaxed font-light mb-10">
                {t('filosofia.text')}
              </p>
              <Link 
                to="/shop" 
                className="bg-gold text-white py-5 px-12 rounded-full text-[11px] font-black tracking-[0.3em] uppercase hover:bg-white hover:text-mustard transition-all shadow-2xl group inline-block"
              >
                {t('filosofia.cta')} <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform inline" size={16} />
              </Link>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative lg:order-1"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-sm shadow-2xl">
                <img 
                  src="https://storage.googleapis.com/immagini-vino-27-03-26/Filemail.com%20-%20CANTINA%20ORIGINI%20TUTTE/493323886_1231366098989287_6841332375788048102_n.jpg" 
                  alt="Filosofia Terre del Poggio" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                />
              </div>
              <div className="absolute -bottom-12 -left-12 w-64 h-64 border border-mustard/20 -z-10 hidden md:block"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Proposta - Split Layout (Copy of Origini) */}
      <section className="py-32 bg-cream overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative"
            >
              <div className="absolute -top-10 -left-10 text-[120px] font-serif text-mustard/5 leading-none select-none">03</div>
              {t('proposta.title') && (
                <h2 className="text-5xl md:text-6xl font-serif text-mustard italic mb-8 leading-tight">
                  {t('proposta.title')}
                </h2>
              )}
              <p className="text-earth/70 text-lg leading-relaxed font-light mb-10">
                {t('proposta.text')}
              </p>
              <Link 
                to="/shop" 
                className="bg-gold text-white py-5 px-12 rounded-full text-[11px] font-black tracking-[0.3em] uppercase hover:bg-white hover:text-mustard transition-all shadow-2xl group inline-block"
              >
                {t('proposta.cta')} <ArrowRight className="ml-3 group-hover:translate-x-2 transition-transform inline" size={16} />
              </Link>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/5] overflow-hidden rounded-sm shadow-2xl">
                <img 
                  src="https://storage.googleapis.com/immagini-vino-27-03-26/Filemail.com%20-%20CANTINA%20ORIGINI%20TUTTE/cantina.png" 
                  alt="Cantina Terre del Poggio" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                />
              </div>
              <div className="absolute -bottom-12 -right-12 w-64 h-64 border border-mustard/20 -z-10 hidden md:block"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Compact Newsletter Section */}
      <section className="py-12 bg-cream border-t border-mustard/5">
        <div className="max-w-xl mx-auto px-4 text-center space-y-4">
          <h2 className="text-xl font-serif italic text-mustard">{t('newsletter.title')}</h2>
          <p className="text-[11px] text-earth/60 uppercase tracking-widest font-bold">
            {t('newsletter.text')}
          </p>
          <form className="flex gap-2 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder={t('newsletter.placeholder')} 
              className="flex-1 bg-white border border-mustard/10 rounded-full px-5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gold transition-all"
            />
            <button className="bg-mustard text-white px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-gold transition-all shadow-sm">
              {t('newsletter.button')}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
