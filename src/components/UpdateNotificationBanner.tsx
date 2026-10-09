import React from 'react';
import { Sparkles, RefreshCw, X, CheckCircle2, GitCommit, ArrowRight, Pause } from 'lucide-react';
import { AppVersionInfo, JustUpdatedNotification } from '../types/version';

interface UpdateNotificationBannerProps {
  updateAvailable: AppVersionInfo | null;
  countdown: number | null;
  justUpdated: JustUpdatedNotification | null;
  onInstallNow: (version?: AppVersionInfo) => void;
  onPauseCountdown: () => void;
  onDismissJustUpdated: () => void;
  onOpenVersionsModal: () => void;
}

export function UpdateNotificationBanner({
  updateAvailable,
  countdown,
  justUpdated,
  onInstallNow,
  onPauseCountdown,
  onDismissJustUpdated,
  onOpenVersionsModal,
}: UpdateNotificationBannerProps) {
  return (
    <>
      {/* 1. TOAST: Just Updated Notification (Celebration Toast) */}
      {justUpdated && (
        <div className="fixed top-4 right-4 sm:right-6 z-50 max-w-md w-[calc(100%-2rem)] bg-gradient-to-r from-emerald-950/95 via-slate-900/95 to-slate-900/95 border border-emerald-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  ¡Aplicación actualizada con éxito!
                </h4>
                <button
                  onClick={onDismissJustUpdated}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                  aria-label="Cerrar notificación"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                Se han aplicado las últimas modificaciones de GitHub:
                <span className="font-semibold text-emerald-300 ml-1">
                  "{justUpdated.message}"
                </span>
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                  v{justUpdated.version}
                </span>
                <button
                  onClick={() => {
                    onDismissJustUpdated();
                    onOpenVersionsModal();
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  Ver versiones modificadas <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. BANNER: Update Available / In-progress auto-update countdown */}
      {updateAvailable && !justUpdated && (
        <div className="sticky top-0 z-40 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 border-b border-blue-500/40 px-4 py-2.5 shadow-xl text-white">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5 text-center sm:text-left">
              <span className="p-1 rounded-lg bg-blue-500/30 text-amber-300 flex-shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <span className="font-bold">Nueva modificación detectada en GitHub:</span>{' '}
                <span className="font-mono text-blue-200 bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-400/30 font-semibold mr-1">
                  v{updateAvailable.version}
                </span>
                <span className="text-slate-200 hidden md:inline">
                  — "{updateAvailable.message}"
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {countdown !== null && (
                <span className="text-xs text-blue-200 bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-400/30 font-medium">
                  Actualizando en <strong className="text-amber-300 text-sm font-mono">{countdown}s</strong>
                </span>
              )}

              {countdown !== null ? (
                <button
                  onClick={onPauseCountdown}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
                  title="Pausar la actualización automática"
                >
                  <Pause className="w-3 h-3" /> Pausar
                </button>
              ) : null}

              <button
                onClick={() => onInstallNow(updateAvailable)}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/40 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Actualizar ya
              </button>

              <button
                onClick={onOpenVersionsModal}
                className="px-2.5 py-1 rounded-lg bg-blue-950/80 hover:bg-blue-800/80 text-blue-200 text-xs font-semibold border border-blue-400/30 transition-colors"
              >
                Ver historial
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
