'use client';

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { BrandKey, ExpenseItem, YearlyFinancials, MonthlySnapshot, SaleRevenueItem, RentalRevenueItem, MediaRevenueItem } from '@/types';
import { defaultSaleRevenues, defaultRentalRevenues, defaultMediaRevenues } from '@/data/revenues';
import { defaultExpenses } from '@/data/expenses';
import {
  calcYearlyFinancials,
  calcMonthlyFinancials,
  calcRevenueByBrand,
  calcExpensesByCategory,
  calcInvestmentSimulation,
  recalcSaleItem,
  recalcRentalItem,
  recalcMediaItem,
} from '@/lib/calculations';

export type MarketKey = 'casablanca' | 'rabat' | 'marrakech' | 'autre';

interface FinancialState {
  activeBrands: Record<BrandKey, boolean>;
  toggleBrand: (brand: BrandKey) => void;
  activeMarkets: Record<MarketKey, boolean>;
  toggleMarket: (market: MarketKey) => void;
  yearly: [YearlyFinancials, YearlyFinancials, YearlyFinancials];
  monthly: ReturnType<typeof calcMonthlyFinancials>;
  revenueByBrand: { y1: Record<BrandKey, number>; y2: Record<BrandKey, number>; y3: Record<BrandKey, number> };
  expensesByCategory: { y1: Record<string, number>; y2: Record<string, number>; y3: Record<string, number> };
  // Revenue data (editable)
  saleRevenues: SaleRevenueItem[];
  rentalRevenues: RentalRevenueItem[];
  mediaRevenues: MediaRevenueItem[];
  updateSaleItem: (index: number, field: string, value: number) => void;
  updateRentalItem: (index: number, field: string, value: number) => void;
  updateMediaItem: (index: number, field: string, value: number) => void;
  // Expense data (editable)
  expenseItems: ExpenseItem[];
  updateExpenseItem: (index: number, field: string, value: number) => void;
  // Investment simulation
  investment: number;
  setInvestment: (v: number) => void;
  growthBoost: number;
  setGrowthBoost: (v: number) => void;
  simulation: {
    snapshots: MonthlySnapshot[];
    breakEvenMonth: number;
    roi: number;
    finalCash: number;
  };
}

const FinancialContext = createContext<FinancialState | null>(null);

const STORAGE_KEY = 'feelhome-financial';

