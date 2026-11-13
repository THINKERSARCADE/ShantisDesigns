import React from 'react';
import { Partner } from '../types';

interface PartnersMarqueeProps {
  partners: Partner[];
}

export const PartnersMarquee: React.FC<PartnersMarqueeProps> = ({ partners }) => {
  const activePartners = partners.filter(p => p.active);

  return (
    <section className="py-10 bg-white border-b border-slate-200/80 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 text-center">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Authorized Direct Tier-1 Brand Partnerships
        </span>
        <h3 className="text-lg font-extrabold text-slate-800 mt-1">
          World-Class Solar Equipment Manufacturers
        </h3>
      </div>

      <div className="relative w-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
        <div className="animate-marquee flex items-center gap-12 sm:gap-16 py-2">
          {/* Duplicate list to make infinite continuous loop */}
          {[...activePartners, ...activePartners].map((partner, idx) => (
            <div
              key={`${partner.id}-${idx}`}
              className="flex items-center justify-center grayscale hover:grayscale-0 opacity-70 hover:opacity-100 transition-all duration-300 shrink-0 px-4 py-2 bg-slate-50 border border-slate-200/70 rounded-xl shadow-2xs hover:shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#238B3D]" />
                <span className="font-extrabold text-sm sm:text-base tracking-wider text-slate-800 font-display">
                  {partner.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
