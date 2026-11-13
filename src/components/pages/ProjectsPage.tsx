import React, { useState } from 'react';
import { Project } from '../../types';
import {
  MapPin,
  Calendar,
  Zap,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Sun,
  Layers,
  ExternalLink,
  Camera,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

interface ProjectsPageProps {
  projects: Project[];
  onRequestQuote: () => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ projects, onRequestQuote }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [activeCaseStudy, setActiveCaseStudy] = useState<Project | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const openProjectGallery = (proj: Project, imgIndex = 0) => {
    setActiveCaseStudy(proj);
    setActiveImageIndex(imgIndex);
  };

  // Featured case studies from live site
  const featuredSlugs = [
    'tatu-city-solar-installation',
    'secondary-school-solar-installation-in-ruiru',
    'thika-road-residential-solar-installation'
  ];
  const featuredProjects = projects
    .filter(p =>
      featuredSlugs.some(slug => p.slug === slug || p.title.toLowerCase().includes(slug.split('-')[0]))
    )
    .slice(0, 3);

  // Filter categories matching live site: All, Solar Installation, Solar Water Heating, Water Installation, Storage, Showroom
  const filterTabs = [
    'All',
    'Solar Installation',
    'Solar Water Heating',
    'Water Installation',
    'Storage',
    'Showroom'
  ];

  const filtered =
    selectedFilter === 'All'
      ? projects
      : projects.filter(
          p =>
            p.category_name?.toLowerCase() === selectedFilter.toLowerCase() ||
            (selectedFilter === 'Solar Installation' && p.category === 'residential') ||
            (selectedFilter === 'Solar Water Heating' && p.category === 'water_heating') ||
            (selectedFilter === 'Water Installation' && p.category === 'agricultural')
        );

  const totalPhotosCount = projects.reduce(
    (sum, p) => sum + (p.gallery && p.gallery.length > 0 ? p.gallery.length : 1),
    0
  );

  const currentGallery =
    activeCaseStudy?.gallery && activeCaseStudy.gallery.length > 0
      ? activeCaseStudy.gallery
      : activeCaseStudy
      ? [activeCaseStudy.image_url]
      : [];

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Page Hero */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-[#238B3D]/10 text-[#238B3D] border border-[#238B3D]/25 px-3.5 py-1 rounded-full text-xs font-bold mb-3 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#238B3D]" />
            <span>EPRA Licensed Solar EPC Portfolio • {totalPhotosCount} Verified Field Photos</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Powering Kenya, one roof at a time.
          </h1>
          <p className="text-xs sm:text-base text-slate-600 mt-3 leading-relaxed">
            Residential, institutional and commercial solar delivered by Shantis Designs across Nairobi, Kiambu, Nakuru, Kirinyaga, Meru, Mombasa, Kisumu, Isiolo & Machakos — inverters, lithium batteries, N-Type panels and complete backup systems engineered for African conditions.
          </p>

          {/* Exact 4 Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-[#F58220]">180+</p>
              <p className="text-[11px] text-slate-500 font-medium">Installations</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-[#238B3D]">1.2 MW</p>
              <p className="text-[11px] text-slate-500 font-medium">Capacity deployed</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-900">47</p>
              <p className="text-[11px] text-slate-500 font-medium">Counties reached</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-600">5 yr</p>
              <p className="text-[11px] text-slate-500 font-medium">Average warranty</p>
            </div>
          </div>
        </div>

        {/* SECTION 1: Featured Case Studies */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-black uppercase text-[#F58220] tracking-wider">
                Highlighted Engineering Deliveries
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Featured case studies
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                A closer look at the projects our clients ask about most.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featuredProjects.map(proj => {
              const photos = proj.gallery && proj.gallery.length > 0 ? proj.gallery : [proj.image_url];
              return (
                <div
                  key={`featured-${proj.id}`}
                  onClick={() => openProjectGallery(proj, 0)}
                  className="bg-slate-900 text-white rounded-3xl overflow-hidden border border-slate-800 shadow-lg hover:shadow-2xl transition-all flex flex-col justify-between group cursor-pointer"
                >
                  <div className="relative aspect-16/10 bg-slate-800 overflow-hidden">
                    <img
                      src={proj.image_url}
                      alt={proj.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3 bg-[#F58220] text-white text-[11px] font-bold px-3 py-1 rounded-full">
                      {proj.system_size}
                    </div>
                    <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>{photos.length} {photos.length === 1 ? 'Photo' : 'Photos'}</span>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{proj.location}</span>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                        {proj.category_name} • {proj.client}
                      </span>
                      <h3 className="text-lg font-extrabold text-white mt-1 group-hover:text-amber-300 transition-colors">
                        {proj.title}
                      </h3>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed line-clamp-3">
                        {proj.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-emerald-400 font-bold">{proj.kplc_savings}</span>
                      <span className="inline-flex items-center gap-1 font-bold text-white group-hover:text-[#F58220]">
                        <span>View Gallery ({photos.length})</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 2: Recent Solar Installations */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Recent solar installations
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Filter by category to see the systems and complete site photo galleries we’ve deployed across Kenya.
              </p>
            </div>

            {/* Category Filter Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {filterTabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedFilter(tab)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedFilter === tab
                      ? 'bg-[#F58220] text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filtered.map(proj => {
              const photos = proj.gallery && proj.gallery.length > 0 ? proj.gallery : [proj.image_url];
              return (
                <div
                  key={proj.id}
                  className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div
                    onClick={() => openProjectGallery(proj, 0)}
                    className="relative aspect-16/9 bg-slate-100 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={proj.image_url}
                      alt={proj.title}
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                    />

                    <div className="absolute top-3 left-3 bg-[#F58220] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                      {proj.category_name}
                    </div>

                    <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>{photos.length} {photos.length === 1 ? 'Photo' : 'Site Photos'}</span>
                    </div>

                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{proj.location}</span>
                    </div>

                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-1 rounded-lg flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-300" />
                      <span>{proj.completion_date}</span>
                    </div>
                  </div>

                  {/* Multi-Photo Thumbnail Strip when project has multiple gallery images */}
                  {photos.length > 1 && (
                    <div className="px-6 pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
                      {photos.slice(0, 6).map((imgUrl, idx) => (
                        <button
                          key={`${proj.id}-thumb-${idx}`}
                          onClick={() => openProjectGallery(proj, idx)}
                          className="relative w-14 h-11 rounded-lg overflow-hidden border border-slate-200 hover:border-[#F58220] shrink-0 cursor-pointer group"
                          title={`View ${proj.title} photo ${idx + 1}`}
                        >
                          <img
                            src={imgUrl}
                            alt={`${proj.title} thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            loading="lazy"
                          />
                          {idx === 5 && photos.length > 6 && (
                            <div className="absolute inset-0 bg-black/70 text-white text-[10px] font-black flex items-center justify-center">
                              +{photos.length - 6}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                        Client: {proj.client}
                      </span>
                      <h3
                        onClick={() => openProjectGallery(proj, 0)}
                        className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug hover:text-[#F58220] cursor-pointer transition-colors"
                      >
                        {proj.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                        {proj.description}
                      </p>
                    </div>

                    {/* Technical System Specs Breakdown */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-[#F58220]" /> System Size:
                        </span>
                        <span className="font-bold text-slate-900">{proj.system_size}</span>
                      </div>

                      {proj.panels_count && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 flex items-center gap-1.5">
                            <Sun className="w-3.5 h-3.5 text-amber-500" /> Solar Array / Collector:
                          </span>
                          <span className="font-semibold text-slate-800">{proj.panels_count}</span>
                        </div>
                      )}

                      {proj.inverter_specs && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-blue-500" /> Inverter / Controller:
                          </span>
                          <span className="font-semibold text-slate-800">{proj.inverter_specs}</span>
                        </div>
                      )}

                      {proj.battery_specs && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600 flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-emerald-500" /> Storage / Capacity:
                          </span>
                          <span className="font-semibold text-slate-800">{proj.battery_specs}</span>
                        </div>
                      )}

                      <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[#238B3D] font-bold">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-[#238B3D]" /> Impact:
                        </span>
                        <span>{proj.kplc_savings}</span>
                      </div>
                    </div>

                    {/* Action CTA */}
                    <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        onClick={() => openProjectGallery(proj, 0)}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View All {photos.length} Photos</span>
                      </button>
                      <button
                        onClick={onRequestQuote}
                        className="w-full bg-[#238B3D] hover:bg-[#1b7030] text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <span>Request Similar System</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: Complete Field Installation Photo Archive (All 80+ Live Site Images) */}
        <section className="space-y-6 pt-6 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-black uppercase text-[#238B3D] tracking-wider">
                Verified On-Site Engineering Archive
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Complete Field Installation Photo Gallery ({totalPhotosCount} Photos)
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Every photograph below is stored in our SQL database from real Shantis Designs rooftop arrays, inverter rooms, lithium battery banks, and borehole water installations across Kenya.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {projects.flatMap(proj => {
              const photos = proj.gallery && proj.gallery.length > 0 ? proj.gallery : [proj.image_url];
              return photos.map((imgUrl, idx) => (
                <div
                  key={`archive-${proj.id}-${idx}`}
                  onClick={() => openProjectGallery(proj, idx)}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-200 border border-slate-200 hover:border-[#F58220] cursor-pointer shadow-2xs"
                >
                  <img
                    src={imgUrl}
                    alt={`${proj.title} - Installation Photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[11px] font-bold text-white line-clamp-1">{proj.title}</p>
                    <p className="text-[10px] text-amber-300">{proj.location}</p>
                  </div>
                </div>
              ));
            })}
          </div>
        </section>

        {/* Case Study & Multi-Photo Lightbox Modal */}
        {activeCaseStudy && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setActiveCaseStudy(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 my-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative aspect-16/9 bg-slate-950 flex items-center justify-center">
                <img
                  src={currentGallery[activeImageIndex] || activeCaseStudy.image_url}
                  alt={`${activeCaseStudy.title} - Photo ${activeImageIndex + 1}`}
                  className="w-full h-full object-contain"
                />

                {currentGallery.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setActiveImageIndex(prev =>
                          prev === 0 ? currentGallery.length - 1 : prev - 1
                        )
                      }
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-[#F58220] text-white flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Previous project photo"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() =>
                        setActiveImageIndex(prev =>
                          prev === currentGallery.length - 1 ? 0 : prev + 1
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-[#F58220] text-white flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="Next project photo"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                <div className="absolute bottom-3 left-3 bg-black/75 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Photo {activeImageIndex + 1} of {currentGallery.length}
                </div>

                <button
                  onClick={() => setActiveCaseStudy(null)}
                  className="absolute top-3 right-3 bg-black/75 hover:bg-red-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Close</span>
                </button>
              </div>

              {/* Thumbnail Strip inside Modal */}
              {currentGallery.length > 1 && (
                <div className="bg-slate-900 px-6 py-3 flex items-center gap-2 overflow-x-auto">
                  {currentGallery.map((imgUrl, idx) => (
                    <button
                      key={`modal-thumb-${idx}`}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                        activeImageIndex === idx
                          ? 'border-[#F58220] scale-105'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-bold text-[#F58220] uppercase">
                    {activeCaseStudy.category_name}
                  </span>
                  <span>
                    {activeCaseStudy.location} • {activeCaseStudy.completion_date}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">{activeCaseStudy.title}</h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {activeCaseStudy.description}
                </p>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                  <p>
                    <strong>System Capacity:</strong> {activeCaseStudy.system_size}
                  </p>
                  {activeCaseStudy.panels_count && (
                    <p>
                      <strong>Array / Collector:</strong> {activeCaseStudy.panels_count}
                    </p>
                  )}
                  {activeCaseStudy.inverter_specs && (
                    <p>
                      <strong>Inverter / Pump:</strong> {activeCaseStudy.inverter_specs}
                    </p>
                  )}
                  {activeCaseStudy.battery_specs && (
                    <p>
                      <strong>Storage:</strong> {activeCaseStudy.battery_specs}
                    </p>
                  )}
                  <p className="text-[#238B3D] font-bold">
                    <strong>Outcome:</strong> {activeCaseStudy.kplc_savings}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveCaseStudy(null);
                    onRequestQuote();
                  }}
                  className="w-full bg-[#F58220] hover:bg-[#e07214] text-white font-black py-3 rounded-xl text-xs sm:text-sm cursor-pointer"
                >
                  Request Quote for a Similar Installation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
