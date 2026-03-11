'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useFinancial } from '@/context/FinancialContext';
import type { BrandKey } from '@/types';
import type { MarketKey } from '@/context/FinancialContext';
import { useCurrency } from '@/context/CurrencyContext';

// ── Data ────────────────────────────────────────────────────────────────

interface Responsibility {
  icon: React.ReactNode;
  label: string;
}

interface TeamMember {
  id: string;
  title: string;
  subtitle?: string;
  tagline?: string;
  initials: string;
  scope?: string;
  location?: string;
  color: string;
  contract: 'CDI' | 'CDD' | 'Freelance';
  startMonth: number; // M1, M2, ...
  languages: string[];
  schedule: { days: string; hours: string; status: 'Full-time' | 'Part-time' };
  expenseLabel: string;
  brands?: BrandKey[];
  market?: MarketKey;
  responsibilities: Responsibility[];
  skills: string[];
  kpis: { label: string; target: string }[];
  tools: string[];
}

const director: TeamMember = {
  id: 'director',
  title: 'Director',
  subtitle: 'Agency Lead',
  tagline: 'Driving strategy, closing deals, building the team.',
  initials: 'DIR',
  color: '#d4a853',
  contract: 'CDI',
  startMonth: 1,
  languages: ['FR', 'EN', 'AR'],
  schedule: { days: 'Mon – Sat', hours: '9h – 19h', status: 'Full-time' },
  expenseLabel: 'General Manager (Operations + HR)',
  responsibilities: [
    { icon: <IconPeople />, label: 'HR Management' },
    { icon: <IconGear />, label: 'Operations' },
    { icon: <IconDiamond />, label: 'VIP Clients' },
    { icon: <IconHandshake />, label: 'Closing Supervision' },
    { icon: <IconChart />, label: 'Accounting & P&L' },
    { icon: <IconReport />, label: 'Reporting & KPIs' },
  ],
  skills: ['Leadership', 'Negotiation', 'Financial Analysis', 'Team Management', 'Strategic Planning'],
  kpis: [
    { label: 'Revenue target', target: '500k MAD/mo' },
    { label: 'Team retention rate', target: '95%/mo' },
    { label: 'Client satisfaction', target: '4.5/5/mo' },
    { label: 'Deal closure rate', target: '40%/mo' },
  ],
  tools: ['CRM', 'Excel / Sheets', 'WhatsApp Business', 'Supabase Dashboard'],
};

const backoffice: TeamMember[] = [
  {
    id: 'digital-manager',
    title: 'Digital Manager',
    subtitle: 'Community Manager',
    initials: 'DM',
    scope: 'Digital',
    color: '#8b5cf6',
    contract: 'CDI',
    startMonth: 1,
    languages: ['FR', 'EN'],
    schedule: { days: 'Mon – Fri', hours: '9h – 18h', status: 'Full-time' },
    expenseLabel: 'Digital Coordinator - Community Manager',
      responsibilities: [
      { icon: <IconChat />, label: 'Reply to Leads' },
      { icon: <IconFilter />, label: 'Qualify Leads' },
      { icon: <IconDatabase />, label: 'Publish on CRM' },
      { icon: <IconGlobe />, label: 'Publish on Website' },
      { icon: <IconMegaphone />, label: 'Publish on Social Media' },
      { icon: <IconInbox />, label: 'Publish on MLS' },
    ],
    skills: ['Content Creation', 'SEO / SEA', 'Canva / Adobe', 'Copywriting', 'Analytics'],
    kpis: [
      { label: 'Leads generated', target: '120/mo' },
      { label: 'Engagement rate', target: '5%/mo' },
      { label: 'Listing views', target: '10k/mo' },
      { label: 'Response time', target: '<1h/mo' },
    ],
    tools: ['Meta Business', 'Canva', 'Avito / Mubawab', 'Google Analytics', 'ChatGPT'],
  },
  {
    id: 'property-hunter',
    title: 'Property Hunter',
    subtitle: 'Customer Service',
    initials: 'PH',
    scope: 'Sourcing',
    color: '#06b6d4',
    contract: 'Freelance',
    startMonth: 1,
    languages: ['FR', 'AR', 'Darija'],
    schedule: { days: 'Mon – Sat', hours: '9h – 18h', status: 'Full-time' },
    expenseLabel: 'Property Hunter - Customer Service',
      responsibilities: [
      { icon: <IconSearch />, label: 'Property sourcing' },
      { icon: <IconPhone />, label: 'Owner outreach' },
      { icon: <IconInbox />, label: 'Inbound calls & msgs' },
      { icon: <IconFilter />, label: 'Lead qualification' },
      { icon: <IconDatabase />, label: 'Database updates' },
      { icon: <IconRefresh />, label: 'Follow-up tracking' },
    ],
    skills: ['Cold Calling', 'Market Knowledge', 'Negotiation Basics', 'CRM Data Entry', 'Local Network'],
    kpis: [
      { label: 'New listings', target: '20/mo' },
      { label: 'Owner response rate', target: '60%/mo' },
      { label: 'Database accuracy', target: '95%/mo' },
      { label: 'Qualified leads', target: '30/mo' },
    ],
    tools: ['WhatsApp', 'Google Maps', 'CRM', 'Avito / Mubawab', 'Phone'],
  },
  {
    id: 'community-manager',
    title: 'Community Manager',
    subtitle: 'Content & Social',
    initials: 'CM',
    scope: 'Marketing',
    brands: ['expats'],
    color: '#ec4899',
    contract: 'Freelance',
    startMonth: 2,
    languages: ['FR', 'EN'],
    schedule: { days: 'Mon – Fri', hours: '9h – 18h', status: 'Full-time' },
    expenseLabel: 'Marketing Manager (Branding + Partnerships)',
      responsibilities: [
      { icon: <IconMegaphone />, label: 'Social media strategy' },
      { icon: <IconCamera />, label: 'Photo & video content' },
      { icon: <IconCalendar />, label: 'Editorial planning' },
      { icon: <IconChat />, label: 'Community engagement' },
      { icon: <IconGlobe />, label: 'Brand awareness' },
      { icon: <IconChart />, label: 'Performance tracking' },
    ],
    skills: ['Content Creation', 'Social Media', 'Photography', 'Video Editing', 'Community Building'],
    kpis: [
      { label: 'Posts published', target: '30/mo' },
      { label: 'Follower growth', target: '10%/mo' },
      { label: 'Engagement rate', target: '6%/mo' },
      { label: 'Inbound leads', target: '50/mo' },
    ],
    tools: ['Instagram', 'TikTok', 'Canva', 'CapCut', 'Meta Business'],
  },
];

