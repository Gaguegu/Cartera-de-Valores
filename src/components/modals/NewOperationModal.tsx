import React, { useState, useEffect } from 'react';
import { Operation, StockPosition, Broker } from '../../types/portfolio';
import { formatEUR } from '../../utils/formatters';
import { X, PlusCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface NewOperationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (operationData: {
    type: 'Compra' | 'Venta';
    symbol: string;
    company: string;
    shares: number;
    price: number;
    totalEUR: number;
    commissionEUR: number;
    date: string;
    broker: string;
  }) => void;
  availablePositions: StockPosition[];
  brokers: Broker[];
  prefilledSymbol?: string;
}

export function NewOperationModal({
  isOpen,
  onClose,
  onSubmit,
  availablePositions,
  brokers,
  prefilledSymbol,
}: NewOperationModalProps) {
  const [type, setType] = useState<'Compra' | 'Venta'>('Compra');
  const [symbol, setSymbol] = useState(prefilledSymbol || 'MSFT');
  const [company, setCompany] = useState('Microsoft');
  const [shares, setShares] = useState<number>(10);
  const [price, setPrice] = useState<number>(420.0);
  const [commissionEUR, setCommissionEUR] = useState<number>(8.5);
  const [date, setDate] = useState<string>(new Date().toLocaleDateString('es-ES'));
  const [broker, setBroker] = useState<string>(brokers[0]?.name || 'Interactive Brokers');

  useEffect(() => {
    if (prefilledSymbol) {
      setSymbol(prefilledSymbol);
      const match = availablePositions.find(p => p.symbol.toUpperCase() === prefilledSymbol.toUpperCase());
      if (match) {
        setCompany(match.company);
        setPrice(match.currentPrice);
      }
    }
  }, [prefilledSymbol, availablePositions]);

  if (!isOpen) return null;

  const totalEUR = Number((shares * price).toFixed(2));

  const handleSymbolChange = (sym: string) => {
    setSymbol(sym);
    const match = availablePositions.find(p => p.symbol.toUpperCase() === sym.toUpperCase());
    if (match) {
      setCompany(match.company);
      setPrice(match.currentPrice);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || shares <= 0 || price <= 0) return;

    onSubmit({
      type,
      symbol: symbol.toUpperCase(),
      company: company || symbol.toUpperCase(),
      shares,
      price,
      totalEUR,
      commissionEUR,
      date,
      broker,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Nueva Operación de Bolsa</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Operation Type Switch */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('Compra')}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                type === 'Compra'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" /> COMPRA
            </button>
            <button
              type="button"
              onClick={() => setType('Venta')}
              className={`py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                type === 'Venta'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" /> VENTA
            </button>
          </div>

          {/* Symbol & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Símbolo (Ticker)
              </label>
              <input
                type="text"
                value={symbol}
                onChange={e => handleSymbolChange(e.target.value.toUpperCase())}
                placeholder="Ej. MSFT, AAPL, SAN"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre de la Empresa
              </label>
              <input
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="Ej. Microsoft"
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Shares & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cantidad de Acciones
              </label>
              <input
                type="number"
                min="1"
                step="any"
                value={shares}
                onChange={e => setShares(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Precio por Acción (€)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Commission & Broker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Comisión del Broker (€)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={commissionEUR}
                onChange={e => setCommissionEUR(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Broker utilizado
              </label>
              <select
                value={broker}
                onChange={e => setBroker(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              >
                {brokers.map(b => (
                  <option key={b.id} value={b.name}>
                    {b.name} ({b.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Fecha de Ejecución (DD/MM/AAAA)
            </label>
            <input
              type="text"
              value={date}
              onChange={e => setDate(e.target.value)}
              placeholder="DD/MM/AAAA"
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Total Preview */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Importe Total Estimado:</span>
            <span className="text-emerald-400 font-bold text-base font-mono">
              {formatEUR(totalEUR)}
            </span>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-5 py-2 text-white rounded-xl text-xs font-bold transition-colors shadow-lg ${
                type === 'Compra' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-600 hover:bg-amber-500'
              }`}
            >
              Guardar Operación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
