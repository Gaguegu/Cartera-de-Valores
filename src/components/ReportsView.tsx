import React, { useState } from 'react';
import { FileText, FileSpreadsheet, Printer, Download, Eye, CheckSquare, Square } from 'lucide-react';
import { downloadCSV } from '../utils/formatters';
import { StockPosition, Operation, ClosedPosition, DividendRecord } from '../types/portfolio';

interface ReportsViewProps {
  positions: StockPosition[];
  operations: Operation[];
  closedPositions: ClosedPosition[];
  dividends: DividendRecord[];
  onOpenPrintReport: (type: 'full' | 'annual' | 'tax', options?: { charts: boolean; dividends: boolean; closed: boolean }) => void;
}

export function ReportsView({
  positions,
  operations,
  closedPositions,
  dividends,
  onOpenPrintReport,
}: ReportsViewProps) {
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeDividends, setIncludeDividends] = useState(true);
  const [includeClosed, setIncludeClosed] = useState(true);

  const handleExportAllCSV = () => {
    const headers = [
      'Tipo de Registro',
      'Símbolo',
      'Empresa',
      'Detalle/Fecha',
      'Cantidad',
      'Precio (€)',
      'Total/Resultado (€)',
    ];

    const rows: (string | number)[][] = [
      ...positions.map(p => ['Posición Abierta', p.symbol, p.company, p.country, p.shares, p.buyPrice, p.currentValueEUR]),
      ...operations.map(o => [`Operación (${o.type})`, o.symbol, o.company, o.date, o.shares, o.price, o.totalEUR]),
      ...closedPositions.map(c => ['Posición Cerrada', c.symbol, c.company, c.saleDate, c.shares, c.salePrice, c.resultEUR]),
      ...dividends.map(d => ['Dividendo Cobrado', d.symbol, d.company, d.date, 1, d.grossEUR, d.netEUR]),
    ];

    downloadCSV('Cartera_Valores_Completa.csv', rows, headers);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 3 Top Cards from Screen 9 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Informe completo */}
        <div className="bg-[#12233f] border border-slate-700/70 rounded-2xl p-5 sm:p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1.5">Informe completo</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Cartera actual, dividendos, operaciones y análisis
            </p>
          </div>
          <button
            onClick={() => onOpenPrintReport('full', { charts: includeCharts, dividends: includeDividends, closed: includeClosed })}
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Generar PDF</span>
          </button>
        </div>

        {/* Card 2: Resumen anual */}
        <div className="bg-[#12233f] border border-slate-700/70 rounded-2xl p-5 sm:p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1.5">Resumen anual</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Por años y empresas
            </p>
          </div>
          <button
            onClick={() => onOpenPrintReport('annual', { charts: includeCharts, dividends: includeDividends, closed: includeClosed })}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Generar PDF</span>
          </button>
        </div>

        {/* Card 3: Listado para Hacienda */}
        <div className="bg-[#12233f] border border-slate-700/70 rounded-2xl p-5 sm:p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1.5">Listado para Hacienda</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Modelo IRPF
            </p>
          </div>
          <button
            onClick={() => onOpenPrintReport('tax', { charts: includeCharts, dividends: includeDividends, closed: includeClosed })}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Generar PDF</span>
          </button>
        </div>
      </div>

      {/* Middle: Exportar a CSV/Excel - Screen 9 */}
      <div className="bg-[#12233f] border border-slate-700/70 rounded-2xl p-5 sm:p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white mb-1">Exportar a CSV/Excel</h3>
          <p className="text-xs text-slate-400">
            Descarga de datos completos (posiciones, operaciones, plusvalías y dividendos)
          </p>
        </div>

        <button
          onClick={handleExportAllCSV}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Descargar Excel / CSV</span>
        </button>
      </div>

      {/* Bottom: Opciones de impresión - Screen 9 */}
      <div className="bg-[#12233f] border border-slate-700/70 rounded-2xl p-5 sm:p-6 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-2">
          Opciones de impresión
        </h3>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 text-xs text-slate-300">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeCharts}
                onChange={e => setIncludeCharts(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <span>Incluir gráficos</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeDividends}
                onChange={e => setIncludeDividends(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <span>Incluir dividendos</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeClosed}
                onChange={e => setIncludeClosed(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
              />
              <span>Incluir operaciones cerradas</span>
            </label>
          </div>

          <button
            onClick={() => onOpenPrintReport('full', { charts: includeCharts, dividends: includeDividends, closed: includeClosed })}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            <span>Vista previa</span>
          </button>
        </div>
      </div>
    </div>
  );
}
