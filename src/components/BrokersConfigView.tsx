import React, { useState } from 'react';
import { Broker } from '../types/portfolio';
import {
  Plus,
  Edit2,
  CheckCircle2,
  ShieldCheck,
  DollarSign,
  Bell,
  Sliders,
  Database,
  RotateCcw,
  Lock,
  Unlock,
  KeyRound,
  Download,
  Upload,
  FileKey,
  Shield,
} from 'lucide-react';

interface BrokersConfigViewProps {
  brokers: Broker[];
  onAddBroker: (broker: Omit<Broker, 'id'>) => void;
  onToggleBroker: (id: string) => void;
  onResetToDefaults: () => void;
  onOpenSecurityModal?: (tab?: 'backup' | 'import' | 'password' | 'inspect') => void;
  hasPassword?: boolean;
  onLockApp?: () => void;
}

export function BrokersConfigView({
  brokers,
  onAddBroker,
  onToggleBroker,
  onResetToDefaults,
  onOpenSecurityModal,
  hasPassword = false,
  onLockApp,
}: BrokersConfigViewProps) {
  const [activeTab, setActiveTab] = useState<'brokers' | 'impuestos' | 'divisas' | 'notificaciones' | 'general' | 'seguridad'>('seguridad');

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

        {/* 6 Tabs - Screen 11 */}
        <div className="flex border-b border-slate-800 gap-2 sm:gap-4 overflow-x-auto text-xs sm:text-sm font-semibold">
          {[
            { id: 'seguridad', label: 'Seguridad y Copias 🔐' },
            { id: 'brokers', label: 'Brokers' },
            { id: 'impuestos', label: 'Impuestos' },
            { id: 'divisas', label: 'Divisas' },
            { id: 'notificaciones', label: 'Notificaciones' },
            { id: 'general', label: 'General' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2.5 px-3 border-b-2 font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
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

      {/* TAB 0: SEGURIDAD Y COPIAS DE SEGURIDAD CIFRADAS */}
      {activeTab === 'seguridad' && (
        <div className="space-y-6">
          {/* Security Status Card */}
          <div className="bg-[#12233f] border border-slate-700/70 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                  hasPassword
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-950/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-amber-950/40'
                }`}
              >
                {hasPassword ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-white">
                    {hasPassword ? 'Protección por Contraseña Activa' : 'Protección por Contraseña Desactivada'}
                  </h3>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      hasPassword
                        ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                        : 'bg-amber-950 border border-amber-700 text-amber-300'
                    }`}
                  >
                    {hasPassword ? 'Protegida' : 'Acceso Libre'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {hasPassword
                    ? 'Se solicita la contraseña obligatoria al abrir la aplicación y al descifrar copias de seguridad.'
                    : 'Puedes configurar una contraseña para blindar el acceso a tus datos de inversiones.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              {hasPassword && onLockApp && (
                <button
                  onClick={onLockApp}
                  className="flex-1 md:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <span>Bloquear pantalla</span>
                </button>
              )}

              <button
                onClick={() => onOpenSecurityModal && onOpenSecurityModal('password')}
                className="flex-1 md:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-950/40 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>{hasPassword ? 'Cambiar contraseña' : 'Crear contraseña'}</span>
              </button>
            </div>
          </div>

          {/* 3 Main Action Cards for Encrypted Backups */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Action 1: Create encrypted backup */}
            <div className="bg-[#12233f] border border-cyan-800/60 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-cyan-500 transition-colors">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                  <Download className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">Crear Copia Cifrada</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Genera un archivo <code>.cartera</code> con <strong>fecha y hora exacta en el nombre</strong>, protegido mediante <strong>cifrado AES-256</strong>. Nadie podrá abrirlo sin la clave.
                </p>
              </div>
              <button
                onClick={() => onOpenSecurityModal && onOpenSecurityModal('backup')}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Exportar Copia Cifrada</span>
              </button>
            </div>

            {/* Action 2: Import & restore backup */}
            <div className="bg-[#12233f] border border-emerald-800/60 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-emerald-500 transition-colors">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Upload className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">Importar Copia de Seguridad</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Carga un archivo de respaldo. La aplicación te <strong>pedirá la contraseña</strong> para descifrarlo, mostrará la fecha y datos, y restaurará tu cartera.
                </p>
              </div>
              <button
                onClick={() => onOpenSecurityModal && onOpenSecurityModal('import')}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileKey className="w-4 h-4" />
                <span>Importar con Contraseña</span>
              </button>
            </div>

            {/* Action 3: Inspect / open file without restoring */}
            <div className="bg-[#12233f] border border-amber-800/60 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-amber-500 transition-colors">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <FileKey className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">Examinar Archivo Cifrado</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Introduce la contraseña para inspeccionar y ver el contenido de cualquier copia de seguridad sin modificar tus datos actuales.
                </p>
              </div>
              <button
                onClick={() => onOpenSecurityModal && onOpenSecurityModal('inspect')}
                className="w-full py-2.5 px-4 bg-amber-600/90 hover:bg-amber-500 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>Abrir / Examinar Copia</span>
              </button>
            </div>
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
                onClick={() => onOpenSecurityModal && onOpenSecurityModal('backup')}
                className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Descargar copia de seguridad cifrada (.cartera)</span>
              </button>

              <button
                onClick={() => onOpenSecurityModal && onOpenSecurityModal('import')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer border border-slate-700"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Restaurar copia de seguridad (con contraseña)</span>
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
              className="px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600 border border-rose-500/30 text-rose-300 hover:text-white rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer"
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
