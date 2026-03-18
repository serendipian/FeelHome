# Leads Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a visual leads pipeline page showing the full acquisition funnel from sources through channels to team qualification and deal signing.

**Architecture:** New `LeadsContext` with Supabase persistence following `ToolsAccessContext` pattern. Single `LeadsView` component rendering a flat canvas of cards with dynamic SVG connection lines. Route at `/leads`, sidebar entry after Team.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS 4, Supabase

**Spec:** `docs/superpowers/specs/2026-03-17-leads-pipeline-design.md`

---

### Task 1: Types

**Files:**
- Create: `src/types/leads.ts`

- [ ] **Step 1: Create type definitions**

```typescript
export type SourceCategory =
  | 'seo'
  | 'medias'
  | 'fbGroups'
  | 'socialMedia'
  | 'ads'
  | 'websites'
  | 'partners';

export type ImageType = 'laptop' | 'logo' | 'icon';

export interface LeadSource {
  id: string;
  category: SourceCategory;
  label: string;
  sublabel?: string;
  imageUrl?: string;
  imageType: ImageType;
  leadsPerMonth: number;
}

export interface LeadChannel {
  id: string;
  label: string;
  icon: string;
  leadsPerMonth: number;
}

export interface PipelineTeamMember {
  id: string;
  label: string;
  initials: string;
  role: string;
  received: number;
  qualified: number;
}

export interface DealSigner {
  id: string;
  label: string;
  dealsSigned: number;
}

export interface PipelineConnections {
  sourcesToWebsites: SourceCategory[];
  websitesToChannels: string[];
  partnersToChannels: string[];
  adsToChannels: string[];
  channelsToDirector: string[];
  channelsToDigital: string[];
}

export interface LeadsPipelineData {
  sources: LeadSource[];
  channels: LeadChannel[];
  team: PipelineTeamMember[];
  dealSigners: DealSigner[];
  connections: PipelineConnections;
}
```

- [ ] **Step 2: Verify no TypeScript errors**

Run: `npx tsc --noEmit src/types/leads.ts 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/types/leads.ts
git commit -m "feat(leads): add type definitions for leads pipeline"
```

---

### Task 2: Default Data

**Files:**
- Create: `src/data/leads.ts`

- [ ] **Step 1: Create default data file**

