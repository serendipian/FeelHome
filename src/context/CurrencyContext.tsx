'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { formatMAD as _formatMAD, formatCompact as _formatCompact, formatNumber } from '@/lib/formatters';

export type Currency = 'MAD' | 'USD';

interface CurrencyContextValue {
  currency: Currency;
  isUSD: boolean;
  toggleCurrency: () => void;
  /** Converts a MAD value to the active currency (divides by 10 for USD) */
  convert: (madValue: number) => number;
}

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: 'MAD',
  isUSD: false,
  toggleCurrency: () => {},
  convert: (v) => v,
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('MAD');

  useEffect(() => {
    const stored = localStorage.getItem('fh-currency') as Currency | null;
    if (stored === 'MAD' || stored === 'USD') {
      setCurrency(stored);
    }
  }, []);

  const toggleCurrency = useCallback(() => {
    setCurrency((prev) => {
      const next = prev === 'MAD' ? 'USD' : 'MAD';
      localStorage.setItem('fh-currency', next);
      return next;
    });
  }, []);

  const isUSD = currency === 'USD';
  const convert = useCallback((madValue: number) => isUSD ? madValue / 10 : madValue, [isUSD]);

  return (
    <CurrencyContext.Provider value={{ currency, isUSD, toggleCurrency, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);

/** Pre-bound formatters that auto-apply currency conversion */
export function useCurrencyFormatters() {
  const { currency, convert } = useCurrency();
  return useMemo(() => ({
    /** Format with currency label (e.g. "1.5M MAD" or "150K USD") */
    fMAD: (v: number) => _formatMAD(v, currency),
    /** Format compact with conversion (e.g. "1.5M" or "150K") */
    fCompact: (v: number) => _formatCompact(v, currency),
    /** Format a monetary value with currency conversion (no label) */
    fNum: (v: number) => formatNumber(convert(v)),
    convert,
    currency,
  }), [currency, convert]);
}
