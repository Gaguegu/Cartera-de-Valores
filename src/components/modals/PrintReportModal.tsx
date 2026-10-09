import React from 'react';
import { X, Printer, Download, CheckCircle2 } from 'lucide-react';
import { StockPosition, Operation, ClosedPosition, DividendRecord } from '../../types/portfolio';
import { formatEUR, formatNumber, formatPercent } from '../../utils/formatters';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: 'full' | 'annual' | 'tax';
  positions: StockPosition[];
  operations: Operation[];
  closedPositions: ClosedPosition[];
  dividends: DividendRecord[];
  options?: {
    charts: boolean;
    dividends: boolean;
    closed: boolean;
  };
}

export function PrintReportModal({
  isOpen,
  onClose,
  reportType,
  positions,
  operations,
  closedPositions,
  dividends,
  options = { charts: true, dividends: true, closed: true },
}: PrintReportModalProps) {
  if (!isOpen) return null;

  const totalValue = positions.reduce((acc, p) => acc + p.currentValueEUR, 0);
  const totalGain = positions.reduce((acc, p) => acc + p.gainLossEUR, 0);
  const totalDividends2024 = dividends.filter(d => d.year === 2024).reduce((acc, d) => acc + d.grossEUR, 0);
  const totalWithholding2024 = dividends.filter(d => d.year === 2024).reduce((acc, d) => acc + d.withholdingEUR, 0);
  const closedGains2024 = closedPositions.filter(c => c.year === 2024).reduce((acc, c) => acc + c.resultEUR, 0);

  const handlePrint = () => {
    window.print();
  };

  const getTitle = () => {
    switch (reportType) {
      case 'tax':
        return 'INFORME FISCAL PARA DECLARACIÓN DE IRPF (MODELO D-100)';
      case 'annual':
        return 'RESUMEN EJECUTIVO ANUAL DE INVERSIONES - EJERCICIO 2024-2026';
      case 'full':
      default:
        return 'INFORME INTEGRAL DE CARTERA DE VALORES';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top bar (hidden in print) */}
        <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">Vista Previa para Impresión y Generación de PDF</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar en PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content - Optimized for PDF & print */}
        <div className="p-8 sm:p-12 overflow-y-auto space-y-6 flex-1 text-xs text-slate-800 font-sans print:p-0">
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4">
            <div>
              <h1 className="text-2xl font-black tracking-wider text-slate-900">Cartera de Valores</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Gestión Profesional de Inversiones</p>
              <p className="text-[11px] text-slate-400 mt-1">ID Cartera: <strong>ES-CARTERA-2026</strong> · Divisa Base: <strong>EUR (€)</strong></p>
            </div>
            <div className="text-right text-xs text-slate-600">
              <p className="font-bold text-slate-800">{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              <p className="text-[11px] text-slate-500">Documento Oficial Certificado</p>
              <p className="text-[10px] text-emerald-700 font-bold mt-1">Cálculo FIFO Conforme a la AEAT</p>
            </div>
          </div>

          {/* Title */}
          <div className="text-center py-2 bg-slate-100 rounded-lg">
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
              {getTitle()}
            </h2>
          </div>

          {/* Metrics Summary Strip */}
          <div className="grid grid-cols-4 gap-3 text-center border border-slate-200 rounded-xl p-3 bg-slate-50">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Valoración Total</span>
              <span className="text-sm font-extrabold text-slate-900 font-mono">{formatEUR(totalValue)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Plusvalía Latente</span>
              <span className="text-sm font-extrabold text-emerald-700 font-mono">+{formatEUR(totalGain)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Ganancias Cerradas 2024</span>
              <span className="text-sm font-extrabold text-emerald-700 font-mono">+{formatEUR(closedGains2024)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-semibold">Dividendos Brutos 2024</span>
              <span className="text-sm font-extrabold text-blue-700 font-mono">{formatEUR(totalDividends2024)}</span>
            </div>
          </div>

          {/* Section: Posiciones Abiertas */}
          {(reportType === 'full' || reportType === 'annual') && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                1. Posiciones Abiertas en Cartera ({positions.length} Activos)
              </h3>
              <table className="w-full text-[11px] text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                    <th className="p-1.5 border border-slate-200">Símbolo</th>
                    <th className="p-1.5 border border-slate-200">Empresa</th>
                    <th className="p-1.5 border border-slate-200">País</th>
                    <th className="p-1.5 border border-slate-200 text-right">Títulos</th>
                    <th className="p-1.5 border border-slate-200 text-right">P. Compra</th>
                    <th className="p-1.5 border border-slate-200 text-right">P. Actual</th>
                    <th className="p-1.5 border border-slate-200 text-right">Valor Total (€)</th>
                    <th className="p-1.5 border border-slate-200 text-right">Plusvalía %</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.slice(0, 10).map((p, idx) => (
                    <tr key={idx} className="border-b border-slate-200 even:bg-slate-50">
                      <td className="p-1.5 font-bold border border-slate-200">{p.symbol}</td>
                      <td className="p-1.5 border border-slate-200">{p.company}</td>
                      <td className="p-1.5 border border-slate-200">{p.country}</td>
                      <td className="p-1.5 text-right border border-slate-200">{p.shares}</td>
                      <td className="p-1.5 text-right font-mono border border-slate-200">{formatNumber(p.buyPrice)} €</td>
                      <td className="p-1.5 text-right font-mono border border-slate-200">{formatNumber(p.currentPrice)}</td>
                      <td className="p-1.5 text-right font-mono font-bold border border-slate-200">{formatEUR(p.currentValueEUR)}</td>
                      <td className="p-1.5 text-right font-mono text-emerald-700 font-bold border border-slate-200">{formatPercent(p.gainLossPercent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Section: Operaciones Cerradas / Plusvalías para IRPF */}
          {(reportType === 'full' || reportType === 'tax') && options.closed && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                2. Rendimientos del Capital Mobiliario y Ganancias Patrimoniales (Año 2024)
              </h3>
              <table className="w-full text-[11px] text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                    <th className="p-1.5 border border-slate-200">Símbolo</th>
                    <th className="p-1.5 border border-slate-200">Empresa</th>
                    <th className="p-1.5 border border-slate-200">Fecha Venta</th>
                    <th className="p-1.5 border border-slate-200 text-right">Títulos</th>
                    <th className="p-1.5 border border-slate-200 text-right">P. Venta</th>
                    <th className="p-1.5 border border-slate-200 text-right">Ganancia Neta (€)</th>
                  </tr>
                </thead>
                <tbody>
                  {closedPositions.filter(c => c.year === 2024).map((c, idx) => (
                    <tr key={idx} className="border-b border-slate-200 even:bg-slate-50">
                      <td className="p-1.5 font-bold border border-slate-200">{c.symbol}</td>
                      <td className="p-1.5 border border-slate-200">{c.company}</td>
                      <td className="p-1.5 border border-slate-200">{c.saleDate}</td>
                      <td className="p-1.5 text-right border border-slate-200">{c.shares}</td>
                      <td className="p-1.5 text-right font-mono border border-slate-200">{formatNumber(c.salePrice)} €</td>
                      <td className="p-1.5 text-right font-mono font-bold text-emerald-700 border border-slate-200">+{formatEUR(c.resultEUR)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-bold">
                    <td colSpan={5} className="p-1.5 border border-slate-200 text-right">TOTAL GANANCIAS PATRIMONIALES 2024:</td>
                    <td className="p-1.5 border border-slate-200 text-right text-emerald-800 font-mono">+{formatEUR(closedGains2024)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Section: Dividendos Cobrados */}
          {options.dividends && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                3. Rendimientos Íntegros de Dividendos y Retenciones (Ejercicio 2024)
              </h3>
              <table className="w-full text-[11px] text-left border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                    <th className="p-1.5 border border-slate-200">Fecha</th>
                    <th className="p-1.5 border border-slate-200">Empresa</th>
                    <th className="p-1.5 border border-slate-200">Símbolo</th>
                    <th className="p-1.5 border border-slate-200 text-right">Bruto (€)</th>
                    <th className="p-1.5 border border-slate-200 text-right">Retención (€)</th>
                    <th className="p-1.5 border border-slate-200 text-right">Neto Percibido (€)</th>
                  </tr>
                </thead>
                <tbody>
                  {dividends.filter(d => d.year === 2024).map((d, idx) => (
                    <tr key={idx} className="border-b border-slate-200 even:bg-slate-50">
                      <td className="p-1.5 border border-slate-200">{d.date}</td>
                      <td className="p-1.5 border border-slate-200">{d.company}</td>
                      <td className="p-1.5 font-bold border border-slate-200">{d.symbol}</td>
                      <td className="p-1.5 text-right font-mono border border-slate-200">{formatEUR(d.grossEUR)}</td>
                      <td className="p-1.5 text-right font-mono text-rose-700 border border-slate-200">-{formatEUR(d.withholdingEUR)}</td>
                      <td className="p-1.5 text-right font-mono font-bold text-emerald-700 border border-slate-200">{formatEUR(d.netEUR)}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-bold">
                    <td colSpan={3} className="p-1.5 border border-slate-200 text-right">TOTALES DIVIDENDOS 2024:</td>
                    <td className="p-1.5 border border-slate-200 text-right font-mono">{formatEUR(totalDividends2024)}</td>
                    <td className="p-1.5 border border-slate-200 text-right text-rose-700 font-mono">-{formatEUR(totalWithholding2024)}</td>
                    <td className="p-1.5 border border-slate-200 text-right text-emerald-800 font-mono">{formatEUR(totalDividends2024 - totalWithholding2024)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Footer certification */}
          <div className="pt-6 border-t border-slate-300 text-[10px] text-slate-500 flex justify-between items-end">
            <div>
              <p>Generado por: <strong>Cartera de Valores</strong></p>
              <p>Conforme a los criterios contables de valoración a coste medio ponderado y salidas FIFO.</p>
            </div>
            <div className="text-right">
              <div className="w-32 border-b border-slate-400 mb-1"></div>
              <p className="font-semibold text-slate-700">Firma del Titular / Gestor</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
