
export type WineCategory = 'Rosso' | 'Bianco' | 'Rosato' | 'Bollicine';

export interface ShippingTier {
  cost: number;
  freeThreshold: number;
}

export interface ShippingSettings {
  italy: ShippingTier;
  islands: ShippingTier;
  europe: ShippingTier;
  world: ShippingTier;
  supportedCountries: string[];
  europeanCountries: string[];
}

export interface UserProfile {
  name: string;
  surname: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
  country: string;
  companyName?: string;
  vatNumber?: string;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  role: 'ADMIN' | 'CUSTOMER';
  userType: 'PRIVATE' | 'BUSINESS';
  profile?: UserProfile;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  vintage: number;
  grape: string;
  category: WineCategory;
  priceInCents: number;
  businessDiscountPercentage?: number;
  stock: number;
  liters: string;
  image: string;
  lifestyleImage: string;
  isAvailable: boolean;
  sulfites: boolean;
  alcohol: string;
  allergens: string;
  description: string;
  tastingNotes: {
    visual: string;
    olfactory: string;
    gustatory: string;
  };
  pairings: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: 'FIXED' | 'PERCENT';
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  CANCELLED = 'CANCELLED'
}

export type PaymentMethod = 'STRIPE' | 'CONTRASSEGNO' | 'BONIFICO';

export interface PaymentSettings {
  contrassegnoDiscount: number;
  bonificoDiscount: number;
  stripeEnabled: boolean;
  contrassegnoEnabled: boolean;
  bonificoEnabled: boolean;
  bankIban?: string;
  bankHolder?: string;
  bankName?: string;
  bankBic?: string;
}

export interface StripeSettings {
  publicKey: string;
  secretKey: string;
  mode: 'test' | 'live';
}

export interface SiteSettings {
  name: string;
  logoUrl: string;
  baseImgUrl: string;
  paymentSettings: PaymentSettings;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  userAddress: string;
  items: CartItem[];
  totalAmount: number;
  shippingCost: number;
  status: OrderStatus;
  createdAt: string;
  shippingCountry: string;
  paymentMethod: PaymentMethod;
  paymentDiscountInCents: number;
}
