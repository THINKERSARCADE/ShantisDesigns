import React, { useState, useEffect } from 'react';
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
  Film,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

interface ProjectsPageProps {
  projects: Project[];
  onRequestQuote: () => void;
  activeProjectSlug?: string | null;
  onSelectProjectSlug?: (slug: string | null) => void;
}

const getProjectVideos = (proj: Project | null): string[] => {
  if (!proj) return [];
  const raw = [...(proj.videos || []), ...(proj.video_url ? [proj.video_url] : [])]
    .map(v => v?.trim())
    .filter(Boolean) as string[];
  return Array.from(new Set(raw));
};

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  onRequestQuote,
  activeProjectSlug = null,
  onSelectProjectSlug,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [activeCaseStudy, setActiveCaseStudy] = useState<Project | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [modalMediaTab, setModalMediaTab] = useState<'photos' | 'videos'>('photos');
  const [activeVideoIndex, setActiveVideoIndex] = useState<number>(0);

  useEffect(() => {
    if (!activeProjectSlug) return;
    const matched = projects.find(
      p => p.slug?.toLowerCase() === activeProjectSlug.toLowerCase()
    );
    if (matched) {
      setActiveCaseStudy(matched);
      setActiveImageIndex(0);
      setActiveVideoIndex(0);
      setModalMediaTab('photos');
    }
  }, [activeProjectSlug, projects]);

  const openProjectGallery = (
    proj: Project,
    imgIndex = 0,
    initialTab: 'photos' | 'videos' = 'photos'
  ) => {
    setActiveCaseStudy(proj);
    setActiveImageIndex(imgIndex);
    setActiveVideoIndex(0);
    setModalMediaTab(initialTab);
    onSelectProjectSlug?.(proj.slug);
  };

  const closeProjectModal = () => {
    setActiveCaseStudy(null);
    onSelectProjectSlug?.(null);
  };

  // Always keep the latest projects on top (highest database ID first)
  const sortedProjects = [...projects].sort((a, b) => Number(b.id) - Number(a.id));

  // Featured case studies prioritizing newly added featured installs + flagship Ruiru Hybrid & Embakasi deliveries
  const newestCustomFeatured = sortedProjects.filter(
    p => p.featured && Number(p.id) > 16
  );
  const featuredSlugs = [
    'ruiru-carport-hybrid-solar-installation',
    'embakasi-baraka-estate-solar-installation',
    'tatu-city-solar-installation',
  ];
  const preferredFeatured = featuredSlugs
    .map(slug => sortedProjects.find(p => p.slug === slug))
    .filter((p): p is Project => Boolean(p));
  const remainingFeatured = sortedProjects.filter(
    p => p.featured && Number(p.id) <= 16 && !featuredSlugs.includes(p.slug)
  );
  const featuredProjects = [
    ...newestCustomFeatured,
    ...preferredFeatured,
    ...remainingFeatured,
  ].slice(0, 3);

  // Filter categories
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
      ? sortedProjects
      : sortedProjects.filter(
          p =>
            p.category_name?.toLowerCase() === selectedFilter.toLowerCase() ||
            (selectedFilter === 'Solar Installation' && p.category === 'residential') ||
            (selectedFilter === 'Solar Water Heating' && p.category === 'water_heating') ||
            (selectedFilter === 'Water Installation' && p.category === 'agricultural')
        );

  const totalPhotosCount = sortedProjects.reduce(
    (sum, p) => sum + (p.gallery && p.gallery.length > 0 ? p.gallery.length : 1),
    0
  );

  const currentGallery =
    activeCaseStudy?.gallery && activeCaseStudy.gallery.length > 0
      ? activeCaseStudy.gallery
      : activeCaseStudy
      ? [activeCaseStudy.image_url]
      : [];

  const currentVideos = getProjectVideos(activeCaseStudy);

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Page Hero */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-[#238B3D]/10 text-[#238B3D] border border-[#238B3D]/25 px-3.5 py-1 rounded-full text-xs font-bold mb-3 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#238B3D]" />
            <span>EPRA Cat CV & V1 Solar EPC Portfolio • {totalPhotosCount} Verified Field Photos</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Powering Kenya, one roof at a time.
          </h1>
          <p className="text-xs sm:text-base text-slate-600 mt-3 leading-relaxed">
            Residential, carport, institutional and commercial solar delivered by EPRA Contractor Category CV & Vendor V1 specialist Shantis Designs across Nairobi, Ruiru, Embakasi, Kiambu, Nakuru, Meru, Mombasa, Kisumu, Isiolo & Machakos.
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
                A closer look at the residential, solar carport & commercial installations our clients ask about most.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featuredProjects.map(proj => {
              const photos = proj.gallery && proj.gallery.length > 0 ? proj.gallery : [proj.image_url];
              const videos = getProjectVideos(proj);
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
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {Number(proj.id) >= 15 && (
                        <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                          Latest
                        </span>
                      )}
                      <span className="bg-[#F58220] text-white text-[11px] font-bold px-3 py-1 rounded-full">
                        {proj.system_size}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {videos.length > 0 && (
                        <span className="bg-[#238B3D] text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Film className="w-3.5 h-3.5" />
                          <span>Video</span>
                        </span>
                      )}
                      <span className="bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Camera className="w-3.5 h-3.5 text-amber-400" />
                        <span>{photos.length}</span>
                      </span>
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
                        <span>View Gallery ({photos.length}{videos.length > 0 ? ` + ${videos.length} Video` : ''})</span>
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
                Filter by category to inspect systems, site walkthrough videos, and installation photo galleries across Kenya.
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
              const videos = getProjectVideos(proj);
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

                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {videos.length > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openProjectGallery(proj, 0, 'videos');
                          }}
                          className="bg-[#238B3D] hover:bg-[#1b7030] text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md cursor-pointer"
                        >
                          <Film className="w-3.5 h-3.5" />
                          <span>Site Video</span>
                        </button>
                      )}
                      <div className="bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                        <Camera className="w-3.5 h-3.5 text-amber-400" />
                        <span>{photos.length} {photos.length === 1 ? 'Photo' : 'Site Photos'}</span>
                      </div>
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
                    <div className={`pt-2 grid grid-cols-1 ${videos.length > 0 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-2.5`}>
                      <button
                        onClick={() => openProjectGallery(proj, 0, 'photos')}
                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View {photos.length} Photos</span>
                      </button>
                      {videos.length > 0 && (
                        <button
                          onClick={() => openProjectGallery(proj, 0, 'videos')}
                          className="w-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Film className="w-3.5 h-3.5 text-[#F58220]" />
                          <span>Watch Video</span>
                        </button>
                      )}
                      <button
                        onClick={onRequestQuote}
                        className="w-full bg-[#238B3D] hover:bg-[#1b7030] text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
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

        {/* SECTION 3: Complete Field Installation Photo Archive */}
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
                Every photograph below is stored in our SQL database from real Shantis Designs solar carports, rooftop arrays, inverter rooms, lithium battery banks, and borehole water installations across Kenya.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {sortedProjects.flatMap(proj => {
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

        {/* Case Study & Multi-Photo / Multi-Video Lightbox Modal */}
        {activeCaseStudy && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
            onClick={closeProjectModal}
          >
            <div
              className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200 my-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Top Photo / Video Switcher when site videos exist */}
              {currentVideos.length > 0 && (
                <div className="bg-slate-900 px-5 py-2.5 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setModalMediaTab('photos')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        modalMediaTab === 'photos'
                          ? 'bg-[#F58220] text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Site Photos ({currentGallery.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalMediaTab('videos')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                        modalMediaTab === 'videos'
                          ? 'bg-[#238B3D] text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Site Walkthrough {currentVideos.length > 1 ? `Videos (${currentVideos.length})` : 'Video'}</span>
                    </button>
                  </div>
                  <button
                    onClick={closeProjectModal}
                    className="bg-slate-800 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Close</span>
                  </button>
                </div>
              )}

              <div className="relative aspect-16/9 bg-slate-950 flex items-center justify-center">
                {modalMediaTab === 'videos' && currentVideos.length > 0 ? (
                  <video
                    key={currentVideos[activeVideoIndex] || currentVideos[0]}
                    src={currentVideos[activeVideoIndex] || currentVideos[0]}
                    controls
                    playsInline
                    preload="metadata"
                    poster={activeCaseStudy.image_url}
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  <>
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
                  </>
                )}

                {currentVideos.length === 0 && (
                  <button
                    onClick={closeProjectModal}
                    className="absolute top-3 right-3 bg-black/75 hover:bg-red-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Close</span>
                  </button>
                )}
              </div>

              {/* Thumbnail or Multi-Video Switcher Strip inside Modal */}
              {modalMediaTab === 'videos' && currentVideos.length > 1 && (
                <div className="bg-slate-900 px-6 py-3 flex items-center gap-2 overflow-x-auto">
                  {currentVideos.map((_, vIdx) => (
                    <button
                      key={`modal-vid-${vIdx}`}
                      type="button"
                      onClick={() => setActiveVideoIndex(vIdx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 cursor-pointer flex items-center gap-1.5 ${
                        activeVideoIndex === vIdx
                          ? 'bg-[#238B3D] text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>Walkthrough Video {vIdx + 1}</span>
                    </button>
                  ))}
                </div>
              )}

              {modalMediaTab === 'photos' && currentGallery.length > 1 && (
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
                  {activeCaseStudy.seo_keywords && activeCaseStudy.seo_keywords.length > 0 && (
                    <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-1.5">
                      {activeCaseStudy.seo_keywords.slice(0, 4).map((kw, i) => (
                        <span
                          key={i}
                          className="bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md text-[11px] font-medium"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    closeProjectModal();
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
