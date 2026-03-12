'use client';

import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useFinancial, MarketKey, ScenarioKey } from '@/context/FinancialContext';
import { useMobileNav } from '@/context/MobileNavContext';
import { useCurrency } from '@/context/CurrencyContext';
import { brands, brandKeys } from '@/data/brands';
import { BrandKey } from '@/types';
import BrandAvatar from '@/components/ui/BrandAvatar';
import Toggle from '@/components/ui/Toggle';
import { useCurrencyFormatters } from '@/context/CurrencyContext';
import EditableCell from '@/components/ui/EditableCell';
import ChartTooltip from '@/components/ui/ChartTooltip';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';

const marketLabels: Record<MarketKey, string> = {
  casablanca: 'Casablanca',
  rabat: 'Rabat',
  marrakech: 'Marrakech',
  autre: 'Other Cities',
};

const marketColors: Record<MarketKey, string> = {
  casablanca: '#d4a853',
  rabat: '#2dd4bf',
  marrakech: '#f97316',
  autre: '#8b5cf6',
};

const marketKeys: MarketKey[] = ['casablanca', 'rabat', 'marrakech', 'autre'];

const scenarioConfig: { key: ScenarioKey; label: string; color: string }[] = [
  { key: 'pessimistic', label: 'Pessimistic', color: '#f43f5e' },
  { key: 'realistic', label: 'Realistic', color: '#d4a853' },
  { key: 'optimistic', label: 'Optimistic', color: '#2dd4bf' },
];

