'use client';

import React, { createContext, useContext, useState, useMemo } from 'react';
import { BrandKey, YearlyFinancials, MonthlySnapshot } from '@/types';
import {
  calcYearlyFinancials,
  calcMonthlyFinancials,
  calcRevenueByBrand,
  calcExpensesByCategory,
  calcInvestmentSimulation,
} from '@/lib/calculations';

interface FinancialState {
  activeBrands: Record<BrandKey, boolean>;
  toggleBrand: (brand: BrandKey) => void;
  yearly: [YearlyFinancials, YearlyFinancials, YearlyFinancials];
  monthly: ReturnType<typeof calcMonthlyFinancials>;
  revenueByBrand: { y1: Record<BrandKey, number>; y2: Record<BrandKey, number>; y3: Record<BrandKey, number> };
  expensesByCategory: { y1: Record<string, number>; y2: Record<string, number>; y3: Record<string, number> };
  // Investment simulation
  investment: number;
  setInvestment: (v: number) => void;
  founderSalary: number;
  setFounderSalary: (v: number) => void;
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

export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const [activeBrands, setActiveBrands] = useState<Record<BrandKey, boolean>>({
    feelHome: true,
    mInvest: true,
    expats: true,
  });

  const [investment, setInvestment] = useState(500000);
  const [founderSalary, setFounderSalary] = useState(15000);
  const [growthBoost, setGrowthBoost] = useState(0);

  const toggleBrand = (brand: BrandKey) => {
    setActiveBrands((prev) => ({ ...prev, [brand]: !prev[brand] }));
  };

  const yearly = useMemo(
    () =>
      (['y1', 'y2', 'y3'] as const).map((y) =>
        calcYearlyFinancials(activeBrands, y)
      ) as [YearlyFinancials, YearlyFinancials, YearlyFinancials],
    [activeBrands]
  );

  const monthly = useMemo(() => calcMonthlyFinancials(activeBrands), [activeBrands]);

  const revenueByBrand = useMemo(
    () => ({
      y1: calcRevenueByBrand(activeBrands, 'y1'),
      y2: calcRevenueByBrand(activeBrands, 'y2'),
      y3: calcRevenueByBrand(activeBrands, 'y3'),
    }),
    [activeBrands]
  );

  const expensesByCategory = useMemo(
    () => ({
      y1: calcExpensesByCategory(activeBrands, 'y1'),
      y2: calcExpensesByCategory(activeBrands, 'y2'),
      y3: calcExpensesByCategory(activeBrands, 'y3'),
    }),
    [activeBrands]
  );

  const simulation = useMemo(
    () => calcInvestmentSimulation(activeBrands, investment, founderSalary, growthBoost),
    [activeBrands, investment, founderSalary, growthBoost]
  );

  return (
    <FinancialContext.Provider
      value={{
        activeBrands,
        toggleBrand,
        yearly,
        monthly,
        revenueByBrand,
        expensesByCategory,
        investment,
        setInvestment,
        founderSalary,
        setFounderSalary,
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
