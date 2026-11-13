import {
  Product,
  Category,
  Order,
  WhatsAppLead,
  Article,
  Partner,
  GoogleReview,
  Project,
  AboutData,
  MediaItem,
  AuditLogEntry,
  HomepageConfig,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_PARTNERS,
  INITIAL_REVIEWS,
  INITIAL_ARTICLES,
  INITIAL_LEADS,
  INITIAL_ORDERS,
  INITIAL_PROJECTS,
  INITIAL_ABOUT_DATA,
  INITIAL_MEDIA,
} from '../data/initialData';

export const INITIAL_HOMEPAGE_CONFIG: HomepageConfig = {
  template_id: 'modern_marketplace',
  hero_kicker: 'EPRA Licensed Solar PV Contractor (License #EPRA/PV/0294)',
  hero_headline: 'Clean Energy, For a Greener Africa',
  hero_highlight: 'Solar Systems for Africa',
  hero_subheadline:
    'Shantis Solar Solutions is a licensed solar engineering, procurement, and construction company dedicated to delivering reliable, affordable, and sustainable clean energy solutions across Africa.',
  hero_image_url:
    'https://shantisprojects.lovable.app/__l5e/assets-v1/0f44c6c4-ebd7-4883-bae0-17c6dbe786a5/tatu-city.jpg',
  primary_cta_label: 'Explore Solar Shop',
  secondary_cta_label: 'Request Installation Sizing Quote',
  epc_banner_title: 'Turnkey Solar EPC & Engineering Services',
  epc_banner_subtitle:
    'Full-service design, sizing, procurement, and grid-tie integration for residential, commercial, institutional, and agricultural facilities in East Africa.',
  show_trust_bar: true,
  show_deals_section: true,
  show_partners_marquee: true,
  show_epc_services: true,
  show_google_reviews: true,
  services: [
    {
      id: 'srv-1',
      title: 'Commercial & Institutional Solar Systems',
      subtitle:
        'Reduce monthly grid power tariffs for schools, churches, factories, and commercial buildings.',
      description:
        'Custom 15kWp to 1MWp rooftop and ground-mount solar arrays engineered with hybrid and grid-tied technology to eliminate daytime electricity bills.',
      capacity_range: '15kW - 1MW+',
      image_url:
        'https://shantisprojects.lovable.app/__l5e/assets-v1/42c480d8-3867-4b6a-861f-6806fe336bb4/ruiru-secondary-school.jpeg',
      highlight_metric: 'Save up to 85% on KPLC Tariffs',
    },
    {
      id: 'srv-2',
      title: 'Residential Hybrid & Off-Grid Solar Power',
      subtitle: 'Uninterrupted 24/7 backup power for modern homes and villas across Kenya.',
      description:
        'Smart 5kW to 15kW hybrid inverters paired with Lithium Valley LiFePO4 battery walls providing seamless power during KPLC outages.',
      capacity_range: '5kW - 15kW',
      image_url:
        'https://shantisprojects.lovable.app/__l5e/assets-v1/4650b33c-0d40-47c5-96df-890cad0ba5c6/thika-road-residential.jpeg',
      highlight_metric: '0ms Uninterrupted UPS Switching',
    },
    {
      id: 'srv-3',
      title: 'Doyin Solar Water Pumping & Solar Water Heating',
      subtitle:
        'High-efficiency MPPT pumping for deep boreholes and evacuated tube solar water heaters.',
      description:
        'Direct solar-drive Doyin borehole pumps and pressurized solar water heating systems operating with zero electric geyser or diesel fuel expenses.',
      capacity_range: '0.75HP - 10HP Pumps & 200L-300L Heaters',
      image_url:
        'https://shantisprojects.lovable.app/__l5e/assets-v1/fb447bc0-6cb0-4aa7-b06e-08cb9baad0c8/kabete-water.jpg',
      highlight_metric: 'Zero Diesel or Electric Heating Costs',
    },
  ],
  updated_at: '2026-11-13 09:00',
};

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-101',
    user_id: 'USR-EPRA-01',
    user_name: 'Eng. Patrick Mwangi',
    user_role: 'admin',
    action: '2FA_AUTHENTICATED',
    resource_type: 'security',
    details: 'Verified SQL TOTP token and established encrypted session',
    ip_address: '197.232.61.104',
    timestamp: '2026-11-13 08:15:22',
  },
  {
    id: 'aud-102',
    user_id: 'USR-EPRA-01',
    user_name: 'Eng. Patrick Mwangi',
    user_role: 'admin',
    action: 'SQLITE_DB_SYNC',
    resource_type: 'woocommerce',
    details: 'Synchronized 157 products, 35 categories, and 80+ project images in SQLite WAL database',
    ip_address: '197.232.61.104',
    timestamp: '2026-11-13 08:20:10',
  },
];

