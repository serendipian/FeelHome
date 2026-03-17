'use client';

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useFinancial } from '@/context/FinancialContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useTeam } from '@/context/TeamContext';
import { getIcon, mergeTeamMember } from '@/data/team';
import type { MergedTeamMember } from '@/data/team';
import type { CommissionType } from '@/types/team';
import TeamEditTable from '@/components/pages/TeamEditTable';

// ── Tab types ────────────────────────────────────────────────────────────

type TabKey = 'overview' | 'schedule' | 'compensation' | 'skills' | 'kpis';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'overview', label: 'Main Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { key: 'schedule', label: 'Contract', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { key: 'compensation', label: 'Compensation', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { key: 'skills', label: 'Skills & Tools', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { key: 'kpis', label: 'Monthly Targets', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
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
  const { teamData, updateTeamMember, updateKPI } = useTeam();
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  // Merge persisted data with static display props
  const members = teamData.map(mergeTeamMember);
  const directorM = members.find(m => m.id === 'director')!;
  const marketingManagerM = members.find(m => m.id === 'community-manager');
  const communityMgrM = members.find(m => m.id === 'community-mgr');
  const digitalManagerM = members.find(m => m.id === 'digital-manager')!;
  const propertyHunterM = members.find(m => m.id === 'property-hunter')!;
  const customerServiceM = members.find(m => m.id === 'customer-service');

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

  return (
    <div className="animate-fadeIn">
      <style>{`
        @keyframes tabContentIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .tab-content-enter { animation: tabContentIn 0.35s ease-out; }
      `}</style>

      {/* ━━━ Global Tab Bar + View/Edit Toggle ━━━ */}
      <GlobalTabBar activeTab={activeTab} onTabChange={setActiveTab} isDark={isDark} isEditMode={isEditMode} onToggleEditMode={() => setIsEditMode(!isEditMode)} />

      {/* ━━━ Edit Mode ━━━ */}
      {isEditMode && <TeamEditTable />}

      {/* ━━━ View Mode ━━━ */}
      {!isEditMode && <>

      {/* ━━━ Management: Director + Marketing Manager + Community Manager ━━━ */}
      <div className="flex flex-col md:flex-row">
        <SectionLabel label="Management" />
        <div className="flex-1 flex flex-col md:flex-row items-stretch md:items-start gap-4 md:gap-0">
          <div className="flex-1 min-w-0">
            <MemberCard
              member={directorM}
              activeTab={activeTab}
              onCommissionRateChange={(r) => updateCommissionRate(directorM.id, r)}
              onCommissionTypeChange={(t) => updateCommissionType(directorM.id, t)}
              onKPIChange={(i, f, v) => updateKPI(directorM.id, i, f, v)}
            />
          </div>
          {marketingManagerM && (
            <>
              <div className="hidden md:block"><HorizontalConnector isDark={isDark} /></div>
              <div className="flex-1 min-w-0">
                <MemberCard
                  member={marketingManagerM}
                  activeTab={activeTab}
                  onCommissionRateChange={(r) => updateCommissionRate(marketingManagerM.id, r)}
                  onCommissionTypeChange={(t) => updateCommissionType(marketingManagerM.id, t)}
                  onKPIChange={(i, f, v) => updateKPI(marketingManagerM.id, i, f, v)}
                />
              </div>
            </>
          )}
          {communityMgrM && activeBrands.expats && (
            <>
              <div className="hidden md:block"><HorizontalConnector isDark={isDark} /></div>
              <div className="flex-1 min-w-0">
                <MemberCard
                  member={communityMgrM}
                  activeTab={activeTab}
                  onCommissionRateChange={(r) => updateCommissionRate(communityMgrM.id, r)}
                  onCommissionTypeChange={(t) => updateCommissionType(communityMgrM.id, t)}
                  onKPIChange={(i, f, v) => updateKPI(communityMgrM.id, i, f, v)}
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
            <FlowLine id="d-dm" x1={167} y1={0} x2={167} y2={48} isDark={isDark} dur={6} delay={0} />
            <FlowLine id="d-ph" x1={167} y1={0} x2={500} y2={48} isDark={isDark} dur={7} delay={0.5} />
            <FlowLine id="d-cs" x1={167} y1={0} x2={833} y2={48} isDark={isDark} dur={7.5} delay={1} />
          </svg>
        </div>
      </div>

      {/* ━━━ Backoffice: Digital Coordinator + Property Hunter + Customer Service ━━━ */}
      <div className="flex flex-col md:flex-row">
        <SectionLabel label="Backoffice" />
        <div className="flex-1 flex flex-col md:flex-row items-stretch md:items-start gap-4 md:gap-0">
          <div className="flex-1 min-w-0">
            <MemberCard
              member={digitalManagerM}
              activeTab={activeTab}
              onCommissionRateChange={(r) => updateCommissionRate(digitalManagerM.id, r)}
              onCommissionTypeChange={(t) => updateCommissionType(digitalManagerM.id, t)}
              onKPIChange={(i, f, v) => updateKPI(digitalManagerM.id, i, f, v)}
            />
          </div>
          <div className="hidden md:block"><HorizontalConnector isDark={isDark} /></div>
          <div className="flex-1 min-w-0">
            <MemberCard
              member={propertyHunterM}
              activeTab={activeTab}
              onCommissionRateChange={(r) => updateCommissionRate(propertyHunterM.id, r)}
              onCommissionTypeChange={(t) => updateCommissionType(propertyHunterM.id, t)}
              onKPIChange={(i, f, v) => updateKPI(propertyHunterM.id, i, f, v)}
            />
          </div>
          {customerServiceM && (
            <>
              <div className="hidden md:block"><HorizontalConnector isDark={isDark} /></div>
              <div className="flex-1 min-w-0">
                <MemberCard
                  member={customerServiceM}
                  activeTab={activeTab}
                  onCommissionRateChange={(r) => updateCommissionRate(customerServiceM.id, r)}
                  onCommissionTypeChange={(t) => updateCommissionType(customerServiceM.id, t)}
                  onKPIChange={(i, f, v) => updateKPI(customerServiceM.id, i, f, v)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ━━━ Connector: Backoffice → Agents ━━━ */}
      {visibleAgents.length > 0 && (
        <div className="hidden md:flex">
          <div className="w-8 shrink-0 mr-3" />
          <div className="flex-1 relative" style={{ height: 48 }}>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 48" preserveAspectRatio="none" fill="none">
              {/* Digital Coordinator → All Agents */}
              {agentXPositions.map((ax, i) => (
                <FlowLine key={`dm-${i}`} id={`dm-a${i}`} x1={167} y1={0} x2={ax} y2={48} isDark={isDark} dur={6 + i * 0.8} delay={i * 0.8} />
              ))}
              {/* Property Hunter → All Agents */}
              {agentXPositions.map((ax, i) => (
                <FlowLine key={`ph-${i}`} id={`ph-a${i}`} x1={500} y1={0} x2={ax} y2={48} isDark={isDark} dur={6.5 + i * 0.6} delay={0.4 + i * 0.8} />
              ))}
              {/* Customer Service → All Agents */}
              {agentXPositions.map((ax, i) => (
                <FlowLine key={`cs-${i}`} id={`cs-a${i}`} x1={833} y1={0} x2={ax} y2={48} isDark={isDark} dur={7 + i * 0.5} delay={0.8 + i * 0.8} />
              ))}
            </svg>
          </div>
        </div>
      )}

      {/* ━━━ Field Agents ━━━ */}
      {visibleAgents.length > 0 && (
        <div className="flex flex-col md:flex-row">
          <SectionLabel label="Field Agents" />
          <div className={`flex-1 grid grid-cols-1 sm:grid-cols-2 ${visibleAgents.length <= 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-4`}>
            {visibleAgents.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                activeTab={activeTab}
                onCommissionRateChange={(r) => updateCommissionRate(member.id, r)}
                onCommissionTypeChange={(t) => updateCommissionType(member.id, t)}
                onKPIChange={(i, f, v) => updateKPI(member.id, i, f, v)}
              />
            ))}
          </div>
        </div>
      )}

      </>}
    </div>
  );
}

// ── Global Tab Bar (animated sliding pill) ───────────────────────────────

function GlobalTabBar({
  activeTab,
  onTabChange,
  isDark,
  isEditMode,
  onToggleEditMode,
}: {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  isDark: boolean;
  isEditMode: boolean;
  onToggleEditMode: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<TabKey, HTMLButtonElement>>(new Map());
  const [pill, setPill] = useState({ left: 0, width: 0 });

  const measure = useCallback(() => {
    const btn = tabRefs.current.get(activeTab);
    const container = containerRef.current;
    if (!btn || !container) return;
    const cRect = container.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    setPill({ left: bRect.left - cRect.left, width: bRect.width });
  }, [activeTab]);

  useLayoutEffect(measure, [measure]);
  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const activeIndex = TABS.findIndex(t => t.key === activeTab);

  return (
    <div className="mb-8">
      <div
        className="flex items-center justify-between gap-4 rounded-2xl px-1.5 py-1.5"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)'
            : '#ffffff',
          border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(15,23,42,0.08)',
          boxShadow: isDark
            ? '0 2px 12px rgba(0,0,0,0.2)'
            : '0 2px 12px rgba(15,23,42,0.06), 0 0 0 1px rgba(15,23,42,0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Tabs */}
        <div
          ref={containerRef}
          className="relative inline-flex items-center gap-0.5"
        >
          {/* Sliding pill indicator */}
          <div
            className="absolute rounded-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              left: pill.left,
              width: pill.width,
              top: 0,
              height: '100%',
              background: isDark
                ? 'linear-gradient(135deg, rgba(212,168,83,0.15) 0%, rgba(212,168,83,0.06) 100%)'
                : 'linear-gradient(135deg, rgba(212,168,83,0.1) 0%, rgba(212,168,83,0.03) 100%)',
              border: '1px solid rgba(212,168,83,0.2)',
              boxShadow: '0 0 16px rgba(212,168,83,0.1), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          />

          {/* Glow under active pill */}
          <div
            className="absolute bottom-0 h-[2px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              left: pill.left + pill.width * 0.15,
              width: pill.width * 0.7,
              background: 'linear-gradient(90deg, transparent, rgba(212,168,83,0.5), transparent)',
              filter: 'blur(1px)',
            }}
          />

          {TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                ref={(el) => { if (el) tabRefs.current.set(tab.key, el); }}
                onClick={() => onTabChange(tab.key)}
                className="relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300"
                style={{ minWidth: 0 }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 transition-all duration-300"
                  style={{
                    stroke: isActive
                      ? '#d4a853'
                      : isDark ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.2)',
                    filter: isActive ? 'drop-shadow(0 0 4px rgba(212,168,83,0.3))' : 'none',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  <path d={tab.icon} />
                </svg>

                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.06em] whitespace-nowrap transition-all duration-300"
                  style={{
                    color: isActive
                      ? (isDark ? 'rgba(212,168,83,0.95)' : 'rgba(154,107,58,0.9)')
                      : (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(15,23,42,0.3)'),
                  }}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* View / Edit Toggle — styled like MAD/USD toggle */}
        <button
          onClick={onToggleEditMode}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 cursor-pointer shrink-0"
          style={{
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
            border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
          }}
          title={isEditMode ? 'Switch to View Mode' : 'Switch to Edit Mode'}
        >
          <div className="relative w-[36px] h-[20px] rounded-full transition-colors duration-300" style={{
            background: isEditMode ? 'rgba(212,168,83,0.3)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'),
          }}>
            <div
              className="absolute top-[2px] w-[16px] h-[16px] rounded-full transition-all duration-300 flex items-center justify-center"
              style={{
                left: isEditMode ? '18px' : '2px',
                background: isEditMode ? '#d4a853' : (isDark ? '#666' : '#888'),
                boxShadow: isEditMode
                  ? '0 1px 4px rgba(212,168,83,0.4)'
                  : '0 1px 4px rgba(0,0,0,0.3)',
              }}
            >
              <span style={{ fontSize: '8px', fontWeight: 700, color: 'white', lineHeight: 1 }}>
                {isEditMode ? (
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                ) : (
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.06em]" style={{
            color: isEditMode
              ? (isDark ? 'rgba(212,168,83,0.8)' : 'rgba(154,107,58,0.7)')
              : (isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.35)'),
          }}>
            {isEditMode ? 'Edit' : 'View'}
          </span>
        </button>
      </div>

      {/* Progress line under tabs */}
      <div
        className="mt-2 h-px rounded-full overflow-hidden"
        style={{
          background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            width: `${((activeIndex + 1) / TABS.length) * 100}%`,
            background: 'linear-gradient(90deg, rgba(212,168,83,0.1), rgba(212,168,83,0.4), rgba(212,168,83,0.15))',
          }}
        />
      </div>
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
  const pathD = 'M0,2 L100,2';

  return (
    <div className="w-12 shrink-0 self-stretch flex items-center justify-center">
      <svg className="w-full" style={{ height: 4, overflow: 'visible' }} viewBox="0 0 100 4" preserveAspectRatio="none" fill="none">
        <line x1="0" y1="2" x2="100" y2="2" stroke={baseStroke} strokeWidth="1" />
        <g>
          <animateMotion
            path={pathD}
            dur="6s"
            repeatCount="indefinite"
            keyPoints="0;1;0"
            keyTimes="0;0.5;1"
            calcMode="spline"
            keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
            rotate="auto"
          />
          <line x1="-12" y1="0" x2="12" y2="0" stroke="rgba(212,168,83,0.15)" strokeWidth="8" strokeLinecap="round" />
          <line x1="-8" y1="0" x2="8" y2="0" stroke="rgba(212,168,83,0.4)" strokeWidth="3" strokeLinecap="round" />
          <line x1="-5" y1="0" x2="5" y2="0" stroke="rgba(212,168,83,0.95)" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

// ── Member Card ─────────────────────────────────────────────────────────

function MemberCard({
  member,
  activeTab,
  onCommissionRateChange,
  onCommissionTypeChange,
  onKPIChange,
}: {
  member: MergedTeamMember;
  activeTab: TabKey;
  onCommissionRateChange: (rate: number) => void;
  onCommissionTypeChange: (type: CommissionType) => void;
  onKPIChange: (index: number, field: 'label' | 'target', value: string) => void;
}) {
  const { isDark } = useTheme();
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

      {/* Tab content */}
      <div className="px-5 pb-5">
        <div className={`border-t ${borderSub} pt-4`}>
          <TabContent
            member={member}
            tab={activeTab}
            color={member.color}
            onCommissionRateChange={onCommissionRateChange}
            onCommissionTypeChange={onCommissionTypeChange}
            onKPIChange={onKPIChange}
          />
        </div>
      </div>
    </div>
  );
}

// ── Tab Content ─────────────────────────────────────────────────────────

function TabContent({ member, tab, color, onCommissionRateChange, onCommissionTypeChange, onKPIChange }: {
  member: MergedTeamMember; tab: TabKey; color: string;
  onCommissionRateChange: (rate: number) => void;
  onCommissionTypeChange: (type: CommissionType) => void;
  onKPIChange: (index: number, field: 'label' | 'target', value: string) => void;
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
      <div className="grid grid-cols-2 gap-1">
        {member.responsibilities.map((r, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-md px-2 py-1.5"
            style={{ background: pillBg }}
          >
            <div
              className="w-5 h-5 rounded flex items-center justify-center shrink-0"
              style={{ color: `${color}80` }}
            >
              {getIcon(r.iconKey)}
            </div>
            <span className={`text-[10px] font-medium leading-tight truncate ${textSecondary}`}>{r.label}</span>
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
        {member.kpis.map((k, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-lg px-3 py-2"
            style={{ background: pillBg, border: pillBorder }}
          >
            <input
              type="text"
              value={k.label}
              onChange={(e) => onKPIChange(i, 'label', e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className={`text-[10px] font-medium uppercase tracking-[0.1em] bg-transparent border-b outline-none ${
                isDark ? 'border-white/10 focus:border-white/30' : 'border-slate-200 focus:border-slate-400'
              } ${textTertiary}`}
            />
            <input
              type="text"
              value={k.target}
              onChange={(e) => onKPIChange(i, 'target', e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className={`w-24 text-right text-[11px] font-bold font-mono bg-transparent border-b outline-none ${
                isDark ? 'border-white/10 focus:border-white/30' : 'border-slate-200 focus:border-slate-400'
              }`}
              style={{ color: `${color}cc` }}
            />
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
