import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Building2,
  Send,
  CheckCircle2,
  MessageCircle,
  Globe
} from 'lucide-react';
import { StorageService } from '../../services/storage';

interface ContactPageProps {
  onLeadSubmitted?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onLeadSubmitted }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    StorageService.addLead({
      product_id: null,
      product_name: subject || 'Contact Us Inquiry (/contact-2/)',
      phone_number: phone,
      total_value: 0,
      status: 'new',
      notes: `${name} (${email || 'No email'}): ${message}`,
      source: 'direct_chat'
    });

    if (onLeadSubmitted) onLeadSubmitted();
    setSubmitted(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Hero matching https://shantisdesigns.co.ke/contact-2/ */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 bg-[#238B3D]/10 text-[#238B3D] border border-[#238B3D]/25 px-3.5 py-1 rounded-full text-xs font-bold">
            Official Nairobi Showroom & Engineering Support
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
            Don’t hesitate to contact us if you need help.
          </h1>
          <p className="text-xs sm:text-base text-slate-600 leading-relaxed">
            Visit our Nairobi Showroom on Luthuli Street, our Head Office at Dev Towers on Biashara Street, or reach out to our EPRA-licensed solar engineers for system sizing and wholesale inquiries across Nairobi, Meru, Mombasa, Kisumu, Nakuru, Isiolo & Machakos.
          </p>
        </div>

        {/* 4 Contact Info Cards from live /contact-2/ page */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#F58220] flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Showroom & Head Office
            </h2>
            <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
              <p>
                <strong className="text-slate-900">Showroom:</strong> Royal King Building, Luthuli Street, Nairobi
              </p>
              <p>
                <strong className="text-slate-900">Head Office:</strong> Dev Towers, 2nd Floor, Biashara Street, Nairobi
              </p>
              <p>
                <strong className="text-slate-900">Postal Address:</strong> P.O Box 21377 – 00505, Nairobi, Kenya
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#238B3D] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Logistics & Godown
            </h3>
            <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
              <p>
                <strong className="text-slate-900">Proposed Godown:</strong> Along Mombasa Road or Thika Road
              </p>
              <p>
                Free delivery in Nairobi and its environs, with express countrywide dispatch across all 47 counties.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#F58220] flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Call or Email Us
            </h3>
            <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
              <p>
                <strong className="text-slate-900">Phone:</strong>{' '}
                <a href="tel:+254115521631" className="text-[#238B3D] font-bold hover:underline">
                  +254 115 521 631
                </a>
              </p>
              <p>
                <strong className="text-slate-900">Email:</strong>{' '}
                <a href="mailto:info@shantis.co.ke" className="text-[#F58220] font-bold hover:underline">
                  info@shantis.co.ke
                </a>
              </p>
              <p className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>www.shantisdesigns.co.ke</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-[#238B3D] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Opening Hours
            </h3>
            <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
              <p className="font-bold text-slate-900">Monday – Saturday: 8am – 6pm</p>
              <p>24/7 Emergency Technical & WhatsApp Support available for installed hybrid systems.</p>
            </div>
          </div>
        </div>

        {/* Contact Form + Embedded Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Form */}
          <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">
              Send Us a Message
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Have a question about solar panels, lithium batteries, Doyin borehole pumps, or turnkey EPC installation? Our team responds promptly.
            </p>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-[#238B3D] mx-auto" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Thank You! Your Inquiry Has Been Received.
                </h3>
                <p className="text-xs text-slate-600">
                  Our solar engineering desk at Dev Towers / Luthuli Street will contact you shortly on <strong>{phone}</strong>.
                </p>
                <div className="pt-2 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setPhone('');
                      setEmail('');
                      setSubject('');
                      setMessage('');
                    }}
                    className="bg-white border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
                  >
                    Send Another Message
                  </button>
                  <a
                    href={`https://wa.me/254115521631?text=${encodeURIComponent(
                      `Hello Shantis Designs, my name is ${name}. ${message}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#238B3D] text-white text-xs font-bold px-4 py-2 rounded-xl inline-flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Continue on WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. John Kamau"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-[#F58220] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="e.g. +254 712 345 678"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-[#F58220] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@company.co.ke"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-[#F58220] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subject / Inquiry Type
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="Solar Backup / Borehole Pump / Quote"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-[#F58220] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Tell us about your power requirements, location, or product inquiry..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-[#F58220] focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#F58220] hover:bg-[#e07214] text-white font-black py-3.5 px-6 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message to Shantis Solar</span>
                </button>
              </form>
            )}
          </div>

          {/* Embedded Google Map for Royal King Building, Luthuli Street, Nairobi */}
          <div className="lg:col-span-6 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Nairobi Showroom Location
                </h3>
                <p className="text-xs text-slate-500">
                  Royal King Building, Luthuli Street & Dev Towers, Biashara Street, Nairobi CBD
                </p>
              </div>
              <a
                href="https://maps.google.com/maps?q=Royal%20King%20Building%2C%20Luthuli%20Street%2C%20Nairobi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#238B3D] hover:underline"
              >
                Open in Google Maps →
              </a>
            </div>

            <div className="aspect-4/3 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
              <iframe
                title="Royal King Building, Luthuli Street, Nairobi"
                src="https://maps.google.com/maps?q=Royal%20King%20Building%2C%20Luthuli%20Street%2C%20Nairobi&t=m&z=15&output=embed&iwloc=near"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
