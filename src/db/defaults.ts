import { HomepageConfig } from '../types';

export interface EPCService {
  id: number;
  title: string;
  slug: string;
  category: string;
  short_description: string;
  description: string;
  icon_name: string;
  image_url: string;
  features: string[];
  counties_served: string[];
}

export const INITIAL_SERVICES: EPCService[] = [
  {
    id: 1,
    title: 'Residential & Home Solar Backup Systems',
    slug: 'residential-solar-backup-installation-kenya',
    category: 'Residential EPC',
    short_description:
      'Custom 3kW to 15kW hybrid solar PV & LiFePO4 battery backup systems for Kenyan homes with 0ms blackout switchover.',
    description:
      'EPRA Contractor Category CV & Vendor Category V1 licensed design and installation of residential hybrid solar systems using Horay N-Type & JA Solar panels, Must, Growatt & Deye hybrid inverters, and Lithium Valley LiFePO4 wall-mounted batteries. Cut KPLC bills by up to 85% across Nairobi, Ruiru, Embakasi, Meru, Mombasa, Kisumu, Nakuru, Isiolo, and Machakos.',
    icon_name: 'Sun',
    image_url:
      'https://shantisprojects.lovable.app/__l5e/assets-v1/0f44c6c4-ebd7-4883-bae0-17c6dbe786a5/tatu-city.jpg',
    features: [
      'Free site survey & load audit',
      'EPRA Category CV & V1 licensed installation & warranty',
      'Zero transfer time (UPS-grade) backup',
      'Smart Wi-Fi mobile monitoring',
    ],
    counties_served: [
      'Nairobi',
      'Kiambu',
      'Meru',
      'Mombasa',
      'Kisumu',
      'Nakuru',
      'Isiolo',
      'Machakos',
    ],
  },
  {
    id: 2,
    title: 'Commercial, School & Industrial Three-Phase Solar EPC',
    slug: 'commercial-industrial-solar-epc-kenya',
    category: 'Commercial & Institutional',
    short_description:
      'High-voltage 12kW to 500kW three-phase solar PV and BESS storage plants for schools, churches, hospitals, and factories.',
    description:
      'Turnkey Engineering, Procurement, and Construction (EPC) for commercial facilities, secondary schools, churches, and warehouses. Engineered for peak tariff load shifting, generator fuel reduction, and three-phase machinery stability.',
    icon_name: 'Building2',
    image_url:
      'https://shantisprojects.lovable.app/__l5e/assets-v1/681c8ff1-213e-4cc8-9dea-1ff8cc025506/warehouse.jpg',
    features: [
      'Three-phase Deye & Must HV hybrid systems',
      'Rack-mounted high-voltage LiFePO4 BESS',
      'ROI & KPLC tariff harmonic analysis',
      'Full NCA & EPRA compliance documentation',
    ],
    counties_served: [
      'Nairobi',
      'Mombasa',
      'Kisumu',
      'Nakuru',
      'Meru',
      'Machakos',
      'Uasin Gishu',
      'Kiambu',
    ],
  },
  {
    id: 3,
    title: 'Solar Borehole & Agricultural Water Pumping Solutions',
    slug: 'solar-borehole-water-pump-installation-kenya',
    category: 'Water & Irrigation',
    short_description:
      'Doyin DC and AC/DC Hybrid stainless-steel submersible borehole pumps (0.75HP to 10HP) with MPPT solar controllers.',
    description:
      'Complete borehole solarization and surface booster pump installations for farms, ranches, estates, and community water projects in Machakos, Isiolo, Meru, Nakuru, and Kajiado. Zero diesel or monthly electricity pumping costs.',
    icon_name: 'Droplets',
    image_url:
      'https://shantisprojects.lovable.app/__l5e/assets-v1/fb447bc0-6cb0-4aa7-b06e-08cb9baad0c8/kabete-water.jpg',
    features: [
      'Doyin 304 stainless steel submersible pumps',
      'Dual AC/DC hybrid MPPT solar pump inverters',
      'Dry-run & tank float switch automation',
      'High-head deep well pumping up to 250m',
    ],
    counties_served: [
      'Machakos',
      'Isiolo',
      'Meru',
      'Nakuru',
      'Kajiado',
      'Laikipia',
      'Kirinyaga',
      'Nairobi',
    ],
  },
  {
    id: 4,
    title: 'Solar Water Heating Systems (150L – 300L Pressurized)',
    slug: 'solar-water-heater-installation-kenya',
    category: 'Thermal Energy',
    short_description:
      'High-pressure evacuated vacuum tube and flat-plate solar water heaters for residential homes, hotels, and hospitals.',
    description:
      'Eliminate electric geyser consumption with borosilicate vacuum tube and pressurized thermosyphon solar water heaters. Engineered with 72-hour high-density polyurethane heat retention and corrosion-resistant stainless steel tanks.',
    icon_name: 'Flame',
    image_url:
      'https://shantisdesigns.co.ke/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-06-at-19.48.50.jpeg',
    features: [
      '150L, 200L, 250L & 300L pressurized tanks',
      'High-absorption borosilicate vacuum tubes',
      'Smart digital temperature & backup controller',
      'EPRA solar water heating regulations compliant',
    ],
    counties_served: [
      'Nairobi',
      'Kiambu',
      'Nakuru',
      'Meru',
      'Nyeri',
      'Kisumu',
      'Mombasa',
      'Machakos',
    ],
  },
];

export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  template_id: 'classic_epc',
  hero_kicker: 'EPRA Contractor Category CV & Vendor V1 · Nairobi & Nationwide Kenya',
  hero_headline: 'SHANTIS DESIGNS',
  hero_highlight: 'SOLAR SOLUTIONS',
  hero_subheadline:
    'Genuine Tier-1 Horay N-Type & JA Solar Panels, Must, Growatt & Deye Hybrid Inverters, Lithium Valley LiFePO4 Batteries, EcoFlow Power Backups, and Doyin Submersible Water Pumps.',
  hero_image_url:
    'https://shantisdesigns.co.ke/wp-content/uploads/2026/08/WhatsApp-Image-2026-08-06-at-19.48.50.jpeg',
  primary_cta_label: 'Shop Solar Equipment',
  secondary_cta_label: 'Size Your Solar System',
  epc_banner_title: 'Need Turnkey Solar Installation in Kenya?',
  epc_banner_subtitle:
    'Nationwide Delivery & EPRA Category CV & V1 Certified Solar Installation Across Nairobi, Ruiru, Meru, Mombasa, Kisumu, Nakuru, Isiolo & Machakos · Call 0115 521 631',
  show_trust_bar: true,
  show_deals_section: true,
  show_partners_marquee: true,
  show_epc_services: true,
  show_google_reviews: true,
  services: [],
  updated_at: new Date().toISOString(),
};
