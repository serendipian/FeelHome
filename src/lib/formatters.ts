export function formatMAD(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M MAD`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K MAD`;
  }
  return `${value.toLocaleString('fr-FR')} MAD`;
}

export function formatCompact(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return value.toLocaleString('fr-FR');
}

export function formatNumber(value: number): string {
  return value.toLocaleString('fr-FR');
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
