# Leads Pipeline Module — Design Spec

## Overview

A new standalone page (`/leads`) displaying the full lead acquisition funnel as a flat visual canvas. Every source, channel, team member, and deal signer is rendered as an individual card with editable numbers. SVG connection lines show how leads flow between items. Data is persisted via a dedicated `LeadsContext` with Supabase persistence (same pattern as ToolsAccessContext — Supabase with 500ms debounce, no localStorage).

## Requirements

- Flat canvas layout with 6 rows of cards, no collapsible stages
- Every numeric value is click-to-edit (inline edit pattern — see EditableCell section below)
- Source cards show real screenshots/images when provided, CSS placeholders when not
- Dynamic SVG connection lines computed from DOM positions
- Dedicated Supabase persistence key, independent from financial data
- Single view — no year toggle, no scenario support
- Sidebar navigation entry: "Leads Pipeline" after "Team"

## Data Model

### Types — `src/types/leads.ts`

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
  imageUrl?: string;       // null/undefined = show CSS placeholder
  imageType: ImageType;
  leadsPerMonth: number;
}

export interface LeadChannel {
  id: string;
  label: string;
  icon: string;            // emoji string
  leadsPerMonth: number;
}

export interface PipelineTeamMember {
  id: string;
  label: string;
  initials: string;
  role: string;            // subtitle shown on card
  received: number;
  qualified: number;
}

export interface DealSigner {
  id: string;
  label: string;
  dealsSigned: number;
}

export interface LeadsPipelineData {
  sources: LeadSource[];
  channels: LeadChannel[];
  team: PipelineTeamMember[];
  dealSigners: DealSigner[];
  connections: PipelineConnections;
}

