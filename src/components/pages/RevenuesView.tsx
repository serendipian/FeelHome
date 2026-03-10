'use client';

import { useState } from 'react';
import { useFinancial } from '@/context/FinancialContext';
import { formatMAD, formatNumber } from '@/lib/formatters';
import { saleRevenues, rentalRevenues, mediaRevenues } from '@/data/revenues';
import { brands } from '@/data/brands';
import SectionTitle from '@/components/ui/SectionTitle';
import BrandAvatar from '@/components/ui/BrandAvatar';
import TotalBar from '@/components/ui/TotalBar';
import ChartTooltip from '@/components/ui/ChartTooltip';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function RevenuesView() {
  const { activeBrands, revenueByBrand, yearly } = useFinancial();

  const chartData = (['y1', 'y2', 'y3'] as const).map((y, i) => ({
    name: `Year ${i + 1}`,
    'Feel Home': revenueByBrand[y].feelHome * 12,
    'M Invest': revenueByBrand[y].mInvest * 12,
    'Expats.ma': revenueByBrand[y].expats * 12,
  }));

  return (
    <div className="space-y-8 animate-fadeIn">
      <SectionTitle title="Revenue Breakdown" />

      {/* Stacked Bar Chart */}
      <div className="card p-6">
        <h3 className="text-sm font-medium text-white/50 mb-4">Revenue by Brand — Annual</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="name" tick={{ fill: '#ffffff50', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#ffffff50', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Feel Home" stackId="a" fill="#d4875a" radius={[0, 0, 0, 0]} />
              <Bar dataKey="M Invest" stackId="a" fill="#5b8ec9" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Expats.ma" stackId="a" fill="#7c6bf4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* M Invest Card */}
      {activeBrands.mInvest && (
        <RevenueCard
          brand={brands.mInvest}
          subtitle="Property Sales — MRE Market"
          totals={[
            saleRevenues.reduce((s, r) => s + r.y1.total, 0),
            saleRevenues.reduce((s, r) => s + r.y2.total, 0),
            saleRevenues.reduce((s, r) => s + r.y3.total, 0),
          ]}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['City', 'Price/m²', 'Area', 'Avg Price', 'Comm.', 'Rev/Conv', 'Y1 Conv', 'Y1 Total', 'Y2 Conv', 'Y2 Total', 'Y3 Conv', 'Y3 Total'].map((h) => (
                  <th key={h} className="px-3 py-2 text-xs font-medium text-white/40 text-right first:text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {saleRevenues.map((item) => (
                <tr key={item.label} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-3 py-2 text-white/70">{item.label}</td>
                  <td className="px-3 py-2 text-right font-mono text-white/60">{formatNumber(item.priceM2)}</td>
                  <td className="px-3 py-2 text-right font-mono text-white/60">{item.area} m²</td>
                  <td className="px-3 py-2 text-right font-mono text-white/60">{formatNumber(item.avgPrice)}</td>
                  <td className="px-3 py-2 text-right font-mono text-white/60">{item.commRateLabel}</td>
                  <td className="px-3 py-2 text-right font-mono text-[#5b8ec9]">{formatNumber(item.revPerConv)}</td>
                  <td className="px-3 py-2 text-right font-mono text-white/50">{item.y1.conv}</td>
                  <td className="px-3 py-2 text-right font-mono text-white/80">{formatNumber(item.y1.total)}</td>
                  <td className="px-3 py-2 text-right font-mono text-white/50">{item.y2.conv}</td>
                  <td className="px-3 py-2 text-right font-mono text-white/80">{formatNumber(item.y2.total)}</td>
                  <td className="px-3 py-2 text-right font-mono text-white/50">{item.y3.conv}</td>
                  <td className="px-3 py-2 text-right font-mono text-white/80">{formatNumber(item.y3.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </RevenueCard>
      )}

      {/* Feel Home Card */}
      {activeBrands.feelHome && (
        <RevenueCard
          brand={brands.feelHome}
          subtitle="Long-term Rentals — Expatriates"
          totals={[
            rentalRevenues.reduce((s, r) => s + r.y1.total, 0),
            rentalRevenues.reduce((s, r) => s + r.y2.total, 0),
            rentalRevenues.reduce((s, r) => s + r.y3.total, 0),
          ]}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['City', 'Rent/Mo', 'Commission', 'Rev/Conv', 'Y1 Conv', 'Y1 Total', 'Y2 Conv', 'Y2 Total', 'Y3 Conv', 'Y3 Total'].map((h) => (
                  <th key={h} className="px-3 py-2 text-xs font-medium text-white/40 text-right first:text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rentalRevenues.map((item) => (
                <tr key={item.label} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-3 py-2 text-white/70">{item.label}</td>
                  <td className="px-3 py-2 text-right font-mono text-white/60">{formatNumber(item.rent)}</td>
                  <td className="px-3 py-2 text-right font-mono text-white/60">{item.commFactorLabel}</td>
                  <td className="px-3 py-2 text-right font-mono text-[#d4875a]">{formatNumber(item.revPerConv)}</td>
                  <td className="px-3 py-2 text-right font-mono text-white/50">{item.y1.conv}</td>
                  <td className="px-3 py-2 text-right font-mono text-white/80">{formatNumber(item.y1.total)}</td>
                  <td className="px-3 py-2 text-right font-mono text-white/50">{item.y2.conv}</td>
                  <td className="px-3 py-2 text-right font-mono text-white/80">{formatNumber(item.y2.total)}</td>
                  <td className="px-3 py-2 text-right font-mono text-white/50">{item.y3.conv}</td>
                  <td className="px-3 py-2 text-right font-mono text-white/80">{formatNumber(item.y3.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </RevenueCard>
      )}

      {/* Expats.ma Card */}
      {activeBrands.expats && (
        <RevenueCard
          brand={brands.expats}
          subtitle="Media Platform — Ads, Memberships, Events"
          totals={[
            mediaRevenues.reduce((s, r) => s + r.y1.total, 0),
            mediaRevenues.reduce((s, r) => s + r.y2.total, 0),
            mediaRevenues.reduce((s, r) => s + r.y3.total, 0),
          ]}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Source', 'Unit Price', 'Y1 Conv', 'Y1 Total', 'Y2 Conv', 'Y2 Total', 'Y3 Conv', 'Y3 Total'].map((h) => (
                  <th key={h} className="px-3 py-2 text-xs font-medium text-white/40 text-right first:text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mediaRevenues.map((item) => (
                <tr key={item.label} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-3 py-2 text-white/70">{item.label}</td>
                  <td className="px-3 py-2 text-right font-mono text-[#7c6bf4]">{formatNumber(item.unitPrice)}</td>
                  <td className="px-3 py-2 text-right font-mono text-white/50">{item.y1.conv}</td>
                  <td className="px-3 py-2 text-right font-mono text-white/80">{formatNumber(item.y1.total)}</td>
                  <td className="px-3 py-2 text-right font-mono text-white/50">{item.y2.conv}</td>
                  <td className="px-3 py-2 text-right font-mono text-white/80">{formatNumber(item.y2.total)}</td>
                  <td className="px-3 py-2 text-right font-mono text-white/50">{item.y3.conv}</td>
                  <td className="px-3 py-2 text-right font-mono text-white/80">{formatNumber(item.y3.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </RevenueCard>
      )}

      {/* Total Revenue Bar */}
      <TotalBar
        label="Total Monthly Revenue"
        values={[
          yearly[0].revenue / 12,
          yearly[1].revenue / 12,
          yearly[2].revenue / 12,
        ]}
        color="#d4a853"
      />
    </div>
  );
}

function RevenueCard({
  brand,
  subtitle,
  totals,
  children,
}: {
  brand: (typeof brands)[string];
  subtitle: string;
  totals: number[];
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <BrandAvatar brand={brand} size={32} />
          <div className="text-left">
            <span className="text-sm font-semibold text-white/90">{brand.name}</span>
            <p className="text-[11px] text-white/40">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {totals.map((t, i) => (
            <div key={i} className="text-right">
              <p className="text-[10px] text-white/30">Y{i + 1}/mo</p>
              <p className="font-mono text-sm font-semibold" style={{ color: brand.color }}>
                {formatMAD(t)}
              </p>
            </div>
          ))}
          <svg
            className={`w-4 h-4 text-white/30 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {expanded && <div className="border-t border-white/5">{children}</div>}
    </div>
  );
}
