import React from 'react';
import type { IconKey, TeamMemberData, TeamMemberDisplay } from '@/types/team';

// ── Icon Components ──────────────────────────────────────────────────────

function IconPeople() {
  return React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
    React.createElement('path', { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' }),
    React.createElement('circle', { cx: 9, cy: 7, r: 4 }),
    React.createElement('path', { d: 'M23 21v-2a4 4 0 0 0-3-3.87' }),
    React.createElement('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' }),
  );
}

function IconGear() {
  return React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
    React.createElement('circle', { cx: 12, cy: 12, r: 3 }),
    React.createElement('path', { d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z' }),
  );
}

function IconDiamond() {
  return React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
    React.createElement('path', { d: 'M6 3h12l4 6-10 13L2 9z' }),
    React.createElement('path', { d: 'M2 9h20' }),
    React.createElement('path', { d: 'M10 3l-4 6 6 13 6-13-4-6' }),
  );
}

function IconHandshake() {
  return React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
    React.createElement('path', { d: 'M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.65l.78.77L12 20.64l7.64-7.64.78-.77a5.4 5.4 0 0 0 0-7.65z' }),
  );
}

function IconChart() {
  return React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
    React.createElement('line', { x1: 18, y1: 20, x2: 18, y2: 10 }),
    React.createElement('line', { x1: 12, y1: 20, x2: 12, y2: 4 }),
    React.createElement('line', { x1: 6, y1: 20, x2: 6, y2: 14 }),
  );
}

function IconReport() {
  return React.createElement('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
    React.createElement('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
    React.createElement('polyline', { points: '14 2 14 8 20 8' }),
    React.createElement('line', { x1: 16, y1: 13, x2: 8, y2: 13 }),
    React.createElement('line', { x1: 16, y1: 17, x2: 8, y2: 17 }),
    React.createElement('polyline', { points: '10 9 9 9 8 9' }),
  );
}

function IconInbox() {
  return React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
    React.createElement('polyline', { points: '22 12 16 12 14 15 10 15 8 12 2 12' }),
    React.createElement('path', { d: 'M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z' }),
  );
}

function IconGlobe() {
  return React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
    React.createElement('circle', { cx: 12, cy: 12, r: 10 }),
    React.createElement('line', { x1: 2, y1: 12, x2: 22, y2: 12 }),
    React.createElement('path', { d: 'M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z' }),
  );
}

function IconMegaphone() {
  return React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
    React.createElement('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' }),
  );
}

function IconCalendar() {
  return React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
    React.createElement('rect', { x: 3, y: 4, width: 18, height: 18, rx: 2, ry: 2 }),
    React.createElement('line', { x1: 16, y1: 2, x2: 16, y2: 6 }),
    React.createElement('line', { x1: 8, y1: 2, x2: 8, y2: 6 }),
    React.createElement('line', { x1: 3, y1: 10, x2: 21, y2: 10 }),
  );
}

function IconChat() {
  return React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
    React.createElement('path', { d: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' }),
  );
}

function IconCamera() {
  return React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
    React.createElement('path', { d: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z' }),
    React.createElement('circle', { cx: 12, cy: 13, r: 4 }),
  );
}

function IconSearch() {
  return React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
    React.createElement('circle', { cx: 11, cy: 11, r: 8 }),
    React.createElement('line', { x1: 21, y1: 21, x2: 16.65, y2: 16.65 }),
  );
}

function IconPhone() {
  return React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
    React.createElement('path', { d: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' }),
  );
}

function IconFilter() {
  return React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
    React.createElement('polygon', { points: '22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3' }),
  );
}

function IconDatabase() {
  return React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
    React.createElement('ellipse', { cx: 12, cy: 5, rx: 9, ry: 3 }),
    React.createElement('path', { d: 'M21 12c0 1.66-4 3-9 3s-9-1.34-9-3' }),
    React.createElement('path', { d: 'M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5' }),
  );
}

function IconRefresh() {
  return React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
    React.createElement('polyline', { points: '23 4 23 10 17 10' }),
    React.createElement('path', { d: 'M20.49 15a9 9 0 1 1-2.12-9.36L23 10' }),
  );
}

