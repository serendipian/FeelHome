'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useFinancial } from '@/context/FinancialContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useTeam } from '@/context/TeamContext';
import { TEAM_DISPLAY, getIcon, mergeTeamMember } from '@/data/team';
import type { MergedTeamMember } from '@/data/team';
import type { CommissionType } from '@/types/team';
import TeamEditTable from '@/components/pages/TeamEditTable';

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

export default function TeamView() {
  const { isDark } = useTheme();
  const { activeBrands, activeMarkets } = useFinancial();
  const { teamData, updateTeamMember } = useTeam();
  const [isEditMode, setIsEditMode] = useState(false);

  // Merge persisted data with static display props
  const members = teamData.map(mergeTeamMember);
  const directorM = members.find(m => m.id === 'director')!;
  const communityManagerM = members.find(m => m.id === 'community-manager');
  const digitalManagerM = members.find(m => m.id === 'digital-manager')!;
  const propertyHunterM = members.find(m => m.id === 'property-hunter')!;

  // Filter agents by active markets
  const agents = members.filter(m => m.id.startsWith('agent-'));
  const visibleAgents = agents.filter(m => !m.market || activeMarkets[m.market]);
  const agentXPositions = visibleAgents.length <= 1 ? [500]
    : visibleAgents.map((_, i) => Math.round(1000 * (i + 0.5) / visibleAgents.length));

  // Commission update helpers
  const updateCommissionRate = (id: string, rate: number) =>
    updateTeamMember(id, { commission: { ...teamData.find(m => m.id === id)!.commission, rate } });
  const updateCommissionType = (id: string, type: CommissionType) =>
    updateTeamMember(id, { commission: { ...teamData.find(m => m.id === id)!.commission, type } });

  // Summary counts
  const managementCount = [directorM, communityManagerM].filter(m => m && (!m.brands || m.brands.every(b => activeBrands[b]))).length;
  const backofficeCount = [digitalManagerM, propertyHunterM].filter(Boolean).length;
  const frontofficeCount = visibleAgents.length;
  const totalCount = managementCount + backofficeCount + frontofficeCount;

  return (
    <div className="animate-fadeIn">
      <style>{`
        @keyframes borderShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* ━━━ View / Edit Toggle ━━━ */}
      <div className="flex items-center justify-end gap-3 mb-6">
        <span className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
          {isEditMode ? 'Edit Mode' : 'View Mode'}
        </span>
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className="relative w-10 h-[22px] rounded-full transition-all duration-400 focus:outline-none shrink-0"
          style={{
            backgroundColor: isEditMode ? '#d4a853' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.08)'),
            boxShadow: isEditMode ? '0 0 16px rgba(212,168,83,0.3), inset 0 1px 2px rgba(0,0,0,0.2)' : (isDark ? 'inset 0 1px 3px rgba(0,0,0,0.3)' : 'inset 0 1px 3px rgba(15,23,42,0.1)'),
          }}
        >
          <span
            className="absolute top-[3px] left-[3px] w-4 h-4 rounded-full shadow-lg transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              transform: isEditMode ? 'translateX(18px)' : 'translateX(0)',
              background: isEditMode ? '#fff' : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.25)'),
              boxShadow: isEditMode ? '0 1px 4px rgba(0,0,0,0.3), 0 0 0 1px rgba(212,168,83,0.2)' : '0 1px 2px rgba(0,0,0,0.2)',
            }}
          />
        </button>
      </div>

      {/* ━━━ Edit Mode ━━━ */}
      {isEditMode && <TeamEditTable />}

      {/* ━━━ View Mode ━━━ */}
      {!isEditMode && <>

      {/* ━━━ Director + Community Manager ━━━ */}
      <div className="flex flex-col md:flex-row">
        <SectionLabel label="Management" />
        <div className="flex-1 flex flex-col md:flex-row items-stretch md:items-start gap-4 md:gap-0">
          <div className="w-full md:w-1/3 min-w-0">
            <DirectorCard
              member={directorM}
              onCommissionRateChange={(r) => updateCommissionRate(directorM.id, r)}
              onCommissionTypeChange={(t) => updateCommissionType(directorM.id, t)}
            />
          </div>
          {communityManagerM && activeBrands.expats && (
            <>
              <div className="hidden md:block"><HorizontalConnector isDark={isDark} /></div>
              <div className="w-full md:w-1/3 min-w-0">
                <MemberCard
                  member={communityManagerM}
                  onCommissionRateChange={(r) => updateCommissionRate(communityManagerM.id, r)}
                  onCommissionTypeChange={(t) => updateCommissionType(communityManagerM.id, t)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ━━━ Connector: Director → Backoffice ━━━ */}
      <div className="hidden md:flex">
        <div className="w-8 shrink-0 mr-3" />
        <div className="flex-1 relative" style={{ height: 48 }}>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 48" preserveAspectRatio="none" fill="none">
            <FlowLine id="d-dm" x1={250} y1={0} x2={250} y2={48} isDark={isDark} dur={6} delay={0} />
            <FlowLine id="d-ph" x1={250} y1={0} x2={750} y2={48} isDark={isDark} dur={7} delay={1} />
          </svg>
        </div>
      </div>

      {/* ━━━ Backoffice ━━━ */}
      <div className="flex flex-col md:flex-row">
        <SectionLabel label="Backoffice" />
        <div className="flex-1 flex flex-col md:flex-row items-stretch md:items-start gap-4 md:gap-0">
          <div className="flex-1 min-w-0">
            <MemberCard
              member={digitalManagerM}
              onCommissionRateChange={(r) => updateCommissionRate(digitalManagerM.id, r)}
              onCommissionTypeChange={(t) => updateCommissionType(digitalManagerM.id, t)}
            />
          </div>
          <div className="hidden md:block"><HorizontalConnector isDark={isDark} /></div>
          <div className="flex-1 min-w-0">
            <MemberCard
              member={propertyHunterM}
              onCommissionRateChange={(r) => updateCommissionRate(propertyHunterM.id, r)}
              onCommissionTypeChange={(t) => updateCommissionType(propertyHunterM.id, t)}
            />
          </div>
        </div>
      </div>

      {/* ━━━ Connector: Backoffice → Agents ━━━ */}
      {visibleAgents.length > 0 && (
        <div className="hidden md:flex">
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
        <div className="flex flex-col md:flex-row">
          <SectionLabel label="Field Agents" />
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {visibleAgents.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onCommissionRateChange={(r) => updateCommissionRate(member.id, r)}
                onCommissionTypeChange={(t) => updateCommissionType(member.id, t)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ━━━ Summary Bar ━━━ */}
      <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Headcount', value: String(totalCount), color: isDark ? '#ffffff' : '#1e293b' },
          { label: 'Management', value: String(managementCount), color: '#d4a853' },
          { label: 'Backoffice', value: String(backofficeCount), color: '#8b5cf6' },
          { label: 'Frontoffice', value: String(frontofficeCount), color: '#1d7ff3' },
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

      </>}
    </div>
  );
}

// ── Section Label (vertical, left side) ─────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  const { isDark } = useTheme();
  return (
    <div className="hidden md:flex w-8 shrink-0 items-center justify-center mr-3">
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
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={baseStroke} strokeWidth="1" />
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
        <line x1="-12" y1="0" x2="12" y2="0" stroke="rgba(212,168,83,0.15)" strokeWidth="8" strokeLinecap="round" />
        <line x1="-8" y1="0" x2="8" y2="0" stroke="rgba(212,168,83,0.4)" strokeWidth="3" strokeLinecap="round" />
        <line x1="-5" y1="0" x2="5" y2="0" stroke="rgba(212,168,83,0.95)" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </g>
  );
}

// ── Horizontal connector between cards ──────────────────────────────────

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
  onCommissionRateChange,
  onCommissionTypeChange,
}: {
  member: MergedTeamMember;
  onCommissionRateChange: (rate: number) => void;
  onCommissionTypeChange: (type: CommissionType) => void;
}) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const textPrimary = isDark ? 'text-white/90' : 'text-slate-800';
  const textTertiary = isDark ? 'text-white/30' : 'text-slate-400';
  const borderSub = isDark ? 'border-white/[0.04]' : 'border-slate-100';

  return (
    <div className="relative rounded-2xl group transition-all duration-300 overflow-hidden">
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
            ? 'linear-gradient(135deg, rgba(212,168,83,0.06) 0%, rgba(212,168,83,0.02) 100%)'
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
                boxShadow: '0 0 24px rgba(212,168,83,0.2), inset 0 0 12px rgba(212,168,83,0.05)',
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

        {/* Always-open tabbed content */}
        <div className="px-7 pb-6">
          <div className={`border-t ${borderSub} pt-4`}>
            {/* Tab bar */}
            <div className={`flex mb-4 rounded-lg p-0.5 ${isDark ? 'bg-white/[0.03]' : 'bg-slate-100/80'}`}>
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
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
            <TabContent
              member={member}
              tab={activeTab}
              color={member.color}
              onCommissionRateChange={onCommissionRateChange}
              onCommissionTypeChange={onCommissionTypeChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Member Card ─────────────────────────────────────────────────────────

function MemberCard({
  member,
  onCommissionRateChange,
  onCommissionTypeChange,
}: {
  member: MergedTeamMember;
  onCommissionRateChange: (rate: number) => void;
  onCommissionTypeChange: (type: CommissionType) => void;
}) {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const textPrimary = isDark ? 'text-white/85' : 'text-slate-800';
  const textTertiary = isDark ? 'text-white/30' : 'text-slate-400';
  const borderSub = isDark ? 'border-white/[0.04]' : 'border-slate-100';

  return (
    <div
      className="rounded-2xl group transition-all duration-300 overflow-hidden"
      style={{
        background: isDark ? `linear-gradient(135deg, ${member.color}08 0%, ${member.color}03 100%)` : '#ffffff',
        border: `1px solid ${member.color}20`,
        boxShadow: `0 0 20px ${member.color}08`,
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
              boxShadow: `0 0 16px ${member.color}15`,
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

      {/* Always-open tabbed content */}
      <div className="px-5 pb-5">
        <div className={`border-t ${borderSub} pt-4`}>
          <div className={`flex mb-4 rounded-lg p-0.5 ${isDark ? 'bg-white/[0.03]' : 'bg-slate-100/80'}`}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
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
          <TabContent
            member={member}
            tab={activeTab}
            color={member.color}
            onCommissionRateChange={onCommissionRateChange}
            onCommissionTypeChange={onCommissionTypeChange}
          />
        </div>
      </div>
    </div>
  );
}

// ── Tab Content ─────────────────────────────────────────────────────────

function TabContent({ member, tab, color, onCommissionRateChange, onCommissionTypeChange }: {
  member: MergedTeamMember; tab: TabKey; color: string;
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
              {getIcon(r.iconKey)}
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
              value={member.commission.rate}
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
            value={member.commission.type}
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
