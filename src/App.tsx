import React, { useState, useEffect, useCallback } from 'react';
import {
  Product,
  Category,
  Order,
  WhatsAppLead,
  Article,
  Partner,
  GoogleReview,
  CartItem,
  Project,
  AboutData,
  HomepageConfig,
} from './types';
import { StorageService } from './services/storage';
import { MapPin, ArrowRight, ShieldCheck, ServerCrash, RefreshCw } from 'lucide-react';

// Components
import { Header, NavPage } from './components/Header';
import { Hero } from './components/Hero';
import { TrustBar } from './components/TrustBar';
import { CategoriesGrid } from './components/CategoriesGrid';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetailModal } from './components/ProductDetailModal';
import { PartnersMarquee } from './components/PartnersMarquee';
import { EpcServices } from './components/EpcServices';
import { GoogleReviewsSection } from './components/GoogleReviewsSection';
import { CartDrawer } from './components/CartDrawer';
import { WishlistDrawer } from './components/WishlistDrawer';
import { ComparisonBar } from './components/ComparisonBar';
import { ComparisonModal } from './components/ComparisonModal';
import { CheckoutModal } from './components/CheckoutModal';
import { QuoteModal } from './components/QuoteModal';
import { AdminDashboard } from './components/AdminDashboard';
import { SitemapModal } from './components/SitemapModal';
import { Footer } from './components/Footer';
import { SeoSchema } from './components/SeoSchema';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { MobileStorefrontView } from './components/MobileStorefrontView';

// Dedicated Sub-Pages
import { ShopPage } from './components/pages/ShopPage';
import { ProductSinglePage } from './components/pages/ProductSinglePage';
import { ProjectsPage } from './components/pages/ProjectsPage';
import { InsightsPage } from './components/pages/InsightsPage';
import { AboutUsPage } from './components/pages/AboutUsPage';
import { ContactPage } from './components/pages/ContactPage';
import { OrderTrackingPage } from './components/pages/OrderTrackingPage';
import { KenyaSeoHubPage } from './components/pages/KenyaSeoHubPage';
import { LegalPage } from './components/pages/LegalPage';

