import React from 'react';
import { Building2, Home, Droplets, Wrench, ArrowRight, CheckCircle2 } from 'lucide-react';

interface EpcServicesProps {
  onOpenQuote: () => void;
}

export const EpcServices: React.FC<EpcServicesProps> = ({ onOpenQuote }) => {
  const services = [
    {
      icon: Building2,
      title: 'Commercial & Industrial (C&I) Solar',
      description: 'Custom megawatt-scale rooftop and ground-mount PV plants for Kenyan manufacturers, floriculture, universities, and commercial complexes.',
      benefits: ['Up to 80% KPLC bill reduction', 'Power Purchase Agreement (PPA) options', 'EPRA licensed design'],
      tag: 'C&I EPC'
    },
    {
      icon: Home,
      title: 'Residential Hybrid & Off-Grid Solar',
      description: 'Zero-downtime backup solar with silent lithium batteries. Power your lights, borehole pump, Wi-Fi, refrigeration, and EV charger effortlessly.',
      benefits: ['Instant UPS transfer (<10ms)', 'Smart phone app monitoring', 'Net metering ready'],
      tag: 'Residential'
    },
    {
      icon: Droplets,
      title: 'Solar Borehole Pumping & Irrigation',
      description: 'High-head DC & AC submersible pumps engineered to lift groundwater up to 250m using direct sunlight. No expensive diesel generators required.',
      benefits: ['Zero ongoing fuel expenditure', 'Automatic dry-run protection', 'Over 100,000L daily yield'],
      tag: 'Agribusiness'
    },
    {
      icon: Wrench,
      title: 'Preventive Maintenance & EPRA Audits',
      description: 'Statutory energy audits, inverter firmware updates, solar panel thermal imaging, and EPRA Category CV & Vendor V1 compliance certification for insurance renewal.',
      benefits: ['Thermal drone scanning', 'Quarterly performance reports', 'Insurance compliant'],
      tag: 'Audits & O&M'
    }
  ];

  return (
    <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#F58220]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#238B3D]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block bg-[#238B3D]/30 border border-[#238B3D]/50 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
            Turnkey Engineering, Procurement & Construction
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            Comprehensive Solar EPC Solutions Across Kenya
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-2">
            From preliminary feasibility studies and EPRA licensing to professional installation and lifecycle maintenance.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div 
                key={idx}
                className="bg-slate-800/80 border border-slate-700/80 hover:border-[#F58220] rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between hover:bg-slate-800 group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center text-[#F58220] group-hover:bg-[#F58220] group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-700/60 px-2 py-0.5 rounded">
                      {srv.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#F58220] transition-colors">
                    {srv.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {srv.description}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-700/60">
                    {srv.benefits.map((b, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#238B3D] shrink-0" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-700/40">
                  <button
                    onClick={onOpenQuote}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-white group-hover:translate-x-1 transition-all cursor-pointer"
                  >
                    <span>Request Engineering Proposal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
