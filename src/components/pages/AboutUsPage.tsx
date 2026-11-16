import React from 'react';
import { AboutData } from '../../types';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  Settings2,
  PiggyBank,
  MapPin,
  Phone,
  Mail,
  Camera
} from 'lucide-react';

interface AboutUsPageProps {
  data: AboutData;
  onOpenQuote: () => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({ data, onOpenQuote }) => {
  // Real gallery images extracted from https://shantisdesigns.co.ke/about/ and editable in Admin Dashboard
  const defaultAboutGalleryImages = [
    {
      url: 'https://shantisdesigns.co.ke/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-20-at-08.33.51.jpeg',
      caption: 'Shantis Solar Field Engineering & Rooftop Array Commissioning'
    },
    {
      url: 'https://shantisdesigns.co.ke/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-18-at-22.01.38.jpeg',
      caption: 'Hybrid Inverter & Lithium Battery Storage Bank Installation'
    },
    {
      url: 'https://shantisdesigns.co.ke/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-20-at-08.33.46.jpeg',
      caption: 'Commercial & Institutional Solar PV Mounting Structure'
    },
    {
      url: 'https://shantisdesigns.co.ke/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-20-at-08.33.48.jpeg',
      caption: 'Tier-1 Monocrystalline Solar Panel Array Inspection'
    },
    {
      url: 'https://shantisdesigns.co.ke/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-20-at-08.33.48-1.jpeg',
      caption: 'High-Efficiency Solar Water Heating & Borehole Pumping Systems'
    },
    {
      url: 'https://shantisdesigns.co.ke/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-20-at-08.33.50.jpeg',
      caption: 'Clean Distribution Board & Protection Switchgear Wiring'
    },
    {
      url: 'https://shantisdesigns.co.ke/wp-content/uploads/2026/01/WhatsApp-Image-2026-01-20-at-08.33.53.jpeg',
      caption: 'Shantis Solar Solutions — Empowering Homes & Businesses Across Kenya'
    }
  ];

  const liveAboutGalleryImages =
    data.gallery_images && data.gallery_images.length > 0
      ? data.gallery_images
      : defaultAboutGalleryImages;

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Top Hero Section matching https://shantisdesigns.co.ke/about/ */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-[#238B3D]/10 text-[#238B3D] border border-[#238B3D]/25 px-3.5 py-1 rounded-full text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#238B3D]" />
            <span>EPRA Contractor Category CV & Vendor Category V1 • Shantis Designs Limited</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            {data.headline || 'Clean Energy, For a Greener Africa'}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl mx-auto">
            {data.subheading ||
              'Shantis Solar Solutions is a licensed solar engineering, procurement, and construction company dedicated to delivering reliable, affordable, and sustainable clean energy solutions across Africa.'}
          </p>
        </div>

        {/* Your Partner in Solar Energy Transformation */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            {data.partner_section_title || 'Your Partner in Solar Energy Transformation'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {data.partner_intro_1}
          </p>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {data.partner_intro_2}
          </p>
        </div>

        {/* Why Choose Shantis Solar */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Why Choose Shantis Solar
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {data.why_choose &&
              data.why_choose.map((item, idx) => {
                const icons = [ShieldCheck, Award, Settings2, PiggyBank];
                const IconComponent = icons[idx % icons.length];
                return (
                  <div
                    key={idx}
                    className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F58220] flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-[#F58220]" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Vision, Mission & Values */}
        <div className="bg-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-xl space-y-8">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-[#F58220] uppercase tracking-wider">
              Guiding Foundations
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Vision, Mission & Values
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <h3 className="text-base font-bold text-amber-400">Our Vision</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{data.vision}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-emerald-400">Our Mission</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{data.mission}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2">
            <h3 className="text-base font-bold text-white">Core Values</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              {data.core_values}
            </p>
          </div>
        </div>

        {/* Licensing & Certifications */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Licensing & Certifications
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data.certifications &&
              data.certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-2xl border-2 border-slate-200 text-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#238B3D] mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-[#238B3D]" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{cert.title}</h3>
                  <p className="text-xs font-semibold text-[#238B3D]">{cert.subtitle}</p>
                </div>
              ))}
          </div>
        </div>

        {/* Live Photo Gallery from https://shantisdesigns.co.ke/about/ */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-[#F58220]">
              <Camera className="w-4 h-4" />
              <span>Our Offers & Field Installations Gallery</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Shantis Solar in Action Across Kenya
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {liveAboutGalleryImages.map((img, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs group"
              >
                <div className="aspect-4/3 bg-slate-100 overflow-hidden">
                  <img
                    src={img.url}
                    alt={img.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-3.5">
                  <p className="text-xs font-bold text-slate-700">{img.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nairobi Locations & Contact Summary */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#F58220] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-slate-900 text-sm">Showroom & Head Office</h4>
              <p className="text-slate-600 mt-1">
                Showroom: Royal King Building, Luthuli Street, Nairobi
                <br />
                Head Office: Dev Towers, 2nd Floor, Biashara Street, Nairobi
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-[#238B3D] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-slate-900 text-sm">Direct Engineering Line</h4>
              <p className="text-slate-600 mt-1">
                Phone / WhatsApp: +254 115 521 631
                <br />
                Hours: Monday – Saturday, 8:00 AM – 6:00 PM
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-[#F58220] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-slate-900 text-sm">Corporate & Wholesale</h4>
              <p className="text-slate-600 mt-1">
                Email: info@shantis.co.ke
                <br />
                Postal: P.O Box 21377 – 00505, Nairobi, Kenya
              </p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-lg">
          <h3 className="text-2xl font-extrabold">
            Ready to Start Your Clean Energy Transformation?
          </h3>
          <p className="text-xs sm:text-sm text-white/90 max-w-xl mx-auto">
            Contact our licensed solar engineering team today for custom system sizing, commercial proposals, and EPRA certified installations.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenQuote}
              className="bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm py-3 px-8 rounded-xl shadow-md cursor-pointer transition-transform active:scale-95"
            >
              Request Free Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
