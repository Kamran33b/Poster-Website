export interface PosterSize {
  id: string;
  name: string;
  dimensions: string; // e.g. "30 × 40 cm (12 × 16″)"
  priceMultiplier: number;
  inStock: boolean;
}

export interface FrameOption {
  id: string;
  name: string;
  material: string;
  price: number;
  colorHex: string;
  borderStyle: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  category: string;
  collection: string;
  price: number; // Base price
  discountPrice: number | null;
  sizes: PosterSize[];
  frameOptions: FrameOption[];
  stock: number;
  sku: string;
  tags: string[];
  seoTitle: string;
  seoDescription: string;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  featured?: boolean;
  isFeatured?: boolean;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  bannerImage?: string;
  posterCount: number;
}

export interface CartItem {
  cartId: string;
  productId: string;
  name: string;
  image: string;
  size: PosterSize;
  frame: FrameOption;
  unitPrice: number;
  quantity: number;
}

export interface ShippingAddress {
  id?: string;
  label?: string; // e.g. "Home", "Work / Studio", "Gallery Office"
  fullName: string;
  email: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  sizeName: string;
  frameName: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export type OrderStatus =
  | 'Pending'
  | 'Processing'
  | 'Printed & Framed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: {
    fullName: string;
    email: string;
    phone: string;
  };
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  shippingCarrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  paymentMethod: 'Credit / Debit Card' | 'Apple Pay' | 'PayPal' | 'UPI';
  upiId?: string;
  upiTransactionRef?: string;
  paymentStatus: 'Paid' | 'Processing' | 'Failed' | 'Refunded';
  cancelReason?: string;
  cancelledBy?: 'Customer' | 'Admin';
  cancelledAt?: string;
  timeline: Array<{
    status: OrderStatus;
    timestamp: string;
    note: string;
  }>;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend: number;
  isActive: boolean;
  description: string;
  usageCount: number;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  date: string;
  location?: string;
  image?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  passwordHash?: string;
  phone?: string;
  avatar?: string;
  addresses: ShippingAddress[];
  wishlist: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockCount: number;
  monthlyRevenue: Array<{ month: string; amount: number; orders: number }>;
  categoryDistribution: Array<{ category: string; count: number; sales: number }>;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  name: string;
  email: string;
  phone?: string;
  orderNumber?: string;
  category: 'Order Status & Tracking' | 'Damaged / Replacement Print' | 'Custom Framing & Sizing' | 'Returns & Refunds' | 'General Inquiry';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
  updatedAt: string;
  responses?: Array<{
    id: string;
    sender: 'Customer' | 'Support Agent';
    senderName: string;
    message: string;
    timestamp: string;
  }>;
}

export interface StoreSettings {
  storeName: string;
  currency: string;
  currencySymbol?: string;
  currencyRate?: number;
  taxRate: number;
  shippingFlatRate: number;
  freeShippingThreshold: number;
  supportEmail?: string;
  supportPhone?: string;
  supportHours?: string;
}

export type ThemeMode = 'light' | 'dark';

