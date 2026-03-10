'use client';

import BrandPill from '@/components/ui/BrandPill';

export default function Footer() {
  return (
    <footer className="flex items-center justify-between px-6 py-3 border-t border-white/5 text-[11px] text-white/30">
      <div className="flex items-center gap-3">
        <span>Legend:</span>
        <BrandPill brandKey="feelHome" />
        <BrandPill brandKey="mInvest" />
        <BrandPill brandKey="expats" />
      </div>
      <span>
        Expense active when &ge;1 linked brand is ON &middot; Amounts in MAD &middot; Agent commissions = 25%
      </span>
    </footer>
  );
}
