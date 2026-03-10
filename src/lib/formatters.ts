import type { Currency } from '@/context/CurrencyContext';

export function formatMAD(value: number, currency: Currency = 'MAD'): string {
  const v = currency === 'USD' ? value / 10 : value;
  const label = currency === 'USD' ? 'USD' : 'MAD';
  if (Math.abs(v) >= 1_000_000) {
    return `${(v / 1_000_000).toFixed(1)}M ${label}`;
  }
  if (Math.abs(v) >= 1_000) {
    return `${(v / 1_000).toFixed(0)}K ${label}`;
  }
  return `${v.toLocaleString('fr-FR')} ${label}`;
}

export function formatCompact(value: number, currency: Currency = 'MAD'): string {
  const v = currency === 'USD' ? value / 10 : value;
  if (Math.abs(v) >= 1_000_000) {
    return `${(v / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(v) >= 1_000) {
    return `${(v / 1_000).toFixed(0)}K`;
  }
  return v.toLocaleString('fr-FR');
}

export function formatNumber(value: number): string {
  return value.toLocaleString('fr-FR');
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
