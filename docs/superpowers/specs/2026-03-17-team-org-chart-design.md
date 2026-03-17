# Team Organization Chart — Design Spec

## Overview

New `/org` page providing an investor-grade, read-only visualization of the team hierarchy. Existing `/team` page remains completely untouched.

## Hierarchy

### Leadership (2 members)
- **Director** (CDI) — manages Digital Coordinator, Property Hunter, Customer Service, and all 4 Field Agents directly
- **Marketing Manager** (Freelance) — manages Community Manager only; communicates only with Director and Community Manager

### Backoffice (4 members)
- **Digital Coordinator** — reports to Director
- **Property Hunter** — reports to Director
- **Customer Service** — reports to Director
- **Community Manager** — reports to Marketing Manager

All three of Digital Coordinator, Property Hunter, and Customer Service have **bidirectional collaboration** with all 4 Field Agents.

### Field Agents (4 members)
- **Agent Casablanca** (Month 1) — reports to Director
- **Agent Marrakech** (Month 3) — reports to Director
- **Agent Rabat** (Month 4) — reports to Director
- **Agent Other Cities** (Month 5) — reports to Director

## Relationship Types

| Type | Color | Style | Meaning |
|------|-------|-------|---------|
| Command | Gold `#d4a853` | Solid line + animated particle | Director → direct reports |
| Collaboration | Teal `#2dd4bf` | Lines within dashed zone + bidirectional particles | Backoffice ↔ Field Agents |
| Oversight | Amber `#f59e0b` | Dashed line + particle | Marketing Mgr → Community Mgr |

## Card Design (Minimal)

Each team member node displays only:
- **Avatar** — circular, colored border + initials (using existing `TeamMemberDisplay` colors)
- **Title** — role name (e.g. "Director", "Property Hunter", "Casablanca")
- **Contract badge** — CDI (red), CDD (amber), Freelance (blue)

Cards have hover effect: slight upward translate + border brightening.

## Lateral Modal (Click to Expand)

Clicking any card opens a slide-in panel from the right (340px wide, glass-morphism backdrop blur). Contains 7 sections in order:

1. **Header** — Large avatar, title, scope, language flags
2. **Schedule** — Contract type, start month, full-time/part-time, work hours (2×2 grid)
3. **Responsibilities** — Icon + label list from `responsibilities` data
4. **Compensation** — Base salary, commission rate & type, total cost
5. **Skills & Tools** — Two tag clouds (skills colored by member, tools neutral)
6. **KPIs** — Label + target value pairs with monospace values
7. **Brand Affiliation** — Brand badges (FH, MI, EX) with brand colors

Modal is read-only. Close via ✕ button or clicking outside.

## Page Layout

- **Route**: `/org`
- **Sidebar**: New nav item "Organization" with org-chart icon, placed after "Team"
- **Page header**: Title "Organization" + subtitle "Team structure & hierarchy — N members" + relationship legend (3 colored dots)
- **Body**: Three tier sections stacked vertically:
  - LEADERSHIP label → Director + Marketing Manager centered, connected by dashed line
  - BACKOFFICE label → 4 cards in a centered row
  - Collaboration zone indicator (dashed teal border with "↕ BIDIRECTIONAL COLLABORATION ↕")
  - FIELD AGENTS label → 4 agent cards in a centered row
- **SVG overlay**: Animated connection lines with flowing particles between tiers

## Technical Approach

### New Files
- `src/app/org/page.tsx` — Route wrapper
- `src/components/pages/OrgView.tsx` — Main view component
- `src/components/pages/OrgMemberModal.tsx` — Lateral slide-in panel

### Modified Files
- `src/components/layout/Sidebar.tsx` — Add "Organization" nav item

### No Changes To
- `src/app/team/page.tsx`
- `src/components/pages/TeamView.tsx`
- `src/components/pages/TeamEditTable.tsx`
- `src/context/TeamContext.tsx`
- `src/data/team.ts`
- `src/types/team.ts`

### Data Flow
- `OrgView` reads team data via `useTeam()` hook (read-only)
- `OrgView` reads financial context via `useFinancial()` for active markets/brands
- `OrgMemberModal` receives selected member data as props
- No writes, no edits, no mutations — pure presentation

### Connection Lines
- SVG layer rendered behind cards using `useRef` + `useEffect` to calculate positions
- Animated particles via CSS `@keyframes` or SVG `animateMotion`
- Three visual styles matching the relationship types table above

### Responsive
- Cards wrap on smaller screens
- Modal becomes full-width overlay on mobile
- SVG lines hidden on mobile (hierarchy still clear from tier labels + card ordering)