function IconBuilding() {
  return React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
    React.createElement('rect', { x: 4, y: 2, width: 16, height: 20, rx: 2, ry: 2 }),
    React.createElement('line', { x1: 9, y1: 6, x2: 9, y2: 6.01 }),
    React.createElement('line', { x1: 15, y1: 6, x2: 15, y2: 6.01 }),
    React.createElement('line', { x1: 9, y1: 10, x2: 9, y2: 10.01 }),
    React.createElement('line', { x1: 15, y1: 10, x2: 15, y2: 10.01 }),
    React.createElement('line', { x1: 9, y1: 14, x2: 9, y2: 14.01 }),
    React.createElement('line', { x1: 15, y1: 14, x2: 15, y2: 14.01 }),
    React.createElement('line', { x1: 9, y1: 18, x2: 15, y2: 18 }),
  );
}

function IconTarget() {
  return React.createElement('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' },
    React.createElement('circle', { cx: 12, cy: 12, r: 10 }),
    React.createElement('circle', { cx: 12, cy: 12, r: 6 }),
    React.createElement('circle', { cx: 12, cy: 12, r: 2 }),
  );
}

// ── Icon Registry ────────────────────────────────────────────────────────

export const ICON_REGISTRY: Record<IconKey, () => React.ReactNode> = {
  people: IconPeople,
  gear: IconGear,
  diamond: IconDiamond,
  handshake: IconHandshake,
  chart: IconChart,
  report: IconReport,
  inbox: IconInbox,
  globe: IconGlobe,
  megaphone: IconMegaphone,
  calendar: IconCalendar,
  chat: IconChat,
  camera: IconCamera,
  search: IconSearch,
  phone: IconPhone,
  filter: IconFilter,
  database: IconDatabase,
  refresh: IconRefresh,
  building: IconBuilding,
  target: IconTarget,
};

export function getIcon(key: IconKey): React.ReactNode {
  const Icon = ICON_REGISTRY[key];
  return Icon ? Icon() : null;
}

// ── All available icon keys (for dropdowns) ──────────────────────────────

export const ALL_ICON_KEYS: IconKey[] = Object.keys(ICON_REGISTRY) as IconKey[];

// ── Default Team Data (serializable, persisted to Supabase) ──────────────

