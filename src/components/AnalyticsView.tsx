import React, { useState } from 'react';
import { DonutChart, CountryBarChart, PortfolioLineChart, TopPositionsHorizontalBar } from './charts/PortfolioCharts';
import { SECTOR_DATA, COUNTRY_DATA, TOP_5_POSITIONS } from '../data/initialData';
import { formatEUR } from '../utils/formatters';

export function AnalyticsView() {
  const [filterView, setFilterView] = useState<'sectores' | 'paises' | 'rentabilidad'>('sectores');
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  const multiYearEvolution = [
    { label: '2022', value: 145000 },
    { label: '2023', value: 172000 },
    { label: '2024', value: 210500 },
    { label: '2025', value: 232000 },
    { label: '2026', value: 248532.75 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Controls - Screen 7 */}
      <div className="bg-[#12233f] border border-slate-700/70 p-4 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <select
            value={filterView}
            onChange={e => setFilterView(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3.5 py-2 font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="sectores">Por sectores</option>
            <option value="paises">Por países</option>
            <option value="rentabilidad">Por rentabilidad</option>
          </select>

          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3.5 py-2 font-medium focus:outline-none focus:border-blue-500"
          >
            <option value="2026">Año: 2026</option>
            <option value="2025">Año: 2025</option>
            <option value="2024">Año: 2024</option>
          </select>
        </div>

        <div className="text-xs text-slate-400">
          Valor actual total: <span className="text-emerald-400 font-bold font-mono">248.532,75 €</span>
        </div>
      </div>

      {/* 4 Quadrants from Screen 7 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quadrant 1: Distribución por sectores */}
        <div className="bg-[#12233f] border border-slate-700/70 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white">Distribución por sectores</h3>
            <span className="text-xs text-slate-400 font-mono">100% Cartera</span>
          </div>
          <div className="py-2">
            <DonutChart sectors={SECTOR_DATA} centerTitle="Total" centerValue="248.533 €" size={175} />
          </div>
          <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-800 text-center">
            Mayor ponderación en <strong className="text-blue-400">Tecnología (38%)</strong> y defensivos en Salud/Consumo.
          </div>
        </div>

        {/* Quadrant 2: Rentabilidad por país */}
        <div className="bg-[#12233f] border border-slate-700/70 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white">Rentabilidad por país</h3>
            <span className="text-xs text-emerald-400 font-bold">+22,4% USA</span>
          </div>
          <CountryBarChart countries={COUNTRY_DATA} />
          <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-800 text-center">
            Ponderación global: USA (64%), España (14%), Alemania (12%), Otros (10%).
          </div>
        </div>

        {/* Quadrant 3: Evolución de la cartera (2022 - 2026) */}
        <div className="bg-[#12233f] border border-slate-700/70 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white">Evolución de la cartera</h3>
            <span className="text-xs text-slate-400">Histórico multianual</span>
          </div>
          <PortfolioLineChart data={multiYearEvolution} height={180} />
          <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-800 text-center">
            Crecimiento compuesto del capital desde 145.000 € en 2022 hasta 248.533 € en 2026.
          </div>
        </div>

        {/* Quadrant 4: Top 5 posiciones */}
        <div className="bg-[#12233f] border border-slate-700/70 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <h3 className="text-sm font-bold text-white">Top 5 posiciones</h3>
            <span className="text-xs text-slate-400">Por % peso total</span>
          </div>
          <TopPositionsHorizontalBar positions={TOP_5_POSITIONS} />
          <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-800 text-center">
            Las 5 principales posiciones concentran el <strong className="text-emerald-400">59,2%</strong> del capital total.
          </div>
        </div>
      </div>
    </div>
  );
}
