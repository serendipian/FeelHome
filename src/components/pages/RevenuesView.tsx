'use client';

import React from 'react';
import { useFinancial } from '@/context/FinancialContext';
import { formatNumber } from '@/lib/formatters';
import { useCurrencyFormatters } from '@/context/CurrencyContext';
import { brands } from '@/data/brands';
import BrandAvatar from '@/components/ui/BrandAvatar';
import TotalBar from '@/components/ui/TotalBar';
import EditableCell from '@/components/ui/EditableCell';

function YearTag({ year, color }: { year: number; color: string }) {
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  return (
    <span
      className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
      style={{ color, background: `rgba(${r},${g},${b},0.1)`, border: `1px solid rgba(${r},${g},${b},0.2)` }}
    >
      Year {year}
    </span>
  );
}

export default function RevenuesView() {
  const {
    activeBrands,
    activeMarkets,
    yearly,
    saleRevenues,
    rentalRevenues,
    mediaRevenues,
    updateSaleItem,
    updateRentalItem,
    updateMediaItem,
  } = useFinancial();

  const { fNum } = useCurrencyFormatters();

  const isMarketActive = (label: string) => {
    const key = label.toLowerCase() as keyof typeof activeMarkets;
    return activeMarkets[key] !== false;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Feel Home */}
      {activeBrands.feelHome && (() => {
        return (
          <div className="space-y-3">
            {/* Brand Header with year tags */}
            <div className="flex gap-3 items-end">
              <div className="w-1/2 flex items-center gap-4 px-1 pb-1">
                <BrandAvatar brand={brands.feelHome} size={24} />
                <div>
                  <span className="text-[14px] font-semibold text-white/90">{brands.feelHome.name}</span>
                </div>
              </div>
              <div className="w-1/2 flex gap-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex-1 text-center">
                    <YearTag year={n} color="#d4875a" />
                  </div>
                ))}
              </div>
            </div>

            {/* 4 cards */}
            <div className="flex gap-3 items-stretch">
              <div className="card overflow-hidden w-1/2">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                      <th className="px-4 py-2.5 text-[10px] font-semibold text-white/40 text-left uppercase tracking-wider whitespace-nowrap">City</th>
                      <th className="px-3 py-2.5 text-[10px] font-semibold text-white/40 text-right uppercase tracking-wider whitespace-nowrap">Rent/Mo</th>
                      <th className="px-3 py-2.5 text-[10px] font-semibold text-white/40 text-right uppercase tracking-wider whitespace-nowrap">Commission</th>
                      <th className="px-3 py-2.5 text-[10px] font-semibold text-white/40 text-right uppercase tracking-wider whitespace-nowrap">Rev/Conv</th>
                    </tr>
                  </thead>
                  <tbody className="zebra-rows">
                    {rentalRevenues.map((item, idx) => {
                      const active = isMarketActive(item.label);
                      return (
                      <tr key={item.label} className={`border-b border-white/[0.02] transition-colors ${active ? 'hover:!bg-white/[0.04]' : 'opacity-25'}`}>
                        <td className="px-4 py-2.5 text-white/60 font-medium whitespace-nowrap">{item.label}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-white/40">
                          <EditableCell value={item.rent} onSave={(v) => updateRentalItem(idx, 'rent', v)} format={fNum} />
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-white/40">
                          <EditableCell value={item.commFactor} onSave={(v) => updateRentalItem(idx, 'commFactor', v)} format={(v) => `${v} mo`} step={0.1} />
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-[#d4875a] font-semibold whitespace-nowrap">{fNum(item.revPerConv)}</td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="w-1/2 flex gap-3">
                {(['y1', 'y2', 'y3'] as const).map((y) => (
                  <div key={y} className="card overflow-hidden flex-1 min-w-0">
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                          <th className="px-3 py-2.5 text-[9px] font-semibold text-white/35 text-center uppercase tracking-wider">Conv.</th>
                          <th className="px-3 py-2.5 text-[9px] font-semibold text-white/35 text-center uppercase tracking-wider">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="zebra-rows">
                        {rentalRevenues.map((item, idx) => {
                          const active = isMarketActive(item.label);
                          return (
                          <tr key={item.label} className={`border-b border-white/[0.02] transition-colors ${active ? 'hover:!bg-white/[0.04]' : 'opacity-25'}`}>
                            <td className="px-3 py-2.5 text-center font-mono text-white/40">
                              <EditableCell value={item[y].conv} onSave={(v) => updateRentalItem(idx, `${y}.conv`, v)} format={(v) => String(v)} />
                            </td>
                            <td className="px-3 py-2.5 text-center font-mono text-white/70 font-medium whitespace-nowrap">
                              {item[y].total > 0 ? fNum(item[y].total) : <span className="text-white/15">—</span>}
                            </td>
                          </tr>
                          );
                        })}
                        <tr className="border-t border-white/[0.06]">
                          <td className="px-3 py-3" />
                          <td className="px-3 py-3 text-center font-mono text-[13px] font-bold text-[#d4875a] whitespace-nowrap">
                            {fNum(rentalRevenues.filter(r => isMarketActive(r.label)).reduce((s, r) => s + r[y].total, 0))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* M Invest */}
      {activeBrands.mInvest && (() => {
        return (
          <div className="space-y-3">
            {/* Brand Header with year tags aligned above year cards */}
            <div className="flex gap-3 items-end">
              <div className="w-1/2 flex items-center gap-4 px-1 pb-1">
                <BrandAvatar brand={brands.mInvest} size={24} />
                <div>
                  <span className="text-[14px] font-semibold text-white/90">{brands.mInvest.name}</span>
                </div>
              </div>
              <div className="w-1/2 flex gap-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex-1 text-center">
                    <YearTag year={n} color="#5b8ec9" />
                  </div>
                ))}
              </div>
            </div>

            {/* 4 cards */}
            <div className="flex gap-3 items-stretch">
              <div className="card overflow-hidden w-1/2">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                      <th className="px-4 py-2.5 text-[10px] font-semibold text-white/40 text-left uppercase tracking-wider whitespace-nowrap">City</th>
                      <th className="px-3 py-2.5 text-[10px] font-semibold text-white/40 text-right uppercase tracking-wider whitespace-nowrap">Price/m²</th>
                      <th className="px-3 py-2.5 text-[10px] font-semibold text-white/40 text-right uppercase tracking-wider whitespace-nowrap">Area</th>
                      <th className="px-3 py-2.5 text-[10px] font-semibold text-white/40 text-right uppercase tracking-wider whitespace-nowrap">Avg Price</th>
                      <th className="px-3 py-2.5 text-[10px] font-semibold text-white/40 text-right uppercase tracking-wider whitespace-nowrap">Comm.</th>
                      <th className="px-3 py-2.5 text-[10px] font-semibold text-white/40 text-right uppercase tracking-wider whitespace-nowrap">Rev/Conv</th>
                    </tr>
                  </thead>
                  <tbody className="zebra-rows">
                    {saleRevenues.map((item, idx) => {
                      const active = isMarketActive(item.label);
                      return (
                      <tr key={item.label} className={`border-b border-white/[0.02] transition-colors ${active ? 'hover:!bg-white/[0.04]' : 'opacity-25'}`}>
                        <td className="px-4 py-2.5 text-white/60 font-medium whitespace-nowrap">{item.label}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-white/40">
                          <EditableCell value={item.priceM2} onSave={(v) => updateSaleItem(idx, 'priceM2', v)} format={fNum} />
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-white/40">
                          <EditableCell value={item.area} onSave={(v) => updateSaleItem(idx, 'area', v)} format={(v) => `${v}m²`} />
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-white/25 whitespace-nowrap">{fNum(item.avgPrice)}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-white/40">
                          <EditableCell value={item.commRate} onSave={(v) => updateSaleItem(idx, 'commRate', v)} isPercent format={(v) => `${(v * 100).toFixed(1)}%`} step={0.1} />
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-[#5b8ec9] font-semibold whitespace-nowrap">{fNum(item.revPerConv)}</td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="w-1/2 flex gap-3">
                {(['y1', 'y2', 'y3'] as const).map((y) => (
                  <div key={y} className="card overflow-hidden flex-1 min-w-0">
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                          <th className="px-3 py-2.5 text-[9px] font-semibold text-white/35 text-center uppercase tracking-wider">Conv.</th>
                          <th className="px-3 py-2.5 text-[9px] font-semibold text-white/35 text-center uppercase tracking-wider">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="zebra-rows">
                        {saleRevenues.map((item, idx) => {
                          const active = isMarketActive(item.label);
                          return (
                          <tr key={item.label} className={`border-b border-white/[0.02] transition-colors ${active ? 'hover:!bg-white/[0.04]' : 'opacity-25'}`}>
                            <td className="px-3 py-2.5 text-center font-mono text-white/40">
                              <EditableCell value={item[y].conv} onSave={(v) => updateSaleItem(idx, `${y}.conv`, v)} format={(v) => String(v)} />
                            </td>
                            <td className="px-3 py-2.5 text-center font-mono text-white/70 font-medium whitespace-nowrap">
                              {item[y].total > 0 ? fNum(item[y].total) : <span className="text-white/15">—</span>}
                            </td>
                          </tr>
                          );
                        })}
                        <tr className="border-t border-white/[0.06]">
                          <td className="px-3 py-3" />
                          <td className="px-3 py-3 text-center font-mono text-[13px] font-bold text-[#5b8ec9] whitespace-nowrap">
                            {fNum(saleRevenues.filter(r => isMarketActive(r.label)).reduce((s, r) => s + r[y].total, 0))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Expats.ma */}
      {activeBrands.expats && (() => {
        return (
          <div className="space-y-3">
            {/* Brand Header with year tags */}
            <div className="flex gap-3 items-end">
              <div className="w-1/2 flex items-center gap-4 px-1 pb-1">
                <BrandAvatar brand={brands.expats} size={24} />
                <div>
                  <span className="text-[14px] font-semibold text-white/90">{brands.expats.name}</span>
                </div>
              </div>
              <div className="w-1/2 flex gap-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex-1 text-center">
                    <YearTag year={n} color="#1d7ff3" />
                  </div>
                ))}
              </div>
            </div>

            {/* 4 cards */}
            <div className="flex gap-3 items-stretch">
              <div className="card overflow-hidden w-1/2">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                      <th className="px-4 py-2.5 text-[10px] font-semibold text-white/40 text-left uppercase tracking-wider whitespace-nowrap">Source</th>
                      <th className="px-3 py-2.5 text-[10px] font-semibold text-white/40 text-right uppercase tracking-wider whitespace-nowrap">Unit Price</th>
                    </tr>
                  </thead>
                  <tbody className="zebra-rows">
                    {mediaRevenues.map((item, idx) => (
                      <tr key={item.label} className="border-b border-white/[0.02] hover:!bg-white/[0.04] transition-colors">
                        <td className="px-4 py-2.5 text-white/60 font-medium whitespace-nowrap">{item.label}</td>
                        <td className="px-3 py-2.5 text-right font-mono text-[#1d7ff3] font-semibold">
                          <EditableCell value={item.unitPrice} onSave={(v) => updateMediaItem(idx, 'unitPrice', v)} format={fNum} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="w-1/2 flex gap-3">
                {(['y1', 'y2', 'y3'] as const).map((y) => (
                  <div key={y} className="card overflow-hidden flex-1 min-w-0">
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                          <th className="px-3 py-2.5 text-[9px] font-semibold text-white/35 text-center uppercase tracking-wider">Conv.</th>
                          <th className="px-3 py-2.5 text-[9px] font-semibold text-white/35 text-center uppercase tracking-wider">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="zebra-rows">
                        {mediaRevenues.map((item, idx) => (
                          <tr key={item.label} className="border-b border-white/[0.02] hover:!bg-white/[0.04] transition-colors">
                            <td className="px-3 py-2.5 text-center font-mono text-white/40">
                              <EditableCell value={item[y].conv} onSave={(v) => updateMediaItem(idx, `${y}.conv`, v)} format={(v) => String(v)} />
                            </td>
                            <td className="px-3 py-2.5 text-center font-mono text-white/70 font-medium whitespace-nowrap">
                              {item[y].total > 0 ? fNum(item[y].total) : <span className="text-white/15">—</span>}
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t border-white/[0.06]">
                          <td className="px-3 py-3" />
                          <td className="px-3 py-3 text-center font-mono text-[13px] font-bold text-[#1d7ff3] whitespace-nowrap">
                            {fNum(mediaRevenues.reduce((s, r) => s + r[y].total, 0))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      <TotalBar
        label="Total Monthly Revenue"
        values={[yearly[0].revenue / 12, yearly[1].revenue / 12, yearly[2].revenue / 12]}
        color="#d4a853"
      />
    </div>
  );
}