```typescript
import type {
  LeadSource,
  LeadChannel,
  PipelineTeamMember,
  DealSigner,
  PipelineConnections,
  LeadsPipelineData,
} from '@/types/leads';

export const DEFAULT_SOURCES: LeadSource[] = [
  // SEO
  { id: 'seo-fr', category: 'seo', label: 'SEO Français', sublabel: '🇫🇷 FR', imageType: 'icon', leadsPerMonth: 0 },
  { id: 'seo-en', category: 'seo', label: 'SEO Anglais', sublabel: '🇬🇧 EN', imageType: 'icon', leadsPerMonth: 0 },
  // Médias
  { id: 'media-expats', category: 'medias', label: 'Expats.ma', imageType: 'logo', leadsPerMonth: 0 },
  { id: 'media-guide', category: 'medias', label: 'Guideimmobilier.ma', imageType: 'logo', leadsPerMonth: 0 },
  // Facebook Groups
  { id: 'fb-expats-morocco', category: 'fbGroups', label: 'Expats Morocco', sublabel: '45K', imageType: 'icon', leadsPerMonth: 0 },
  { id: 'fb-francais-maroc', category: 'fbGroups', label: 'Français du Maroc', sublabel: '38K', imageType: 'icon', leadsPerMonth: 0 },
  { id: 'fb-reseau-expatries', category: 'fbGroups', label: 'Réseau des Expatriés au Maroc', sublabel: '22K', imageType: 'icon', leadsPerMonth: 0 },
  { id: 'fb-francais-marrakech', category: 'fbGroups', label: 'Français de Marrakech', sublabel: '15K', imageType: 'icon', leadsPerMonth: 0 },
  { id: 'fb-expats-maroc', category: 'fbGroups', label: 'Expats Maroc', sublabel: '30K', imageType: 'icon', leadsPerMonth: 0 },
  { id: 'fb-bouskouristes', category: 'fbGroups', label: 'Les Bouskouristes', sublabel: '8K', imageType: 'icon', leadsPerMonth: 0 },
  // Social Media Pages
  { id: 'sm-facebook', category: 'socialMedia', label: 'Facebook', imageType: 'logo', leadsPerMonth: 0 },
  { id: 'sm-instagram', category: 'socialMedia', label: 'Instagram', imageType: 'logo', leadsPerMonth: 0 },
  { id: 'sm-youtube', category: 'socialMedia', label: 'Youtube', imageType: 'logo', leadsPerMonth: 0 },
  { id: 'sm-linkedin', category: 'socialMedia', label: 'Linkedin', imageType: 'logo', leadsPerMonth: 0 },
  // Publicité
  { id: 'ads-facebook', category: 'ads', label: 'Facebook Ads', imageType: 'logo', leadsPerMonth: 0 },
  { id: 'ads-google', category: 'ads', label: 'Google Ads', imageType: 'logo', leadsPerMonth: 0 },
  // Websites
  { id: 'web-fh', category: 'websites', label: 'Feel Home', sublabel: 'FR + EN', imageType: 'laptop', leadsPerMonth: 0 },
  { id: 'web-mi', category: 'websites', label: 'M Invest', sublabel: 'FR + EN', imageType: 'laptop', leadsPerMonth: 0 },
  // Partenaires
  { id: 'partner-agencies', category: 'partners', label: 'Agences/Agents', imageType: 'icon', leadsPerMonth: 0 },
  { id: 'partner-companies', category: 'partners', label: 'Sociétés', imageType: 'icon', leadsPerMonth: 0 },
  { id: 'partner-embassies', category: 'partners', label: 'Ambassades/Consulats', imageType: 'icon', leadsPerMonth: 0 },
];

export const DEFAULT_CHANNELS: LeadChannel[] = [
  { id: 'email', label: 'Email', icon: '📧', leadsPerMonth: 0 },
  { id: 'webform', label: 'Website Form', icon: '📋', leadsPerMonth: 0 },
  { id: 'adsform', label: 'Ads Lead Form', icon: '📝', leadsPerMonth: 0 },
  { id: 'wamsg', label: 'WhatsApp Message', icon: '💬', leadsPerMonth: 0 },
  { id: 'igmsg', label: 'Instagram Message', icon: '📱', leadsPerMonth: 0 },
  { id: 'fbmsg', label: 'Facebook Message', icon: '💬', leadsPerMonth: 0 },
  { id: 'wacall', label: 'WhatsApp Call', icon: '📞', leadsPerMonth: 0 },
  { id: 'directcall', label: 'Direct Call', icon: '📞', leadsPerMonth: 0 },
];

export const DEFAULT_TEAM: PipelineTeamMember[] = [
  { id: 'director', label: 'Director', initials: 'YB', role: 'Calls only', received: 0, qualified: 0 },
  { id: 'digital', label: 'Digital Coordinator', initials: 'DC', role: 'Digital channels', received: 0, qualified: 0 },
  { id: 'agents', label: 'Agents', initials: 'AG', role: 'Field agents', received: 0, qualified: 0 },
  { id: 'hunter', label: 'Property Hunter', initials: 'PH', role: 'Property search', received: 0, qualified: 0 },
];

export const DEFAULT_DEAL_SIGNERS: DealSigner[] = [
  { id: 'signer_director', label: 'Director', dealsSigned: 0 },
  { id: 'signer_agents', label: 'Agents', dealsSigned: 0 },
];

export const DEFAULT_CONNECTIONS: PipelineConnections = {
  sourcesToWebsites: ['seo', 'medias', 'fbGroups', 'socialMedia', 'ads'],
  websitesToChannels: ['webform', 'wamsg', 'wacall', 'directcall'],
  partnersToChannels: ['directcall', 'email'],
  adsToChannels: ['email', 'webform', 'adsform', 'wamsg', 'igmsg', 'fbmsg', 'wacall', 'directcall'],
  channelsToDirector: ['directcall', 'wacall'],
  channelsToDigital: ['webform', 'adsform', 'wamsg', 'email', 'igmsg', 'fbmsg'],
};

export const DEFAULT_LEADS_DATA: LeadsPipelineData = {
  sources: DEFAULT_SOURCES,
  channels: DEFAULT_CHANNELS,
  team: DEFAULT_TEAM,
  dealSigners: DEFAULT_DEAL_SIGNERS,
  connections: DEFAULT_CONNECTIONS,
};
```

