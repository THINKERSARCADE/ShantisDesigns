import React, { useEffect } from 'react';
import { Product, Article, Category, Project } from '../types';
import { NavPage } from './Header';

interface SeoSchemaProps {
  products: Product[];
  articles: Article[];
  projects?: Project[];
  categories?: Category[];
  currentPage?: NavPage;
  activeProduct?: Product | null;
  activeArticle?: Article | null;
  activeProject?: Project | null;
  selectedCategorySlug?: string | null;
}

export const SeoSchema: React.FC<SeoSchemaProps> = ({
  products,
  articles,
  projects = [],
  categories = [],
  currentPage = 'home',
  activeProduct = null,
  activeArticle = null,
  activeProject = null,
  selectedCategorySlug = null,
}) => {
  useEffect(() => {
    const baseUrl = 'https://shantisdesigns.co.ke';
    const countiesList =
      'Nairobi, Ruiru, Embakasi, Kiambu, Mombasa, Kisumu, Meru, Nakuru, Isiolo, Machakos, Eldoret, Nyeri, Kilifi & all 47 Kenyan counties';

    let pageTitle =
      'Shantis Designs Solar Solutions | EPRA Cat CV & V1 Solar Contractor Kenya';
    let pageDesc =
      'EPRA Contractor Category CV & Vendor Category V1 solar specialist in Kenya. Shop Tier-1 panels, Growatt & Deye hybrid inverters, LithiumValley 16kWh W16-E5 batteries, EcoFlow backups & Doyin borehole pumps.';
    let pageKeywords =
      'solar panels price in Kenya, solar carport installation Ruiru Kenya, Embakasi Baraka Estate solar installation, LithiumValley W16-E5 16kWh battery price Kenya, Growatt hybrid inverter Kenya, EPRA Category CV V1 contractor Kenya, Shantis Designs Solar Solutions';
    let canonicalUrl = `${baseUrl}/`;
    let ogImage = `${baseUrl}/wp-content/uploads/2026/01/PV36PRO-4-6-01-1.jpg`;
    let ogType = 'website';

    if (currentPage === 'product' && activeProduct) {
      const priceVal = activeProduct.sale_price || activeProduct.price;
      pageTitle = `${activeProduct.name} — Price in Kenya (KES ${priceVal.toLocaleString()}) | Shantis Designs`;
      const rawShort = (activeProduct.shortDescription || activeProduct.description || '').replace(
        /\s+/g,
        ' '
      );
      pageDesc =
        rawShort.length >= 60 && rawShort.length <= 160
          ? rawShort
          : `Buy genuine ${activeProduct.name} at KES ${priceVal.toLocaleString()} in Kenya. Official EPRA Cat V1 warranty & fast delivery to Nairobi, Ruiru, Mombasa, Kisumu, Meru, Nakuru & Machakos.`;
      pageKeywords = [
        ...(activeProduct.seo_keywords || []),
        `${activeProduct.name} price in Kenya`,
        `Buy ${activeProduct.name} Nairobi Mombasa Kisumu`,
        `${activeProduct.category_name} Meru Nakuru Isiolo Machakos`,
        'EPRA Category CV V1 Shantis Designs Solar Solutions Kenya',
      ].join(', ');
      canonicalUrl = activeProduct.permalink || `${baseUrl}/product/${activeProduct.slug}/`;
      ogImage = activeProduct.image_url || ogImage;
      ogType = 'product';
    } else if (currentPage === 'shop' && selectedCategorySlug) {
      const cat = categories.find((c) => c.slug === selectedCategorySlug);
      const catName =
        cat?.name ||
        selectedCategorySlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      pageTitle = `${catName} Price in Kenya — Nairobi, Ruiru, Mombasa & Kisumu | Shantis Designs`;
      pageDesc =
        cat?.description ||
        `Shop genuine ${catName} in Kenya with official warranty and countrywide delivery from EPRA Category CV & V1 supplier Shantis Designs.`;
      pageKeywords = `${catName} price in Kenya, Buy ${catName} Nairobi Ruiru Mombasa Kisumu, Best ${catName} Meru Nakuru Isiolo Machakos, EPRA Category CV V1 ${catName} supplier Kenya, Shantis Designs Solar Solutions`;
      canonicalUrl = cat?.permalink || `${baseUrl}/product-category/${selectedCategorySlug}/`;
      if (cat?.image_url) ogImage = cat.image_url;
    } else if (currentPage === 'shop') {
      pageTitle =
        'Shop Solar Panels, Lithium Batteries, Inverters & Borehole Pumps | Shantis Designs Kenya';
      pageDesc =
        'Browse 157+ genuine Tier-1 solar panels, Growatt, Must & Deye hybrid inverters, LithiumValley 5kWh–16kWh LiFePO4 batteries & Doyin borehole pumps across Kenya.';
      pageKeywords =
        'solar shop Nairobi Kenya, buy solar panels Ruiru Mombasa Kisumu Meru Nakuru, LithiumValley battery price Kenya, hybrid solar inverter shop Luthuli Avenue Nairobi, Doyin water pumps Kenya';
      canonicalUrl = `${baseUrl}/shop/`;
    } else if (currentPage === 'projects' && activeProject) {
      pageTitle = `${activeProject.title} — ${activeProject.location} Case Study | Shantis Designs`;
      pageDesc = activeProject.description.slice(0, 158);
      pageKeywords = [
        ...(activeProject.seo_keywords || []),
        `${activeProject.title}`,
        `${activeProject.location} solar installation`,
        `${activeProject.system_size}`,
        'EPRA Category CV solar contractor Kenya',
      ].join(', ');
      canonicalUrl = `${baseUrl}/portfolio/${activeProject.slug}/`;
      ogImage = activeProject.image_url || ogImage;
      ogType = 'article';
    } else if (currentPage === 'projects') {
      pageTitle =
        'Solar Installation Projects: Ruiru Carport, Embakasi Baraka Estate, Nairobi & Kenya | Shantis Designs';
      pageDesc =
        'Explore 180+ verified solar installations by EPRA Category CV & V1 contractor Shantis Designs: Ruiru 5kWp solar carport & 16kWh LithiumValley, Embakasi Baraka Estate Growatt hybrid, and commercial plants across Kenya.';
      pageKeywords =
        'Ruiru solar carport installation Kenya, Embakasi Baraka Estate solar installation, Growatt hybrid LithiumValley installation Nairobi, EPRA Category CV solar contractor Kenya, solar installation Tatu City Kiambu';
      canonicalUrl = `${baseUrl}/projects/`;
    } else if (currentPage === 'about') {
      pageTitle =
        'About Us — EPRA Category CV & Vendor V1 Solar EPC Contractor Kenya | Shantis Designs';
      pageDesc =
        'Shantis Designs Limited is an EPRA Contractor Category CV, Vendor Category V1 & NCA licensed solar EPC company serving Nairobi, Ruiru, Kiambu, Mombasa, Kisumu, Meru, Nakuru & all 47 counties.';
      pageKeywords =
        'Shantis Designs Limited, EPRA Contractor Category CV Kenya, EPRA Vendor Category V1 solar supplier, NCA registered solar contractor Nairobi, solar engineering procurement construction Kenya';
      canonicalUrl = `${baseUrl}/about/`;
    } else if (currentPage === 'contact') {
      pageTitle =
        'Contact Shantis Designs Solar Showroom — Luthuli Ave & Biashara St, Nairobi Kenya';
      pageDesc =
        'Visit our Nairobi Showroom at Royal King Building (Luthuli Street) or Head Office at Dev Towers (Biashara Street). Call +254 115 521 631 for delivery across all 47 Kenyan counties.';
      pageKeywords =
        'Shantis Designs contact number, solar shop Luthuli Avenue Nairobi, solar equipment Biashara Street Nairobi, solar installation quote Ruiru Embakasi Mombasa Kisumu Meru Nakuru';
      canonicalUrl = `${baseUrl}/contact-2/`;
    } else if (currentPage === 'order-tracking') {
      pageTitle =
        'Track Your Solar Equipment Order & County Dispatch | Shantis Designs Kenya';
      pageDesc =
        'Track your real-time solar panels, inverter, lithium battery, or borehole pump dispatch to Nairobi, Ruiru, Mombasa, Kisumu, Meru, Nakuru, Isiolo & Machakos, Kenya.';
      pageKeywords =
        'track solar order Kenya, Shantis Designs order tracking, solar delivery Nairobi Ruiru Mombasa Kisumu Meru Nakuru';
      canonicalUrl = `${baseUrl}/order-tracking/`;
    } else if (currentPage === 'insights' && activeArticle) {
      pageTitle = `${activeArticle.title} | Shantis Designs Solar Engineering Blog`;
      pageDesc = activeArticle.meta_description || activeArticle.excerpt;
      pageKeywords = [
        ...(activeArticle.tags || []),
        'EPRA Category CV V1 Kenya',
        'Shantis Designs Solar Solutions',
      ].join(', ');
      canonicalUrl = `${baseUrl}/blog/${activeArticle.slug}/`;
      ogImage = activeArticle.image_url || ogImage;
      ogType = 'article';
    } else if (currentPage === 'insights') {
      pageTitle =
        'Kenya Solar Engineering Blog, Ruiru Carport & Embakasi Case Studies | Shantis Designs';
      pageDesc =
        'Read EPRA Category CV & V1 engineering case studies: Ruiru 5kWp solar carport + 16kWh LithiumValley W16-E5, Embakasi Baraka Estate Growatt hybrid, and 2026 Kenya solar price guides.';
      pageKeywords =
        'solar carport Kenya case study, Ruiru solar installation blog, Embakasi Baraka Estate Growatt solar, LithiumValley W16-E5 Kenya, EPRA Category CV V1 solar guide, KPLC solar savings calculator';
      canonicalUrl = `${baseUrl}/blog/`;
      ogType = 'blog';
    } else if (currentPage === 'kenya-seo') {
      pageTitle =
        'Solar Installation & Prices in Nairobi, Ruiru, Embakasi, Meru, Mombasa & Kenya | Shantis Designs';
      pageDesc =
        'Compare 2026 Kenya solar prices & request EPRA Category CV & V1 certified installation in Nairobi, Ruiru, Embakasi, Mombasa, Kisumu, Meru, Nakuru, Isiolo & Machakos.';
      pageKeywords =
        'solar installation Nairobi, solar carport Ruiru Kiambu, solar installation Embakasi, solar panels Mombasa, solar power backup Kisumu, solar borehole pumps Meru, off grid solar Nakuru, solar water pumps Isiolo, home solar systems Machakos';
      canonicalUrl = `${baseUrl}/solar-installation-kenya/`;
    } else if (currentPage === 'terms') {
      pageTitle = 'Terms and Conditions of Sale & Warranty | Shantis Designs Solar Solutions Kenya';
      pageDesc =
        'Official Terms and Conditions of sale, EPRA Category CV & V1 warranty coverage, M-Pesa Daraja payment verification, and nationwide delivery across all 47 Kenyan counties.';
      pageKeywords =
        'Shantis Designs terms and conditions, solar panel warranty Kenya, EPRA Cat CV V1 solar warranty Nairobi Mombasa Kisumu';
      canonicalUrl = `${baseUrl}/terms-and-conditions/`;
    } else if (currentPage === 'privacy') {
      pageTitle =
        'Privacy Policy & Kenya Data Protection Act Compliance | Shantis Designs Solar Solutions';
      pageDesc =
        'Kenya Data Protection Act (2019) compliant Privacy Policy, SQL database security protocols, and customer PII protection at Shantis Designs Limited.';
      pageKeywords =
        'Shantis Designs privacy policy, Kenya Data Protection Act 2019 compliance, secure M-Pesa checkout solar Kenya';
      canonicalUrl = `${baseUrl}/privacy-policy/`;
    }

    document.title = pageTitle;

    const setMetaTag = (attr: 'name' | 'property', key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Standard Meta & Geo Tags
    setMetaTag('name', 'description', pageDesc);
    setMetaTag('name', 'keywords', pageKeywords);
    setMetaTag('name', 'geo.region', 'KE');
    setMetaTag('name', 'geo.placename', countiesList);
    setMetaTag('name', 'geo.position', '-1.2841;36.8285');
    setMetaTag('name', 'ICBM', '-1.2841, 36.8285');

    // OpenGraph Tags Aligned with Production Domain (https://shantisdesigns.co.ke)
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', 'Shantis Designs Solar Solutions');
    setMetaTag('property', 'og:title', pageTitle);
    setMetaTag('property', 'og:description', pageDesc);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:image:secure_url', ogImage);
    setMetaTag('property', 'og:image:alt', pageTitle);
    setMetaTag('property', 'og:locale', 'en_KE');

    if (currentPage === 'product' && activeProduct) {
      setMetaTag(
        'property',
        'product:price:amount',
        String(activeProduct.sale_price || activeProduct.price)
      );
      setMetaTag('property', 'product:price:currency', 'KES');
    }

    // Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', pageTitle);
    setMetaTag('name', 'twitter:description', pageDesc);
    setMetaTag('name', 'twitter:image', ogImage);
    setMetaTag('name', 'twitter:image:alt', pageTitle);

    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    const graphNodes: Record<string, unknown>[] = [
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: `${baseUrl}/`,
        name: 'Shantis Designs Solar Solutions',
        description:
          'EPRA Contractor Category CV & Vendor Category V1 Solar PV Engineer & Distributor of Solar Panels, Hybrid Inverters, Lithium Batteries, EcoFlow Power Stations & Doyin Water Pumps across Nairobi, Ruiru, Embakasi, Mombasa, Kisumu, Meru, Nakuru, Isiolo & Machakos, Kenya.',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${baseUrl}/?s={search_term_string}&post_type=product`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'LocalBusiness',
        '@id': `${baseUrl}/#organization`,
        name: 'Shantis Designs Solar Solutions',
        alternateName: 'Shantis Designs Limited',
        url: `${baseUrl}/`,
        logo: `${baseUrl}/assets/aistudio/pdf-logo__1__3934e2bd.jpg`,
        image: ogImage,
        telephone: '+254115521631',
        email: 'info@shantis.co.ke',
        priceRange: 'KES 150 - KES 430,000',
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '5.0',
          reviewCount: '5',
          bestRating: '5',
          worstRating: '1',
        },
        areaServed: [
          { '@type': 'Country', name: 'Kenya' },
          { '@type': 'City', name: 'Nairobi' },
          { '@type': 'City', name: 'Ruiru' },
          { '@type': 'City', name: 'Mombasa' },
          { '@type': 'City', name: 'Kisumu' },
          { '@type': 'City', name: 'Meru' },
          { '@type': 'City', name: 'Nakuru' },
          { '@type': 'City', name: 'Isiolo' },
          { '@type': 'City', name: 'Machakos' },
          { '@type': 'City', name: 'Eldoret' },
          { '@type': 'City', name: 'Nyeri' },
          { '@type': 'AdministrativeArea', name: 'Kiambu County' },
          { '@type': 'AdministrativeArea', name: 'Kilifi County' },
          { '@type': 'AdministrativeArea', name: 'Kajiado County' },
        ],
        address: [
          {
            '@type': 'PostalAddress',
            streetAddress: 'Royal King Building, Luthuli Street',
            addressLocality: 'Nairobi',
            postalCode: '00505',
            postOfficeBoxNumber: 'P.O Box 21377 – 00505',
            addressCountry: 'KE',
          },
          {
            '@type': 'PostalAddress',
            streetAddress: 'Dev Towers, 2nd Floor, Biashara Street',
            addressLocality: 'Nairobi',
            postalCode: '00505',
            addressCountry: 'KE',
          },
        ],
        geo: {
          '@type': 'GeoCoordinates',
          latitude: -1.2841,
          longitude: 36.8285,
        },
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '08:00',
          closes: '18:00',
        },
        paymentAccepted: 'Lipa na M-Pesa, EFT, RTGS, Cash',
        currenciesAccepted: 'KES',
      },
    ];

    if (currentPage === 'product' && activeProduct) {
      graphNodes.push({
        '@type': 'Product',
        '@id': `${canonicalUrl}#product`,
        name: activeProduct.name,
        sku: activeProduct.sku,
        image: [activeProduct.image_url],
        description: activeProduct.description || activeProduct.shortDescription,
        category: activeProduct.category_name,
        brand: {
          '@type': 'Brand',
          name:
            activeProduct.specs?.['Brand / Manufacturer'] ||
            activeProduct.specs?.['Brand'] ||
            'Shantis Solar',
        },
        offers: {
          '@type': 'Offer',
          url: canonicalUrl,
          priceCurrency: 'KES',
          price: activeProduct.sale_price || activeProduct.price,
          availability:
            activeProduct.stock_status === 'outofstock'
              ? 'https://schema.org/OutOfStock'
              : 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          areaServed: [
            'Nairobi',
            'Ruiru',
            'Mombasa',
            'Kisumu',
            'Meru',
            'Nakuru',
            'Isiolo',
            'Machakos',
            'Kenya',
          ],
          seller: {
            '@id': `${baseUrl}/#organization`,
          },
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: activeProduct.rating || 4.9,
          reviewCount: activeProduct.reviews_count || 18,
        },
      });
    }

    if (currentPage === 'insights') {
      const targetArticles = activeArticle ? [activeArticle] : articles.slice(0, 6);
      targetArticles.forEach((art) => {
        graphNodes.push({
          '@type': 'BlogPosting',
          '@id': `${baseUrl}/blog/${art.slug}/#article`,
          headline: art.title,
          description: art.meta_description || art.excerpt,
          image: art.image_url,
          datePublished: art.published_at || '2026-11-02',
          keywords: (art.tags || []).join(', '),
          author: {
            '@type': 'Organization',
            name: art.author || 'Shantis Designs Solar Solutions',
          },
          publisher: { '@id': `${baseUrl}/#organization` },
          mainEntityOfPage: `${baseUrl}/blog/${art.slug}/`,
        });
      });
    }

    if (currentPage === 'projects') {
      const targetProjects = activeProject ? [activeProject] : projects.slice(0, 8);
      graphNodes.push({
        '@type': 'ItemList',
        name: 'Shantis Designs Solar Installation Portfolio in Kenya',
        itemListElement: targetProjects.map((pr, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          url: `${baseUrl}/portfolio/${pr.slug}/`,
          name: `${pr.title} (${pr.location})`,
        })),
      });

      targetProjects
        .filter((pr) => Boolean(pr.video_url || (pr.videos && pr.videos.length > 0)))
        .forEach((pr) => {
          const vid = pr.video_url || pr.videos?.[0];
          if (!vid) return;
          graphNodes.push({
            '@type': 'VideoObject',
            name: `${pr.title} — Field Commissioning Walkthrough`,
            description: pr.description,
            thumbnailUrl: pr.image_url,
            uploadDate: pr.completion_date || '2026-11-02',
            contentUrl: vid.startsWith('http') ? vid : `${baseUrl}${vid}`,
            publisher: { '@id': `${baseUrl}/#organization` },
          });
        });
    }

    if (currentPage === 'home' || currentPage === 'kenya-seo' || currentPage === 'insights') {
      graphNodes.push({
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Is Shantis Designs licensed by EPRA to install and supply solar systems in Kenya?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Shantis Designs Limited holds both EPRA Contractor Category CV and Vendor Category V1 solar licenses alongside NCA electrical contractor registration for residential, carport, commercial, and borehole installations across all 47 counties in Kenya.',
            },
          },
          {
            '@type': 'Question',
            name: 'How does a solar carport installation in Ruiru or Nairobi perform compared to rooftop mounting?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'A structural steel solar carport in Ruiru or Kiambu generates full 5kWp+ clean energy while shading two vehicles. Paired with a Blue ATO / Growatt hybrid inverter and 16kWh LithiumValley W16-E5 smart battery, it powers homes and EVs with under 10ms blackout transfer.',
            },
          },
          {
            '@type': 'Question',
            name: 'What battery and inverter size eliminates daytime KPLC grid import for a 3-bedroom home in Embakasi?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'As proven in our Embakasi Baraka Estate installation, a 3.7kWp solar array feeding a Growatt hybrid inverter and a 51.2V 100Ah (5.12kWh) LithiumValley LiFePO4 battery achieves 0.00W grid import during sunny daytime hours and maintains reliable overnight backup.',
            },
          },
        ],
      });
    }

    const ldJsonPayload = {
      '@context': 'https://schema.org',
      '@graph': graphNodes,
    };

    let scriptTag = document.getElementById('shantis-ld-json') as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'shantis-ld-json';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(ldJsonPayload);
  }, [
    products,
    articles,
    projects,
    categories,
    currentPage,
    activeProduct,
    activeArticle,
    activeProject,
    selectedCategorySlug,
  ]);

  return null;
};
