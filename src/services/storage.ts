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

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [];

// Live in-memory state hydrated strictly from the Node.js SQL server (/api/bootstrap)
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

let onAuthExpiredCallback: (() => void) | null = null;
let onPersistenceErrorCallback: ((message: string) => void) | null = null;

function getSessionToken(): string {
  try {
    return typeof sessionStorage !== 'undefined'
      ? sessionStorage.getItem('shantis_sql_session_token') || ''
      : '';
  } catch {
    return '';
  }
}

function setSessionToken(token: string | null): void {
  try {
    if (typeof sessionStorage === 'undefined') return;
    if (token) {
      sessionStorage.setItem('shantis_sql_session_token', token);
    } else {
      sessionStorage.removeItem('shantis_sql_session_token');
    }
  } catch {
    // ignore storage errors
  }
}

function getAuthHeaders(): Record<string, string> {
  const token = getSessionToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response | null> {
  if (typeof fetch === 'undefined') return null;
  try {
    const res = await fetch(path, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {}),
      },
    });
    if (res.status === 401) {
      setSessionToken(null);
      if (onAuthExpiredCallback) onAuthExpiredCallback();
    }
    return res;
  } catch {
    return null;
  }
}

async function persistToSql<T = any>(
  path: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: unknown,
  onSuccess?: (data: T) => void
): Promise<{ ok: boolean; data?: T; error?: string }> {
  const res = await apiFetch(path, {
    method,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res) {
    const msg = 'Cannot reach database server. Your change was not saved.';
    if (onPersistenceErrorCallback) onPersistenceErrorCallback(msg);
    return { ok: false, error: msg };
  }

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg =
      data?.error ||
      (res.status === 401
        ? 'Your admin session has expired. Please log in again to save changes.'
        : `Database error (HTTP ${res.status}). Change was not saved.`);
    if (onPersistenceErrorCallback) onPersistenceErrorCallback(msg);
    return { ok: false, error: msg };
  }

  if (onSuccess && data) {
    onSuccess(data as T);
  }
  return { ok: true, data: data as T };
}

export class StorageService {
  static registerAuthExpiredHandler(cb: (() => void) | null): void {
    onAuthExpiredCallback = cb;
  }

  static registerPersistenceErrorHandler(cb: ((msg: string) => void) | null): void {
    onPersistenceErrorCallback = cb;
  }

