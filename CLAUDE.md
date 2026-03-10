# CLAUDE.md — Feel Home Financial Simulator

## Project Overview

Interactive 3-year financial simulator for a real estate ecosystem with 3 brands:
- **Feel Home (FH)** — Rental agency for expatriates
- **M Invest (MI)** — Property sales for MRE market
- **Expats.ma (EX)** — Media/advertising platform

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **Styling**: Tailwind CSS 4 (dark theme, glass-morphism design)
- **Charts**: Recharts 3
- **Database**: Supabase (PostgreSQL) + localStorage fallback
- **Path alias**: `@/*` → `./src/*`

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout
│   ├── ClientLayout.tsx    # Client-side provider wrapper
│   ├── page.tsx            # Home → redirects to /summary
│   ├── summary/            # P&L dashboard
│   ├── revenues/           # Revenue breakdown editor
│   ├── expenses/           # Expense management
│   └── investment/         # 36-month simulation
├── components/
│   ├── layout/             # Sidebar, TopBar, RightPanel, Footer
│   ├── pages/              # *View.tsx — page-level view components
│   └── ui/                 # Reusable: EditableCell, KPICard, Toggle, etc.
├── context/
│   └── FinancialContext.tsx # Global state (React Context + Supabase sync)
├── lib/
│   ├── calculations.ts     # Financial calculation logic
│   ├── formatters.ts       # Number formatting (MAD currency)
│   └── supabase.ts         # Supabase client & API
├── data/                   # Default data (brands, revenues, expenses)
└── types/
    └── index.ts            # TypeScript interfaces
```

## Commands

```bash
npm run dev      # Dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Production start
npm run lint     # ESLint
```

## Key Architecture Decisions

- **Page routes** (`app/*/page.tsx`) wrap **view components** (`components/pages/*View.tsx`)
- **All interactive components** use `'use client'` directive
- **Global state** via React Context (`useFinancial()` hook) — no Redux/Zustand
- **Hybrid persistence**: localStorage (instant) + Supabase (500ms debounce)
- **Memoized calculations**: `useMemo` for yearly/monthly/simulation computations
- **Editable cells**: Click-to-edit pattern with Enter/Escape handling

## Coding Conventions

- **Components**: PascalCase (`RevenuesView`, `BrandAvatar`)
- **Functions**: camelCase (`calcYearlyFinancials`, `formatMAD`)
- **Types**: PascalCase (`BrandKey`, `SaleRevenueItem`)
- **Constants**: UPPER_SNAKE_CASE (`STORAGE_KEY`)
- **Files**: PascalCase for components, camelCase for utils/lib

## Styling

- Dark theme: background `#06070a`, RGBA overlays
- Accent colors: Gold `#d4a853`, Teal `#2dd4bf`, Blue `#1d7ff3`
- Glass-morphism cards with backdrop blur
- Custom animations: fadeIn, shimmer, pulse-glow
- All styling via Tailwind utility classes

## Data Flow

1. `FinancialProvider` loads data from Supabase (fallback: localStorage)
2. View components read/write via `useFinancial()` hook
3. Edits trigger re-calculation (memoized) + debounced cloud save
4. Brand/market toggles filter what's displayed and calculated

## Important Notes

- `.env.local` holds Supabase public keys (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- Agent commission rate is 25% of gross revenue
- Financial data covers 3 years (Y1, Y2, Y3) with monthly granularity in investment view
- Markets: Casablanca, Marrakech, Rabat, Other