- [ ] **Step 2: Commit**

```bash
git add src/data/leads.ts
git commit -m "feat(leads): add default data for leads pipeline"
```

---

### Task 3: Context Provider

**Files:**
- Create: `src/context/LeadsContext.tsx`

Reference: `src/context/ToolsAccessContext.tsx` — follow the same pattern exactly (debouncedSave, loadFromSupabase, hydration with merge, readyToSave ref).

- [ ] **Step 1: Create LeadsContext**

```typescript
'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { loadFromSupabase, saveToSupabase } from '@/lib/supabase';
import type { LeadsPipelineData } from '@/types/leads';
import { DEFAULT_LEADS_DATA } from '@/data/leads';

const timers: Record<string, ReturnType<typeof setTimeout>> = {};
function debouncedSave(key: string, value: unknown) {
  clearTimeout(timers[key]);
  timers[key] = setTimeout(() => { saveToSupabase(key, value); }, 500);
}

interface LeadsContextValue {
  data: LeadsPipelineData;
  updateSourceLeads: (id: string, value: number) => void;
  updateSourceImage: (id: string, imageUrl: string) => void;
  updateChannelLeads: (id: string, value: number) => void;
  updateTeamMember: (id: string, field: 'received' | 'qualified', value: number) => void;
  updateDealSigner: (id: string, value: number) => void;
}

const LeadsContext = createContext<LeadsContextValue | null>(null);

export function useLeads(): LeadsContextValue {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error('useLeads must be used within LeadsProvider');
  return ctx;
}

export function LeadsProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<LeadsPipelineData>(DEFAULT_LEADS_DATA);
  const readyToSave = useRef(false);
  const didHydrate = useRef(false);

  useEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;
    (async () => {
      const loaded = await loadFromSupabase<LeadsPipelineData>('leadsPipeline', DEFAULT_LEADS_DATA);
      // Merge: preserve saved values, add new defaults
      const loadedSourceIds = new Set(loaded.sources.map(s => s.id));
      const newSources = DEFAULT_LEADS_DATA.sources.filter(d => !loadedSourceIds.has(d.id));
      const loadedChannelIds = new Set(loaded.channels.map(c => c.id));
      const newChannels = DEFAULT_LEADS_DATA.channels.filter(d => !loadedChannelIds.has(d.id));
      const loadedTeamIds = new Set(loaded.team.map(t => t.id));
      const newTeam = DEFAULT_LEADS_DATA.team.filter(d => !loadedTeamIds.has(d.id));
      const loadedSignerIds = new Set(loaded.dealSigners.map(s => s.id));
      const newSigners = DEFAULT_LEADS_DATA.dealSigners.filter(d => !loadedSignerIds.has(d.id));
      setData({
        sources: [...loaded.sources, ...newSources],
        channels: [...loaded.channels, ...newChannels],
        team: [...loaded.team, ...newTeam],
        dealSigners: [...loaded.dealSigners, ...newSigners],
        connections: loaded.connections ?? DEFAULT_LEADS_DATA.connections,
      });
      setTimeout(() => { readyToSave.current = true; }, 0);
    })();
  }, []);

  useEffect(() => {
    if (readyToSave.current) debouncedSave('leadsPipeline', data);
  }, [data]);

  const updateSourceLeads = useCallback((id: string, value: number) => {
    setData(prev => ({
      ...prev,
      sources: prev.sources.map(s => s.id === id ? { ...s, leadsPerMonth: value } : s),
    }));
  }, []);

  const updateSourceImage = useCallback((id: string, imageUrl: string) => {
    setData(prev => ({
      ...prev,
      sources: prev.sources.map(s => s.id === id ? { ...s, imageUrl } : s),
    }));
  }, []);

  const updateChannelLeads = useCallback((id: string, value: number) => {
    setData(prev => ({
      ...prev,
      channels: prev.channels.map(c => c.id === id ? { ...c, leadsPerMonth: value } : c),
    }));
  }, []);

  const updateTeamMember = useCallback((id: string, field: 'received' | 'qualified', value: number) => {
    setData(prev => ({
      ...prev,
      team: prev.team.map(t => t.id === id ? { ...t, [field]: value } : t),
    }));
  }, []);

  const updateDealSigner = useCallback((id: string, value: number) => {
    setData(prev => ({
      ...prev,
      dealSigners: prev.dealSigners.map(s => s.id === id ? { ...s, dealsSigned: value } : s),
    }));
  }, []);

  return (
    <LeadsContext.Provider value={{ data, updateSourceLeads, updateSourceImage, updateChannelLeads, updateTeamMember, updateDealSigner }}>
      {children}
    </LeadsContext.Provider>
  );
}
```

