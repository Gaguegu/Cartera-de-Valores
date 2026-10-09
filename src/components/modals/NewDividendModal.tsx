import React, { useState } from 'react';
import { StockPosition } from '../../types/portfolio';
import { formatEUR } from '../../utils/formatters';
import { X, DollarSign } from 'lucide-react';

interface NewDividendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dividendData: {
    symbol: string;
    company: string;
    grossEUR: number;
    withholdingEUR: number;
    netEUR: number;
    date: string;
    year: number;
  }) => void;
  availablePositions: StockPosition[];
}

export function NewDividendModal({
  isOpen,
  onClose,
  onSubmit,
  availablePositions,
}: NewDividendModalProps) {
  const [symbol, setSymbol] = useState(availablePositions[0]?.symbol || 'MSFT');
  const [company, setCompany] = useState(availablePositions[0]?.company || 'Microsoft');
  const [grossEUR, setGrossEUR] = useState<number>(150.0);
  const [withholdingPercent, setWithholdingPercent] = useState<number>(15); // Standard 15% US withholding or 19% ES
  const [date, setDate] = useState<string>(new Date().toLocaleDateString('es-ES'));

  if (!isOpen) return null;

  const withholdingEUR = Number(((grossEUR * withholdingPercent) / 100).toFixed(2));
  const netEUR = Number((grossEUR - withholdingEUR).toFixed(2));

  const handleSymbolChange = (sym: string) => {
    setSymbol(sym);
    const match = availablePositions.find(p => p.symbol.toUpperCase() === sym.toUpperCase());
    if (match) {
      setCompany(match.company);
      if (match.country === 'ES') {
        setWithholdingPercent(19);
      } else if (match.country === 'USA') {
        setWithholdingPercent(15);
      } else if (match.country === 'DE') {
        setWithholdingPercent(26.37);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || grossEUR <= 0) return;

    // extract year from date
    const parts = date.split('/');
    const year = parts.length === 3 ? parseInt(parts[2], 10) : new Date().getFullYear();

    onSubmit({
      symbol: symbol.toUpperCase(),
      company,
      grossEUR,
      withholdingEUR,
      netEUR,
      date,
      year: isNaN(year) ? 2026 : year,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Registrar Cobro de Dividendo</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Valor / Empresa
            </label>
            <select
              value={symbol}
              onChange={e => handleSymbolChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {availablePositions.map(p => (
                <option key={p.id} value={p.symbol}>
                  {p.symbol} - {p.company} ({p.country})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Dividendo Bruto (€)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={grossEUR}
                onChange={e => setGrossEUR(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                % Retención aplicada
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={withholdingPercent}
                onChange={e => setWithholdingPercent(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Fecha de Cobro (DD/MM/AAAA)
            </label>
            <input
              type="text"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Breakdown summary */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Importe Bruto:</span>
              <span className="font-semibold text-white">{formatEUR(grossEUR)}</span>
            </div>
            <div className="flex justify-between text-rose-400">
              <span>Retención en origen ({withholdingPercent}%):</span>
              <span className="font-semibold">-{formatEUR(withholdingEUR)}</span>
            </div>
            <div className="border-t border-slate-800 pt-1.5 flex justify-between text-emerald-400 font-bold text-sm">
              <span>Neto ingresado en cuenta:</span>
              <span>{formatEUR(netEUR)}</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg"
            >
              Guardar Dividendo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
