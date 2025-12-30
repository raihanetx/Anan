import { Product, Category, HotDeal, SiteConfig, Order } from './types';

export const MOCK_CATEGORIES: Category[] = [
  { name: "AI Tools", slug: "ai-tools", icon: "fas fa-robot", remixIcon: "ri-robot-line" },
  { name: "Design Tools", slug: "design-tools", icon: "fas fa-palette", remixIcon: "ri-palette-line" },
  { name: "Entertainment", slug: "entertainment", icon: "fas fa-film", remixIcon: "ri-film-line" },
  { name: "Productivity", slug: "productivity", icon: "fas fa-cogs", remixIcon: "ri-settings-3-line" },
  { name: "eBooks", slug: "ebooks", icon: "fas fa-book-open", remixIcon: "ri-book-read-line" },
  { name: "Courses", slug: "courses", icon: "fas fa-graduation-cap", remixIcon: "ri-graduation-cap-line" },
];

export const MOCK_PRODUCTS: Product[] = [
  { 
    id: 101, 
    name: "ChatGPT Plus", 
    slug: "chatgpt-plus", 
    category: "AI Tools", 
    category_slug: "ai-tools", 
    description: "Access to GPT-4, DALL-E 3, and advanced data analysis. Experience the future of conversational AI with multimodal capabilities.", 
    image: "https://picsum.photos/seed/chatgpt/800/600", 
    pricing: [
      { duration: "1 Month", price: 600, duration_days: 30 }, 
      { duration: "3 Months", price: 1700, duration_days: 90 }
    ], 
    rating: 4.8, 
    reviews: 120, 
    sold: "500+",
    is_hot_deal: true,
    hot_deal_title: "Best Seller"
  },
  { 
    id: 102, 
    name: "Midjourney Subscription", 
    slug: "midjourney", 
    category: "AI Tools", 
    category_slug: "ai-tools", 
    description: "Generate high-quality AI images from text prompts using the most advanced art generation model in the world.", 
    image: "https://picsum.photos/seed/midjourney/800/600", 
    pricing: [{ duration: "Basic Plan", price: 1200, duration_days: 30 }], 
    rating: 4.5, 
    reviews: 80, 
    sold: "300+",
    is_hot_deal: false
  },
  { 
    id: 201, 
    name: "Canva Pro", 
    slug: "canva-pro", 
    category: "Design Tools", 
    category_slug: "design-tools", 
    description: "Unlimited access to premium templates, photos, and tools. Brand kits, background remover, and magic resize included.", 
    image: "https://picsum.photos/seed/canva/800/600", 
    pricing: [{ duration: "1 Month", price: 150, duration_days: 30 }], 
    stock_out: true, 
    rating: 4.9, 
    reviews: 1500, 
    sold: "5k+",
    is_hot_deal: true,
    hot_deal_title: "Flash Sale" 
  },
  { 
    id: 301, 
    name: "Netflix Premium", 
    slug: "netflix", 
    category: "Entertainment", 
    category_slug: "entertainment", 
    description: "Watch unlimited movies & TV shows in 4K UHD. Ad-free experience on all your devices with offline downloads.", 
    image: "https://picsum.photos/seed/netflix/800/600", 
    pricing: [
      { duration: "1 Month", price: 250, duration_days: 30 }, 
      { duration: "6 Months", price: 1400, duration_days: 180 }
    ], 
    rating: 4.7, 
    reviews: 900, 
    sold: "2k+",
    is_hot_deal: false 
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: "FLM-9421",
    date: "12 Oct 2023, 02:30 PM",
    status: "Completed",
    total: 850,
    paymentMethod: "bKash",
    items: [
      { id: "o1", productId: 101, name: "ChatGPT Plus", subtitle: "1 Month", price: 600, image: "https://picsum.photos/seed/chatgpt/800/600", quantity: 1 },
      { id: "o2", productId: 301, name: "Netflix Premium", subtitle: "1 Month", price: 250, image: "https://picsum.photos/seed/netflix/800/600", quantity: 1 }
    ]
  },
  {
    id: "FLM-8832",
    date: "05 Oct 2023, 11:15 AM",
    status: "Pending",
    total: 1200,
    paymentMethod: "Nagad",
    items: [
      { id: "o3", productId: 102, name: "Midjourney Subscription", subtitle: "Basic Plan", price: 1200, image: "https://picsum.photos/seed/midjourney/800/600", quantity: 1 }
    ]
  }
];

export const MOCK_HOTDEALS: HotDeal[] = [
  { productId: 101, customTitle: "ChatGPT Plus Deal" },
  { productId: 201, customTitle: "" },
  { productId: 301, customTitle: "Netflix Special" }
];

export const MOCK_SITE_CONFIG: SiteConfig = {
  hero_banner: [
    "https://placehold.co/1200x500/7C3AED/ffffff?text=Premium+AI+Tools",
    "https://placehold.co/1200x500/6D28D9/ffffff?text=Exclusive+Design+Assets"
  ],
  hot_deals_speed: 40,
  hero_slider_interval: 5000
};

export const PAYMENT_METHODS = {
  "bKash": { "number": "01700-123456" },
  "Nagad": { "number": "01800-654321" },
  "Rocket": { "number": "01900-987654" },
  "Upay": { "number": "01600-112233" }
};