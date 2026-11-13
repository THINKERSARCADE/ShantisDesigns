import { WhatsAppLead, CartItem } from '../types';
import { StorageService } from './storage';

export interface DarajaConfig {
  consumerKey: string;
  consumerSecret: string;
  businessShortCode: string;
  passkey: string;
  callbackUrl: string;
  environment: 'sandbox' | 'production';
}

export const DEFAULT_DARAJA_CONFIG: DarajaConfig = {
  consumerKey: 'd7a6e19b840f4ac480a8b9f71c',
  consumerSecret: '4a1b92cd3ef81a029c',
  businessShortCode: '174379',
  passkey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919',
  callbackUrl: 'https://shantisdesigns.co.ke/api/mpesa/callback',
  environment: 'production'
};

export class MpesaDarajaService {
  /**
   * Sanitizes Kenyan phone numbers to the Daraja standard format: 2547XXXXXXXX or 2541XXXXXXXX
   */
  static formatKenyanPhone(phone: string): string {
    let clean = phone.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '254' + clean.slice(1);
    } else if (clean.startsWith('7') || clean.startsWith('1')) {
      clean = '254' + clean;
    } else if (clean.startsWith('+254')) {
      clean = clean.replace('+', '');
    }
    return clean;
  }

  static isValidKenyanPhone(phone: string): boolean {
    const formatted = this.formatKenyanPhone(phone);
    return /^254(7|1)\d{8}$/.test(formatted);
  }

  /**
   * Generates a realistic Safaricom M-Pesa receipt code
   * Example: QK891Z99P2
   */
  static generateMpesaReceipt(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'QK';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Builds the pre-filled WhatsApp Checkout URL and logs the lead
   */
  static createWhatsAppCheckout(
    items: CartItem[], 
    customer: { name: string; phone: string; location: string; notes?: string },
    companyPhone: string = '254722000000'
  ): { url: string; lead: WhatsAppLead } {
    const total = items.reduce((sum, item) => {
      const price = item.product.sale_price || item.product.price;
      return sum + price * item.quantity;
    }, 0);

    const itemsText = items.map((item, idx) => {
      const price = item.product.sale_price || item.product.price;
      return `${idx + 1}. *${item.product.name}* (x${item.quantity}) - KES ${(price * item.quantity).toLocaleString()}`;
    }).join('\n');

    const message = 
`☀️ *SHANTIS DESIGNS SOLAR - ORDER INQUIRY*
━━━━━━━━━━━━━━━━━━━━
*Customer Name:* ${customer.name}
*Customer Phone:* ${customer.phone}
*Delivery Location:* ${customer.location}
${customer.notes ? `*Notes:* ${customer.notes}\n` : ''}
*Ordered Solar Equipment:*
${itemsText}

💰 *TOTAL AMOUNT:* KES ${total.toLocaleString()}
━━━━━━━━━━━━━━━━━━━━
Hello Shantis Designs, I would like to confirm my order and arrange delivery / site assessment.`;

    const encoded = encodeURIComponent(message);
    const cleanCompanyPhone = companyPhone.replace(/\D/g, '');
    const url = `https://wa.me/${cleanCompanyPhone}?text=${encoded}`;

    // Log WhatsApp lead to persistent storage
    const lead = StorageService.addLead({
      product_name: items.map(i => `${i.product.name} (x${i.quantity})`).join(', '),
      phone_number: customer.phone,
      total_value: total,
      status: 'new',
      source: 'cart',
      notes: `Location: ${customer.location}. User initiated WhatsApp direct order.`
    });

    return { url, lead };
  }

  /**
   * Builds WhatsApp installation quote inquiry
   */
  static createWhatsAppQuoteInquiry(
    productName: string,
    customerPhone: string,
    customerLocation: string = 'Nairobi',
    companyPhone: string = '254722000000'
  ): string {
    const message = 
`☀️ *SHANTIS DESIGNS - SOLAR INSTALLATION QUOTE*
━━━━━━━━━━━━━━━━━━━━
*Product/System:* ${productName}
*Client Phone:* ${customerPhone}
*Site Location:* ${customerLocation}

Hello Shantis Designs Engineering Team,
I am requesting a formal quotation and site survey for the ${productName}. Please advise on sizing, EPRA certification, and labor costs.`;

    const cleanCompanyPhone = companyPhone.replace(/\D/g, '');
    return `https://wa.me/${cleanCompanyPhone}?text=${encodeURIComponent(message)}`;
  }
}
