'use client';

import { BrandKey } from '@/types';
import { brands } from '@/data/brands';

export default function BrandPill({ brandKey }: { brandKey: BrandKey }) {
  const brand = brands[brandKey];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide"
      style={{
        backgroundColor: `${brand.color}20`,
        color: brand.color,
        border: `1px solid ${brand.color}40`,
      }}
    >
      {brand.shortName}
    </span>
  );
}
