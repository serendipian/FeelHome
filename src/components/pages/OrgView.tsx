'use client';

import { useState, useMemo } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useFinancial } from '@/context/FinancialContext';
import { useTeam } from '@/context/TeamContext';
import { mergeTeamMember } from '@/data/team';
import type { MergedTeamMember } from '@/data/team';
import OrgMemberModal from '@/components/pages/OrgMemberModal';

// ── Hierarchy config (read-only, not in data layer) ───────────────────────

const ORG_TIERS = {
  leadership: ['director', 'community-manager'],
  backoffice: ['digital-manager', 'property-hunter', 'customer-service', 'community-mgr'],
  field: ['agent-casa', 'agent-marrakech', 'agent-rabat', 'agent-other'],
} as const;

// ── Contract badge colors ─────────────────────────────────────────────────

const CONTRACT_COLORS: Record<string, { bg: string; text: string }> = {
  CDI: { bg: 'rgba(239,68,68,0.12)', text: '#f87171' },
  CDD: { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24' },
  Freelance: { bg: 'rgba(29,127,243,0.12)', text: '#60a5fa' },
};

// ── Main Component ────────────────────────────────────────────────────────

export default function OrgView() {
  const { isDark } = useTheme();
  const { activeMarkets } = useFinancial();
  const { teamData } = useTeam();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const members = useMemo(() => teamData.map(mergeTeamMember), [teamData]);

  const getMember = (id: string) => members.find(m => m.id === id);

  // Filter field agents by active markets
  const visibleFieldIds = useMemo(() => {
    const marketMap: Record<string, string> = {
      'agent-casa': 'casablanca',
      'agent-marrakech': 'marrakech',
      'agent-rabat': 'rabat',
      'agent-other': 'autre',
    };
    return ORG_TIERS.field.filter(id => {
      const market = marketMap[id];
      return !market || activeMarkets[market as keyof typeof activeMarkets];
    });
  }, [activeMarkets]);

  const selectedMember = selectedId ? getMember(selectedId) ?? null : null;

  return (
    <div className="relative min-h-screen p-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1
            className="text-lg font-bold"
            style={{ color: isDark ? '#fff' : '#1e293b' }}
          >
            Organization
          </h1>
          <p
            className="text-xs mt-1"
            style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.4)' }}
          >
            Team structure & hierarchy — {members.length} members
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <LegendBadge color="#d4a853" label="Command" isDark={isDark} />
          <LegendBadge color="#2dd4bf" label="Collaboration" isDark={isDark} />
          <LegendBadge color="#f59e0b" label="Oversight" isDark={isDark} />
        </div>
      </div>

      {/* ═══ LEADERSHIP TIER ═══ */}
      <TierLabel label="LEADERSHIP" color="rgba(212,168,83,0.3)" />
      <div
        className="pb-5 mb-1"
        style={{ borderBottom: isDark ? '1px solid rgba(212,168,83,0.06)' : '1px solid rgba(212,168,83,0.1)' }}
      >
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {getMember('director') && (
            <MemberCard
              member={getMember('director')!}
              isDark={isDark}
              isDirector
              onClick={() => setSelectedId('director')}
            />
          )}
          {/* Dashed peer link */}
          <div className="hidden sm:flex items-center">
            <div className="w-10 border-t-[1.5px] border-dashed" style={{ borderColor: 'rgba(212,168,83,0.25)' }} />
          </div>
          {getMember('community-manager') && (
            <MemberCard
              member={getMember('community-manager')!}
              isDark={isDark}
              onClick={() => setSelectedId('community-manager')}
            />
          )}
        </div>
      </div>

      {/* SVG: Leadership → Backoffice connections */}
      <ConnectionLines isDark={isDark} />

      {/* ═══ BACKOFFICE TIER ═══ */}
      <TierLabel label="BACKOFFICE" color="rgba(45,212,191,0.3)" />
      <div
        className="pb-5 mb-1"
        style={{ borderBottom: isDark ? '1px solid rgba(45,212,191,0.06)' : '1px solid rgba(45,212,191,0.1)' }}
      >
        <div className="flex justify-center gap-3 flex-wrap">
          {ORG_TIERS.backoffice.map(id => {
            const m = getMember(id);
            if (!m) return null;
            return (
              <MemberCard
                key={id}
                member={m}
                isDark={isDark}
                onClick={() => setSelectedId(id)}
              />
            );
          })}
        </div>
      </div>

      {/* SVG: Backoffice ↔ Field collaboration lines */}
      <CollabLines isDark={isDark} />

      {/* Collaboration zone indicator */}
      <div
        className="mx-4 sm:mx-10 my-2 px-4 py-1.5 rounded-xl text-center"
        style={{
          border: isDark ? '1px dashed rgba(45,212,191,0.12)' : '1px dashed rgba(45,212,191,0.2)',
        }}
      >
        <span
          className="text-[9px] font-semibold tracking-[2px]"
          style={{ color: 'rgba(45,212,191,0.35)' }}
        >
          ↕ BIDIRECTIONAL COLLABORATION ↕
        </span>
      </div>

      {/* ═══ FIELD AGENTS TIER ═══ */}
      <TierLabel label="FIELD AGENTS" color="rgba(29,127,243,0.3)" />
      <div className="flex justify-center gap-3 flex-wrap">
        {visibleFieldIds.map(id => {
          const m = getMember(id);
          if (!m) return null;
          return (
            <MemberCard
              key={id}
              member={m}
              isDark={isDark}
              onClick={() => setSelectedId(id)}
            />
          );
        })}
      </div>

      {/* Lateral Modal */}
      <OrgMemberModal
        member={selectedMember}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}

// ── SVG Connection Lines ────────────────────────────────────────────────

function ConnectionLines({ isDark }: { isDark: boolean }) {
  return (
    <div className="hidden lg:flex justify-center my-1 overflow-hidden">
      <svg viewBox="0 0 600 60" width="600" height="60" className="max-w-full">
        {/* Director → Backoffice fan (gold) */}
        <line x1="200" y1="0" x2="100" y2="60" stroke="rgba(212,168,83,0.15)" strokeWidth="1" />
        <line x1="200" y1="0" x2="250" y2="60" stroke="rgba(212,168,83,0.15)" strokeWidth="1" />
        <line x1="200" y1="0" x2="400" y2="60" stroke="rgba(212,168,83,0.15)" strokeWidth="1" />

        {/* Marketing Mgr → Community Mgr (amber dashed) */}
        <line x1="400" y1="0" x2="500" y2="60" stroke="rgba(245,158,11,0.2)" strokeWidth="1" strokeDasharray="4 3" />

        {/* Animated gold particles */}
        <circle r="2.5" fill="#d4a853" opacity="0.6">
          <animateMotion dur="3s" repeatCount="indefinite" path="M200,0 L100,60" />
        </circle>
        <circle r="2.5" fill="#d4a853" opacity="0.6">
          <animateMotion dur="3.5s" repeatCount="indefinite" path="M200,0 L250,60" begin="0.8s" />
        </circle>
        <circle r="2.5" fill="#d4a853" opacity="0.6">
          <animateMotion dur="4s" repeatCount="indefinite" path="M200,0 L400,60" begin="1.5s" />
        </circle>

        {/* Amber oversight particle */}
        <circle r="2" fill="#f59e0b" opacity="0.5">
          <animateMotion dur="3s" repeatCount="indefinite" path="M400,0 L500,60" />
        </circle>
      </svg>
    </div>
  );
}

function CollabLines({ isDark }: { isDark: boolean }) {
  return (
    <div className="hidden lg:flex justify-center my-1 overflow-hidden">
      <svg viewBox="0 0 600 50" width="600" height="50" className="max-w-full">
        {/* 3 backoffice positions × 4 agent positions — web of teal lines */}
        <line x1="100" y1="0" x2="80" y2="50" stroke="rgba(45,212,191,0.1)" strokeWidth="0.8" />
        <line x1="100" y1="0" x2="250" y2="50" stroke="rgba(45,212,191,0.07)" strokeWidth="0.8" />
        <line x1="100" y1="0" x2="400" y2="50" stroke="rgba(45,212,191,0.05)" strokeWidth="0.8" />
        <line x1="100" y1="0" x2="520" y2="50" stroke="rgba(45,212,191,0.04)" strokeWidth="0.8" />

        <line x1="250" y1="0" x2="80" y2="50" stroke="rgba(45,212,191,0.07)" strokeWidth="0.8" />
        <line x1="250" y1="0" x2="250" y2="50" stroke="rgba(45,212,191,0.1)" strokeWidth="0.8" />
        <line x1="250" y1="0" x2="400" y2="50" stroke="rgba(45,212,191,0.07)" strokeWidth="0.8" />
        <line x1="250" y1="0" x2="520" y2="50" stroke="rgba(45,212,191,0.05)" strokeWidth="0.8" />

        <line x1="400" y1="0" x2="80" y2="50" stroke="rgba(45,212,191,0.04)" strokeWidth="0.8" />
        <line x1="400" y1="0" x2="250" y2="50" stroke="rgba(45,212,191,0.07)" strokeWidth="0.8" />
        <line x1="400" y1="0" x2="400" y2="50" stroke="rgba(45,212,191,0.1)" strokeWidth="0.8" />
        <line x1="400" y1="0" x2="520" y2="50" stroke="rgba(45,212,191,0.07)" strokeWidth="0.8" />

        {/* Bidirectional teal particles — down */}
        <circle r="2" fill="#2dd4bf" opacity="0.5">
          <animateMotion dur="4s" repeatCount="indefinite" path="M100,0 L80,50" />
        </circle>
        <circle r="2" fill="#2dd4bf" opacity="0.5">
          <animateMotion dur="4s" repeatCount="indefinite" path="M250,0 L400,50" begin="2s" />
        </circle>
        <circle r="2" fill="#2dd4bf" opacity="0.5">
          <animateMotion dur="3.8s" repeatCount="indefinite" path="M400,0 L520,50" begin="3s" />
        </circle>

        {/* Bidirectional teal particles — up */}
        <circle r="2" fill="#2dd4bf" opacity="0.4">
          <animateMotion dur="4.5s" repeatCount="indefinite" path="M250,50 L100,0" begin="1s" />
        </circle>
        <circle r="2" fill="#2dd4bf" opacity="0.4">
          <animateMotion dur="4.2s" repeatCount="indefinite" path="M520,50 L400,0" begin="1.5s" />
        </circle>
      </svg>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────

function TierLabel({ label, color }: { label: string; color: string }) {
  return (
    <div className="mb-2 mt-4">
      <span
        className="text-[9px] font-bold tracking-[3px]"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
}

function LegendBadge({ color, label, isDark }: { color: string; label: string; isDark: boolean }) {
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
      style={{
        background: `${color}0A`,
        border: `1px solid ${color}20`,
      }}
    >
      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
      <span className="text-[10px]" style={{ color: `${color}B3` }}>{label}</span>
    </div>
  );
}

function MemberCard({
  member,
  isDark,
  isDirector,
  onClick,
}: {
  member: MergedTeamMember;
  isDark: boolean;
  isDirector?: boolean;
  onClick: () => void;
}) {
  const cc = CONTRACT_COLORS[member.contract] || CONTRACT_COLORS.Freelance;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer text-left"
      style={{
        background: `${member.color}08`,
        border: `1px solid ${member.color}30`,
        boxShadow: isDirector ? `0 0 20px ${member.color}10` : 'none',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = `${member.color}60`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = `${member.color}30`;
      }}
    >
      <div
        className="shrink-0 rounded-full flex items-center justify-center"
        style={{
          width: isDirector ? 40 : 34,
          height: isDirector ? 40 : 34,
          background: `${member.color}15`,
          border: `${isDirector ? 2 : 1.5}px solid ${member.color}`,
        }}
      >
        <span
          style={{
            color: member.color,
            fontSize: isDirector ? 12 : 10,
            fontWeight: 700,
          }}
        >
          {member.initials}
        </span>
      </div>
      <div>
        <div
          className="text-[13px] font-semibold"
          style={{ color: member.color }}
        >
          {member.title}
        </div>
        <span
          className="text-[9px] font-medium px-2 py-px rounded-full"
          style={{ background: cc.bg, color: cc.text }}
        >
          {member.contract}
        </span>
      </div>
    </button>
  );
}
