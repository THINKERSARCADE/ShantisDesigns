import React, { useState } from 'react';
import { Product } from '../types';
import { X, Send, ShieldCheck, Sun, CheckCircle2, MessageCircle } from 'lucide-react';
import { StorageService } from '../services/storage';
import { MpesaDarajaService } from '../services/mpesaDaraja';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}

export const QuoteModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Nairobi');
  const [monthlyBill, setMonthlyBill] = useState('KES 10,000 - 25,000');
  const [systemType, setSystemType] = useState('Residential Hybrid Solar (Backup + Grid)');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = MpesaDarajaService.formatKenyanPhone(phone);

    // Save lead in DB
    StorageService.addLead({
      product_name: product ? product.name : `Solar Installation (${systemType})`,
      phone_number: cleanPhone,
      total_value: product?.price || 250000,
      status: 'new',
      source: 'installation_request',
      notes: `Location: ${location}. Monthly Bill: ${monthlyBill}. System: ${systemType}. Notes: ${notes}`
    });

    setSubmitted(true);
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      `☀️ *SHANTIS DESIGNS - SOLAR INSTALLATION INQUIRY*\n━━━━━━━━━━━━━━━━━━━━\n*Name:* ${name}\n*Phone:* ${phone}\n*Location:* ${location}\n*Monthly KPLC Bill:* ${monthlyBill}\n*Desired System:* ${product ? product.name : systemType}\n${notes ? `*Notes:* ${notes}\n` : ''}\nHello Shantis Designs Engineering Team, please advise on system sizing, EPRA certification, and quotation.`
    );
    window.open(`https://wa.me/254712345678?text=${text}`, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#238B3D] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sun className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-extrabold text-base">Request Solar Installation Quote</h3>
              <p className="text-xs text-white/80">EPRA T3 Licensed Site Sizing & Assessment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg text-white transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#238B3D] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Quotation Request Received!</h4>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                Thank you, {name}. Our certified solar engineers will analyze your power requirements for {location} and reach out on {phone}.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleOpenWhatsApp}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Continue on WhatsApp Now</span>
                </button>
                <button
                  onClick={onClose}
                  className="text-xs text-slate-500 hover:text-slate-700 py-1"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {product && (
                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs flex items-center gap-2.5">
                  <span className="font-semibold text-amber-900">Selected Equipment:</span>
                  <span className="font-bold text-slate-900 truncate">{product.name}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mary Wanjiku"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-[#238B3D] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0712 345 678"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-[#238B3D] focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    County / Town in Kenya *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Kiambu / Nairobi / Kisumu"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-[#238B3D] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly KPLC Bill (approx.)
                  </label>
                  <select
                    value={monthlyBill}
                    onChange={(e) => setMonthlyBill(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-[#238B3D] focus:bg-white"
                  >
                    <option>Under KES 5,000</option>
                    <option>KES 5,000 - 15,000</option>
                    <option>KES 15,000 - 35,000</option>
                    <option>KES 35,000 - 80,000</option>
                    <option>Above KES 80,000 (Commercial)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  System Type Needed
                </label>
                <select
                  value={systemType}
                  onChange={(e) => setSystemType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-[#238B3D] focus:bg-white"
                >
                  <option>Residential Hybrid Solar (Backup + Grid)</option>
                  <option>Commercial Rooftop Solar (C&I)</option>
                  <option>Solar Borehole Water Pumping</option>
                  <option>Solar Water Heating (Pressurized 200L/300L)</option>
                  <option>Pure Off-Grid Remote Installation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specific Requirements or Appliances
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. 4-bedroom house with borehole pump and 2 fridges."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-[#238B3D] focus:bg-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#238B3D] hover:bg-[#1b7030] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit for Free Engineering Assessment</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