// Live in-memory state hydrated from the Node.js SQLite server (/api/bootstrap)
interface LiveSqlCache {
  isConnected: boolean;
  products: Product[];
  categories: Category[];
  projects: Project[];
  partners: Partner[];
  reviews: GoogleReview[];
  articles: Article[];
  orders: Order[];
  leads: WhatsAppLead[];
  media: MediaItem[];
  aboutData: AboutData;
  homepagePublished: HomepageConfig;
  homepageDraft: HomepageConfig;
  auditLogs: AuditLogEntry[];
}

const sqlCache: LiveSqlCache = {
  isConnected: false,
  products: INITIAL_PRODUCTS,
  categories: INITIAL_CATEGORIES,
  projects: INITIAL_PROJECTS,
  partners: INITIAL_PARTNERS,
  reviews: INITIAL_REVIEWS,
  articles: INITIAL_ARTICLES,
  orders: INITIAL_ORDERS,
  leads: INITIAL_LEADS,
  media: INITIAL_MEDIA,
  aboutData: INITIAL_ABOUT_DATA,
  homepagePublished: INITIAL_HOMEPAGE_CONFIG,
  homepageDraft: INITIAL_HOMEPAGE_CONFIG,
  auditLogs: INITIAL_AUDIT_LOGS,
};

function getAuthHeaders(): Record<string, string> {
  const token =
    typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem('shantis_sql_session_token') || ''
      : '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function apiFetch(path: string, options: RequestInit = {}) {
  if (typeof fetch === 'undefined') return Promise.resolve(null);
  return fetch(path, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  }).catch(() => null);
}