const frontoffice: TeamMember[] = [
  {
    id: 'agent-casa',
    title: 'Agent',
    initials: 'CA',
    scope: 'Casablanca',
    location: 'Casablanca',
    market: 'casablanca',
    color: '#2dd4bf',
    contract: 'Freelance',
    startMonth: 1,
    languages: ['FR', 'EN', 'Darija'],
    schedule: { days: 'Mon – Sat', hours: '10h – 19h', status: 'Full-time' },
    expenseLabel: 'Agent Casablanca #1',
    responsibilities: [
      { icon: <IconChat />, label: 'Lead communication' },
      { icon: <IconPeople />, label: 'Client meetings' },
      { icon: <IconBuilding />, label: 'Property visits' },
      { icon: <IconHandshake />, label: 'Negotiation' },
      { icon: <IconRefresh />, label: 'Follow-ups' },
      { icon: <IconReport />, label: 'Activity reporting' },
    ],
    skills: ['Client Relations', 'Negotiation', 'Local Market', 'Driving License', 'Bilingual FR/EN'],
    kpis: [
      { label: 'Visits', target: '15/mo' },
      { label: 'Deals closed', target: '3/mo' },
      { label: 'Client conversion', target: '25%/mo' },
      { label: 'Avg. deal value', target: '50k MAD/mo' },
    ],
    tools: ['WhatsApp Business', 'CRM', 'Google Maps', 'Phone'],
  },
  {
    id: 'agent-marrakech',
    title: 'Agent',
    initials: 'MK',
    scope: 'Marrakech',
    location: 'Marrakech',
    market: 'marrakech',
    color: '#f59e0b',
    contract: 'Freelance',
    startMonth: 3,
    languages: ['FR', 'EN', 'AR'],
    schedule: { days: 'Mon – Sat', hours: '10h – 19h', status: 'Full-time' },
    expenseLabel: 'Agent Marrakech #1',
    responsibilities: [
      { icon: <IconChat />, label: 'Lead communication' },
      { icon: <IconPeople />, label: 'Client meetings' },
      { icon: <IconBuilding />, label: 'Property visits' },
      { icon: <IconHandshake />, label: 'Negotiation' },
      { icon: <IconRefresh />, label: 'Follow-ups' },
      { icon: <IconReport />, label: 'Activity reporting' },
    ],
    skills: ['Client Relations', 'Negotiation', 'Local Market', 'Driving License', 'Tourism Knowledge'],
    kpis: [
      { label: 'Visits', target: '15/mo' },
      { label: 'Deals closed', target: '3/mo' },
      { label: 'Client conversion', target: '25%/mo' },
      { label: 'Avg. deal value', target: '50k MAD/mo' },
    ],
    tools: ['WhatsApp Business', 'CRM', 'Google Maps', 'Phone'],
  },
  {
    id: 'agent-rabat',
    title: 'Agent',
    initials: 'RA',
    scope: 'Rabat',
    location: 'Rabat',
    market: 'rabat',
    color: '#1d7ff3',
    contract: 'Freelance',
    startMonth: 4,
    languages: ['FR', 'AR', 'Darija'],
    schedule: { days: 'Mon – Sat', hours: '10h – 19h', status: 'Full-time' },
    expenseLabel: 'Agent Rabat #1',
    responsibilities: [
      { icon: <IconChat />, label: 'Lead communication' },
      { icon: <IconPeople />, label: 'Client meetings' },
      { icon: <IconBuilding />, label: 'Property visits' },
      { icon: <IconHandshake />, label: 'Negotiation' },
      { icon: <IconRefresh />, label: 'Follow-ups' },
      { icon: <IconReport />, label: 'Activity reporting' },
    ],
    skills: ['Client Relations', 'Negotiation', 'Local Market', 'Driving License', 'Admin / Embassy Knowledge'],
    kpis: [
      { label: 'Visits', target: '15/mo' },
      { label: 'Deals closed', target: '3/mo' },
      { label: 'Client conversion', target: '25%/mo' },
      { label: 'Avg. deal value', target: '50k MAD/mo' },
    ],
    tools: ['WhatsApp Business', 'CRM', 'Google Maps', 'Phone'],
  },
  {
    id: 'agent-other',
    title: 'Agent',
    initials: 'OT',
    scope: 'Other',
    location: 'Other',
    market: 'autre',
    color: '#a855f7',
    contract: 'Freelance',
    startMonth: 5,
    languages: ['FR', 'EN', 'AR'],
    schedule: { days: 'Mon – Sat', hours: '10h – 19h', status: 'Full-time' },
    expenseLabel: 'Agent Tangier #1',
    responsibilities: [
      { icon: <IconChat />, label: 'Lead communication' },
      { icon: <IconPeople />, label: 'Client meetings' },
      { icon: <IconBuilding />, label: 'Property visits' },
      { icon: <IconHandshake />, label: 'Negotiation' },
      { icon: <IconRefresh />, label: 'Follow-ups' },
      { icon: <IconReport />, label: 'Activity reporting' },
    ],
    skills: ['Client Relations', 'Negotiation', 'Local Market', 'Driving License', 'Adaptability'],
    kpis: [
      { label: 'Visits', target: '15/mo' },
      { label: 'Deals closed', target: '3/mo' },
      { label: 'Client conversion', target: '25%/mo' },
      { label: 'Avg. deal value', target: '50k MAD/mo' },
    ],
    tools: ['WhatsApp Business', 'CRM', 'Google Maps', 'Phone'],
  },
];

