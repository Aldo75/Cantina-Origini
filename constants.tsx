
import { Product } from './types';

// Encoded the spaces in the URL to prevent potential issues
export const BASE_IMG_URL = 'https://storage.googleapis.com/immagini-vino-27-03-26/Filemail.com%20-%20CANTINA%20ORIGINI%20TUTTE';
export const LOGO_URL = 'https://storage.googleapis.com/immagini-vino-27-03-26/logo_origini.png';

export const WINES: Product[] = [
  {
    id: '1',
    name: "PASSO CALE Montepulciano d'Abruzzo Doc",
    slug: 'montepulciano-dop',
    vintage: 2020,
    grape: 'Montepulciano',
    category: 'Rosso',
    priceInCents: 850,
    businessDiscountPercentage: 20,
    stock: 120,
    liters: '0.75',
    image: `${BASE_IMG_URL}/AN2A6867.jpg`,
    lifestyleImage: `${BASE_IMG_URL}/AN2A0540.jpg`,
    isAvailable: true,
    sulfites: true,
    alcohol: '13.0%',
    allergens: 'Contiene solfiti',
    description: "Un rosso d'eccellenza che incarna l'anima forte e gentile dell'Abruzzo. Vinificato in purezza con uve provenienti dai vigneti di Poggiofiorito.",
    tastingNotes: {
      visual: "Rosso intenso con sfumature granate.",
      olfactory: "Al naso frutti rossi e note speziate di tabacco e liquirizia.",
      gustatory: "Al palato è asciutto armonico e vellutato."
    },
    pairings: ["Primi piatti robusti", "Carni rosse", "Cacciagione", "Formaggi media stagionatura"]
  },
  {
    id: '2',
    name: "Pecorino Terre D'Abruzzo IGP",
    slug: 'pecorino-igp',
    vintage: 2022,
    grape: 'Pecorino',
    category: 'Bianco',
    priceInCents: 850,
    businessDiscountPercentage: 20,
    stock: 85,
    liters: '0.75',
    image: `${BASE_IMG_URL}/AN2A6863.jpg`,
    lifestyleImage: `${BASE_IMG_URL}/AN2A0545.jpg`,
    isAvailable: true,
    sulfites: true,
    alcohol: '13.0%',
    allergens: 'Contiene solfiti',
    description: "Un bianco di grande carattere e sapidità, influenzato dalle brezze marine dell'Adriatico.",
    tastingNotes: {
      visual: "Giallo paglierino con riflessi dorati.",
      olfactory: "Agrumi, fiori bianchi e una spiccata mineralità.",
      gustatory: "Fresco, persistente, con una piacevole acidità."
    },
    pairings: ["Crudi di mare", "Primi piatti di pesce", "Zuppe di legumi"]
  },
  {
    id: '3',
    name: "PASSO CALE Cerasuolo d'Abruzzo Dop",
    slug: 'cerasuolo-dop',
    vintage: 2022,
    grape: 'Montepulciano',
    category: 'Rosato',
    priceInCents: 850,
    businessDiscountPercentage: 20,
    stock: 150,
    liters: '0.75',
    image: `${BASE_IMG_URL}/AN2A6860.jpg`,
    lifestyleImage: `${BASE_IMG_URL}/AN2A0550.jpg`,
    isAvailable: true,
    sulfites: true,
    alcohol: '13.0%',
    allergens: 'Contiene solfiti',
    description: "Il rosato simbolo dell'Abruzzo, fresco e profumato, ideale per le serate estive.",
    tastingNotes: {
      visual: "Rosa ciliegia.",
      olfactory: "Pieno e gradevole con note di ciliegia, lampone e melagrana.",
      gustatory: "Equilibrato, morbido e fragrante."
    },
    pairings: ["Primi piatti leggeri", "Carni bianche", "Salumi", "Bruschette"]
  },
  {
    id: '4',
    name: "Pinot noir Terre di Chieti IGT",
    slug: 'pinot-noir-igt',
    vintage: 2021,
    grape: 'Pinot Noir',
    category: 'Rosso',
    priceInCents: 750,
    businessDiscountPercentage: 20,
    stock: 95,
    liters: '0.75',
    image: `${BASE_IMG_URL}/AN2A6884.jpg`,
    lifestyleImage: `${BASE_IMG_URL}/AN2A0555.jpg`,
    isAvailable: true,
    sulfites: true,
    alcohol: '13.0%',
    allergens: 'Contiene solfiti',
    description: "Un'interpretazione elegante del Pinot Nero in terra d'Abruzzo. Un vino che seduce per la sua finezza, complessità aromatica e setosità.",
    tastingNotes: {
      visual: "Rosso rubino scarico con eleganti riflessi granati.",
      olfactory: "Sinfonia di piccoli frutti rossi, ciliegia e sottili note di sottobosco e spezie dolci.",
      gustatory: "Sorso vellutato e fresco, con una trama tannica finissima e un finale di grande persistenza."
    },
    pairings: ["Anatra all'arancia", "Risotto ai porcini", "Salmone alla griglia", "Formaggi a pasta molle"]
  },
  {
    id: '5',
    name: "STELLANTE COCOCCIOLA ANFORA IGT",
    slug: 'stellante-cococciola-anfora',
    vintage: 2023,
    grape: 'Cococciola',
    category: 'Bianco',
    priceInCents: 1600,
    businessDiscountPercentage: 20,
    stock: 60,
    liters: '0.75',
    image: `${BASE_IMG_URL}/AN2A6886.jpg`,
    lifestyleImage: `${BASE_IMG_URL}/AN2A0560.jpg`,
    isAvailable: true,
    sulfites: true,
    alcohol: '12.5%',
    allergens: 'Contiene solfiti',
    description: "Raro vitigno autoctono vinificato in anfora, la Cococciola offre un'acidità vibrante e una freschezza senza pari con una complessità unica.",
    tastingNotes: {
      visual: "Giallo scarico con riflessi verdolini.",
      olfactory: "Erba tagliata, scorza di limone e note agrumate.",
      gustatory: "Molto fresco, teso, con una vena citrina elegante."
    },
    pairings: ["Aperitivo", "Sushi", "Fritture di paranza"]
  },
  {
    id: '6',
    name: "Passerina Terre D'Abruzzo IGP",
    slug: 'passerina-igp',
    vintage: 2023,
    grape: 'Passerina',
    category: 'Bianco',
    priceInCents: 850,
    businessDiscountPercentage: 20,
    stock: 90,
    liters: '0.75',
    image: `${BASE_IMG_URL}/AN2A6856.jpg`,
    lifestyleImage: `${BASE_IMG_URL}/AN2A0565.jpg`,
    isAvailable: true,
    sulfites: true,
    alcohol: '13.0%',
    allergens: 'Contiene solfiti',
    description: "Un vino gioioso, fruttato e di pronta beva, amato per la sua immediatezza aromatica e la qualità IGP.",
    tastingNotes: {
      visual: "Giallo paglierino brillante.",
      olfactory: "Fiori di acacia, pesca bianca e frutta tropicale.",
      gustatory: "Morbido, vellutato, molto equilibrato."
    },
    pairings: ["Pesce d'acqua dolce", "Salumi abruzzesi", "Pasta alle vongole"]
  }
];