export class StorageService {
  /**
   * Bootstraps the entire application state from the Node.js + SQLite backend (`GET /api/bootstrap`).
   * The website requires the Node.js Express server to be running.
   */
  static async bootstrapFromSql(): Promise<{
    live: boolean;
    products: Product[];
    categories: Category[];
    projects: Project[];
    partners: Partner[];
    reviews: GoogleReview[];
    articles: Article[];
    orders: Order[];
    leads: WhatsAppLead[];
    media: MediaItem[];
    aboutData: AboutData;
    homepageConfig: HomepageConfig;
  }> {
    try {
      const res = await fetch('/api/bootstrap', {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        sqlCache.isConnected = false;
        throw new Error(`Node.js SQL Server returned HTTP ${res.status}`);
      }
      const data = await res.json();
      if (!data || !data.live) {
        sqlCache.isConnected = false;
        throw new Error('Node.js SQL Server did not return a live state.');
      }

      sqlCache.isConnected = true;
      sqlCache.products = Array.isArray(data.products) ? data.products : [];
      sqlCache.categories = Array.isArray(data.categories) ? data.categories : [];
      sqlCache.projects = Array.isArray(data.projects) ? data.projects : [];
      sqlCache.partners = Array.isArray(data.partners) ? data.partners : [];
      sqlCache.reviews = Array.isArray(data.reviews) ? data.reviews : [];
      sqlCache.articles = Array.isArray(data.articles) ? data.articles : [];
      sqlCache.orders = Array.isArray(data.orders) ? data.orders : [];
      sqlCache.leads = Array.isArray(data.leads) ? data.leads : [];
      sqlCache.media = Array.isArray(data.media) ? data.media : [];
      if (data.aboutData) sqlCache.aboutData = data.aboutData;
      if (data.homepageConfig && data.homepageConfig.hero_headline) {
        sqlCache.homepagePublished = data.homepageConfig;
        sqlCache.homepageDraft = data.homepageConfig;
      }

      return {
        live: true,
        products: sqlCache.products,
        categories: sqlCache.categories,
        projects: sqlCache.projects,
        partners: sqlCache.partners,
        reviews: sqlCache.reviews,
        articles: sqlCache.articles,
        orders: sqlCache.orders,
        leads: sqlCache.leads,
        media: sqlCache.media,
        aboutData: sqlCache.aboutData,
        homepageConfig: sqlCache.homepagePublished,
      };
    } catch {
      sqlCache.isConnected = false;
      throw new Error('Node.js SQLite Backend Server is offline.');
    }
  }

  /**
   * Returns a Node.js SQLite media proxy URL so images are cached as binary BLOBs in SQLite and served by Express.
   */
  static getSqlMediaUrl(originalUrl: string): string {
    if (!originalUrl) return '';
    if (originalUrl.startsWith('/api/media')) return originalUrl;
    return `/api/media-proxy?url=${encodeURIComponent(originalUrl)}`;
  }

  // --- SQL AUTHENTICATION & 2FA ---
  static async loginAdmin(
    email: string,
    password: string
  ): Promise<{ requires2FA?: boolean; tempToken?: string; role?: string; name?: string; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || 'Authentication failed' };
      }
      return data;
    } catch {
      return { error: 'Cannot reach Node.js SQL Authentication Server.' };
    }
  }

  static async verifyAdmin2FA(
    token: string,
    code: string
  ): Promise<{ authenticated?: boolean; token?: string; user?: any; error?: string }> {
    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || '2FA verification failed' };
      }
      if (data.token && typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('shantis_sql_session_token', data.token);
      }
      return data;
    } catch {
      return { error: 'Cannot reach Node.js SQL Authentication Server.' };
    }
  }

  // --- HOMEPAGE CONFIG & TEMPLATES ---
  static getHomepageConfig(): { published: HomepageConfig; draft: HomepageConfig } {
    return {
      published: sqlCache.homepagePublished,
      draft: sqlCache.homepageDraft,
    };
  }

  static saveHomepageDraft(draft: HomepageConfig): void {
    sqlCache.homepageDraft = draft;
  }

  static publishHomepageDraft(): HomepageConfig {
    const published: HomepageConfig = {
      ...sqlCache.homepageDraft,
      updated_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    sqlCache.homepagePublished = published;
    sqlCache.homepageDraft = published;
    apiFetch('/api/settings/homepage_config', {
      method: 'PUT',
      body: JSON.stringify(published),
    });
    this.addAuditLog({
      userId: 'USR-EPRA-01',
      userName: 'Eng. Patrick Mwangi',
      userRole: 'admin',
      action: 'PUBLISHED_HOMEPAGE',
      resourceType: 'homepage',
      details: `Published homepage template "${published.template_id}" to SQL database`,
    });
    return published;
  }

  // --- AUDIT LOGS ---
  static getAuditLogs(): AuditLogEntry[] {
    return sqlCache.auditLogs;
  }

  static addAuditLog(params: {
    userId: string;
    userName: string;
    userRole: AuditLogEntry['user_role'];
    action: string;
    resourceType: AuditLogEntry['resource_type'];
    details: string;
  }): AuditLogEntry {
    const newEntry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      user_id: params.userId,
      user_name: params.userName,
      user_role: params.userRole,
      action: params.action,
      resource_type: params.resourceType,
      details: params.details,
      ip_address: '197.232.61.104',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    sqlCache.auditLogs = [newEntry, ...sqlCache.auditLogs];
    return newEntry;
  }

  // --- PRODUCTS ---
  static getProducts(): Product[] {
    return sqlCache.products;
  }

  static saveProducts(products: Product[]): void {
    sqlCache.products = products;
  }

  static addProduct(product: Omit<Product, 'id'>): Product {
    const products = this.getProducts();
    const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    const newProduct: Product = { ...product, id: newId };
    sqlCache.products = [newProduct, ...products];

    apiFetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(newProduct),
    });

    this.addAuditLog({
      userId: 'USR-EPRA-01',
      userName: 'Eng. Patrick Mwangi',
      userRole: 'admin',
      action: 'ADD_PRODUCT',
      resourceType: 'product',
      details: `Created product "${newProduct.name}" (SKU: ${newProduct.sku}) in SQL`,
    });

    return newProduct;
  }

  static updateProduct(product: Product): void {
    sqlCache.products = sqlCache.products.map((p) => (p.id === product.id ? product : p));
    apiFetch(`/api/products/${product.id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });

    this.addAuditLog({
      userId: 'USR-EPRA-01',
      userName: 'Eng. Patrick Mwangi',
      userRole: 'admin',
      action: 'UPDATE_PRODUCT',
      resourceType: 'product',
      details: `Updated product "${product.name}" (Stock: ${product.stock}, Price: KES ${product.price}) in SQL`,
    });
  }

  static deleteProduct(id: number): void {
    const prod = sqlCache.products.find((p) => p.id === id);
    sqlCache.products = sqlCache.products.filter((p) => p.id !== id);
    apiFetch(`/api/products/${id}`, { method: 'DELETE' });

    if (prod) {
      this.addAuditLog({
        userId: 'USR-EPRA-01',
        userName: 'Eng. Patrick Mwangi',
        userRole: 'admin',
        action: 'DELETE_PRODUCT',
        resourceType: 'product',
        details: `Deleted product "${prod.name}" (SKU: ${prod.sku}) from SQL`,
      });
    }
  }

  // --- MEDIA LIBRARY ---
  static getMedia(): MediaItem[] {
    return sqlCache.media;
  }

  static addMedia(item: Omit<MediaItem, 'id' | 'uploaded_at'>): MediaItem {
    const newId = 'med-' + Date.now();
    const newItem: MediaItem = {
      ...item,
      id: newId,
      uploaded_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    sqlCache.media = [newItem, ...sqlCache.media];
    apiFetch('/api/media', {
      method: 'POST',
      body: JSON.stringify(newItem),
    });
    return newItem;
  }

  static deleteMedia(id: string): void {
    sqlCache.media = sqlCache.media.filter((m) => m.id !== id);
    apiFetch(`/api/media/${id}`, { method: 'DELETE' });
  }

  // --- PROJECTS ---
  static getProjects(): Project[] {
    return sqlCache.projects;
  }

  static saveProjects(projects: Project[]): void {
    sqlCache.projects = projects;
  }

  static addProject(project: Omit<Project, 'id'>): Project {
    const projects = this.getProjects();
    const newId = projects.length > 0 ? Math.max(...projects.map((p) => p.id)) + 1 : 1;
    const newProject: Project = { ...project, id: newId };
    sqlCache.projects = [newProject, ...projects];

    apiFetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify(newProject),
    });

    this.addAuditLog({
      userId: 'USR-EPRA-01',
      userName: 'Eng. Patrick Mwangi',
      userRole: 'admin',
      action: 'ADD_PROJECT',
      resourceType: 'project',
      details: `Created project "${newProject.title}" (${newProject.system_size}) in SQL`,
    });

    return newProject;
  }

  static updateProject(project: Project): void {
    sqlCache.projects = sqlCache.projects.map((p) => (p.id === project.id ? project : p));
    apiFetch(`/api/projects/${project.id}`, {
      method: 'PUT',
      body: JSON.stringify(project),
    });

    this.addAuditLog({
      userId: 'USR-EPRA-01',
      userName: 'Eng. Patrick Mwangi',
      userRole: 'admin',
      action: 'UPDATE_PROJECT',
      resourceType: 'project',
      details: `Updated project "${project.title}" in SQL`,
    });
  }

  static deleteProject(id: number): void {
    const proj = sqlCache.projects.find((p) => p.id === id);
    sqlCache.projects = sqlCache.projects.filter((p) => p.id !== id);
    apiFetch(`/api/projects/${id}`, { method: 'DELETE' });

    if (proj) {
      this.addAuditLog({
        userId: 'USR-EPRA-01',
        userName: 'Eng. Patrick Mwangi',
        userRole: 'admin',
        action: 'DELETE_PROJECT',
        resourceType: 'project',
        details: `Deleted project "${proj.title}" from SQL`,
      });
    }
  }

  // --- ABOUT US DATA ---
  static getAboutData(): AboutData {
    return sqlCache.aboutData;
  }

  static updateAboutData(data: AboutData): void {
    sqlCache.aboutData = data;
    apiFetch('/api/settings/about_data', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- CATEGORIES ---
  static getCategories(): Category[] {
    return sqlCache.categories;
  }

  static addCategory(category: Omit<Category, 'id'>): Category {
    const categories = this.getCategories();
    const newId = categories.length > 0 ? Math.max(...categories.map((c) => c.id)) + 1 : 1;
    const newCat: Category = { ...category, id: newId };
    sqlCache.categories = [...categories, newCat];
    apiFetch('/api/categories', {
      method: 'POST',
      body: JSON.stringify(newCat),
    });
    return newCat;
  }

  static updateCategory(category: Category): void {
    sqlCache.categories = sqlCache.categories.map((c) => (c.id === category.id ? category : c));
    apiFetch(`/api/categories/${category.id}`, {
      method: 'PUT',
      body: JSON.stringify(category),
    });
  }

  static deleteCategory(id: number): void {
    sqlCache.categories = sqlCache.categories.filter((c) => c.id !== id);
    apiFetch(`/api/categories/${id}`, { method: 'DELETE' });
  }

  // --- ORDERS ---
  static getOrders(): Order[] {
    return sqlCache.orders;
  }

  static addOrder(orderData: Omit<Order, 'id' | 'order_number' | 'created_at'>): Order {
    const orders = this.getOrders();
    const newId = orders.length > 0 ? Math.max(...orders.map((o) => o.id)) + 1 : 1043;
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const newOrder: Order = {
      ...orderData,
      id: newId,
      order_number: `SHN-${dateStr}-${randomHex}`,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    sqlCache.orders = [newOrder, ...orders];

    apiFetch('/api/orders', {
      method: 'POST',
      body: JSON.stringify(newOrder),
    });

    return newOrder;
  }

  static updateOrderStatus(
    orderId: number,
    status: Order['status'],
    mpesaReceipt?: string
  ): void {
    const order = sqlCache.orders.find((o) => o.id === orderId);
    if (order) {
      order.status = status;
      if (mpesaReceipt) order.mpesa_receipt = mpesaReceipt;
      sqlCache.orders = [...sqlCache.orders];

      apiFetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, mpesa_receipt: mpesaReceipt }),
      });

      this.addAuditLog({
        userId: 'USR-EPRA-01',
        userName: 'Eng. Patrick Mwangi',
        userRole: 'admin',
        action: 'UPDATE_PAYMENT_STATUS',
        resourceType: 'payment',
        details: `Updated order ${order.order_number} status to "${status}" (M-Pesa: ${
          mpesaReceipt || 'N/A'
        }) in SQL`,
      });
    }
  }

  static async trackOrderSecure(
    orderNumber: string,
    billingContact: string
  ): Promise<{ order?: Order; error?: string }> {
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, billingContact }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || 'Order not found.' };
      }
      return { order: data.order };
    } catch {
      return { error: 'Unable to reach Node.js SQL Order Tracking service.' };
    }
  }

  // --- WHATSAPP LEADS ---
  static getLeads(): WhatsAppLead[] {
    return sqlCache.leads;
  }

  static addLead(lead: Omit<WhatsAppLead, 'id' | 'timestamp'>): WhatsAppLead {
    const leads = this.getLeads();
    const newId = leads.length > 0 ? Math.max(...leads.map((l) => l.id)) + 1 : 1;
    const newLead: WhatsAppLead = {
      ...lead,
      id: newId,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    sqlCache.leads = [newLead, ...leads];

    apiFetch('/api/leads', {
      method: 'POST',
      body: JSON.stringify(newLead),
    });

    return newLead;
  }

  static updateLeadStatus(id: number, status: WhatsAppLead['status']): void {
    sqlCache.leads = sqlCache.leads.map((l) => (l.id === id ? { ...l, status } : l));
    apiFetch(`/api/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // --- REVIEWS (GOOGLE BUSINESS PROFILE) ---
  static getReviews(): GoogleReview[] {
    return sqlCache.reviews;
  }

  static async syncGoogleBusinessReviews(url?: string): Promise<GoogleReview[]> {
    try {
      const res = await apiFetch('/api/reviews/sync-google', {
        method: 'POST',
        body: JSON.stringify({ url }),
      });
      if (res && res.ok) {
        const data = await res.json();
        if (Array.isArray(data.reviews)) {
          sqlCache.reviews = data.reviews;
        }
      }
    } catch {
      // ignore network error
    }
    return sqlCache.reviews;
  }

  static addReview(review: Omit<GoogleReview, 'id'>): GoogleReview {
    const reviews = this.getReviews();
    const newId = reviews.length > 0 ? Math.max(...reviews.map((r) => r.id)) + 1 : 1;
    const newReview: GoogleReview = { ...review, id: newId };
    sqlCache.reviews = [newReview, ...reviews];
    apiFetch('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(newReview),
    });
    return newReview;
  }

  static updateReview(review: GoogleReview): void {
    sqlCache.reviews = sqlCache.reviews.map((r) => (r.id === review.id ? review : r));
    apiFetch(`/api/reviews/${review.id}`, {
      method: 'PUT',
      body: JSON.stringify(review),
    });
  }

  static deleteReview(id: number): void {
    sqlCache.reviews = sqlCache.reviews.filter((r) => r.id !== id);
    apiFetch(`/api/reviews/${id}`, { method: 'DELETE' });
  }

  // --- ARTICLES / INSIGHTS ---
  static getArticles(): Article[] {
    return sqlCache.articles;
  }

  static addArticle(article: Omit<Article, 'id' | 'published_at'>): Article {
    const articles = this.getArticles();
    const newId = articles.length > 0 ? Math.max(...articles.map((a) => a.id)) + 1 : 1;
    const newArticle: Article = {
      ...article,
      id: newId,
      published_at: new Date().toISOString().slice(0, 10),
    };
    sqlCache.articles = [newArticle, ...articles];

    apiFetch('/api/articles', {
      method: 'POST',
      body: JSON.stringify(newArticle),
    });

    this.addAuditLog({
      userId: 'USR-EPRA-01',
      userName: 'Eng. Patrick Mwangi',
      userRole: 'admin',
      action: 'PUBLISH_BLOG',
      resourceType: 'blog',
      details: `Published blog article "${newArticle.title}" in SQL`,
    });

    return newArticle;
  }

  static updateArticle(article: Article): void {
    sqlCache.articles = sqlCache.articles.map((a) => (a.id === article.id ? article : a));
    apiFetch(`/api/articles/${article.id}`, {
      method: 'PUT',
      body: JSON.stringify(article),
    });

    this.addAuditLog({
      userId: 'USR-EPRA-01',
      userName: 'Eng. Patrick Mwangi',
      userRole: 'admin',
      action: 'UPDATE_BLOG',
      resourceType: 'blog',
      details: `Updated blog article "${article.title}" in SQL`,
    });
  }

  static deleteArticle(id: number): void {
    const art = sqlCache.articles.find((a) => a.id === id);
    sqlCache.articles = sqlCache.articles.filter((a) => a.id !== id);
    apiFetch(`/api/articles/${id}`, { method: 'DELETE' });

    if (art) {
      this.addAuditLog({
        userId: 'USR-EPRA-01',
        userName: 'Eng. Patrick Mwangi',
        userRole: 'admin',
        action: 'DELETE_BLOG',
        resourceType: 'blog',
        details: `Deleted blog article "${art.title}" from SQL`,
      });
    }
  }

  // --- PARTNERS ---
  static getPartners(): Partner[] {
    return sqlCache.partners;
  }

  static savePartners(partners: Partner[]): void {
    sqlCache.partners = partners;
    apiFetch('/api/partners/reorder', {
      method: 'PUT',
      body: JSON.stringify({ partners }),
    });
  }

  static addPartner(partner: Omit<Partner, 'id'>): Partner {
    const partners = this.getPartners();
    const newId = partners.length > 0 ? Math.max(...partners.map((p) => p.id)) + 1 : 1;
    const newPartner: Partner = { ...partner, id: newId };
    sqlCache.partners = [...partners, newPartner];

    apiFetch('/api/partners', {
      method: 'POST',
      body: JSON.stringify(newPartner),
    });

    this.addAuditLog({
      userId: 'USR-EPRA-01',
      userName: 'Eng. Patrick Mwangi',
      userRole: 'admin',
      action: 'ADD_PARTNER',
      resourceType: 'partner',
      details: `Added partner logo "${newPartner.name}" in SQL`,
    });

    return newPartner;
  }

  static updatePartner(partner: Partner): void {
    sqlCache.partners = sqlCache.partners.map((p) => (p.id === partner.id ? partner : p));
    apiFetch(`/api/partners/${partner.id}`, {
      method: 'PUT',
      body: JSON.stringify(partner),
    });

    this.addAuditLog({
      userId: 'USR-EPRA-01',
      userName: 'Eng. Patrick Mwangi',
      userRole: 'admin',
      action: 'UPDATE_PARTNER',
      resourceType: 'partner',
      details: `Updated partner logo "${partner.name}" in SQL`,
    });
  }

  static deletePartner(id: number): void {
    const part = sqlCache.partners.find((p) => p.id === id);
    sqlCache.partners = sqlCache.partners.filter((p) => p.id !== id);
    apiFetch(`/api/partners/${id}`, { method: 'DELETE' });

    if (part) {
      this.addAuditLog({
        userId: 'USR-EPRA-01',
        userName: 'Eng. Patrick Mwangi',
        userRole: 'admin',
        action: 'DELETE_PARTNER',
        resourceType: 'partner',
        details: `Deleted partner logo "${part.name}" from SQL`,
      });
    }
  }
}
