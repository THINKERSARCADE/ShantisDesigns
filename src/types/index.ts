export interface Category {
  id: number;
  name: string;
  slug: string;
  permalink?: string;
  parent?: number;
  count?: number;
  description?: string;
  icon?: string;
  imageUrl?: string;
  image_url?: string;
  seo_keywords?: string[];
}

export type StockStatus = 'instock' | 'outofstock' | 'onbackorder';
export type ProductType = 'simple' | 'variable' | 'grouped' | 'external';
export type ProductVisibility = 'visible' | 'catalog' | 'search' | 'hidden';

export interface Product {
  id: number;
  name: string; // Title in WooCommerce
  title?: string;
  slug: string;
  date?: string; // Date in WooCommerce
  parent_id?: number | null; // Parent Product ID
  permalink?: string; // Product URL in WooCommerce
  url?: string;
  sku: string;
  description: string;
  shortDescription?: string;
  short_description?: string;
  price: number;
  regular_price?: number;
  sale_price: number | null;
  stock: number;
  manage_stock?: boolean;
  stock_status: StockStatus;
  product_type?: ProductType;
  product_visibility?: ProductVisibility;
  backorders_allowed?: boolean;
  category_id: number;
  category_name?: string;
  categories?: string[];
  image_url: string;
  image?: string;
  gallery?: string[];
  featured?: boolean;
  warranty?: string;
  specs?: Record<string, string>;
  woocommerce_id?: number | null;
  rating?: number;
  reviews_count?: number;
  weight?: string;
  dimensions?: string;
  tags?: string[];
  seo_keywords?: string[];
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  client: string;
  location: string;
  category: 'commercial' | 'residential' | 'agricultural' | 'water_heating';
  category_name: string;
  system_size: string;
  panels_count?: string;
  inverter_specs?: string;
  battery_specs?: string;
  image_url: string;
  gallery?: string[];
  video_url?: string;
  videos?: string[];
  seo_keywords?: string[];
  completion_date: string;
  kplc_savings: string;
  description: string;
  featured?: boolean;
}

export interface AboutData {
  headline: string;
  subheading: string;
  partner_section_title: string;
  partner_intro_1: string;
  partner_intro_2: string;
  why_choose: { title: string; description: string }[];
  vision: string;
  mission: string;
  core_values: string;
  certifications: { title: string; subtitle: string }[];
  gallery_images?: { url: string; caption: string }[];
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  mime_type: string;
  size: string;
  dimensions: string;
  uploaded_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_image?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  order_number: string;
  user_id?: number | null;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_location: string;
  customer_notes?: string;
  total: number;
  status: 'pending' | 'processing' | 'paid' | 'delivered' | 'cancelled';
  payment_method: 'mpesa_daraja' | 'whatsapp' | 'cash_on_delivery' | 'bank_transfer';
  mpesa_receipt?: string | null;
  checkout_request_id?: string | null;
  items: OrderItem[];
  created_at: string;
}

export interface WhatsAppLead {
  id: number;
  product_id?: number | null;
  product_name: string;
  phone_number: string;
  total_value: number;
  timestamp: string;
  status: 'new' | 'contacted' | 'quoted' | 'converted' | 'lost';
  notes?: string;
  source: 'cart' | 'product_quote' | 'direct_chat' | 'installation_request';
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  category?: string;
  content: string;
  excerpt: string;
  meta_description: string;
  author: string;
  published_at: string;
  image_url: string;
  tags?: string[];
  read_time?: string;
}

export interface Partner {
  id: number;
  name: string;
  logo_url: string;
  category: 'inverters' | 'batteries' | 'panels' | 'protection' | 'all';
  active: boolean;
  website_url?: string;
  sort_order?: number;
}

export interface GoogleReview {
  id: number;
  author_name: string;
  author_photo: string;
  rating: number;
  time_ago: string;
  text: string;
  location?: string;
  verified: boolean;
  reviewer_badge?: string;
  likes_count?: number;
  owner_reply?: string;
  owner_reply_time?: string;
  keywords?: string[];
  google_review_url?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type AspectRatioOption = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';

export type UserRole = 'admin' | 'engineer' | 'customer';

export interface AuditLogEntry {
  id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  action: string;
  resource_type: 'product' | 'project' | 'blog' | 'payment' | 'partner' | 'homepage' | 'security' | 'woocommerce';
  details: string;
  ip_address: string;
  timestamp: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  capacity_range: string;
  image_url: string;
  highlight_metric: string;
}

export type HomepageTemplateId = 'classic_epc' | 'modern_marketplace' | 'swiss_architectural';

export interface HomepageConfig {
  template_id: HomepageTemplateId;
  hero_kicker: string;
  hero_headline: string;
  hero_highlight: string;
  hero_subheadline: string;
  hero_image_url: string;
  primary_cta_label: string;
  secondary_cta_label: string;
  epc_banner_title: string;
  epc_banner_subtitle: string;
  show_trust_bar: boolean;
  show_deals_section: boolean;
  show_partners_marquee: boolean;
  show_epc_services: boolean;
  show_google_reviews: boolean;
  services: ServiceItem[];
  updated_at: string;
}
