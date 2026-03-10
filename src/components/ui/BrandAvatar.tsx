'use client';

import { Brand } from '@/types';

export default function BrandAvatar({ brand, size = 32 }: { brand: Brand; size?: number }) {
  if (brand.logo) {
    return (
      <img
        src={brand.logo}
        alt={brand.name}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${brand.color}, ${brand.color}88)`,
        fontSize: size * 0.4,
      }}
    >
      {brand.initials}
    </div>
  );
}
