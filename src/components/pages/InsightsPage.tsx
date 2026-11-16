import React, { useState, useEffect } from 'react';
import { Article } from '../../types';
import { 
  BookOpen, 
  Clock, 
  User, 
  Calendar, 
  Tag, 
  ArrowRight, 
  X, 
  Share2,
  Check,
  Search
} from 'lucide-react';

interface InsightsPageProps {
  articles: Article[];
  activeArticleSlug?: string | null;
  onSelectArticleSlug?: (slug: string | null) => void;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({
  articles,
  activeArticleSlug = null,
  onSelectArticleSlug,
}) => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!activeArticleSlug) {
      setSelectedArticle(null);
      return;
    }
    const found = articles.find(
      a => a.slug.toLowerCase() === activeArticleSlug.toLowerCase()
    );
    if (found) setSelectedArticle(found);
  }, [activeArticleSlug, articles]);

  const openArticle = (article: Article) => {
    setSelectedArticle(article);
    onSelectArticleSlug?.(article.slug);
  };

  const closeArticle = () => {
    setSelectedArticle(null);
    onSelectArticleSlug?.(null);
  };

  const copyArticleUrl = (slug: string) => {
    const shareUrl = `${window.location.origin}/blog/${slug}/`;
    navigator.clipboard?.writeText(shareUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const filtered = articles.filter(a => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      a.title.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      (a.tags || []).some(t => t.toLowerCase().includes(q));

    const matchesCat = selectedCategory === 'all' || a.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = Array.from(new Set(articles.map(a => a.category).filter(Boolean)));

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 bg-[#F58220]/10 text-[#F58220] border border-[#F58220]/25 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <BookOpen className="w-4 h-4 text-[#F58220]" />
            <span>Kenya Solar Engineering & Policy Insights</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Solar Technology, EPRA Standards & Energy Sizing
          </h1>
          <p className="text-xs sm:text-base text-slate-600 mt-3 leading-relaxed">
            Expert engineering guides, EPRA regulations, KPLC electricity tariff calculations, and lithium battery comparisons written by EPRA Contractor Category CV & Vendor Category V1 licensed practitioners.
          </p>

          {/* Search Bar */}
          <div className="mt-6 max-w-md mx-auto relative">
            <input
              type="text"
              placeholder="Search Ruiru carport, Embakasi Growatt, EPRA, LithiumValley..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-[#F58220] shadow-2xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#238B3D] text-white shadow-md'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Insights ({articles.length})
          </button>
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat as string)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#238B3D] text-white shadow-md'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map(article => (
            <article
              key={article.id}
              onClick={() => openArticle(article)}
              className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer group"
            >
              <div>
                <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 bg-[#F58220] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {article.category || 'Solar Advisory'}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-300" />
                    <span>{article.read_time || '5 min read'}</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {article.published_at}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {article.author}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#F58220] transition-colors line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#238B3D] group-hover:text-[#1b7030]">
                <span>Read Full Analysis</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          ))}
        </div>

      </div>

      {/* Full Article Reader Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
          onClick={closeArticle}
        >
          <div 
            className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header image banner */}
            <div className="relative h-48 sm:h-64 bg-slate-100 shrink-0">
              <img
                src={selectedArticle.image_url}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <button
                onClick={closeArticle}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close article modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="bg-[#F58220] text-white text-[11px] font-bold px-2.5 py-0.5 rounded uppercase">
                  {selectedArticle.category || 'Technical Article'}
                </span>
                <h2 className="text-lg sm:text-2xl font-extrabold mt-1 text-white leading-tight">
                  {selectedArticle.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-white/80 mt-1">
                  <span>By {selectedArticle.author}</span>
                  <span>•</span>
                  <span>Published {selectedArticle.published_at}</span>
                </div>
              </div>
            </div>

            {/* Content text */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 font-medium text-xs">
                <strong>Key Takeaway:</strong> {selectedArticle.excerpt}
              </div>

              <div className="prose prose-slate max-w-none space-y-3 whitespace-pre-wrap">
                {selectedArticle.content}
              </div>

              {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-2 items-center text-xs">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  {selectedArticle.tags.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSearchQuery(t);
                        setSelectedCategory('all');
                        closeArticle();
                      }}
                      className="bg-slate-100 hover:bg-orange-50 hover:text-[#F58220] text-slate-600 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer"
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom bar */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs gap-3">
              <button
                type="button"
                onClick={() => copyArticleUrl(selectedArticle.slug)}
                className="inline-flex items-center gap-1.5 text-slate-600 hover:text-[#F58220] font-bold cursor-pointer"
              >
                {copiedSlug === selectedArticle.slug ? (
                  <Check className="w-4 h-4 text-[#238B3D]" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                <span>
                  {copiedSlug === selectedArticle.slug ? 'Article Link Copied' : 'Copy Article Link'}
                </span>
              </button>
              <button
                onClick={closeArticle}
                className="bg-[#238B3D] text-white font-bold py-2 px-5 rounded-xl cursor-pointer"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
