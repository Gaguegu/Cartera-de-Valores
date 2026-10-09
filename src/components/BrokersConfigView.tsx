import React, { useState } from 'react';
import { Broker } from '../types/portfolio';
import { Plus, Edit2, CheckCircle2, ShieldCheck, DollarSign, Bell, Sliders, Database, RotateCcw } from 'lucide-react';

interface BrokersConfigViewProps {
  brokers: Broker[];
  onAddBroker: (broker: Omit<Broker, 'id'>) => void;
  onToggleBroker: (id: string) => void;
  onResetToDefaults: () => void;
}

export function BrokersConfigView({
  brokers,
  onAddBroker,
  onToggleBroker,
  onResetToDefaults,
}: BrokersConfigViewProps) {
  const [activeTab, setActiveTab] = useState<'brokers' | 'impuestos' | 'divisas' | 'notificaciones' | 'general'>('brokers');

  // Broker creation modal state
  const [isAdding, setIsAdding] = useState(false);
  const [newBrokerName, setNewBrokerName] = useState('');
  const [newBrokerType, setNewBrokerType] = useState('USA / Europa');

  // Tax rates
  const [usWithholding, setUsWithholding] = useState(15);
  const [esWithholding, setEsWithholding] = useState(19);

  // FX rates
  const [usdEurRate, setUsdEurRate] = useState(1.085);
  const [gbpEurRate, setGbpEurRate] = useState(0.855);

  const handleSaveBroker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrokerName.trim()) return;
    onAddBroker({
      name: newBrokerName.trim(),
      type: newBrokerType,
      active: true,
      notes: 'Broker configurado por el usuario',
    });
    setNewBrokerName('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Configuration Header & Tabs - Screen 11 */}
      <div className="bg-[#12233f] border border-slate-700/70 p-4 rounded-2xl shadow-md space-y-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Gestión de brokers y configuración
          </h2>
          <p className="text-xs text-slate-400">
            Ajusta tus intermediarios financieros, tipos impositivos y divisas operativas
          </p>
        </div>

        {/* 5 Tabs - Screen 11 */}
        <div className="flex border-b border-slate-800 gap-2 sm:gap-4 overflow-x-auto text-xs sm:text-sm font-semibold">
          {[
            { id: 'brokers', label: 'Brokers' },
            { id: 'impuestos', label: 'Impuestos' },
            { id: 'divisas', label: 'Divisas' },
            { id: 'notificaciones', label: 'Notificaciones' },
            { id: 'general', label: 'General' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2.5 px-3 border-b-2 font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: BROKERS TABLE - Screen 11 */}
      {activeTab === 'brokers' && (
        <div className="bg-[#12233f] border border-slate-700/70 rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#0e1b30] text-slate-400 font-semibold border-b border-slate-700/80">
                <tr>
                  <th className="py-3 px-4">Broker</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Activo</th>
                  <th className="py-3 px-4 text-center">Editar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {brokers.map(brk => (
                  <tr key={brk.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span>{brk.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">{brk.type}</td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => onToggleBroker(brk.id)}
                        className={`px-3 py-1 rounded-md text-[11px] font-bold border transition-colors ${
                          brk.active
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        {brk.active ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => onToggleBroker(brk.id)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Broker button - Screen 11 */}
          <div className="pt-2">
            {!isAdding ? (
              <button
                onClick={() => setIsAdding(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir broker</span>
              </button>
            ) : (
              <form onSubmit={handleSaveBroker} className="bg-slate-900 p-4 rounded-xl border border-slate-700 space-y-3">
                <h4 className="text-xs font-bold text-white">Nuevo Broker</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newBrokerName}
                    onChange={e => setNewBrokerName(e.target.value)}
                    placeholder="Nombre del broker (ej. MyInvestor, Scalable)"
                    required
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                  <select
                    value={newBrokerType}
                    onChange={e => setNewBrokerType(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="USA / Europa">USA / Europa</option>
                    <option value="España">España</option>
                    <option value="Europa">Europa</option>
                    <option value="Global">Global</option>
                  </select>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: IMPUESTOS */}
      {activeTab === 'impuestos' && (
        <div className="bg-[#12233f] border border-slate-700/70 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white">Configuración Fiscal & Retenciones</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <label className="font-semibold text-slate-300 block">Retención en Origen USA (W-8BEN):</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={usWithholding}
                  onChange={e => setUsWithholding(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono w-24"
                />
                <span className="text-slate-400 font-bold">%</span>
              </div>
              <p className="text-[11px] text-slate-500">Convenio de doble imposición España - Estados Unidos.</p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <label className="font-semibold text-slate-300 block">Retención Estatal en España (AEAT):</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={esWithholding}
                  onChange={e => setEsWithholding(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono w-24"
                />
                <span className="text-slate-400 font-bold">%</span>
              </div>
              <p className="text-[11px] text-slate-500">Tipo de retención estándar a cuenta del IRPF.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DIVISAS */}
      {activeTab === 'divisas' && (
        <div className="bg-[#12233f] border border-slate-700/70 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white">Tipos de Cambio Oficiales respecto al Euro (€)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <label className="font-semibold text-slate-300 block">Dólar Estadounidense (EUR / USD):</label>
              <input
                type="number"
                step="0.001"
                value={usdEurRate}
                onChange={e => setUsdEurRate(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono w-32"
              />
              <p className="text-[11px] text-slate-400">1 EUR ≈ {usdEurRate} USD</p>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2">
              <label className="font-semibold text-slate-300 block">Libra Esterlina (EUR / GBP):</label>
              <input
                type="number"
                step="0.001"
                value={gbpEurRate}
                onChange={e => setGbpEurRate(Number(e.target.value))}
                className="bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono w-32"
              />
              <p className="text-[11px] text-slate-400">1 EUR ≈ {gbpEurRate} GBP</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: NOTIFICACIONES */}
      {activeTab === 'notificaciones' && (
        <div className="bg-[#12233f] border border-slate-700/70 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
          <h3 className="text-sm font-bold text-white">Alertas de Cartera</h3>
          <div className="space-y-3">
            {[
              { title: 'Aviso de cobro de dividendos', desc: 'Notificar 3 días antes de la fecha de pago estimada', enabled: true },
              { title: 'Variación de precio diaria', desc: 'Alertar si una posición oscila más de un 5% en la sesión', enabled: false },
              { title: 'Recordatorio fiscal IRPF', desc: 'Aviso en campaña de renta con el informe generado', enabled: true },
            ].map((n, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <span className="font-bold text-white block">{n.title}</span>
                  <span className="text-slate-400 text-[11px]">{n.desc}</span>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={n.enabled}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-700"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: GENERAL & BACKUPS */}
      {activeTab === 'general' && (
        <div className="bg-[#12233f] border border-slate-700/70 rounded-2xl p-6 shadow-xl space-y-6 text-xs">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Copia de Seguridad y Respaldo Completo</h3>
            <p className="text-slate-400 leading-relaxed">
              Exporta todos tus datos (valores, compras, ventas, dividendos, brokers y configuraciones) a un archivo de respaldo seguro en tu ordenador o móvil.
            </p>

            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={() => {
                  const fullBackup = {
                    positions: localStorage.getItem('cartera_positions'),
                    operations: localStorage.getItem('cartera_operations'),
                    closedPositions: localStorage.getItem('cartera_closed_positions'),
                    dividends: localStorage.getItem('cartera_dividends'),
                    upcomingDividends: localStorage.getItem('cartera_upcoming_dividends'),
                    brokers: localStorage.getItem('cartera_brokers'),
                    exportDate: new Date().toISOString(),
                  };
                  const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Copia_Seguridad_Cartera_${new Date().toISOString().slice(0, 10)}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                <span>Descargar copia de seguridad (.json)</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-sm font-bold text-white mb-1">Restablecimiento</h3>
            <p className="text-slate-400 leading-relaxed mb-3">
              Puedes restaurar los valores iniciales de demostración de la cartera en cualquier momento.
            </p>

            <button
              onClick={onResetToDefaults}
              className="px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white rounded-xl font-bold transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restablecer datos de fábrica</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
