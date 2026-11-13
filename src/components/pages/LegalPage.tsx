import React from 'react';
import { ShieldCheck, Lock, FileText, Scale, CheckCircle2, ArrowLeft } from 'lucide-react';

interface LegalPageProps {
  mode: 'terms' | 'privacy';
  onBackHome: () => void;
  onSwitchMode: (mode: 'terms' | 'privacy') => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ mode, onBackHome, onSwitchMode }) => {
  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={onBackHome}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#F58220] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <div className="inline-flex rounded-xl bg-white p-1 border border-slate-200 shadow-2xs">
            <button
              onClick={() => onSwitchMode('terms')}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                mode === 'terms'
                  ? 'bg-[#F58220] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Terms & Conditions
            </button>
            <button
              onClick={() => onSwitchMode('privacy')}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold transition-colors cursor-pointer ${
                mode === 'privacy'
                  ? 'bg-[#238B3D] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Privacy Policy & Data Protection
            </button>
          </div>
        </div>

        {mode === 'terms' ? (
          <article className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8">
            <header className="border-b border-slate-200 pb-6 space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-orange-50 text-[#F58220] border border-orange-200 px-3 py-1 rounded-full text-xs font-bold">
                <Scale className="w-3.5 h-3.5" />
                <span>EPRA Licensed Solar EPC Terms of Sale & Service</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Terms and Conditions — Shantis Designs Solar Solutions
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Effective Date: November 2026 • Registered Entity: Shantis Designs Limited (Nairobi, Kenya)
              </p>
            </header>

            <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h2 className="text-lg font-extrabold text-slate-900">
                1. Scope of Agreement & Regulatory Compliance
              </h2>
              <p>
                These Terms and Conditions govern all retail, wholesale, e-commerce purchases, and turnkey Engineering, Procurement, and Construction (EPC) solar installations provided by <strong>Shantis Designs Limited</strong> (trading as <strong>Shantis Designs Solar Solutions</strong>), headquartered at Dev Towers, 2nd Floor, Biashara Street, and our Showroom at Royal King Building, Luthuli Street, Nairobi, Kenya. All solar photovoltaic, energy storage, and solar water heating installations are executed in strict compliance with the <strong>Energy and Petroleum Regulatory Authority (EPRA) Solar PV Regulations</strong> and <strong>Kenya Bureau of Standards (KEBS)</strong> requirements.
              </p>
            </section>

            <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h2 className="text-lg font-extrabold text-slate-900">
                2. Product Authenticity, Pricing & M-Pesa / Bank Payments
              </h2>
              <p>
                All solar panels (Horay N-Type, JA Solar, Jinko), hybrid inverters (Must, Deye, Growatt, Eastman), lithium batteries (Lithium Valley, EcoFlow, Dyness), gel batteries (Allgrand), and submersible water pumps (Doyin) listed on <strong>shantisdesigns.co.ke</strong> are 100% genuine, serialized manufacturer hardware. Prices are quoted in Kenyan Shillings (KES). Payments processed via M-Pesa Daraja STK Push, Till/Paybill, or bank transfer are verified cryptographically and logged in our SQL database before dispatch.
              </p>
            </section>

            <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h2 className="text-lg font-extrabold text-slate-900">
                3. Manufacturer Warranties & EPRA Workmanship Guarantee
              </h2>
              <ul className="space-y-2 pl-1">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#238B3D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Tier-1 Solar Panels:</strong> 12–15 Years Product Workmanship Warranty and 25–30 Years Linear Power Output Warranty.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#238B3D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Lithium Valley & LiFePO4 Batteries:</strong> 5 to 10 Years Manufacturer Warranty (6,000+ cycles at 80% Depth of Discharge) when paired with approved BMS-compatible hybrid inverters.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#238B3D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Hybrid Solar Inverters & Doyin Pumps:</strong> 1 to 5 Years Official Manufacturer Warranty against factory defects. Warranty is voided by unauthorized third-party tampering, lightning strikes without surge protection (SPD), or water ingress on indoor-rated units.
                  </span>
                </li>
              </ul>
            </section>

            <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h2 className="text-lg font-extrabold text-slate-900">
                4. Nationwide Delivery, Dispatch & Returns Policy
              </h2>
              <p>
                Orders within Nairobi and its environs qualify for same-day delivery from our Luthuli Street showroom or Mombasa Road/Thika Road warehouse. Countrywide orders to <strong>Meru, Mombasa, Kisumu, Nakuru, Isiolo, Machakos</strong>, and all 47 Kenyan counties are dispatched within 24 hours via insured courier partners. Returns or exchanges are accepted within 7 days of delivery provided the equipment remains in its original unopened packaging with serial seals intact.
              </p>
            </section>
          </article>
        ) : (
          <article className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8">
            <header className="border-b border-slate-200 pb-6 space-y-3">
              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-[#238B3D] border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>Kenya Data Protection Act (2019) & ODPC Compliant</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Privacy Policy & Customer Data Protection Protocol
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Last Audited: November 2026 • Office of the Data Protection Commissioner (ODPC) Standards
              </p>
            </header>

            <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h2 className="text-lg font-extrabold text-slate-900">
                1. How We Collect & Store Customer Data in Our SQL Database
              </h2>
              <p>
                When you place an order, request a solar installation quote, track an order, or initiate a WhatsApp inquiry on <strong>shantisdesigns.co.ke</strong>, we collect only the necessary personal data required to fulfill your request: full name, phone number, delivery location, email address, and M-Pesa transaction reference. All records are stored in our access-controlled server-side SQL database using parameterized queries and encrypted transport (HTTPS/TLS 1.3).
              </p>
            </section>

            <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h2 className="text-lg font-extrabold text-slate-900">
                2. Anti-Hacking, PII Protection & Zero Data Leakage Architecture
              </h2>
              <ul className="space-y-2 pl-1">
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#238B3D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Strict SQL Injection & XSS Prevention:</strong> Every API endpoint uses compiled SQLite prepared statements and recursive XSS input sanitization.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#238B3D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Customer PII Verification on Order Tracking:</strong> Public order lookups require dual verification (Order Number + matching customer phone/email) to prevent unauthorized third-party enumeration or leakage of customer addresses.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#238B3D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Cryptographic Password & 2FA Security:</strong> Administrative accounts are protected by salted `scrypt` password hashing, Two-Factor Authentication (2FA), and immutable audit logging.
                  </span>
                </li>
              </ul>
            </section>

            <section className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <h2 className="text-lg font-extrabold text-slate-900">
                3. Cookies, Consent & Your Rights Under Kenyan Law
              </h2>
              <p>
                We use essential session storage for your shopping cart, wishlist, and hardware comparison tray, and optional analytics cookies only with your explicit consent. Under the <strong>Kenya Data Protection Act, 2019</strong>, you have the right to request access to, correction of, or deletion of your personal data by contacting our Data Protection Desk at <strong>info@shantisdesigns.co.ke</strong> or calling <strong>0115 521 631</strong>.
              </p>
            </section>
          </article>
        )}
      </div>
    </div>
  );
};
