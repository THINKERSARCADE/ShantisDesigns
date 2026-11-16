import React, { useState } from 'react';
import { Product, Category } from '../../types';
import {
  MapPin,
  Sun,
  BatteryCharging,
  Zap,
  Droplets,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Search,
  Award,
  Phone
} from 'lucide-react';

interface KenyaSeoHubPageProps {
  products: Product[];
  categories: Category[];
  onSelectCategory: (slug: string) => void;
  onSelectProduct: (product: Product) => void;
  onRequestQuote: () => void;
}

interface CountySeoProfile {
  id: string;
  name: string;
  region: string;
  peakSunHours: string;
  headline: string;
  summary: string;
  topSolutions: string[];
  targetKeywords: string[];
  deliveryNote: string;
}

const KENYA_REGIONAL_HUBS: CountySeoProfile[] = [
  {
    id: 'nairobi',
    name: 'Nairobi & Kiambu Metropolitan',
    region: 'Nairobi, Ruiru, Embakasi (Baraka Estate), Karen, Runda, Westlands, Kilimani, Thika Road, Tatu City, Syokimau',
    peakSunHours: '5.4 – 5.8 kWh/m²/day',
    headline: 'Solar Carports, Panels, Lithium Batteries & Hybrid Power Backups in Nairobi & Ruiru',
    summary:
      'Headquartered at Royal King Building (Luthuli Street) and Dev Towers (Biashara Street), Shantis Designs Solar Solutions delivers same-day dispatch and EPRA Contractor Category CV & Vendor Category V1 turnkey solar carports, residential Growatt/Deye hybrids, and LithiumValley LiFePO4 installations across Nairobi, Embakasi, Ruiru, and Kiambu.',
    topSolutions: [
      '5kWp+ Custom Steel Solar Carport Canopies with 16kWh LithiumValley W16-E5 Smart Batteries (Ruiru & Kiambu)',
      '3.7kWp – 10kWp Residential Hybrid Solar (Growatt + 51.2V 100Ah LithiumValley, Embakasi & Nairobi Estates)',
      'EcoFlow Delta 2, Delta 2 Max & Delta Pro Apartment Power Backups (Zero Noise / Zero Fumes)',
      '12kW – 100kW Deye & Must Three-Phase Commercial Plants & Pressurized Solar Water Heaters',
    ],
    targetKeywords: [
      'solar panels price in Nairobi Kenya',
      'solar carport installation Ruiru Kenya',
      'Embakasi Baraka Estate solar installation',
      '16kWh LithiumValley W16-E5 battery price Kenya',
      'EPRA Contractor Category CV V1 Kenya',
      'Growatt Deye hybrid inverter Nairobi',
    ],
    deliveryNote: 'Same-Day Showroom Pickup or 2–4 Hour Express Delivery in Nairobi, Ruiru & Kiambu',
  },
  {
    id: 'meru',
    name: 'Meru & Mt. Kenya Region',
    region: 'Meru Town, Maua, Nkubu, Nanyuki, Timau, Chuka, Embu, Kirinyaga & Nyeri',
    peakSunHours: '5.6 – 6.2 kWh/m²/day',
    headline: 'Solar Borehole Water Pumps, Home Solar Kits & Batteries in Meru',
    summary:
      'Engineered for Meru’s thriving agricultural, miraa/horticultural irrigation, and residential estates. We supply and install high-head Doyin submersible borehole pumps, Horay N-Type bifacial solar panels, and off-grid/hybrid battery banks across Meru County.',
    topSolutions: [
      'Doyin 1.5HP – 10HP AC/DC Hybrid Submersible Solar Borehole Water Pumps',
      'Horay 580W – 630W N-Type Bifacial Solar Panels for High-Yield Irrigation',
      '3.5kVA – 10kVA Must & Deye Hybrid Inverters with Allgrand Gel or Lithium Valley Storage',
      'Pressurized Solar Water Heaters for Meru Homes, Hotels & Schools',
    ],
    targetKeywords: [
      'solar panels in Meru Kenya',
      'solar borehole water pump price Meru',
      'solar installation Meru County',
      'hybrid solar inverter and battery Meru',
      'Doyin solar water pumps Mt Kenya region',
    ],
    deliveryNote: 'Next-Morning Insured Dispatch & Scheduled EPRA Field Installation in Meru',
  },
  {
    id: 'mombasa',
    name: 'Mombasa & Coastal Region',
    region: 'Mombasa Island, Nyali, Bamburi, Diani, Kilifi, Malindi, Watamu, Mtwapa & Voi',
    peakSunHours: '6.0 – 6.5 kWh/m²/day',
    headline: 'Salt-Mist Resistant Solar Panels, AC-Capable Hybrid Inverters & Batteries in Mombasa',
    summary:
      'Coastal properties in Mombasa, Nyali, Diani, and Kilifi experience high daytime cooling loads and intense solar irradiation. Our N-Type monocrystalline panels and high-voltage Deye/Must hybrid inverters slash KPLC air-conditioning bills by up to 85%.',
    topSolutions: [
      'Low-Temperature-Coefficient JA Solar & Horay N-Type Bifacial Panels (Anti-PID / Salt-Mist Rated)',
      '10kW – 50kW Deye & Must Hybrid Inverters Capable of Running Air Conditioners & Pool Pumps',
      '10.24kWh – 30kWh Lithium Valley Wall & Rack LiFePO4 Batteries',
      'Corrosion-Resistant Stainless Steel Solar Water Heaters & Booster Pumps',
    ],
    targetKeywords: [
      'solar panels Mombasa price',
      'solar system installation Mombasa Nyali Diani',
      'hybrid inverter for air conditioner Mombasa',
      'lithium solar batteries Coast Kenya',
      'solar water pumps Kilifi Malindi',
    ],
    deliveryNote: '24-Hour Express Courier to Mombasa, Nyali, Diani, Kilifi & Malindi',
  },
  {
    id: 'kisumu',
    name: 'Kisumu, Lake Basin & Western Kenya',
    region: 'Kisumu City, Milimani, Riat Hills, Kakamega, Bungoma, Kisii, Homa Bay, Migori & Busia',
    peakSunHours: '5.8 – 6.3 kWh/m²/day',
    headline: 'Reliable Off-Grid & Hybrid Solar Power Backups in Kisumu & Western Kenya',
    summary:
      'Eliminate frequent grid voltage fluctuations and blackouts in Kisumu and the Lake Victoria Basin with EPRA-certified hybrid solar PV arrays, automatic voltage protection, and long-life LiFePO4 battery storage.',
    topSolutions: [
      '5kW – 12kW Hybrid Solar Systems with 0ms UPS Blackout Transfer',
      'Solar Lake & Borehole Irrigation Pumping Systems for Western Kenya Farms',
      'Institutional Solar Backup for Hospitals, Schools & Hotels in Kisumu',
      'All-in-One Solar Street Lights & Security Floodlights',
    ],
    targetKeywords: [
      'solar panels Kisumu Kenya',
      'solar installation companies in Kisumu',
      'solar power backup systems Kisumu Kakamega',
      'solar water pumps Lake Victoria Kisumu',
      'lithium battery price Kisumu',
    ],
    deliveryNote: '24-Hour Dispatch & Dedicated Western Kenya Installation Teams',
  },
  {
    id: 'nakuru',
    name: 'Nakuru, Naivasha, Gilgil & Rift Valley',
    region: 'Nakuru City, Milimani, Subukia, Gilgil, Naivasha, Nyahururu, Eldoret, Kericho & Narok',
    peakSunHours: '5.9 – 6.4 kWh/m²/day',
    headline: 'Residential, Farm & Geothermal-Belt Solar Solutions in Nakuru & Naivasha',
    summary:
      'With proven installations in Nakuru City, Subukia, and Gilgil, Shantis Designs is the trusted Rift Valley partner for off-grid homesteads, flower/horticultural farms, and residential solar water heating.',
    topSolutions: [
      'Full Off-Grid & Hybrid 5kW – 20kW Residential Solar Systems (As Deployed in Nakuru & Subukia)',
      '200L – 300L Evacuated Tube Solar Water Heaters (As Deployed in Gilgil)',
      'Deep-Well Doyin Solar Submersible Borehole Pumps for Rift Valley Ranches',
      'Rack-Mounted & Wall-Mounted Lithium Battery Banks',
    ],
    targetKeywords: [
      'solar installation Nakuru Kenya',
      'solar panels price in Nakuru Naivasha',
      'solar water heaters Gilgil Nakuru',
      'off grid solar systems Rift Valley Kenya',
      'solar borehole pumps Nakuru Subukia',
    ],
    deliveryNote: 'Same-Day / Next-Day Delivery Along the Nairobi–Naivasha–Nakuru Highway',
  },
  {
    id: 'isiolo',
    name: 'Isiolo, Laikipia, Marsabit & Northern Kenya',
    region: 'Isiolo Town, Nanyuki, Samburu, Marsabit, Moyale, Garissa, Wajir & Mandera',
    peakSunHours: '6.4 – 7.1 kWh/m²/day',
    headline: 'Heavy-Duty Off-Grid Solar Plants & Deep Borehole Water Pumps in Isiolo',
    summary:
      'Isiolo and Northern Kenya boast the highest solar irradiation in East Africa. We engineer rugged, dust-sealed IP65 off-grid solar mini-grids, community borehole pumping stations, and lodges/conservancy power systems.',
    topSolutions: [
      'High-Head Doyin 3HP – 10HP Solar Submersible Borehole Pumps for Arid & Semi-Arid Lands (ASAL)',
      '630W – 720W Horay N-Type High-Wattage Bifacial Solar Panels',
      'Off-Grid Hybrid Inverters & High-Temperature LiFePO4 Battery Cabinets',
      'DC Solar Refrigerators, Freezers & Community Lighting Kits',
    ],
    targetKeywords: [
      'solar borehole water pumps Isiolo Northern Kenya',
      'off grid solar systems Isiolo Marsabit Garissa',
      'solar panels price Isiolo Nanyuki',
      'Doyin submersible pump Isiolo',
      'commercial solar EPC Northern Kenya',
    ],
    deliveryNote: 'Direct Dispatch via Nanyuki–Isiolo Corridor with Field Commissioning Support',
  },
  {
    id: 'machakos',
    name: 'Machakos, Kitui, Makueni & Eastern Kenya',
    region: 'Machakos Town, Syokimau, Athi River, Lukenya, Matuu, Masii, Wote, Kibwezi & Kitui',
    peakSunHours: '6.0 – 6.6 kWh/m²/day',
    headline: 'Solar Borehole Pumps, Irrigation & Residential Solar Systems in Machakos',
    summary:
      'Machakos, Makueni, and Kitui lead Kenya in residential country homes and solar-powered borehole irrigation. We supply complete Doyin solar pump kits, elevated tank float automation, and hybrid home backup systems.',
    topSolutions: [
      'Complete Borehole Solarization Packages (Doyin Submersible Pump + Horay Panels + MPPT Controller)',
      '5kW – 10kW Hybrid Home Solar Systems for Machakos, Lukenya & Athi River Residences',
      'Solar Security Floodlights & Perimeter Street Lighting',
      'Lithium Valley & Allgrand Deep-Cycle Solar Battery Banks',
    ],
    targetKeywords: [
      'solar borehole pump price Machakos Kitui Makueni',
      'solar panels Machakos Athi River Syokimau',
      'solar water pump installation Machakos',
      'home solar backup systems Machakos County',
      'hybrid inverter price Machakos',
    ],
    deliveryNote: 'Same-Day Delivery to Syokimau, Athi River, Lukenya & Machakos Town',
  },
];

