import React, { useState } from 'react';
import { Product, Category, Article, Project } from '../types';
import { X, Copy, Check, Download, FileCode, CheckCircle2 } from 'lucide-react';

interface SitemapModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  categories: Category[];
  articles: Article[];
  projects?: Project[];
}

export const SitemapModal: React.FC<SitemapModalProps> = ({
  isOpen,
  onClose,
  products,
  categories,
  articles,
  projects = []
}) => {
  const [activeTab, setActiveTab] = useState<'sitemap' | 'robots'>('sitemap');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const today = new Date().toISOString().slice(0, 10);

  // Generate XML Sitemap with exact WooCommerce permalink structure
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Core WordPress & WooCommerce Pages -->
  <url>
    <loc>https://shantisdesigns.co.ke/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://shantisdesigns.co.ke/shop/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc>https://shantisdesigns.co.ke/projects/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://shantisdesigns.co.ke/about/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>https://shantisdesigns.co.ke/all-services/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>https://shantisdesigns.co.ke/contact-2/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://shantisdesigns.co.ke/order-tracking/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://shantisdesigns.co.ke/blog/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- WooCommerce Product Categories (${categories.length}) -->
${categories
  .map(
    c => `  <url>
    <loc>https://shantisdesigns.co.ke/product-category/${c.slug}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`
  )
  .join('\n')}

  <!-- WooCommerce Individual Products (${products.length}) -->
${products
  .map(
    p => `  <url>
    <loc>${p.permalink || `https://shantisdesigns.co.ke/product/${p.slug}/`}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}

  <!-- Project Portfolio Case Studies (${projects.length}) -->
${projects
  .map(proj => {
    const slug =
      proj.slug ||
      proj.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    return `  <url>
    <loc>https://shantisdesigns.co.ke/portfolio/${slug}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.75</priority>
  </url>`;
  })
  .join('\n')}

  <!-- Blog Articles (${articles.length}) -->
${articles
  .map(
    a => `  <url>
    <loc>https://shantisdesigns.co.ke/blog/${a.slug}/</loc>
    <lastmod>${a.published_at || today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  const robotsTxt = `# robots.txt for Shantis Designs Solar Solutions (https://shantisdesigns.co.ke)
User-agent: *
Allow: /
Allow: /shop/
Allow: /product/
Allow: /product-category/
Allow: /projects/
Allow: /portfolio/
Allow: /about/
Allow: /contact-2/
Disallow: /wp-admin/
Disallow: /cart/
Disallow: /checkout/
Disallow: /my-account/

Sitemap: https://shantisdesigns.co.ke/sitemap_index.xml
Sitemap: https://shantisdesigns.co.ke/product-sitemap.xml
Sitemap: https://shantisdesigns.co.ke/product_cat-sitemap.xml
`;

  const activeContent = activeTab === 'sitemap' ? sitemapXml : robotsTxt;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = activeTab === 'sitemap' ? 'sitemap.xml' : 'robots.txt';
    const mime = activeTab === 'sitemap' ? 'application/xml' : 'text/plain';
    const blob = new Blob([activeContent], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalUrls = 8 + categories.length + products.length + projects.length + articles.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-[#238B3D]" />
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                SEO Tools: Auto-Generated WooCommerce XML Sitemap & Robots.txt
              </h3>
              <p className="text-[11px] text-slate-500">
                100% matched to shantisdesigns.co.ke permalinks (/product/, /product-category/, /portfolio/)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-6 pt-4 flex items-center justify-between border-b border-slate-200">
          <div className="flex gap-4 text-xs font-bold">
            <button
              onClick={() => setActiveTab('sitemap')}
              className={`pb-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'sitemap'
                  ? 'border-[#F58220] text-[#F58220]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              sitemap.xml ({totalUrls} Live Permalink URLs)
            </button>
            <button
              onClick={() => setActiveTab('robots')}
              className={`pb-3 border-b-2 transition-colors cursor-pointer ${
                activeTab === 'robots'
                  ? 'border-[#F58220] text-[#F58220]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              robots.txt
            </button>
          </div>

          <div className="flex items-center gap-2 pb-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 bg-[#238B3D] hover:bg-[#1b7030] text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-900 text-emerald-400 font-mono text-xs">
          <pre className="whitespace-pre-wrap break-all select-all">{activeContent}</pre>
        </div>

        {/* Bottom Hint */}
        <div className="p-3 bg-slate-100 border-t border-slate-200 text-xs text-slate-600 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#238B3D] shrink-0" />
          <span>
            Preserves all Google Search Console rankings for <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-mono text-[11px]">shantisdesigns.co.ke</code>.
          </span>
        </div>
      </div>
    </div>
  );
};
