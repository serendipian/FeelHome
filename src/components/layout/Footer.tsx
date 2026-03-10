'use client';

import BrandPill from '@/components/ui/BrandPill';

export default function Footer() {
  return (
    <footer
      className="flex items-center justify-between px-8 py-3"
      style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}
    >
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-white/20 uppercase tracking-wider font-medium">Brands</span>
        <BrandPill brandKey="feelHome" />
        <BrandPill brandKey="mInvest" />
        <BrandPill brandKey="expats" />
      </div>
      <span className="text-[10px] text-white/15 font-medium tracking-wide">
        Expense active when ≥1 linked brand is ON · Amounts in MAD · Commissions = 25%
      </span>
    </footer>
  );
}