- [ ] **Step 2: Wire provider into ClientLayout**

In `src/app/ClientLayout.tsx`, add import and wrap inside `ToolsAccessProvider`:

Add import at top:
```typescript
import { LeadsProvider } from '@/context/LeadsContext';
```

Change provider stack in the `ClientLayout` return — add `<LeadsProvider>` between `<ToolsAccessProvider>` and `<ViewModeProvider>`:
```tsx
<ThemeProvider>
<CurrencyProvider>
<FinancialProvider>
<TeamProvider>
<ToolsAccessProvider>
<LeadsProvider>        {/* ← ADD */}
<ViewModeProvider>
<MobileNavProvider>
  <LayoutShell>{children}</LayoutShell>
</MobileNavProvider>
</ViewModeProvider>
</LeadsProvider>         {/* ← ADD */}
</ToolsAccessProvider>
</TeamProvider>
</FinancialProvider>
</CurrencyProvider>
</ThemeProvider>
```

- [ ] **Step 3: Verify build**

Run: `npm run build 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/context/LeadsContext.tsx src/app/ClientLayout.tsx
git commit -m "feat(leads): add LeadsContext provider with Supabase persistence"
```

---

### Task 4: Route & Sidebar

**Files:**
- Create: `src/app/leads/page.tsx`
- Modify: `src/components/layout/Sidebar.tsx:8-16` (navItems array)
- Modify: `src/components/layout/Sidebar.tsx` (add LeadsIcon function)

- [ ] **Step 1: Create route page**

```typescript
'use client';

import LeadsView from '@/components/pages/LeadsView';

export default function LeadsPage() {
  return <LeadsView />;
}
```

- [ ] **Step 2: Create placeholder LeadsView**

Create `src/components/pages/LeadsView.tsx` with a minimal placeholder so the route works:

```typescript
'use client';

export default function LeadsView() {
  return (
    <div>
      <h1 className="text-lg font-semibold">Leads Pipeline</h1>
      <p className="text-sm opacity-50">Coming soon</p>
    </div>
  );
}
```

- [ ] **Step 3: Add LeadsIcon and nav item to Sidebar**

In `src/components/layout/Sidebar.tsx`:

Add to the `navItems` array (after the Team entry at line 13, before Workflow):
```typescript
{ href: '/leads', label: 'Leads Pipeline', icon: LeadsIcon },
```

Add the `LeadsIcon` function after `ToolsIcon` (after line 190):
```typescript
function LeadsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m-7.071-2.929l.707-.707m12.728 0l.707.707M3 12h1m16 0h1M5.636 5.636l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 3L8 21M16 3l-2 18" />
    </svg>
  );
}
```

Note: This is a simple funnel-like icon. Can be refined later.

- [ ] **Step 4: Verify navigation works**

Run: `npm run dev` and navigate to `http://localhost:3000/leads`
Expected: See "Leads Pipeline — Coming soon" placeholder. Sidebar shows "Leads Pipeline" entry.

- [ ] **Step 5: Commit**

```bash
git add src/app/leads/page.tsx src/components/pages/LeadsView.tsx src/components/layout/Sidebar.tsx
git commit -m "feat(leads): add route, placeholder view, and sidebar nav entry"
```

---

### Task 5: LeadsView — Source Cards (Rows 1 & 2)

**Files:**
- Modify: `src/components/pages/LeadsView.tsx` (replace placeholder with full implementation)

This is the largest task. Build the canvas layout with source cards grouped by category with tree/network structure.

- [ ] **Step 1: Implement LeadsView with source cards**

Replace the placeholder `LeadsView.tsx` with the full implementation. Key sections:

**Internal components to build:**

1. `LeadsEditableCell` — local inline-edit component with monochrome styling:

