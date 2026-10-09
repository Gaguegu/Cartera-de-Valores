import React from 'react';
import { Menu, RefreshCw, Smartphone, Github, Sparkles, TrendingUp, Calendar, Bell } from 'lucide-react';
import { ActiveTab } from '../types/portfolio';

interface HeaderProps {
  currentTab: ActiveTab;
  onOpenMobileMenu: () => void;
  onOpenGuide: () => void;
  onResetData?: () => void;
  totalPortfolioValue: number;
}

export function Header({
  currentTab,
  onOpenMobileMenu,
  onOpenGuide,
  totalPortfolioValue,
}: HeaderProps) {
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
    <header className="sticky top-0 z-30 bg-[#0f1e36] border-b border-slate-800/80 px-4 sm:px-6 py-3 flex items-center justify-between shadow-md">
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

      {/* Right: Date, Action Buttons, GitHub & Mobile Helper */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Date badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-800 text-xs text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-blue-400" />
          <span>12/08/2026</span>
        </div>

        {/* GitHub & Mobile Guide Button */}
        <button
          onClick={onOpenGuide}
          className="relative group px-3 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-blue-900/40 transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Github className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">Subir a GitHub & Móvil</span>
          <span className="sm:hidden">GitHub / App</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
        </button>

        {/* Quick notification / status */}
        <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer">
          <Bell className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
}
