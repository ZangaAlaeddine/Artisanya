
export type Category = string;

export type UserRole = 'customer' | 'seller' | 'admin';
export type ProductStatus = 'Approved' | 'Pending' | 'Rejected';
export type RefundStatus = 'No Refund' | 'Requested' | 'Processed' | 'Declined';

export type CustomFieldType = 'text' | 'select' | 'upload';

export type StudioServiceType = 'onsite';
export type StudioOrderStatus = 'Pending' | 'Rejected' | 'Approved' | 'Product Received' | 'In Production' | 'Retouching' | 'Completed';

export interface StudioOrder {
  id: string;
  sellerId: string;
  sellerName?: string;
  productIds: string[];
  serviceType: StudioServiceType;
  stylePreset: string;
  notes?: string;
  status: StudioOrderStatus;
  price: number;
  date: string;
  appointmentDate?: string;
  rejectionReason?: string;
  photos?: string[];
}

export interface CustomizationField {
  id: string;
  type: CustomFieldType;
  label: string;
  options?: string[]; 
  required: boolean;
  placeholder?: string;
  priceImpact?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  emailVerified?: boolean;
  savedAddress?: string;
  savedCity?: string;
  savedPhone?: string;
  savedFullName?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Seller extends User {
  location: string;
  description: string;
  rating: number;
  joinedDate: string;
  logo: string;
  banner: string;
  commissionRate: number;
  businessName?: string;
}

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  images: string[];
  stock: number;
  tags: string[];
  region: string;
  status?: ProductStatus;
  reviews?: Review[];
  avgRating?: number;
  isCustomizable?: boolean;
  customizationFields?: CustomizationField[];
  productionTime?: string;
  customizationFee?: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedCustomization?: Record<string, string>; 
  totalCustomizationPrice?: number;
}

export interface DeliveryOption {
  id: string;
  provider: string;
  price: number;
  estimatedDays: string;
}

export interface TrackingInfo {
  id: string;
  orderId: string;
  status: string;
  location: string;
  timestamp: string;
  carrier: string;
}

export interface PaymentInfo {
  id: string;
  orderId: string;
  method: 'COD' | 'Card';
  amount: number;
  status: 'Success' | 'Pending' | 'Refunded';
  date: string;
}

export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  buyerName: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  date: string;
  sellerId: string;
  refundStatus?: RefundStatus;
  tracking?: TrackingInfo;
  payment?: PaymentInfo;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  messages: Message[];
}

export interface DBTable {
  name: string;
  count: number;
  columns: string[];
  lastUpdated: string;
}