function loadState<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}-${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveState(key: string, value: unknown) {
  try { localStorage.setItem(`${STORAGE_KEY}-${key}`, JSON.stringify(value)); } catch {}
}

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const [activeBrands, setActiveBrands] = useState<Record<BrandKey, boolean>>(() =>
    loadState('activeBrands', { feelHome: true, mInvest: true, expats: true })
  );

  const [saleRevenues, setSaleRevenues] = useState<SaleRevenueItem[]>(() =>
    loadState('saleRevenues', defaultSaleRevenues)
  );
  const [rentalRevenues, setRentalRevenues] = useState<RentalRevenueItem[]>(() =>
    loadState('rentalRevenues', defaultRentalRevenues)
  );
  const [mediaRevenues, setMediaRevenues] = useState<MediaRevenueItem[]>(() =>
    loadState('mediaRevenues', defaultMediaRevenues)
  );
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>(() =>
    loadState('expenseItems', defaultExpenses)
  );

  const [activeMarkets, setActiveMarkets] = useState<Record<MarketKey, boolean>>(() =>
    loadState('activeMarkets', { casablanca: true, rabat: true, marrakech: true, autre: true })
  );

  const toggleMarket = (market: MarketKey) => {
    setActiveMarkets((prev) => ({ ...prev, [market]: !prev[market] }));
  };

  const [investment, setInvestment] = useState(() => loadState('investment', 500000));
  const [growthBoost, setGrowthBoost] = useState(() => loadState('growthBoost', 0));

  // Persist all editable state to localStorage
  useEffect(() => { saveState('activeBrands', activeBrands); }, [activeBrands]);
  useEffect(() => { saveState('activeMarkets', activeMarkets); }, [activeMarkets]);
  useEffect(() => { saveState('saleRevenues', saleRevenues); }, [saleRevenues]);
  useEffect(() => { saveState('rentalRevenues', rentalRevenues); }, [rentalRevenues]);
  useEffect(() => { saveState('mediaRevenues', mediaRevenues); }, [mediaRevenues]);
  useEffect(() => { saveState('expenseItems', expenseItems); }, [expenseItems]);
  useEffect(() => { saveState('investment', investment); }, [investment]);
  useEffect(() => { saveState('growthBoost', growthBoost); }, [growthBoost]);

  const toggleBrand = (brand: BrandKey) => {
    setActiveBrands((prev) => ({ ...prev, [brand]: !prev[brand] }));
  };

  const updateSaleItem = useCallback((index: number, field: string, value: number) => {
    setSaleRevenues((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      if (field === 'priceM2') item.priceM2 = value;
      else if (field === 'area') item.area = value;
      else if (field === 'commRate') item.commRate = value;
      else if (field === 'y1.conv') item.y1 = { ...item.y1, conv: value };
      else if (field === 'y2.conv') item.y2 = { ...item.y2, conv: value };
      else if (field === 'y3.conv') item.y3 = { ...item.y3, conv: value };
      updated[index] = recalcSaleItem(item);
      return updated;
    });
  }, []);

  const updateRentalItem = useCallback((index: number, field: string, value: number) => {
    setRentalRevenues((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      if (field === 'rent') item.rent = value;
      else if (field === 'commFactor') item.commFactor = value;
      else if (field === 'y1.conv') item.y1 = { ...item.y1, conv: value };
      else if (field === 'y2.conv') item.y2 = { ...item.y2, conv: value };
      else if (field === 'y3.conv') item.y3 = { ...item.y3, conv: value };
      updated[index] = recalcRentalItem(item);
      return updated;
    });
  }, []);

  const updateMediaItem = useCallback((index: number, field: string, value: number) => {
    setMediaRevenues((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      if (field === 'unitPrice') item.unitPrice = value;
      else if (field === 'y1.conv') item.y1 = { ...item.y1, conv: value };
      else if (field === 'y2.conv') item.y2 = { ...item.y2, conv: value };
      else if (field === 'y3.conv') item.y3 = { ...item.y3, conv: value };
      updated[index] = recalcMediaItem(item);
      return updated;
    });
  }, []);

  const updateExpenseItem = useCallback((index: number, field: string, value: number) => {
    setExpenseItems((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      if (field === 'y1') item.y1 = value;
      else if (field === 'y2') item.y2 = value;
      else if (field === 'y3') item.y3 = value;
      else if (field === 'variableCost') item.variableCost = value;
      updated[index] = item;
      return updated;
    });
  }, []);

  const yearly = useMemo(
    () =>
      (['y1', 'y2', 'y3'] as const).map((y) =>
        calcYearlyFinancials(activeBrands, y, saleRevenues, rentalRevenues, mediaRevenues, expenseItems, activeMarkets)
      ) as [YearlyFinancials, YearlyFinancials, YearlyFinancials],
    [activeBrands, activeMarkets, saleRevenues, rentalRevenues, mediaRevenues, expenseItems]
  );

  const monthly = useMemo(
    () => calcMonthlyFinancials(activeBrands, saleRevenues, rentalRevenues, mediaRevenues, expenseItems, activeMarkets),
    [activeBrands, activeMarkets, saleRevenues, rentalRevenues, mediaRevenues, expenseItems]
  );

  const revenueByBrand = useMemo(
    () => ({
      y1: calcRevenueByBrand(activeBrands, 'y1', saleRevenues, rentalRevenues, mediaRevenues, activeMarkets),
      y2: calcRevenueByBrand(activeBrands, 'y2', saleRevenues, rentalRevenues, mediaRevenues, activeMarkets),
      y3: calcRevenueByBrand(activeBrands, 'y3', saleRevenues, rentalRevenues, mediaRevenues, activeMarkets),
    }),
    [activeBrands, activeMarkets, saleRevenues, rentalRevenues, mediaRevenues]
  );

  const expensesByCategory = useMemo(
    () => ({
      y1: calcExpensesByCategory(activeBrands, 'y1', expenseItems),
      y2: calcExpensesByCategory(activeBrands, 'y2', expenseItems),
      y3: calcExpensesByCategory(activeBrands, 'y3', expenseItems),
    }),
    [activeBrands, expenseItems]
  );

  const simulation = useMemo(
    () => calcInvestmentSimulation(activeBrands, investment, growthBoost, saleRevenues, rentalRevenues, mediaRevenues, expenseItems, activeMarkets),
    [activeBrands, activeMarkets, investment, growthBoost, saleRevenues, rentalRevenues, mediaRevenues, expenseItems]
  );

  return (
    <FinancialContext.Provider
      value={{
        activeBrands,
        toggleBrand,
        activeMarkets,
        toggleMarket,
        yearly,
        monthly,
        revenueByBrand,
        expensesByCategory,
        saleRevenues,
        rentalRevenues,
        mediaRevenues,
        updateSaleItem,
        updateRentalItem,
        updateMediaItem,
        expenseItems,
        updateExpenseItem,
        investment,
        setInvestment,
        growthBoost,
        setGrowthBoost,
        simulation,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
}

export function useFinancial() {
  const ctx = useContext(FinancialContext);
  if (!ctx) throw new Error('useFinancial must be used within FinancialProvider');
  return ctx;
}