export const DEFAULT_TEAM_DATA: TeamMemberData[] = [
  {
    id: 'director',
    title: 'Director',
    contract: 'CDI',
    startMonth: 1,
    languages: ['FR', 'EN', 'AR'],
    schedule: { days: 'Mon – Sat', hours: '9h – 19h', status: 'Full-time' },
    expenseLabel: 'General Manager',
    responsibilities: [
      { iconKey: 'people', label: 'HR Management' },
      { iconKey: 'gear', label: 'Operations' },
      { iconKey: 'diamond', label: 'VIP Clients' },
      { iconKey: 'handshake', label: 'Closing Supervision' },
      { iconKey: 'chart', label: 'Accounting & P&L' },
      { iconKey: 'report', label: 'Reporting & KPIs' },
    ],
    skills: ['Leadership', 'Negotiation', 'Financial Analysis', 'Team Management', 'Strategic Planning'],
    kpis: [
      { label: 'Revenue target', target: '500k MAD/mo' },
      { label: 'Team retention rate', target: '95%/mo' },
      { label: 'Client satisfaction', target: '4.5/5/mo' },
      { label: 'Deal closure rate', target: '40%/mo' },
    ],
    tools: ['CRM', 'Excel / Sheets', 'WhatsApp Business', 'Supabase Dashboard'],
    commission: { rate: 10, type: 'All Revenues' },
  },
  {
    id: 'digital-manager',
    title: 'Digital Manager',
    contract: 'CDI',
    startMonth: 1,
    languages: ['FR', 'EN'],
    schedule: { days: 'Mon – Fri', hours: '9h – 18h', status: 'Full-time' },
    expenseLabel: 'Digital Coordinator',
    responsibilities: [
      { iconKey: 'chat', label: 'Reply to Leads' },
      { iconKey: 'filter', label: 'Qualify Leads' },
      { iconKey: 'database', label: 'Publish on CRM' },
      { iconKey: 'globe', label: 'Publish on Website' },
      { iconKey: 'megaphone', label: 'Publish on Social Media' },
      { iconKey: 'inbox', label: 'Publish on MLS' },
    ],
    skills: ['Content Creation', 'SEO / SEA', 'Canva / Adobe', 'Copywriting', 'Analytics'],
    kpis: [
      { label: 'Leads generated', target: '120/mo' },
      { label: 'Engagement rate', target: '5%/mo' },
      { label: 'Listing views', target: '10k/mo' },
      { label: 'Response time', target: '<1h/mo' },
    ],
    tools: ['Meta Business', 'Canva', 'Avito / Mubawab', 'Google Analytics', 'ChatGPT'],
    commission: { rate: 10, type: 'All RE Revenues' },
  },
  {
    id: 'community-mgr',
    title: 'Community Manager',
    contract: 'Freelance',
    startMonth: 2,
    languages: ['FR', 'EN'],
    schedule: { days: 'Mon – Fri', hours: '9h – 18h', status: 'Full-time' },
    expenseLabel: 'Community Manager',
    brands: ['expats'],
    responsibilities: [
      { iconKey: 'megaphone', label: 'Social media content' },
      { iconKey: 'camera', label: 'Photo & video production' },
      { iconKey: 'chat', label: 'Community engagement' },
      { iconKey: 'calendar', label: 'Editorial planning' },
      { iconKey: 'globe', label: 'Brand awareness' },
      { iconKey: 'chart', label: 'Performance tracking' },
    ],
    skills: ['Content Creation', 'Social Media', 'Photography', 'Video Editing', 'Community Building'],
    kpis: [
      { label: 'Posts published', target: '30/mo' },
      { label: 'Follower growth', target: '10%/mo' },
      { label: 'Engagement rate', target: '6%/mo' },
      { label: 'Inbound leads', target: '50/mo' },
    ],
    tools: ['Instagram', 'TikTok', 'Canva', 'CapCut', 'Meta Business'],
    commission: { rate: 0, type: 'No Commission' },
  },
  {
    id: 'property-hunter',
    title: 'Property Hunter',
    contract: 'Freelance',
    startMonth: 1,
    languages: ['FR', 'AR', 'Darija'],
    schedule: { days: 'Mon – Sat', hours: '9h – 18h', status: 'Full-time' },
    expenseLabel: 'Property Hunter',
    responsibilities: [
      { iconKey: 'search', label: 'Property sourcing' },
      { iconKey: 'phone', label: 'Owner outreach' },
      { iconKey: 'inbox', label: 'Inbound calls & msgs' },
      { iconKey: 'filter', label: 'Lead qualification' },
      { iconKey: 'database', label: 'Database updates' },
      { iconKey: 'refresh', label: 'Follow-up tracking' },
    ],
    skills: ['Cold Calling', 'Market Knowledge', 'Negotiation Basics', 'CRM Data Entry', 'Local Network'],
    kpis: [
      { label: 'New listings', target: '20/mo' },
      { label: 'Owner response rate', target: '60%/mo' },
      { label: 'Database accuracy', target: '95%/mo' },
      { label: 'Qualified leads', target: '30/mo' },
    ],
    tools: ['WhatsApp', 'Google Maps', 'CRM', 'Avito / Mubawab', 'Phone'],
    commission: { rate: 10, type: 'Linked Deals' },
  },
  {
    id: 'customer-service',
    title: 'Customer Service',
    contract: 'Freelance',
    startMonth: 2,
    languages: ['FR', 'EN', 'AR'],
    schedule: { days: 'Mon – Sat', hours: '9h – 18h', status: 'Full-time' },
    expenseLabel: 'Customer Service',
    brands: ['feelHome', 'mInvest', 'expats'],
    responsibilities: [
      { iconKey: 'phone', label: 'Inbound calls & support' },
      { iconKey: 'chat', label: 'Client communication' },
      { iconKey: 'inbox', label: 'Ticket management' },
      { iconKey: 'refresh', label: 'Follow-up tracking' },
      { iconKey: 'people', label: 'Client onboarding' },
      { iconKey: 'report', label: 'Satisfaction reporting' },
    ],
    skills: ['Communication', 'Problem Solving', 'CRM Management', 'Multilingual Support', 'Empathy'],
    kpis: [
      { label: 'Response time', target: '<30min/mo' },
      { label: 'Tickets resolved', target: '95%/mo' },
      { label: 'Client satisfaction', target: '4.5/5/mo' },
      { label: 'Follow-up rate', target: '100%/mo' },
    ],
    tools: ['WhatsApp Business', 'CRM', 'Phone', 'Email'],
    commission: { rate: 0, type: 'No Commission' },
  },
  {
    id: 'community-manager',
    title: 'Marketing Manager',
    contract: 'Freelance',
    startMonth: 2,
    languages: ['FR', 'EN'],
    schedule: { days: 'Mon – Fri', hours: '9h – 18h', status: 'Full-time' },
    expenseLabel: 'Marketing Manager',
    brands: ['expats'],
    responsibilities: [
      { iconKey: 'megaphone', label: 'Social media strategy' },
      { iconKey: 'camera', label: 'Photo & video content' },
      { iconKey: 'calendar', label: 'Editorial planning' },
      { iconKey: 'chat', label: 'Community engagement' },
      { iconKey: 'globe', label: 'Brand awareness' },
      { iconKey: 'chart', label: 'Performance tracking' },
    ],
    skills: ['Content Creation', 'Social Media', 'Photography', 'Video Editing', 'Community Building'],
    kpis: [
      { label: 'Posts published', target: '30/mo' },
      { label: 'Follower growth', target: '10%/mo' },
      { label: 'Engagement rate', target: '6%/mo' },
      { label: 'Inbound leads', target: '50/mo' },
    ],
    tools: ['Instagram', 'TikTok', 'Canva', 'CapCut', 'Meta Business'],
    commission: { rate: 0, type: 'No Commission' },
  },
  {
    id: 'agent-casa',
    title: 'Agent',
    contract: 'Freelance',
    startMonth: 1,
    languages: ['FR', 'EN', 'Darija'],
    schedule: { days: 'Mon – Sat', hours: '10h – 19h', status: 'Full-time' },
    expenseLabel: 'Agent Casablanca #1',
    market: 'casablanca',
    responsibilities: [
      { iconKey: 'chat', label: 'Lead communication' },
      { iconKey: 'people', label: 'Client meetings' },
      { iconKey: 'building', label: 'Property visits' },
      { iconKey: 'handshake', label: 'Negotiation' },
      { iconKey: 'refresh', label: 'Follow-ups' },
      { iconKey: 'report', label: 'Activity reporting' },
    ],
    skills: ['Client Relations', 'Negotiation', 'Local Market', 'Driving License', 'Bilingual FR/EN'],
    kpis: [
      { label: 'Visits', target: '15/mo' },
      { label: 'Deals closed', target: '3/mo' },
      { label: 'Client conversion', target: '25%/mo' },
      { label: 'Avg. deal value', target: '50k MAD/mo' },
    ],
    tools: ['WhatsApp Business', 'CRM', 'Google Maps', 'Phone'],
    commission: { rate: 10, type: 'Linked Deals' },
  },
  {
    id: 'agent-marrakech',
    title: 'Agent',
    contract: 'Freelance',
    startMonth: 3,
    languages: ['FR', 'EN', 'AR'],
    schedule: { days: 'Mon – Sat', hours: '10h – 19h', status: 'Full-time' },
    expenseLabel: 'Agent Marrakech #1',
    market: 'marrakech',
    responsibilities: [
      { iconKey: 'chat', label: 'Lead communication' },
      { iconKey: 'people', label: 'Client meetings' },
      { iconKey: 'building', label: 'Property visits' },
      { iconKey: 'handshake', label: 'Negotiation' },
      { iconKey: 'refresh', label: 'Follow-ups' },
      { iconKey: 'report', label: 'Activity reporting' },
    ],
    skills: ['Client Relations', 'Negotiation', 'Local Market', 'Driving License', 'Tourism Knowledge'],
    kpis: [
      { label: 'Visits', target: '15/mo' },
      { label: 'Deals closed', target: '3/mo' },
      { label: 'Client conversion', target: '25%/mo' },
      { label: 'Avg. deal value', target: '50k MAD/mo' },
    ],
    tools: ['WhatsApp Business', 'CRM', 'Google Maps', 'Phone'],
    commission: { rate: 10, type: 'Linked Deals' },
  },
  {
    id: 'agent-rabat',
    title: 'Agent',
    contract: 'Freelance',
    startMonth: 4,
    languages: ['FR', 'AR', 'Darija'],
    schedule: { days: 'Mon – Sat', hours: '10h – 19h', status: 'Full-time' },
    expenseLabel: 'Agent Rabat #1',
    market: 'rabat',
    responsibilities: [
      { iconKey: 'chat', label: 'Lead communication' },
      { iconKey: 'people', label: 'Client meetings' },
      { iconKey: 'building', label: 'Property visits' },
      { iconKey: 'handshake', label: 'Negotiation' },
      { iconKey: 'refresh', label: 'Follow-ups' },
      { iconKey: 'report', label: 'Activity reporting' },
    ],
    skills: ['Client Relations', 'Negotiation', 'Local Market', 'Driving License', 'Admin / Embassy Knowledge'],
    kpis: [
      { label: 'Visits', target: '15/mo' },
      { label: 'Deals closed', target: '3/mo' },
      { label: 'Client conversion', target: '25%/mo' },
      { label: 'Avg. deal value', target: '50k MAD/mo' },
    ],
    tools: ['WhatsApp Business', 'CRM', 'Google Maps', 'Phone'],
    commission: { rate: 10, type: 'Linked Deals' },
  },
  {
    id: 'agent-other',
    title: 'Agent',
    contract: 'Freelance',
    startMonth: 5,
    languages: ['FR', 'EN', 'AR'],
    schedule: { days: 'Mon – Sat', hours: '10h – 19h', status: 'Full-time' },
    expenseLabel: 'Agent Tangier #1',
    market: 'autre',
    responsibilities: [
      { iconKey: 'chat', label: 'Lead communication' },
      { iconKey: 'people', label: 'Client meetings' },
      { iconKey: 'building', label: 'Property visits' },
      { iconKey: 'handshake', label: 'Negotiation' },
      { iconKey: 'refresh', label: 'Follow-ups' },
      { iconKey: 'report', label: 'Activity reporting' },
    ],
    skills: ['Client Relations', 'Negotiation', 'Local Market', 'Driving License', 'Adaptability'],
    kpis: [
      { label: 'Visits', target: '15/mo' },
      { label: 'Deals closed', target: '3/mo' },
      { label: 'Client conversion', target: '25%/mo' },
      { label: 'Avg. deal value', target: '50k MAD/mo' },
    ],
    tools: ['WhatsApp Business', 'CRM', 'Google Maps', 'Phone'],
    commission: { rate: 10, type: 'Linked Deals' },
  },
];

