
export interface PricingOption {
  duration: string;       // Display text (e.g. "1 Month")
  duration_days: number;  // Logic value (e.g. 30)
  price: number;
  stock?: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  category: string;
  category_slug: string;
  description: string;
  short_description?: string;
  image: string;
  pricing: PricingOption[];
  rating: number;
  reviews: number;
  sold: string;
  stock_out?: boolean;
  is_featured?: boolean;
  is_hot_deal?: boolean;
  hot_deal_title?: string;
  related_product_ids?: number[]; // New Field for Manual Related Products
}

export interface Category {
  id?: number;
  name: string;
  slug: string;
  icon: string; // Used for the main icon class string
  remixIcon?: string; // Legacy support, mapped to icon
}

export interface CartItem {
  id: string; // unique id for cart instance
  productId: number;
  name: string;
  subtitle: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Order {
  id: string;
  date: string; // Formatted string for UI
  createdAt?: string; // ISO Timestamp from DB
  status: 'Pending' | 'Completed' | 'Processing' | 'Cancelled';
  items: CartItem[];
  total: number;
  paymentMethod: string;
  // New Fields
  transactionId?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
  number: string;
  instructions?: string;
  is_custom: boolean;
  is_active?: boolean;
}

export interface Review {
  id: number;
  product_id: number;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
  likes?: number;
}

export interface HotDeal {
  productId: number;
  customTitle: string;
}

export type View = 'home' | 'shop' | 'details' | 'cart' | 'checkout' | 'orders' | 'admin';

export interface SiteConfig {
  hero_banner: string[];
  hot_deals_speed: number;
  hero_slider_interval: number;
}
