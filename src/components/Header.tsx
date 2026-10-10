import React, { useMemo } from 'react';
import { Menu, RefreshCw, TrendingUp, Calendar, Sparkles, Lock, Shield } from 'lucide-react';
import { ActiveTab } from '../types/portfolio';

interface HeaderProps {
  currentTab: ActiveTab;
  onOpenMobileMenu: () => void;
  onOpenGuide?: () => void;
  onResetData?: () => void;
  totalPortfolioValue: number;
  currentVersion?: string;
  onOpenVersionsModal?: () => void;
  isCheckingVersion?: boolean;
  hasPendingUpdate?: boolean;
  onCheckForUpdates?: () => void;
  onInstallNow?: () => void;
  onForceReload?: () => void;
  hasPassword?: boolean;
  onLockApp?: () => void;
  onOpenSecurityModal?: (tab?: 'backup' | 'import' | 'password' | 'inspect') => void;
}

export function Header({
  currentTab,
  onOpenMobileMenu,
  totalPortfolioValue,
  currentVersion,
  onOpenVersionsModal,
  isCheckingVersion = false,
  hasPendingUpdate = false,
  onCheckForUpdates,
  onInstallNow,
  onForceReload,
  hasPassword = false,
  onLockApp,
  onOpenSecurityModal,
}: HeaderProps) {
  const todayFormatted = useMemo(() => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date());
  }, []);

  const getTabTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'dashboard':
        return 'Gestión de Inversiones';
      case 'current':
        return 'Cartera actual';
      case 'detail':
        return 'Detalle de valor';
      case 'operations':
        return 'Operaciones';
      case 'closed':
        return 'Carteras cerradas';
      case 'dividends':
        return 'Dividendos';
      case 'analytics':
        return 'Análisis y gráficos';
      case 'tax':
        return 'Fiscal / IRPF';
      case 'reports':
        return 'Informes y exportación';
      case 'calendar':
        return 'Calendario de dividendos';
      case 'config':
        return 'Configuración y Brokers';
      default:
        return 'Gestión de Inversiones';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0f1e36] border-b border-slate-800/80 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between shadow-md relative min-h-[64px]">
      {/* Left: Mobile trigger & Logo + Current View */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-900/30">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-wider text-white">Cartera de Valores</span>
              <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-500"></span>
              <h1 className="text-sm font-semibold text-slate-300 tracking-tight">
                {getTabTitle(currentTab)}
              </h1>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden md:block">
              Gestión Integral de Inversiones · Control total de tu patrimonio
            </p>
          </div>
        </div>
      </div>

      {/* CENTRO: Botón de Bloqueo manual con un solo clic */}
      <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <button
          onClick={hasPassword && onLockApp ? onLockApp : () => onOpenSecurityModal && onOpenSecurityModal('password')}
          className={`group relative flex items-center gap-2.5 px-4 lg:px-5 py-2 lg:py-2.5 rounded-2xl border-2 transition-all duration-200 cursor-pointer select-none active:scale-95 shadow-lg ${
            hasPassword
              ? 'bg-gradient-to-r from-[#24101c] via-[#361327] to-[#1e0a18] border-rose-500/90 hover:border-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.35)] hover:shadow-[0_0_28px_rgba(244,63,94,0.55)] ring-1 ring-rose-500/30'
              : 'bg-gradient-to-r from-[#172338] via-[#102038] to-[#0d1b30] border-amber-500/80 hover:border-amber-400 text-amber-200 shadow-[0_0_16px_rgba(245,158,11,0.25)] hover:shadow-[0_0_22px_rgba(245,158,11,0.45)]'
          }`}
          title={
            hasPassword
              ? 'Bloqueo manual con un solo clic: haz clic para bloquear la cartera de inmediato'
              : 'Configurar contraseña para activar el bloqueo manual con un solo clic'
          }
        >
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-inner ${
              hasPassword
                ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50'
                : 'bg-amber-500/25 text-amber-300 border border-amber-500/50'
            }`}
          >
            <Lock className={`w-4 h-4 ${hasPassword ? 'text-rose-300 animate-pulse' : 'text-amber-300'}`} />
          </div>

          <div className="flex flex-col text-left leading-tight">
            <div className="flex items-center gap-2">
              <span className="text-xs lg:text-[13px] font-black tracking-tight text-white group-hover:text-rose-100 transition-colors">
                Bloqueo manual con un solo clic
              </span>
              <span
                className={`text-[9px] uppercase px-1.5 py-0.5 rounded-full font-black tracking-wider ${
                  hasPassword
                    ? 'bg-rose-950/90 text-rose-300 border border-rose-700/80'
                    : 'bg-amber-950/90 text-amber-300 border border-amber-700/80'
                }`}
              >
                1 Clic
              </span>
            </div>
            <span className="text-[10px] text-slate-300 font-medium">
              {hasPassword ? 'Bloquea la aplicación al instante' : 'Activar contraseña de acceso'}
            </span>
          </div>
        </button>
      </div>

      {/* Right: Óvalo de versiones modificadas, Fecha, Acciones */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile 1-click lock button */}
        <button
          onClick={hasPassword && onLockApp ? onLockApp : () => onOpenSecurityModal && onOpenSecurityModal('password')}
          className={`md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer select-none active:scale-95 shadow-sm ${
            hasPassword
              ? 'bg-rose-950/90 hover:bg-rose-900 border-rose-500/80 text-rose-200'
              : 'bg-slate-900 border-amber-500/60 text-amber-300'
          }`}
          title="Bloqueo manual con un solo clic"
        >
          <Lock className="w-3.5 h-3.5 text-rose-300" />
          <span>Bloqueo 1 clic</span>
        </button>
        {/* ÓVALO DE VERSIÓN (Estilo de la captura con colores de la aplicación) */}
        {onOpenVersionsModal && (
          <button
            onClick={onOpenVersionsModal}
            className={`group relative flex flex-col items-center justify-center min-w-[92px] sm:min-w-[108px] px-4 sm:px-5 py-1 sm:py-1.5 rounded-full border-2 transition-all duration-200 cursor-pointer select-none active:scale-95 ${
              hasPendingUpdate
                ? 'bg-gradient-to-b from-[#2a1708] via-[#1f130b] to-[#0f0a05] border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                : 'bg-gradient-to-b from-[#0f2343] via-[#0b1a32] to-[#071222] border-blue-500/80 hover:border-cyan-400 shadow-[0_0_14px_rgba(59,130,246,0.25)] hover:shadow-[0_0_20px_rgba(6,182,212,0.45)]'
            }`}
            title={`Versión ${currentVersion || 'v1.0.0'} · Ver versiones modificadas en GitHub`}
          >
            {/* Indicador de actualización pendiente */}
            {hasPendingUpdate && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border-2 border-slate-900"></span>
              </span>
            )}

            {/* Texto superior: VERSIÓN */}
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-cyan-400 group-hover:text-cyan-300 transition-colors">
                VERSIÓN
              </span>
              {!hasPendingUpdate && (
                <span className="relative flex h-1.5 w-1.5">
                  {isCheckingVersion ? (
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-400 animate-pulse"></span>
                  ) : (
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
                  )}
                </span>
              )}
            </div>

            {/* Texto inferior: Versión activa */}
            <span className="text-xs sm:text-sm font-black text-white tracking-tight leading-none mt-0.5 font-mono">
              {currentVersion || 'v1.0.0'}
            </span>
          </button>
        )}

        {/* BOTÓN DE ACTUALIZACIÓN MANUAL (Comprobar si están todas las actualizaciones al día) */}
        {onCheckForUpdates && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={hasPendingUpdate && onInstallNow ? () => onInstallNow() : onCheckForUpdates}
              disabled={isCheckingVersion}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-60 ${
                hasPendingUpdate
                  ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white border-amber-400 shadow-md shadow-amber-950/40 ring-2 ring-amber-500/30'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border-slate-700/80 hover:border-cyan-500/60'
              }`}
              title="Comprobar si están todas las actualizaciones al día con GitHub"
            >
              {isCheckingVersion ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              ) : hasPendingUpdate ? (
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span className="hidden md:inline">
                {isCheckingVersion
                  ? 'Comprobando...'
                  : hasPendingUpdate
                  ? 'Actualizar ahora'
                  : 'Comprobar actualizaciones'}
              </span>
              <span className="md:hidden">
                {isCheckingVersion ? 'Buscando...' : hasPendingUpdate ? 'Actualizar' : 'Comprobar'}
              </span>
            </button>

            {onForceReload && (
              <button
                onClick={onForceReload}
                className="flex items-center justify-center p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer shadow-sm active:scale-90"
                title="Recargar la aplicación (limpia caché y carga los últimos cambios sin cerrar la app)"
                aria-label="Recargar aplicación"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* BOTÓN DE SEGURIDAD / BLOQUEO RÁPIDO */}
        {hasPassword && onLockApp ? (
          <button
            onClick={onLockApp}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-950/80 hover:bg-blue-900 border border-blue-700/80 hover:border-cyan-400 text-blue-200 hover:text-white transition-all shadow-sm cursor-pointer active:scale-95"
            title="Bloquear aplicación con contraseña ahora"
          >
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Bloquear</span>
          </button>
        ) : onOpenSecurityModal ? (
          <button
            onClick={() => onOpenSecurityModal('password')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900/80 hover:bg-slate-800 border border-slate-750 hover:border-slate-600 text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer active:scale-95"
            title="Configurar contraseña de acceso o copia de seguridad"
          >
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Seguridad</span>
          </button>
        ) : null}

        {/* Date badge: Fecha actual dinámica */}
        <div 
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-800 text-xs text-slate-300"
          title={`Fecha actual: ${todayFormatted}`}
        >
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-medium">{todayFormatted}</span>
        </div>
      </div>
    </header>
  );
}
