import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Settings2, Check } from 'lucide-react';

interface CookieConsentBannerProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

const CONSENT_STORAGE_KEY = 'shantis_cookie_consent_v1';

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({
  onOpenPrivacy,
  onOpenTerms,
}) => {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    try {
      const existing = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!existing) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const persistConsent = async (allowAnalytics: boolean, allowMarketing: boolean) => {
    const consentId = `consent-${Date.now()}`;
    const payload = {
      consentId,
      essential: true,
      analytics: allowAnalytics,
      marketing: allowMarketing,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage error
    }
    setVisible(false);

    try {
      await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // Non-blocking SQL consent log
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 z-50 max-w-4xl mx-auto">
      <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl border border-slate-700/90 p-4 sm:p-5 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F58220]/20 border border-[#F58220]/40 text-[#F58220] flex items-center justify-center shrink-0 mt-0.5">
              <Cookie className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xs sm:text-sm font-black text-white">
                  Privacy, Cookies & Data Security Notice (Kenya DPA 2019)
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> HTTPS & SQL Protected
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                We use essential cookies to keep your solar shopping cart, wishlist, and M-Pesa checkout secure, and optional cookies to optimize regional availability across Kenya. Read our{' '}
                <button
                  onClick={onOpenPrivacy}
                  className="text-amber-400 hover:underline font-bold cursor-pointer"
                >
                  Privacy Policy
                </button>{' '}
                and{' '}
                <button
                  onClick={onOpenTerms}
                  className="text-amber-400 hover:underline font-bold cursor-pointer"
                >
                  Terms & Conditions
                </button>
                .
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowCustomize(!showCustomize)}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Preferences</span>
            </button>
            <button
              onClick={() => persistConsent(false, false)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer transition-colors"
            >
              Essential Only
            </button>
            <button
              onClick={() => persistConsent(true, true)}
              className="px-4 py-2 rounded-xl bg-[#F58220] hover:bg-[#e07214] text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Accept All</span>
            </button>
          </div>
        </div>

        {showCustomize && (
          <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Strictly Necessary</p>
                <p className="text-[11px] text-slate-400">Cart, CSRF & SQL security</p>
              </div>
              <span className="text-[10px] font-black uppercase text-emerald-400">Always Active</span>
            </div>

            <label className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex items-center justify-between cursor-pointer">
              <div>
                <p className="font-bold text-white">Performance & SEO</p>
                <p className="text-[11px] text-slate-400">Speed & county search metrics</p>
              </div>
              <input
                type="checkbox"
                checked={analytics}
                onChange={e => setAnalytics(e.target.checked)}
                className="accent-[#F58220] w-4 h-4"
              />
            </label>

            <div className="flex items-center justify-between gap-2 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <label className="flex items-center justify-between flex-1 cursor-pointer">
                <div>
                  <p className="font-bold text-white">WhatsApp & Offers</p>
                  <p className="text-[11px] text-slate-400">Solar deals & bundles</p>
                </div>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={e => setMarketing(e.target.checked)}
                  className="accent-[#F58220] w-4 h-4 mr-2"
                />
              </label>
              <button
                onClick={() => persistConsent(analytics, marketing)}
                className="bg-[#238B3D] hover:bg-[#1b7030] text-white font-bold px-3 py-1.5 rounded-lg text-[11px] cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