export default function RightPanel() {
  const pathname = usePathname();
  const { isDark } = useTheme();
  const { fNum, currency } = useCurrencyFormatters();
  const { panelOpen, closePanel } = useMobileNav();
  const { isUSD, toggleCurrency, currency: currLabel } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const {
    activeBrands,
    toggleBrand,
    activeMarkets,
    toggleMarket,
    revenueByBrand,
    expensesByCategory,
    saleRevenues,
    rentalRevenues,
    investment,
    setInvestment,
    commissionRate,
    setCommissionRate,
    activeScenario,
    setActiveScenario,
  } = useFinancial();

  return (
    <>
      {/* Mobile backdrop */}
      {panelOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={closePanel}
        />
      )}
    <div
      className={`
        fixed right-0 top-0 h-screen z-50 w-[300px] sm:w-[340px]
        md:static md:h-auto md:z-auto md:w-[340px]
        shrink-0 flex flex-col gap-5 px-4 py-6 overflow-y-auto
        transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${panelOpen ? 'translate-x-0' : 'translate-x-full'}
        md:translate-x-0
      `}
      style={{
        background: isDark
          ? 'linear-gradient(180deg, rgba(6, 7, 10, 0.98) 0%, rgba(6, 7, 10, 0.99) 100%)'
          : 'linear-gradient(180deg, rgba(248, 250, 252, 0.98) 0%, rgba(241, 245, 249, 0.99) 100%)',
        borderLeft: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(15,23,42,0.06)',
      }}
    >
      {/* Mobile-only: close button + theme/currency toggles */}
      <div className="md:hidden flex items-center justify-between mb-2">
        <span className="text-[12px] font-semibold text-white/60">Settings</span>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleCurrency}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer"
            style={{
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <span className="text-[10px] font-bold" style={{ color: isUSD ? '#1d7ff3' : (isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)') }}>
              {isUSD ? '$' : 'MAD'}
            </span>
          </button>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer"
            style={{
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
            }}
          >
            {isDark ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
              </svg>
            )}
          </button>
          <button
            onClick={closePanel}
            className="flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer"
            style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
      {/* Scenario Selector */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-1 rounded-full bg-[#d4a853]/60" />
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Scenario</span>
        </div>
        <div
          className="flex rounded-xl overflow-hidden"
          style={{
            background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)',
            border: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(15,23,42,0.06)',
          }}
        >
          {scenarioConfig.map((s) => {
            const active = activeScenario === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setActiveScenario(s.key)}
                className="flex-1 py-2 text-[10px] font-semibold uppercase tracking-wider transition-all duration-300 relative"
                style={{
                  color: active ? s.color : (isDark ? 'rgba(255,255,255,0.25)' : 'rgba(15,23,42,0.3)'),
                  background: active ? `${s.color}12` : 'transparent',
                }}
              >
                {active && (
                  <div
                    className="absolute bottom-0 left-[20%] right-[20%] h-[2px] rounded-full"
                    style={{ background: s.color }}
                  />
                )}
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand Toggles */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-1 rounded-full bg-[#d4a853]/60" />
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Brands</span>
        </div>
        <div className="flex flex-col gap-2">
          {brandKeys.map((key) => {
            const brand = brands[key];
            const active = activeBrands[key];
            return (
              <div
                key={key}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-300"
                style={{
                  background: active
                    ? `linear-gradient(135deg, ${brand.color}0a 0%, ${brand.color}04 100%)`
                    : (isDark ? 'rgba(255,255,255,0.015)' : 'rgba(15,23,42,0.015)'),
                  border: `1px solid ${active ? `${brand.color}20` : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.05)')}`,
                  opacity: active ? 1 : 0.5,
                }}
              >
                <BrandAvatar brand={brand} size={22} />
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-semibold text-white/80 leading-tight block">{brand.name}</span>
                  <span className="text-[9px] text-white/25 leading-tight block">{brand.description}</span>
                </div>
                <Toggle checked={active} onChange={() => toggleBrand(key)} color={brand.color} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Market Toggles */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-1 rounded-full bg-[#2dd4bf]/60" />
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Markets</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {marketKeys.map((key) => {
            const active = activeMarkets[key];
            const color = marketColors[key];
            return (
              <div
                key={key}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-300"
                style={{
                  background: active ? `${color}08` : (isDark ? 'rgba(255,255,255,0.015)' : 'rgba(15,23,42,0.015)'),
                  border: `1px solid ${active ? `${color}18` : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.05)')}`,
                  opacity: active ? 1 : 0.5,
                }}
              >
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold shrink-0"
                  style={{ background: `${color}15`, color }}
                >
                  {marketLabels[key].charAt(0)}
                </div>
                <span className="flex-1 text-[11px] font-medium text-white/70">{marketLabels[key]}</span>
                <Toggle checked={active} onChange={() => toggleMarket(key)} color={color} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Hypotheses — only on simulation page */}
      {pathname === '/investment' && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-1 rounded-full bg-[#d4a853]/60" />
            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Hypotheses</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <div
              className="flex items-center justify-between px-3 py-2.5 rounded-xl"
              style={{
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)',
                border: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(15,23,42,0.06)',
              }}
            >
              <span className="text-[11px] font-medium text-white/50">Initial Investment</span>
              <div className="font-mono text-[12px] font-bold text-[#d4a853]">
                <EditableCell
                  value={investment}
                  onSave={setInvestment}
                  format={(v) => `${fNum(Math.round(v))} ${currency}`}
                />
              </div>
            </div>
            <div
              className="flex items-center justify-between px-3 py-2.5 rounded-xl"
              style={{
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)',
                border: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(15,23,42,0.06)',
              }}
            >
              <span className="text-[11px] font-medium text-white/50">Team Commission</span>
              <div className="font-mono text-[12px] font-bold text-[#f59e0b]">
                <EditableCell
                  value={commissionRate * 100}
                  onSave={(v) => setCommissionRate(v / 100)}
                  format={(v) => `${Math.round(v)}%`}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Separator */}
      <div className="h-px bg-white/[0.04]" />

      {/* Contextual Charts — relocated from main pages */}
      {pathname === '/revenues' ? (
        <RevenueCharts revenueByBrand={revenueByBrand} saleRevenues={saleRevenues} rentalRevenues={rentalRevenues} activeMarkets={activeMarkets} />
      ) : pathname === '/expenses' ? (
        <ExpenseCharts expensesByCategory={expensesByCategory} />
      ) : null}
    </div>
    </>
  );
}

/* ── Revenue Charts (relocated: stacked bar + market) ─ */
function RevenueCharts({
  revenueByBrand,
  saleRevenues,
  rentalRevenues,
  activeMarkets,
}: {
  revenueByBrand: { y1: Record<BrandKey, number>; y2: Record<BrandKey, number>; y3: Record<BrandKey, number> };
  saleRevenues: any[];
  rentalRevenues: any[];
  activeMarkets: Record<MarketKey, boolean>;
}) {
  const { isDark } = useTheme();
  const chartData = (['y1', 'y2', 'y3'] as const).map((y, i) => ({
    name: `Y${i + 1}`,
    FH: revenueByBrand[y].feelHome * 12,
    MI: revenueByBrand[y].mInvest * 12,
    EX: revenueByBrand[y].expats * 12,
  }));

  const marketLabelToKey: Record<string, MarketKey> = {
    Casablanca: 'casablanca',
    Marrakech: 'marrakech',
    Rabat: 'rabat',
    Autre: 'autre',
  };

  const marketData = marketKeys
    .filter((k) => activeMarkets[k])
    .map((k) => {
      const sale = saleRevenues.find((s: any) => marketLabelToKey[s.label] === k);
      const rental = rentalRevenues.find((r: any) => marketLabelToKey[r.label] === k);
      const total = ((sale?.y3.total || 0) + (rental?.y3.total || 0)) * 12;
      return { name: marketLabels[k].slice(0, 4), value: total, color: marketColors[k] };
    });

  return (
    <>
      {/* Revenue by Brand — stacked bar */}
      <SideChartCard title="Revenue by Brand" subtitle="Annual stacked view">
        <div className="flex items-center gap-2 mb-2">
          {brandKeys.map((key) => (
            <div key={key} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: brands[key].color }} />
              <span className="text-[8px] text-white/30">{brands[key].shortName}</span>
            </div>
          ))}
        </div>
        <div className="h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.06)'} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.3)', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} width={35} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="FH" stackId="a" fill="#d4875a" />
              <Bar dataKey="MI" stackId="a" fill="#5b8ec9" />
              <Bar dataKey="EX" stackId="a" fill="#1d7ff3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SideChartCard>

      {/* Market Mix */}
      <SideChartCard title="Market Mix" subtitle="Y3 revenue by city">
        <div className="h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={marketData} barSize={22}>
              <XAxis dataKey="name" tick={{ fill: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.3)', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} width={35} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {marketData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SideChartCard>
    </>
  );
}

/* ── Expense Charts (relocated: donut + area) ──────── */
function ExpenseCharts({
  expensesByCategory,
}: {
  expensesByCategory: { y1: Record<string, number>; y2: Record<string, number>; y3: Record<string, number> };
}) {
  const { isDark } = useTheme();
  const catColors: Record<string, string> = { salaries: '#d4a853', fixed: '#5b8ec9', marketing: '#1d7ff3' };
  const catLabels: Record<string, string> = { salaries: 'Salaries', fixed: 'Fixed', marketing: 'Marketing' };

  const pieData = Object.entries(expensesByCategory.y3)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: catLabels[key] || key,
      value: value * 12,
      color: catColors[key] || '#666',
    }));

  const areaData = (['y1', 'y2', 'y3'] as const).map((y, i) => ({
    name: `Y${i + 1}`,
    Salaries: expensesByCategory[y].salaries * 12,
    Fixed: expensesByCategory[y].fixed * 12,
    Marketing: expensesByCategory[y].marketing * 12,
  }));

  return (
    <>
      {/* Expense Split — Donut */}
      <SideChartCard title="Expense Split" subtitle="Year 3 distribution">
        <div className="h-[130px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={32}
                outerRadius={50}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-3 mt-1">
          {pieData.map((d) => (
            <div key={d.name} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-[9px] text-white/35">{d.name}</span>
            </div>
          ))}
        </div>
      </SideChartCard>

      {/* Expense Growth — Stacked Area */}
      <SideChartCard title="Expense Growth" subtitle="3-year projection">
        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="rpSalG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4a853" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#d4a853" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="rpFixG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5b8ec9" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#5b8ec9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="rpMktG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1d7ff3" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#1d7ff3" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.06)'} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(15,23,42,0.3)', fontSize: 8 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} width={35} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="Salaries" stackId="1" fill="url(#rpSalG)" stroke="#d4a853" strokeWidth={1.5} />
              <Area type="monotone" dataKey="Fixed" stackId="1" fill="url(#rpFixG)" stroke="#5b8ec9" strokeWidth={1.5} />
              <Area type="monotone" dataKey="Marketing" stackId="1" fill="url(#rpMktG)" stroke="#1d7ff3" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </SideChartCard>
    </>
  );
}

/* ── Side Chart Card ───────────────────────────────── */
function SideChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const { isDark } = useTheme();
  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)',
        border: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(15,23,42,0.06)',
      }}
    >
      <div className="mb-2">
        <h4 className="text-[11px] font-semibold text-white/60">{title}</h4>
        <p className="text-[9px] text-white/20">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
