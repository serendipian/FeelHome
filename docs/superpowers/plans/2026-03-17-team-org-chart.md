# Team Org Chart Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `/org` page with an investor-grade, read-only org chart showing team hierarchy, animated connection lines, and click-to-expand lateral modal — without modifying any existing team files.

**Architecture:** New route `/org` with `OrgView.tsx` (main chart + SVG connections) and `OrgMemberModal.tsx` (slide-in panel). Hierarchy is hardcoded as a const in OrgView. Data comes from existing `useTeam()` and `useFinancial()` hooks (read-only).

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS 4, TypeScript, SVG animations

**Spec:** `docs/superpowers/specs/2026-03-17-team-org-chart-design.md`

---

## File Structure

| Action | Path | Responsibility |
|--------|------|---------------|
| Create | `src/app/org/page.tsx` | Route wrapper (3 lines, same pattern as `/team`) |
| Create | `src/components/pages/OrgView.tsx` | Main org chart: hierarchy config, tier layout, SVG connections, card rendering, modal state |
| Create | `src/components/pages/OrgMemberModal.tsx` | Lateral slide-in panel with 7 sections |
| Modify | `src/components/layout/Sidebar.tsx` | Add "Organization" nav item after "Team" |

**No changes to:** `TeamView.tsx`, `TeamEditTable.tsx`, `TeamContext.tsx`, `team.ts`, `team types`

---

## Chunk 1: Route + Sidebar Nav

### Task 1: Create the /org route page

**Files:**
- Create: `src/app/org/page.tsx`

- [ ] **Step 1: Create route file**

```tsx
'use client';

import OrgView from '@/components/pages/OrgView';

export default function OrgPage() {
  return <OrgView />;
}
```

- [ ] **Step 2: Create placeholder OrgView**

Create `src/components/pages/OrgView.tsx` with a minimal placeholder so the route doesn't break:

```tsx
'use client';

export default function OrgView() {
  return (
    <div className="p-8">
      <h1 className="text-white text-xl font-bold">Organization</h1>
      <p className="text-white/40 text-sm mt-2">Team structure & hierarchy</p>
    </div>
  );
}
```

- [ ] **Step 3: Verify route works**

Run: `npm run dev`
Navigate to `http://localhost:3000/org` — should see "Organization" heading.

- [ ] **Step 4: Commit**

```bash
git add src/app/org/page.tsx src/components/pages/OrgView.tsx
git commit -m "feat: add /org route with placeholder view"
```

### Task 2: Add "Organization" nav item to Sidebar

**Files:**
- Modify: `src/components/layout/Sidebar.tsx:8-16`

- [ ] **Step 1: Add OrgIcon function**

Add this icon function after the existing `TeamIcon` function (after line 158 in Sidebar.tsx):

```tsx
function OrgIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
    </svg>
  );
}
```

- [ ] **Step 2: Add nav item to the array**

In the `navItems` array (line 8-16), add after the Team entry:

```ts
{ href: '/org', label: 'Organization', icon: OrgIcon },
```

The array should now have Team at index 4 and Organization at index 5.

- [ ] **Step 3: Verify sidebar shows new item**

Run dev server, check that "Organization" appears in sidebar after "Team", and clicking it navigates to `/org`.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "feat: add Organization nav item to sidebar"
```

---

## Chunk 2: OrgMemberModal (lateral slide-in panel)

### Task 3: Build the lateral modal component

**Files:**
- Create: `src/components/pages/OrgMemberModal.tsx`

This is the slide-in panel that appears when clicking a team member card. It receives a `MergedTeamMember` and renders 7 sections. Build it first so OrgView can use it.

- [ ] **Step 1: Create OrgMemberModal with all 7 sections**

Create `src/components/pages/OrgMemberModal.tsx`:

```tsx
'use client';

import { useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { getIcon } from '@/data/team';
import type { MergedTeamMember } from '@/data/team';

interface OrgMemberModalProps {
  member: MergedTeamMember | null;
  onClose: () => void;
}

const CONTRACT_COLORS: Record<string, { bg: string; text: string }> = {
  CDI: { bg: 'rgba(239,68,68,0.12)', text: '#f87171' },
  CDD: { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24' },
  Freelance: { bg: 'rgba(29,127,243,0.12)', text: '#60a5fa' },
};

const BRAND_INFO: Record<string, { label: string; color: string }> = {
  feelHome: { label: 'Feel Home', color: '#d4a853' },
  mInvest: { label: 'M Invest', color: '#1d7ff3' },
  expats: { label: 'Expats.ma', color: '#2dd4bf' },
};

export default function OrgMemberModal({ member, onClose }: OrgMemberModalProps) {
  const { isDark } = useTheme();

  // Close on Escape
  useEffect(() => {
    if (!member) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [member, onClose]);

  if (!member) return null;

  const cc = CONTRACT_COLORS[member.contract] || CONTRACT_COLORS.Freelance;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-[340px] max-w-full overflow-y-auto transition-transform duration-300 ease-out"
        style={{
          background: isDark ? 'rgba(10,12,20,0.97)' : 'rgba(255,255,255,0.98)',
          borderLeft: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(15,23,42,0.08)',
          backdropFilter: 'blur(20px)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.4)',
        }}
      >
        <div className="p-6">
          {/* Close button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
              style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)' }}
            >
              <span style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.4)' }}>✕</span>
            </button>
          </div>

          {/* Section 1: Header */}
          <div className="text-center mb-6">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{
                background: `${member.color}15`,
                border: `2px solid ${member.color}`,
              }}
            >
              <span style={{ color: member.color, fontSize: 18, fontWeight: 700 }}>
                {member.initials}
              </span>
            </div>
            <div style={{ color: member.color, fontSize: 16, fontWeight: 700 }}>{member.title}</div>
            {member.scope && (
              <div className="mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.4)', fontSize: 11 }}>
                {member.scope}
              </div>
            )}
            <div className="flex justify-center gap-1.5 mt-2">
              {member.languages.map((lang) => (
                <span
                  key={lang}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(15,23,42,0.05)',
                    color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.5)',
                  }}
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Section 2: Schedule */}
          <SectionLabel label="SCHEDULE" isDark={isDark} />
          <div className="grid grid-cols-2 gap-2 mb-5">
            <InfoCell label="Contract" value={member.contract} isDark={isDark} />
            <InfoCell label="Start" value={`Month ${member.startMonth}`} isDark={isDark} />
            <InfoCell label="Status" value={member.schedule.status} isDark={isDark} />
            <InfoCell label="Hours" value={member.schedule.hours} isDark={isDark} />
          </div>

          {/* Section 3: Responsibilities */}
          <SectionLabel label="RESPONSIBILITIES" isDark={isDark} />
          <div className="flex flex-col gap-1 mb-5">
            {member.responsibilities.map((r, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md"
                style={{ background: `${member.color}08`, color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.7)' }}
              >
                <span style={{ color: member.color }}>{getIcon(r.iconKey)}</span>
                <span className="text-[11px]">{r.label}</span>
              </div>
            ))}
          </div>

          {/* Section 4: Compensation */}
          <SectionLabel label="COMPENSATION" isDark={isDark} />
          <div
            className="rounded-lg p-3 mb-5"
            style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)' }}
          >
            {member.commission.rate > 0 && (
              <div className="flex justify-between mb-1.5">
                <span className="text-[11px]" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.4)' }}>Commission</span>
                <span className="text-[11px] font-semibold" style={{ color: member.color }}>
                  {member.commission.rate}% {member.commission.type}
                </span>
              </div>
            )}
            {member.commission.rate === 0 && (
              <div className="text-[11px]" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.35)' }}>
                No commission
              </div>
            )}
          </div>

          {/* Section 5: Skills & Tools */}
          <SectionLabel label="SKILLS" isDark={isDark} />
          <div className="flex flex-wrap gap-1 mb-3">
            {member.skills.map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 rounded-md text-[10px]"
                style={{ background: `${member.color}12`, color: `${member.color}B3` }}
              >
                {s}
              </span>
            ))}
          </div>
          <SectionLabel label="TOOLS" isDark={isDark} />
          <div className="flex flex-wrap gap-1 mb-5">
            {member.tools.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-md text-[10px]"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.04)',
                  color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.5)',
                }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Section 6: KPIs */}
          <SectionLabel label="KPIs" isDark={isDark} />
          <div className="flex flex-col gap-1.5 mb-5">
            {member.kpis.map((kpi, i) => (
              <div
                key={i}
                className="flex justify-between items-center px-2 py-1.5 rounded-md"
                style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)' }}
              >
                <span className="text-[11px]" style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(15,23,42,0.6)' }}>
                  {kpi.label}
                </span>
                <span className="text-[11px] font-semibold font-mono" style={{ color: '#2dd4bf' }}>
                  {kpi.target}
                </span>
              </div>
            ))}
          </div>

          {/* Section 7: Brand Affiliation */}
          {member.brands && member.brands.length > 0 && (
            <>
              <SectionLabel label="BRANDS" isDark={isDark} />
              <div className="flex flex-wrap gap-2">
                {member.brands.map((b) => {
                  const info = BRAND_INFO[b];
                  if (!info) return null;
                  return (
                    <div
                      key={b}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                      style={{
                        background: `${info.color}0A`,
                        border: `1px solid ${info.color}20`,
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded flex items-center justify-center"
                        style={{ background: `${info.color}25` }}
                      >
                        <span style={{ color: info.color, fontSize: 7, fontWeight: 700 }}>
                          {info.label.split(' ').map(w => w[0]).join('')}
                        </span>
                      </div>
                      <span style={{ color: `${info.color}B3`, fontSize: 10 }}>{info.label}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          {member.location && !member.brands?.length && (
            <>
              <SectionLabel label="MARKET" isDark={isDark} />
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                style={{
                  background: `${member.color}0A`,
                  border: `1px solid ${member.color}20`,
                }}
              >
                <span style={{ color: `${member.color}B3`, fontSize: 11 }}>{member.location}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function SectionLabel({ label, isDark }: { label: string; isDark: boolean }) {
  return (
    <div
      className="text-[9px] font-semibold tracking-[2px] mb-2"
      style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.3)' }}
    >
      {label}
    </div>
  );
}

function InfoCell({ label, value, isDark }: { label: string; value: string; isDark: boolean }) {
  return (
    <div
      className="rounded-lg px-2.5 py-2"
      style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)' }}
    >
      <div className="text-[9px]" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(15,23,42,0.35)' }}>{label}</div>
      <div className="text-[12px] font-semibold mt-0.5" style={{ color: isDark ? '#fff' : '#1e293b' }}>{value}</div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run dev` — no errors. (Modal won't be visible yet, that's fine.)

- [ ] **Step 3: Commit**

```bash
git add src/components/pages/OrgMemberModal.tsx
git commit -m "feat: add OrgMemberModal lateral slide-in panel"
```

---

## Chunk 3: OrgView — Full Chart with Connections

### Task 4: Build OrgView with hierarchy, cards, and connections

**Files:**
- Modify: `src/components/pages/OrgView.tsx` (replace placeholder)

This is the main component. It renders:
1. Page header with relationship legend
2. Three tier sections with cards
3. SVG connection lines with animated particles
4. Modal integration

- [ ] **Step 1: Replace OrgView placeholder with full implementation**

Replace the entire content of `src/components/pages/OrgView.tsx` with:

```tsx
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

// IDs that Director manages directly
const DIRECTOR_REPORTS = ['digital-manager', 'property-hunter', 'customer-service', 'agent-casa', 'agent-marrakech', 'agent-rabat', 'agent-other'];

// IDs that collaborate bidirectionally with field agents
const COLLAB_BACKOFFICE = ['digital-manager', 'property-hunter', 'customer-service'];

// Marketing Manager's report
const OVERSIGHT_TARGET = 'community-mgr';

// ── Contract badge colors ─────────────────────────────────────────────────

const CONTRACT_COLORS: Record<string, { bg: string; text: string }> = {
  CDI: { bg: 'rgba(239,68,68,0.12)', text: '#f87171' },
  CDD: { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24' },
  Freelance: { bg: 'rgba(29,127,243,0.12)', text: '#60a5fa' },
};

// ── Tier config ───────────────────────────────────────────────────────────

const TIER_META = {
  leadership: { label: 'LEADERSHIP', color: 'rgba(212,168,83,0.3)' },
  backoffice: { label: 'BACKOFFICE', color: 'rgba(45,212,191,0.3)' },
  field: { label: 'FIELD AGENTS', color: 'rgba(29,127,243,0.3)' },
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
      <TierLabel label={TIER_META.leadership.label} color={TIER_META.leadership.color} isDark={isDark} />
      <div
        className="pb-5 mb-2"
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

      {/* Connection indicator: Leadership → Backoffice */}
      <div className="flex justify-center gap-24 my-2">
        <div className="w-px h-6" style={{ background: `linear-gradient(to bottom, rgba(212,168,83,0.3), rgba(212,168,83,0.05))` }} />
        <div className="w-px h-6" style={{ background: `linear-gradient(to bottom, rgba(245,158,11,0.25), rgba(245,158,11,0.05))` }} />
      </div>

      {/* ═══ BACKOFFICE TIER ═══ */}
      <TierLabel label={TIER_META.backoffice.label} color={TIER_META.backoffice.color} isDark={isDark} />
      <div
        className="pb-5 mb-2"
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

      {/* Collaboration zone indicator */}
      <div
        className="mx-4 sm:mx-10 my-3 px-4 py-1.5 rounded-xl text-center"
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
      <TierLabel label={TIER_META.field.label} color={TIER_META.field.color} isDark={isDark} />
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

// ── Sub-components ──────────────────────────────────────────────────────

function TierLabel({ label, color, isDark }: { label: string; color: string; isDark: boolean }) {
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
```

- [ ] **Step 2: Verify the page renders correctly**

Run: `npm run dev`
Navigate to `/org`. Verify:
- Page header with legend badges
- Three tiers with labeled sections
- All 10 member cards visible
- Clicking a card opens the lateral modal
- Pressing Escape or clicking backdrop closes modal
- Collaboration zone label visible between backoffice and field

- [ ] **Step 3: Verify /team page is untouched**

Navigate to `/team`. Confirm it works exactly as before — no visual or functional changes.

- [ ] **Step 4: Commit**

```bash
git add src/components/pages/OrgView.tsx
git commit -m "feat: implement full OrgView with hierarchy, cards, and modal"
```

---

## Chunk 4: Polish — Animated Connection Lines

### Task 5: Add SVG animated connection lines between tiers

**Files:**
- Modify: `src/components/pages/OrgView.tsx`

Add a CSS-animated SVG overlay that renders connection lines between the tier sections. Uses a fixed decorative SVG (not position-calculated) placed between tiers for visual impact.

- [ ] **Step 1: Add animated SVG connectors between Leadership and Backoffice**

In `OrgView.tsx`, add a `ConnectionLines` component and render it between the leadership and backoffice sections. This is a decorative SVG showing the command/oversight flow:

```tsx
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
        <circle r="2" fill="#f59e0b" opacity="0.5">
          <animateMotion dur="3s" repeatCount="indefinite" path="M400,0 L500,60" />
        </circle>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Add collaboration lines between Backoffice and Field**

Add a second SVG component `CollabLines` for the bidirectional teal connections:

```tsx
function CollabLines({ isDark }: { isDark: boolean }) {
  return (
    <div className="hidden lg:flex justify-center my-1 overflow-hidden">
      <svg viewBox="0 0 600 50" width="600" height="50" className="max-w-full">
        {/* 3 backoffice × 4 agents = 12 lines, but show representative subset */}
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

        {/* Bidirectional teal particles */}
        <circle r="2" fill="#2dd4bf" opacity="0.5">
          <animateMotion dur="4s" repeatCount="indefinite" path="M100,0 L80,50" />
        </circle>
        <circle r="2" fill="#2dd4bf" opacity="0.4">
          <animateMotion dur="4.5s" repeatCount="indefinite" path="M250,50 L100,0" begin="1s" />
        </circle>
        <circle r="2" fill="#2dd4bf" opacity="0.5">
          <animateMotion dur="4s" repeatCount="indefinite" path="M250,0 L400,50" begin="2s" />
        </circle>
        <circle r="2" fill="#2dd4bf" opacity="0.4">
          <animateMotion dur="4.2s" repeatCount="indefinite" path="M520,50 L400,0" begin="1.5s" />
        </circle>
        <circle r="2" fill="#2dd4bf" opacity="0.5">
          <animateMotion dur="3.8s" repeatCount="indefinite" path="M400,0 L520,50" begin="3s" />
        </circle>
      </svg>
    </div>
  );
}
```

- [ ] **Step 3: Wire the SVG components into OrgView's render**

In OrgView's return JSX, replace the two static `<div className="flex justify-center gap-24 my-2">` connector divs with:

1. Replace the Leadership→Backoffice vertical lines div with `<ConnectionLines isDark={isDark} />`
2. Insert `<CollabLines isDark={isDark} />` just above the collaboration zone indicator div

- [ ] **Step 4: Verify animations**

Run: `npm run dev` → `/org`
Verify:
- Gold particles flow from leadership to backoffice positions
- Amber particle flows from Marketing Mgr column to Community Mgr column
- Teal particles flow both directions between backoffice and field
- Lines hidden on screens < 1024px (lg breakpoint)
- No layout shifts, animations smooth

- [ ] **Step 5: Run build check**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/pages/OrgView.tsx
git commit -m "feat: add animated SVG connection lines to org chart"
```

---

## Final Verification

- [ ] `/org` shows full org chart with 3 tiers, animated connections, click-to-expand modal
- [ ] `/team` is completely unchanged
- [ ] Sidebar shows "Organization" after "Team"
- [ ] Modal opens/closes correctly (click, Escape, backdrop)
- [ ] All 7 modal sections render with real data
- [ ] `npm run build` succeeds
