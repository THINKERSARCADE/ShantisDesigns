import React, { useState } from 'react';
import { Order } from '../../types';
import { PackageSearch, Clock, ShieldCheck, Lock } from 'lucide-react';
import { StorageService } from '../../services/storage';

interface OrderTrackingPageProps {
  orders: Order[];
  onExploreShop: () => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ onExploreShop }) => {
  const [orderIdInput, setOrderIdInput] = useState('');
  const [billingInput, setBillingInput] = useState('');
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    setLoading(true);
    setErrorMsg(null);

    const res = await StorageService.trackOrderSecure(orderIdInput, billingInput);
    setLoading(false);
    if (res.order) {
      setMatchedOrder(res.order);
    } else {
      setMatchedOrder(null);
      setErrorMsg(
        res.error ||
          'Order could not be verified. Please check both your Order ID and Billing Phone/Email.'
      );
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-1.5 bg-[#238B3D]/10 text-[#238B3D] border border-[#238B3D]/25 px-3.5 py-1 rounded-full text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-[#238B3D]" />
            <span>Encrypted SQL Order & Dispatch Verification</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Track Your Solar Equipment Order
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mx-auto">
            To protect customer privacy and dispatch security, enter both your Order ID (found on your receipt/SMS) and the Billing Phone Number or Email used at checkout.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <form onSubmit={handleTrack} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Order ID / Number *
                </label>
                <input
                  type="text"
                  required
                  value={orderIdInput}
                  onChange={e => setOrderIdInput(e.target.value)}
                  placeholder="e.g. SH-2026-1041"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-hidden focus:border-[#F58220] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Billing Phone or Email *
                </label>
                <input
                  type="text"
                  required
                  value={billingInput}
                  onChange={e => setBillingInput(e.target.value)}
                  placeholder="Phone number or email used at checkout"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 focus:outline-hidden focus:border-[#F58220] focus:bg-white"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Lock className="w-3.5 h-3.5 text-[#238B3D]" />
                <span>Protected by Kenya Data Protection Act (2019) PII verification</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#F58220] hover:bg-[#e07214] text-white font-black text-xs sm:text-sm px-6 py-3 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-2"
              >
                <PackageSearch className="w-4 h-4" />
                <span>{loading ? 'Verifying in SQL...' : 'Track Order'}</span>
              </button>
            </div>
          </form>

          {searched && (
            <div className="pt-6 border-t border-slate-200">
              {matchedOrder ? (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#238B3D] tracking-wider">
                        Verified SQL Order Record
                      </span>
                      <h2 className="text-lg font-black text-slate-900">
                        Order #{matchedOrder.order_number} — {matchedOrder.customer_name}
                      </h2>
                    </div>
                    <span className="bg-[#238B3D] text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                      Status: {matchedOrder.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-emerald-100">
                      <span className="text-slate-400 block">Delivery Location</span>
                      <strong className="text-slate-800">{matchedOrder.customer_location}</strong>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-emerald-100">
                      <span className="text-slate-400 block">Order Total</span>
                      <strong className="text-slate-900">
                        KES {matchedOrder.total.toLocaleString()}
                      </strong>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-emerald-100">
                      <span className="text-slate-400 block">M-Pesa / Ref</span>
                      <strong className="font-mono text-slate-800">
                        {matchedOrder.mpesa_receipt || 'Confirmed'}
                      </strong>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-800">Items in Dispatch:</p>
                    {matchedOrder.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between bg-white px-3.5 py-2 rounded-lg border border-slate-200 text-xs"
                      >
                        <span className="font-semibold text-slate-800">
                          {item.quantity}x {item.product_name}
                        </span>
                        <span className="font-bold text-slate-900">
                          KES {(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center space-y-3">
                  <Clock className="w-8 h-8 text-[#F58220] mx-auto" />
                  <h2 className="text-sm font-black text-slate-900">Order Verification Required</h2>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    {errorMsg ||
                      'We could not match that Order ID and phone/email combination. Need immediate dispatch status? Call our Luthuli Street desk on 0115 521 631.'}
                  </p>
                  <button
                    onClick={onExploreShop}
                    className="inline-flex items-center gap-1.5 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Return to Solar Shop
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
