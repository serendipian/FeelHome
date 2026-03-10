import { BrandKey, ExpenseItem, SaleRevenueItem, RentalRevenueItem, MediaRevenueItem, YearlyFinancials, MonthlySnapshot } from '@/types';

type Year = 'y1' | 'y2' | 'y3';

export function recalcSaleItem(item: SaleRevenueItem): SaleRevenueItem {
  const avgPrice = item.priceM2 * item.area;
  const revPerConv = avgPrice * item.commRate;
  return {
    ...item,
    avgPrice,
    commRateLabel: `${(item.commRate * 100).toFixed(1)}%`,
    revPerConv,
    y1: { conv: item.y1.conv, total: item.y1.conv * revPerConv },
    y2: { conv: item.y2.conv, total: item.y2.conv * revPerConv },
    y3: { conv: item.y3.conv, total: item.y3.conv * revPerConv },
  };
}

export function recalcRentalItem(item: RentalRevenueItem): RentalRevenueItem {
  const revPerConv = item.rent * item.commFactor;
  return {
    ...item,
    commFactorLabel: `${item.commFactor} mo`,
    revPerConv,
    y1: { conv: item.y1.conv, total: item.y1.conv * revPerConv },
    y2: { conv: item.y2.conv, total: item.y2.conv * revPerConv },
    y3: { conv: item.y3.conv, total: item.y3.conv * revPerConv },
  };
}

export function recalcMediaItem(item: MediaRevenueItem): MediaRevenueItem {
  return {
    ...item,
    y1: { conv: item.y1.conv, total: item.y1.conv * item.unitPrice },
    y2: { conv: item.y2.conv, total: item.y2.conv * item.unitPrice },
    y3: { conv: item.y3.conv, total: item.y3.conv * item.unitPrice },
  };
}

export function calcRevenue(
  activeBrands: Record<BrandKey, boolean>,
  year: Year,
  sales: SaleRevenueItem[],
  rentals: RentalRevenueItem[],
  media: MediaRevenueItem[]
): number {
  let total = 0;
  if (activeBrands.mInvest) total += sales.reduce((s, i) => s + i[year].total, 0);
  if (activeBrands.feelHome) total += rentals.reduce((s, i) => s + i[year].total, 0);
  if (activeBrands.expats) total += media.reduce((s, i) => s + i[year].total, 0);
  return total;
}

export function calcRevenueByBrand(
  activeBrands: Record<BrandKey, boolean>,
  year: Year,
  sales: SaleRevenueItem[],
  rentals: RentalRevenueItem[],
  media: MediaRevenueItem[]
) {
  return {
    feelHome: activeBrands.feelHome ? rentals.reduce((s, i) => s + i[year].total, 0) : 0,
    mInvest: activeBrands.mInvest ? sales.reduce((s, i) => s + i[year].total, 0) : 0,
    expats: activeBrands.expats ? media.reduce((s, i) => s + i[year].total, 0) : 0,
  };
}

export function isExpenseActive(expense: ExpenseItem, activeBrands: Record<BrandKey, boolean>): boolean {
  return expense.brands.some((brand) => activeBrands[brand]);
}

export function calcExpenses(activeBrands: Record<BrandKey, boolean>, year: Year, expenseItems: ExpenseItem[]): number {
  return expenseItems.filter((exp) => isExpenseActive(exp, activeBrands)).reduce((sum, exp) => sum + exp[year], 0);
}

export function calcExpensesByCategory(activeBrands: Record<BrandKey, boolean>, year: Year, expenseItems: ExpenseItem[]) {
  const active = expenseItems.filter((exp) => isExpenseActive(exp, activeBrands));
  return {
    salaries: active.filter((e) => e.category === 'salaries').reduce((s, e) => s + e[year], 0),
    fixed: active.filter((e) => e.category === 'fixed').reduce((s, e) => s + e[year], 0),
    marketing: active.filter((e) => e.category === 'marketing').reduce((s, e) => s + e[year], 0),
  };
}

export function calcYearlyFinancials(
  activeBrands: Record<BrandKey, boolean>,
  year: Year,
  sales: SaleRevenueItem[],
  rentals: RentalRevenueItem[],
  media: MediaRevenueItem[],
  expenseItems: ExpenseItem[]
): YearlyFinancials {
  const revenue = calcRevenue(activeBrands, year, sales, rentals, media);
  const commissions = revenue * 0.25;
  const expensesTotal = calcExpenses(activeBrands, year, expenseItems);
  const profit = revenue - commissions - expensesTotal;
  return { revenue: revenue * 12, commissions: commissions * 12, expenses: expensesTotal * 12, profit: profit * 12 };
}

export function calcMonthlyFinancials(
  activeBrands: Record<BrandKey, boolean>,
  sales: SaleRevenueItem[],
  rentals: RentalRevenueItem[],
  media: MediaRevenueItem[],
  expenseItems: ExpenseItem[]
) {
  return (['y1', 'y2', 'y3'] as const).map((year) => {
    const revenue = calcRevenue(activeBrands, year, sales, rentals, media);
    const commissions = revenue * 0.25;
    const expensesTotal = calcExpenses(activeBrands, year, expenseItems);
    const profit = revenue - commissions - expensesTotal;
    return { revenue, commissions, expenses: expensesTotal, profit };
  });
}

export function calcInvestmentSimulation(
  activeBrands: Record<BrandKey, boolean>,
  investment: number,
  founderSalary: number,
  growthBoost: number,
  sales: SaleRevenueItem[],
  rentals: RentalRevenueItem[],
  media: MediaRevenueItem[],
  expenseItems: ExpenseItem[]
): { snapshots: MonthlySnapshot[]; breakEvenMonth: number; roi: number; finalCash: number } {
  const snapshots: MonthlySnapshot[] = [];
  let cumulative = 0;
  let breakEvenMonth = -1;

  for (let month = 1; month <= 36; month++) {
    const yearIndex = month <= 12 ? 0 : month <= 24 ? 1 : 2;
    const year = (['y1', 'y2', 'y3'] as const)[yearIndex];

    const revenue = calcRevenue(activeBrands, year, sales, rentals, media) * (1 + growthBoost);
    const commissions = revenue * 0.25;
    const expensesTotal = calcExpenses(activeBrands, year, expenseItems) + founderSalary;
    const profit = revenue - commissions - expensesTotal;

    cumulative += profit;
    const balance = investment + cumulative;

    snapshots.push({ month, revenue, expenses: expensesTotal + commissions, profit, cumulative, balance });

    if (breakEvenMonth === -1 && cumulative >= 0) breakEvenMonth = month;
  }

  const finalCash = investment + cumulative;
  const roi = investment > 0 ? cumulative / investment : 0;
  return { snapshots, breakEvenMonth, roi, finalCash };
}