```tsx
function LeadsEditableCell({ value, onSave, isDark, size = 'sm' }: {
  value: number;
  onSave: (v: number) => void;
  isDark: boolean;
  size?: 'sm' | 'lg';
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(String(value)); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  const commit = () => {
    setEditing(false);
    const n = parseInt(draft, 10);
    if (!isNaN(n) && n !== value) onSave(n);
    else setDraft(String(value));
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="bg-transparent text-center outline-none"
        style={{
          width: size === 'lg' ? '60px' : '40px',
          fontSize: size === 'lg' ? '20px' : '13px',
          fontWeight: 600,
          color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
        }}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(String(value)); setEditing(false); } }}
      />
    );
  }

  return (
    <span
      className="cursor-pointer rounded px-1 transition-colors"
      style={{
        fontSize: size === 'lg' ? '20px' : '13px',
        fontWeight: 600,
        color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)',
      }}
      onMouseEnter={(e) => { (e.target as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'; }}
      onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'transparent'; }}
      onClick={() => setEditing(true)}
    >
      {value}
    </span>
  );
}
```

2. `SourceCard` — renders one source card with visual area (laptop/logo/icon variants) and info area with editable `leadsPerMonth`. Props: `source: LeadSource`, `onUpdate: (value: number) => void`, `isDark: boolean`. **Important:** Each card's root div must have `data-node={source.id}` (e.g., `data-node="web-fh"`, `data-node="web-mi"`) so that `PipelineLines` can target individual website cards for SVG connections.
   - `laptop` variant: CSS laptop frame with optional `<img>` for `imageUrl`, otherwise text placeholder showing label
   - `logo` variant: `<img>` if `imageUrl`, otherwise first letter as monochrome text
   - `icon` variant: emoji or monochrome icon placeholder

3. `SourceCategoryGroup` — renders category header + tree line + branch grid of `SourceCard`s. Props: `categoryLabel: string`, `sources: LeadSource[]`, `gridClass?: string`, `dataNode: string`. Grid class determines layout:
   - `fbGroups`: `grid grid-cols-3` (3x2)
   - `socialMedia`: `grid grid-cols-2` (2x2)
   - others: `flex`

**Layout structure:**

```tsx
<div className="relative" ref={canvasRef}>
  {/* Row 1: Médias | FB Groups | Social Media | Publicité */}
  <div className="flex flex-wrap gap-5 justify-center items-start mb-9">
    <SourceCategoryGroup label="Médias" sources={mediaSources} dataNode="cat-medias" />
    <SourceCategoryGroup label="Facebook Groups" sources={fbSources} gridClass="grid-2x3" dataNode="cat-fbgroups" />
    <SourceCategoryGroup label="Social Media" sources={smSources} gridClass="grid-2x2" dataNode="cat-social" />
    <SourceCategoryGroup label="Publicité" sources={adsSources} dataNode="cat-ads" />
  </div>

  {/* Row 2: SEO | Websites | Partenaires */}
  <div className="flex flex-wrap gap-5 justify-center items-start mb-9">
    <SourceCategoryGroup label="SEO" sources={seoSources} dataNode="cat-seo" />
    <SourceCategoryGroup label="Sites Web" sources={webSources} dataNode="cat-websites" />
    <SourceCategoryGroup label="Partenaires" sources={partnerSources} dataNode="cat-partners" />
  </div>
</div>
```

**Styling (Notion-like monochrome, matching v6 mockup):**
- Background: transparent (inherits from app theme)
- Cards: `bg-white/[0.03]` with `border border-white/[0.07]` and `hover:border-white/[0.15]`
- Category headers: uppercase text-[10px] font-semibold text-white/50
- Tree lines: `w-px h-2.5 bg-white/[0.08]`
- Source card visual area: `h-[50px]` with `bg-white/[0.02]`
- Numbers: `text-[13px] font-semibold text-white/85`
- Labels: `text-[9px] font-medium text-white/70`

**Note on `isDark`:** The project's `ThemeContext` currently hardcodes `isDark: false` and `theme: 'light'`, but the actual UI uses a dark background (`#06070a`). All components in this plan accept an `isDark` prop for future-proofing, but **hardcode it to `true`** in the LeadsView main component rather than reading from `useTheme()`:

