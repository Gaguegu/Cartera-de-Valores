import React, { useState } from 'react';
import { formatEUR, formatNumber } from '../utils/formatters';
import { FileText, CheckCircle2, Download, Printer, ShieldAlert, Info } from 'lucide-react';

interface TaxReportViewProps {
  onOpenPrintReport: (type: 'tax' | 'full' | 'annual') => void;
}

export function TaxReportView({ onOpenPrintReport }: TaxReportViewProps) {
  const [selectedYear, setSelectedYear] = useState<string>('2024');

  // Values matching Screen 8
  const capitalGains = 7122.50;
  const grossDividends = 4892.30;
  const totalWithholdings = 1245.80;
  const netResult = 5646.50;

  // Breakdown matching Screen 8
  const dividendDetails = {
    gross: 4892.30,
    withholdings: 1245.80,
    net: 3646.50,
  };

  const salesDetails = {
    gross: 7122.50,
    withholdings: 620.30,
    net: 6502.20,
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Year Filter Header */}
      <div className="bg-[#12233f] border border-slate-700/70 p-4 rounded-2xl shadow-md flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Fiscal / IRPF (Declaración de la Renta)
          </h2>
          <p className="text-xs text-slate-400">
            Cálculo conforme a la normativa española de la AEAT (Método FIFO y retenciones en origen)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3.5 py-2 font-bold focus:outline-none focus:border-blue-500"
          >
            <option value="2024">Año: 2024</option>
            <option value="2025">Año: 2025</option>
            <option value="2026">Año: 2026</option>
          </select>
        </div>
      </div>

      {/* 2 Main Panels from Screen 8 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Box: Resumen fiscal */}
        <div className="bg-[#12233f] border border-slate-700/70 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2.5">
            Resumen fiscal ({selectedYear})
          </h3>

          <div className="space-y-3 font-mono text-sm">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-300 text-xs font-sans">Ganancias / pérdidas</span>
              <span className="font-extrabold text-emerald-400">
                +{formatNumber(capitalGains)} €
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-300 text-xs font-sans">Dividendos brutos</span>
              <span className="font-extrabold text-emerald-400">
                {formatNumber(grossDividends)} €
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-300 text-xs font-sans">Retenciones aplicadas</span>
              <span className="font-extrabold text-rose-400">
                {formatNumber(totalWithholdings)} €
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
              <span className="text-slate-200 text-xs font-sans font-bold">Resultado neto</span>
              <span className="font-black text-emerald-400 text-base">
                {formatNumber(netResult)} €
              </span>
            </div>
          </div>
        </div>

        {/* Right Box: Informe para Hacienda (Checklist and Button) */}
        <div className="bg-[#12233f] border border-slate-700/70 rounded-2xl p-5 sm:p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2.5">
              Informe para Hacienda
            </h3>

            <div className="py-3 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Listado de operaciones de compra/venta</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Dividendos desglosados por empresa</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Resumen por país y doble imposición</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Retenciones aplicadas en origen y destino</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Listado oficial de pérdidas y ganancias FIFO</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onOpenPrintReport('tax')}
            className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Generar informe PDF</span>
          </button>
        </div>
      </div>

      {/* Bottom Table: Detalle por tipo - Screen 8 */}
      <div className="bg-[#12233f] border border-slate-700/70 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 bg-[#0e1b30] border-b border-slate-700/80">
          <h3 className="text-sm font-bold text-white">Detalle por tipo</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4 text-right">Bruto (€)</th>
                <th className="py-3 px-4 text-right">Retenciones (€)</th>
                <th className="py-3 px-4 text-right">Neto (€)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-sans font-bold text-white">Dividendos</td>
                <td className="py-3 px-4 text-right text-slate-200">{formatNumber(dividendDetails.gross)}</td>
                <td className="py-3 px-4 text-right text-rose-400">{formatNumber(dividendDetails.withholdings)}</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-400">{formatNumber(dividendDetails.net)}</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="py-3 px-4 font-sans font-bold text-white">Ventas</td>
                <td className="py-3 px-4 text-right text-slate-200">{formatNumber(salesDetails.gross)}</td>
                <td className="py-3 px-4 text-right text-rose-400">{formatNumber(salesDetails.withholdings)}</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-400">{formatNumber(salesDetails.net)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Explanatory Tax Note */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-1">
        <span className="font-bold text-slate-300 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-400" /> Tramos de la Base Liquidable del Ahorro en España:
        </span>
        <p>
          Hasta 6.000 €: <strong>19%</strong> · De 6.000 a 50.000 €: <strong>21%</strong> · De 50.000 a 200.000 €: <strong>23%</strong> · De 200.000 a 300.000 €: <strong>27%</strong> · Más de 300.000 €: <strong>28%</strong>.
          Las retenciones practicadas en dividendos internacionales (formulario W-8BEN USA 15%) son deducibles por doble imposición internacional.
        </p>
      </div>
    </div>
  );
}
