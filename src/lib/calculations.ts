import { BrandKey, ExpenseItem, YearlyFinancials, MonthlySnapshot } from '@/types';
import { saleRevenues, rentalRevenues, mediaRevenues } from '@/data/revenues';
import { expenses } from '@/data/expenses';

type Year = 'y1' | 'y2' | 'y3';

export function calcRevenue(activeBrands: Record<BrandKey, boolean>, year: Year): number {
  let total = 0;

  if (activeBrands.mInvest) {
    total += saleRevenues.reduce((sum, item) => sum + item[year].total, 0);
  }
  if (activeBrands.feelHome) {
    total += rentalRevenues.reduce((sum, item) => sum + item[year].total, 0);
  }
  if (activeBrands.expats) {
    total += mediaRevenues.reduce((sum, item) => sum + item[year].total, 0);
  }

  return total;
}

export function calcRevenueByBrand(activeBrands: Record<BrandKey, boolean>, year: Year) {
  return {
    feelHome: activeBrands.feelHome
      ? rentalRevenues.reduce((sum, item) => sum + item[year].total, 0)
      : 0,
    mInvest: activeBrands.mInvest
      ? saleRevenues.reduce((sum, item) => sum + item[year].total, 0)
      : 0,
    expats: activeBrands.expats
      ? mediaRevenues.reduce((sum, item) => sum + item[year].total, 0)
      : 0,
  };
}

export function isExpenseActive(expense: ExpenseItem, activeBrands: Record<BrandKey, boolean>): boolean {
  return expense.brands.some((brand) => activeBrands[brand]);
}

export function calcExpenses(activeBrands: Record<BrandKey, boolean>, year: Year): number {
  return expenses
    .filter((exp) => isExpenseActive(exp, activeBrands))
    .reduce((sum, exp) => sum + exp[year], 0);
}

export function calcExpensesByCategory(activeBrands: Record<BrandKey, boolean>, year: Year) {
  const active = expenses.filter((exp) => isExpenseActive(exp, activeBrands));
  return {
    salaries: active.filter((e) => e.category === 'salaries').reduce((s, e) => s + e[year], 0),
    fixed: active.filter((e) => e.category === 'fixed').reduce((s, e) => s + e[year], 0),
    marketing: active.filter((e) => e.category === 'marketing').reduce((s, e) => s + e[year], 0),
  };
}

export function calcYearlyFinancials(
  activeBrands: Record<BrandKey, boolean>,
  year: Year
): YearlyFinancials {
  const revenue = calcRevenue(activeBrands, year);
  const commissions = revenue * 0.25;
  const expensesTotal = calcExpenses(activeBrands, year);
  const profit = revenue - commissions - expensesTotal;

  return {
    revenue: revenue * 12,
    commissions: commissions * 12,
    expenses: expensesTotal * 12,
    profit: profit * 12,
  };
}

export function calcMonthlyFinancials(activeBrands: Record<BrandKey, boolean>) {
  const years: Year[] = ['y1', 'y2', 'y3'];
  return years.map((year) => {
    const revenue = calcRevenue(activeBrands, year);
    const commissions = revenue * 0.25;
    const expensesTotal = calcExpenses(activeBrands, year);
    const profit = revenue - commissions - expensesTotal;
    return { revenue, commissions, expenses: expensesTotal, profit };
  });
}

export function calcInvestmentSimulation(
  activeBrands: Record<BrandKey, boolean>,
  investment: number,
  founderSalary: number,
  growthBoost: number
): { snapshots: MonthlySnapshot[]; breakEvenMonth: number; roi: number; finalCash: number } {
  const snapshots: MonthlySnapshot[] = [];
  let cumulative = 0;
  let breakEvenMonth = -1;

  for (let month = 1; month <= 36; month++) {
    const yearIndex = month <= 12 ? 0 : month <= 24 ? 1 : 2;
    const year: Year = (['y1', 'y2', 'y3'] as const)[yearIndex];

    const revenue = calcRevenue(activeBrands, year) * (1 + growthBoost);
    const commissions = revenue * 0.25;
    const expensesTotal = calcExpenses(activeBrands, year) + founderSalary;
    const profit = revenue - commissions - expensesTotal;

    cumulative += profit;
    const balance = investment + cumulative;

    snapshots.push({
      month,
      revenue,
      expenses: expensesTotal + commissions,
      profit,
      cumulative,
      balance,
    });

    if (breakEvenMonth === -1 && cumulative >= 0) {
      breakEvenMonth = month;
    }
  }

  const finalCash = investment + cumulative;
  const roi = investment > 0 ? cumulative / investment : 0;

  return { snapshots, breakEvenMonth, roi, finalCash };
}