export interface PipelineConnections {
  // Source category IDs that flow into websites
  sourcesToWebsites: SourceCategory[];
  // Channel IDs that websites connect to
  websitesToChannels: string[];
  // Channel IDs that partners connect to (bypassing website)
  partnersToChannels: string[];
  // Channel IDs that ads connect to (in addition to website flow)
  adsToChannels: string[];
  // Channel IDs routed to Director
  channelsToDirector: string[];
  // Channel IDs routed to Digital Coordinator
  channelsToDigital: string[];
}
```

### Default Data — `src/data/leads.ts`

#### Sources (by category)

| Category | Items |
|----------|-------|
| `seo` | SEO Français, SEO Anglais |
| `medias` | Expats.ma, Guideimmobilier.ma |
| `fbGroups` | Expats Morocco, Français du Maroc, Réseau des Expatriés au Maroc, Français de Marrakech, Expats Maroc, Les Bouskouristes |
| `socialMedia` | Facebook, Instagram, Youtube, Linkedin |
| `ads` | Facebook Ads, Google Ads |
| `websites` | Feel Home Website (imageType: laptop), M Invest Website (imageType: laptop) — `leadsPerMonth` represents direct/type-in traffic not captured by other source categories. Editable, not auto-computed. |
| `partners` | Agences/Agents, Sociétés, Ambassades/Consulats |

All `leadsPerMonth` start at `0`. User fills in their estimates.

#### Channels

| ID | Label | Icon |
|----|-------|------|
| `email` | Email | 📧 |
| `webform` | Website Form | 📋 |
| `adsform` | Ads Lead Form | 📝 |
| `wamsg` | WhatsApp Message | 💬 |
| `igmsg` | Instagram Message | 📱 |
| `fbmsg` | Facebook Message | 💬 |
| `wacall` | WhatsApp Call | 📞 |
| `directcall` | Direct Call | 📞 |

All `leadsPerMonth` start at `0`.

#### Team Pipeline

| ID | Label | Role |
|----|-------|------|
| `director` | Director | All channels (receives Direct Call + WhatsApp Call) |
| `digital` | Digital Coordinator | Digital channels (receives Website Form, Ads Form, WhatsApp Msg, Email) |
| `agents` | Agents | Field agents (dispatched by Director/Digital) |
| `hunter` | Property Hunter | Property search (dispatched by Director/Digital) |

All `received`, `qualified` start at `0`.

#### Deal Signers

| ID | Label |
|----|-------|
| `signer_director` | Director |
| `signer_agents` | Agents |

All `dealsSigned` start at `0`. IDs are prefixed with `signer_` to avoid DOM collision with team member cards.

#### Connection Mapping

```typescript
export const DEFAULT_CONNECTIONS: PipelineConnections = {
  // Partners are NOT included — they bypass websites (see partnersToChannels)
  sourcesToWebsites: ['seo', 'medias', 'fbGroups', 'socialMedia', 'ads'],
  // Channels that website visits convert into (igmsg/fbmsg excluded — those are direct social interactions, not website-driven)
  websitesToChannels: ['webform', 'wamsg', 'wacall', 'directcall'],
  // Partners bypass website entirely
  partnersToChannels: ['directcall', 'email'],
  // Ads drive traffic to all channels (stronger weight on adsform)
  adsToChannels: ['email', 'webform', 'adsform', 'wamsg', 'igmsg', 'fbmsg', 'wacall', 'directcall'],
  channelsToDirector: ['directcall', 'wacall'],
  // igmsg and fbmsg are routed to Digital Coordinator (community management)
  channelsToDigital: ['webform', 'adsform', 'wamsg', 'email', 'igmsg', 'fbmsg'],
};
```

## Context — `src/context/LeadsContext.tsx`

Follows `ToolsAccessContext` pattern:

```typescript
interface LeadsContextValue {
  data: LeadsPipelineData;
  updateSourceLeads: (id: string, value: number) => void;
  updateSourceImage: (id: string, imageUrl: string) => void;
  updateChannelLeads: (id: string, value: number) => void;
  updateTeamMember: (id: string, field: 'received' | 'qualified', value: number) => void;
  updateDealSigner: (id: string, value: number) => void;
}
```

### Persistence

- **Supabase key**: `'leadsPipeline'`
- **Hydration**: On mount, load from Supabase. Merge with defaults (add new items from defaults that don't exist in saved data, preserving saved values for existing items). Fallback to defaults.
- **Save**: Supabase 500ms debounce via `debouncedSave` (same pattern as ToolsAccessContext — no localStorage).

## View Component — `src/components/pages/LeadsView.tsx`

### Layout

Single scrollable canvas. No stage headers or phase labels. Six rows of cards:

```
Row 1: [Médias]  [Facebook Groups 3×2]  [Social Media 2×2]  [Publicité]
Row 2: [SEO]     [Websites — laptop mockups]                [Partenaires]
Row 3: [Email] [Website Form] [Ads Form] [WhatsApp Msg] [IG Msg] [FB Msg] [WA Call] [Direct Call]
Row 4: [Director]                        [Digital Coordinator]
Row 5: [Agents]                          [Property Hunter]
Row 6: [           Deal Signing Summary            ]
```

Each row is a flex container with `justify-content: center` and `gap: 20px`. Rows are separated by `36px` margin.

### Card Types

#### Source Cards (Row 1 & 2)

Grouped under category headers (small uppercase label → tree line → branch of cards).

Card structure:
- **Visual area** (top): Depends on `imageType`:
  - `laptop`: CSS laptop frame. If `imageUrl` exists, show `<img>` inside the screen. Otherwise show site name as text placeholder.
  - `logo`: If `imageUrl`, show image. Otherwise show first letter or text label as monochrome placeholder.
  - `icon`: Show emoji or monochrome icon placeholder.
- **Info area** (bottom): Label, sublabel, editable `leadsPerMonth`.

Facebook Groups: 3 columns × 2 rows grid.
Social Media: 2 columns × 2 rows grid.
All others: horizontal flex.

#### Channel Cards (Row 3)

Compact cards: emoji icon, label, editable `leadsPerMonth`.

#### Team Cards (Row 4 & 5)

Card structure:
- Header bar with initials avatar (rounded square, monochrome) + name + role subtitle
- Stats row: editable `received`, editable `qualified`, computed `rate` (qualified/received as %). When `received === 0`, display `"—"` instead of computing.

#### Deal Signing Summary (Row 6)

Horizontal card showing:
- Each signer: label + editable `dealsSigned`
- Computed total clients (sum of all signers)
- Computed conversion rate (total clients / sum of all channel leads)

### SVG Connection Lines

A single `<svg>` element positioned absolutely over the canvas (`position: absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:0`).

#### DOM Identification

All connectable elements use `data-node` attributes for SVG line targeting:
- Category groups: `data-node="cat-seo"`, `data-node="cat-medias"`, etc.
- Website cards: `data-node="web-fh"`, `data-node="web-mi"`
- Partner group: `data-node="cat-partners"`
- Ads group: `data-node="cat-ads"`
- Channel cards: `data-node="ch-email"`, `data-node="ch-webform"`, etc.
- Team cards: `data-node="tm-director"`, `data-node="tm-digital"`, `data-node="tm-agents"`, `data-node="tm-hunter"`
- Deal summary: `data-node="deals"`

The `PipelineLines` component uses a `ref` on the canvas wrapper div. It queries `data-node` attributes via `querySelector` to get element positions.

Lines are computed in a `useEffect` that:
1. Runs after initial render (100ms delay for layout)
2. Re-runs on window resize via `ResizeObserver` on the canvas `ref` element
3. Uses `getBoundingClientRect()` on `data-node` elements, relative to canvas ref
4. Draws lines from bottom-center of source to top-center of target

Line styles:
- Stroke: `rgba(255,255,255,1)` at low opacity (0.07–0.12)
- Stroke-width: 1px
- No arrows, no dashes — clean and minimal

Connection types (from `PipelineConnections`):
- Sources (by category group element) → both website cards
- Website cards → their connected channel cards
- Partners group → their connected channel cards
- Ads group → all channel cards (stronger opacity on adsform)
- Connected channels → Director
- Connected channels → Digital Coordinator
- Director + Digital → Agents + Property Hunter
- Agents + Property Hunter → Deal summary

### Styling

Matches the v6 mockup aesthetic — Notion-like, monochrome:
- Background: matches app theme (`isDark` from ThemeContext)
- Cards: `rgba(255,255,255,0.03)` background, `rgba(255,255,255,0.07)` border
- Hover: border brightens to `rgba(255,255,255,0.15)`
- Text: `rgba(255,255,255,0.85)` for numbers, `rgba(255,255,255,0.5)` for labels
- Category headers: uppercase, small, `rgba(255,255,255,0.5)`
- No brand colors anywhere in the pipeline cards

Light theme support: Use `isDark` conditional for all color values (invert opacities for light mode).

## Files

| Action | Path | Description |
|--------|------|-------------|
| **Create** | `src/types/leads.ts` | Type definitions |
| **Create** | `src/data/leads.ts` | Default sources, channels, team, connections |
| **Create** | `src/context/LeadsContext.tsx` | Context provider with Supabase persistence |
| **Create** | `src/app/leads/page.tsx` | Route wrapper (thin, imports LeadsView) |
| **Create** | `src/components/pages/LeadsView.tsx` | Main view component |
| **Modify** | `src/components/layout/Sidebar.tsx` | Add "Leads Pipeline" nav item after Team |
| **Modify** | `src/app/ClientLayout.tsx` | Wrap with `<LeadsProvider>` |

## Component Breakdown within LeadsView

LeadsView is a single file. Internal structure:

1. **SourceCategoryGroup** — renders a category header + tree line + grid of source cards
2. **SourceCard** — renders visual + info for one source (handles laptop/logo/icon variants)
3. **ChannelCard** — renders one channel card
4. **TeamCard** — renders one team member card with stats
5. **DealSummary** — renders the deal signing row with computed totals
6. **PipelineLines** — the SVG overlay computing and drawing all connection lines

These can be inline components or extracted to the same file. No need for separate files — keeps the module self-contained.

## EditableCell Adaptation

The existing `EditableCell` component uses gold accent colors (`#d4a853`) for hover and focus states, which conflicts with the monochrome Notion-like aesthetic. Rather than modifying the shared component, `LeadsView` will use a local inline `LeadsEditableCell` wrapper that overrides the styling:

- Hover: `rgba(255,255,255,0.08)` background, `rgba(255,255,255,0.9)` text
- Focus border: `rgba(255,255,255,0.2)` instead of gold
- Same Enter/Escape/blur commit logic as `EditableCell`

This keeps the shared component unchanged while giving the Leads page its own visual treatment.

## Sidebar Icon

Simple funnel/pipeline icon as an inline SVG component, matching the style of existing icons (TrendUpIcon, TeamIcon, etc.) in Sidebar.tsx.

## Provider Integration

In `ClientLayout.tsx`, add `<LeadsProvider>` inside the existing provider stack:

```
<ToolsAccessProvider>
<LeadsProvider>        ← new
<ViewModeProvider>
```

No dependencies on other contexts except `ThemeContext` (for `isDark` in the view).