```tsx
const isDark = true; // App is dark-themed; ThemeContext.isDark is unreliable
```

- [ ] **Step 2: Filter sources by category from context**

```typescript
const { data, updateSourceLeads } = useLeads();
const { isDark } = useTheme();

const sourcesByCategory = useMemo(() => {
  const map = new Map<string, LeadSource[]>();
  for (const s of data.sources) {
    if (!map.has(s.category)) map.set(s.category, []);
    map.get(s.category)!.push(s);
  }
  return map;
}, [data.sources]);
```

- [ ] **Step 3: Verify source cards render**

Run: `npm run dev` and navigate to `/leads`
Expected: See all source cards grouped by category in 2 rows. Numbers show "0" and are clickable to edit.

- [ ] **Step 4: Commit**

```bash
git add src/components/pages/LeadsView.tsx
git commit -m "feat(leads): implement source cards with category grouping"
```

---

### Task 6: LeadsView — Channel & Team Cards (Rows 3-6)

**Files:**
- Modify: `src/components/pages/LeadsView.tsx`

- [ ] **Step 1: Add ChannelCard component**

```tsx
function ChannelCard({ channel, onUpdate, isDark }: {
  channel: LeadChannel;
  onUpdate: (value: number) => void;
  isDark: boolean;
}) {
  return (
    <div
      className="rounded-lg p-2.5 text-center w-[95px] transition-colors"
      style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
      }}
      data-node={`ch-${channel.id}`}
    >
      <div className="text-base mb-0.5 opacity-80">{channel.icon}</div>
      <div className="font-medium text-[9px]" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}>
        {channel.label}
      </div>
      <div className="mt-1">
        <LeadsEditableCell value={channel.leadsPerMonth} onSave={onUpdate} isDark={isDark} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add TeamCard component**

```tsx
function TeamCard({ member, onUpdate, isDark }: {
  member: PipelineTeamMember;
  onUpdate: (field: 'received' | 'qualified', value: number) => void;
  isDark: boolean;
}) {
  const rate = member.received > 0
    ? `${Math.round((member.qualified / member.received) * 100)}%`
    : '—';
  return (
    <div
      className="rounded-lg overflow-hidden w-[185px] transition-colors"
      style={{
        background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
      }}
      data-node={`tm-${member.id}`}
    >
      <div className="h-[44px] flex items-center gap-2.5 px-3"
        style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
        <div className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-semibold shrink-0"
          style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)' }}>
          {member.initials}
        </div>
        <div>
          <div className="font-semibold text-[11px]" style={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)' }}>{member.label}</div>
          <div className="text-[7px]" style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)' }}>{member.role}</div>
        </div>
      </div>
      <div className="px-3 py-1.5 flex justify-between">
        <div>
          <LeadsEditableCell value={member.received} onSave={(v) => onUpdate('received', v)} isDark={isDark} />
          <div className="text-[7px] uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>received</div>
        </div>
        <div>
          <LeadsEditableCell value={member.qualified} onSave={(v) => onUpdate('qualified', v)} isDark={isDark} />
          <div className="text-[7px] uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>qualified</div>
        </div>
        <div>
          <div className="text-[13px] font-semibold" style={{ color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)' }}>{rate}</div>
          <div className="text-[7px] uppercase tracking-wider" style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}>rate</div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add DealSummary component**

