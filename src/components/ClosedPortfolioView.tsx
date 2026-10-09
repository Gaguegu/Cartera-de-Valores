import React, { useState } from 'react';
import { ClosedPosition } from '../types/portfolio';
import { formatEUR, formatNumber, downloadCSV } from '../utils/formatters';
import { Download, TrendingUp, Calendar } from 'lucide-react';

interface ClosedPortfolioViewProps {
  closedPositions: ClosedPosition[];
}

export function ClosedPortfolioView({ closedPositions }: ClosedPortfolioViewProps) {
  const [selectedYear, setSelectedYear] = useState<number>(2024);

  const years = [2020, 2021, 2022, 2023, 2024, 2025];

  const positionsInYear = closedPositions.filter(p => p.year === selectedYear);
  const totalResultInYear = positionsInYear.reduce((acc, p) => acc + p.resultEUR, 0);

  const handleExportCSV = () => {
    const headers = ['Símbolo', 'Empresa', 'Fecha Venta', 'Cantidad', 'Precio Venta (€)', 'Resultado (€)', 'Año'];
    const rows = positionsInYear.map(p => [
      p.symbol,
      p.company,
      p.saleDate,
      p.shares,
      p.salePrice,
      p.resultEUR,
      p.year,
    ]);
    downloadCSV(`Carteras_Cerradas_${selectedYear}.csv`, rows, headers);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header and Year Tabs - Screen 5 */}
      <div className="bg-[#12233f] border border-slate-700/70 p-4 rounded-2xl shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Year Pills Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {years.map(yr => (
            <button
              key={yr}
              onClick={() => setSelectedYear(yr)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedYear === yr
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-all shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Exportar año {selectedYear}</span>
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-[#12233f] border border-slate-700/70 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0e1b30] text-slate-400 font-semibold border-b border-slate-700/80">
              <tr>
                <th className="py-3.5 px-4">Símbolo</th>
                <th className="py-3.5 px-4">Empresa</th>
                <th className="py-3.5 px-4">Fecha venta</th>
                <th className="py-3.5 px-4 text-right">Cantidad</th>
                <th className="py-3.5 px-4 text-right">Precio venta</th>
                <th className="py-3.5 px-4 text-right">Resultado €</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {positionsInYear.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No hay operaciones cerradas registradas en el año {selectedYear}.
                  </td>
                </tr>
              ) : (
                positionsInYear.map(item => (
                  <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white font-mono flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>{item.symbol}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-200 font-medium">{item.company}</td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">{item.saleDate}</td>
                    <td className="py-3.5 px-4 text-right font-medium text-white">{item.shares}</td>
                    <td className="py-3.5 px-4 text-right text-slate-300 font-mono">
                      {formatNumber(item.salePrice)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold font-mono text-emerald-400">
                      {item.resultEUR >= 0 ? `+${formatNumber(item.resultEUR)}` : formatNumber(item.resultEUR)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Banner - Screen 5: Total año 2024: 5 operaciones +7.122,50 € */}
        <div className="p-4 bg-[#0e1b30] border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-300 font-medium">
            Total año <span className="font-bold text-white">{selectedYear}</span>
            <span className="mx-3 text-slate-600">|</span>
            <span className="text-slate-400">{positionsInYear.length} operaciones</span>
          </div>
          <div className="flex items-center gap-2 text-base font-extrabold text-emerald-400 font-mono">
            <span>{totalResultInYear >= 0 ? `+${formatEUR(totalResultInYear)}` : formatEUR(totalResultInYear)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
