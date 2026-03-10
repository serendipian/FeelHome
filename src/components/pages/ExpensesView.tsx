'use client';

import { useFinancial } from '@/context/FinancialContext';
import { formatMAD, formatNumber } from '@/lib/formatters';
import { expenses } from '@/data/expenses';
import { isExpenseActive } from '@/lib/calculations';
import BrandPill from '@/components/ui/BrandPill';
import MiniBar from '@/components/ui/MiniBar';
import SectionTitle from '@/components/ui/SectionTitle';
import TotalBar from '@/components/ui/TotalBar';
import ChartTooltip from '@/components/ui/ChartTooltip';
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const categoryColors: Record<string, string> = {
  salaries: '#d4a853',
  fixed: '#5b8ec9',
  marketing: '#7c6bf4',
};

const categoryLabels: Record<string, string> = {
  salaries: 'Salaries',
  fixed: 'Fixed Costs',
  marketing: 'Marketing',
};

export default function ExpensesView() {
  const { activeBrands, expensesByCategory, yearly } = useFinancial();

  // Donut chart data (Year 3)
  const donutData = Object.entries(expensesByCategory.y3)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      name: categoryLabels[key],
      value: value * 12,
      color: categoryColors[key],
    }));

  // Area chart data
  const areaData = (['y1', 'y2', 'y3'] as const).map((y, i) => ({
    name: `Year ${i + 1}`,
    Salaries: expensesByCategory[y].salaries * 12,
    'Fixed Costs': expensesByCategory[y].fixed * 12,
    Marketing: expensesByCategory[y].marketing * 12,
  }));

  // Active expenses
  const activeExpenses = expenses.filter((e) => isExpenseActive(e, activeBrands));
  const maxExpense = Math.max(...activeExpenses.map((e) => e.y3), 1);

  // Group by category
  const grouped = {
    salaries: activeExpenses.filter((e) => e.category === 'salaries'),
    fixed: activeExpenses.filter((e) => e.category === 'fixed'),
    marketing: activeExpenses.filter((e) => e.category === 'marketing'),
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionTitle title="Expense Detail" color="#f43f5e" />

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Donut */}
        <div className="card p-6">
          <h3 className="text-sm font-medium text-white/50 mb-4">Expense Split — Year 3</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area */}
        <div className="card p-6">
          <h3 className="text-sm font-medium text-white/50 mb-4">Expense Growth — 3 Years</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis dataKey="name" tick={{ fill: '#ffffff50', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#ffffff50', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="Salaries" stackId="1" fill="#d4a85330" stroke="#d4a853" />
                <Area type="monotone" dataKey="Fixed Costs" stackId="1" fill="#5b8ec930" stroke="#5b8ec9" />
                <Area type="monotone" dataKey="Marketing" stackId="1" fill="#7c6bf430" stroke="#7c6bf4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Expense Table */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-6 py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Expense</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Brands</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Year 1</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Year 2</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-white/40 uppercase tracking-wider">Year 3</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-white/40 uppercase tracking-wider w-20"></th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped).map(([cat, items]) =>
              items.length > 0 ? (
                <CategoryGroup key={cat} category={cat} items={items} maxExpense={maxExpense} />
              ) : null
            )}
          </tbody>
        </table>
      </div>

      <TotalBar
        label="Total Monthly Expenses"
        values={[
          yearly[0].expenses / 12,
          yearly[1].expenses / 12,
          yearly[2].expenses / 12,
        ]}
        color="#f43f5e"
      />
    </div>
  );
}

function CategoryGroup({
  category,
  items,
  maxExpense,
}: {
  category: string;
  items: typeof expenses;
  maxExpense: number;
}) {
  return (
    <>
      <tr>
        <td
          colSpan={6}
          className="px-6 py-2 text-xs font-semibold uppercase tracking-wider"
          style={{ color: categoryColors[category] }}
        >
          {categoryLabels[category]}
        </td>
      </tr>
      {items.map((exp) => (
        <tr key={exp.label} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
          <td className="px-6 py-2.5 text-white/70">{exp.label}</td>
          <td className="px-6 py-2.5">
            <div className="flex gap-1">
              {exp.brands.map((b) => (
                <BrandPill key={b} brandKey={b} />
              ))}
            </div>
          </td>
          <td className="px-6 py-2.5 text-right font-mono text-white/60">
            {exp.y1 > 0 ? formatNumber(exp.y1) : '—'}
          </td>
          <td className="px-6 py-2.5 text-right font-mono text-white/60">
            {exp.y2 > 0 ? formatNumber(exp.y2) : '—'}
          </td>
          <td className="px-6 py-2.5 text-right font-mono text-white/60">
            {exp.y3 > 0 ? formatNumber(exp.y3) : '—'}
          </td>
          <td className="px-6 py-2.5 text-right">
            <MiniBar value={exp.y3} max={maxExpense} color={categoryColors[exp.category]} />
          </td>
        </tr>
      ))}
    </>
  );
}