// ── Tab types ────────────────────────────────────────────────────────────

type TabKey = 'overview' | 'schedule' | 'compensation' | 'skills' | 'kpis';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Main Tasks' },
  { key: 'schedule', label: 'Contract' },
  { key: 'compensation', label: 'Compensation' },
  { key: 'skills', label: 'Skills' },
  { key: 'kpis', label: 'KPIs' },
];

// ── Format helpers ───────────────────────────────────────────────────────

function formatMADShort(n: number, currency: 'MAD' | 'USD' = 'MAD') {
  const v = currency === 'USD' ? n / 10 : n;
  return v.toLocaleString('fr-MA') + ` ${currency}`;
}

// ── Main Component ──────────────────────────────────────────────────────

type CommissionType = 'All Revenues' | 'Linked Deals';

interface CommissionConfig {
  rate: number; // percentage, e.g. 10
  type: CommissionType;
}

export default function TeamView() {
  const allIds = [director.id, ...backoffice.map(m => m.id), ...frontoffice.map(m => m.id)];
  const [expanded, setExpanded] = useState<Set<string>>(new Set(allIds));
  const { isDark } = useTheme();
  const { activeBrands, activeMarkets } = useFinancial();

  // Commission state per member
  const [commissions, setCommissions] = useState<Record<string, CommissionConfig>>(() => {
    const init: Record<string, CommissionConfig> = {};
    const linkedDealsIds = new Set(['property-hunter', ...frontoffice.map(m => m.id)]);
    [director, ...backoffice, ...frontoffice].forEach(m => {
      init[m.id] = { rate: 10, type: linkedDealsIds.has(m.id) ? 'Linked Deals' : 'All Revenues' };
    });
    return init;
  });
  const updateCommissionRate = (id: string, rate: number) =>
    setCommissions(prev => ({ ...prev, [id]: { ...prev[id], rate } }));
  const updateCommissionType = (id: string, type: CommissionType) =>
    setCommissions(prev => ({ ...prev, [id]: { ...prev[id], type } }));
  const toggle = (id: string) => setExpanded(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  // Filter agents by active markets
  const visibleAgents = frontoffice.filter(m => !m.market || activeMarkets[m.market]);
  const agentXPositions = visibleAgents.length <= 1 ? [500]
    : visibleAgents.map((_, i) => Math.round(1000 * (i + 0.5) / visibleAgents.length));

  return (
    <div className="animate-fadeIn">
      <style>{`
        @keyframes borderShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* ━━━ Director + Community Manager ━━━ */}
      <div className="flex">
        <SectionLabel label="Management" />
        <div className="flex-1 flex items-start">
          <div className="w-1/3 min-w-0">
            <DirectorCard member={director} expanded={expanded.has(director.id)} onToggle={() => toggle(director.id)} commission={commissions[director.id]} onCommissionRateChange={(r) => updateCommissionRate(director.id, r)} onCommissionTypeChange={(t) => updateCommissionType(director.id, t)} />
          </div>
          {activeBrands.expats && (
            <>
              <HorizontalConnector isDark={isDark} />
              <div className="w-1/3 min-w-0">
                <MemberCard member={backoffice[2]} expanded={expanded.has(backoffice[2].id)} onToggle={() => toggle(backoffice[2].id)} commission={commissions[backoffice[2].id]} onCommissionRateChange={(r) => updateCommissionRate(backoffice[2].id, r)} onCommissionTypeChange={(t) => updateCommissionType(backoffice[2].id, t)} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ━━━ Connector: Director → Backoffice ━━━ */}
      <div className="flex">
        <div className="w-8 shrink-0 mr-3" />
        <div className="flex-1 relative" style={{ height: 48 }}>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 48" preserveAspectRatio="none" fill="none">
            <FlowLine id="d-dm" x1={250} y1={0} x2={250} y2={48} isDark={isDark} dur={6} delay={0} />
            <FlowLine id="d-ph" x1={250} y1={0} x2={750} y2={48} isDark={isDark} dur={7} delay={1} />
          </svg>
        </div>
      </div>

      {/* ━━━ Backoffice ━━━ */}
      <div className="flex">
        <SectionLabel label="Backoffice" />
        <div className="flex-1 flex items-start">
          <div className="flex-1 min-w-0">
            <MemberCard member={backoffice[0]} expanded={expanded.has(backoffice[0].id)} onToggle={() => toggle(backoffice[0].id)} commission={commissions[backoffice[0].id]} onCommissionRateChange={(r) => updateCommissionRate(backoffice[0].id, r)} onCommissionTypeChange={(t) => updateCommissionType(backoffice[0].id, t)} />
          </div>
          <HorizontalConnector isDark={isDark} />
          <div className="flex-1 min-w-0">
            <MemberCard member={backoffice[1]} expanded={expanded.has(backoffice[1].id)} onToggle={() => toggle(backoffice[1].id)} commission={commissions[backoffice[1].id]} onCommissionRateChange={(r) => updateCommissionRate(backoffice[1].id, r)} onCommissionTypeChange={(t) => updateCommissionType(backoffice[1].id, t)} />
          </div>
        </div>
      </div>

      {/* ━━━ Connector: Backoffice → Agents ━━━ */}
      {visibleAgents.length > 0 && (
        <div className="flex">
          <div className="w-8 shrink-0 mr-3" />
          <div className="flex-1 relative" style={{ height: 48 }}>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 48" preserveAspectRatio="none" fill="none">
              {agentXPositions.map((ax, i) => (
                <FlowLine key={`dm-${i}`} id={`dm-a${i}`} x1={250} y1={0} x2={ax} y2={48} isDark={isDark} dur={6 + i * 0.8} delay={i * 1} />
              ))}
              {agentXPositions.map((ax, i) => (
                <FlowLine key={`ph-${i}`} id={`ph-a${i}`} x1={750} y1={0} x2={ax} y2={48} isDark={isDark} dur={6.5 + i * 0.6} delay={0.6 + i * 0.8} />
              ))}
            </svg>
          </div>
        </div>
      )}

      {/* ━━━ Field Agents ━━━ */}
      {visibleAgents.length > 0 && (
        <div className="flex">
          <SectionLabel label="Field Agents" />
          <div className={`flex-1 grid grid-cols-1 gap-4`} style={{ gridTemplateColumns: `repeat(${Math.min(visibleAgents.length, 4)}, minmax(0, 1fr))` }}>
            {visibleAgents.map((member) => (
              <MemberCard key={member.id} member={member} expanded={expanded.has(member.id)} onToggle={() => toggle(member.id)} commission={commissions[member.id]} onCommissionRateChange={(r) => updateCommissionRate(member.id, r)} onCommissionTypeChange={(t) => updateCommissionType(member.id, t)} />
            ))}
          </div>
        </div>
      )}

      {/* ━━━ Summary Bar ━━━ */}
      <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Headcount', value: '8', color: isDark ? '#ffffff' : '#1e293b' },
          { label: 'Management', value: '2', color: '#d4a853' },
          { label: 'Backoffice', value: '2', color: '#8b5cf6' },
          { label: 'Frontoffice', value: '4', color: '#2dd4bf' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl px-5 py-4 transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: isDark ? 'rgba(255,255,255,0.015)' : '#ffffff',
              border: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(15,23,42,0.08)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: kpi.color, opacity: kpi.color === '#ffffff' ? 0.4 : 0.7 }}
              />
              <span className={`text-[10px] uppercase tracking-[0.15em] font-medium ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{kpi.label}</span>
            </div>
            <span className={`text-2xl font-bold font-mono ${isDark ? 'text-white/80' : 'text-slate-800'}`}>{kpi.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Section Label (vertical, left side) ─────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  const { isDark } = useTheme();
  return (
    <div className="w-8 shrink-0 flex items-center justify-center mr-3">
      <span
        className={`text-[9px] uppercase tracking-[0.2em] font-semibold whitespace-nowrap ${isDark ? 'text-white/20' : 'text-slate-300'}`}
        style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}
      >
        {label}
      </span>
    </div>
  );
}

// ── Electric signal flow line ───────────────────────────────────────────

function FlowLine({
  id, x1, y1, x2, y2, isDark, dur, delay = 0,
}: {
  id: string; x1: number; y1: number; x2: number; y2: number;
  isDark: boolean; dur: number; delay?: number;
}) {
  const pathD = `M${x1},${y1} L${x2},${y2}`;
  const baseStroke = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)';

  return (
    <g>
      {/* Base wire */}
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={baseStroke} strokeWidth="1" />
      {/* Animated electric signal */}
      <g>
        <animateMotion
          path={pathD}
          dur={`${dur}s`}
          repeatCount="indefinite"
          keyPoints="0;1;0"
          keyTimes="0;0.5;1"
          calcMode="spline"
          keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
          rotate="auto"
          begin={`${delay}s`}
        />
        {/* Outer glow */}
        <line x1="-12" y1="0" x2="12" y2="0" stroke="rgba(212,168,83,0.15)" strokeWidth="8" strokeLinecap="round" />
        {/* Mid glow */}
        <line x1="-8" y1="0" x2="8" y2="0" stroke="rgba(212,168,83,0.4)" strokeWidth="3" strokeLinecap="round" />
        {/* Core signal */}
        <line x1="-5" y1="0" x2="5" y2="0" stroke="rgba(212,168,83,0.95)" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </g>
  );
}

// ── Horizontal connector between DM and PH ─────────────────────────────

function HorizontalConnector({ isDark }: { isDark: boolean }) {
  const baseStroke = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)';
  return (
    <div className="w-12 shrink-0 self-stretch flex items-center justify-center">
      <svg className="w-full" style={{ height: 4, overflow: 'visible' }} viewBox="0 0 100 4" preserveAspectRatio="none" fill="none">
        <line x1="0" y1="2" x2="100" y2="2" stroke={baseStroke} strokeWidth="1" />
        <g>
          <animateMotion
            path="M0,2 L100,2"
            dur="7s"
            repeatCount="indefinite"
            keyPoints="0;1;0"
            keyTimes="0;0.5;1"
            calcMode="spline"
            keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
            rotate="auto"
          />
          <line x1="-6" y1="0" x2="6" y2="0" stroke="rgba(212,168,83,0.15)" strokeWidth="6" strokeLinecap="round" />
          <line x1="-4" y1="0" x2="4" y2="0" stroke="rgba(212,168,83,0.4)" strokeWidth="3" strokeLinecap="round" />
          <line x1="-3" y1="0" x2="3" y2="0" stroke="rgba(212,168,83,0.95)" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

// ── Director Card ───────────────────────────────────────────────────────

function DirectorCard({
  member,
  expanded,
  onToggle,
  commission,
  onCommissionRateChange,
  onCommissionTypeChange,
}: {
  member: TeamMember;
  expanded: boolean;
  onToggle: () => void;
  commission: CommissionConfig;
  onCommissionRateChange: (rate: number) => void;
  onCommissionTypeChange: (type: CommissionType) => void;
}) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const textPrimary = isDark ? 'text-white/90' : 'text-slate-800';
  const textSecondary = isDark ? 'text-white/50' : 'text-slate-500';
  const textTertiary = isDark ? 'text-white/30' : 'text-slate-400';
  const borderSub = isDark ? 'border-white/[0.04]' : 'border-slate-100';

  return (
    <div
      className="relative rounded-2xl cursor-pointer group transition-all duration-300 overflow-hidden"
      onClick={onToggle}
    >
      {/* Animated gradient border */}
      <div
        className="absolute inset-0 rounded-2xl -z-10"
        style={{
          padding: 1,
          background: 'linear-gradient(135deg, rgba(212,168,83,0.4), rgba(212,168,83,0.08), rgba(212,168,83,0.25), rgba(212,168,83,0.08))',
          backgroundSize: '300% 300%',
          animation: 'borderShimmer 6s ease infinite',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
        }}
      />
      {/* Card background */}
      <div
        className="rounded-2xl transition-all duration-300"
        style={{
          background: isDark
            ? (expanded
              ? 'linear-gradient(135deg, rgba(212,168,83,0.06) 0%, rgba(212,168,83,0.02) 100%)'
              : 'linear-gradient(135deg, rgba(212,168,83,0.03) 0%, rgba(255,255,255,0.01) 100%)')
            : '#ffffff',
        }}
      >
        <div className="px-7 py-6 flex items-center gap-6">
          {/* Initials avatar */}
          <div className="relative shrink-0">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
              style={{
                background: 'rgba(212,168,83,0.1)',
                border: '2px solid rgba(212,168,83,0.3)',
                boxShadow: expanded
                  ? '0 0 24px rgba(212,168,83,0.2), inset 0 0 12px rgba(212,168,83,0.05)'
                  : '0 0 12px rgba(212,168,83,0.1)',
              }}
            >
              <span className="text-lg font-bold tracking-wider" style={{ color: '#d4a853' }}>
                {member.initials}
              </span>
            </div>
          </div>

          {/* Title area */}
          <div className="flex-1 min-w-0">
            <h3 className={`text-[17px] font-bold tracking-tight ${textPrimary}`}>{member.title}</h3>
            <div className="flex items-center gap-1.5 mt-1.5">
              <ContractBadge contract={member.contract} />
              <span
                className="text-[9px] font-semibold uppercase tracking-[0.12em] px-2 py-0.5 rounded-md"
                style={{ color: '#d4a853', background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.15)' }}
              >
                Partner
              </span>
            </div>
          </div>

          {/* Flags + city */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <LanguageFlags languages={member.languages} />
            <span className={`text-[9px] font-semibold uppercase tracking-[0.12em] ${textTertiary}`}>{member.location || 'Remote'}</span>
          </div>
        </div>

        {/* Expanded tabbed content */}
        <ExpandableSection expanded={expanded}>
          <div className="px-7 pb-6">
            <div className={`border-t ${borderSub} pt-4`}>
              {/* Tab bar */}
              <div className={`flex mb-4 rounded-lg p-0.5 ${isDark ? 'bg-white/[0.03]' : 'bg-slate-100/80'}`}>
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={(e) => { e.stopPropagation(); setActiveTab(tab.key); }}
                    className={`flex-1 text-[8px] font-semibold uppercase tracking-[0.1em] py-1.5 rounded-md transition-all duration-200 text-center whitespace-nowrap ${
                      activeTab === tab.key
                        ? (isDark ? 'bg-white/[0.08] text-white/90 shadow-sm' : 'bg-white text-slate-700 shadow-sm')
                        : (isDark ? 'text-white/25 hover:text-white/40' : 'text-slate-400 hover:text-slate-500')
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {/* Tab content */}
              <TabContent member={member} tab={activeTab} color={member.color} commission={commission} onCommissionRateChange={onCommissionRateChange} onCommissionTypeChange={onCommissionTypeChange} />
            </div>
          </div>
        </ExpandableSection>
      </div>
    </div>
  );
}


// ── Member Card ─────────────────────────────────────────────────────────

function MemberCard({
  member,
  expanded,
  onToggle,
  commission,
  onCommissionRateChange,
  onCommissionTypeChange,
}: {
  member: TeamMember;
  expanded: boolean;
  onToggle: () => void;
  commission: CommissionConfig;
  onCommissionRateChange: (rate: number) => void;
  onCommissionTypeChange: (type: CommissionType) => void;
}) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const textPrimary = isDark ? 'text-white/85' : 'text-slate-800';
  const textSecondary = isDark ? 'text-white/50' : 'text-slate-500';
  const textTertiary = isDark ? 'text-white/30' : 'text-slate-400';
  const borderSub = isDark ? 'border-white/[0.04]' : 'border-slate-100';

  return (
    <div
      className="rounded-2xl cursor-pointer group transition-all duration-300 overflow-hidden"
      style={{
        background: expanded
          ? (isDark ? `linear-gradient(135deg, ${member.color}08 0%, ${member.color}03 100%)` : '#ffffff')
          : (isDark ? 'rgba(255,255,255,0.015)' : '#ffffff'),
        border: `1px solid ${expanded ? `${member.color}20` : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.08)')}`,
        boxShadow: expanded ? `0 0 20px ${member.color}08` : 'none',
      }}
      onClick={onToggle}
      onMouseEnter={(e) => {
        if (!expanded) {
          e.currentTarget.style.transform = 'scale(1.01)';
          e.currentTarget.style.borderColor = `${member.color}30`;
          e.currentTarget.style.boxShadow = `0 0 16px ${member.color}10`;
        }
      }}
      onMouseLeave={(e) => {
        if (!expanded) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.06)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
            style={{
              background: `${member.color}10`,
              border: `2px solid ${member.color}35`,
              boxShadow: expanded ? `0 0 16px ${member.color}15` : 'none',
            }}
          >
            <span className="text-[13px] font-bold tracking-wider" style={{ color: `${member.color}cc` }}>
              {member.initials}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className={`text-[13px] font-semibold tracking-tight ${textPrimary}`}>{member.title}</h4>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <ContractBadge contract={member.contract} />
          </div>
        </div>

        {/* Flags + city */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          <LanguageFlags languages={member.languages} small />
          <span className={`text-[8px] font-semibold uppercase tracking-[0.12em] ${textTertiary}`}>{member.location || 'Remote'}</span>
        </div>
      </div>

      {/* Expanded tabbed content */}
      <ExpandableSection expanded={expanded}>
        <div className="px-5 pb-5">
          <div className={`border-t ${borderSub} pt-4`}>
            {/* Tab bar */}
            <div className={`flex mb-4 rounded-lg p-0.5 ${isDark ? 'bg-white/[0.03]' : 'bg-slate-100/80'}`}>
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={(e) => { e.stopPropagation(); setActiveTab(tab.key); }}
                  className={`flex-1 text-[8px] font-semibold uppercase tracking-[0.1em] py-1.5 rounded-md transition-all duration-200 text-center whitespace-nowrap ${
                    activeTab === tab.key
                      ? (isDark ? 'bg-white/[0.08] text-white/90 shadow-sm' : 'bg-white text-slate-700 shadow-sm')
                      : (isDark ? 'text-white/25 hover:text-white/40' : 'text-slate-400 hover:text-slate-500')
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <TabContent member={member} tab={activeTab} color={member.color} commission={commission} onCommissionRateChange={onCommissionRateChange} onCommissionTypeChange={onCommissionTypeChange} />
          </div>
        </div>
      </ExpandableSection>
    </div>
  );
}

// ── Tab Content ─────────────────────────────────────────────────────────

function TabContent({ member, tab, color, commission, onCommissionRateChange, onCommissionTypeChange }: {
  member: TeamMember; tab: TabKey; color: string;
  commission: CommissionConfig;
  onCommissionRateChange: (rate: number) => void;
  onCommissionTypeChange: (type: CommissionType) => void;
}) {
  const { isDark } = useTheme();
  const { expenseItems } = useFinancial();
  const { currency } = useCurrency();
  const textPrimary = isDark ? 'text-white/80' : 'text-slate-700';
  const textSecondary = isDark ? 'text-white/50' : 'text-slate-500';
  const textTertiary = isDark ? 'text-white/30' : 'text-slate-400';
  const pillBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)';
  const pillBorder = isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(15,23,42,0.06)';

  if (tab === 'overview') {
    return (
      <div className="space-y-1.5">
        {member.responsibilities.map((r, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors duration-200"
            style={{ background: pillBg, border: pillBorder }}
          >
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
              style={{ background: `${color}0a`, color: `${color}80` }}
            >
              {r.icon}
            </div>
            <span className={`text-[11px] font-medium leading-tight ${textSecondary}`}>{r.label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (tab === 'schedule') {
    const rows = [
      { label: 'Contract', value: member.contract },
      { label: 'Start', value: `Month ${member.startMonth}` },
      { label: 'Status', value: member.schedule.status },
      { label: 'Days', value: member.schedule.days },
      { label: 'Hours', value: member.schedule.hours },
    ];
    return (
      <div className="space-y-1.5">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between rounded-lg px-3 py-2"
            style={{ background: pillBg, border: pillBorder }}
          >
            <span className={`text-[10px] font-medium uppercase tracking-[0.1em] ${textTertiary}`}>{row.label}</span>
            <span className={`text-[11px] font-semibold ${textPrimary}`}>{row.value}</span>
          </div>
        ))}
      </div>
    );
  }

  if (tab === 'compensation') {
    const expense = expenseItems.find(e => e.label === member.expenseLabel);
    const totalCost = expense?.y1 ?? 0;
    const isCDI = member.contract === 'CDI';
    const baseSalary = isCDI ? Math.round(totalCost / 1.26) : totalCost;
    const cnss = isCDI ? totalCost - baseSalary : 0;

    const rows = [
      { label: 'Base Salary', value: formatMADShort(baseSalary, currency), highlight: false },
      ...(isCDI ? [{ label: 'CNSS + AMO (~26%)', value: formatMADShort(cnss, currency), highlight: false }] : []),
      { label: 'Total Cost / Month', value: formatMADShort(totalCost, currency), highlight: true },
    ];
    return (
      <div className="space-y-1.5">
        {rows.map((row) => (
          <div
            key={row.label}
            className={`flex items-center justify-between rounded-lg px-3 py-2`}
            style={{
              background: row.highlight ? `${color}08` : pillBg,
              border: row.highlight ? `1px solid ${color}20` : pillBorder,
            }}
          >
            <span className={`text-[10px] font-medium uppercase tracking-[0.1em] ${textTertiary}`}>{row.label}</span>
            <span className={`text-[11px] font-bold font-mono ${textPrimary}`}
              style={row.highlight ? { color: `${color}cc` } : {}}
            >
              {row.value}
            </span>
          </div>
        ))}

        {/* Commission Rate — editable */}
        <div
          className="flex items-center justify-between rounded-lg px-3 py-2"
          style={{ background: `${color}08`, border: `1px solid ${color}20` }}
        >
          <span className={`text-[10px] font-medium uppercase tracking-[0.1em] ${textTertiary}`}>Commission Rate</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={100}
              value={commission.rate}
              onChange={(e) => onCommissionRateChange(Math.max(0, Math.min(100, Number(e.target.value))))}
              onClick={(e) => e.stopPropagation()}
              className={`w-12 text-right text-[11px] font-bold font-mono bg-transparent border-b outline-none ${
                isDark ? 'border-white/10 text-white/80 focus:border-white/30' : 'border-slate-200 text-slate-700 focus:border-slate-400'
              }`}
              style={{ color: `${color}cc` }}
            />
            <span className="text-[11px] font-bold font-mono" style={{ color: `${color}cc` }}>%</span>
          </div>
        </div>

        {/* Commission Type — dropdown */}
        <div
          className="flex items-center justify-between rounded-lg px-3 py-2"
          style={{ background: pillBg, border: pillBorder }}
        >
          <span className={`text-[10px] font-medium uppercase tracking-[0.1em] ${textTertiary}`}>Commission Type</span>
          <select
            value={commission.type}
            onChange={(e) => onCommissionTypeChange(e.target.value as CommissionType)}
            onClick={(e) => e.stopPropagation()}
            className={`text-[11px] font-semibold bg-transparent outline-none cursor-pointer ${
              isDark ? 'text-white/70' : 'text-slate-600'
            }`}
          >
            <option value="All Revenues">All Revenues</option>
            <option value="Linked Deals">Linked Deals</option>
          </select>
        </div>
      </div>
    );
  }

  if (tab === 'skills') {
    return (
      <div className="space-y-4">
        {/* Skills */}
        <div>
          <span className={`text-[9px] font-semibold uppercase tracking-[0.15em] ${textTertiary} mb-2 block`}>Skills</span>
          <div className="flex flex-wrap gap-1.5">
            {member.skills.map((s) => (
              <span
                key={s}
                className={`text-[10px] font-medium px-2.5 py-1 rounded-md ${textSecondary}`}
                style={{ background: pillBg, border: pillBorder }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        {/* Tools */}
        <div>
          <span className={`text-[9px] font-semibold uppercase tracking-[0.15em] ${textTertiary} mb-2 block`}>Tools</span>
          <div className="flex flex-wrap gap-1.5">
            {member.tools.map((t) => (
              <span
                key={t}
                className={`text-[10px] font-medium px-2.5 py-1 rounded-md ${textSecondary}`}
                style={{ background: `${color}08`, border: `1px solid ${color}15` }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'kpis') {
    return (
      <div className="space-y-2">
        {member.kpis.map((k) => (
          <div
            key={k.label}
            className="flex items-center justify-between rounded-lg px-3 py-2"
            style={{ background: pillBg, border: pillBorder }}
          >
            <span className={`text-[10px] font-medium uppercase tracking-[0.1em] ${textTertiary}`}>{k.label}</span>
            <span className="text-[11px] font-bold font-mono" style={{ color: `${color}cc` }}>
              {k.target}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

// ── Shared UI pieces ────────────────────────────────────────────────────

function ContractBadge({ contract }: { contract: string }) {
  const { isDark } = useTheme();
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    CDI: { bg: 'rgba(239,68,68,0.08)', text: 'rgba(239,68,68,0.8)', border: 'rgba(239,68,68,0.2)' },
    CDD: { bg: 'rgba(251,191,36,0.08)', text: 'rgba(251,191,36,0.8)', border: 'rgba(251,191,36,0.2)' },
    Freelance: { bg: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.06)', text: 'rgba(59,130,246,0.8)', border: 'rgba(59,130,246,0.2)' },
  };
  const c = colors[contract] || colors.CDI;
  return (
    <span
      className="text-[8px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-md"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {contract}
    </span>
  );
}

const LANG_FLAGS: Record<string, string> = {
  FR: '\u{1F1EB}\u{1F1F7}',
  EN: '\u{1F1EC}\u{1F1E7}',
  AR: '\u{1F1F2}\u{1F1E6}',
  Darija: '\u{1F1F2}\u{1F1E6}',
};

function LanguageFlags({ languages, small }: { languages: string[]; small?: boolean }) {
  // Deduplicate flags (AR and Darija both map to Morocco)
  const seen = new Set<string>();
  const flags: string[] = [];
  for (const lang of languages) {
    const flag = LANG_FLAGS[lang];
    if (flag && !seen.has(flag)) {
      seen.add(flag);
      flags.push(flag);
    }
  }
  return (
    <div className={`flex items-center ${small ? 'gap-0.5' : 'gap-1'} shrink-0`}>
      {flags.map((flag, i) => (
        <span key={i} className={small ? 'text-[14px]' : 'text-[18px]'} role="img">
          {flag}
        </span>
      ))}
    </div>
  );
}

// ── Expandable Section (smooth height animation) ────────────────────────

function ExpandableSection({ expanded, children }: { expanded: boolean; children: React.ReactNode }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!contentRef.current) return;
    if (!expanded) { setHeight(0); return; }

    // Measure immediately
    setHeight(contentRef.current.scrollHeight);

    // Re-measure whenever inner content resizes (e.g. tab switch)
    const ro = new ResizeObserver(() => {
      if (contentRef.current) setHeight(contentRef.current.scrollHeight);
    });
    ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, [expanded]);

  return (
    <div
      className="overflow-hidden transition-all duration-300 ease-out"
      style={{ maxHeight: height, opacity: expanded ? 1 : 0 }}
    >
      <div ref={contentRef}>{children}</div>
    </div>
  );
}

// ── SVG Icons (inline, no dependencies) ─────────────────────────────────

function IconPeople() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconGear() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconDiamond() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l4 6-10 13L2 9z" /><path d="M2 9h20" /><path d="M10 3l-4 6 6 13 6-13-4-6" />
    </svg>
  );
}

function IconHandshake() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 7.65l.78.77L12 20.64l7.64-7.64.78-.77a5.4 5.4 0 0 0 0-7.65z" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function IconReport() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function IconInbox() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function IconMegaphone() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function IconCamera() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function IconFilter() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function IconDatabase() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="9" y1="6" x2="9" y2="6.01" /><line x1="15" y1="6" x2="15" y2="6.01" /><line x1="9" y1="10" x2="9" y2="10.01" /><line x1="15" y1="10" x2="15" y2="10.01" /><line x1="9" y1="14" x2="9" y2="14.01" /><line x1="15" y1="14" x2="15" y2="14.01" /><line x1="9" y1="18" x2="15" y2="18" />
    </svg>
  );
}

function IconTarget() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
}
