'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

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
