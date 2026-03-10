'use client';

import { usePathname } from 'next/navigation';
import { useFinancial } from '@/context/FinancialContext';
import { formatCompact } from '@/lib/formatters';

const pageTitles: Record<string, string> = {
  '/': 'P&L Overview',
  '/summary': 'P&L Overview',
  '/revenues': 'Revenue Breakdown',
  '/expenses': 'Expense Detail',
  '/investment': 'Investment Simulation',
};

export default function TopBar() {
  const pathname = usePathname();
  const { yearly } = useFinancial();
  const title = pageTitles[pathname] || pageTitles['/'];

  return (
    <div
      className="flex items-center justify-between px-8 h-[56px] backdrop-blur-2xl shrink-0"
      style={{
        background: 'linear-gradient(180deg, rgba(6, 7, 10, 0.9) 0%, rgba(6, 7, 10, 0.7) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
      }}
    >
      <h1 className="text-[18px] font-semibold text-white/90 leading-tight">{title}</h1>

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
