'use client';

import { BrandKey } from '@/types';
import { brands } from '@/data/brands';

export default function BrandPill({ brandKey }: { brandKey: BrandKey }) {
  const brand = brands[brandKey];
  return (
    <span
      className="inline-flex items-center px-2 py-[2px] rounded-md text-[9px] font-bold tracking-wider uppercase"
      style={{
        backgroundColor: `${brand.color}12`,
        color: `${brand.color}cc`,
        border: `1px solid ${brand.color}20`,
      }}
    >
      {brand.shortName}
    </span>
  );
}
