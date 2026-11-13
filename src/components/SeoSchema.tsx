import React, { useEffect } from 'react';
import { Product, Article, Category } from '../types';
import { NavPage } from './Header';

interface SeoSchemaProps {
  products: Product[];
  articles: Article[];
  categories?: Category[];
  currentPage?: NavPage;
  activeProduct?: Product | null;
  selectedCategorySlug?: string | null;
}

export const SeoSchema: React.FC<SeoSchemaProps> = ({
  products,
  articles,
  categories = [],
  currentPage = 'home',
  activeProduct = null,
  selectedCategorySlug = null,
}) => {
  useEffect(() => {
    const baseUrl = 'https://shantisdesigns.co.ke';
    const countiesList =
      'Nairobi, Mombasa, Kisumu, Meru, Nakuru, Isiolo, Machakos, Kiambu, Eldoret, Nyeri, Kilifi & all 47 Kenyan counties';

    let pageTitle =
      'Shantis Designs Solar Solutions | Solar Panels, Lithium Batteries & Inverters in Kenya';
    let pageDesc =
      'Shop Tier-1 solar panels, Must & Deye hybrid inverters, Lithium Valley LiFePO4 batteries, EcoFlow backups & Doyin borehole pumps in Nairobi, Mombasa, Kisumu, Meru & Nakuru.';
    let pageKeywords =
      'solar panels price in Kenya, lithium solar batteries Nairobi, solar power backup Kenya, hybrid solar inverter Must Deye Kenya, Doyin solar borehole water pumps, solar installation Nairobi Mombasa Kisumu Meru Nakuru Isiolo Machakos, Shantis Designs Solar Solutions';
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
          : `Buy genuine ${activeProduct.name} at KES ${priceVal.toLocaleString()} in Kenya. Official warranty & fast delivery to Nairobi, Mombasa, Kisumu, Meru, Nakuru, Isiolo & Machakos.`;
      pageKeywords = [
        ...(activeProduct.seo_keywords || []),
        `${activeProduct.name} price in Kenya`,
        `Buy ${activeProduct.name} Nairobi Mombasa Kisumu`,
        `${activeProduct.category_name} Meru Nakuru Isiolo Machakos`,
        'Shantis Designs Solar Solutions Kenya',
      ].join(', ');
      canonicalUrl = activeProduct.permalink || `${baseUrl}/product/${activeProduct.slug}/`;
      ogImage = activeProduct.image_url || ogImage;
      ogType = 'product';
    } else if (currentPage === 'shop' && selectedCategorySlug) {
      const cat = categories.find((c) => c.slug === selectedCategorySlug);
      const catName =
        cat?.name ||
        selectedCategorySlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      pageTitle = `${catName} Price in Kenya — Nairobi, Mombasa & Kisumu | Shantis Designs`;
      pageDesc =
        cat?.description ||
        `Shop genuine ${catName} in Kenya with official warranty and countrywide delivery to Nairobi, Mombasa, Kisumu, Meru, Nakuru, Isiolo & Machakos from Shantis Designs.`;
      pageKeywords = `${catName} price in Kenya, Buy ${catName} Nairobi Mombasa Kisumu, Best ${catName} Meru Nakuru Isiolo Machakos, EPRA licensed ${catName} supplier Kenya, Shantis Designs Solar Solutions`;
      canonicalUrl = cat?.permalink || `${baseUrl}/product-category/${selectedCategorySlug}/`;
      if (cat?.image_url) ogImage = cat.image_url;
    } else if (currentPage === 'shop') {
      pageTitle =
        'Shop Solar Panels, Lithium Batteries, Inverters & Borehole Pumps | Shantis Designs Kenya';
      pageDesc =
        'Browse 157+ genuine Tier-1 solar panels, Must & Deye hybrid inverters, Lithium Valley LiFePO4 batteries & Doyin borehole pumps across Nairobi, Mombasa, Kisumu & Meru.';
      pageKeywords =
        'solar shop Nairobi Kenya, buy solar panels Mombasa Kisumu Meru Nakuru, lithium solar battery price Kenya, hybrid solar inverter shop Luthuli Avenue Nairobi, Doyin water pumps Kenya';
      canonicalUrl = `${baseUrl}/shop/`;
    } else if (currentPage === 'projects') {
      pageTitle =
        'Solar Installation Projects in Nairobi, Mombasa, Meru, Nakuru & Kisumu | Shantis Designs';
      pageDesc =
        'Explore 180+ verified residential, commercial & borehole solar installations (1.2 MW+ deployed) across Nairobi, Kiambu, Nakuru, Meru, Machakos, Mombasa & Kisumu, Kenya.';
      pageKeywords =
        'solar installation projects Kenya, EPRA solar contractor Nairobi, residential solar installation Karen Runda Tatu City, commercial solar BESS Kenya, borehole solarization Nakuru Meru Machakos';
      canonicalUrl = `${baseUrl}/projects/`;
    } else if (currentPage === 'about') {
      pageTitle =
        'About Us — EPRA Licensed Solar EPC Contractor in Kenya | Shantis Designs Solar Solutions';
      pageDesc =
        'Shantis Designs Limited is an EPRA Class T3 & NCA licensed solar EPC company serving Nairobi, Mombasa, Kisumu, Meru, Nakuru, Isiolo, Machakos & all 47 counties in Kenya.';
      pageKeywords =
        'Shantis Designs Limited, Shantis Solar Solutions Kenya, EPRA licensed solar companies in Kenya, NCA registered solar contractor Nairobi, solar engineering procurement construction Kenya';
      canonicalUrl = `${baseUrl}/about/`;
    } else if (currentPage === 'contact') {
      pageTitle =
        'Contact Shantis Designs Solar Showroom — Luthuli Ave & Biashara St, Nairobi Kenya';
      pageDesc =
        'Visit our Nairobi Showroom at Royal King Building (Luthuli Street) or Head Office at Dev Towers (Biashara Street). Call +254 115 521 631 for delivery across all 47 Kenyan counties.';
      pageKeywords =
        'Shantis Designs contact number, solar shop Luthuli Avenue Nairobi, solar equipment Biashara Street Nairobi, solar installation quote Mombasa Kisumu Meru Nakuru Isiolo Machakos';
      canonicalUrl = `${baseUrl}/contact-2/`;
    } else if (currentPage === 'order-tracking') {
      pageTitle =
        'Track Your Solar Equipment Order & County Dispatch | Shantis Designs Kenya';
      pageDesc =
        'Track your real-time solar panels, inverter, lithium battery, or borehole pump dispatch to Nairobi, Mombasa, Kisumu, Meru, Nakuru, Isiolo & Machakos, Kenya.';
      pageKeywords =
        'track solar order Kenya, Shantis Designs order tracking, solar delivery Nairobi Mombasa Kisumu Meru Nakuru';
      canonicalUrl = `${baseUrl}/order-tracking/`;
    } else if (currentPage === 'insights') {
      pageTitle =
        'Kenya Solar Engineering Blog, Price Guides & EPRA Sizing | Shantis Designs';
      pageDesc =
        'Read expert Kenya solar guides on JA Solar & Horay N-Type panels, Lithium Valley LiFePO4 battery sizing, Must/Deye inverters & Doyin borehole pumps for Nairobi, Mombasa & Kisumu.';
      pageKeywords =
        'solar energy blog Kenya, JA Solar panels price Kenya, Lithium Valley battery guide Kenya, Doyin borehole pump sizing Meru Machakos Isiolo, KPLC solar savings calculator';
      canonicalUrl = `${baseUrl}/blog/`;
      ogType = 'blog';
    } else if (currentPage === 'kenya-seo') {
      pageTitle =
        'Solar Installation & Prices in Nairobi, Mombasa, Kisumu, Meru, Nakuru, Isiolo & Machakos | Shantis Designs';
      pageDesc =
        'Compare 2026 Kenya solar prices & request EPRA-certified installation in Nairobi, Mombasa, Kisumu, Meru, Nakuru, Isiolo & Machakos for panels, lithium batteries & borehole pumps.';
      pageKeywords =
        'solar installation Nairobi, solar panels Mombasa, solar power backup Kisumu, solar borehole pumps Meru, off grid solar Nakuru, solar water pumps Isiolo, home solar systems Machakos, best solar company in Kenya';
      canonicalUrl = `${baseUrl}/solar-installation-kenya/`;
    } else if (currentPage === 'terms') {
      pageTitle = 'Terms and Conditions of Sale & Warranty | Shantis Designs Solar Solutions Kenya';
      pageDesc =
        'Official Terms and Conditions of sale, EPRA warranty coverage, M-Pesa Daraja payment verification, and nationwide delivery across all 47 Kenyan counties.';
      pageKeywords =
        'Shantis Designs terms and conditions, solar panel warranty Kenya, EPRA solar warranty Nairobi Mombasa Kisumu';
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
          'EPRA Licensed Solar PV Contractor & Distributor of Solar Panels, Hybrid Inverters, Lithium Batteries, EcoFlow Power Stations & Doyin Water Pumps across Nairobi, Mombasa, Kisumu, Meru, Nakuru, Isiolo & Machakos, Kenya.',
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
  }, [products, articles, categories, currentPage, activeProduct, selectedCategorySlug]);

  return null;
};