```tsx
function DealSummary({ signers, channels, onUpdate, isDark }: {
  signers: DealSigner[];
  channels: LeadChannel[];
  onUpdate: (id: string, value: number) => void;
  isDark: boolean;
}) {
  const totalDeals = signers.reduce((sum, s) => sum + s.dealsSigned, 0);
  const totalLeads = channels.reduce((sum, c) => sum + c.leadsPerMonth, 0);
  const conversion = totalLeads > 0 ? `${((totalDeals / totalLeads) * 100).toFixed(1)}%` : '—';
  const borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const labelColor = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
  const numColor = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)';
  const sepColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  return (
    <div className="rounded-lg px-6 py-3.5 inline-flex gap-5 items-center"
      style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: `1px solid ${borderColor}` }}
      data-node="deals">
      {signers.map((s, i) => (
        <React.Fragment key={s.id}>
          <div>
            <div className="text-[8px] uppercase tracking-wider" style={{ color: labelColor }}>{s.label}</div>
            <LeadsEditableCell value={s.dealsSigned} onSave={(v) => onUpdate(s.id, v)} isDark={isDark} size="lg" />
          </div>
          {i < signers.length - 1 && <div className="w-px h-6" style={{ background: sepColor }} />}
        </React.Fragment>
      ))}
      <div className="w-px h-6" style={{ background: sepColor }} />
      <div>
        <div className="text-[8px] uppercase tracking-wider" style={{ color: labelColor }}>Total Clients</div>
        <div className="text-xl font-semibold" style={{ color: numColor }}>{totalDeals}</div>
      </div>
      <div className="w-px h-6" style={{ background: sepColor }} />
      <div>
        <div className="text-[8px] uppercase tracking-wider" style={{ color: labelColor }}>Conversion</div>
        <div className="text-xl font-semibold" style={{ color: numColor }}>{conversion}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Add rows 3-6 to the canvas layout**

After Row 2, add:
```tsx
{/* Row 3: Channels */}
<div className="flex flex-wrap gap-2 justify-center items-start mb-9">
  {data.channels.map(ch => (
    <ChannelCard key={ch.id} channel={ch} onUpdate={(v) => updateChannelLeads(ch.id, v)} isDark={isDark} />
  ))}
</div>

{/* Row 4: Director + Digital Coordinator */}
<div className="flex flex-wrap gap-3 justify-center items-start mb-9">
  {data.team.filter(t => t.id === 'director' || t.id === 'digital').map(tm => (
    <TeamCard key={tm.id} member={tm} onUpdate={(f, v) => updateTeamMember(tm.id, f, v)} isDark={isDark} />
  ))}
</div>

{/* Row 5: Agents + Property Hunter */}
<div className="flex flex-wrap gap-3 justify-center items-start mb-9">
  {data.team.filter(t => t.id === 'agents' || t.id === 'hunter').map(tm => (
    <TeamCard key={tm.id} member={tm} onUpdate={(f, v) => updateTeamMember(tm.id, f, v)} isDark={isDark} />
  ))}
</div>

{/* Row 6: Deal Summary */}
<div className="flex justify-center mb-4">
  <DealSummary signers={data.dealSigners} channels={data.channels} onUpdate={updateDealSigner} isDark={isDark} />
