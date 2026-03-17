# Team Organization Chart — Design Spec

## Overview

New `/org` page providing an investor-grade, read-only visualization of the team hierarchy. Existing `/team` page remains completely untouched.

## ID-to-Role Mapping

| Data ID | Display Name | Tier | Reports To |
|---------|-------------|------|------------|
| `director` | Director | Leadership | — |
| `community-manager` | Marketing Manager | Leadership | Director (peer link) |
| `digital-manager` | Digital Manager | Backoffice | Director |
| `property-hunter` | Property Hunter | Backoffice | Director |
| `customer-service` | Customer Service | Backoffice | Director |
| `community-mgr` | Community Manager | Backoffice | Marketing Manager |
| `agent-casa` | Agent Casablanca | Field | Director |
| `agent-marrakech` | Agent Marrakech | Field | Director |
| `agent-rabat` | Agent Rabat | Field | Director |
| `agent-other` | Agent Other Cities | Field | Director |

Display names use the `title` field from `TeamMemberData`.

## Hierarchy

### Leadership (2 members)
- **Director** (`director`, CDI) — manages Digital Manager, Property Hunter, Customer Service, and all 4 Field Agents directly
- **Marketing Manager** (`community-manager`, Freelance) — manages Community Manager only; communicates only with Director and Community Manager

### Backoffice (4 members)
- **Digital Manager** (`digital-manager`) — reports to Director
- **Property Hunter** (`property-hunter`) — reports to Director
- **Customer Service** (`customer-service`) — reports to Director
- **Community Manager** (`community-mgr`) — reports to Marketing Manager

Digital Manager, Property Hunter, and Customer Service have **bidirectional collaboration** with all 4 Field Agents.

### Field Agents (4 members)
- **Agent Casablanca** (`agent-casa`, Month 1) — reports to Director
- **Agent Marrakech** (`agent-marrakech`, Month 3) — reports to Director
- **Agent Rabat** (`agent-rabat`, Month 4) — reports to Director
- **Agent Other Cities** (`agent-other`, Month 5) — reports to Director

## Hierarchy Config

The hierarchy is **hardcoded as a constant** inside `OrgView.tsx` (not added to the data layer). This is a read-only presentation view — no need to pollute the shared types/data.

```ts
const ORG_HIERARCHY = {
  leadership: ['director', 'community-manager'],
  backoffice: ['digital-manager', 'property-hunter', 'customer-service', 'community-mgr'],
  field: ['agent-casa', 'agent-marrakech', 'agent-rabat', 'agent-other'],
  relationships: {
    command: { from: 'director', to: ['digital-manager', 'property-hunter', 'customer-service', 'agent-casa', 'agent-marrakech', 'agent-rabat', 'agent-other'] },
    oversight: { from: 'community-manager', to: ['community-mgr'] },
    collaboration: { between: ['digital-manager', 'property-hunter', 'customer-service'], and: ['agent-casa', 'agent-marrakech', 'agent-rabat', 'agent-other'] },
    peer: { members: ['director', 'community-manager'] }
  }
}
```

## Relationship Types

| Type | Color | Style | Meaning |
|------|-------|-------|---------|
| Command | Gold `#d4a853` | Solid line + animated particle | Director → his 7 direct reports |
| Peer | Gold `#d4a853` | Dashed line + particle | Director ↔ Marketing Manager |
| Collaboration | Teal `#2dd4bf` | Lines within dashed zone + bidirectional particles | Backoffice ↔ Field Agents |
| Oversight | Amber `#f59e0b` | Dashed line + particle | Marketing Mgr → Community Mgr |

## Card Design (Minimal)

Each team member node displays only:
- **Avatar** — circular, colored border + initials (from `TeamMemberDisplay`)
- **Title** — `title` field from `TeamMemberData`
- **Contract badge** — CDI (red), CDD (amber), Freelance (blue)

Cards have hover effect: slight upward translate + border brightening.

## Lateral Modal (Click to Expand)

Clicking any card opens a slide-in panel from the right (340px wide, glass-morphism backdrop blur). Contains 7 sections in order:

1. **Header** — Large avatar, title, scope, language flags
2. **Schedule** — Contract type, start month, full-time/part-time, work hours (2×2 grid)
3. **Responsibilities** — Icon + label list from `responsibilities` array
4. **Compensation** — Commission rate & type from `TeamMemberData.commission`. Base salary and total cost from expenses data via `useFinancial()` (matched by `expenseLabel`). If no expense match found, show only commission info.
5. **Skills & Tools** — Two tag clouds (skills colored by member, tools neutral)
6. **KPIs** — Label + target value pairs with monospace values
7. **Brand Affiliation** — Brand badges (FH, MI, EX) with brand colors. Derived from `brands` field; agents show market instead.

Modal is read-only. Close via ✕ button or clicking outside. Escape key also closes.

## Page Layout

- **Route**: `/org`
- **Sidebar**: New nav item "Organization" with org-chart icon, placed after "Team"
- **Page header**: Title "Organization" + subtitle "Team structure & hierarchy — N members" + relationship legend (3 colored dots)
- **Body**: Three tier sections stacked vertically:
  - LEADERSHIP label → Director + Marketing Manager centered, connected by dashed peer line
  - BACKOFFICE label → 4 cards in a centered row
  - Collaboration zone indicator (dashed teal border with "↕ BIDIRECTIONAL COLLABORATION ↕")
  - FIELD AGENTS label → 4 agent cards in a centered row
- **SVG overlay**: Animated connection lines with flowing particles between tiers

## Technical Approach

### New Files
- `src/app/org/page.tsx` — Route wrapper
- `src/components/pages/OrgView.tsx` — Main view component (includes ORG_HIERARCHY config + SVG lines)
- `src/components/pages/OrgMemberModal.tsx` — Lateral slide-in panel

### Modified Files
- `src/components/layout/Sidebar.tsx` — Add "Organization" nav item

### No Changes To
- All existing team files (`TeamView.tsx`, `TeamEditTable.tsx`, `TeamContext.tsx`, `team.ts`, `team types`)

### Data Flow
- `OrgView` reads team data via `useTeam()` hook (read-only)
- `OrgView` reads financial context via `useFinancial()` for expense salary lookup
- `OrgMemberModal` receives selected member data + display props as props
- No writes, no edits, no mutations — pure presentation

### Connection Lines
- CSS-based approach: use absolute-positioned divs with CSS transforms for connection lines (simpler than SVG coordinate calculation)
- Animated particles via CSS `@keyframes` with `will-change: transform` for GPU compositing
- Recalculate on window resize via `ResizeObserver` on the container
- Three visual styles matching the relationship types table above

### States
- **Loading**: Skeleton shimmer matching card shapes while `useTeam()` loads
- **Error**: Graceful fallback message if team data fails to load
- **Normal**: Full org chart with all connections

### Responsive
- Breakpoint: `lg` (1024px) — below this, switch to stacked mobile layout
- Cards wrap on smaller screens
- Modal becomes full-width overlay below `lg`
- Connection lines hidden below `lg` (hierarchy clear from tier labels + card ordering)
