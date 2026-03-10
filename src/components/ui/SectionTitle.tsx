'use client';

export default function SectionTitle({
  title,
  color = '#d4a853',
}: {
  title: string;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-1 h-6 rounded-full" style={{ backgroundColor: color }} />
      <h2 className="text-lg font-semibold text-white/90">{title}</h2>
    </div>
  );
}
