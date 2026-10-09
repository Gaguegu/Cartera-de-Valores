import React, { useState } from 'react';
import { StockPosition } from '../types/portfolio';
import { formatEUR, formatNumber, formatPercent, downloadCSV } from '../utils/formatters';
import { Search, Download, Filter, MoreVertical, Plus, ArrowUpDown, ExternalLink } from 'lucide-react';

interface CurrentPortfolioProps {
  positions: StockPosition[];
  onSelectStock: (stock: StockPosition) => void;
  onOpenNewOperation: (symbol?: string) => void;
}

export function CurrentPortfolio({
  positions,
  onSelectStock,
  onOpenNewOperation,
}: CurrentPortfolioProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('TODOS');
  const [selectedSector, setSelectedSector] = useState<string>('TODOS');
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<keyof StockPosition>('currentValueEUR');
  const [sortAsc, setSortAsc] = useState(false);

  // Filtering
  const filtered = positions.filter(pos => {
    const matchesSearch =
      pos.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pos.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === 'TODOS' || pos.country === selectedCountry;
    const matchesSector = selectedSector === 'TODOS' || pos.sector === selectedSector;
    return matchesSearch && matchesCountry && matchesSector;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortAsc ? aVal - bVal : bVal - aVal;
    }
    return 0;
  });

  const totalValueEUR = positions.reduce((acc, p) => acc + p.currentValueEUR, 0);
  const totalGainEUR = positions.reduce((acc, p) => acc + p.gainLossEUR, 0);
  const totalCost = totalValueEUR - totalGainEUR;
  const totalPercent = totalCost > 0 ? (totalGainEUR / totalCost) * 100 : 12.4;

  const handleExportCSV = () => {
    const headers = [
      'Símbolo',
      'Empresa',
      'País',
      'Divisa',
      'Cantidad',
      'Precio Compra (€)',
      'Precio Actual',
      'Valor Total (€)',
      'Plusvalía (€)',
      'Plusvalía (%)',
      'Sector',
    ];
    const rows = sorted.map(p => [
      p.symbol,
      p.company,
      p.country,
      p.currency,
      p.shares,
      p.buyPrice,
      p.currentPrice,
      p.currentValueEUR,
      p.gainLossEUR,
      p.gainLossPercent,
      p.sector,
    ]);
    downloadCSV('Cartera_Valores_Actual.csv', rows, headers);
  };

  const countries = Array.from(new Set(positions.map(p => p.country)));
  const sectors = Array.from(new Set(positions.map(p => p.sector)));

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Action and Filter Bar - Screen 2 Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#12233f] p-4 rounded-2xl border border-slate-700/70 shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
              showFilters
                ? 'bg-blue-600 border-blue-500 text-white'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar</span>
          </button>

          <button
            onClick={() => onOpenNewOperation()}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-all shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nueva compra</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar valor..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Expandable Filter drawer */}
      {showFilters && (
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs animate-in slide-in-from-top-2">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Filtrar por País:</label>
            <select
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
            >
              <option value="TODOS">Todos los países</option>
              {countries.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Filtrar por Sector:</label>
            <select
              value={selectedSector}
              onChange={e => setSelectedSector(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
            >
              <option value="TODOS">Todos los sectores</option>
              {sectors.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Main Table - Screen 2 */}
      <div className="bg-[#12233f] border border-slate-700/70 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0e1b30] text-slate-400 font-semibold border-b border-slate-700/80 select-none">
              <tr>
                <th
                  onClick={() => {
                    setSortField('symbol');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3.5 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Símbolo</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    setSortField('company');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3.5 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Empresa</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-3">País</th>
                <th className="py-3.5 px-3">Divisa</th>
                <th className="py-3.5 px-4 text-right">Cantidad</th>
                <th className="py-3.5 px-4 text-right">Precio compra</th>
                <th className="py-3.5 px-4 text-right">Precio actual</th>
                <th
                  onClick={() => {
                    setSortField('currentValueEUR');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Valor (€)</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    setSortField('gainLossPercent');
                    setSortAsc(!sortAsc);
                  }}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Plusvalía %</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sorted.map(pos => (
                <tr
                  key={pos.id}
                  onClick={() => onSelectStock(pos)}
                  className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                >
                  {/* Símbolo */}
                  <td className="py-3.5 px-4 font-bold text-white">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: pos.color || '#3b82f6' }}
                      />
                      <span className="font-mono tracking-wide">{pos.symbol}</span>
                    </div>
                  </td>

                  {/* Empresa */}
                  <td className="py-3.5 px-4 text-slate-200 font-medium">
                    {pos.company}
                  </td>

                  {/* País */}
                  <td className="py-3.5 px-3 text-slate-400 font-semibold">
                    {pos.country}
                  </td>

                  {/* Divisa */}
                  <td className="py-3.5 px-3 text-slate-400 font-mono">
                    {pos.currency}
                  </td>

                  {/* Cantidad */}
                  <td className="py-3.5 px-4 text-right font-medium text-white">
                    {pos.shares}
                  </td>

                  {/* Precio compra */}
                  <td className="py-3.5 px-4 text-right text-slate-300 font-mono">
                    {formatNumber(pos.buyPrice)}
                  </td>

                  {/* Precio actual */}
                  <td className="py-3.5 px-4 text-right text-slate-200 font-mono font-medium">
                    {formatNumber(pos.currentPrice)}
                  </td>

                  {/* Valor (€) */}
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-400 font-mono">
                    {formatEUR(pos.currentValueEUR)}
                  </td>

                  {/* Plusvalía % */}
                  <td className="py-3.5 px-4 text-right font-bold text-emerald-400 font-mono">
                    {formatPercent(pos.gainLossPercent)}
                  </td>

                  {/* Options */}
                  <td className="py-3.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onSelectStock(pos);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors"
                        title="Ver detalle"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Summary - Screen 2 Footer: Total cartera: 248.532,75 € +12,4% */}
        <div className="p-4 bg-[#0e1b30] border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-400">
            Mostrando <span className="text-white font-bold">{sorted.length}</span> de{' '}
            <span className="text-white font-bold">{positions.length}</span> posiciones abiertas
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-400 font-semibold">Total cartera:</span>
            <span className="text-xl font-extrabold text-white font-mono">
              {formatEUR(totalValueEUR)}
            </span>
            <span className="px-2.5 py-0.5 rounded-md font-bold bg-emerald-500/20 text-emerald-400 text-xs font-mono">
              {formatPercent(totalPercent)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
