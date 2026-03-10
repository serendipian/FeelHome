'use client';

import { usePathname } from 'next/navigation';
import { useFinancial } from '@/context/FinancialContext';
import { brands, brandKeys } from '@/data/brands';
import { formatCompact } from '@/lib/formatters';

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'P&L Overview', subtitle: 'Consolidated financial performance' },
  '/summary': { title: 'P&L Overview', subtitle: 'Consolidated financial performance' },
  '/revenues': { title: 'Revenue Breakdown', subtitle: 'Monthly assumptions by business unit' },
  '/expenses': { title: 'Expense Detail', subtitle: 'Operating costs by category' },
  '/investment': { title: 'Investment Simulation', subtitle: 'Scenario modeling & projections' },
};

export default function TopBar() {
  const pathname = usePathname();
  const { activeBrands, yearly } = useFinancial();

  const activeBrandList = brandKeys.filter((k) => activeBrands[k]);
  const page = pageTitles[pathname] || pageTitles['/'];

  return (
    <div
      className="flex items-center justify-between px-8 h-[56px] backdrop-blur-2xl shrink-0"
      style={{
        background: 'linear-gradient(180deg, rgba(6, 7, 10, 0.9) 0%, rgba(6, 7, 10, 0.7) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
      }}
    >
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-[14px] font-semibold text-white/85 leading-tight">{page.title}</h1>
          <p className="text-[10px] text-white/25 leading-tight">{page.subtitle}</p>
        </div>
        <div className="h-5 w-px bg-white/[0.06]" />
        <div className="flex items-center gap-1.5">
          {activeBrandList.map((key) => (
            <div
              key={key}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: brands[key].color, boxShadow: `0 0 6px ${brands[key].color}40` }}
              title={brands[key].name}
            />
          ))}
          <span className="text-[10px] text-white/20 ml-1">
            {activeBrandList.length} active
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <span className="text-[10px] text-white/25">Y3 Revenue</span>
          <span className="text-[11px] font-mono font-bold text-[#d4a853]">{formatCompact(yearly[2].revenue)}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <span className="text-[10px] text-white/25">Y3 Profit</span>
          <span className="text-[11px] font-mono font-bold" style={{ color: yearly[2].profit >= 0 ? '#2dd4bf' : '#f43f5e' }}>
            {formatCompact(yearly[2].profit)}
          </span>
        </div>
      </div>
    </div>
  );
}