  /**
   * Bootstraps the entire application state from the Node.js + SQL server (`GET /api/bootstrap`).
   * Passes Bearer token when authenticated so orders/leads hydrate from SQL DB only for verified sessions.
   */
  static async bootstrapFromSql(): Promise<{
    live: boolean;
    authenticated?: boolean;
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
        headers: {
          Accept: 'application/json',
          ...getAuthHeaders(),
        },
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
        authenticated: Boolean(data.authenticated),
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
   * Returns a Node.js SQLite media proxy URL so images are cached as binary BLOBs and served by Express.
   */
  static getSqlMediaUrl(originalUrl: string): string {
    if (!originalUrl) return '';
    if (originalUrl.startsWith('/api/media')) return originalUrl;
    return `/api/media-proxy?url=${encodeURIComponent(originalUrl)}`;
  }

  // --- SQL AUTHENTICATION, USER MANAGEMENT & GOOGLE 2FA ---
  static async checkSession(): Promise<{ authenticated: boolean; user?: any }> {
    const token = getSessionToken();
    if (!token) return { authenticated: false };
    try {
      const res = await fetch('/api/auth/session', {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        setSessionToken(null);
        return { authenticated: false };
      }
      const data = await res.json();
      if (!data?.authenticated) {
        setSessionToken(null);
        return { authenticated: false };
      }
      return { authenticated: true, user: data.user };
    } catch {
      return { authenticated: false };
    }
  }

  static async loginAdmin(
    email: string,
    password: string
  ): Promise<{
    requires2FA?: boolean;
    tempToken?: string;
    role?: string;
    name?: string;
    email?: string;
    google2faEnabled?: boolean;
    error?: string;
  }> {
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
      if (data.token) {
        setSessionToken(data.token);
      }
      return data;
    } catch {
      return { error: 'Cannot reach Node.js SQL Authentication Server.' };
    }
  }

  static async logoutAdmin(): Promise<void> {
    const token = getSessionToken();
    try {
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch {
      // always clear local session even if offline
    } finally {
      setSessionToken(null);
      sqlCache.orders = [];
      sqlCache.leads = [];
      sqlCache.auditLogs = [];
    }
  }

  static async getUsers(): Promise<any[]> {
    try {
      const res = await apiFetch('/api/auth/users');
      if (res && res.ok) {
        const data = await res.json();
        return Array.isArray(data.users) ? data.users : [];
      }
    } catch {
      // ignore
    }
    return [];
  }

  static async createUser(params: {
    name: string;
    email: string;
    role: string;
    password: string;
    totpCode?: string;
  }): Promise<{ success?: boolean; users?: any[]; error?: string }> {
    const res = await persistToSql<{ success?: boolean; users?: any[] }>(
      '/api/auth/users',
      'POST',
      params
    );
    if (!res.ok) return { error: res.error };
    return { success: true, users: res.data?.users || [] };
  }

  static async updateUser(
    id: string,
    params: {
      email?: string;
      name?: string;
      role?: string;
      password?: string;
      totpCode?: string;
    }
  ): Promise<{ success?: boolean; email?: string; users?: any[]; error?: string }> {
    const res = await persistToSql<{ success?: boolean; email?: string; users?: any[] }>(
      `/api/auth/users/${encodeURIComponent(id)}`,
      'PUT',
      params
    );
    if (!res.ok) return { error: res.error };
    return { success: true, email: res.data?.email, users: res.data?.users || [] };
  }

  static async deleteUser(id: string): Promise<{ success?: boolean; users?: any[]; error?: string }> {
    const res = await persistToSql<{ success?: boolean; users?: any[] }>(
      `/api/auth/users/${encodeURIComponent(id)}`,
      'DELETE'
    );
    if (!res.ok) return { error: res.error };
    return { success: true, users: res.data?.users || [] };
  }

  static async changeAdminPassword(params: {
    email: string;
    newPassword: string;
    newTotpCode?: string;
  }): Promise<{ success?: boolean; updated?: any; users?: any[]; error?: string }> {
    const res = await persistToSql<{ success?: boolean; updated?: any; users?: any[] }>(
      '/api/auth/change-password',
      'POST',
      params
    );
    if (!res.ok) return { error: res.error || 'Failed to update password hash' };
    return { success: true, ...res.data };
  }

  static async setupGoogle2FA(userId?: string): Promise<{
    userId?: string;
    email?: string;
    secret?: string;
    otpauthUrl?: string;
    error?: string;
  }> {
    const res = await persistToSql<{
      userId: string;
      email: string;
      secret: string;
      otpauthUrl: string;
    }>('/api/auth/2fa/setup', 'POST', userId ? { userId } : {});
    if (!res.ok) return { error: res.error };
    return res.data || {};
  }

  static async enableGoogle2FA(params: {
    userId?: string;
    code: string;
    secret?: string;
  }): Promise<{ enabled?: boolean; users?: any[]; error?: string }> {
    const res = await persistToSql<{ enabled?: boolean; users?: any[] }>(
      '/api/auth/2fa/enable',
      'POST',
      params
    );
    if (!res.ok) return { error: res.error };
    return { enabled: Boolean(res.data?.enabled), users: res.data?.users || [] };
  }

  static async disableGoogle2FA(userId?: string): Promise<{
    enabled?: boolean;
    users?: any[];
    error?: string;
  }> {
    const res = await persistToSql<{ enabled?: boolean; users?: any[] }>(
      '/api/auth/2fa/disable',
      'POST',
      userId ? { userId } : {}
    );
    if (!res.ok) return { error: res.error };
    return { enabled: Boolean(res.data?.enabled), users: res.data?.users || [] };
  }

  // --- M-PESA DARAJA API CREDENTIALS & LIVE VERIFICATION ---
  static async getMpesaPublicStatus(): Promise<{
    configured: boolean;
    shortcode?: string;
    environment?: string;
  }> {
    try {
      const res = await fetch('/api/payments/mpesa/config', {
        headers: { Accept: 'application/json', ...getAuthHeaders() },
      });
      if (!res.ok) return { configured: false };
      const data = await res.json();
      if (data?.config) {
        return {
          configured: Boolean(data.config.has_keys),
          shortcode: data.config.shortcode,
          environment: data.config.environment,
        };
      }
      return {
        configured: Boolean(data?.configured),
        shortcode: data?.shortcode,
        environment: data?.environment,
      };
    } catch {
      return { configured: false };
    }
  }

  static async getMpesaConfig(): Promise<any> {
    try {
      const res = await apiFetch('/api/payments/mpesa/config');
      if (res && res.ok) {
        const data = await res.json();
        return data.config || null;
      }
    } catch {
      // ignore
    }
    return null;
  }

  static async saveMpesaConfig(params: {
    shortcode?: string;
    environment?: string;
    callbackUrl?: string;
    consumerKey?: string;
    consumerSecret?: string;
    passkey?: string;
    initiatorPassword?: string;
  }): Promise<{ success?: boolean; config?: any; error?: string }> {
    const res = await persistToSql<{ success?: boolean; config?: any }>(
      '/api/payments/mpesa/config',
      'POST',
      params
    );
    if (!res.ok) return { error: res.error || 'Failed to save M-Pesa config' };
    return { success: true, config: res.data?.config };
  }

  static async initiateMpesaStkPush(params: {
    phone: string;
    amount: number;
    customerName: string;
    customerEmail?: string;
    customerLocation: string;
    items: any[];
  }): Promise<{
    success: boolean;
    configured?: boolean;
    status: 'pending_verification' | 'unconfigured' | 'declined';
    checkoutRequestId?: string;
    merchantRequestId?: string;
    orderNumber?: string;
    message?: string;
    error?: string;
  }> {
    try {
      const res = await fetch('/api/payments/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        return {
          success: false,
          configured: data?.configured ?? false,
          status: data?.status === 'unconfigured' ? 'unconfigured' : 'declined',
          error:
            data?.error ||
            'M-Pesa payment configuration is unavailable. Please complete your order via WhatsApp.',
        };
      }
      return data;
    } catch {
      return {
        success: false,
        configured: true,
        status: 'declined',
        error: 'Unable to reach payment verification server. Please retry or checkout via WhatsApp.',
      };
    }
  }

  static async checkMpesaStatus(checkoutRequestId: string): Promise<{
    status: 'pending' | 'paid' | 'declined';
    receipt?: string;
    resultCode?: string;
    resultDesc?: string;
    orderNumber?: string;
    order?: Order | null;
    error?: string;
  }> {
    try {
      const res = await fetch(
        `/api/payments/mpesa/status/${encodeURIComponent(checkoutRequestId)}`,
        { headers: { Accept: 'application/json' } }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok && res.status !== 200) {
        return {
          status: 'declined',
          error: data?.error || data?.resultDesc || 'Payment verification failed.',
          resultDesc: data?.resultDesc,
        };
      }
      return {
        status: data.status === 'paid' ? 'paid' : data.status === 'declined' ? 'declined' : 'pending',
        receipt: data.receipt,
        resultCode: data.resultCode,
        resultDesc: data.resultDesc,
        orderNumber: data.orderNumber,
        order: data.order || null,
      };
    } catch {
      return {
        status: 'pending',
        resultDesc: 'Checking M-Pesa confirmation status...',
      };
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

  static async publishHomepageDraft(): Promise<HomepageConfig | null> {
    const published: HomepageConfig = {
      ...sqlCache.homepageDraft,
      updated_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    const res = await persistToSql<{ homepageConfig?: HomepageConfig }>(
      '/api/settings/homepage_config',
      'PUT',
      published,
      (data) => {
        const saved = data.homepageConfig || published;
        sqlCache.homepagePublished = saved;
        sqlCache.homepageDraft = saved;
      }
    );
    if (!res.ok) return null;
    return sqlCache.homepagePublished;
  }

  // --- AUDIT LOGS ---
  static getAuditLogs(): AuditLogEntry[] {
    return sqlCache.auditLogs;
  }

  static async fetchAuditLogs(): Promise<AuditLogEntry[]> {
    try {
      const res = await apiFetch('/api/audit-logs');
      if (res && res.ok) {
        const data = await res.json();
        const logs = Array.isArray(data.logs) ? data.logs : [];
        sqlCache.auditLogs = logs;
        return logs;
      }
    } catch {
      // ignore
    }
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
      ip_address: 'server-verified',
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

  static async addProduct(product: Omit<Product, 'id'>): Promise<{ ok: boolean; product?: Product; error?: string }> {
    const products = this.getProducts();
    const newId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    const newProduct: Product = { ...product, id: newId };

    const res = await persistToSql<{ products?: Product[] }>(
      '/api/products',
      'POST',
      newProduct,
      (data) => {
        if (Array.isArray(data.products)) sqlCache.products = data.products;
      }
    );
    if (!res.ok) return { ok: false, error: res.error };
    return { ok: true, product: newProduct };
  }

  static async updateProduct(product: Product): Promise<{ ok: boolean; error?: string }> {
    const res = await persistToSql<{ products?: Product[] }>(
      `/api/products/${product.id}`,
      'PUT',
      product,
      (data) => {
        if (Array.isArray(data.products)) sqlCache.products = data.products;
      }
    );
    return { ok: res.ok, error: res.error };
  }

  static async deleteProduct(id: number): Promise<{ ok: boolean; error?: string }> {
    const res = await persistToSql<{ products?: Product[] }>(
      `/api/products/${id}`,
      'DELETE',
      undefined,
      (data) => {
        if (Array.isArray(data.products)) sqlCache.products = data.products;
      }
    );
    return { ok: res.ok, error: res.error };
  }

  // --- MEDIA LIBRARY ---
  static getMedia(): MediaItem[] {
    return sqlCache.media;
  }

  static async addMedia(
    item: Omit<MediaItem, 'id' | 'uploaded_at'>
  ): Promise<MediaItem | null> {
    const newId = 'med-' + Date.now();
    const newItem: MediaItem = {
      ...item,
      id: newId,
      uploaded_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    const res = await persistToSql<{ media?: MediaItem[] }>(
      '/api/media',
      'POST',
      newItem,
      (data) => {
        if (Array.isArray(data.media)) sqlCache.media = data.media;
      }
    );
    if (!res.ok) return null;
    return sqlCache.media.find((m) => m.id === newId) || newItem;
  }

  static async deleteMedia(id: string): Promise<boolean> {
    const res = await persistToSql<{ media?: MediaItem[] }>(
      `/api/media/${encodeURIComponent(id)}`,
      'DELETE',
      undefined,
      (data) => {
        if (Array.isArray(data.media)) sqlCache.media = data.media;
      }
    );
    return res.ok;
  }

  // --- PROJECTS ---
  static getProjects(): Project[] {
    return sqlCache.projects;
  }

  static saveProjects(projects: Project[]): void {
    sqlCache.projects = projects;
  }

  static async addProject(project: Omit<Project, 'id'>): Promise<{ ok: boolean; project?: Project; error?: string }> {
    const projects = this.getProjects();
    const newId = projects.length > 0 ? Math.max(...projects.map((p) => p.id)) + 1 : 1;
    const newProject: Project = { ...project, id: newId };
    const res = await persistToSql<{ projects?: Project[] }>(
      '/api/projects',
      'POST',
      newProject,
      (data) => {
        if (Array.isArray(data.projects)) sqlCache.projects = data.projects;
      }
    );
    if (!res.ok) return { ok: false, error: res.error };
    return { ok: true, project: newProject };
  }

  static async updateProject(project: Project): Promise<{ ok: boolean; error?: string }> {
    const res = await persistToSql<{ projects?: Project[] }>(
      `/api/projects/${project.id}`,
      'PUT',
      project,
      (data) => {
        if (Array.isArray(data.projects)) sqlCache.projects = data.projects;
      }
    );
    return { ok: res.ok, error: res.error };
  }

  static async deleteProject(id: number): Promise<{ ok: boolean; error?: string }> {
    const res = await persistToSql<{ projects?: Project[] }>(
      `/api/projects/${id}`,
      'DELETE',
      undefined,
      (data) => {
        if (Array.isArray(data.projects)) sqlCache.projects = data.projects;
      }
    );
    return { ok: res.ok, error: res.error };
  }

  // --- ABOUT US DATA ---
  static getAboutData(): AboutData {
    return sqlCache.aboutData;
  }

  static async updateAboutData(data: AboutData): Promise<{ ok: boolean; error?: string }> {
    const res = await persistToSql<{ aboutData?: AboutData }>(
      '/api/settings/about_data',
      'PUT',
      data,
      (payload) => {
        sqlCache.aboutData = payload.aboutData || data;
      }
    );
    return { ok: res.ok, error: res.error };
  }

  // --- CATEGORIES ---
  static getCategories(): Category[] {
    return sqlCache.categories;
  }

  static async addCategory(category: Omit<Category, 'id'>): Promise<{ ok: boolean; category?: Category; error?: string }> {
    const categories = this.getCategories();
    const newId = categories.length > 0 ? Math.max(...categories.map((c) => c.id)) + 1 : 1;
    const newCat: Category = { ...category, id: newId };
    const res = await persistToSql<{ categories?: Category[] }>(
      '/api/categories',
      'POST',
      newCat,
      (data) => {
        if (Array.isArray(data.categories)) sqlCache.categories = data.categories;
      }
    );
    if (!res.ok) return { ok: false, error: res.error };
    return { ok: true, category: newCat };
  }

  static async updateCategory(category: Category): Promise<{ ok: boolean; error?: string }> {
    const res = await persistToSql<{ categories?: Category[] }>(
      `/api/categories/${category.id}`,
      'PUT',
      category,
      (data) => {
        if (Array.isArray(data.categories)) sqlCache.categories = data.categories;
      }
    );
    return { ok: res.ok, error: res.error };
  }

  static async deleteCategory(id: number): Promise<{ ok: boolean; error?: string }> {
    const res = await persistToSql<{ categories?: Category[] }>(
      `/api/categories/${id}`,
      'DELETE',
      undefined,
      (data) => {
        if (Array.isArray(data.categories)) sqlCache.categories = data.categories;
      }
    );
    return { ok: res.ok, error: res.error };
  }

  // --- ORDERS ---
  static getOrders(): Order[] {
    return sqlCache.orders;
  }

  static async addOrder(
    orderData: Omit<Order, 'id' | 'order_number' | 'created_at'>
  ): Promise<Order> {
    if (orderData.payment_method === 'mpesa_daraja') {
      throw new Error(
        'M-Pesa Daraja orders must be initiated and verified via /api/payments/mpesa/stkpush.'
      );
    }

    const orders = this.getOrders();
    const newId = orders.length > 0 ? Math.max(...orders.map((o) => o.id)) + 1 : Date.now();
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const newOrder: Order = {
      ...orderData,
      id: newId,
      order_number: `SHN-${dateStr}-${randomHex}`,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    const res = await persistToSql<{
      id?: number;
      order_number?: string;
      created_at?: string;
      orders?: Order[];
      products?: Product[];
    }>('/api/orders', 'POST', newOrder, (data) => {
      if (Array.isArray(data.orders)) sqlCache.orders = data.orders;
      if (Array.isArray(data.products)) sqlCache.products = data.products;
    });

    if (!res.ok) {
      throw new Error(res.error || 'Failed to save order to database.');
    }

    return {
      ...newOrder,
      id: res.data?.id ?? newOrder.id,
      order_number: res.data?.order_number || newOrder.order_number,
      created_at: res.data?.created_at || newOrder.created_at,
    };
  }

  static async updateOrderStatus(
    orderId: number,
    status: Order['status'],
    mpesaReceipt?: string
  ): Promise<{ ok: boolean; error?: string }> {
    const res = await persistToSql<{ orders?: Order[] }>(
      `/api/orders/${orderId}`,
      'PATCH',
      { status, mpesa_receipt: mpesaReceipt },
      (data) => {
        if (Array.isArray(data.orders)) sqlCache.orders = data.orders;
      }
    );
    return { ok: res.ok, error: res.error };
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

    // Persist lead strictly to SQL database (public customer/visitor capture endpoint)
    void persistToSql<{ leads?: WhatsAppLead[] }>(
      '/api/leads',
      'POST',
      newLead,
      (data) => {
        if (Array.isArray(data.leads)) sqlCache.leads = data.leads;
      }
    );

    return newLead;
  }

  static async updateLeadStatus(
    id: number,
    status: WhatsAppLead['status']
  ): Promise<{ ok: boolean; error?: string }> {
    const res = await persistToSql<{ leads?: WhatsAppLead[] }>(
      `/api/leads/${id}`,
      'PATCH',
      { status },
      (data) => {
        if (Array.isArray(data.leads)) sqlCache.leads = data.leads;
      }
    );
    return { ok: res.ok, error: res.error };
  }

  // --- REVIEWS (GOOGLE BUSINESS PROFILE) ---
  static getReviews(): GoogleReview[] {
    return sqlCache.reviews;
  }

  static async syncGoogleBusinessReviews(url?: string): Promise<GoogleReview[]> {
    const res = await persistToSql<{ reviews?: GoogleReview[] }>(
      '/api/reviews/sync-google',
      'POST',
      { url },
      (data) => {
        if (Array.isArray(data.reviews)) sqlCache.reviews = data.reviews;
      }
    );
    if (!res.ok) throw new Error(res.error || 'Failed to sync reviews.');
    return sqlCache.reviews;
  }

  static async addReview(review: Omit<GoogleReview, 'id'>): Promise<{ ok: boolean; error?: string }> {
    const reviews = this.getReviews();
    const newId = reviews.length > 0 ? Math.max(...reviews.map((r) => r.id)) + 1 : 1;
    const newReview: GoogleReview = { ...review, id: newId };
    const res = await persistToSql<{ reviews?: GoogleReview[] }>(
      '/api/reviews',
      'POST',
      newReview,
      (data) => {
        if (Array.isArray(data.reviews)) sqlCache.reviews = data.reviews;
      }
    );
    return { ok: res.ok, error: res.error };
  }

  static async updateReview(review: GoogleReview): Promise<{ ok: boolean; error?: string }> {
    const res = await persistToSql<{ reviews?: GoogleReview[] }>(
      `/api/reviews/${review.id}`,
      'PUT',
      review,
      (data) => {
        if (Array.isArray(data.reviews)) sqlCache.reviews = data.reviews;
      }
    );
    return { ok: res.ok, error: res.error };
  }

  static async deleteReview(id: number): Promise<{ ok: boolean; error?: string }> {
    const res = await persistToSql<{ reviews?: GoogleReview[] }>(
      `/api/reviews/${id}`,
      'DELETE',
      undefined,
      (data) => {
        if (Array.isArray(data.reviews)) sqlCache.reviews = data.reviews;
      }
    );
    return { ok: res.ok, error: res.error };
  }

  // --- ARTICLES / INSIGHTS ---
  static getArticles(): Article[] {
    return sqlCache.articles;
  }

  static async addArticle(
    article: Omit<Article, 'id' | 'published_at'>
  ): Promise<{ ok: boolean; article?: Article; error?: string }> {
    const articles = this.getArticles();
    const newId = articles.length > 0 ? Math.max(...articles.map((a) => a.id)) + 1 : 1;
    const newArticle: Article = {
      ...article,
      id: newId,
      published_at: new Date().toISOString().slice(0, 10),
    };
    const res = await persistToSql<{ articles?: Article[] }>(
      '/api/articles',
      'POST',
      newArticle,
      (data) => {
        if (Array.isArray(data.articles)) sqlCache.articles = data.articles;
      }
    );
    if (!res.ok) return { ok: false, error: res.error };
    return { ok: true, article: newArticle };
  }

  static async updateArticle(article: Article): Promise<{ ok: boolean; error?: string }> {
    const res = await persistToSql<{ articles?: Article[] }>(
      `/api/articles/${article.id}`,
      'PUT',
      article,
      (data) => {
        if (Array.isArray(data.articles)) sqlCache.articles = data.articles;
      }
    );
    return { ok: res.ok, error: res.error };
  }

  static async deleteArticle(id: number): Promise<{ ok: boolean; error?: string }> {
    const res = await persistToSql<{ articles?: Article[] }>(
      `/api/articles/${id}`,
      'DELETE',
      undefined,
      (data) => {
        if (Array.isArray(data.articles)) sqlCache.articles = data.articles;
      }
    );
    return { ok: res.ok, error: res.error };
  }

  // --- PARTNERS ---
  static getPartners(): Partner[] {
    return sqlCache.partners;
  }

  static async savePartners(partners: Partner[]): Promise<{ ok: boolean; error?: string }> {
    const res = await persistToSql<{ partners?: Partner[] }>(
      '/api/partners/reorder',
      'PUT',
      { partners },
      (data) => {
        if (Array.isArray(data.partners)) sqlCache.partners = data.partners;
      }
    );
    return { ok: res.ok, error: res.error };
  }

  static async addPartner(
    partner: Omit<Partner, 'id'>
  ): Promise<{ ok: boolean; partner?: Partner; error?: string }> {
    const partners = this.getPartners();
    const newId = partners.length > 0 ? Math.max(...partners.map((p) => p.id)) + 1 : 1;
    const newPartner: Partner = { ...partner, id: newId };
    const res = await persistToSql<{ partners?: Partner[] }>(
      '/api/partners',
      'POST',
      newPartner,
      (data) => {
        if (Array.isArray(data.partners)) sqlCache.partners = data.partners;
      }
    );
    if (!res.ok) return { ok: false, error: res.error };
    return { ok: true, partner: newPartner };
  }

  static async updatePartner(partner: Partner): Promise<{ ok: boolean; error?: string }> {
    const res = await persistToSql<{ partners?: Partner[] }>(
      `/api/partners/${partner.id}`,
      'PUT',
      partner,
      (data) => {
        if (Array.isArray(data.partners)) sqlCache.partners = data.partners;
      }
    );
    return { ok: res.ok, error: res.error };
  }

  static async deletePartner(id: number): Promise<{ ok: boolean; error?: string }> {
    const res = await persistToSql<{ partners?: Partner[] }>(
      `/api/partners/${id}`,
      'DELETE',
      undefined,
      (data) => {
        if (Array.isArray(data.partners)) sqlCache.partners = data.partners;
      }
    );
    return { ok: res.ok, error: res.error };
  }
}
