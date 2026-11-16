import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Award,
  MessageCircle,
  ChevronRight
} from 'lucide-react';
import { NavPage } from './Header';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenSitemap: () => void;
  onSelectCategory: (slug: string) => void;
  onOpenQuote: () => void;
  onNavigate?: (page: NavPage) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdmin,
  onOpenSitemap,
  onSelectCategory,
  onOpenQuote,
  onNavigate
}) => {
  const go = (page: NavPage) => {
    if (onNavigate) {
      onNavigate(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#FEE2D1] text-slate-800 pt-14 pb-8 border-t border-[#f8cbb0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Authentic 4-Column Peach Grid matching live website */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-[#ebd2c2]">
          {/* Column 1: Store Information & Live Contacts */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider pb-2 border-b-2 border-[#F58220] inline-block">
              Store Information
            </h4>

            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              Shantis Solar Solutions (trading under Shantis Designs Limited) is an EPRA-licensed solar EPC engineering & distribution company in Nairobi, Kenya.
            </p>

            <div className="space-y-2.5 text-xs text-slate-800">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#F58220] shrink-0 mt-0.5" />
                <span>
                  <strong>Head Office:</strong> Dev Towers, 2nd Floor, Biashara Street, Nairobi
                </span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#238B3D] shrink-0 mt-0.5" />
                <span>
                  <strong>Showroom:</strong> Royal King Building, Luthuli Street, Nairobi
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#238B3D] shrink-0" />
                <a
                  href="tel:+254115521631"
                  className="font-bold hover:text-[#F58220] transition-colors"
                >
                  +254 115 521 631
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F58220] shrink-0" />
                <a
                  href="mailto:info@shantis.co.ke"
                  className="hover:text-[#F58220] transition-colors"
                >
                  info@shantis.co.ke • P.O Box 21377 – 00505
                </a>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/254115521631?text=Hello%20Shantis%20Solar,%20I%20am%20inquiring%20about%20equipment%20from%20shantisdesigns.co.ke"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#238B3D] hover:bg-[#1b7030] text-white font-bold text-xs px-3.5 py-2 rounded-lg shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp: +254 115 521 631</span>
              </a>
            </div>
          </div>

          {/* Column 2: Authentic Live Categories with Exact Counts */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider pb-2 border-b-2 border-[#F58220] inline-block">
              Product Categories
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-700">
              <li>
                <button
                  onClick={() => onSelectCategory('water-pumps')}
                  className="hover:text-[#F58220] transition-colors flex items-center justify-between w-full text-left cursor-pointer"
                >
                  <span>Water Pumps</span>
                  <span className="text-slate-500 font-normal">(60)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('solar-inverters')}
                  className="hover:text-[#F58220] transition-colors flex items-center justify-between w-full text-left cursor-pointer"
                >
                  <span>Solar Inverters</span>
                  <span className="text-slate-500 font-normal">(33)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('solar-batteries')}
                  className="hover:text-[#F58220] transition-colors flex items-center justify-between w-full text-left cursor-pointer"
                >
                  <span>Solar Batteries</span>
                  <span className="text-slate-500 font-normal">(29)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('solar-panels')}
                  className="hover:text-[#F58220] transition-colors flex items-center justify-between w-full text-left cursor-pointer"
                >
                  <span>Solar Panels</span>
                  <span className="text-slate-500 font-normal">(16)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('solar-power-backup')}
                  className="hover:text-[#F58220] transition-colors flex items-center justify-between w-full text-left cursor-pointer"
                >
                  <span>Solar Power backup</span>
                  <span className="text-slate-500 font-normal">(13)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('must-inverter')}
                  className="hover:text-[#F58220] transition-colors flex items-center justify-between w-full text-left cursor-pointer"
                >
                  <span>Must inverter</span>
                  <span className="text-slate-500 font-normal">(11)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('solar-lights')}
                  className="hover:text-[#F58220] transition-colors flex items-center justify-between w-full text-left cursor-pointer"
                >
                  <span>SOLAR LIGHTS</span>
                  <span className="text-slate-500 font-normal">(8)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('lithium-valley')}
                  className="hover:text-[#F58220] transition-colors flex items-center justify-between w-full text-left cursor-pointer"
                >
                  <span>Lithium Valley</span>
                  <span className="text-slate-500 font-normal">(6)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Pages, Regional SEO Hubs & Legal Compliance */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider pb-2 border-b-2 border-[#F58220] inline-block">
              Pages & Customer Care
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-700">
              <li>
                <button
                  onClick={() => go('about')}
                  className="hover:text-[#F58220] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#F58220]" />
                  <span>About Us</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => go('projects')}
                  className="hover:text-[#F58220] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#F58220]" />
                  <span>Our Projects Portfolio</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => go('kenya-seo')}
                  className="hover:text-[#F58220] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#F58220]" />
                  <span>Kenya Regional Solar Hubs (47 Counties)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => go('contact')}
                  className="hover:text-[#F58220] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#F58220]" />
                  <span>Contact Us & Showroom Locations</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => go('order-tracking')}
                  className="hover:text-[#F58220] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#F58220]" />
                  <span>Track Your Order</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => go('insights')}
                  className="hover:text-[#F58220] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#F58220]" />
                  <span>Solar Blog & Engineering Guides</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => go('terms')}
                  className="hover:text-[#F58220] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#F58220]" />
                  <span>Terms & Conditions</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => go('privacy')}
                  className="hover:text-[#F58220] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#F58220]" />
                  <span>Privacy Policy & Data Protection</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSitemap}
                  className="hover:text-[#F58220] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#F58220]" />
                  <span>XML Sitemap & Search Index</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-[#238B3D] transition-colors flex items-center gap-1.5 text-slate-900 font-bold cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-[#238B3D]" />
                  <span>Admin Dashboard Portal</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Licensing, Certifications & Payment */}
          <div className="space-y-4">
            <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider pb-2 border-b-2 border-[#F58220] inline-block">
              Licensing & Compliance
            </h4>

            <div className="space-y-2.5 text-xs text-slate-800">
              <div className="flex items-start gap-2 bg-white/80 p-2 rounded-lg border border-[#eed0be]">
                <ShieldCheck className="w-4 h-4 text-[#238B3D] shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-slate-900">EPRA Licensed (Cat CV & V1)</p>
                  <p className="text-[11px] text-slate-600">Contractor Category CV & Vendor Category V1</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white/80 p-2 rounded-lg border border-[#eed0be]">
                <Award className="w-4 h-4 text-[#F58220] shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-slate-900">NCA Registered</p>
                  <p className="text-[11px] text-slate-600">Electrical Engineering Contractor</p>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white/80 p-2 rounded-lg border border-[#eed0be]">
                <ShieldCheck className="w-4 h-4 text-[#238B3D] shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-slate-900">Tax & Data Compliant</p>
                  <p className="text-[11px] text-slate-600">KRA Certified & Kenya DPA (2019)</p>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Accepted Payment Channels
              </p>
              <div className="flex items-center gap-2">
                <span className="bg-[#238B3D] text-white text-[10px] font-black px-2 py-0.5 rounded shadow-2xs">
                  LIPA NA M-PESA
                </span>
                <span className="bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-2xs">
                  EFT / RTGS
                </span>
                <span className="bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-2xs">
                  DIRECT BANK
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-3">
          <p>
            © {new Date().getFullYear()} Shantis Designs Limited (trading as Shantis Solar Solutions). All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <button onClick={() => go('terms')} className="hover:text-[#F58220] font-semibold cursor-pointer">
              Terms & Conditions
            </button>
            <span>•</span>
            <button onClick={() => go('privacy')} className="hover:text-[#F58220] font-semibold cursor-pointer">
              Privacy Policy
            </button>
            <span>•</span>
            <span>Nairobi • Meru • Mombasa • Kisumu • Nakuru • Isiolo • Machakos</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
