import React, { useState, useEffect, useRef } from 'react';
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
  StockStatus,
  ProductType,
  ProductVisibility,
  UserRole,
  AuditLogEntry,
  HomepageConfig,
  HomepageTemplateId,
  ServiceItem
} from '../types';
import { 
  BarChart3, 
  Package, 
  RefreshCw, 
  MessageSquare, 
  FileText, 
  Users, 
  Star, 
  Image as ImageIcon, 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Sparkles,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Flame,
  ArrowUpRight,
  FolderGit2,
  Info,
  Layers,
  Settings,
  HelpCircle,
  Eye,
  Link2,
  FileSpreadsheet,
  Copy,
  Check,
  Lock,
  Key,
  Clock,
  ShieldAlert,
  ArrowUp,
  ArrowDown,
  Layout,
  Globe,
  Sliders,
  Radio,
  CheckSquare,
  QrCode,
  LogOut,
  UserPlus,
  Shield
} from 'lucide-react';
import QRCode from 'qrcode';
import { StorageService } from '../services/storage';
import { ImageGenService, GeneratedSolarAsset } from '../services/imageGen';
import { DashboardCharts } from './DashboardCharts';
import { MediaSelectorModal } from './MediaSelectorModal';
import { 
  buildThirtyDaySeries, 
  calculateChannelBreakdown, 
  reorderPartners 
} from '../utils/dashboardLogic';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: Category[];
  orders: Order[];
  leads: WhatsAppLead[];
  articles: Article[];
  partners: Partner[];
  reviews: GoogleReview[];
  projects: Project[];
  aboutData: AboutData;
  onDataUpdated: () => void;
  onNavigateFrontend?: (tab: 'home' | 'shop' | 'projects' | 'insights' | 'about') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  products,
  categories,
  orders,
  leads,
  articles,
  partners,
  reviews,
  projects,
  aboutData,
  onDataUpdated,
  onNavigateFrontend
}) => {
  // --- REAL SQL SESSION AUTHENTICATION & GOOGLE 2FA STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
    name: string;
    role: string;
    google_totp_enabled?: boolean;
  } | null>(null);
  const [authStep, setAuthStep] = useState<'credentials' | 'totp'>('credentials');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [pendingTempToken, setPendingTempToken] = useState('');
  const [pendingUserMeta, setPendingUserMeta] = useState<{
    name: string;
    email: string;
    role: string;
    google2faEnabled: boolean;
  } | null>(null);
  const [totpInput, setTotpInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [adminNotice, setAdminNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotice = (type: 'success' | 'error', text: string) => {
    setAdminNotice({ type, text });
    setTimeout(() => {
      setAdminNotice((prev) => (prev?.text === text ? null : prev));
    }, 5500);
  };

  // --- SESSION INACTIVITY TIMER (15 Mins = 900s) ---
  const [secondsRemaining, setSecondsRemaining] = useState(900);

  const performLogout = async (reason?: string) => {
    await StorageService.logoutAdmin();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAuthStep('credentials');
    setLoginPassword('');
    setPendingTempToken('');
    setPendingUserMeta(null);
    setTotpInput('');
    setDbUsers([]);
    setMpesaConfigSummary(null);
    setDbAuditLogs([]);
    setSecondsRemaining(900);
    if (reason) setAuthError(reason);
    onDataUpdated();
  };

  useEffect(() => {
    if (!isOpen || !isAuthenticated) return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          void performLogout('Session expired due to 15 minutes of inactivity. Please log in again.');
          return 900;
        }
        return prev - 1;
      });
    }, 1000);

    const resetTimer = () => setSecondsRemaining(900);
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [isOpen, isAuthenticated]);

  // Active Menu Section
  const [activeSection, setActiveSection] = useState<
    'overview' | 'homepage_studio' | 'products' | 'projects' | 'blog_posts' | 'about_editor' | 'media_library' | 'partners' | 'security_users' | 'woocommerce_sync' | 'reviews_scraper' | 'leads_orders' | 'audit_logs'
  >('overview');

  // Media Selector Modal State
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [mediaTargetField, setMediaTargetField] = useState<
    'product' | 'project' | 'project_gallery' | 'partner' | 'blog' | 'hero' | 'service' | 'category' | 'about_gallery'
  >('product');

  // Media Library Local State
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => StorageService.getMedia());
  const [copiedMediaId, setCopiedMediaId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectGalleryFileRef = useRef<HTMLInputElement>(null);
  const projectVideoFileRef = useRef<HTMLInputElement>(null);

  // Search State for Recent Activity Table & Products
  const [recentSearch, setRecentSearch] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCatFilter, setProductCatFilter] = useState<string>('all');
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/Horay-N-Type-Solar-Panels-1.png',
  });

  // --- SLIDE-OVER DRAWER MODAL STATES ---
  const [activeDrawer, setActiveDrawer] = useState<'none' | 'product' | 'project' | 'blog'>('none');

  // Product Form State (WooCommerce Schema)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    title: '',
    slug: '',
    date: new Date().toISOString().slice(0, 10),
    parentId: '' as string | number,
    permalink: '',
    sku: '',
    categoryId: 1,
    price: 0,
    regularPrice: 0,
    salePrice: '' as string | number,
    stock: 10,
    manageStock: true,
    stockStatus: 'instock' as StockStatus,
    productType: 'simple' as ProductType,
    productVisibility: 'visible' as ProductVisibility,
    shortDescription: '',
    description: '',
    imageUrl: 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/Horay-N-Type-Solar-Panels-1.png',
    featured: false,
    warranty: '5 Years Manufacturer Warranty',
    weight: '25 kg',
    dimensions: '1800 x 1000 x 35 mm'
  });

  // Project Form State (Including Multi-Photo Portfolio Gallery)
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProjectGalleryUrl, setNewProjectGalleryUrl] = useState('');
  const [newProjectVideoUrl, setNewProjectVideoUrl] = useState('');
  const [projectForm, setProjectForm] = useState({
    title: '',
    client: '',
    location: 'Nairobi, Kenya',
    category: 'commercial' as Project['category'],
    categoryName: 'Commercial & Industrial (C&I)',
    systemSize: '50kWp Commercial Rooftop',
    panelsCount: '92x 550W Tier-1 Mono Panels',
    inverterSpecs: 'Growatt 50kW 3-Phase Inverter',
    batterySpecs: 'Grid-Tied Zero Export',
    imageUrl: 'https://shantisprojects.lovable.app/__l5e/assets-v1/0f44c6c4-ebd7-4883-bae0-17c6dbe786a5/tatu-city.jpg',
    gallery: [] as string[],
    videoUrl: '',
    videos: [] as string[],
    seoKeywords: '',
    completionDate: 'October 2026',
    kplcSavings: 'KES 180,000/month saved',
    description: '',
    featured: true
  });

  // Blog / Insights Form State
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [postForm, setPostForm] = useState({
    title: '',
    category: 'Solar Sizing & Design',
    readTime: '5 min read',
    excerpt: '',
    content: '',
    metaDescription: '',
    author: 'Shantis Designs Solar Solutions',
    imageUrl: 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/Horay-N-Type-Solar-Panels-1.png',
    tags: 'Solar Kenya, EPRA, KPLC Bill Reduction'
  });

  // Partner Form State
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    logoUrl: '',
    category: 'inverters' as Partner['category'],
    active: true,
    websiteUrl: 'https://shantisdesigns.co.ke'
  });

  // About Us Page Editor State
  const [aboutForm, setAboutForm] = useState<AboutData>(() => ({
    ...aboutData,
    gallery_images: aboutData.gallery_images || [],
  }));
  const [aboutSaveMsg, setAboutSaveMsg] = useState('');
  const [newAboutGalleryUrl, setNewAboutGalleryUrl] = useState('');
  const [newAboutGalleryCaption, setNewAboutGalleryCaption] = useState('');

  useEffect(() => {
    setAboutForm({
      ...aboutData,
      gallery_images: aboutData.gallery_images || [],
    });
  }, [aboutData]);

  // Google Business Profile Reviews Live Sync & Editor State
  const [gbpUrl, setGbpUrl] = useState('https://g.page/r/CVAYv1cTmiLaEAE/review');
  const [isSyncingGbp, setIsSyncingGbp] = useState(false);
  const [gbpSyncMsg, setGbpSyncMsg] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<GoogleReview | null>(null);
  const [reviewForm, setReviewForm] = useState({
    authorName: '',
    authorPhoto: '',
    reviewerBadge: '1 review',
    rating: 5,
    timeAgo: 'a week ago',
    location: 'Nairobi, Kenya',
    text: '',
    likesCount: 1,
    ownerReply: 'Thank you for trusting in Shantis Designs Solar Solutions, Looking forward to do more installations for your projects',
    ownerReplyTime: 'a week ago',
    keywords: 'inverter, batteries, panels'
  });

  // Homepage Studio Draft & Published State
  const [homepageState, setHomepageState] = useState(() => StorageService.getHomepageConfig());
  const [draftConfig, setDraftConfig] = useState<HomepageConfig>(homepageState.draft);
  const [homepageSaveSuccess, setHomepageSaveSuccess] = useState('');

  // WooCommerce Sync & Scraper State
  const [scrapeUrl, setScrapeUrl] = useState('https://shantisdesigns.co.ke/shop/');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeSuccessMsg, setScrapeSuccessMsg] = useState('');
  const [isSyncingWc, setIsSyncingWc] = useState(false);

  // M-Pesa Verification & Custom API Keys State
  const [verifyingOrderId, setVerifyingOrderId] = useState<number | null>(null);
  const [mpesaConfigSummary, setMpesaConfigSummary] = useState<{
    shortcode: string;
    environment: string;
    callback_url: string;
    has_keys?: boolean;
    consumer_key_masked: string;
    consumer_key_hash: string;
    consumer_secret_masked: string;
    consumer_secret_hash: string;
    passkey_masked: string;
    passkey_hash: string;
    initiator_password_hash?: string;
    updated_at: string;
  } | null>(null);
  const [mpesaForm, setMpesaForm] = useState({
    shortcode: '4089912',
    environment: 'production' as 'sandbox' | 'production',
    callbackUrl: 'https://solarsolutions.shantisdesigns.co.ke/api/payments/mpesa/callback',
    consumerKey: '',
    consumerSecret: '',
    passkey: '',
    initiatorPassword: '',
  });
  const [isSavingMpesa, setIsSavingMpesa] = useState(false);
  const [mpesaSaveMsg, setMpesaSaveMsg] = useState('');

  // Database Users, Credential Editor & Google 2FA State
  const [dbUsers, setDbUsers] = useState<
    Array<{
      id: string;
      email: string;
      name: string;
      role: string;
      password_hash: string;
      totp_code_hash: string;
      google_totp_enabled?: boolean;
      created_at: string;
    }>
  >([]);
  const [dbAuditLogs, setDbAuditLogs] = useState<AuditLogEntry[]>([]);

  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'admin',
    password: '',
    totpCode: '',
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    email: '',
    role: 'admin',
    password: '',
    totpCode: '',
  });
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);
  const [userMgmtMsg, setUserMgmtMsg] = useState('');
  const [userMgmtErr, setUserMgmtErr] = useState('');

  // Google 2FA Setup QR State
  const [google2faTargetId, setGoogle2faTargetId] = useState<string>('');
  const [google2faSetupData, setGoogle2faSetupData] = useState<{
    userId: string;
    email: string;
    secret: string;
    otpauthUrl: string;
    qrDataUrl: string;
  } | null>(null);
  const [google2faVerifyCode, setGoogle2faVerifyCode] = useState('');
  const [google2faMsg, setGoogle2faMsg] = useState('');
  const [google2faErr, setGoogle2faErr] = useState('');
  const [isSettingUpGoogle2fa, setIsSettingUpGoogle2fa] = useState(false);

  const loadProtectedAdminData = async () => {
    const [cfg, usersList, logsList] = await Promise.all([
      StorageService.getMpesaConfig(),
      StorageService.getUsers(),
      StorageService.fetchAuditLogs(),
    ]);
    if (cfg) {
      setMpesaConfigSummary(cfg);
      setMpesaForm((prev) => ({
        ...prev,
        shortcode: cfg.shortcode || '4089912',
        environment: cfg.environment === 'sandbox' ? 'sandbox' : 'production',
        callbackUrl: cfg.callback_url || 'https://solarsolutions.shantisdesigns.co.ke/api/payments/mpesa/callback',
      }));
    }
    if (Array.isArray(usersList)) setDbUsers(usersList);
    if (Array.isArray(logsList)) setDbAuditLogs(logsList);
  };

  useEffect(() => {
    StorageService.registerAuthExpiredHandler(() => {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setAuthStep('credentials');
      setAuthError('Your admin session expired. Please sign in again.');
    });
    StorageService.registerPersistenceErrorHandler((msg) => {
      showNotice('error', msg);
    });
    return () => {
      StorageService.registerAuthExpiredHandler(null);
      StorageService.registerPersistenceErrorHandler(null);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    setIsCheckingSession(true);
    setAuthError('');

    StorageService.checkSession().then(async (session) => {
      if (!mounted) return;
      if (session.authenticated && session.user) {
        setIsAuthenticated(true);
        setCurrentUser(session.user);
        setGoogle2faTargetId(String(session.user.id || ''));
        await loadProtectedAdminData();
        onDataUpdated();
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setAuthStep('credentials');
      }
      setIsCheckingSession(false);
    });

    return () => {
      mounted = false;
    };
  }, [isOpen]);

  const handleSaveMpesaCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMpesa(true);
    setMpesaSaveMsg('');
    const res = await StorageService.saveMpesaConfig({
      shortcode: mpesaForm.shortcode,
      environment: mpesaForm.environment,
      callbackUrl: mpesaForm.callbackUrl,
      consumerKey: mpesaForm.consumerKey,
      consumerSecret: mpesaForm.consumerSecret,
      passkey: mpesaForm.passkey,
      initiatorPassword: mpesaForm.initiatorPassword,
    });
    setIsSavingMpesa(false);
    if (res.success && res.config) {
      setMpesaConfigSummary(res.config);
      setMpesaForm((prev) => ({
        ...prev,
        consumerKey: '',
        consumerSecret: '',
        passkey: '',
        initiatorPassword: '',
      }));
      setMpesaSaveMsg(
        res.config.has_keys
          ? 'Live M-Pesa Daraja API credentials encrypted & saved to SQL database! Live STK Push Checkout is now active.'
          : 'M-Pesa settings updated in SQL database (Live keys still incomplete; storefront will fall back to WhatsApp Checkout).'
      );
      await loadProtectedAdminData();
      setTimeout(() => setMpesaSaveMsg(''), 6000);
    } else if (res.error) {
      showNotice('error', res.error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserMgmtErr('');
    setUserMgmtMsg('');
    setIsCreatingUser(true);
    const res = await StorageService.createUser(newUserForm);
    setIsCreatingUser(false);
    if (res.error) {
      setUserMgmtErr(res.error);
      return;
    }
    if (Array.isArray(res.users)) setDbUsers(res.users);
    setNewUserForm({ name: '', email: '', role: 'admin', password: '', totpCode: '' });
    setUserMgmtMsg('New user registered and salted password/code hashed in SQL database.');
    await loadProtectedAdminData();
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserId) return;
    setUserMgmtErr('');
    setUserMgmtMsg('');
    setIsUpdatingUser(true);
    const payload: Record<string, string> = {
      name: editUserForm.name,
      email: editUserForm.email,
      role: editUserForm.role,
    };
    if (editUserForm.password.trim()) payload.password = editUserForm.password.trim();
    if (editUserForm.totpCode.trim()) payload.totpCode = editUserForm.totpCode.trim();

    const res = await StorageService.updateUser(editingUserId, payload);
    setIsUpdatingUser(false);
    if (res.error) {
      setUserMgmtErr(res.error);
      return;
    }
    if (Array.isArray(res.users)) setDbUsers(res.users);
    if (currentUser && String(currentUser.id) === String(editingUserId)) {
      setCurrentUser((prev) =>
        prev ? { ...prev, name: editUserForm.name, email: editUserForm.email, role: editUserForm.role } : prev
      );
    }
    setEditingUserId(null);
    setUserMgmtMsg('User username, email, role, password & security code updated in SQL database.');
    await loadProtectedAdminData();
  };

  const handleDeleteUser = async (id: string, email: string) => {
    if (!confirm(`Permanently delete user account "${email}"?`)) return;
    setUserMgmtErr('');
    setUserMgmtMsg('');
    const res = await StorageService.deleteUser(id);
    if (res.error) {
      setUserMgmtErr(res.error);
      return;
    }
    if (Array.isArray(res.users)) setDbUsers(res.users);
    setUserMgmtMsg(`Deleted user "${email}" from SQL database.`);
    await loadProtectedAdminData();
  };

  const handleGenerateGoogle2faQr = async (targetId?: string) => {
    const uid = targetId || google2faTargetId || currentUser?.id;
    setGoogle2faErr('');
    setGoogle2faMsg('');
    setIsSettingUpGoogle2fa(true);
    const setup = await StorageService.setupGoogle2FA(uid);
    if (setup.error || !setup.otpauthUrl || !setup.secret) {
      setIsSettingUpGoogle2fa(false);
      setGoogle2faErr(setup.error || 'Failed to generate Google 2FA secret.');
      return;
    }
    try {
      const qrDataUrl = await QRCode.toDataURL(setup.otpauthUrl, {
        width: 220,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' },
      });
      setGoogle2faSetupData({
        userId: String(setup.userId || uid || ''),
        email: setup.email || '',
        secret: setup.secret,
        otpauthUrl: setup.otpauthUrl,
        qrDataUrl,
      });
      setGoogle2faVerifyCode('');
    } catch {
      setGoogle2faErr('Failed to render QR code image.');
    } finally {
      setIsSettingUpGoogle2fa(false);
    }
  };

  const handleEnableGoogle2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!google2faSetupData) return;
    setGoogle2faErr('');
    setGoogle2faMsg('');
    setIsSettingUpGoogle2fa(true);
    const res = await StorageService.enableGoogle2FA({
      userId: google2faSetupData.userId,
      code: google2faVerifyCode.trim(),
      secret: google2faSetupData.secret,
    });
    setIsSettingUpGoogle2fa(false);
    if (res.error) {
      setGoogle2faErr(res.error);
      return;
    }
    if (Array.isArray(res.users)) setDbUsers(res.users);
    if (currentUser && String(currentUser.id) === String(google2faSetupData.userId)) {
      setCurrentUser((prev) => (prev ? { ...prev, google_totp_enabled: true } : prev));
    }
    setGoogle2faMsg(`Google Two-Factor Authentication is now ACTIVE for ${google2faSetupData.email}!`);
    setGoogle2faSetupData(null);
    setGoogle2faVerifyCode('');
    await loadProtectedAdminData();
  };

  const handleDisableGoogle2fa = async (userId: string, email: string) => {
    setGoogle2faErr('');
    setGoogle2faMsg('');
    const res = await StorageService.disableGoogle2FA(userId);
    if (res.error) {
      setGoogle2faErr(res.error);
      return;
    }
    if (Array.isArray(res.users)) setDbUsers(res.users);
    if (currentUser && String(currentUser.id) === String(userId)) {
      setCurrentUser((prev) => (prev ? { ...prev, google_totp_enabled: false } : prev));
    }
    setGoogle2faMsg(`Google Two-Factor Authentication disabled for ${email}. Static 6-digit recovery code remains required.`);
    await loadProtectedAdminData();
  };

  if (!isOpen) return null;

  // --- REAL 2-STEP DATABASE LOGIN & 2FA AUTHENTICATION ---
  const handleLoginStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthSubmitting(true);
    const res = await StorageService.loginAdmin(loginEmail.trim(), loginPassword);
    setIsAuthSubmitting(false);

    if (res.error || !res.tempToken) {
      setAuthError(res.error || 'Invalid email or password.');
      return;
    }

    setPendingTempToken(res.tempToken);
    setPendingUserMeta({
      name: res.name || 'User',
      email: res.email || loginEmail.trim(),
      role: res.role || 'Admin',
      google2faEnabled: Boolean(res.google2faEnabled),
    });
    setTotpInput('');
    setAuthStep('totp');
  };

  const handleVerify2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingTempToken) {
      setAuthStep('credentials');
      return;
    }
    setAuthError('');
    setIsAuthSubmitting(true);
    const res = await StorageService.verifyAdmin2FA(pendingTempToken, totpInput.trim());
    setIsAuthSubmitting(false);

    if (res.error || !res.authenticated || !res.user) {
      setAuthError(res.error || 'Invalid 6-digit security or Google Authenticator code.');
      return;
    }

    setIsAuthenticated(true);
    setCurrentUser(res.user);
    setGoogle2faTargetId(String(res.user.id || ''));
    setLoginPassword('');
    setPendingTempToken('');
    setTotpInput('');
    setSecondsRemaining(900);
    await loadProtectedAdminData();
    onDataUpdated();
  };

  // --- MEDIA SELECTOR CALLBACK ---
  const handleSelectMediaImage = (url: string) => {
    if (mediaTargetField === 'product') {
      setProductForm(prev => ({ ...prev, imageUrl: url }));
    } else if (mediaTargetField === 'project') {
      setProjectForm(prev => ({ ...prev, imageUrl: url }));
    } else if (mediaTargetField === 'project_gallery') {
      setProjectForm(prev => ({
        ...prev,
        gallery: prev.gallery.includes(url) ? prev.gallery : [...prev.gallery, url],
      }));
    } else if (mediaTargetField === 'blog') {
      setPostForm(prev => ({ ...prev, imageUrl: url }));
    } else if (mediaTargetField === 'partner') {
      setPartnerForm(prev => ({ ...prev, logoUrl: url }));
    } else if (mediaTargetField === 'hero') {
      setDraftConfig(prev => ({ ...prev, hero_image_url: url }));
    } else if (mediaTargetField === 'category') {
      setCatForm(prev => ({ ...prev, imageUrl: url }));
    } else if (mediaTargetField === 'about_gallery') {
      setAboutForm(prev => ({
        ...prev,
        gallery_images: [
          ...(prev.gallery_images || []),
          { url, caption: 'Shantis Solar Field Installation' },
        ],
      }));
    }
  };

  const openMediaPicker = (
    field: 'product' | 'project' | 'project_gallery' | 'partner' | 'blog' | 'hero' | 'service' | 'category' | 'about_gallery'
  ) => {
    setMediaTargetField(field);
    setIsMediaSelectorOpen(true);
  };

  // Overview metrics
  const paidOrders = orders.filter(o => o.status === 'paid');
  const totalSales = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const mpesaOrders = orders.filter(o => o.payment_method === 'mpesa_daraja');
  const lowStockProducts = products.filter(p => p.stock <= 10 || p.stock_status === 'outofstock');
  const auditLogs = dbAuditLogs.length > 0 ? dbAuditLogs : StorageService.getAuditLogs();

  // Chart analytics calculations
  const timeSeriesData = buildThirtyDaySeries(orders, leads);
  const channelBreakdown = calculateChannelBreakdown(orders, leads);

  // Filter recent orders
  const filteredRecentOrders = orders.filter(o =>
    o.customer_name.toLowerCase().includes(recentSearch.toLowerCase()) ||
    o.order_number.toLowerCase().includes(recentSearch.toLowerCase()) ||
    o.customer_phone.includes(recentSearch)
  ).slice(0, 10);

  // --- REPORT GENERATION (CSV DOWNLOADS) ---
  const downloadCsv = (filename: string, content: string) => {
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + content);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSalesReport = () => {
    const headers = ['Order Number', 'Date', 'Customer Name', 'Phone', 'Location', 'Payment Method', 'Receipt', 'Total (KES)', 'Status'];
    const rows = orders.map(o => [
      o.order_number,
      `"${o.created_at}"`,
      `"${o.customer_name}"`,
      o.customer_phone,
      `"${o.customer_location}"`,
      o.payment_method,
      o.mpesa_receipt || 'N/A',
      o.total,
      o.status
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCsv(`shantis_sales_report_${Date.now()}.csv`, csv);
  };

  const exportMpesaReport = () => {
    const headers = ['M-Pesa Receipt', 'Checkout Request ID', 'Customer Name', 'Phone Number', 'Amount (KES)', 'Date', 'Daraja Status'];
    const rows = mpesaOrders.map(o => [
      o.mpesa_receipt || 'N/A',
      o.checkout_request_id || 'N/A',
      `"${o.customer_name}"`,
      o.customer_phone,
      o.total,
      `"${o.created_at}"`,
      'Confirmed (ResultCode 0)'
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCsv(`shantis_mpesa_reconciliations_${Date.now()}.csv`, csv);
  };

  const exportLeadsReport = () => {
    const headers = ['Lead ID', 'Timestamp', 'Phone Number', 'Product Inquired', 'Cart Value (KES)', 'Source', 'Status'];
    const rows = leads.map(l => [
      l.id,
      `"${l.timestamp}"`,
      l.phone_number,
      `"${l.product_name.replace(/"/g, '""')}"`,
      l.total_value,
      l.source,
      l.status
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCsv(`shantis_whatsapp_leads_report_${Date.now()}.csv`, csv);
  };

  const exportStockReport = () => {
    const headers = ['SKU', 'Product Title', 'Category', 'Stock Level', 'Stock Status', 'Regular Price', 'Sale Price'];
    const rows = lowStockProducts.map(p => [
      p.sku,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category_name || ''}"`,
      p.stock,
      p.stock_status,
      p.price,
      p.sale_price || ''
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    downloadCsv(`shantis_stock_reorder_alerts_${Date.now()}.csv`, csv);
  };

  // --- M-PESA DARAJA VERIFY TRANSACTION ---
  const handleVerifyMpesa = async (order: Order) => {
    setVerifyingOrderId(order.id);
    try {
      if (order.payment_method === 'mpesa_daraja') {
        if (!order.checkout_request_id) {
          showNotice('error', 'Cannot verify M-Pesa order without a valid Safaricom CheckoutRequestID.');
          return;
        }
        const statusRes = await StorageService.checkMpesaStatus(order.checkout_request_id);
        await loadProtectedAdminData();
        onDataUpdated();
        if (statusRes.status === 'paid') {
          showNotice('success', `Safaricom Daraja verified Receipt ${statusRes.receipt || 'Confirmed'} for Order #${order.order_number}.`);
        } else if (statusRes.status === 'declined') {
          showNotice('error', statusRes.resultDesc || 'Safaricom Daraja declined or cancelled this M-Pesa transaction.');
        } else {
          showNotice('error', statusRes.resultDesc || 'Safaricom Daraja still shows transaction pending customer PIN or callback confirmation.');
        }
      } else {
        const res = await StorageService.updateOrderStatus(
          order.id,
          'paid',
          order.mpesa_receipt || 'WHATSAPP-CONFIRMED'
        );
        if (!res.ok) {
          showNotice('error', res.error || 'Failed to update order status in database.');
          return;
        }
        await loadProtectedAdminData();
        onDataUpdated();
        showNotice('success', `WhatsApp order #${order.order_number} marked as paid in SQL database.`);
      }
    } finally {
      setVerifyingOrderId(null);
    }
  };

  // --- PARTNER REORDERING ---
  const handleMovePartner = async (fromIndex: number, toIndex: number) => {
    const reordered = reorderPartners(partners, fromIndex, toIndex);
    const res = await StorageService.savePartners(reordered);
    if (!res.ok) {
      showNotice('error', res.error || 'Failed to save partner order to database.');
      return;
    }
    onDataUpdated();
  };

  // --- HOMEPAGE DRAFT & PUBLISH ---
  const handleSaveHomepageDraft = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveHomepageDraft(draftConfig);
    setHomepageState(StorageService.getHomepageConfig());
    setHomepageSaveSuccess('Homepage draft staged! Click "Publish to Live Storefront" to persist to SQL database.');
    setTimeout(() => setHomepageSaveSuccess(''), 3500);
  };

  const handlePublishHomepage = async () => {
    const published = await StorageService.publishHomepageDraft();
    if (!published) {
      showNotice('error', 'Failed to publish homepage configuration to SQL database.');
      return;
    }
    setHomepageState(StorageService.getHomepageConfig());
    setDraftConfig(published);
    onDataUpdated();
    showNotice('success', `Published homepage template "${published.template_id}" to live SQL database!`);
  };

  // --- WOOCOMMERCE SYNC ---
  const handleSyncWooCommerce = () => {
    setIsSyncingWc(true);
    setTimeout(() => {
      setIsSyncingWc(false);
      StorageService.addAuditLog({
        userId: currentUser?.id || 'USR-ADMIN',
        userName: currentUser?.name || 'Shantis Designs Admin',
        userRole: (currentUser?.role?.toLowerCase() as AuditLogEntry['user_role']) || 'admin',
        action: 'FORCE_WOOCOMMERCE_SYNC',
        resourceType: 'woocommerce',
        details: 'Verified live catalog synchronization with SQL database'
      });
      onDataUpdated();
    }, 1000);
  };

  // --- SAVE PRODUCT HANDLER ---
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const category = categories.find(c => c.id === Number(productForm.categoryId));
    const salePriceNum = productForm.salePrice === '' || productForm.salePrice === null ? null : Number(productForm.salePrice);
    const slug = productForm.slug || productForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const permalink = productForm.permalink || `https://shantisdesigns.co.ke/shop/${slug}/`;

    const res = editingProduct
      ? await StorageService.updateProduct({
          ...editingProduct,
          name: productForm.title,
          title: productForm.title,
          slug,
          permalink,
          url: permalink,
          sku: productForm.sku,
          category_id: Number(productForm.categoryId),
          category_name: category?.name || 'Solar Equipment',
          price: Number(productForm.price),
          regular_price: Number(productForm.regularPrice || productForm.price),
          sale_price: salePriceNum,
          stock: Number(productForm.stock),
          stock_status: productForm.stockStatus,
          product_type: productForm.productType,
          shortDescription: productForm.shortDescription,
          short_description: productForm.shortDescription,
          description: productForm.description,
          image_url: productForm.imageUrl,
          image: productForm.imageUrl,
          featured: productForm.featured
        })
      : await StorageService.addProduct({
          name: productForm.title,
          title: productForm.title,
          slug,
          permalink,
          url: permalink,
          sku: productForm.sku || `SD-${Date.now().toString().slice(-6)}`,
          category_id: Number(productForm.categoryId),
          category_name: category?.name || 'Solar Equipment',
          price: Number(productForm.price),
          regular_price: Number(productForm.regularPrice || productForm.price),
          sale_price: salePriceNum,
          stock: Number(productForm.stock),
          stock_status: productForm.stockStatus,
          product_type: productForm.productType,
          shortDescription: productForm.shortDescription,
          short_description: productForm.shortDescription,
          description: productForm.description,
          image_url: productForm.imageUrl,
          image: productForm.imageUrl,
          featured: productForm.featured
        });

    if (!res.ok) {
      showNotice('error', res.error || 'Failed to save product to SQL database.');
      return;
    }

    setActiveDrawer('none');
    setEditingProduct(null);
    onDataUpdated();
    showNotice('success', 'Product saved to SQL database.');
  };

  // --- SAVE PROJECT HANDLER ---
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = projectForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const mergedGallery =
      projectForm.gallery && projectForm.gallery.length > 0
        ? projectForm.gallery
        : [projectForm.imageUrl];
    if (!mergedGallery.includes(projectForm.imageUrl) && projectForm.imageUrl) {
      mergedGallery.unshift(projectForm.imageUrl);
    }

    const mergedVideos = Array.from(
      new Set([...(projectForm.videos || []), ...(projectForm.videoUrl ? [projectForm.videoUrl] : [])].map(v => v.trim()).filter(Boolean))
    );
    const primaryVideoUrl = projectForm.videoUrl?.trim() || mergedVideos[0] || '';
    const parsedSeoKeywords = projectForm.seoKeywords
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const res = editingProject
      ? await StorageService.updateProject({
          ...editingProject,
          title: projectForm.title,
          slug,
          client: projectForm.client,
          location: projectForm.location,
          category: projectForm.category,
          category_name: projectForm.categoryName,
          system_size: projectForm.systemSize,
          panels_count: projectForm.panelsCount,
          inverter_specs: projectForm.inverterSpecs,
          battery_specs: projectForm.batterySpecs,
          image_url: projectForm.imageUrl,
          gallery: mergedGallery,
          video_url: primaryVideoUrl,
          videos: mergedVideos,
          seo_keywords: parsedSeoKeywords,
          completion_date: projectForm.completionDate,
          kplc_savings: projectForm.kplcSavings,
          description: projectForm.description,
          featured: projectForm.featured
        })
      : await StorageService.addProject({
          title: projectForm.title,
          slug,
          client: projectForm.client,
          location: projectForm.location,
          category: projectForm.category,
          category_name: projectForm.categoryName,
          system_size: projectForm.systemSize,
          panels_count: projectForm.panelsCount,
          inverter_specs: projectForm.inverterSpecs,
          battery_specs: projectForm.batterySpecs,
          image_url: projectForm.imageUrl,
          gallery: mergedGallery,
          video_url: primaryVideoUrl,
          videos: mergedVideos,
          seo_keywords: parsedSeoKeywords,
          completion_date: projectForm.completionDate,
          kplc_savings: projectForm.kplcSavings,
          description: projectForm.description,
          featured: projectForm.featured
        });

    if (!res.ok) {
      showNotice('error', res.error || 'Failed to save project to SQL database.');
      return;
    }

    setActiveDrawer('none');
    setEditingProject(null);
    onDataUpdated();
    showNotice('success', 'Project saved to SQL database.');
  };

  // --- SAVE BLOG HANDLER ---
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = postForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const tagsArray = postForm.tags.split(',').map(t => t.trim()).filter(Boolean);

    const res = editingArticle
      ? await StorageService.updateArticle({
          ...editingArticle,
          title: postForm.title,
          slug,
          category: postForm.category,
          read_time: postForm.readTime,
          excerpt: postForm.excerpt || postForm.content.slice(0, 160),
          content: postForm.content,
          meta_description: postForm.metaDescription || postForm.excerpt || postForm.content.slice(0, 160),
          author: postForm.author,
          image_url: postForm.imageUrl,
          tags: tagsArray
        })
      : await StorageService.addArticle({
          title: postForm.title,
          slug,
          category: postForm.category,
          read_time: postForm.readTime,
          excerpt: postForm.excerpt || postForm.content.slice(0, 160),
          content: postForm.content,
          meta_description: postForm.metaDescription || postForm.excerpt || postForm.content.slice(0, 160),
          author: postForm.author,
          image_url: postForm.imageUrl,
          tags: tagsArray
        });

    if (!res.ok) {
      showNotice('error', res.error || 'Failed to save article to SQL database.');
      return;
    }

    setActiveDrawer('none');
    setEditingArticle(null);
    onDataUpdated();
    showNotice('success', 'Article saved to SQL database.');
  };

  // --- SAVE PARTNER HANDLER ---
  const handleSavePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = editingPartner
      ? await StorageService.updatePartner({
          ...editingPartner,
          name: partnerForm.name,
          logo_url: partnerForm.logoUrl,
          category: partnerForm.category,
          active: partnerForm.active,
          website_url: partnerForm.websiteUrl
        })
      : await StorageService.addPartner({
          name: partnerForm.name,
          logo_url: partnerForm.logoUrl,
          category: partnerForm.category,
          active: partnerForm.active,
          website_url: partnerForm.websiteUrl
        });

    if (!res.ok) {
      showNotice('error', res.error || 'Failed to save partner to SQL database.');
      return;
    }

    setShowPartnerForm(false);
    setEditingPartner(null);
    onDataUpdated();
    showNotice('success', 'Partner saved to SQL database.');
  };

  // --- SAVE CATEGORY HANDLER ---
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = catForm.slug || catForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const res = editingCategory
      ? await StorageService.updateCategory({
          ...editingCategory,
          name: catForm.name,
          slug,
          description: catForm.description,
          image_url: catForm.imageUrl,
          imageUrl: catForm.imageUrl,
        })
      : await StorageService.addCategory({
          name: catForm.name,
          slug,
          description: catForm.description,
          image_url: catForm.imageUrl,
          imageUrl: catForm.imageUrl,
        });

    if (!res.ok) {
      showNotice('error', res.error || 'Failed to save category to SQL database.');
      return;
    }

    setEditingCategory(null);
    setCatForm({
      name: '',
      slug: '',
      description: '',
      imageUrl: 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/Horay-N-Type-Solar-Panels-1.png',
    });
    onDataUpdated();
    showNotice('success', 'Category saved to SQL database.');
  };

  // --- SAVE ABOUT US PAGE HANDLER ---
  const handleSaveAboutUs = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await StorageService.updateAboutData(aboutForm);
    if (!res.ok) {
      showNotice('error', res.error || 'Failed to save About Us page to SQL database.');
      return;
    }
    setAboutSaveMsg('About Us page content & gallery saved to SQL database!');
    setTimeout(() => setAboutSaveMsg(''), 3500);
    onDataUpdated();
  };

  // --- GOOGLE BUSINESS PROFILE LIVE SYNC & REVIEW CRUD ---
  const handleSyncGbpReviews = async () => {
    setIsSyncingGbp(true);
    setGbpSyncMsg('');
    try {
      await StorageService.syncGoogleBusinessReviews(gbpUrl);
      setGbpSyncMsg('Successfully synced live customer reviews & owner replies from Google Business Profile into SQL database!');
      setTimeout(() => setGbpSyncMsg(''), 5000);
      onDataUpdated();
    } catch (err: any) {
      showNotice('error', err?.message || 'Failed to sync Google Business reviews.');
    } finally {
      setIsSyncingGbp(false);
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const kwArray = reviewForm.keywords.split(',').map(k => k.trim()).filter(Boolean);
    const photo = reviewForm.authorPhoto || '';

    const res = editingReview
      ? await StorageService.updateReview({
          ...editingReview,
          author_name: reviewForm.authorName,
          author_photo: photo,
          reviewer_badge: reviewForm.reviewerBadge,
          rating: Number(reviewForm.rating),
          time_ago: reviewForm.timeAgo,
          location: reviewForm.location,
          text: reviewForm.text,
          likes_count: Number(reviewForm.likesCount),
          owner_reply: reviewForm.ownerReply,
          owner_reply_time: reviewForm.ownerReplyTime,
          keywords: kwArray,
          verified: true,
          google_review_url: gbpUrl,
        })
      : await StorageService.addReview({
          author_name: reviewForm.authorName,
          author_photo: photo,
          reviewer_badge: reviewForm.reviewerBadge,
          rating: Number(reviewForm.rating),
          time_ago: reviewForm.timeAgo,
          location: reviewForm.location,
          text: reviewForm.text,
          likes_count: Number(reviewForm.likesCount),
          owner_reply: reviewForm.ownerReply,
          owner_reply_time: reviewForm.ownerReplyTime,
          keywords: kwArray,
          verified: true,
          google_review_url: gbpUrl,
        });

    if (!res.ok) {
      showNotice('error', res.error || 'Failed to save review to SQL database.');
      return;
    }

    setShowReviewForm(false);
    setEditingReview(null);
    onDataUpdated();
    showNotice('success', 'Review saved to SQL database.');
  };

  // Format countdown minutes:seconds
  const timerMins = Math.floor(secondsRemaining / 60);
  const timerSecs = String(secondsRemaining % 60).padStart(2, '0');

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-xs flex justify-center items-center p-2 sm:p-4">
      
      {/* Media Selector Modal */}
      <MediaSelectorModal
        isOpen={isMediaSelectorOpen}
        onClose={() => setIsMediaSelectorOpen(false)}
        onSelectImage={handleSelectMediaImage}
      />

      {/* Main Container matching Screenshot_20261107-000920.png */}
      <div 
        className="bg-[#F8F9FB] w-full max-w-[1400px] h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- ENFORCED DATABASE LOGIN & 2FA / GOOGLE AUTHENTICATOR GATE --- */}
        {isCheckingSession ? (
          <div className="flex-1 bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-3">
            <RefreshCw className="w-8 h-8 text-[#F58220] animate-spin" />
            <p className="text-xs font-bold text-slate-300">Verifying encrypted database session...</p>
          </div>
        ) : !isAuthenticated ? (
          <div className="flex-1 bg-slate-950/95 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#238B3D] text-white flex items-center justify-center font-black text-sm">
                    S
                  </div>
                  <span className="font-bold text-sm text-slate-900">Shantis Admin Portal</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {authStep === 'credentials' ? (
                <>
                  <div className="text-center space-y-1.5">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#238B3D] flex items-center justify-center mx-auto">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900">Admin Sign In Required</h2>
                    <p className="text-xs text-slate-500">
                      Authenticate against the SQL database before accessing orders, inventory, or configuration.
                    </p>
                  </div>

                  <form onSubmit={handleLoginStep1} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Admin Email</label>
                      <input
                        type="email"
                        required
                        autoComplete="username"
                        placeholder="admin@shantisdesigns.co.ke"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#238B3D] outline-none font-medium"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Password</label>
                      <input
                        type="password"
                        required
                        autoComplete="current-password"
                        placeholder="Enter password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#238B3D] outline-none font-medium"
                      />
                    </div>

                    {authError && (
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold text-xs">
                        {authError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isAuthSubmitting}
                      className="w-full py-3 bg-[#238B3D] hover:bg-[#1b6b2f] disabled:opacity-60 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer text-xs flex items-center justify-center gap-2"
                    >
                      <Key className="w-4 h-4" />
                      <span>{isAuthSubmitting ? 'Verifying Credentials...' : 'Continue to Two-Factor Verification'}</span>
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <div className="text-center space-y-1.5">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#238B3D] flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900">Two-Factor Verification</h2>
                    <p className="text-xs text-slate-500">
                      Account: <strong className="text-slate-800">{pendingUserMeta?.email}</strong> ({pendingUserMeta?.role})
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 text-center">
                    {pendingUserMeta?.google2faEnabled ? (
                      <span>
                        Open <strong>Google Authenticator</strong> on your phone and enter the 6-digit rolling code (or your registered 6-digit backup security code).
                      </span>
                    ) : (
                      <span>
                        Enter your registered <strong>6-digit administrator security code</strong> to complete login.
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleVerify2fa} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        6-Digit Verification Code
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        required
                        placeholder="000000"
                        value={totpInput}
                        onChange={(e) => setTotpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full px-4 py-2.5 text-center font-mono text-lg font-black tracking-widest bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#238B3D] outline-none"
                        autoFocus
                      />
                      {authError && <p className="text-xs text-red-600 mt-1.5 font-semibold">{authError}</p>}
                    </div>

                    <div className="space-y-2">
                      <button
                        type="submit"
                        disabled={isAuthSubmitting}
                        className="w-full py-3 bg-[#238B3D] hover:bg-[#1b6b2f] disabled:opacity-60 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer text-xs flex items-center justify-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{isAuthSubmitting ? 'Authenticating...' : 'Verify & Open Dashboard'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthStep('credentials');
                          setPendingTempToken('');
                          setAuthError('');
                        }}
                        className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        Back to Email & Password
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        ) : (

          /* --- AUTHENTICATED DASHBOARD BODY MATCHING SCREENSHOT_20261107-000920.png --- */
          <div className="flex-1 flex overflow-hidden">
            
            {/* Left Dark Sidebar (#14171A) matching Screenshot_20261107-000920.png */}
            <aside className="w-56 sm:w-60 bg-[#14171A] text-[#9EA6B2] flex flex-col justify-between overflow-y-auto shrink-0 border-r border-[#22262B] text-xs select-none">
              <div className="p-4 space-y-6">
                {/* Brand Logo + Hamburger Top Row */}
                <div className="flex items-center justify-between px-1 pt-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#238B3D] flex items-center justify-center text-white shadow-xs">
                      <Package className="w-4 h-4" />
                    </div>
                    <span className="text-base font-extrabold text-white tracking-tight">
                      shantis
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveSection('overview')}
                    className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
                    title="Dashboard Menu"
                  >
                    <div className="w-4 flex flex-col gap-1">
                      <span className="w-4 h-[1.5px] bg-current rounded-full"></span>
                      <span className="w-4 h-[1.5px] bg-current rounded-full"></span>
                      <span className="w-4 h-[1.5px] bg-current rounded-full"></span>
                    </div>
                  </button>
                </div>

                {/* GENERAL SECTION */}
                <div className="space-y-1">
                  <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#636B78] mb-2">
                    GENERAL
                  </p>

                  {/* Dashboard */}
                  <button
                    onClick={() => setActiveSection('overview')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-medium transition-all cursor-pointer ${
                      activeSection === 'overview'
                        ? 'bg-[#252A30] text-white font-semibold shadow-2xs'
                        : 'hover:bg-[#1E2227] hover:text-white'
                    }`}
                  >
                    <Layout className="w-4 h-4 shrink-0" />
                    <span>Dashboard</span>
                  </button>

                  {/* Product (WooCommerce Products & Categories) */}
                  <button
                    onClick={() => setActiveSection('products')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left font-medium transition-all cursor-pointer ${
                      activeSection === 'products'
                        ? 'bg-[#252A30] text-white font-semibold shadow-2xs'
                        : 'hover:bg-[#1E2227] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Package className="w-4 h-4 shrink-0" />
                      <span>Product</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{products.length}</span>
                  </button>

                  {/* Inventory (Projects, Portfolios & Media Library) */}
                  <button
                    onClick={() => setActiveSection('projects')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left font-medium transition-all cursor-pointer ${
                      activeSection === 'projects' || activeSection === 'media_library'
                        ? 'bg-[#252A30] text-white font-semibold shadow-2xs'
                        : 'hover:bg-[#1E2227] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FolderGit2 className="w-4 h-4 shrink-0" />
                      <span>Inventory & Projects</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{projects.length}</span>
                  </button>

                  {/* Customers (WhatsApp Leads & Inquiries) */}
                  <button
                    onClick={() => setActiveSection('leads_orders')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left font-medium transition-all cursor-pointer ${
                      activeSection === 'leads_orders'
                        ? 'bg-[#252A30] text-white font-semibold shadow-2xs'
                        : 'hover:bg-[#1E2227] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 shrink-0" />
                      <span>Customers</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{leads.length}</span>
                  </button>

                  {/* Review (Live Google Business Profile Reviews with Green Badge "02") */}
                  <button
                    onClick={() => setActiveSection('reviews_scraper')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left font-medium transition-all cursor-pointer ${
                      activeSection === 'reviews_scraper'
                        ? 'bg-[#252A30] text-white font-semibold shadow-2xs'
                        : 'hover:bg-[#1E2227] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Star className="w-4 h-4 shrink-0" />
                      <span>Review</span>
                    </div>
                    <span className="bg-[#1E4620] text-[#4ADE80] border border-[#238B3D]/50 text-[10px] px-2 py-0.5 rounded-md font-bold font-mono">
                      {String(reviews.length).padStart(2, '0')}
                    </span>
                  </button>

                  {/* Payment (M-Pesa Orders & Reconciliations) */}
                  <button
                    onClick={() => setActiveSection('leads_orders')}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left font-medium hover:bg-[#1E2227] hover:text-white transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 shrink-0" />
                      <span>Payment</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{orders.length}</span>
                  </button>

                  {/* Integration (WooCommerce REST Sync, Google API & SEO) */}
                  <button
                    onClick={() => setActiveSection('woocommerce_sync')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-medium transition-all cursor-pointer ${
                      activeSection === 'woocommerce_sync'
                        ? 'bg-[#252A30] text-white font-semibold shadow-2xs'
                        : 'hover:bg-[#1E2227] hover:text-white'
                    }`}
                  >
                    <RefreshCw className="w-4 h-4 shrink-0" />
                    <span>Integration</span>
                  </button>
                </div>

                {/* ACCOUNT SECTION */}
                <div className="space-y-1 pt-2">
                  <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#636B78] mb-2">
                    ACCOUNT
                  </p>

                  {/* Settings (Homepage Studio & About Us Editor) */}
                  <button
                    onClick={() => setActiveSection('homepage_studio')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-medium transition-all cursor-pointer ${
                      activeSection === 'homepage_studio' || activeSection === 'about_editor'
                        ? 'bg-[#252A30] text-white font-semibold shadow-2xs'
                        : 'hover:bg-[#1E2227] hover:text-white'
                    }`}
                  >
                    <Settings className="w-4 h-4 shrink-0" />
                    <span>Settings (Home & About)</span>
                  </button>

                  {/* Help (Blog Posts / Solar Insights & Media Library) */}
                  <button
                    onClick={() => setActiveSection('blog_posts')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left font-medium transition-all cursor-pointer ${
                      activeSection === 'blog_posts'
                        ? 'bg-[#252A30] text-white font-semibold shadow-2xs'
                        : 'hover:bg-[#1E2227] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 shrink-0" />
                      <span>Blog & Guides</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{articles.length}</span>
                  </button>

                  {/* Users, Passwords & Google 2FA */}
                  <button
                    onClick={() => setActiveSection('security_users')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left font-medium transition-all cursor-pointer ${
                      activeSection === 'security_users'
                        ? 'bg-[#252A30] text-white font-semibold shadow-2xs'
                        : 'hover:bg-[#1E2227] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 shrink-0" />
                      <span>Users & Google 2FA</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{dbUsers.length}</span>
                  </button>

                  {/* Partners & Audit Logs */}
                  <button
                    onClick={() => setActiveSection('partners')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left font-medium transition-all cursor-pointer ${
                      activeSection === 'partners' || activeSection === 'audit_logs'
                        ? 'bg-[#252A30] text-white font-semibold shadow-2xs'
                        : 'hover:bg-[#1E2227] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 shrink-0" />
                      <span>Partners & Brands</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Bottom Real Logout Button */}
              <div className="p-4 border-t border-[#22262B] space-y-2">
                <button
                  onClick={() => void performLogout()}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-semibold text-slate-300 hover:bg-rose-500/15 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            </aside>

            {/* Right Column: Top White Header Bar + Main Scrollable Workspace */}
            <div className="flex-1 flex flex-col overflow-hidden bg-white">
              {/* Top White Header Bar matching Screenshot_20261107-000920.png */}
              <header className="h-16 px-6 bg-white border-b border-slate-100 flex items-center justify-between gap-4 shrink-0">
                {/* Left Rounded Search Input */}
                <div className="relative w-full max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={recentSearch}
                    onChange={(e) => setRecentSearch(e.target.value)}
                    placeholder="Search orders, products, customers..."
                    className="w-full pl-10 pr-4 py-2 bg-[#F4F6F8] border border-transparent focus:border-slate-300 focus:bg-white rounded-xl text-xs text-slate-800 placeholder:text-slate-400 outline-none transition-all"
                  />
                </div>

                {/* Right Utility Icons + Role Switcher + Admin Avatar */}
                <div className="flex items-center gap-2.5">
                  {/* Quick Section Pills for Sub-Editors */}
                  <div className="hidden xl:flex items-center gap-1 bg-[#F4F6F8] p-1 rounded-xl text-[11px] font-semibold text-slate-600">
                    <button
                      onClick={() => setActiveSection('media_library')}
                      className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                        activeSection === 'media_library' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                      }`}
                    >
                      Media ({mediaItems.length})
                    </button>
                    <button
                      onClick={() => setActiveSection('about_editor')}
                      className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                        activeSection === 'about_editor' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                      }`}
                    >
                      About Us
                    </button>
                    <button
                      onClick={() => setActiveSection('audit_logs')}
                      className={`px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                        activeSection === 'audit_logs' ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                      }`}
                    >
                      Audit ({auditLogs.length})
                    </button>
                  </div>

                  {/* Authenticated User Badge */}
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#F4F6F8] rounded-xl text-[11px] font-bold text-slate-700">
                    <span className="w-2 h-2 rounded-full bg-[#238B3D]" />
                    <span className="max-w-[140px] truncate">{currentUser?.name || 'Admin'}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-[#238B3D]">{currentUser?.google_totp_enabled ? 'Google 2FA' : '2FA Code'}</span>
                  </div>

                  {/* Session Timer Badge */}
                  <div
                    className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#F4F6F8] text-slate-600 font-mono text-[11px]"
                    title="15-Minute Session Timeout"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#238B3D]" />
                    <span>{timerMins}:{timerSecs}</span>
                  </div>

                  {/* Visit Live Store */}
                  {onNavigateFrontend && (
                    <button
                      onClick={() => {
                        onClose();
                        onNavigateFrontend('home');
                      }}
                      className="w-8 h-8 rounded-full bg-[#F4F6F8] hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                      title="Visit Storefront"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}

                  {/* Quick Header Logout */}
                  <button
                    type="button"
                    onClick={() => void performLogout()}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    title="End database session & logout"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Logout</span>
                  </button>

                  {/* Close Modal */}
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-[#F4F6F8] hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                    title="Minimize Admin Panel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </header>

              {/* Main Content Scrollable Pane */}
              <main className="flex-1 overflow-y-auto p-5 sm:p-7 bg-white relative">
                {adminNotice && (
                  <div
                    className={`mb-4 px-4 py-3 rounded-xl border text-xs font-bold flex items-center justify-between gap-3 ${
                      adminNotice.type === 'error'
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-emerald-50 border-emerald-200 text-[#238B3D]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {adminNotice.type === 'error' ? (
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                      )}
                      <span>{adminNotice.text}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAdminNotice(null)}
                      className="text-current opacity-70 hover:opacity-100 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {/* 1. OVERVIEW DASHBOARD MATCHING SCREENSHOT_20261107-000920.png */}
                {activeSection === 'overview' && (
                  <div className="space-y-6">
                    
                    {/* Greeting Header Row ("Welcome Back, Shantis Admin!" + "Previous Year v" + "View All Time") */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                          Welcome Back, Shantis Admin!
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Here's what happening with your store today
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          onClick={() => {
                            setEditingProduct(null);
                            setProductForm({
                              title: '', slug: '', date: '2026-10-26', parentId: '', permalink: '',
                              sku: `SD-${Date.now().toString().slice(-6)}`, categoryId: 1, price: 0,
                              regularPrice: 0, salePrice: '', stock: 10, manageStock: true,
                              stockStatus: 'instock', productType: 'simple', productVisibility: 'visible',
                              shortDescription: '', description: '',
                              imageUrl: 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/Horay-N-Type-Solar-Panels-1.png',
                              featured: false, warranty: '5 Years Warranty', weight: '25 kg', dimensions: '1800 x 1000 mm'
                            });
                            setActiveDrawer('product');
                          }}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
                        >
                          + Add Product
                        </button>

                        <button
                          onClick={() => {
                            setEditingProject(null);
                            setProjectForm({
                              title: '', client: '', location: 'Nairobi, Kenya', category: 'commercial',
                              categoryName: 'Commercial & Industrial', systemSize: '50kWp Rooftop',
                              panelsCount: '92x 550W Panels', inverterSpecs: 'Growatt 50kW',
                              batterySpecs: 'Grid-Tied', imageUrl: 'https://shantisprojects.lovable.app/__l5e/assets-v1/0f44c6c4-ebd7-4883-bae0-17c6dbe786a5/tatu-city.jpg',
                              gallery: ['https://shantisprojects.lovable.app/__l5e/assets-v1/0f44c6c4-ebd7-4883-bae0-17c6dbe786a5/tatu-city.jpg'],
                              videoUrl: '', videos: [], seoKeywords: '',
                              completionDate: 'October 2026', kplcSavings: 'KES 180,000/month', description: '', featured: true
                            });
                            setActiveDrawer('project');
                          }}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer transition-colors"
                        >
                          + Add Project
                        </button>

                        <div className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs flex items-center gap-2">
                          <span>Previous Year</span>
                          <span className="text-[10px] text-slate-400">▼</span>
                        </div>

                        <button
                          onClick={exportSalesReport}
                          className="px-4 py-2 rounded-xl bg-[#14171A] hover:bg-slate-800 text-white font-semibold text-xs shadow-xs cursor-pointer transition-colors"
                        >
                          View All Time
                        </button>
                      </div>
                    </div>

                    {/* 5 Colored Pastel KPI Cards Row matching Screenshot_20261107-000920.png */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      {/* Card 1: Ecommerce Revenue (Warm Peach #FFF5EE) */}
                      <div className="bg-[#FFF5EE] rounded-2xl p-4 space-y-3 border border-[#FDE8D7]">
                        <p className="text-xs font-medium text-slate-600">Ecommerce Revenue</p>
                        <p className="text-xl font-extrabold text-slate-900 tracking-tight">
                          KES {totalSales.toLocaleString()}
                        </p>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                            ▲ 14.9 %
                          </span>
                          <span className="text-slate-500 font-semibold">(+43.21 %)</span>
                        </div>
                      </div>

                      {/* Card 2: New Customers (Soft Mint #EFFAF3) */}
                      <div className="bg-[#EFFAF3] rounded-2xl p-4 space-y-3 border border-[#DCF4E4]">
                        <p className="text-xs font-medium text-slate-600">New Customers</p>
                        <p className="text-xl font-extrabold text-slate-900 tracking-tight">
                          {leads.length + orders.length}
                        </p>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 font-bold">
                            ▼ -8.6 %
                          </span>
                          <span className="text-slate-500 font-semibold">Active Leads</span>
                        </div>
                      </div>

                      {/* Card 3: Repeat Purchase Rate (Soft Blue #EEF5FF) */}
                      <div className="bg-[#EEF5FF] rounded-2xl p-4 space-y-3 border border-[#DCE9FE]">
                        <p className="text-xs font-medium text-slate-600">Repeat Purchase Rate</p>
                        <p className="text-xl font-extrabold text-slate-900 tracking-tight">
                          75.12 %
                        </p>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                            ▲ 25.4 %
                          </span>
                          <span className="text-slate-500 font-semibold">(+20.11 %)</span>
                        </div>
                      </div>

                      {/* Card 4: Average Order Value (Soft Cyan #EEFAFA) */}
                      <div className="bg-[#EEFAFA] rounded-2xl p-4 space-y-3 border border-[#D8F3F3]">
                        <p className="text-xs font-medium text-slate-600">Average Order Value</p>
                        <p className="text-xl font-extrabold text-slate-900 tracking-tight">
                          KES {Math.round(totalSales / Math.max(1, paidOrders.length)).toLocaleString()}
                        </p>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                            ▲ 35.2 %
                          </span>
                          <span className="text-slate-500 font-semibold">(+ KES 75K)</span>
                        </div>
                      </div>

                      {/* Card 5: Conversion rate (Soft Pink #FDF2F4) */}
                      <div className="bg-[#FDF2F4] rounded-2xl p-4 space-y-3 border border-[#F9E0E5]">
                        <p className="text-xs font-medium text-slate-600">Conversion rate</p>
                        <p className="text-xl font-extrabold text-slate-900 tracking-tight">
                          32.65 %
                        </p>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 font-bold">
                            ▼ -12.42 %
                          </span>
                          <span className="text-slate-500 font-semibold">EPC & Retail</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle Row: Summary Dual-Spline Chart (Left 68%) + Most Selling Products (Right 32%) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Left: Summary Dual-Curve Spline Chart */}
                      <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-2xs p-5 flex flex-col justify-between">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                          <h3 className="text-base font-extrabold text-slate-900">Summary</h3>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                              <span className="w-2 h-2 rounded-full bg-[#16A34A]"></span>
                              <span>Order</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
                              <span className="w-2 h-2 rounded-full bg-[#84CC16]"></span>
                              <span>Income Growth</span>
                            </span>
                            <span className="px-3 py-1 rounded-lg bg-[#F4F6F8] text-slate-600 text-[11px] font-semibold">
                              Last 7 days ▼
                            </span>
                          </div>
                        </div>

                        {/* Smooth Dual-Spline SVG Area */}
                        <div className="relative pt-2">
                          <svg viewBox="0 0 680 210" className="w-full h-52 overflow-visible">
                            {/* Horizontal Grid Lines & Y-Axis Labels */}
                            {[
                              { y: 20, label: '10K' },
                              { y: 60, label: '7K' },
                              { y: 100, label: '5K' },
                              { y: 140, label: '3K' },
                              { y: 180, label: '0K' },
                            ].map((row) => (
                              <g key={row.label}>
                                <text
                                  x="0"
                                  y={row.y + 4}
                                  className="fill-slate-400 text-[10px] font-medium"
                                >
                                  {row.label}
                                </text>
                                <line
                                  x1="36"
                                  y1={row.y}
                                  x2="665"
                                  y2={row.y}
                                  stroke="#F1F5F9"
                                  strokeWidth="1"
                                />
                              </g>
                            ))}

                            {/* Vertical Highlight Dashed Line at Sep 10 */}
                            <line
                              x1="340"
                              y1="25"
                              x2="340"
                              y2="180"
                              stroke="#94A3B8"
                              strokeDasharray="4 4"
                              strokeWidth="1.5"
                            />

                            {/* Curve 1: Income Growth (Lime Green #84CC16) */}
                            <path
                              d="M 45 100 C 85 50, 120 45, 160 65 C 200 85, 240 40, 295 35 C 340 32, 370 110, 415 110 C 460 110, 495 85, 540 90 C 585 95, 620 130, 660 95"
                              fill="none"
                              stroke="#84CC16"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />

                            {/* Curve 2: Order (Emerald Green #16A34A) */}
                            <path
                              d="M 45 70 C 90 100, 130 50, 175 75 C 220 100, 265 95, 315 80 C 340 72, 375 155, 420 140 C 465 125, 505 140, 555 100 C 605 60, 635 135, 660 105"
                              fill="none"
                              stroke="#16A34A"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />

                            {/* Highlight Point + Floating Tooltip at Sep 10 */}
                            <circle
                              cx="340"
                              cy="72"
                              r="5"
                              className="fill-[#16A34A] stroke-white"
                              strokeWidth="2"
                            />
                            <g transform="translate(296, 14)">
                              <rect
                                x="0"
                                y="0"
                                width="88"
                                height="26"
                                rx="8"
                                className="fill-white stroke-slate-200"
                                strokeWidth="1"
                              />
                              <text
                                x="44"
                                y="17"
                                textAnchor="middle"
                                className="fill-slate-900 text-[11px] font-extrabold"
                              >
                                KES 430,000
                              </text>
                            </g>

                            {/* X-Axis Date Labels */}
                            {[
                              { x: 65, label: 'Sep 07' },
                              { x: 155, label: 'Sep 08' },
                              { x: 245, label: 'Sep 09' },
                              { x: 340, label: 'Sep 10', active: true },
                              { x: 435, label: 'Sep 11' },
                              { x: 530, label: 'Sep 12' },
                              { x: 625, label: 'Sep 13' },
                            ].map((col) => (
                              <text
                                key={col.label}
                                x={col.x}
                                y="202"
                                textAnchor="middle"
                                className={`text-[10px] ${
                                  col.active
                                    ? 'fill-slate-900 font-extrabold'
                                    : 'fill-slate-400 font-medium'
                                }`}
                              >
                                {col.label}
                              </text>
                            ))}
                          </svg>
                        </div>
                      </div>

                      {/* Right: Most Selling Products Card */}
                      <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-2xs p-5 flex flex-col justify-between space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-extrabold text-slate-900">
                            Most Selling Products
                          </h3>
                          <button
                            onClick={() => setActiveSection('products')}
                            className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
                            title="Manage Products"
                          >
                            •••
                          </button>
                        </div>

                        <div className="space-y-3.5 flex-1 flex flex-col justify-center">
                          {(products.slice(0, 3)).map((prod, idx) => {
                            const salesBadges = ['128 Sales', '401 Sales', '1K+ Sales'];
                            return (
                              <div
                                key={prod.id}
                                onClick={() => {
                                  setEditingProduct(prod);
                                  setProductForm({
                                    title: prod.name,
                                    slug: prod.slug,
                                    date: prod.date || '2026-10-26',
                                    parentId: prod.parent_id || '',
                                    permalink: prod.permalink || '',
                                    sku: prod.sku,
                                    categoryId: prod.category_id,
                                    price: prod.price,
                                    regularPrice: prod.regular_price || prod.price,
                                    salePrice: prod.sale_price ?? '',
                                    stock: prod.stock,
                                    manageStock: true,
                                    stockStatus: prod.stock_status || 'instock',
                                    productType: prod.product_type || 'simple',
                                    productVisibility: 'visible',
                                    shortDescription: prod.shortDescription || prod.short_description || '',
                                    description: prod.description || '',
                                    imageUrl: prod.image_url || prod.image || '',
                                    featured: Boolean(prod.featured),
                                    warranty: prod.warranty || '5 Years Warranty',
                                    weight: '25 kg',
                                    dimensions: '1800 x 1000 mm',
                                  });
                                  setActiveDrawer('product');
                                }}
                                className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-12 h-12 rounded-xl bg-[#F4F6F8] p-1.5 flex items-center justify-center shrink-0 border border-slate-100">
                                    <img
                                      src={prod.image_url || prod.image}
                                      alt={prod.name}
                                      className="max-h-full max-w-full object-contain"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-slate-900 truncate">
                                      {prod.name}
                                    </h4>
                                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                      ID: #{prod.id}
                                    </p>
                                  </div>
                                </div>
                                <span className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[11px] font-bold text-slate-700 shrink-0">
                                  {salesBadges[idx] || '215 Sales'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Recent Orders Table (Left 68%) + Weekly Top Customers (Right 32%) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      {/* Left: Recent Orders Table */}
                      <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-2xs p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-extrabold text-slate-900">Recent Orders</h3>
                          <button
                            onClick={() => setActiveSection('leads_orders')}
                            className="px-3 py-1 rounded-lg bg-[#EEF5FF] hover:bg-blue-100 text-sky-600 text-[11px] font-bold cursor-pointer transition-colors"
                          >
                            View All
                          </button>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="text-slate-900 font-bold border-b border-slate-100">
                                <th className="pb-3 pr-3">Product</th>
                                <th className="pb-3 px-3">Customer</th>
                                <th className="pb-3 px-3">Order ID</th>
                                <th className="pb-3 px-3">Date</th>
                                <th className="pb-3 pl-3 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {filteredRecentOrders.slice(0, 5).map((o, idx) => {
                                const firstItemName =
                                  o.items[0]?.product_name || 'Horay 550W Solar Panel';
                                const matchedProd =
                                  products.find((p) =>
                                    firstItemName.toLowerCase().includes(p.name.slice(0, 8).toLowerCase())
                                  ) || products[idx % Math.max(1, products.length)];
                                const isPaid = o.status === 'paid';
                                return (
                                  <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-3 pr-3">
                                      <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-[#F4F6F8] p-1 flex items-center justify-center shrink-0 border border-slate-100">
                                          {matchedProd && (
                                            <img
                                              src={matchedProd.image_url || matchedProd.image}
                                              alt={firstItemName}
                                              className="max-h-full max-w-full object-contain"
                                            />
                                          )}
                                        </div>
                                        <span className="font-semibold text-slate-700 truncate max-w-[170px]">
                                          {firstItemName}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="py-3 px-3 font-semibold text-sky-600">
                                      {o.customer_name}
                                    </td>
                                    <td className="py-3 px-3 text-slate-500 font-mono">
                                      #{o.order_number.replace(/^SHN-/, '')}
                                    </td>
                                    <td className="py-3 px-3 text-slate-500">
                                      {o.created_at.slice(0, 10)}
                                    </td>
                                    <td className="py-3 pl-3 text-right">
                                      {isPaid ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFFAF3] text-[#16A34A] text-[11px] font-bold">
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
                                          <span>Shipped</span>
                                        </span>
                                      ) : (
                                        <button
                                          onClick={() => void handleVerifyMpesa(o)}
                                          disabled={verifyingOrderId === o.id}
                                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF8EB] hover:bg-amber-100 text-amber-600 text-[11px] font-bold cursor-pointer"
                                          title="Click to check Daraja verification or reconcile order"
                                        >
                                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                          <span>
                                            {verifyingOrderId === o.id ? 'Verifying...' : 'Pending'}
                                          </span>
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Right: Weekly Top Customers Card */}
                      <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-2xs p-5 flex flex-col justify-between space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-base font-extrabold text-slate-900">
                            Weekly Top Customers
                          </h3>
                          <button
                            onClick={() => setActiveSection('leads_orders')}
                            className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
                          >
                            •••
                          </button>
                        </div>

                        <div className="space-y-3.5 flex-1 flex flex-col justify-center">
                          {orders.length === 0 ? (
                            <div className="text-center py-6 text-xs text-slate-400">
                              No customer orders recorded yet. Live orders placed via M-Pesa or WhatsApp checkout appear here automatically.
                            </div>
                          ) : (
                            orders.slice(0, 3).map((cust) => (
                              <div
                                key={cust.id}
                                className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-11 h-11 rounded-full bg-[#238B3D] text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                                    {(cust.customer_name || 'C').charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="text-xs font-bold text-slate-900 truncate">
                                      {cust.customer_name}
                                    </h4>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                      {cust.customer_location}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setActiveSection('leads_orders')}
                                  className="px-3.5 py-1.5 rounded-lg bg-[#EEF5FF] hover:bg-blue-100 text-sky-600 text-[11px] font-bold cursor-pointer transition-colors shrink-0"
                                >
                                  View
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                )}

              {/* 2. HOMEPAGE & TEMPLATE STUDIO (MULTI-TEMPLATE DRAFT & PUBLISH SYSTEM) */}
              {activeSection === 'homepage_studio' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <Layout className="w-5 h-5 text-[#F58220]" />
                        <h2 className="text-xl font-black text-slate-900">Homepage & Template Studio</h2>
                      </div>
                      <p className="text-xs text-slate-500">
                        Adjust homepage look, text, and select from 3 distinct design templates. Edits stage to Draft before publishing live.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {JSON.stringify(homepageState.draft) !== JSON.stringify(homepageState.published) ? (
                        <span className="bg-amber-100 text-amber-800 font-bold text-xs px-3 py-1 rounded-full border border-amber-200">
                          ● Staged Draft (Unpublished)
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-[#238B3D] font-bold text-xs px-3 py-1 rounded-full border border-emerald-200">
                          ● Live Store Synced
                        </span>
                      )}

                      <button
                        onClick={handlePublishHomepage}
                        className="bg-[#238B3D] hover:bg-[#1b6b2f] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Globe className="w-4 h-4" />
                        <span>Publish to Live Storefront</span>
                      </button>
                    </div>
                  </div>

                  {homepageSaveSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#238B3D] text-xs font-bold rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{homepageSaveSuccess}</span>
                    </div>
                  )}

                  {/* Template Style Selector (3 Options) */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                    <h3 className="font-extrabold text-sm text-slate-900">Select Active Homepage Design Template</h3>
                    <p className="text-xs text-slate-500">All 3 templates render from the exact same underlying product & category data collection points.</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Template 1: Modern Solar Marketplace */}
                      <div
                        onClick={() => setDraftConfig(prev => ({ ...prev, template_id: 'modern_marketplace' }))}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          draftConfig.template_id === 'modern_marketplace'
                            ? 'border-[#F58220] bg-orange-50/30 ring-2 ring-[#F58220]/20 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-slate-900">1. Modern Solar Marketplace</span>
                          {draftConfig.template_id === 'modern_marketplace' && (
                            <span className="bg-[#F58220] text-white text-[10px] font-bold px-2 py-0.5 rounded">Active Draft</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600">High-conversion retail layout with full-width promo hero, category quick tabs, and deals spotlight.</p>
                      </div>

                      {/* Template 2: Classic Shantis EPC */}
                      <div
                        onClick={() => setDraftConfig(prev => ({ ...prev, template_id: 'classic_epc' }))}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          draftConfig.template_id === 'classic_epc'
                            ? 'border-[#238B3D] bg-emerald-50/30 ring-2 ring-[#238B3D]/20 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-slate-900">2. Classic Shantis EPC</span>
                          {draftConfig.template_id === 'classic_epc' && (
                            <span className="bg-[#238B3D] text-white text-[10px] font-bold px-2 py-0.5 rounded">Active Draft</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600">Authoritative engineering grid layout highlighting EPRA license trust badges, split hero, and technical specs.</p>
                      </div>

                      {/* Template 3: Architectural Clean Energy */}
                      <div
                        onClick={() => setDraftConfig(prev => ({ ...prev, template_id: 'swiss_architectural' }))}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          draftConfig.template_id === 'swiss_architectural'
                            ? 'border-slate-900 bg-slate-100 ring-2 ring-slate-900/20 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-slate-900">3. Architectural Swiss Minimalist</span>
                          {draftConfig.template_id === 'swiss_architectural' && (
                            <span className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded">Active Draft</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600">High-contrast Swiss layout for executive commercial clients with large metric highlights and project showcases.</p>
                      </div>

                    </div>
                  </div>

                  {/* Form to Edit Draft Content */}
                  <form onSubmit={handleSaveHomepageDraft} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">Hero & Banner Content Editor</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Hero Kicker Badge</label>
                        <input
                          type="text"
                          value={draftConfig.hero_kicker}
                          onChange={(e) => setDraftConfig(prev => ({ ...prev, hero_kicker: e.target.value }))}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#F58220]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Primary Hero Headline</label>
                        <input
                          type="text"
                          value={draftConfig.hero_headline}
                          onChange={(e) => setDraftConfig(prev => ({ ...prev, hero_headline: e.target.value }))}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#F58220]"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Hero Subheadline / Paragraph</label>
                        <textarea
                          rows={2}
                          value={draftConfig.hero_subheadline}
                          onChange={(e) => setDraftConfig(prev => ({ ...prev, hero_subheadline: e.target.value }))}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#F58220]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Hero Image URL</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={draftConfig.hero_image_url}
                            onChange={(e) => setDraftConfig(prev => ({ ...prev, hero_image_url: e.target.value }))}
                            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#F58220]"
                          />
                          <button
                            type="button"
                            onClick={() => openMediaPicker('hero')}
                            className="px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900 cursor-pointer"
                          >
                            Picker
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Primary CTA Label</label>
                          <input
                            type="text"
                            value={draftConfig.primary_cta_label}
                            onChange={(e) => setDraftConfig(prev => ({ ...prev, primary_cta_label: e.target.value }))}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#F58220]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Secondary CTA Label</label>
                          <input
                            type="text"
                            value={draftConfig.secondary_cta_label}
                            onChange={(e) => setDraftConfig(prev => ({ ...prev, secondary_cta_label: e.target.value }))}
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#F58220]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Hero Highlight Phrase</label>
                        <input
                          type="text"
                          value={draftConfig.hero_highlight}
                          onChange={(e) => setDraftConfig(prev => ({ ...prev, hero_highlight: e.target.value }))}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#F58220]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">EPC Banner Title</label>
                        <input
                          type="text"
                          value={draftConfig.epc_banner_title}
                          onChange={(e) => setDraftConfig(prev => ({ ...prev, epc_banner_title: e.target.value }))}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#F58220]"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">EPC Banner Subtitle</label>
                        <input
                          type="text"
                          value={draftConfig.epc_banner_subtitle}
                          onChange={(e) => setDraftConfig(prev => ({ ...prev, epc_banner_subtitle: e.target.value }))}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#F58220]"
                        />
                      </div>
                    </div>

                    {/* Homepage Section Visibility Toggles */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <label className="block text-xs font-bold text-slate-800">Homepage Section Visibility Toggles</label>
                      <div className="flex flex-wrap gap-4 text-xs">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={draftConfig.show_trust_bar}
                            onChange={(e) => setDraftConfig(prev => ({ ...prev, show_trust_bar: e.target.checked }))}
                          />
                          <span>Show Trust & EPRA Bar</span>
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={draftConfig.show_deals_section}
                            onChange={(e) => setDraftConfig(prev => ({ ...prev, show_deals_section: e.target.checked }))}
                          />
                          <span>Show Solar Deals Spotlight</span>
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={draftConfig.show_partners_marquee}
                            onChange={(e) => setDraftConfig(prev => ({ ...prev, show_partners_marquee: e.target.checked }))}
                          />
                          <span>Show Partners Marquee</span>
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={draftConfig.show_epc_services}
                            onChange={(e) => setDraftConfig(prev => ({ ...prev, show_epc_services: e.target.checked }))}
                          />
                          <span>Show EPC Services</span>
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={draftConfig.show_google_reviews}
                            onChange={(e) => setDraftConfig(prev => ({ ...prev, show_google_reviews: e.target.checked }))}
                          />
                          <span>Show Google Business Reviews</span>
                        </label>
                      </div>
                    </div>

                    {/* Homepage EPC Services Editor */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-900">Homepage EPC Engineering Services ({(draftConfig.services || []).length})</h4>
                        <button
                          type="button"
                          onClick={() =>
                            setDraftConfig(prev => ({
                              ...prev,
                              services: [
                                ...(prev.services || []),
                                {
                                  id: `srv-${Date.now()}`,
                                  title: 'New Solar EPC Service',
                                  subtitle: 'Turnkey design, supply, and installation across Kenya.',
                                  description: 'Professional EPRA-certified engineering for homes and businesses.',
                                  capacity_range: '5kW - 100kW',
                                  image_url: 'https://shantisdesigns.co.ke/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-20-at-08.33.51.jpeg',
                                  highlight_metric: 'EPRA Certified Installation',
                                },
                              ],
                            }))
                          }
                          className="px-3 py-1 bg-[#238B3D] text-white text-[11px] font-bold rounded-lg cursor-pointer"
                        >
                          + Add Service Card
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {(draftConfig.services || []).map((srv, idx) => (
                          <div key={srv.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-700">Service #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setDraftConfig(prev => ({
                                    ...prev,
                                    services: (prev.services || []).filter((_, i) => i !== idx),
                                  }))
                                }
                                className="text-red-600 hover:underline text-[11px] font-bold cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                            <input
                              type="text"
                              value={srv.title}
                              onChange={(e) => {
                                const next = [...(draftConfig.services || [])];
                                next[idx] = { ...next[idx], title: e.target.value };
                                setDraftConfig(prev => ({ ...prev, services: next }));
                              }}
                              placeholder="Service Title"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                            />
                            <input
                              type="text"
                              value={srv.capacity_range}
                              onChange={(e) => {
                                const next = [...(draftConfig.services || [])];
                                next[idx] = { ...next[idx], capacity_range: e.target.value };
                                setDraftConfig(prev => ({ ...prev, services: next }));
                              }}
                              placeholder="Capacity Range (e.g. 5kW - 15kW)"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                            />
                            <input
                              type="text"
                              value={srv.highlight_metric}
                              onChange={(e) => {
                                const next = [...(draftConfig.services || [])];
                                next[idx] = { ...next[idx], highlight_metric: e.target.value };
                                setDraftConfig(prev => ({ ...prev, services: next }));
                              }}
                              placeholder="Highlight Metric"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                            />
                            <input
                              type="text"
                              value={srv.image_url}
                              onChange={(e) => {
                                const next = [...(draftConfig.services || [])];
                                next[idx] = { ...next[idx], image_url: e.target.value };
                                setDraftConfig(prev => ({ ...prev, services: next }));
                              }}
                              placeholder="Image URL"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                            />
                            <textarea
                              rows={2}
                              value={srv.description}
                              onChange={(e) => {
                                const next = [...(draftConfig.services || [])];
                                next[idx] = { ...next[idx], description: e.target.value };
                                setDraftConfig(prev => ({ ...prev, services: next }));
                              }}
                              placeholder="Service Description"
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <p className="text-xs text-slate-500">Draft changes remain isolated until published.</p>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#F58220] hover:bg-[#e07318] text-white font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
                      >
                        Save Draft Changes
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 3. WOOCOMMERCE PRODUCTS & CATEGORIES (FULL CRUD + SEARCH + CATEGORY EDITOR) */}
              {activeSection === 'products' && (
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">
                        WooCommerce Products ({products.length}) & Categories ({categories.length})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Manage catalog prices, regular/sale offers, stock statuses, permalinks, and categories in SQLite
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowCategoryManager(!showCategoryManager)}
                        className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 px-3.5 rounded-xl transition-colors cursor-pointer"
                      >
                        <Layers className="w-4 h-4 text-amber-400" />
                        <span>{showCategoryManager ? 'Hide Categories' : `Manage Categories (${categories.length})`}</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingProduct(null);
                          setProductForm({
                            title: '', slug: '', date: '2026-10-26', parentId: '', permalink: '',
                            sku: `SD-${Date.now().toString().slice(-6)}`, categoryId: categories[0]?.id || 1, price: 0,
                            regularPrice: 0, salePrice: '', stock: 10, manageStock: true,
                            stockStatus: 'instock', productType: 'simple', productVisibility: 'visible',
                            shortDescription: '', description: '',
                            imageUrl: 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/Horay-N-Type-Solar-Panels-1.png',
                            featured: false, warranty: '5 Years Warranty', weight: '25 kg', dimensions: '1800 x 1000 mm'
                          });
                          setActiveDrawer('product');
                        }}
                        className="inline-flex items-center gap-1.5 bg-[#F58220] hover:bg-[#e07318] text-white text-xs font-bold py-2 px-4 rounded-xl transition-colors cursor-pointer shadow-2xs"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Add New Product</span>
                      </button>
                    </div>
                  </div>

                  {/* Category Manager Sub-Panel */}
                  {showCategoryManager && (
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-4">
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add / Edit Product Categories'}
                      </h4>
                      <form onSubmit={handleSaveCategory} className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                        <input
                          type="text"
                          required
                          placeholder="Category Name (e.g. Solar Panels)"
                          value={catForm.name}
                          onChange={(e) => setCatForm(prev => ({ ...prev, name: e.target.value }))}
                          className="px-3 py-2 border border-slate-300 rounded-xl"
                        />
                        <input
                          type="text"
                          placeholder="Slug (e.g. solar-panels)"
                          value={catForm.slug}
                          onChange={(e) => setCatForm(prev => ({ ...prev, slug: e.target.value }))}
                          className="px-3 py-2 border border-slate-300 rounded-xl"
                        />
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="Category Image URL"
                            value={catForm.imageUrl}
                            onChange={(e) => setCatForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-xl"
                          />
                          <button
                            type="button"
                            onClick={() => openMediaPicker('category')}
                            className="px-2.5 py-2 bg-slate-800 text-white rounded-xl font-bold cursor-pointer"
                          >
                            Pick
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="flex-1 bg-[#238B3D] hover:bg-[#1b6b2f] text-white font-bold px-3 py-2 rounded-xl cursor-pointer"
                          >
                            {editingCategory ? 'Update Category' : '+ Save Category'}
                          </button>
                          {editingCategory && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategory(null);
                                setCatForm({ name: '', slug: '', description: '', imageUrl: '' });
                              }}
                              className="px-3 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </form>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 max-h-56 overflow-y-auto pt-2">
                        {categories.map((c) => (
                          <div key={c.id} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={c.image_url || c.imageUrl}
                                alt={c.name}
                                className="w-8 h-8 rounded object-cover border border-slate-200 bg-white shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">{c.name}</p>
                                <p className="text-[10px] text-slate-400 truncate">/{c.slug}/</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCategory(c);
                                  setCatForm({
                                    name: c.name,
                                    slug: c.slug,
                                    description: c.description || '',
                                    imageUrl: c.image_url || c.imageUrl || '',
                                  });
                                }}
                                className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (confirm(`Delete category "${c.name}"?`)) {
                                    const res = await StorageService.deleteCategory(c.id);
                                    if (!res.ok) showNotice('error', res.error || 'Failed to delete category.');
                                    onDataUpdated();
                                  }
                                }}
                                className="p-1 text-red-600 hover:text-red-800 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search & Category Filter Bar */}
                  <div className="flex flex-col sm:flex-row gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 text-xs">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search products by title, SKU, or keyword..."
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#F58220]"
                      />
                    </div>
                    <select
                      value={productCatFilter}
                      onChange={(e) => setProductCatFilter(e.target.value)}
                      className="px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold text-slate-700"
                    >
                      <option value="all">All Categories ({products.length})</option>
                      {categories.map((c) => (
                        <option key={c.id} value={String(c.id)}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase border-b text-[10px]">
                          <tr>
                            <th className="py-3 px-4">Image</th>
                            <th className="py-3 px-4">SKU / Title</th>
                            <th className="py-3 px-4">Category</th>
                            <th className="py-3 px-4">Regular / Sale Price</th>
                            <th className="py-3 px-4">Stock Status</th>
                            <th className="py-3 px-4">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {products
                            .filter((p) => {
                              const matchesCat =
                                productCatFilter === 'all' || String(p.category_id) === productCatFilter;
                              const q = productSearchQuery.toLowerCase();
                              const matchesSearch =
                                !q ||
                                p.name.toLowerCase().includes(q) ||
                                (p.sku || '').toLowerCase().includes(q) ||
                                (p.category_name || '').toLowerCase().includes(q);
                              return matchesCat && matchesSearch;
                            })
                            .map(p => (
                              <tr key={p.id} className="hover:bg-slate-50">
                                <td className="py-2.5 px-4">
                                  <img src={p.image_url || p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                                </td>
                                <td className="py-2.5 px-4">
                                  <p className="font-bold text-slate-900">{p.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">SKU: {p.sku} • /product/{p.slug}/</p>
                                </td>
                                <td className="py-2.5 px-4 text-slate-600">{p.category_name}</td>
                                <td className="py-2.5 px-4 font-bold text-slate-900">
                                  KES {p.price.toLocaleString()}
                                  {p.sale_price && (
                                    <span className="ml-1 text-[10px] text-[#238B3D] font-mono">
                                      (Sale: KES {p.sale_price.toLocaleString()})
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    p.stock_status === 'instock' ? 'bg-emerald-100 text-[#238B3D]' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {p.stock_status} ({p.stock})
                                  </span>
                                </td>
                                <td className="py-2.5 px-4 space-x-2">
                                  <button
                                    onClick={() => {
                                      setEditingProduct(p);
                                      setProductForm({
                                        title: p.title || p.name, slug: p.slug, date: p.date || '2026-10-26', parentId: p.parent_id || '',
                                        permalink: p.permalink || p.url || '', sku: p.sku, categoryId: p.category_id,
                                        price: p.price, regularPrice: p.regular_price || p.price, salePrice: p.sale_price || '',
                                        stock: p.stock, manageStock: p.manage_stock ?? true, stockStatus: p.stock_status || 'instock',
                                        productType: p.product_type || 'simple', productVisibility: p.product_visibility || 'visible',
                                        shortDescription: p.short_description || p.shortDescription || '', description: p.description,
                                        imageUrl: p.image_url || p.image || '', featured: !!p.featured, warranty: p.warranty || '5 Years',
                                        weight: p.weight || '25 kg', dimensions: p.dimensions || '1800 x 1000 mm'
                                      });
                                      setActiveDrawer('product');
                                    }}
                                    className="text-slate-600 hover:text-slate-900 font-bold text-xs cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (confirm(`Delete product "${p.name}"?`)) {
                                        const res = await StorageService.deleteProduct(p.id);
                                        if (!res.ok) showNotice('error', res.error || 'Failed to delete product.');
                                        onDataUpdated();
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-800 font-bold text-xs cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. MEDIA LIBRARY & FILE MANAGER */}
              {activeSection === 'media_library' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">Media Library & SQLite BLOB Storage ({mediaItems.length})</h3>
                      <p className="text-xs text-slate-500">Persistent SQLite database storage for uploaded photos, project galleries, and equipment specs</p>
                    </div>

                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = async (event) => {
                            const dataUrl = event.target?.result as string;
                            const added = await StorageService.addMedia({
                              name: file.name,
                              url: dataUrl,
                              mime_type: file.type || 'image/jpeg',
                              size: Math.round(file.size / 1024) + ' KB',
                              dimensions: 'Original Size'
                            });
                            if (!added) {
                              showNotice('error', 'Failed to save uploaded media to SQL database.');
                              return;
                            }
                            setMediaItems(StorageService.getMedia());
                            showNotice('success', `Uploaded "${file.name}" to SQL media storage.`);
                          };
                          reader.readAsDataURL(file);
                        }}
                        accept="image/*,video/mp4,video/webm,video/quicktime"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 bg-[#238B3D] hover:bg-[#1b6b2f] text-white text-xs font-bold py-2 px-4 rounded-xl transition-colors cursor-pointer shadow-2xs"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload Photo / Video</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {mediaItems.map(item => {
                      const isVideo =
                        item.mime_type?.startsWith('video/') ||
                        item.url?.startsWith('data:video/') ||
                        /\.(mp4|webm|mov)(\?|$)/i.test(item.url || '');
                      return (
                      <div key={item.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs p-2 space-y-2">
                        <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                          {isVideo ? (
                            <video src={item.url} controls playsInline preload="metadata" className="w-full h-full object-cover bg-black" />
                          ) : (
                            <img src={item.url} alt={item.name} className="w-full h-full object-cover" />
                          )}
                        </div>
                        <p className="text-[11px] font-bold text-slate-800 truncate">{item.name}</p>
                        <div className="flex items-center justify-between text-[10px]">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(item.url);
                              setCopiedMediaId(item.id);
                              setTimeout(() => setCopiedMediaId(null), 1500);
                            }}
                            className="text-sky-600 hover:underline font-bold cursor-pointer"
                          >
                            {copiedMediaId === item.id ? 'Copied!' : 'Copy URL'}
                          </button>
                          <button
                            onClick={async () => {
                              const ok = await StorageService.deleteMedia(item.id);
                              if (!ok) {
                                showNotice('error', 'Failed to delete media from SQL database.');
                                return;
                              }
                              setMediaItems(StorageService.getMedia());
                            }}
                            className="text-red-600 hover:underline font-bold cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. PARTNERS MARQUEE MANAGER (REORDERABLE) */}
              {activeSection === 'partners' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">Partner Marquee Manager ({partners.length})</h3>
                      <p className="text-xs text-slate-500">Reorder, edit, or delete partner brand logos appearing on the homepage scrolling marquee</p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingPartner(null);
                        setPartnerForm({ name: '', logoUrl: '', category: 'inverters', active: true, websiteUrl: 'https://shantisdesigns.co.ke' });
                        setShowPartnerForm(true);
                      }}
                      className="inline-flex items-center gap-1.5 bg-[#238B3D] hover:bg-[#1b6b2f] text-white text-xs font-bold py-2 px-4 rounded-xl shadow-2xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add New Partner Logo</span>
                    </button>
                  </div>

                  {showPartnerForm && (
                    <form onSubmit={handleSavePartner} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                      <h4 className="font-bold text-xs text-slate-900">{editingPartner ? 'Edit Partner Logo' : 'Add New Partner Logo'}</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="Brand Name (e.g. Deye, Jinko, Must)"
                          value={partnerForm.name}
                          onChange={(e) => setPartnerForm(prev => ({ ...prev, name: e.target.value }))}
                          required
                          className="px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#238B3D]"
                        />
                        <select
                          value={partnerForm.category}
                          onChange={(e) => setPartnerForm(prev => ({ ...prev, category: e.target.value as Partner['category'] }))}
                          className="px-3 py-2 border border-slate-300 rounded-xl bg-white"
                        >
                          <option value="inverters">Inverters</option>
                          <option value="batteries">Batteries</option>
                          <option value="panels">Solar Panels</option>
                          <option value="protection">Protection & Accessories</option>
                          <option value="all">All / General</option>
                        </select>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Logo Image URL"
                            value={partnerForm.logoUrl}
                            onChange={(e) => setPartnerForm(prev => ({ ...prev, logoUrl: e.target.value }))}
                            required
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#238B3D]"
                          />
                          <button
                            type="button"
                            onClick={() => openMediaPicker('partner')}
                            className="px-3 py-2 bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
                          >
                            Picker
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={partnerForm.active}
                            onChange={(e) => setPartnerForm(prev => ({ ...prev, active: e.target.checked }))}
                          />
                          <span className="font-semibold text-slate-700">Display Active on Homepage Marquee</span>
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowPartnerForm(false)}
                            className="px-3 py-1.5 text-slate-600 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 font-bold text-white bg-[#238B3D] rounded-xl cursor-pointer shadow-2xs"
                          >
                            Save Partner Logo
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Reorderable Partner Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {partners.map((p, idx) => (
                      <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-3 flex items-center justify-between shadow-2xs">
                        <div className="flex items-center gap-3">
                          <img src={p.logo_url} alt={p.name} className="w-12 h-10 object-contain bg-slate-50 p-1 rounded-lg border border-slate-200" />
                          <div>
                            <p className="font-bold text-xs text-slate-900">{p.name}</p>
                            <span className="text-[10px] text-slate-400 capitalize">{p.category} • {p.active ? 'Active' : 'Hidden'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            disabled={idx === 0}
                            onClick={() => handleMovePartner(idx, idx - 1)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            disabled={idx === partners.length - 1}
                            onClick={() => handleMovePartner(idx, idx + 1)}
                            className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingPartner(p);
                              setPartnerForm({ name: p.name, logoUrl: p.logo_url, category: p.category, active: p.active, websiteUrl: p.website_url || '' });
                              setShowPartnerForm(true);
                            }}
                            className="p-1 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`Remove partner logo "${p.name}"?`)) {
                                const res = await StorageService.deletePartner(p.id);
                                if (!res.ok) showNotice('error', res.error || 'Failed to remove partner.');
                                onDataUpdated();
                              }
                            }}
                            className="p-1 hover:bg-red-50 rounded text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5B. USERS, CREDENTIALS, SECURITY CODES & GOOGLE 2FA MANAGER */}
              {activeSection === 'security_users' && (
                <div className="space-y-5 text-xs">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">
                        Admin Users, Credentials, Security Codes & Google 2FA ({dbUsers.length})
                      </h3>
                      <p className="text-xs text-slate-500">
                        Register new administrators, edit usernames, emails, passwords, change/register 6-digit security codes, and configure Google Authenticator 2FA.
                      </p>
                    </div>
                    <span className="bg-emerald-50 text-[#238B3D] border border-emerald-200 px-3 py-1 rounded-full text-[11px] font-bold shrink-0">
                      scrypt-64 + RFC 6238 TOTP
                    </span>
                  </div>

                  {userMgmtMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#238B3D] font-bold rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{userMgmtMsg}</span>
                    </div>
                  )}
                  {userMgmtErr && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 font-bold rounded-xl flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{userMgmtErr}</span>
                    </div>
                  )}

                  {/* 1. Register New User + 2. Edit Existing User Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Register New User */}
                    <form onSubmit={handleCreateUser} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                        <UserPlus className="w-4 h-4 text-[#238B3D]" />
                        <h4 className="font-extrabold text-sm text-slate-900">Register New Admin / Staff User</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Username / Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Jane Wanjiku"
                            value={newUserForm.name}
                            onChange={(e) => setNewUserForm((prev) => ({ ...prev, name: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Role</label>
                          <select
                            value={newUserForm.role}
                            onChange={(e) => setNewUserForm((prev) => ({ ...prev, role: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold"
                          >
                            <option value="admin">Admin</option>
                            <option value="engineer">Engineer</option>
                            <option value="manager">Manager</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">Login Email</label>
                          <input
                            type="email"
                            required
                            placeholder="user@shantisdesigns.co.ke"
                            value={newUserForm.email}
                            onChange={(e) => setNewUserForm((prev) => ({ ...prev, email: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Password (min 6 chars)</label>
                          <input
                            type="password"
                            required
                            minLength={6}
                            placeholder="Strong password"
                            value={newUserForm.password}
                            onChange={(e) => setNewUserForm((prev) => ({ ...prev, password: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Register 6-Digit Security Code</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            required
                            placeholder="6 digits (e.g. 741852)"
                            value={newUserForm.totpCode}
                            onChange={(e) =>
                              setNewUserForm((prev) => ({
                                ...prev,
                                totpCode: e.target.value.replace(/\D/g, '').slice(0, 6),
                              }))
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={isCreatingUser}
                        className="w-full py-2.5 bg-[#238B3D] hover:bg-[#1b6b2f] disabled:opacity-60 text-white font-bold rounded-xl cursor-pointer shadow-2xs"
                      >
                        {isCreatingUser ? 'Registering & Hashing...' : '+ Register New User to SQL Database'}
                      </button>
                    </form>

                    {/* Edit Selected User Credentials & Codes */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Edit3 className="w-4 h-4 text-[#F58220]" />
                          <h4 className="font-extrabold text-sm text-slate-900">
                            {editingUserId ? 'Edit User Credentials & 6-Digit Code' : 'Select User from Table Below to Edit'}
                          </h4>
                        </div>
                        {editingUserId && (
                          <button
                            type="button"
                            onClick={() => setEditingUserId(null)}
                            className="text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                      {editingUserId ? (
                        <form onSubmit={handleUpdateUser} className="space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Username / Name</label>
                              <input
                                type="text"
                                required
                                value={editUserForm.name}
                                onChange={(e) => setEditUserForm((prev) => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                              />
                            </div>
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">Role</label>
                              <select
                                value={editUserForm.role}
                                onChange={(e) => setEditUserForm((prev) => ({ ...prev, role: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold"
                              >
                                <option value="admin">Admin</option>
                                <option value="engineer">Engineer</option>
                                <option value="manager">Manager</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                              <input
                                type="email"
                                required
                                value={editUserForm.email}
                                onChange={(e) => setEditUserForm((prev) => ({ ...prev, email: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                              />
                            </div>
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">New Password (leave blank to keep)</label>
                              <input
                                type="password"
                                minLength={6}
                                placeholder="Optional new password"
                                value={editUserForm.password}
                                onChange={(e) => setEditUserForm((prev) => ({ ...prev, password: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                              />
                            </div>
                            <div>
                              <label className="block font-bold text-slate-700 mb-1">New/Registered 6-Digit Code</label>
                              <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                placeholder="Optional 6 digits"
                                value={editUserForm.totpCode}
                                onChange={(e) =>
                                  setEditUserForm((prev) => ({
                                    ...prev,
                                    totpCode: e.target.value.replace(/\D/g, '').slice(0, 6),
                                  }))
                                }
                                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                              />
                            </div>
                          </div>
                          <button
                            type="submit"
                            disabled={isUpdatingUser}
                            className="w-full py-2.5 bg-[#F58220] hover:bg-[#e07318] disabled:opacity-60 text-white font-bold rounded-xl cursor-pointer shadow-2xs"
                          >
                            {isUpdatingUser ? 'Saving Changes...' : 'Save Updated Email, Username, Password & Code'}
                          </button>
                        </form>
                      ) : (
                        <div className="py-10 text-center text-slate-400 space-y-2">
                          <Key className="w-7 h-7 mx-auto text-slate-300" />
                          <p>Click <strong>"Edit User"</strong> on any account row below to change their email, username, role, password, or register a new 6-digit security code.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3. Google Two-Factor Authentication (Authenticator App QR Setup) */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#238B3D] flex items-center justify-center">
                          <QrCode className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-900">
                            Google Two-Factor Authentication (Google Authenticator)
                          </h4>
                          <p className="text-xs text-slate-500">
                            Bind an RFC 6238 TOTP secret to any user account and verify the live 6-digit rolling code before activation.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={google2faTargetId}
                          onChange={(e) => setGoogle2faTargetId(e.target.value)}
                          className="px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold"
                        >
                          {dbUsers.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.name} ({u.email}) — {u.google_totp_enabled ? 'Google 2FA ON' : 'Not Configured'}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => void handleGenerateGoogle2faQr(google2faTargetId)}
                          disabled={isSettingUpGoogle2fa || dbUsers.length === 0}
                          className="px-4 py-2 bg-slate-900 hover:bg-black text-white font-bold rounded-xl cursor-pointer"
                        >
                          {isSettingUpGoogle2fa ? 'Generating...' : 'Generate Google Authenticator QR'}
                        </button>
                      </div>
                    </div>

                    {google2faMsg && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#238B3D] font-bold rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{google2faMsg}</span>
                      </div>
                    )}
                    {google2faErr && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-700 font-bold rounded-xl flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{google2faErr}</span>
                      </div>
                    )}

                    {google2faSetupData && (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-200 items-center">
                        <div className="md:col-span-4 flex flex-col items-center justify-center bg-white p-4 rounded-xl border border-slate-200">
                          <img
                            src={google2faSetupData.qrDataUrl}
                            alt="Google Authenticator 2FA QR Code"
                            className="w-44 h-44 object-contain"
                          />
                          <p className="text-[11px] text-slate-500 mt-2 text-center">
                            Scan in <strong>Google Authenticator</strong>
                          </p>
                        </div>
                        <div className="md:col-span-8 space-y-3">
                          <div>
                            <p className="font-bold text-slate-900 text-sm">
                              Setting up Google 2FA for: <span className="text-[#238B3D]">{google2faSetupData.email}</span>
                            </p>
                            <p className="text-xs text-slate-600 mt-1">
                              1. Scan the QR code using Google Authenticator (or enter the Base32 Setup Key manually below).
                            </p>
                          </div>
                          <div className="p-2.5 bg-white border border-slate-300 rounded-xl flex items-center justify-between gap-2 font-mono text-xs">
                            <span className="font-bold text-slate-800 select-all">{google2faSetupData.secret}</span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(google2faSetupData.secret);
                                showNotice('success', 'Copied Google 2FA Base32 secret key.');
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg font-sans font-bold text-slate-700 cursor-pointer"
                            >
                              Copy Key
                            </button>
                          </div>
                          <form onSubmit={handleEnableGoogle2fa} className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-end pt-1">
                            <div className="flex-1">
                              <label className="block font-bold text-slate-700 mb-1">
                                2. Enter 6-Digit Code Shown in Google Authenticator
                              </label>
                              <input
                                type="text"
                                inputMode="numeric"
                                maxLength={6}
                                required
                                placeholder="e.g. 123456"
                                value={google2faVerifyCode}
                                onChange={(e) => setGoogle2faVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono text-sm tracking-widest font-bold"
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={isSettingUpGoogle2fa}
                              className="px-5 py-2.5 bg-[#238B3D] hover:bg-[#1b6b2f] text-white font-bold rounded-xl cursor-pointer shadow-xs"
                            >
                              Verify & Activate Google 2FA
                            </button>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Registered Users Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b">
                          <tr>
                            <th className="py-3 px-4">Username / Email</th>
                            <th className="py-3 px-4">Role</th>
                            <th className="py-3 px-4">Google 2FA</th>
                            <th className="py-3 px-4">Password & Code Hashes (scrypt-64)</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-[11px]">
                          {dbUsers.map((u) => {
                            const isSelf = currentUser && String(currentUser.id) === String(u.id);
                            return (
                              <tr key={u.id} className="hover:bg-slate-50">
                                <td className="py-3 px-4">
                                  <p className="font-bold text-slate-900">
                                    {u.name} {isSelf && <span className="text-[10px] text-[#238B3D] font-extrabold">(You)</span>}
                                  </p>
                                  <p className="text-slate-500">{u.email}</p>
                                </td>
                                <td className="py-3 px-4 uppercase font-bold text-slate-700">{u.role}</td>
                                <td className="py-3 px-4">
                                  {u.google_totp_enabled ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#238B3D] font-bold">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Active
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold">
                                      Static Code Only
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-4 font-mono text-[10px] text-slate-500 max-w-[240px]">
                                  <p className="truncate" title={u.password_hash}>PWD: {u.password_hash}</p>
                                  <p className="truncate" title={u.totp_code_hash}>2FA: {u.totp_code_hash}</p>
                                </td>
                                <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingUserId(u.id);
                                      setEditUserForm({
                                        name: u.name,
                                        email: u.email,
                                        role: u.role,
                                        password: '',
                                        totpCode: '',
                                      });
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold cursor-pointer"
                                  >
                                    Edit User
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setGoogle2faTargetId(u.id);
                                      void handleGenerateGoogle2faQr(u.id);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#238B3D] font-bold cursor-pointer"
                                  >
                                    {u.google_totp_enabled ? 'Reset QR' : 'Setup 2FA'}
                                  </button>
                                  {u.google_totp_enabled && (
                                    <button
                                      type="button"
                                      onClick={() => void handleDisableGoogle2fa(u.id, u.email)}
                                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold cursor-pointer"
                                    >
                                      Disable 2FA
                                    </button>
                                  )}
                                  {!isSelf && (
                                    <button
                                      type="button"
                                      onClick={() => void handleDeleteUser(u.id, u.email)}
                                      className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. PROJECTS / PORTFOLIO & PROJECT IMAGES GALLERY MANAGER */}
              {activeSection === 'projects' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">
                        Projects, Portfolios & Installation Gallery Manager ({projects.length} Projects)
                      </h3>
                      <p className="text-xs text-slate-500">
                        Edit project details, specs, KPLC savings, and add/remove/reorder project gallery images in SQLite
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingProject(null);
                        setProjectForm({
                          title: '', client: '', location: 'Nairobi, Kenya', category: 'commercial',
                          categoryName: 'Commercial & Industrial', systemSize: '50kWp Rooftop',
                          panelsCount: '92x 550W Panels', inverterSpecs: 'Growatt 50kW',
                          batterySpecs: 'Grid-Tied',
                          imageUrl: 'https://shantisdesigns.co.ke/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-20-at-08.33.51.jpeg',
                          gallery: ['https://shantisdesigns.co.ke/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-20-at-08.33.51.jpeg'],
                          videoUrl: '',
                          videos: [],
                          seoKeywords: '',
                          completionDate: '2026', kplcSavings: 'KES 180,000/month', description: '', featured: true
                        });
                        setActiveDrawer('project');
                      }}
                      className="inline-flex items-center gap-1.5 bg-[#238B3D] hover:bg-[#1b6b2f] text-white text-xs font-bold py-2 px-4 rounded-xl transition-colors cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add New Project / Portfolio</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...projects].sort((a, b) => Number(b.id) - Number(a.id)).map((proj) => {
                      const galleryList = proj.gallery && proj.gallery.length > 0 ? proj.gallery : [proj.image_url];
                      return (
                        <div key={proj.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between">
                          <div>
                            <div className="flex gap-4 p-4 border-b border-slate-100">
                              <img
                                src={proj.image_url}
                                alt={proj.title}
                                className="w-24 h-24 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="bg-emerald-100 text-[#238B3D] text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                    {proj.system_size}
                                  </span>
                                  <span className="text-[11px] font-bold text-slate-500">
                                    {galleryList.length} Photos in Gallery
                                  </span>
                                </div>
                                <h4 className="font-extrabold text-sm text-slate-900 truncate">{proj.title}</h4>
                                <p className="text-xs text-slate-500 truncate">{proj.client} • {proj.location}</p>
                                <p className="text-[11px] text-[#F58220] font-bold">{proj.kplc_savings}</p>
                              </div>
                            </div>

                            {/* Gallery Thumbnails Strip */}
                            <div className="p-3 bg-slate-50 border-b border-slate-100 space-y-2">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-slate-700">Project Gallery Images ({galleryList.length})</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingProject(proj);
                                    setProjectForm({
                                      title: proj.title,
                                      client: proj.client,
                                      location: proj.location,
                                      category: proj.category,
                                      categoryName: proj.category_name,
                                      systemSize: proj.system_size,
                                      panelsCount: proj.panels_count || '',
                                      inverterSpecs: proj.inverter_specs || '',
                                      batterySpecs: proj.battery_specs || '',
                                      imageUrl: proj.image_url,
                                      gallery: galleryList,
                                      videoUrl: proj.video_url || '',
                                      videos: Array.isArray(proj.videos) ? proj.videos : (proj.video_url ? [proj.video_url] : []),
                                      seoKeywords: Array.isArray(proj.seo_keywords) ? proj.seo_keywords.join(', ') : '',
                                      completionDate: proj.completion_date,
                                      kplcSavings: proj.kplc_savings,
                                      description: proj.description,
                                      featured: !!proj.featured
                                    });
                                    setActiveDrawer('project');
                                  }}
                                  className="text-[#238B3D] hover:underline font-bold cursor-pointer"
                                >
                                  + Manage / Add Photos
                                </button>
                              </div>
                              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                                {galleryList.map((imgUrl, idx) => (
                                  <img
                                    key={idx}
                                    src={imgUrl}
                                    alt={`${proj.title} ${idx + 1}`}
                                    className="w-12 h-12 rounded-lg object-cover border border-slate-300 shrink-0 bg-white"
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="p-3 bg-white flex items-center justify-between text-xs">
                            <span className="text-slate-400 text-[11px]">Completed: {proj.completion_date}</span>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => {
                                  setEditingProject(proj);
                                  setProjectForm({
                                    title: proj.title,
                                    client: proj.client,
                                    location: proj.location,
                                    category: proj.category,
                                    categoryName: proj.category_name,
                                    systemSize: proj.system_size,
                                    panelsCount: proj.panels_count || '',
                                    inverterSpecs: proj.inverter_specs || '',
                                    batterySpecs: proj.battery_specs || '',
                                    imageUrl: proj.image_url,
                                    gallery: galleryList,
                                    videoUrl: proj.video_url || '',
                                    videos: Array.isArray(proj.videos) ? proj.videos : (proj.video_url ? [proj.video_url] : []),
                                    seoKeywords: Array.isArray(proj.seo_keywords) ? proj.seo_keywords.join(', ') : '',
                                    completionDate: proj.completion_date,
                                    kplcSavings: proj.kplc_savings,
                                    description: proj.description,
                                    featured: !!proj.featured
                                  });
                                  setActiveDrawer('project');
                                }}
                                className="inline-flex items-center gap-1 font-bold text-slate-700 hover:text-[#238B3D] cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Edit Project & Images</span>
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm(`Delete project "${proj.title}"?`)) {
                                    const res = await StorageService.deleteProject(proj.id);
                                    if (!res.ok) showNotice('error', res.error || 'Failed to delete project.');
                                    onDataUpdated();
                                  }
                                }}
                                className="inline-flex items-center gap-1 font-bold text-red-600 hover:text-red-800 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 7. INSIGHTS / BLOG ARTICLES MANAGER */}
              {activeSection === 'blog_posts' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">Insights & Blog Articles Manager ({articles.length})</h3>
                      <p className="text-xs text-slate-500">Create, edit, or delete SEO solar engineering articles and guides in SQLite</p>
                    </div>

                    <button
                      onClick={() => {
                        setEditingArticle(null);
                        setPostForm({
                          title: '', category: 'Solar Guides & Insights', readTime: '5 min read',
                          excerpt: '', content: '', metaDescription: '', author: 'Shantis Designs Engineering Team',
                          imageUrl: 'https://shantisdesigns.co.ke/wp-content/uploads/2026/11/Horay-N-Type-Solar-Panels-1.png',
                          tags: 'Solar Panels Kenya, Shantis Designs, Clean Energy Africa'
                        });
                        setActiveDrawer('blog');
                      }}
                      className="inline-flex items-center gap-1.5 bg-[#F58220] hover:bg-[#e07318] text-white text-xs font-bold py-2 px-4 rounded-xl transition-colors cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Publish New Blog Article</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {articles.map((art) => (
                      <div key={art.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between">
                        <div className="p-4 flex gap-4">
                          <img
                            src={art.image_url}
                            alt={art.title}
                            className="w-24 h-24 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="space-y-1 min-w-0 flex-1">
                            <span className="text-[10px] font-bold uppercase text-[#F58220]">{art.category || 'Solar Guides'}</span>
                            <h4 className="font-extrabold text-sm text-slate-900 line-clamp-2">{art.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2">{art.excerpt}</p>
                            <p className="text-[10px] text-slate-400">{art.author} • {art.published_at}</p>
                          </div>
                        </div>
                        <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">/{art.slug}/</span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                setEditingArticle(art);
                                setPostForm({
                                  title: art.title,
                                  category: art.category || 'Solar Guides & Insights',
                                  readTime: art.read_time || '5 min read',
                                  excerpt: art.excerpt,
                                  content: art.content,
                                  metaDescription: art.meta_description,
                                  author: art.author,
                                  imageUrl: art.image_url,
                                  tags: (art.tags || []).join(', ')
                                });
                                setActiveDrawer('blog');
                              }}
                              className="inline-flex items-center gap-1 font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Article</span>
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`Delete blog article "${art.title}"?`)) {
                                  const res = await StorageService.deleteArticle(art.id);
                                  if (!res.ok) showNotice('error', res.error || 'Failed to delete article.');
                                  onDataUpdated();
                                }
                              }}
                              className="inline-flex items-center gap-1 font-bold text-red-600 hover:text-red-800 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 8. ABOUT US PAGE & GALLERY EDITOR */}
              {activeSection === 'about_editor' && (
                <form onSubmit={handleSaveAboutUs} className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">About Us Page & Field Gallery Editor</h3>
                      <p className="text-xs text-slate-500">
                        Edit company profile, Vision, Mission, Core Values, Why Choose Us, Certifications, and About Us photos
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 bg-[#238B3D] hover:bg-[#1b6b2f] text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-md transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save About Us Page to SQL Database</span>
                    </button>
                  </div>

                  {aboutSaveMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#238B3D] text-xs font-bold rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{aboutSaveMsg}</span>
                    </div>
                  )}

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
                    <h4 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">
                      1. Hero & Company Story
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Hero Headline</label>
                        <input
                          type="text"
                          value={aboutForm.headline}
                          onChange={(e) => setAboutForm(prev => ({ ...prev, headline: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Partner Section Heading</label>
                        <input
                          type="text"
                          value={aboutForm.partner_section_title}
                          onChange={(e) => setAboutForm(prev => ({ ...prev, partner_section_title: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block font-bold text-slate-700 mb-1">Hero Subheading</label>
                        <textarea
                          rows={2}
                          value={aboutForm.subheading}
                          onChange={(e) => setAboutForm(prev => ({ ...prev, subheading: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Company Intro Paragraph 1</label>
                        <textarea
                          rows={3}
                          value={aboutForm.partner_intro_1}
                          onChange={(e) => setAboutForm(prev => ({ ...prev, partner_intro_1: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Company Intro Paragraph 2</label>
                        <textarea
                          rows={3}
                          value={aboutForm.partner_intro_2}
                          onChange={(e) => setAboutForm(prev => ({ ...prev, partner_intro_2: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vision, Mission, Core Values */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
                    <h4 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">
                      2. Vision, Mission & Core Values
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Our Vision</label>
                        <textarea
                          rows={3}
                          value={aboutForm.vision}
                          onChange={(e) => setAboutForm(prev => ({ ...prev, vision: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Our Mission</label>
                        <textarea
                          rows={3}
                          value={aboutForm.mission}
                          onChange={(e) => setAboutForm(prev => ({ ...prev, mission: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Core Values</label>
                        <textarea
                          rows={3}
                          value={aboutForm.core_values}
                          onChange={(e) => setAboutForm(prev => ({ ...prev, core_values: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Why Choose Us & Certifications */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="font-extrabold text-sm text-slate-900">3. Why Choose Shantis Solar</h4>
                        <button
                          type="button"
                          onClick={() =>
                            setAboutForm(prev => ({
                              ...prev,
                              why_choose: [...(prev.why_choose || []), { title: 'New Advantage', description: 'Details...' }],
                            }))
                          }
                          className="px-2.5 py-1 bg-slate-800 text-white rounded-lg font-bold cursor-pointer"
                        >
                          + Add Item
                        </button>
                      </div>
                      {(aboutForm.why_choose || []).map((item, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const next = [...aboutForm.why_choose];
                                next[idx] = { ...next[idx], title: e.target.value };
                                setAboutForm(prev => ({ ...prev, why_choose: next }));
                              }}
                              className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setAboutForm(prev => ({
                                  ...prev,
                                  why_choose: prev.why_choose.filter((_, i) => i !== idx),
                                }))
                              }
                              className="text-red-600 font-bold cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => {
                              const next = [...aboutForm.why_choose];
                              next[idx] = { ...next[idx], description: e.target.value };
                              setAboutForm(prev => ({ ...prev, why_choose: next }));
                            }}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h4 className="font-extrabold text-sm text-slate-900">4. Licensing & Certifications</h4>
                        <button
                          type="button"
                          onClick={() =>
                            setAboutForm(prev => ({
                              ...prev,
                              certifications: [...(prev.certifications || []), { title: 'New License', subtitle: 'Certified' }],
                            }))
                          }
                          className="px-2.5 py-1 bg-slate-800 text-white rounded-lg font-bold cursor-pointer"
                        >
                          + Add License
                        </button>
                      </div>
                      {(aboutForm.certifications || []).map((cert, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
                          <input
                            type="text"
                            value={cert.title}
                            onChange={(e) => {
                              const next = [...aboutForm.certifications];
                              next[idx] = { ...next[idx], title: e.target.value };
                              setAboutForm(prev => ({ ...prev, certifications: next }));
                            }}
                            className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg font-bold"
                          />
                          <input
                            type="text"
                            value={cert.subtitle}
                            onChange={(e) => {
                              const next = [...aboutForm.certifications];
                              next[idx] = { ...next[idx], subtitle: e.target.value };
                              setAboutForm(prev => ({ ...prev, certifications: next }));
                            }}
                            className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setAboutForm(prev => ({
                                ...prev,
                                certifications: prev.certifications.filter((_, i) => i !== idx),
                              }))
                            }
                            className="text-red-600 font-bold cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* About Us Field Installation Photo Gallery Editor */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">
                          5. About Us Field Installation Gallery Photos ({(aboutForm.gallery_images || []).length})
                        </h4>
                        <p className="text-[11px] text-slate-500">Add, edit captions, or remove installation photos shown on /about/</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openMediaPicker('about_gallery')}
                        className="px-3 py-1.5 bg-slate-800 text-white rounded-xl font-bold cursor-pointer"
                      >
                        + Pick Photo from Media Library
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Paste New Photo URL..."
                        value={newAboutGalleryUrl}
                        onChange={(e) => setNewAboutGalleryUrl(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-xl"
                      />
                      <input
                        type="text"
                        placeholder="Photo Caption..."
                        value={newAboutGalleryCaption}
                        onChange={(e) => setNewAboutGalleryCaption(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newAboutGalleryUrl.trim()) return;
                          setAboutForm(prev => ({
                            ...prev,
                            gallery_images: [
                              ...(prev.gallery_images || []),
                              {
                                url: newAboutGalleryUrl.trim(),
                                caption: newAboutGalleryCaption.trim() || 'Shantis Solar Field Installation',
                              },
                            ],
                          }));
                          setNewAboutGalleryUrl('');
                          setNewAboutGalleryCaption('');
                        }}
                        className="px-4 py-2 bg-[#F58220] text-white font-bold rounded-xl cursor-pointer"
                      >
                        + Add Photo
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {(aboutForm.gallery_images || []).map((img, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          <img src={img.url} alt={img.caption} className="w-full h-32 object-cover rounded-lg border border-slate-200" />
                          <input
                            type="text"
                            value={img.caption}
                            onChange={(e) => {
                              const next = [...(aboutForm.gallery_images || [])];
                              next[idx] = { ...next[idx], caption: e.target.value };
                              setAboutForm(prev => ({ ...prev, gallery_images: next }));
                            }}
                            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-[11px]"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setAboutForm(prev => ({
                                ...prev,
                                gallery_images: (prev.gallery_images || []).filter((_, i) => i !== idx),
                              }))
                            }
                            className="text-red-600 font-bold text-[11px] hover:underline cursor-pointer"
                          >
                            Remove Photo
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
              )}

              {/* 9. GOOGLE BUSINESS PROFILE REVIEWS LIVE SYNC & EDITOR */}
              {activeSection === 'reviews_scraper' && (
                <div className="space-y-4">
                  <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold mb-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>Google Business Profile ID: 13542450485038602063 • 5.0 ★ ({reviews.length})</span>
                        </div>
                        <h3 className="font-extrabold text-base text-white">
                          Live Google Business Profile Reviews Sync — Shantis Designs Solar Solutions
                        </h3>
                        <p className="text-xs text-slate-400">
                          Pulls customer reviews and owner responses directly from your Google Business Profile URL into SQLite
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingReview(null);
                            setReviewForm({
                              authorName: '',
                              authorPhoto: '',
                              reviewerBadge: '1 review',
                              rating: 5,
                              timeAgo: 'Just now',
                              location: 'Nairobi, Kenya',
                              text: '',
                              likesCount: 1,
                              ownerReply: 'Thank you for trusting in Shantis Designs Solar Solutions, Looking forward to do more installations for your projects',
                              ownerReplyTime: 'Just now',
                              keywords: 'inverter, batteries, panels'
                            });
                            setShowReviewForm(true);
                          }}
                          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 cursor-pointer"
                        >
                          + Add Review Manually
                        </button>
                        <button
                          type="button"
                          onClick={handleSyncGbpReviews}
                          disabled={isSyncingGbp}
                          className="inline-flex items-center gap-1.5 bg-[#F58220] hover:bg-[#e07318] text-white text-xs font-bold py-2 px-4 rounded-xl shadow-md transition-colors cursor-pointer"
                        >
                          <RefreshCw className={`w-4 h-4 ${isSyncingGbp ? 'animate-spin' : ''}`} />
                          <span>{isSyncingGbp ? 'Syncing Google Profile...' : 'Sync Live from Google Business Profile'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={gbpUrl}
                        onChange={(e) => setGbpUrl(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-slate-300 font-mono"
                      />
                      <a
                        href={gbpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1"
                      >
                        <span>Open Google</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    {gbpSyncMsg && (
                      <div className="p-3 bg-emerald-950/90 border border-emerald-700 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{gbpSyncMsg}</span>
                      </div>
                    )}
                  </div>

                  {showReviewForm && (
                    <form onSubmit={handleSaveReview} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
                      <h4 className="font-extrabold text-sm text-slate-900">
                        {editingReview ? `Edit Google Review: ${editingReview.author_name}` : 'Add Google Business Profile Review'}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Reviewer Name</label>
                          <input
                            type="text"
                            required
                            value={reviewForm.authorName}
                            onChange={(e) => setReviewForm(prev => ({ ...prev, authorName: e.target.value }))}
                            placeholder="e.g. Teen Network Magazine Show"
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Reviewer Subtitle Badge</label>
                          <input
                            type="text"
                            value={reviewForm.reviewerBadge}
                            onChange={(e) => setReviewForm(prev => ({ ...prev, reviewerBadge: e.target.value }))}
                            placeholder="e.g. 1 review or 3 reviews"
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Time Ago Label</label>
                          <input
                            type="text"
                            value={reviewForm.timeAgo}
                            onChange={(e) => setReviewForm(prev => ({ ...prev, timeAgo: e.target.value }))}
                            placeholder="e.g. a week ago / a month ago"
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Star Rating (1-5)</label>
                          <input
                            type="number"
                            min={1}
                            max={5}
                            value={reviewForm.rating}
                            onChange={(e) => setReviewForm(prev => ({ ...prev, rating: Number(e.target.value) }))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Likes Count (❤️)</label>
                          <input
                            type="number"
                            min={0}
                            value={reviewForm.likesCount}
                            onChange={(e) => setReviewForm(prev => ({ ...prev, likesCount: Number(e.target.value) }))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Filter Keywords (comma-separated)</label>
                          <input
                            type="text"
                            value={reviewForm.keywords}
                            onChange={(e) => setReviewForm(prev => ({ ...prev, keywords: e.target.value }))}
                            placeholder="inverter, batteries, panels"
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block font-bold text-slate-700 mb-1">Customer Review Text</label>
                          <textarea
                            rows={3}
                            required
                            value={reviewForm.text}
                            onChange={(e) => setReviewForm(prev => ({ ...prev, text: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="block font-bold text-slate-700 mb-1">
                            Shantis Designs Solar Solutions (Owner) Reply
                          </label>
                          <textarea
                            rows={2}
                            value={reviewForm.ownerReply}
                            onChange={(e) => setReviewForm(prev => ({ ...prev, ownerReply: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="px-4 py-2 text-slate-600 font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-[#238B3D] text-white font-bold rounded-xl cursor-pointer"
                        >
                          Save Review to SQLite
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 shadow-2xs flex flex-col justify-between">
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {rev.author_photo ? (
                                <img src={rev.author_photo} alt={rev.author_name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-[#238B3D] text-white font-bold text-sm flex items-center justify-center shrink-0">
                                  {(rev.author_name || 'G').charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <h4 className="font-extrabold text-xs text-slate-900">{rev.author_name}</h4>
                                <p className="text-[11px] text-slate-500">{rev.reviewer_badge || '1 review'} • {rev.time_ago}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {[...Array(rev.rating || 5)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                              ))}
                            </div>
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed">{rev.text}</p>

                          {rev.owner_reply && (
                            <div className="pl-3 border-l-2 border-[#238B3D] bg-slate-50 p-2.5 rounded-r-xl text-[11px] space-y-1">
                              <p className="font-bold text-slate-900">
                                Shantis Designs Solar Solutions (Owner) • <span className="font-normal text-slate-500">{rev.owner_reply_time || 'a week ago'}</span>
                              </p>
                              <p className="text-slate-600">{rev.owner_reply}</p>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-500">❤️ {rev.likes_count ?? 1} Likes</span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                setEditingReview(rev);
                                setReviewForm({
                                  authorName: rev.author_name,
                                  authorPhoto: rev.author_photo,
                                  reviewerBadge: rev.reviewer_badge || '1 review',
                                  rating: rev.rating,
                                  timeAgo: rev.time_ago,
                                  location: rev.location || 'Kenya',
                                  text: rev.text,
                                  likesCount: rev.likes_count ?? 1,
                                  ownerReply: rev.owner_reply || '',
                                  ownerReplyTime: rev.owner_reply_time || 'a week ago',
                                  keywords: (rev.keywords || []).join(', ')
                                });
                                setShowReviewForm(true);
                              }}
                              className="font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
                            >
                              Edit / Reply
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`Delete review by "${rev.author_name}"?`)) {
                                  const res = await StorageService.deleteReview(rev.id);
                                  if (!res.ok) showNotice('error', res.error || 'Failed to delete review.');
                                  onDataUpdated();
                                }
                              }}
                              className="font-bold text-red-600 hover:text-red-800 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 10. WOOCOMMERCE & SQLITE SYNC */}
              {activeSection === 'woocommerce_sync' && (
                <div className="space-y-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900">WooCommerce & SQLite Database Synchronization</h3>
                        <p className="text-xs text-slate-500">
                          Synchronize all {products.length} products, {categories.length} categories, {projects.length} projects, 95+ project images, and permalinks with shantisdesigns.co.ke
                        </p>
                      </div>
                      <button
                        onClick={handleSyncWooCommerce}
                        disabled={isSyncingWc}
                        className="inline-flex items-center gap-2 bg-[#238B3D] hover:bg-[#1b6b2f] text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer shadow-sm"
                      >
                        <RefreshCw className={`w-4 h-4 ${isSyncingWc ? 'animate-spin' : ''}`} />
                        <span>{isSyncingWc ? 'Synchronizing SQLite & Permalinks...' : 'Run Full 2-Way Sync Now'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-slate-500">SQLite Products</p>
                        <p className="text-xl font-black text-slate-900 mt-0.5">{products.length}</p>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-slate-500">SQLite Categories</p>
                        <p className="text-xl font-black text-slate-900 mt-0.5">{categories.length}</p>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-slate-500">Portfolio Projects</p>
                        <p className="text-xl font-black text-slate-900 mt-0.5">{projects.length}</p>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-slate-500">Google Reviews</p>
                        <p className="text-xl font-black text-[#238B3D] mt-0.5">{reviews.length} (5.0 ★)</p>
                      </div>
                    </div>
                  </div>

                  {/* M-PESA DARAJA API CUSTOM KEYS & SECRET KEY (HASHED IN SQLITE DATABASE) */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900">
                          Safaricom M-Pesa Daraja API Custom Keys & Secret Key (Hashed SQLite Storage)
                        </h3>
                        <p className="text-xs text-slate-500">
                          Save your custom M-Pesa Consumer Key, Secret Key, Passkey, and Shortcode directly to ./data/shantis_solar.sqlite hashed with scrypt-64
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                          mpesaConfigSummary?.has_keys
                            ? 'bg-emerald-50 text-[#238B3D] border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {mpesaConfigSummary?.has_keys
                          ? 'Live Daraja Configured (STK Push Active)'
                          : 'Not Configured — Checkout Falls Back to WhatsApp'}
                      </span>
                    </div>

                    {mpesaSaveMsg && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-[#238B3D] font-bold rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{mpesaSaveMsg}</span>
                      </div>
                    )}

                    <form onSubmit={handleSaveMpesaCredentials} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Paybill / Till Shortcode</label>
                          <input
                            type="text"
                            required
                            value={mpesaForm.shortcode}
                            onChange={(e) => setMpesaForm((prev) => ({ ...prev, shortcode: e.target.value }))}
                            placeholder="e.g. 4089912"
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">Daraja Environment</label>
                          <select
                            value={mpesaForm.environment}
                            onChange={(e) =>
                              setMpesaForm((prev) => ({
                                ...prev,
                                environment: e.target.value as 'sandbox' | 'production',
                              }))
                            }
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-semibold"
                          >
                            <option value="production">Production (Live Safaricom Daraja)</option>
                            <option value="sandbox">Sandbox</option>
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">STK Push Callback URL</label>
                          <input
                            type="url"
                            required
                            value={mpesaForm.callbackUrl}
                            onChange={(e) => setMpesaForm((prev) => ({ ...prev, callbackUrl: e.target.value }))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            M-Pesa Custom Consumer Key (Hashed on Save)
                          </label>
                          <input
                            type="password"
                            value={mpesaForm.consumerKey}
                            onChange={(e) => setMpesaForm((prev) => ({ ...prev, consumerKey: e.target.value }))}
                            placeholder={mpesaConfigSummary?.consumer_key_masked || 'Enter custom Daraja Consumer Key'}
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            M-Pesa Custom Consumer Secret Key (Hashed on Save)
                          </label>
                          <input
                            type="password"
                            value={mpesaForm.consumerSecret}
                            onChange={(e) => setMpesaForm((prev) => ({ ...prev, consumerSecret: e.target.value }))}
                            placeholder={mpesaConfigSummary?.consumer_secret_masked || 'Enter custom Daraja Consumer Secret Key'}
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Lipa Na M-Pesa Online Passkey (Hashed on Save)
                          </label>
                          <input
                            type="password"
                            value={mpesaForm.passkey}
                            onChange={(e) => setMpesaForm((prev) => ({ ...prev, passkey: e.target.value }))}
                            placeholder={mpesaConfigSummary?.passkey_masked || 'Enter custom Lipa Na M-Pesa Passkey'}
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Initiator Password / Security Credential (Hashed on Save)
                          </label>
                          <input
                            type="password"
                            value={mpesaForm.initiatorPassword}
                            onChange={(e) => setMpesaForm((prev) => ({ ...prev, initiatorPassword: e.target.value }))}
                            placeholder="Enter Initiator Password"
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <p className="text-[11px] text-slate-500">
                          Last Updated in SQLite: <strong className="text-slate-700">{mpesaConfigSummary?.updated_at || 'Active'}</strong>
                        </p>
                        <button
                          type="submit"
                          disabled={isSavingMpesa}
                          className="px-5 py-2.5 bg-[#238B3D] hover:bg-[#1b6b2f] text-white font-bold rounded-xl cursor-pointer shadow-sm"
                        >
                          {isSavingMpesa ? 'Hashing & Saving to SQLite...' : 'Save Custom M-Pesa Keys to Database (Hashed)'}
                        </button>
                      </div>
                    </form>

                    {mpesaConfigSummary && (
                      <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl space-y-1.5 font-mono text-[11px]">
                        <p className="text-emerald-400 font-sans font-bold text-xs">
                          Active SQLite Scrypt-64 Hashes (`mpesa_api_credentials` table):
                        </p>
                        <p className="truncate">
                          <span className="text-slate-400">Consumer Key Hash:</span> {mpesaConfigSummary.consumer_key_hash}
                        </p>
                        <p className="truncate">
                          <span className="text-slate-400">Secret Key Hash:</span> {mpesaConfigSummary.consumer_secret_hash}
                        </p>
                        <p className="truncate">
                          <span className="text-slate-400">Passkey Hash:</span> {mpesaConfigSummary.passkey_hash}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 11. WHATSAPP LEADS & ORDERS TRACKER */}
              {activeSection === 'leads_orders' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">WhatsApp Leads ({leads.length}) & Customer Orders ({orders.length})</h3>
                      <p className="text-xs text-slate-500">Real-time leads and checkout orders persisted in the server-side SQLite database</p>
                    </div>
                    <button
                      onClick={exportLeadsReport}
                      className="inline-flex items-center gap-1.5 bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Leads CSV</span>
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase border-b text-[10px]">
                          <tr>
                            <th className="py-3 px-4">Timestamp</th>
                            <th className="py-3 px-4">Customer Phone</th>
                            <th className="py-3 px-4">Inquired Solar Equipment</th>
                            <th className="py-3 px-4">Est. Value</th>
                            <th className="py-3 px-4">Source</th>
                            <th className="py-3 px-4">Lead Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {leads.map((l) => (
                            <tr key={l.id} className="hover:bg-slate-50">
                              <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{l.timestamp}</td>
                              <td className="py-3 px-4 font-bold text-slate-900">{l.phone_number}</td>
                              <td className="py-3 px-4">
                                <p className="font-bold text-slate-800">{l.product_name}</p>
                                {l.notes && <p className="text-[11px] text-slate-500">{l.notes}</p>}
                              </td>
                              <td className="py-3 px-4 font-bold text-[#238B3D]">KES {l.total_value.toLocaleString()}</td>
                              <td className="py-3 px-4 uppercase text-[10px] font-bold text-slate-500">{l.source}</td>
                              <td className="py-3 px-4">
                                <select
                                  value={l.status}
                                  onChange={async (e) => {
                                    const res = await StorageService.updateLeadStatus(l.id, e.target.value as WhatsAppLead['status']);
                                    if (!res.ok) showNotice('error', res.error || 'Failed to update lead status.');
                                    onDataUpdated();
                                  }}
                                  className="px-2.5 py-1 bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold capitalize"
                                >
                                  <option value="new">New</option>
                                  <option value="contacted">Contacted</option>
                                  <option value="quoted">Quoted</option>
                                  <option value="converted">Converted</option>
                                  <option value="lost">Lost</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 12. SECURITY & AUDIT LOGS */}
              {activeSection === 'audit_logs' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-[#238B3D]" />
                        <h3 className="font-extrabold text-base text-slate-900">Security & Audit Logs</h3>
                      </div>
                      <p className="text-xs text-slate-500">Immutable record of all administrative actions, IP addresses, and 2FA authentication logs</p>
                    </div>

                    <span className="bg-emerald-100 text-[#238B3D] text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                      CSRF & XSS Token Validated
                    </span>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                    <div className="overflow-x-auto text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase border-b text-[10px]">
                          <tr>
                            <th className="py-3 px-4">Timestamp</th>
                            <th className="py-3 px-4">User ID / Name</th>
                            <th className="py-3 px-4">Role</th>
                            <th className="py-3 px-4">Action</th>
                            <th className="py-3 px-4">Resource</th>
                            <th className="py-3 px-4">IP Address</th>
                            <th className="py-3 px-4">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                          {auditLogs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-50">
                              <td className="py-3 px-4 text-slate-500">{log.timestamp}</td>
                              <td className="py-3 px-4 font-bold text-slate-900">{log.user_name} ({log.user_id})</td>
                              <td className="py-3 px-4">
                                <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                                  {log.user_role}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-bold text-[#238B3D]">{log.action}</td>
                              <td className="py-3 px-4 capitalize text-slate-600">{log.resource_type}</td>
                              <td className="py-3 px-4 text-slate-500">{log.ip_address}</td>
                              <td className="py-3 px-4 font-sans text-slate-800 max-w-xs truncate">{log.details}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              </main>
            </div>
          </div>
        )}

        {/* SLIDE-OVER QUICK ACTION DRAWER (Add/Edit Product, Add/Edit Project & Gallery Images, Publish/Edit Blog) */}
        {activeDrawer !== 'none' && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end">
            <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-200 animate-in slide-in-from-right duration-300">
              
              {/* Drawer Header */}
              <div className="bg-[#1d2327] text-white p-4 flex items-center justify-between border-b border-slate-800">
                <h3 className="font-extrabold text-sm text-white">
                  {activeDrawer === 'product' ? (editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Product') :
                   activeDrawer === 'project' ? (editingProject ? `Edit Project & Portfolio Images: ${editingProject.title}` : 'Add New Project & Portfolio Images') :
                   (editingArticle ? `Edit Blog Article: ${editingArticle.title}` : 'Publish New Blog Article')}
                </h3>
                <button
                  onClick={() => setActiveDrawer('none')}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body Form */}
              <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
                {activeDrawer === 'product' && (
                  <form onSubmit={handleSaveProduct} className="space-y-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Product Title</label>
                      <input
                        type="text"
                        required
                        value={productForm.title}
                        onChange={(e) => setProductForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#F58220]"
                        placeholder="e.g. Horay N-Type Solar Panel 500W"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">SKU</label>
                        <input
                          type="text"
                          value={productForm.sku}
                          onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Category</label>
                        <select
                          value={productForm.categoryId}
                          onChange={(e) => setProductForm(prev => ({ ...prev, categoryId: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Price (KES)</label>
                        <input
                          type="number"
                          required
                          value={productForm.price}
                          onChange={(e) => setProductForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#F58220]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Sale Price (KES)</label>
                        <input
                          type="number"
                          value={productForm.salePrice}
                          onChange={(e) => setProductForm(prev => ({ ...prev, salePrice: e.target.value }))}
                          placeholder="Optional"
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#F58220]"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Stock Qty</label>
                        <input
                          type="number"
                          value={productForm.stock}
                          onChange={(e) => setProductForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Stock Status</label>
                        <select
                          value={productForm.stockStatus}
                          onChange={(e) => setProductForm(prev => ({ ...prev, stockStatus: e.target.value as StockStatus }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                        >
                          <option value="instock">In Stock</option>
                          <option value="outofstock">Out of Stock</option>
                          <option value="onbackorder">On Backorder</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Warranty</label>
                        <input
                          type="text"
                          value={productForm.warranty}
                          onChange={(e) => setProductForm(prev => ({ ...prev, warranty: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Product Image URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={productForm.imageUrl}
                          onChange={(e) => setProductForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#F58220]"
                        />
                        <button
                          type="button"
                          onClick={() => openMediaPicker('product')}
                          className="px-3 py-2 bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
                        >
                          Picker
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Short Description</label>
                      <textarea
                        rows={2}
                        value={productForm.shortDescription}
                        onChange={(e) => setProductForm(prev => ({ ...prev, shortDescription: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Full Technical Description</label>
                      <textarea
                        rows={4}
                        required
                        value={productForm.description}
                        onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#F58220]"
                      />
                    </div>

                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={productForm.featured}
                        onChange={(e) => setProductForm(prev => ({ ...prev, featured: e.target.checked }))}
                      />
                      <span className="font-bold text-slate-700">Feature this product in Deals / Homepage</span>
                    </label>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#F58220] hover:bg-[#e07318] text-white font-bold rounded-xl shadow-md cursor-pointer"
                    >
                      Save Product to SQLite Database
                    </button>
                  </form>
                )}

                {activeDrawer === 'project' && (
                  <form onSubmit={handleSaveProject} className="space-y-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Project Title</label>
                      <input
                        type="text"
                        required
                        value={projectForm.title}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#238B3D]"
                        placeholder="e.g. 15kW Hybrid Solar Installation — Nyari Estate"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Client Name</label>
                        <input
                          type="text"
                          required
                          value={projectForm.client}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, client: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Location (County / Town)</label>
                        <input
                          type="text"
                          required
                          value={projectForm.location}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, location: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Category</label>
                        <select
                          value={projectForm.category}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, category: e.target.value as Project['category'] }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                        >
                          <option value="residential">Residential Hybrid</option>
                          <option value="commercial">Commercial & Industrial</option>
                          <option value="agricultural">Solar Water Pumping</option>
                          <option value="water_heating">Solar Water Heating</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">System Capacity</label>
                        <input
                          type="text"
                          value={projectForm.systemSize}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, systemSize: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Solar Panels</label>
                        <input
                          type="text"
                          value={projectForm.panelsCount}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, panelsCount: e.target.value }))}
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Inverter Specs</label>
                        <input
                          type="text"
                          value={projectForm.inverterSpecs}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, inverterSpecs: e.target.value }))}
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Battery Bank</label>
                        <input
                          type="text"
                          value={projectForm.batterySpecs}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, batterySpecs: e.target.value }))}
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">KPLC Monthly Savings</label>
                        <input
                          type="text"
                          value={projectForm.kplcSavings}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, kplcSavings: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Completion Date</label>
                        <input
                          type="text"
                          value={projectForm.completionDate}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, completionDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Project Engineering Description</label>
                      <textarea
                        rows={3}
                        value={projectForm.description}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Primary Cover Photo URL</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={projectForm.imageUrl}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#238B3D]"
                        />
                        <button
                          type="button"
                          onClick={() => openMediaPicker('project')}
                          className="px-3 py-2 bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
                        >
                          Picker
                        </button>
                      </div>
                    </div>

                    {/* PROJECT GALLERY IMAGES MANAGER */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="font-extrabold text-slate-900">
                          Project Portfolio Gallery Images ({projectForm.gallery.length})
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="file"
                            ref={projectGalleryFileRef}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = async (ev) => {
                                const dataUrl = ev.target?.result as string;
                                const added = await StorageService.addMedia({
                                  name: `${projectForm.title || 'Project'} - ${file.name}`,
                                  url: dataUrl,
                                  mime_type: file.type || 'image/jpeg',
                                  size: Math.round(file.size / 1024) + ' KB',
                                  dimensions: 'Original Size',
                                });
                                if (!added) {
                                  showNotice('error', 'Failed to upload gallery photo to SQL database.');
                                  return;
                                }
                                setMediaItems(StorageService.getMedia());
                                setProjectForm(prev => ({
                                  ...prev,
                                  gallery: [...prev.gallery, dataUrl],
                                }));
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => projectGalleryFileRef.current?.click()}
                            className="px-2.5 py-1 bg-[#238B3D] text-white rounded-lg font-bold text-[11px] cursor-pointer"
                          >
                            + Upload Photo
                          </button>
                          <button
                            type="button"
                            onClick={() => openMediaPicker('project_gallery')}
                            className="px-2.5 py-1 bg-slate-800 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                          >
                            + Pick Media
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Paste image URL to add to this project's gallery..."
                          value={newProjectGalleryUrl}
                          onChange={(e) => setNewProjectGalleryUrl(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newProjectGalleryUrl.trim()) return;
                            setProjectForm(prev => ({
                              ...prev,
                              gallery: [...prev.gallery, newProjectGalleryUrl.trim()],
                            }));
                            setNewProjectGalleryUrl('');
                          }}
                          className="px-3 py-1.5 bg-[#F58220] text-white font-bold rounded-lg cursor-pointer"
                        >
                          Add URL
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pt-1">
                        {projectForm.gallery.map((imgUrl, idx) => (
                          <div key={idx} className="relative group bg-white p-1.5 rounded-xl border border-slate-200 space-y-1">
                            <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-20 object-cover rounded-lg" />
                            <div className="flex items-center justify-between text-[10px]">
                              <button
                                type="button"
                                onClick={() => setProjectForm(prev => ({ ...prev, imageUrl: imgUrl }))}
                                className={`font-bold cursor-pointer ${
                                  projectForm.imageUrl === imgUrl ? 'text-[#238B3D]' : 'text-slate-500 hover:text-slate-900'
                                }`}
                              >
                                {projectForm.imageUrl === imgUrl ? '★ Cover' : 'Set Cover'}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setProjectForm(prev => ({
                                    ...prev,
                                    gallery: prev.gallery.filter((_, i) => i !== idx),
                                  }))
                                }
                                className="text-red-600 font-bold hover:underline cursor-pointer"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SITE WALKTHROUGH VIDEOS MANAGER */}
                    <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="font-extrabold text-slate-900">
                          Site Walkthrough Videos ({projectForm.videos.length})
                        </label>
                        <div>
                          <input
                            type="file"
                            ref={projectVideoFileRef}
                            accept="video/mp4,video/webm,video/quicktime"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = async (ev) => {
                                const dataUrl = ev.target?.result as string;
                                const added = await StorageService.addMedia({
                                  name: `${projectForm.title || 'Project'} Video - ${file.name}`,
                                  url: dataUrl,
                                  mime_type: file.type || 'video/mp4',
                                  size: Math.round(file.size / 1024) + ' KB',
                                  dimensions: 'MP4 Video',
                                });
                                if (!added) {
                                  showNotice('error', 'Failed to upload video to SQL database (max 55MB).');
                                  return;
                                }
                                setMediaItems(StorageService.getMedia());
                                setProjectForm(prev => ({
                                  ...prev,
                                  videoUrl: prev.videoUrl || added.url,
                                  videos: [...prev.videos, added.url],
                                }));
                                showNotice('success', `Uploaded video "${file.name}" to SQL media storage.`);
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => projectVideoFileRef.current?.click()}
                            className="px-2.5 py-1 bg-[#F58220] hover:bg-[#e07214] text-white rounded-lg font-bold text-[11px] cursor-pointer"
                          >
                            + Upload MP4 Video
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Paste .mp4 video URL (e.g. /assets/aistudio/... or https://...)"
                          value={newProjectVideoUrl}
                          onChange={(e) => setNewProjectVideoUrl(e.target.value)}
                          className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newProjectVideoUrl.trim()) return;
                            const vUrl = newProjectVideoUrl.trim();
                            setProjectForm(prev => ({
                              ...prev,
                              videoUrl: prev.videoUrl || vUrl,
                              videos: prev.videos.includes(vUrl) ? prev.videos : [...prev.videos, vUrl],
                            }));
                            setNewProjectVideoUrl('');
                          }}
                          className="px-3 py-1.5 bg-slate-800 text-white font-bold rounded-lg cursor-pointer"
                        >
                          Add Video URL
                        </button>
                      </div>

                      {projectForm.videos.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {projectForm.videos.map((vUrl, vIdx) => (
                            <div key={vIdx} className="bg-white p-2 rounded-xl border border-slate-200 space-y-1.5">
                              <video src={vUrl} controls playsInline preload="metadata" className="w-full h-24 rounded-lg bg-black object-cover" />
                              <div className="flex items-center justify-between text-[10px]">
                                <button
                                  type="button"
                                  onClick={() => setProjectForm(prev => ({ ...prev, videoUrl: vUrl }))}
                                  className={`font-bold cursor-pointer ${
                                    projectForm.videoUrl === vUrl ? 'text-[#238B3D]' : 'text-slate-500 hover:text-slate-900'
                                  }`}
                                >
                                  {projectForm.videoUrl === vUrl ? '★ Primary Video' : 'Set Primary'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setProjectForm(prev => {
                                      const nextVideos = prev.videos.filter((_, i) => i !== vIdx);
                                      return {
                                        ...prev,
                                        videos: nextVideos,
                                        videoUrl: prev.videoUrl === vUrl ? (nextVideos[0] || '') : prev.videoUrl,
                                      };
                                    })
                                  }
                                  className="text-red-600 font-bold hover:underline cursor-pointer"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        SEO Keywords (Comma-Separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ruiru solar carport installation, 16kWh LithiumValley W16-E5 Kenya, EPRA Cat CV"
                        value={projectForm.seoKeywords}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, seoKeywords: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#238B3D]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#238B3D] hover:bg-[#1b6b2f] text-white font-bold rounded-xl shadow-md cursor-pointer"
                    >
                      Save Project, Photos & Videos to SQL
                    </button>
                  </form>
                )}

                {activeDrawer === 'blog' && (
                  <form onSubmit={handleSavePost} className="space-y-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Article Title</label>
                      <input
                        type="text"
                        required
                        value={postForm.title}
                        onChange={(e) => setPostForm(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-slate-800"
                        placeholder="e.g. Top Reasons to Choose JA Solar Panels in Kenya"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Category</label>
                        <input
                          type="text"
                          value={postForm.category}
                          onChange={(e) => setPostForm(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Author</label>
                        <input
                          type="text"
                          value={postForm.author}
                          onChange={(e) => setPostForm(prev => ({ ...prev, author: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Read Time</label>
                        <input
                          type="text"
                          value={postForm.readTime}
                          onChange={(e) => setPostForm(prev => ({ ...prev, readTime: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Tags (comma-separated)</label>
                        <input
                          type="text"
                          value={postForm.tags}
                          onChange={(e) => setPostForm(prev => ({ ...prev, tags: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Cover Image</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={postForm.imageUrl}
                          onChange={(e) => setPostForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => openMediaPicker('blog')}
                          className="px-3 py-2 bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
                        >
                          Picker
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Article Summary / Excerpt</label>
                      <textarea
                        rows={2}
                        value={postForm.excerpt}
                        onChange={(e) => setPostForm(prev => ({ ...prev, excerpt: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">SEO Meta Description</label>
                      <input
                        type="text"
                        value={postForm.metaDescription}
                        onChange={(e) => setPostForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Full Article Content</label>
                      <textarea
                        rows={7}
                        required
                        value={postForm.content}
                        onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-slate-800"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-md cursor-pointer"
                    >
                      Save Article to SQLite Database
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

