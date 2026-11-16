import React, { useState, useMemo } from 'react';
import { GoogleReview } from '../types';
import { GOOGLE_BUSINESS_PROFILE_URL } from '../data/initialData';
import {
  Star,
  CheckCircle2,
  ExternalLink,
  Heart,
  SlidersHorizontal,
  Search,
  Store,
  Check,
} from 'lucide-react';

interface GoogleReviewsSectionProps {
  reviews: GoogleReview[];
}

export const GoogleReviewsSection: React.FC<GoogleReviewsSectionProps> = ({ reviews }) => {
  const [selectedKeyword, setSelectedKeyword] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevant' | 'newest' | 'highest' | 'lowest'>('relevant');
  const [searchQuery, setSearchQuery] = useState('');
  const [likedIds, setLikedIds] = useState<number[]>([]);

  const avgRating = useMemo(() => {
    if (!reviews.length) return '5.0';
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const keywordCounts = useMemo(() => {
    const counts: Record<string, number> = {
      inverter: 0,
      batteries: 0,
      panels: 0,
      installations: 0,
    };
    reviews.forEach((r) => {
      const lower = `${r.text} ${(r.keywords || []).join(' ')}`.toLowerCase();
      if (lower.includes('inverter')) counts.inverter += 1;
      if (lower.includes('batter')) counts.batteries += 1;
      if (lower.includes('panel')) counts.panels += 1;
      if (lower.includes('install')) counts.installations += 1;
    });
    return counts;
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    let list = [...reviews];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.author_name.toLowerCase().includes(q) ||
          r.text.toLowerCase().includes(q) ||
          (r.owner_reply || '').toLowerCase().includes(q)
      );
    }

    if (selectedKeyword !== 'all') {
      list = list.filter((r) => {
        const lower = `${r.text} ${(r.keywords || []).join(' ')}`.toLowerCase();
        return lower.includes(selectedKeyword);
      });
    }

    if (sortBy === 'newest') {
      list.sort((a, b) => a.id - b.id);
    } else if (sortBy === 'highest') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'lowest') {
      list.sort((a, b) => a.rating - b.rating);
    }

    return list;
  }, [reviews, selectedKeyword, sortBy, searchQuery]);

  const toggleLike = (id: number) => {
    setLikedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <section className="py-14 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Google Business Profile Rating Summary Box */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-slate-800/90 border border-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                <span className="flex items-center">
                  <span className="text-blue-400">G</span>
                  <span className="text-red-400">o</span>
                  <span className="text-amber-400">o</span>
                  <span className="text-blue-400">g</span>
                  <span className="text-emerald-400">l</span>
                  <span className="text-red-400">e</span>
                </span>
                <span className="text-slate-200">Business Profile Reviews</span>
                <span className="text-emerald-400 flex items-center gap-1 ml-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Reviews about Shantis Designs Solar Solutions
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                {avgRating} ★ ({reviews.length || 5}) • Solar energy equipment supplier • Luthuli avenue, Munyu Lane, Nairobi
              </p>
            </div>

            {/* 5.0 Star Score + 5-Bar Distribution */}
            <div className="flex flex-wrap items-center gap-6 bg-slate-950/70 p-4 sm:p-5 rounded-2xl border border-slate-800">
              <div className="text-center pr-4 border-r border-slate-800">
                <div className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {avgRating}
                </div>
                <div className="flex items-center justify-center gap-0.5 text-amber-400 my-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-400 font-semibold">({reviews.length || 5})</p>
              </div>

              {/* Histogram Bars matching Google Reviews screenshot */}
              <div className="space-y-1.5 w-36 sm:w-44">
                {[5, 4, 3, 2, 1].map((star) => {
                  const countForStar = reviews.filter((r) => Math.round(r.rating) === star).length;
                  const pct = reviews.length > 0 ? Math.round((countForStar / reviews.length) * 100) : star === 5 ? 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-[11px]">
                      <span className="text-slate-400 w-3 font-mono">{star}</span>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2">
                <a
                  href={GOOGLE_BUSINESS_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 bg-[#F58220] hover:bg-[#e07318] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                  <span>View on Google</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href={GOOGLE_BUSINESS_PROFILE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2 rounded-xl transition-colors border border-slate-700"
                >
                  <span>Write a Review</span>
                </a>
              </div>
            </div>
          </div>

          {/* Filter Pills & Sort Controls matching the Google Mobile Reviews UI */}
          <div className="pt-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Keyword Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reviews..."
                  className="pl-8 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400 w-40 sm:w-48"
                />
              </div>

              <button
                onClick={() => setSelectedKeyword('all')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  selectedKeyword === 'all'
                    ? 'bg-slate-700 text-white border-slate-500'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
              </button>

              <button
                onClick={() => setSelectedKeyword(selectedKeyword === 'inverter' ? 'all' : 'inverter')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  selectedKeyword === 'inverter'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                inverter {keywordCounts.inverter || 2}
              </button>

              <button
                onClick={() => setSelectedKeyword(selectedKeyword === 'batter' ? 'all' : 'batter')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  selectedKeyword === 'batter'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                batteries {keywordCounts.batteries || 2}
              </button>

              <button
                onClick={() => setSelectedKeyword(selectedKeyword === 'panel' ? 'all' : 'panel')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                  selectedKeyword === 'panel'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                panels {keywordCounts.panels || 2}
              </button>
            </div>

            {/* Sort Buttons (Most relevant, Newest, Highest, Lowest) */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'relevant', label: 'Most relevant' },
                  { id: 'newest', label: 'Newest' },
                  { id: 'highest', label: 'Highest' },
                  { id: 'lowest', label: 'Lowest' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSortBy(tab.id)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    sortBy === tab.id
                      ? 'bg-slate-700 text-white border border-slate-600'
                      : 'bg-slate-800/60 text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  {sortBy === tab.id && <Check className="w-3 h-3 text-emerald-400" />}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Google Reviews Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((rev) => {
            const isLiked = likedIds.includes(rev.id);
            const displayLikes = (rev.likes_count ?? 1) + (isLiked ? 1 : 0);
            const hasOriginalPhoto =
              Boolean(rev.author_photo) && !rev.author_photo.includes('ui-avatars.com');

            return (
              <article
                key={rev.id}
                className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-lg hover:border-slate-700 transition-all"
              >
                <div className="space-y-4">
                  {/* Reviewer Header */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {hasOriginalPhoto ? (
                        <img
                          src={rev.author_photo}
                          alt={rev.author_name}
                          className="w-11 h-11 rounded-full object-cover border border-slate-700 shrink-0 bg-slate-800"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-[#238B3D] text-white font-black text-base flex items-center justify-center border border-emerald-600 shrink-0">
                          {(rev.author_name || 'G').trim().charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-white truncate">
                          {rev.author_name}
                        </h3>
                        <p className="text-xs text-slate-400 truncate">
                          {rev.reviewer_badge || '1 review'}
                          {rev.location ? ` • ${rev.location}` : ''}
                        </p>
                      </div>
                    </div>

                    <a
                      href={rev.google_review_url || GOOGLE_BUSINESS_PROFILE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open on Google Business Profile"
                      className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Stars + Time Ago Badge */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded text-[11px] font-semibold">
                      {rev.time_ago}
                    </span>
                  </div>

                  {/* Review Body Text */}
                  {rev.text ? (
                    <p className="text-sm text-slate-200 leading-relaxed">
                      {rev.text}
                    </p>
                  ) : (
                    <p className="text-xs italic text-slate-400">
                      Rated {rev.rating || 5}/5 stars on Google Business Profile
                    </p>
                  )}

                  {/* Heart Likes Counter */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => toggleLike(rev.id)}
                      className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isLiked ? 'fill-red-500 text-red-500' : 'fill-red-500/80 text-red-500'
                        }`}
                      />
                      <span className="font-semibold">{displayLikes}</span>
                    </button>
                  </div>

                  {/* Owner Reply Block (matching Shantis Designs Solar Solutions (Owner) in screenshot) */}
                  {rev.owner_reply && (
                    <div className="mt-3 pl-4 border-l-2 border-slate-700 space-y-2 bg-slate-950/50 p-3.5 rounded-r-xl">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center relative shrink-0">
                          <Store className="w-3.5 h-3.5 text-slate-200" />
                          <span className="w-3 h-3 rounded-full bg-blue-500 text-white flex items-center justify-center absolute -bottom-0.5 -right-0.5 text-[8px] font-bold">
                            ✓
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">
                            Shantis Designs Solar Solutions (Owner)
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {rev.owner_reply_time || 'a week ago'}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {rev.owner_reply}
                      </p>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
