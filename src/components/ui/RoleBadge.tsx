'use client';

import { RoleId, ROLE_META } from '@/data/workflows';

interface RoleBadgeProps {
  roleId: RoleId;
  size?: number;
  showLabel?: boolean;
}

export default function RoleBadge({ roleId, size = 28, showLabel = true }: RoleBadgeProps) {
  const meta = ROLE_META[roleId];

  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-full flex items-center justify-center font-bold text-white shrink-0 transition-shadow duration-200"
        style={{
          width: size,
          height: size,
          background: `linear-gradient(135deg, ${meta.color}, ${meta.color}88)`,
          fontSize: size * 0.35,
          boxShadow: `0 0 0 2px ${meta.color}20`,
        }}
      >
        {meta.initials}
      </div>
      {showLabel && (
        <span
          className="text-xs font-medium whitespace-nowrap"
          style={{ color: meta.color }}
        >
          {meta.label}
        </span>
      )}
    </div>
  );
}