export default function App() {
  // Navigation Page State
  const [currentPage, setCurrentPage] = useState<NavPage>('home');
  const [backendOffline, setBackendOffline] = useState<boolean>(false);

  // Application Data States (Populated from Node.js SQLite Server)
  const [products, setProducts] = useState<Product[]>(() => StorageService.getProducts());
  const [categories, setCategories] = useState<Category[]>(() => StorageService.getCategories());
  const [orders, setOrders] = useState<Order[]>(() => StorageService.getOrders());
  const [leads, setLeads] = useState<WhatsAppLead[]>(() => StorageService.getLeads());
  const [articles, setArticles] = useState<Article[]>(() => StorageService.getArticles());
  const [partners, setPartners] = useState<Partner[]>(() => StorageService.getPartners());
  const [reviews, setReviews] = useState<GoogleReview[]>(() => StorageService.getReviews());
  const [projects, setProjects] = useState<Project[]>(() => StorageService.getProjects());
  const [aboutData, setAboutData] = useState<AboutData>(() => StorageService.getAboutData());
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig>(
    () => StorageService.getHomepageConfig().published
  );

  // Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('shantis_cart_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist State (persisted to localStorage)
  const [wishlistIds, setWishlistIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('shantis_wishlist_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Product Specification Comparison State (up to 3 items)
  const [comparisonIds, setComparisonIds] = useState<number[]>([]);

  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string | null>(null);
  const [selectedArticleSlug, setSelectedArticleSlug] = useState<string | null>(null);
  // Dedicated Individual Product Page state (/product/[slug]/)
  const [activeProductPage, setActiveProductPage] = useState<Product | null>(null);
  // Quick-View Modal Product state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quoteProduct, setQuoteProduct] = useState<Product | null>(null);

  // Modal Open Toggles
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isSitemapOpen, setIsSitemapOpen] = useState(false);

  // Synchronize URL pathname with WooCommerce route structure
  const syncFromLocation = useCallback((path: string, currentProducts: Product[]) => {
    const cleanPath = path.replace(/\/+$/, '') || '/';
    if (cleanPath === '/' || cleanPath === '') {
      setCurrentPage('home');
      setSelectedCategorySlug(null);
      return;
    }
    if (cleanPath === '/shop') {
      setCurrentPage('shop');
      setSelectedCategorySlug(null);
      return;
    }
    if (cleanPath.startsWith('/product-category/')) {
      const parts = cleanPath.replace('/product-category/', '').split('/').filter(Boolean);
      const slug = parts[parts.length - 1] || null;
      setSelectedCategorySlug(slug);
      setCurrentPage('shop');
      return;
    }
    if (cleanPath.startsWith('/product/') || cleanPath.startsWith('/shop/')) {
      const slug = cleanPath.replace(/^\/(product|shop)\//, '').split('/')[0];
      const found = currentProducts.find(p => p.slug.toLowerCase() === slug.toLowerCase());
      if (found) {
        setActiveProductPage(found);
        setCurrentPage('product');
        return;
      }
    }
    if (cleanPath === '/projects' || cleanPath.startsWith('/portfolio/')) {
      const pSlug = cleanPath.startsWith('/portfolio/')
        ? cleanPath.replace('/portfolio/', '').split('/')[0] || null
        : null;
      setSelectedProjectSlug(pSlug);
      setCurrentPage('projects');
      return;
    }
    if (cleanPath === '/about' || cleanPath === '/about-us') {
      setCurrentPage('about');
      return;
    }
    if (cleanPath === '/contact-2' || cleanPath === '/contact') {
      setCurrentPage('contact');
      return;
    }
    if (cleanPath === '/order-tracking') {
      setCurrentPage('order-tracking');
      return;
    }
    if (cleanPath === '/blog' || cleanPath.startsWith('/blog/') || cleanPath === '/insights') {
      const bSlug = cleanPath.startsWith('/blog/')
        ? cleanPath.replace('/blog/', '').split('/')[0] || null
        : null;
      setSelectedArticleSlug(bSlug);
      setCurrentPage('insights');
      return;
    }
    if (cleanPath === '/solar-installation-kenya' || cleanPath === '/kenya-solar-hubs') {
      setCurrentPage('kenya-seo');
      return;
    }
    if (cleanPath === '/terms-and-conditions' || cleanPath === '/terms') {
      setCurrentPage('terms');
      return;
    }
    if (cleanPath === '/privacy-policy' || cleanPath === '/privacy') {
      setCurrentPage('privacy');
      return;
    }
  }, []);

  // Load persistent application state from Node.js SQLite server (no client fallback demo data)
  const reloadData = useCallback(async () => {
    try {
      const sqlData = await StorageService.bootstrapFromSql();
      setBackendOffline(false);
      setProducts(sqlData.products);
      setCategories(sqlData.categories);
      setOrders(sqlData.orders);
      setLeads(sqlData.leads);
      setArticles(sqlData.articles);
      setPartners(sqlData.partners);
      setReviews(sqlData.reviews);
      setProjects(sqlData.projects);
      setAboutData(sqlData.aboutData);
      if (sqlData.homepageConfig && sqlData.homepageConfig.hero_headline) {
        setHomepageConfig(sqlData.homepageConfig);
      }
      syncFromLocation(window.location.pathname, sqlData.products);
    } catch {
      setBackendOffline(true);
    }
  }, [syncFromLocation]);

  useEffect(() => {
    reloadData();

    const onPopState = () => {
      syncFromLocation(window.location.pathname, StorageService.getProducts());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [reloadData, syncFromLocation]);

  // Helper to push clean WooCommerce URLs to history
  const pushUrl = (url: string) => {
    try {
      if (window.location.pathname !== url) {
        window.history.pushState({}, '', url);
      }
    } catch {
      // Ignore history push errors in restricted sandboxes
    }
  };

  // Navigate to a top-level page
  const handleNavigatePage = (page: NavPage) => {
    setCurrentPage(page);
    if (page === 'home') {
      setSelectedCategorySlug(null);
      setSelectedProjectSlug(null);
      setSelectedArticleSlug(null);
      pushUrl('/');
    } else if (page === 'shop') {
      pushUrl(selectedCategorySlug ? `/product-category/${selectedCategorySlug}/` : '/shop/');
    } else if (page === 'projects') {
      setSelectedProjectSlug(null);
      pushUrl('/projects/');
    } else if (page === 'about') {
      pushUrl('/about/');
    } else if (page === 'contact') {
      pushUrl('/contact-2/');
    } else if (page === 'order-tracking') {
      pushUrl('/order-tracking/');
    } else if (page === 'insights') {
      setSelectedArticleSlug(null);
      pushUrl('/blog/');
    } else if (page === 'kenya-seo') {
      pushUrl('/solar-installation-kenya/');
    } else if (page === 'terms') {
      pushUrl('/terms-and-conditions/');
    } else if (page === 'privacy') {
      pushUrl('/privacy-policy/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to a WooCommerce Category Archive (/product-category/[slug]/)
  const handleOpenCategoryArchive = (slug: string | null) => {
    setSelectedCategorySlug(slug);
    setCurrentPage('shop');
    pushUrl(slug ? `/product-category/${slug}/` : '/shop/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to an Individual Product Page (/product/[slug]/)
  const handleOpenProductPage = (product: Product) => {
    setActiveProductPage(product);
    setQuickViewProduct(null);
    setCurrentPage('product');
    pushUrl(`/product/${product.slug}/`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shantis_cart_v2', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Save wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shantis_wishlist_v1', JSON.stringify(wishlistIds));
    } catch (e) {
      console.error(e);
    }
  }, [wishlistIds]);

  // Wishlist Actions
  const handleToggleWishlist = (productId: number) => {
    setWishlistIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  // Comparison Actions (max 3 items, replaces oldest if full)
  const handleToggleComparison = (productId: number) => {
    setComparisonIds(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), productId];
      }
      return [...prev, productId];
    });
  };

  const handleClearComparison = () => {
    setComparisonIds([]);
  };

  // Cart Operations
  const handleAddToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { product, quantity }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: number, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleOpenQuoteForProduct = (product: Product) => {
    setQuoteProduct(product);
    setIsQuoteOpen(true);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistProducts = products.filter(p => wishlistIds.includes(p.id));
  const comparisonProducts = products.filter(p => comparisonIds.includes(p.id));

  // STRICT NODE.JS + SQLITE LIVE MODE GATE (No Fallback Demo Data if Node.js Server is Stopped)
  if (backendOffline) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
            <ServerCrash className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white">
            Node.js + SQLite Database Server Required
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Shantis Designs Solar Solutions runs in strict live SQL mode with zero client-side fallback demo data. Please ensure the Node.js Express + SQLite server (<code className="text-amber-400">tsx server.ts</code>) is running on port 3000.
          </p>
          <button
            onClick={reloadData}
            className="inline-flex items-center gap-2 bg-[#F58220] hover:bg-[#e07214] text-white font-black text-xs sm:text-sm px-6 py-3 rounded-xl cursor-pointer transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reconnect to SQL Database</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip flex flex-col bg-slate-50 pb-16 lg:pb-0 selection:bg-[#F58220] selection:text-white">
      {/* Dynamic SEO JSON-LD Schema & Meta Manager */}
      <SeoSchema
        products={products}
        articles={articles}
        projects={projects}
        categories={categories}
        currentPage={currentPage}
        activeProduct={activeProductPage}
        activeArticle={
          selectedArticleSlug
            ? articles.find(a => a.slug.toLowerCase() === selectedArticleSlug.toLowerCase()) || null
            : null
        }
        activeProject={
          selectedProjectSlug
            ? projects.find(p => p.slug.toLowerCase() === selectedProjectSlug.toLowerCase()) || null
            : null
        }
        selectedCategorySlug={selectedCategorySlug}
      />

      {/* Main Global Header with Navigation */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigatePage}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        wishlistCount={wishlistIds.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        comparisonCount={comparisonIds.length}
        onOpenComparison={() => setIsComparisonModalOpen(true)}
        onOpenQuote={() => {
          setQuoteProduct(null);
          setIsQuoteOpen(true);
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onSelectCategory={slug => handleOpenCategoryArchive(slug)}
        products={products}
        categories={categories}
        onSelectProduct={handleOpenProductPage}
      />

      {/* Mobile Storefront Suite + 3-Screen Mobile App Showcase + Bottom Tab Bar */}
      <MobileStorefrontView
        products={products}
        categories={categories}
        cart={cart}
        wishlistIds={wishlistIds}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onUpdateCartQuantity={handleUpdateCartQuantity}
        onRemoveFromCart={handleRemoveFromCart}
        onSelectProduct={handleOpenProductPage}
        onSelectCategory={slug => handleOpenCategoryArchive(slug)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        currentPage={currentPage}
        onNavigatePage={handleNavigatePage}
      />

      <main className="flex-1">
        {/* VIEW 1: HOME PAGE (/) */}
        {currentPage === 'home' && (
          <>
            {/* 1. Authentic 5-Card Promotional Hero Grid */}
            <Hero
              config={homepageConfig}
              onExploreProducts={() => handleOpenCategoryArchive(null)}
              onSelectCategory={slug => handleOpenCategoryArchive(slug)}
              onOpenQuote={() => {
                setQuoteProduct(null);
                setIsQuoteOpen(true);
              }}
            />

            {/* 2. Authentic "SHANTIS DESIGNS SOLAR CATEGORIES" Orange Ribbon & Category Cards */}
            <CategoriesGrid
              categories={categories}
              products={products}
              onSelectCategory={slug => handleOpenCategoryArchive(slug)}
              selectedCategorySlug={selectedCategorySlug}
            />

            {/* 3. Authentic 4 Showcases (Solar Panels, Doyin Pumps, EcoFlow, Inverters) & WooCommerce Tags */}
            <ProductCatalog
              products={products}
              categories={categories}
              selectedCategorySlug={selectedCategorySlug}
              onSelectCategory={slug => handleOpenCategoryArchive(slug)}
              onAddToCart={product => handleAddToCart(product, 1)}
              onRequestQuote={handleOpenQuoteForProduct}
              onSelectProduct={handleOpenProductPage}
              onQuickViewProduct={product => setQuickViewProduct(product)}
              wishlistIds={wishlistIds}
              onToggleWishlist={handleToggleWishlist}
              comparisonIds={comparisonIds}
              onToggleComparison={handleToggleComparison}
            />

            {/* 4. EPRA & NCA Trust Bar */}
            <TrustBar />

            {/* 5. Scrolling Partner Logos Marquee */}
            <PartnersMarquee partners={partners} />

            {/* 6. Commercial & Residential EPC Services Banner */}
            <EpcServices
              onOpenQuote={() => {
                setQuoteProduct(null);
                setIsQuoteOpen(true);
              }}
            />

            {/* 7. Nationwide Kenya Regional Solar SEO Hub Banner (Nairobi, Meru, Mombasa, Kisumu, Nakuru, Isiolo, Machakos) */}
            <section className="py-12 bg-white border-t border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="max-w-3xl">
                    <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#238B3D] tracking-wider">
                      <ShieldCheck className="w-4 h-4 text-[#238B3D]" />
                      <span>Nationwide EPRA Solar Delivery & Installation</span>
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                      Solar Panels, Lithium Batteries, Power Backups & Borehole Pumps Across Kenya
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                      Whether you are building a hybrid home backup system in <strong>Nairobi</strong>, solarizing a deep borehole in <strong>Meru, Machakos, or Isiolo</strong>, cutting coastal AC power tariffs in <strong>Mombasa</strong>, or installing off-grid lithium storage in <strong>Kisumu and Nakuru</strong>, Shantis Designs delivers genuine Tier-1 solar hardware to all 47 counties.
                    </p>
                  </div>
                  <button
                    onClick={() => handleNavigatePage('kenya-seo')}
                    className="inline-flex items-center gap-2 bg-[#F58220] hover:bg-[#e07214] text-white text-xs sm:text-sm font-black px-5 py-3 rounded-xl shadow-sm transition-colors cursor-pointer shrink-0"
                  >
                    <span>Explore All County Solar Guides</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                  {[
                    { city: 'Nairobi', desc: 'Same-Day Dispatch & EPC' },
                    { city: 'Meru', desc: 'Borehole Pumps & Home Kits' },
                    { city: 'Mombasa', desc: 'Coastal AC Hybrid Solar' },
                    { city: 'Kisumu', desc: 'Lake Basin Backup Systems' },
                    { city: 'Nakuru', desc: 'Off-Grid & Water Heating' },
                    { city: 'Isiolo', desc: 'Deep-Well ASAL Solar Pumps' },
                    { city: 'Machakos', desc: 'Irrigation & Villa Backup' },
                  ].map(hub => (
                    <button
                      key={hub.city}
                      onClick={() => handleNavigatePage('kenya-seo')}
                      className="bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-[#238B3D] p-3.5 rounded-2xl text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 group-hover:text-[#238B3D]">
                        <MapPin className="w-3.5 h-3.5 text-[#F58220] shrink-0" />
                        <span>Solar in {hub.city}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{hub.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* 8. Google Business Reviews Testimonials Section */}
            <GoogleReviewsSection reviews={reviews} />
          </>
        )}

        {/* VIEW 2: SHOP CATALOG & CATEGORY ARCHIVES (/shop/ and /product-category/[slug]/) */}
        {currentPage === 'shop' && (
          <ShopPage
            products={products}
            categories={categories}
            selectedCategorySlug={selectedCategorySlug}
            onSelectCategory={slug => handleOpenCategoryArchive(slug)}
            onAddToCart={product => handleAddToCart(product, 1)}
            onRequestQuote={handleOpenQuoteForProduct}
            onSelectProduct={handleOpenProductPage}
            onQuickViewProduct={product => setQuickViewProduct(product)}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            comparisonIds={comparisonIds}
            onToggleComparison={handleToggleComparison}
          />
        )}

        {/* VIEW 3: INDIVIDUAL PRODUCT PAGE (/product/[slug]/) */}
        {currentPage === 'product' && activeProductPage && (
          <ProductSinglePage
            product={activeProductPage}
            allProducts={products}
            categories={categories}
            onBackToShop={() => handleOpenCategoryArchive(selectedCategorySlug)}
            onSelectCategory={slug => handleOpenCategoryArchive(slug)}
            onSelectTag={tag => {
              const clean = tag
                .toLowerCase()
                .replace(/&/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
              handleOpenCategoryArchive(clean);
            }}
            onSelectProduct={handleOpenProductPage}
            onQuickViewProduct={product => setQuickViewProduct(product)}
            onAddToCart={(product, qty) => handleAddToCart(product, qty)}
            onRequestQuote={handleOpenQuoteForProduct}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
            comparisonIds={comparisonIds}
            onToggleComparison={handleToggleComparison}
          />
        )}

        {/* VIEW 4: DEDICATED PROJECTS PAGE (/projects/) */}
        {currentPage === 'projects' && (
          <ProjectsPage
            projects={projects}
            activeProjectSlug={selectedProjectSlug}
            onSelectProjectSlug={slug => {
              setSelectedProjectSlug(slug);
              pushUrl(slug ? `/portfolio/${slug}/` : '/projects/');
            }}
            onRequestQuote={() => {
              setQuoteProduct(null);
              setIsQuoteOpen(true);
            }}
          />
        )}

        {/* VIEW 5: INSIGHTS & BLOG PAGE (/blog/) */}
        {currentPage === 'insights' && (
          <InsightsPage
            articles={articles}
            activeArticleSlug={selectedArticleSlug}
            onSelectArticleSlug={slug => {
              setSelectedArticleSlug(slug);
              pushUrl(slug ? `/blog/${slug}/` : '/blog/');
            }}
          />
        )}

        {/* VIEW 6: ABOUT US PAGE (/about/) */}
        {currentPage === 'about' && (
          <AboutUsPage
            data={aboutData}
            onOpenQuote={() => {
              setQuoteProduct(null);
              setIsQuoteOpen(true);
            }}
          />
        )}

        {/* VIEW 7: CONTACT US PAGE (/contact-2/) */}
        {currentPage === 'contact' && <ContactPage onLeadSubmitted={reloadData} />}

        {/* VIEW 8: ORDER TRACKING PAGE (/order-tracking/) */}
        {currentPage === 'order-tracking' && (
          <OrderTrackingPage
            orders={orders}
            onExploreShop={() => handleOpenCategoryArchive(null)}
          />
        )}

        {/* VIEW 9: KENYA REGIONAL SOLAR SEO HUB (/solar-installation-kenya/) */}
        {currentPage === 'kenya-seo' && (
          <KenyaSeoHubPage
            products={products}
            categories={categories}
            onSelectCategory={slug => handleOpenCategoryArchive(slug)}
            onSelectProduct={handleOpenProductPage}
            onRequestQuote={() => {
              setQuoteProduct(null);
              setIsQuoteOpen(true);
            }}
          />
        )}

        {/* VIEW 10: LEGAL PAGES (/terms-and-conditions/ & /privacy-policy/) */}
        {(currentPage === 'terms' || currentPage === 'privacy') && (
          <LegalPage
            mode={currentPage === 'terms' ? 'terms' : 'privacy'}
            onBackHome={() => handleNavigatePage('home')}
            onSwitchMode={mode => handleNavigatePage(mode === 'terms' ? 'terms' : 'privacy')}
          />
        )}
      </main>

      {/* Floating Specification Comparison Bar */}
      <ComparisonBar
        comparisonProducts={comparisonProducts}
        onRemoveFromComparison={handleToggleComparison}
        onClearComparison={handleClearComparison}
        onOpenComparisonModal={() => setIsComparisonModalOpen(true)}
      />

      {/* Interactive Cookie Consent Banner Persisted to SQL */}
      <CookieConsentBanner
        onOpenPrivacy={() => handleNavigatePage('privacy')}
        onOpenTerms={() => handleNavigatePage('terms')}
      />

      {/* Comprehensive Footer */}
      <Footer
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenSitemap={() => setIsSitemapOpen(true)}
        onSelectCategory={slug => handleOpenCategoryArchive(slug)}
        onOpenQuote={() => {
          setQuoteProduct(null);
          setIsQuoteOpen(true);
        }}
        onNavigate={handleNavigatePage}
      />

      {/* Slide-out Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onNavigateHome={() => handleNavigatePage('home')}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenCategories={() => handleOpenCategoryArchive(null)}
        onOpenProfile={() => setIsAdminOpen(true)}
      />

      {/* Slide-out Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistProducts={wishlistProducts}
        onRemoveFromWishlist={handleToggleWishlist}
        onAddToCart={p => handleAddToCart(p, 1)}
        onSelectProduct={p => {
          setIsWishlistOpen(false);
          handleOpenProductPage(p);
        }}
        onExploreShop={() => handleOpenCategoryArchive(null)}
      />

      {/* Specification Comparison Side-by-Side Matrix Modal */}
      <ComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        products={comparisonProducts}
        onRemoveFromComparison={handleToggleComparison}
        onAddToCart={p => handleAddToCart(p, 1)}
        onRequestQuote={handleOpenQuoteForProduct}
        onSelectProduct={p => {
          setIsComparisonModalOpen(false);
          handleOpenProductPage(p);
        }}
      />

      {/* Single-Page Checkout Modal (M-Pesa STK Push + WhatsApp) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onOrderCompleted={() => {
          handleClearCart();
          reloadData();
        }}
      />

      {/* Solar Installation Sizing Quote Modal */}
      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => {
          setIsQuoteOpen(false);
          setQuoteProduct(null);
        }}
        product={quoteProduct}
      />

      {/* Quick-View Product Detail Modal with Hover Zoom, Short Description & Related Products */}
      <ProductDetailModal
        product={quickViewProduct}
        allProducts={products}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(product, qty) => handleAddToCart(product, qty)}
        onRequestQuote={handleOpenQuoteForProduct}
        onSelectProduct={product => {
          setQuickViewProduct(null);
          handleOpenProductPage(product);
        }}
        wishlistIds={wishlistIds}
        onToggleWishlist={handleToggleWishlist}
        comparisonIds={comparisonIds}
        onToggleComparison={handleToggleComparison}
      />

      {/* WordPress-Style Admin Dashboard with Left Sidebar */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        categories={categories}
        orders={orders}
        leads={leads}
        articles={articles}
        partners={partners}
        reviews={reviews}
        projects={projects}
        aboutData={aboutData}
        onDataUpdated={reloadData}
        onNavigateFrontend={tab => handleNavigatePage(tab)}
      />

      {/* Auto-Generated XML Sitemap & Robots.txt Modal */}
      <SitemapModal
        isOpen={isSitemapOpen}
        onClose={() => setIsSitemapOpen(false)}
        products={products}
        categories={categories}
        articles={articles}
        projects={projects}
      />
    </div>
  );
}
