'use client';

import { useTheme } from '@/context/ThemeContext';
import BrandPill from '@/components/ui/BrandPill';

export default function Footer() {
  const { isDark } = useTheme();

  return (
    <footer
      className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 md:px-8 py-3 gap-2"
      style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.03)' : '1px solid rgba(15,23,42,0.06)' }}
    >
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-white/20 uppercase tracking-wider font-medium">Brands</span>
        <BrandPill brandKey="feelHome" />
        <BrandPill brandKey="mInvest" />
        <BrandPill brandKey="expats" />
      </div>
      <span className="text-[10px] text-white/15 font-medium tracking-wide hidden sm:inline">
        Expense active when ≥1 linked brand is ON · Amounts in MAD · Commissions = 25%
      </span>
    </footer>
  );
}
