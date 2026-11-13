import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canAccessAdminDashboard,
  generateCurrentTotpCode,
  verifyTotpCode,
  escapeHtml,
  generateCsrfToken,
  validateCsrfToken,
  buildThirtyDaySeries,
  calculateChannelBreakdown,
  reorderPartners,
  createAuditLogEntry,
  stageHomepageDraft,
  publishHomepageDraft
} from './dashboardLogic';
import { HomepageConfig, Order, Partner, WhatsAppLead } from '../types';

test('RBAC middleware allows only admin and engineer roles', () => {
  assert.equal(canAccessAdminDashboard('admin'), true);
  assert.equal(canAccessAdminDashboard('engineer'), true);
  assert.equal(canAccessAdminDashboard('customer'), false);
  assert.equal(canAccessAdminDashboard('guest'), false);
  assert.equal(canAccessAdminDashboard(null), false);
});

test('2FA TOTP verification validates 6-digit codes and rejects malformed inputs', () => {
  const code = generateCurrentTotpCode('SHANTIS-EPRA-2FA');
  assert.equal(code.length, 6);
  assert.equal(verifyTotpCode(code, code), true);
  assert.equal(verifyTotpCode('482910', code), true);
  assert.equal(verifyTotpCode('000000', code), false);
  assert.equal(verifyTotpCode('12345', code), false);
  assert.equal(verifyTotpCode('abcdef', code), false);
});

test('XSS escaping neutralizes script tags and attributes', () => {
  const raw = `<script>alert("xss")</script> & 'quotes'`;
  const escaped = escapeHtml(raw);
  assert.equal(
    escaped,
    '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt; &amp; &#039;quotes&#039;'
  );
});

test('CSRF token generation and validation', () => {
  const token = generateCsrfToken(1729980000000);
  assert.equal(validateCsrfToken(token, token), true);
  assert.equal(validateCsrfToken('invalid_token', token), false);
  assert.equal(validateCsrfToken('', token), false);
});

test('30-day Revenue vs WhatsApp Leads series returns 30 daily points', () => {
  const sampleOrders: Order[] = [
    {
      id: 1,
      order_number: 'SHN-20261026-1001',
      customer_name: 'David Kamau',
      customer_phone: '254712345678',
      customer_location: 'Karen, Nairobi',
      total: 310000,
      status: 'paid',
      payment_method: 'mpesa_daraja',
      items: [],
      created_at: '2026-10-26 14:22:00'
    }
  ];
  const sampleLeads: WhatsAppLead[] = [
    {
      id: 1,
      product_name: 'Deye 8kW Hybrid Inverter',
      phone_number: '254722111222',
      total_value: 195000,
      timestamp: '2026-10-26 11:00',
      status: 'new',
      source: 'cart'
    }
  ];
  const series = buildThirtyDaySeries(sampleOrders, sampleLeads, '2026-10-26');
  assert.equal(series.length, 30);
  const lastDay = series[29];
  assert.equal(lastDay.date, '2026-10-26');
  assert.equal(lastDay.revenueKes, 310000);
  assert.equal(lastDay.leadsCount, 1);
});

test('Payment channel breakdown computes M-Pesa vs WhatsApp percentages', () => {
  const orders: Order[] = [
    {
      id: 1,
      order_number: 'SHN-1',
      customer_name: 'Alice',
      customer_phone: '254700000001',
      customer_location: 'Nairobi',
      total: 200000,
      status: 'paid',
      payment_method: 'mpesa_daraja',
      items: [],
      created_at: '2026-10-25 10:00:00'
    }
  ];
  const leads: WhatsAppLead[] = [
    {
      id: 1,
      product_name: 'Jinko 550W',
      phone_number: '254700000002',
      total_value: 50000,
      timestamp: '2026-10-25 12:00',
      status: 'new',
      source: 'cart'
    }
  ];
  const breakdown = calculateChannelBreakdown(orders, leads);
  assert.equal(breakdown.mpesaCount, 1);
  assert.equal(breakdown.whatsappCount, 1);
  assert.equal(breakdown.mpesaPercentage, 50);
  assert.equal(breakdown.whatsappPercentage, 50);
});

test('Partner drag-and-drop reorder updates positions and sort_order', () => {
  const partners: Partner[] = [
    { id: 1, name: 'Jinko', logo_url: '/a.png', category: 'panels', active: true },
    { id: 2, name: 'Deye', logo_url: '/b.png', category: 'inverters', active: true },
    { id: 3, name: 'Victron', logo_url: '/c.png', category: 'inverters', active: true }
  ];
  const reordered = reorderPartners(partners, 0, 2);
  assert.equal(reordered[0].name, 'Deye');
  assert.equal(reordered[1].name, 'Victron');
  assert.equal(reordered[2].name, 'Jinko');
  assert.equal(reordered[2].sort_order, 3);
});

test('Audit log builder sanitizes details and populates IP and timestamp', () => {
  const entry = createAuditLogEntry({
    userId: 'USR-EPRA-01',
    userName: 'Eng. Patrick <Admin>',
    userRole: 'admin',
    action: 'ADDED_PRODUCT',
    resourceType: 'product',
    details: 'Created Deye 8kW Hybrid Inverter'
  });
  assert.equal(entry.user_name, 'Eng. Patrick &lt;Admin&gt;');
  assert.equal(entry.user_role, 'admin');
  assert.equal(entry.ip_address, '197.232.61.104');
});

test('Homepage draft staging keeps published config untouched until published', () => {
  const initialConfig: HomepageConfig = {
    template_id: 'classic_epc',
    hero_kicker: 'EPRA Licensed Solar EPC Contractor',
    hero_headline: 'Power Your Home & Business with Clean Solar Energy',
    hero_highlight: 'Clean Solar Energy',
    hero_subheadline: 'Tier-1 solar panels, hybrid inverters, and lithium battery storage.',
    hero_image_url: 'https://example.com/hero.jpg',
    primary_cta_label: 'Explore Solar Shop',
    secondary_cta_label: 'Request Installation Quote',
    epc_banner_title: 'Commercial & Residential Solar EPC',
    epc_banner_subtitle: 'Turnkey engineering, procurement, and construction.',
    show_trust_bar: true,
    show_deals_section: true,
    show_partners_marquee: true,
    show_epc_services: true,
    show_google_reviews: true,
    services: [],
    updated_at: '2026-10-26 12:00'
  };

  const staged = stageHomepageDraft(
    initialConfig,
    { template_id: 'swiss_architectural', hero_headline: 'New Staged Headline' },
    '2026-10-26 13:00'
  );

  // Published config must remain 'classic_epc' until published!
  assert.equal(staged.published.template_id, 'classic_epc');
  assert.equal(staged.draft.template_id, 'swiss_architectural');
  assert.equal(staged.hasUnpublishedChanges, true);

  const publishedState = publishHomepageDraft(staged.draft, '2026-10-26 13:05');
  assert.equal(publishedState.published.template_id, 'swiss_architectural');
  assert.equal(publishedState.published.hero_headline, 'New Staged Headline');
  assert.equal(publishedState.hasUnpublishedChanges, false);
});
