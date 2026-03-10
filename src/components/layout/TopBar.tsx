'use client';

import { useFinancial } from '@/context/FinancialContext';
import { brands, brandKeys } from '@/data/brands';
import BrandAvatar from '@/components/ui/BrandAvatar';
import Toggle from '@/components/ui/Toggle';

export default function TopBar() {
  const { activeBrands, toggleBrand } = useFinancial();

  return (
    <div className="flex items-center gap-6 px-6 py-3 border-b border-white/5 bg-[#0a0c10]/60 backdrop-blur-xl">
      <span className="text-xs font-medium text-white/40 uppercase tracking-widest mr-2">
        Scenario
      </span>
      <div className="flex items-center gap-4">
        {brandKeys.map((key) => {
          const brand = brands[key];
          const active = activeBrands[key];
          return (
            <div
              key={key}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all duration-300 ${
                active
                  ? 'border-white/10 bg-white/[0.03]'
                  : 'border-white/5 bg-transparent opacity-50'
              }`}
            >
              <BrandAvatar brand={brand} size={28} />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white/80">{brand.name}</span>
                <span className="text-[10px] text-white/30">{brand.description}</span>
              </div>
              <Toggle
                checked={active}
                onChange={() => toggleBrand(key)}
                color={brand.color}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