export const KenyaSeoHubPage: React.FC<KenyaSeoHubPageProps> = ({
  products,
  categories,
  onSelectCategory,
  onSelectProduct,
  onRequestQuote,
}) => {
  const [selectedCountyId, setSelectedCountyId] = useState<string>('all');

  const visibleCounties =
    selectedCountyId === 'all'
      ? KENYA_REGIONAL_HUBS
      : KENYA_REGIONAL_HUBS.filter(c => c.id === selectedCountyId);

  const featuredPanels = products
    .filter(p => (p.category_name || '').toLowerCase().includes('panel') || p.name.toLowerCase().includes('solar panel'))
    .slice(0, 4);

  const featuredBatteries = products
    .filter(
      p =>
        (p.category_name || '').toLowerCase().includes('batter') ||
        (p.category_name || '').toLowerCase().includes('lithium') ||
        (p.category_name || '').toLowerCase().includes('backup')
    )
    .slice(0, 4);

  const featuredInverters = products
    .filter(p => (p.category_name || '').toLowerCase().includes('inverter') || p.name.toLowerCase().includes('inverter'))
    .slice(0, 4);

  const featuredPumps = products
    .filter(p => (p.category_name || '').toLowerCase().includes('pump') || p.name.toLowerCase().includes('pump'))
    .slice(0, 4);

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* HERO SECTION (H1) */}
        <header className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-800 shadow-xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-[#F58220]/20 text-amber-300 border border-[#F58220]/40 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#F58220]" />
            <span>EPRA Contractor Cat CV & Vendor V1 Licensed • All 47 Counties in Kenya</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Best Solar Carports, Panels, Lithium Batteries & Borehole Pumps in Kenya — Nairobi, Ruiru, Meru, Mombasa, Kisumu, Nakuru, Isiolo & Machakos
          </h1>

          <p className="text-xs sm:text-base text-slate-300 max-w-4xl leading-relaxed">
            Shantis Designs Solar Solutions is Kenya’s premier EPRA Contractor Category CV & Vendor Category V1 supplier and installer of genuine Tier-1 <strong>Horay N-Type & JA Solar Panels</strong>, <strong>Growatt, Must & Deye Hybrid Inverters</strong>, <strong>LithiumValley 5kWh–16kWh (W16-E5) LiFePO4 Batteries</strong>, <strong>EcoFlow Power Backups</strong>, and <strong>Doyin Solar Borehole Pumps</strong>. Explore our regional solar engineering hubs and current Kenyan price guide below.
          </p>

          {/* County Selector Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedCountyId('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                selectedCountyId === 'all'
                  ? 'bg-[#F58220] text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Kenya Regions (47 Counties)
            </button>
            {KENYA_REGIONAL_HUBS.map(county => (
              <button
                key={county.id}
                onClick={() => setSelectedCountyId(county.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedCountyId === county.id
                    ? 'bg-[#238B3D] text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{county.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </header>

        {/* SECTION 1 (H2): COUNTY-BY-COUNTY SOLAR ENGINEERING HUBS */}
        <section className="space-y-6">
          <div>
            <span className="text-xs font-black uppercase text-[#F58220] tracking-wider">
              Nationwide Coverage & Regional Dispatch
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Solar Installation & Equipment Supply Across Nairobi, Meru, Mombasa, Kisumu, Nakuru, Isiolo & Machakos
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Tailored solar system sizing based on regional peak sun hours, KPLC grid reliability, borehole depths, and ambient temperatures.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {visibleCounties.map(county => (
              <article
                key={county.id}
                className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-[#238B3D] border border-emerald-200 px-3 py-1 rounded-full text-xs font-extrabold">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{county.name}</span>
                    </span>
                    <span className="text-xs font-bold text-[#F58220] bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                      Irradiation: {county.peakSunHours}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 leading-snug">
                    {county.headline}
                  </h3>

                  <p className="text-xs text-slate-500 font-medium">
                    <strong>Areas Served:</strong> {county.region}
                  </p>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {county.summary}
                  </p>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                    <p className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      Recommended Solar Systems for {county.name.split(' ')[0]}:
                    </p>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {county.topSolutions.map((sol, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#238B3D] shrink-0 mt-0.5" />
                          <span>{sol}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {county.targetKeywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-100 text-slate-600 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs font-bold text-[#238B3D]">{county.deliveryNote}</span>
                  <button
                    onClick={onRequestQuote}
                    className="inline-flex items-center justify-center gap-1.5 bg-[#F58220] hover:bg-[#e07214] text-white text-xs font-black px-4 py-2.5 rounded-xl cursor-pointer transition-colors shrink-0"
                  >
                    <span>Get {county.name.split(' ')[0]} Solar Quote</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* SECTION 2 (H2): HIGH-RANKING PRODUCT VERTICALS & LIVE KENYA PRICE GUIDE */}
        <section className="space-y-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-2xs">
          <div className="max-w-3xl">
            <span className="text-xs font-black uppercase text-[#238B3D] tracking-wider">
              Verified 2026 Kenya Solar Price Guide
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Top-Ranked Solar Panels, Lithium Batteries, Backups & Hybrid Inverters in Kenya
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Direct links to our highest-demand solar hardware categories and individual product pages with live Kenyan Shilling (KES) pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 1. Solar Panels */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#F58220] flex items-center justify-center">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Tier-1 Solar Panels in Kenya (500W – 720W)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Horay N-Type Bifacial, JA Solar & Jinko Monocrystalline
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onSelectCategory('solar-panels')}
                  className="text-xs font-extrabold text-[#238B3D] hover:underline cursor-pointer"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-2">
                {featuredPanels.map(p => (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 hover:border-[#F58220] cursor-pointer transition-colors text-xs"
                  >
                    <span className="font-bold text-slate-800 line-clamp-1">{p.name}</span>
                    <span className="font-black text-[#F58220] shrink-0 ml-2">
                      KES {(p.sale_price || p.price).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Lithium Batteries & Power Backups */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#238B3D] flex items-center justify-center">
                    <BatteryCharging className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Lithium Solar Batteries & Power Backups
                    </h3>
                    <p className="text-xs text-slate-500">
                      Lithium Valley LiFePO4 (5kWh–16kWh), EcoFlow & Allgrand Gel
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onSelectCategory('solar-batteries')}
                  className="text-xs font-extrabold text-[#238B3D] hover:underline cursor-pointer"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-2">
                {featuredBatteries.map(p => (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 hover:border-[#F58220] cursor-pointer transition-colors text-xs"
                  >
                    <span className="font-bold text-slate-800 line-clamp-1">{p.name}</span>
                    <span className="font-black text-[#F58220] shrink-0 ml-2">
                      KES {(p.sale_price || p.price).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Hybrid Solar Inverters */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Hybrid Solar Inverters (1.5kVA – 50kW)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Must PV1800 / PV1900, Deye Low & High Voltage, Growatt & Eastman
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onSelectCategory('solar-inverters')}
                  className="text-xs font-extrabold text-[#238B3D] hover:underline cursor-pointer"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-2">
                {featuredInverters.map(p => (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 hover:border-[#F58220] cursor-pointer transition-colors text-xs"
                  >
                    <span className="font-bold text-slate-800 line-clamp-1">{p.name}</span>
                    <span className="font-black text-[#F58220] shrink-0 ml-2">
                      KES {(p.sale_price || p.price).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Solar Borehole & Booster Water Pumps */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Doyin Solar Submersible Borehole Water Pumps
                    </h3>
                    <p className="text-xs text-slate-500">
                      DC & AC/DC Hybrid Stainless Steel Deep-Well Pumps
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onSelectCategory('water-pumps')}
                  className="text-xs font-extrabold text-[#238B3D] hover:underline cursor-pointer"
                >
                  View All →
                </button>
              </div>
              <div className="space-y-2">
                {featuredPumps.map(p => (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 hover:border-[#F58220] cursor-pointer transition-colors text-xs"
                  >
                    <span className="font-bold text-slate-800 line-clamp-1">{p.name}</span>
                    <span className="font-black text-[#F58220] shrink-0 ml-2">
                      KES {(p.sale_price || p.price).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 (H2): SHANTIS DESIGNS PAGE-1 GOOGLE SEO ARCHITECTURE & KEYWORD MATRIX */}
        <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                Search Engine Dominance Blueprint (shantisdesigns.co.ke)
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Nationwide Page-1 SEO Plan & Permalink Preservation Protocol
              </h2>
            </div>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-[#238B3D] hover:bg-[#1b7030] text-white text-xs font-bold px-4 py-2.5 rounded-xl shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>View Live SQL XML Sitemap (/sitemap.xml)</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2.5">
              <h3 className="text-sm font-black text-amber-400">
                1. 100% Permalink & Slug Continuity
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Every product URL (<code className="text-emerald-300">/product/[slug]/</code>), category archive (<code className="text-emerald-300">/product-category/[slug]/</code>), and core page (<code className="text-emerald-300">/shop/</code>, <code className="text-emerald-300">/projects/</code>, <code className="text-emerald-300">/about/</code>, <code className="text-emerald-300">/contact-2/</code>, <code className="text-emerald-300">/order-tracking/</code>) matches the live domain <strong>https://shantisdesigns.co.ke</strong> so zero backlinks or Google rankings are lost during migration.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2.5">
              <h3 className="text-sm font-black text-amber-400">
                2. JSON-LD Rich Snippets & Heading Hierarchy
              </h3>
              <p className="text-slate-300 leading-relaxed">
                Every page emits structured Schema.org JSON-LD (<code className="text-emerald-300">Product</code> with <code className="text-emerald-300">priceCurrency: KES</code>, <code className="text-emerald-300">LocalBusiness</code> with multi-county <code className="text-emerald-300">areaServed</code>, <code className="text-emerald-300">BreadcrumbList</code>, and <code className="text-emerald-300">FAQPage</code>) alongside strict semantic <code className="text-emerald-300">H1 → H2 → H3</code> headings.
              </p>
            </div>

            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2.5">
              <h3 className="text-sm font-black text-amber-400">
                3. High-Intent Transactional Keywords
              </h3>
              <p className="text-slate-300 leading-relaxed">
                All {products.length} products and {categories.length} categories are indexed with high-conversion commercial keywords targeting solar panels price in Kenya, lithium batteries Nairobi, hybrid inverters Mombasa, and solar borehole water pumps in Meru, Kisumu, Nakuru, Isiolo & Machakos.
              </p>
            </div>
          </div>
        </section>
        {/* SECTION 4 (H2): FREQUENTLY ASKED QUESTIONS (MATCHES SCHEMA.ORG FAQPage) */}
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 space-y-6">
          <div>
            <span className="text-xs font-black uppercase text-[#F58220] tracking-wider">
              EPRA Engineering & System Sizing FAQs
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Solar Installation, Carport & EPRA Category CV / V1 Questions in Kenya
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="text-sm font-black text-slate-900">
                Is Shantis Designs licensed by EPRA in Kenya?
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Yes. Shantis Designs Limited holds active <strong>EPRA Contractor Category CV</strong> and <strong>Vendor Category V1</strong> solar licenses alongside NCA electrical contractor registration for homes, carports, C&I plants, and borehole pumping across all 47 counties.
              </p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="text-sm font-black text-slate-900">
                Why choose a solar carport in Ruiru or Kiambu?
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Our structural steel solar carport canopy in Ruiru turns driveway shade into a 5kWp+ generation plant paired with a <strong>16kWh LithiumValley W16-E5</strong> battery—leaving your main roof untouched while running heavy household loads seamlessly.
              </p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
              <h3 className="text-sm font-black text-slate-900">
                Can a 3.7kWp hybrid eliminate daytime KPLC bills?
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Verified by live ShinePhone telemetry at <strong>Embakasi Baraka Estate</strong>, a 3.7kWp rooftop array paired with a Growatt hybrid inverter and 51.2V 100Ah LithiumValley battery maintains <strong>0.00W grid import</strong> all day while charging to 100%.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