</div>
```

- [ ] **Step 5: Verify all 6 rows render**

Run: `npm run dev` and navigate to `/leads`
Expected: All 6 rows visible with cards. All numbers editable. Monochrome styling.

- [ ] **Step 6: Commit**

```bash
git add src/components/pages/LeadsView.tsx
git commit -m "feat(leads): add channel, team, and deal cards (rows 3-6)"
```

---

### Task 7: SVG Connection Lines

**Files:**
- Modify: `src/components/pages/LeadsView.tsx`

- [ ] **Step 1: Add PipelineLines component**

This component renders an SVG overlay with connection lines computed from DOM positions.

```tsx
function PipelineLines({ canvasRef, connections, isDark }: {
  canvasRef: React.RefObject<HTMLDivElement>;
  connections: PipelineConnections;
  isDark: boolean;
}) {
  const [lines, setLines] = useState<{ x1: number; y1: number; x2: number; y2: number; opacity: number }[]>([]);

  const computeLines = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cr = canvas.getBoundingClientRect();
    const newLines: typeof lines = [];

    const getBottom = (el: Element) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 - cr.left, y: r.bottom - cr.top };
    };
    const getTop = (el: Element) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 - cr.left, y: r.top - cr.top };
    };
    const addLine = (from: { x: number; y: number }, to: { x: number; y: number }, opacity = 0.08) => {
      newLines.push({ x1: from.x, y1: from.y, x2: to.x, y2: to.y, opacity });
    };
    const node = (id: string) => canvas.querySelector(`[data-node="${id}"]`);

    // Sources → both websites
    const webFH = node('web-fh');
    const webMI = node('web-mi');
    for (const cat of connections.sourcesToWebsites) {
      const el = node(`cat-${cat}`);
      if (!el) continue;
      const from = getBottom(el);
      if (webFH) addLine(from, getTop(webFH), 0.07);
      if (webMI) addLine(from, getTop(webMI), 0.07);
    }

    // Websites → channels
    for (const web of [webFH, webMI]) {
      if (!web) continue;
      for (const chId of connections.websitesToChannels) {
        const ch = node(`ch-${chId}`);
        if (ch) addLine(getBottom(web), getTop(ch), 0.1);
      }
    }

    // Partners → channels
    const partners = node('cat-partners');
    if (partners) {
      for (const chId of connections.partnersToChannels) {
        const ch = node(`ch-${chId}`);
        if (ch) addLine(getBottom(partners), getTop(ch), 0.12);
      }
    }

    // Ads → channels
    const ads = node('cat-ads');
    if (ads) {
      for (const chId of connections.adsToChannels) {
        const ch = node(`ch-${chId}`);
        if (ch) addLine(getBottom(ads), getTop(ch), chId === 'adsform' ? 0.15 : 0.05);
      }
    }

    // Channels → Director
    const dir = node('tm-director');
    if (dir) {
      for (const chId of connections.channelsToDirector) {
        const ch = node(`ch-${chId}`);
        if (ch) addLine(getBottom(ch), getTop(dir), 0.12);
      }
    }

    // Channels → Digital
    const dig = node('tm-digital');
    if (dig) {
      for (const chId of connections.channelsToDigital) {
        const ch = node(`ch-${chId}`);
        if (ch) addLine(getBottom(ch), getTop(dig), 0.12);
      }
    }

    // Director/Digital → Agents/Hunter
    for (const tmId of ['tm-director', 'tm-digital']) {
      const tm = node(tmId);
      if (!tm) continue;
      for (const targetId of ['tm-agents', 'tm-hunter']) {
        const target = node(targetId);
        if (target) addLine(getBottom(tm), getTop(target), 0.1);
      }
    }

    // Agents/Hunter → Deals
    const deals = node('deals');
    if (deals) {
      for (const targetId of ['tm-agents', 'tm-hunter']) {
        const target = node(targetId);
        if (target) addLine(getBottom(target), getTop(deals), 0.1);
      }
    }

    setLines(newLines);
  }, [canvasRef, connections]);

  useEffect(() => {
    const timer = setTimeout(computeLines, 100);
    return () => clearTimeout(timer);
  }, [computeLines]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(computeLines);
    observer.observe(canvas);
    window.addEventListener('resize', computeLines);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', computeLines);
    };
  }, [canvasRef, computeLines]);

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
      {lines.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke={isDark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)'}
          strokeWidth={1} opacity={l.opacity} />
      ))}
    </svg>
  );
}
```

- [ ] **Step 2: Wire PipelineLines into LeadsView**

Add `canvasRef` to LeadsView:
```tsx
const canvasRef = useRef<HTMLDivElement>(null);
```

Wrap all rows in the canvas div:
```tsx
<div className="relative" ref={canvasRef}>
  <PipelineLines canvasRef={canvasRef} connections={data.connections} isDark={isDark} />
  {/* ... all rows ... */}
</div>
```

Ensure all card elements have correct `data-node` attributes as defined in the spec.

- [ ] **Step 3: Verify connection lines render**

Run: `npm run dev` and navigate to `/leads`
Expected: Subtle white lines connecting cards between rows. Lines update on window resize.

- [ ] **Step 4: Commit**

```bash
git add src/components/pages/LeadsView.tsx
git commit -m "feat(leads): add SVG connection lines between pipeline stages"
```

---

### Task 8: Build Verification & Cleanup

**Files:**
- All created files

- [ ] **Step 1: Run production build**

Run: `npm run build 2>&1 | tail -10`
Expected: Build succeeds with no errors

- [ ] **Step 2: Run linter**

Run: `npm run lint 2>&1 | tail -10`
Expected: No errors (warnings OK)

- [ ] **Step 3: Manual verification checklist**

Run `npm run dev` and verify:
- [ ] `/leads` page loads with all 6 rows
- [ ] Source cards show correct category grouping (FB Groups 3x2, Social 2x2)
- [ ] Website cards show laptop mockup placeholder
- [ ] All numbers are click-to-edit
- [ ] Edits persist after page refresh (Supabase save)
- [ ] SVG lines connect correct cards
- [ ] Sidebar shows "Leads Pipeline" entry between Team and Workflow
- [ ] No brand colors visible — monochrome Notion-like styling

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(leads): complete leads pipeline module"
```