// ── Static display properties (NOT persisted) ────────────────────────────

export const TEAM_DISPLAY: Record<string, TeamMemberDisplay> = {
  director: { id: 'director', initials: 'DIR', color: '#d4a853', subtitle: 'Agency Lead', scope: undefined, location: undefined },
  'digital-manager': { id: 'digital-manager', initials: 'DM', color: '#9a6b3a', subtitle: 'Digital', scope: 'Digital', location: undefined },
  'community-mgr': { id: 'community-mgr', initials: 'CM', color: '#ec4899', subtitle: 'Content & Social', scope: 'Expats.ma', location: undefined },
  'property-hunter': { id: 'property-hunter', initials: 'PH', color: '#06b6d4', subtitle: 'Sourcing', scope: 'Sourcing', location: undefined },
  'customer-service': { id: 'customer-service', initials: 'CS', color: '#8b5cf6', subtitle: 'Support', scope: 'All Brands', location: undefined },
  'community-manager': { id: 'community-manager', initials: 'MK', color: '#f59e0b', subtitle: 'Branding & Partnerships', scope: 'Marketing', location: undefined },
  'agent-casa': { id: 'agent-casa', initials: 'CA', color: '#1d7ff3', scope: 'Casablanca', location: 'Casablanca' },
  'agent-marrakech': { id: 'agent-marrakech', initials: 'MK', color: '#1d7ff3', scope: 'Marrakech', location: 'Marrakech' },
  'agent-rabat': { id: 'agent-rabat', initials: 'RA', color: '#1d7ff3', scope: 'Rabat', location: 'Rabat' },
  'agent-other': { id: 'agent-other', initials: 'OT', color: '#1d7ff3', scope: 'Other', location: 'Other' },
};

// ── Helper: merge persisted data with display props ──────────────────────

export interface MergedTeamMember extends TeamMemberData, TeamMemberDisplay {}

export function mergeTeamMember(data: TeamMemberData): MergedTeamMember {
  const display = TEAM_DISPLAY[data.id] || {
    id: data.id,
    initials: data.id.substring(0, 2).toUpperCase(),
    color: '#888888',
  };
  return { ...display, ...data };
}
