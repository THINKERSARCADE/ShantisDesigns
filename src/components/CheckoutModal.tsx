import React, { useState, useEffect, useRef } from 'react';
import { CartItem, Order } from '../types';
import {
  X,
  ShieldCheck,
  Smartphone,
  MessageCircle,
  CheckCircle2,
  Loader2,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { MpesaDarajaService } from '../services/mpesaDaraja';
import { StorageService } from '../services/storage';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderCompleted: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderCompleted,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('Nairobi');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa_daraja' | 'whatsapp'>('mpesa_daraja');

  // Gateway configuration availability
  const [mpesaConfigured, setMpesaConfigured] = useState<boolean | null>(null);
  const [mpesaShortcode, setMpesaShortcode] = useState<string>('');

  // Strict M-Pesa Daraja verification states
  const [stkStatus, setStkStatus] = useState<
    'idle' | 'processing' | 'awaiting_verification' | 'success' | 'failed'
  >('idle');
  const [pendingCheckoutId, setPendingCheckoutId] = useState<string>('');
  const [pendingOrderNumber, setPendingOrderNumber] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmittingWhatsapp, setIsSubmittingWhatsapp] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopPolling();
      return;
    }

    let active = true;
    setErrorMessage('');
    setStkStatus('idle');
    setPendingCheckoutId('');
    setPendingOrderNumber('');
    setStatusMessage('');

    StorageService.getMpesaPublicStatus().then((info) => {
      if (!active) return;
      setMpesaConfigured(info.configured);
      setMpesaShortcode(info.shortcode || '');
      if (!info.configured) {
        setPaymentMethod('whatsapp');
      }
    });

    return () => {
      active = false;
      stopPolling();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const total = items.reduce((sum, item) => {
    const price = item.product.sale_price || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  const buildOrderItems = () =>
    items.map((i, idx) => ({
      id: idx + 1,
      order_id: 0,
      product_id: i.product.id,
      product_name: i.product.name,
      product_image: i.product.image_url,
      quantity: i.quantity,
      price: i.product.sale_price || i.product.price,
    }));

  const validateForm = () => {
    if (!name.trim()) {
      setErrorMessage('Please enter your full name');
      return false;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter your phone number');
      return false;
    }
    const cleanPhone = MpesaDarajaService.formatKenyanPhone(phone);
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid Kenyan phone number (e.g., 0712345678 or 254...)');
      return false;
    }
    if (!location.trim()) {
      setErrorMessage('Please provide your delivery location (town/county)');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  // 1. WhatsApp Checkout Flow (Saved to SQL DB before opening WhatsApp)
  const handleWhatsAppCheckout = async () => {
    if (!validateForm()) return;
    stopPolling();
    setIsSubmittingWhatsapp(true);
    setErrorMessage('');

    const cleanPhone = MpesaDarajaService.formatKenyanPhone(phone);

    try {
      const newOrder = await StorageService.addOrder({
        customer_name: name,
        customer_phone: cleanPhone,
        customer_location: location,
        customer_notes: notes,
        total,
        status: 'pending',
        payment_method: 'whatsapp',
        items: buildOrderItems(),
      });

      const { url } = MpesaDarajaService.createWhatsAppCheckout(items, {
        name,
        phone: cleanPhone,
        location,
        notes: `Order Ref: ${newOrder.order_number}. ${notes}`,
      });

      setCompletedOrder(newOrder);
      onOrderCompleted(newOrder);
      window.open(url, '_blank');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to save WhatsApp order to SQL database. Please retry.');
    } finally {
      setIsSubmittingWhatsapp(false);
    }
  };

  const handleVerifiedPaidOrder = (orderNum: string, receipt?: string, serverOrder?: Order | null) => {
    stopPolling();
    const cleanPhone = MpesaDarajaService.formatKenyanPhone(phone);
    const finalizedOrder: Order = serverOrder || {
      id: Date.now(),
      order_number: orderNum || pendingOrderNumber || `SHN-${Date.now()}`,
      customer_name: name,
      customer_phone: cleanPhone,
      customer_email: '',
      customer_location: location,
      customer_notes: notes,
      total,
      status: 'paid',
      payment_method: 'mpesa_daraja',
      mpesa_receipt: receipt || undefined,
      checkout_request_id: pendingCheckoutId,
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
      items: buildOrderItems(),
    };
    setCompletedOrder(finalizedOrder);
    setStkStatus('success');
    onOrderCompleted(finalizedOrder);
  };

  const pollVerificationStatus = async (checkoutId: string, orderNum: string) => {
    const res = await StorageService.checkMpesaStatus(checkoutId);
    if (res.status === 'paid') {
      handleVerifiedPaidOrder(res.orderNumber || orderNum, res.receipt, res.order);
      return true;
    }
    if (res.status === 'declined') {
      stopPolling();
      setStkStatus('failed');
      setErrorMessage(
        res.resultDesc ||
          res.error ||
          'M-Pesa transaction was declined or cancelled. No purchase was completed.'
      );
      return true;
    }
    if (res.resultDesc) {
      setStatusMessage(res.resultDesc);
    }
    return false;
  };

  // 2. Live M-Pesa Daraja STK Push Flow — Never completes until Safaricom verifies Paid
  const handleInitiateMpesa = async () => {
    if (!mpesaConfigured) {
      setPaymentMethod('whatsapp');
      setErrorMessage(
        'M-Pesa gateway configuration is not available on this store. Please checkout via WhatsApp.'
      );
      return;
    }

    if (!validateForm()) return;

    stopPolling();
    setStkStatus('processing');
    setErrorMessage('');
    setStatusMessage('Sending STK Push request to Safaricom M-Pesa...');

    const cleanPhone = MpesaDarajaService.formatKenyanPhone(phone);

    const res = await StorageService.initiateMpesaStkPush({
      phone: cleanPhone,
      amount: total,
      customerName: name,
      customerLocation: location,
      items: buildOrderItems(),
    });

    if (!res.success) {
      if (res.status === 'unconfigured' || res.configured === false) {
        setMpesaConfigured(false);
        setPaymentMethod('whatsapp');
        setStkStatus('idle');
        setErrorMessage(
          res.error ||
            'M-Pesa configuration is not available. Please complete your purchase using Checkout via WhatsApp.'
        );
        return;
      }
      setStkStatus('failed');
      setErrorMessage(
        res.error || 'Safaricom M-Pesa declined the STK Push initiation. Please retry or use WhatsApp Checkout.'
      );
      return;
    }

    if (res.status === 'pending_verification' && res.checkoutRequestId) {
      const checkoutId = res.checkoutRequestId;
      const orderNum = res.orderNumber || '';
      setPendingCheckoutId(checkoutId);
      setPendingOrderNumber(orderNum);
      setStkStatus('awaiting_verification');
      setStatusMessage(
        res.message || 'Check your phone and enter your M-Pesa PIN. Waiting for Safaricom confirmation...'
      );

      let attempts = 0;
      const maxAttempts = 40; // ~2 minutes at 3s intervals

      pollTimerRef.current = setInterval(async () => {
        attempts += 1;
        const finished = await pollVerificationStatus(checkoutId, orderNum);
        if (finished) return;

        if (attempts >= maxAttempts) {
          stopPolling();
          setStkStatus('failed');
          setErrorMessage(
            'M-Pesa confirmation timed out before Safaricom verified your payment. Click "Re-check M-Pesa Status" if you already entered your PIN, or complete your order via WhatsApp.'
          );
        }
      }, 3000);
    } else {
      setStkStatus('failed');
      setErrorMessage('Unexpected M-Pesa gateway response. Please use Checkout via WhatsApp.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 max-h-[95vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#238B3D]" />
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Express Single-Page Checkout
              </h3>
              <p className="text-[11px] text-slate-500">
                Safe & Encrypted • Safaricom Daraja Verification & WhatsApp Direct
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopPolling();
              onClose();
            }}
            className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors cursor-pointer"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Order Success Screen (Only reached after WhatsApp DB confirmation or Daraja Verified Paid!) */}
          {completedOrder ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#238B3D] flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {completedOrder.status === 'paid'
                    ? 'M-Pesa Payment Verified & Confirmed'
                    : 'WhatsApp Order Recorded'}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-2">
                  Asante! Your Solar Order is Confirmed
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1">
                  Order Number: <strong className="text-slate-900">{completedOrder.order_number}</strong>
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-sm mx-auto text-left text-xs space-y-1.5 font-mono">
                {completedOrder.mpesa_receipt && (
                  <div className="text-emerald-700 font-bold flex items-center justify-between">
                    <span>M-PESA RECEIPT:</span>
                    <span>{completedOrder.mpesa_receipt}</span>
                  </div>
                )}
                <div className="text-slate-600 flex items-center justify-between">
                  <span>Order Total:</span>
                  <span className="font-bold text-slate-900">
                    KES {completedOrder.total.toLocaleString()}
                  </span>
                </div>
                <div className="text-slate-600 flex items-center justify-between">
                  <span>Customer:</span>
                  <span>{completedOrder.customer_name}</span>
                </div>
                <div className="text-slate-600 flex items-center justify-between">
                  <span>Destination:</span>
                  <span>{completedOrder.customer_location}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Our engineering team has received your order and will contact you on{' '}
                <strong className="text-slate-800">{completedOrder.customer_phone}</strong> to coordinate shipping and optional site installation.
              </p>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="bg-[#238B3D] hover:bg-[#1b7030] text-white font-bold text-xs sm:text-sm py-2.5 px-6 rounded-xl transition-colors cursor-pointer"
                >
                  Return to Store
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* M-Pesa Unconfigured Notice */}
              {mpesaConfigured === false && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-extrabold">
                      M-Pesa Automatic STK Push Configuration Not Available
                    </p>
                    <p className="text-[11px] text-amber-800">
                      Automated Safaricom M-Pesa Daraja keys are not configured on this store yet. Please complete your order via <strong>Checkout with WhatsApp</strong> below so our sales desk can process payment directly.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Notice */}
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Order Items Summary Snippet */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 font-medium">
                    Ordering ({items.length} solar items):
                  </span>
                  <p className="font-bold text-slate-800 line-clamp-1">
                    {items.map((i) => `${i.product.name} (x${i.quantity})`).join(', ')}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <span className="text-slate-500 font-medium">Total:</span>
                  <p className="text-sm font-extrabold text-[#F58220]">
                    KES {total.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Single-Page Form Fields */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  1. Customer & Delivery Information
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={stkStatus === 'awaiting_verification' || stkStatus === 'processing'}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-[#F58220] focus:bg-white disabled:opacity-60"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number (M-Pesa / WhatsApp) *
                    </label>
                    <input
                      type="tel"
                      placeholder="07XX XXX XXX or 254..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      disabled={stkStatus === 'awaiting_verification' || stkStatus === 'processing'}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-[#F58220] focus:bg-white disabled:opacity-60"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Delivery County / Town *
                    </label>
                    <input
                      type="text"
                      placeholder="Nairobi / Mombasa / Kisumu / Meru / Nakuru"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      disabled={stkStatus === 'awaiting_verification' || stkStatus === 'processing'}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-[#F58220] focus:bg-white disabled:opacity-60"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Installation / Delivery Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Delivery instructions or site details"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={stkStatus === 'awaiting_verification' || stkStatus === 'processing'}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-[#F58220] focus:bg-white disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  2. Select Payment Method
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* M-Pesa Option (Locked when unconfigured) */}
                  <label
                    onClick={() => {
                      if (mpesaConfigured === false) {
                        setErrorMessage(
                          'M-Pesa Daraja gateway is not configured on this server. Please checkout with WhatsApp.'
                        );
                        setPaymentMethod('whatsapp');
                        return;
                      }
                      setPaymentMethod('mpesa_daraja');
                    }}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                      mpesaConfigured === false
                        ? 'border-slate-200 bg-slate-100 opacity-70 cursor-not-allowed'
                        : paymentMethod === 'mpesa_daraja'
                        ? 'border-[#238B3D] bg-emerald-50/50 ring-2 ring-[#238B3D]/20 shadow-xs cursor-pointer'
                        : 'border-slate-200 hover:border-slate-300 bg-white cursor-pointer'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      disabled={mpesaConfigured === false || stkStatus === 'awaiting_verification'}
                      checked={paymentMethod === 'mpesa_daraja' && mpesaConfigured !== false}
                      onChange={() => {
                        if (mpesaConfigured !== false) setPaymentMethod('mpesa_daraja');
                      }}
                      className="mt-1 text-[#238B3D] focus:ring-[#238B3D]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-[#238B3D]" />
                        <span className="text-xs font-bold text-slate-900">
                          Lipa na M-Pesa (Daraja)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {mpesaConfigured === null
                          ? 'Checking M-Pesa gateway status...'
                          : mpesaConfigured === false
                          ? 'Unavailable (Daraja API not configured) — Use WhatsApp Checkout.'
                          : `Live STK Push verification required (${mpesaShortcode || 'Daraja'}).`}
                      </p>
                    </div>
                  </label>

                  {/* WhatsApp Option */}
                  <label
                    onClick={() => {
                      if (stkStatus !== 'awaiting_verification') setPaymentMethod('whatsapp');
                    }}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      paymentMethod === 'whatsapp'
                        ? 'border-[#F58220] bg-orange-50/50 ring-2 ring-[#F58220]/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      disabled={stkStatus === 'awaiting_verification'}
                      checked={paymentMethod === 'whatsapp'}
                      onChange={() => setPaymentMethod('whatsapp')}
                      className="mt-1 text-[#F58220] focus:ring-[#F58220]"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 text-[#F58220]" />
                        <span className="text-xs font-bold text-slate-900">
                          Checkout with WhatsApp
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Direct WhatsApp checkout with instant order reference saved to database.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Awaiting Strict Safaricom Daraja Verification Banner */}
              {(stkStatus === 'processing' || stkStatus === 'awaiting_verification') && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2.5">
                  <Loader2 className="w-6 h-6 animate-spin text-[#238B3D] mx-auto" />
                  <p className="text-xs font-extrabold text-emerald-900">
                    {stkStatus === 'processing'
                      ? `Connecting to Safaricom M-Pesa Daraja for ${phone}...`
                      : `Awaiting M-Pesa PIN & Confirmation for ${pendingOrderNumber || 'your order'}...`}
                  </p>
                  <p className="text-[11px] text-emerald-700">{statusMessage}</p>
                  {stkStatus === 'awaiting_verification' && (
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => pollVerificationStatus(pendingCheckoutId, pendingOrderNumber)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-[11px] font-bold cursor-pointer hover:bg-emerald-100"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Check Status Now</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          stopPolling();
                          setStkStatus('idle');
                          setPaymentMethod('whatsapp');
                        }}
                        className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[11px] font-bold cursor-pointer hover:bg-slate-800"
                      >
                        Cancel & Switch to WhatsApp Checkout
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Failed / Declined Recovery Controls */}
              {stkStatus === 'failed' && pendingCheckoutId && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => pollVerificationStatus(pendingCheckoutId, pendingOrderNumber)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-check M-Pesa Status</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStkStatus('idle');
                      setPaymentMethod('whatsapp');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#F58220] text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Checkout via WhatsApp Instead</span>
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2">
                {paymentMethod === 'mpesa_daraja' && mpesaConfigured ? (
                  <button
                    onClick={handleInitiateMpesa}
                    disabled={
                      stkStatus === 'processing' || stkStatus === 'awaiting_verification'
                    }
                    className="w-full bg-[#238B3D] hover:bg-[#1b7030] disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>
                      {stkStatus === 'awaiting_verification'
                        ? 'Verifying M-Pesa Payment...'
                        : `Pay KES ${total.toLocaleString()} via M-Pesa STK Push`}
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={handleWhatsAppCheckout}
                    disabled={isSubmittingWhatsapp || stkStatus === 'awaiting_verification'}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>
                      {isSubmittingWhatsapp
                        ? 'Saving Order to Database...'
                        : 'Confirm & Checkout via WhatsApp'}
                    </span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
