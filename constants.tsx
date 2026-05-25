
import { Category, Product, Seller, DeliveryOption, Order, Conversation } from './types';

// High-quality emblem representing Tunisian Jasmine & Traditional Geometric Patterns
export const PROJECT_LOGO_URL = "logo.png";

export const TUNISIAN_CITIES = [
  'Ariana', 
  'Béja', 
  'Ben Arous', 
  'Bizerte', 
  'Djerba', 
  'Gabès', 
  'Gafsa', 
  'Jendouba', 
  'Kairouan', 
  'Kasserine', 
  'Kébili', 
  'Kef', 
  'Mahdia', 
  'Manouba', 
  'Médenine', 
  'Monastir', 
  'Nabeul', 
  'Sfax', 
  'Sidi Bouzid', 
  'Siliana', 
  'Sousse', 
  'Tataouine', 
  'Tozeur', 
  'Tunis', 
  'Zaghouan'
];

export const INITIAL_CATEGORIES: Category[] = [
  'Pottery', 
  'Carpets & Rugs', 
  'Jewelry', 
  'Home Decor', 
  'Fashion & Textiles', 
  'Fine Art', 
  'Gourmet & Spices'
];

export const MOCK_SELLERS: Seller[] = [];

export const MOCK_PRODUCTS: Product[] = [];

export const MOCK_ORDERS: Order[] = [];

export const MOCK_CONVERSATIONS: Conversation[] = [];

export const DELIVERY_OPTIONS: DeliveryOption[] = [
  { id: 'd1', provider: 'Aramex Tunisia', price: 7.00, estimatedDays: '2-3 Business Days' },
  { id: 'd2', provider: 'Livreur Express', price: 12.00, estimatedDays: 'Same Day (Tunis Only)' },
  { id: 'd3', provider: 'Standard Poste', price: 4.50, estimatedDays: '5-7 Business Days' }
];
