'use client';

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
import { loadFromSupabase, saveToSupabase, ensureMigrated } from '@/lib/supabase';

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

// Reorder loaded array to match the code-defined default order (by label).
// Preserves user-edited values but enforces the order from defaults.
function reorderByLabel<T extends { label: string }>(loaded: T[], defaults: T[]): T[] {
  const byLabel = new Map(loaded.map(item => [item.label, item]));
  return defaults.map(d => byLabel.get(d.label) ?? d);
}

// Debounced save to Supabase (500ms delay to batch rapid edits)
const supabaseTimers: Record<string, ReturnType<typeof setTimeout>> = {};
function debouncedSave(key: string, value: unknown) {
  clearTimeout(supabaseTimers[key]);
  supabaseTimers[key] = setTimeout(() => { saveToSupabase(key, value); }, 500);
}

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const [activeBrands, setActiveBrands] = useState<Record<BrandKey, boolean>>(
    { feelHome: true, mInvest: true, expats: true }
  );

  const [saleRevenues, setSaleRevenues] = useState<SaleRevenueItem[]>(defaultSaleRevenues);
  const [rentalRevenues, setRentalRevenues] = useState<RentalRevenueItem[]>(defaultRentalRevenues);
  const [mediaRevenues, setMediaRevenues] = useState<MediaRevenueItem[]>(defaultMediaRevenues);
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>(defaultExpenses);

  const [activeMarkets, setActiveMarkets] = useState<Record<MarketKey, boolean>>(
    { casablanca: true, rabat: true, marrakech: true, autre: true }
  );

  const toggleMarket = (market: MarketKey) => {
    setActiveMarkets((prev) => ({ ...prev, [market]: !prev[market] }));
  };

  const [investment, setInvestment] = useState(500000);
  const [growthBoost, setGrowthBoost] = useState(0);

  // Load from Supabase on mount, then enable persistence
  const readyToSave = useRef(false);
  const didHydrate = useRef(false);
  useEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;
    (async () => {
      await ensureMigrated();
      const [ab, am, sr, rr, mr, ei, inv, gb] = await Promise.all([
        loadFromSupabase<Record<BrandKey, boolean>>('activeBrands', activeBrands),
        loadFromSupabase<Record<MarketKey, boolean>>('activeMarkets', activeMarkets),
        loadFromSupabase<SaleRevenueItem[]>('saleRevenues', saleRevenues),
        loadFromSupabase<RentalRevenueItem[]>('rentalRevenues', rentalRevenues),
        loadFromSupabase<MediaRevenueItem[]>('mediaRevenues', mediaRevenues),
        loadFromSupabase<ExpenseItem[]>('expenseItems', expenseItems),
        loadFromSupabase<number>('investment', investment),
        loadFromSupabase<number>('growthBoost', growthBoost),
      ]);
      setActiveBrands(ab);
      setActiveMarkets(am);
      setSaleRevenues(reorderByLabel(sr, defaultSaleRevenues));
      setRentalRevenues(reorderByLabel(rr, defaultRentalRevenues));
      setMediaRevenues(reorderByLabel(mr, defaultMediaRevenues));
      setExpenseItems(reorderByLabel(ei, defaultExpenses));
      setInvestment(inv);
      setGrowthBoost(gb);
      // Enable saving only AFTER hydration is fully applied
      // Use setTimeout to skip the render triggered by the setters above
      setTimeout(() => { readyToSave.current = true; }, 0);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to Supabase (debounced) — only after hydration completes
  useEffect(() => { if (readyToSave.current) debouncedSave('activeBrands', activeBrands); }, [activeBrands]);
  useEffect(() => { if (readyToSave.current) debouncedSave('activeMarkets', activeMarkets); }, [activeMarkets]);
  useEffect(() => { if (readyToSave.current) debouncedSave('saleRevenues', saleRevenues); }, [saleRevenues]);
  useEffect(() => { if (readyToSave.current) debouncedSave('rentalRevenues', rentalRevenues); }, [rentalRevenues]);
  useEffect(() => { if (readyToSave.current) debouncedSave('mediaRevenues', mediaRevenues); }, [mediaRevenues]);
  useEffect(() => { if (readyToSave.current) debouncedSave('expenseItems', expenseItems); }, [expenseItems]);
  useEffect(() => { if (readyToSave.current) debouncedSave('investment', investment); }, [investment]);
  useEffect(() => { if (readyToSave.current) debouncedSave('growthBoost', growthBoost); }, [growthBoost]);

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
