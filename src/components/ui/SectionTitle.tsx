'use client';

export default function SectionTitle({
  title,
  subtitle,
  color = '#d4a853',
}: {
  title: string;
  subtitle?: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div
        className="w-1 h-7 rounded-full"
        style={{
          background: `linear-gradient(to bottom, ${color}, ${color}40)`,
          boxShadow: `0 0 12px ${color}20`,
        }}
      />
      <div>
        <h2 className="text-lg font-semibold text-white/90 tracking-tight">{title}</h2>
        {subtitle && <p className="text-[11px] text-white/30 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
