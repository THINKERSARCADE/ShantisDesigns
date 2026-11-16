import React from 'react';
import { ShieldCheck, Truck, Clock, Award } from 'lucide-react';

export const TrustBar: React.FC = () => {
  const pillars = [
    {
      icon: ShieldCheck,
      title: 'EPRA Cat CV & V1 & NCA Licensed',
      description: 'Authorized solar contractor (Cat CV) & vendor (Cat V1) in Kenya adhering to national safety codes.'
    },
    {
      icon: Award,
      title: '25-Year Equipment Warranties',
      description: 'Direct Bloomberg Tier-1 manufacturer warranties on panels, inverters & batteries.'
    },
    {
      icon: Truck,
      title: 'Countrywide Fast Delivery',
      description: 'Secure courier dispatch and on-site engineering support across all 47 Kenyan counties.'
    },
    {
      icon: Clock,
      title: 'Lipa na M-Pesa & WhatsApp',
      description: 'Seamless Daraja STK push payments or direct chat consultations with our engineers.'
    }
  ];

  return (
    <div className="bg-white border-y border-slate-200/80 py-6 sm:py-8 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {pillars.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-[#238B3D]">
                  <Icon className="w-5 h-5 text-[#238B3D]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight">
                    {item.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
