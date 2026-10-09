import { useState, useEffect, useCallback, useRef } from 'react';
import { AppVersionInfo, JustUpdatedNotification, ManualCheckFeedback } from '../types/version';
import {
  getCurrentVersionSha,
  fetchGitHubCommits,
  fetchDeployedVersion,
  applyAppUpdate,
  consumeJustUpdatedNotification,
  playUpdateChime,
  isSameCommit,
  APP_SEMANTIC_VERSION,
  isAutoUpdateEnabled,
  setAutoUpdateEnabled as saveAutoUpdatePref,
  getCachedHistory,
} from '../utils/versionService';

export function useAppUpdater() {
  const [currentVersionSha, setCurrentVersionSha] = useState<string>(() => getCurrentVersionSha());
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateAvailable, setUpdateAvailable] = useState<AppVersionInfo | null>(null);
  const [justUpdated, setJustUpdated] = useState<JustUpdatedNotification | null>(null);
  const [manualFeedback, setManualFeedback] = useState<ManualCheckFeedback | null>(null);
  const [history, setHistory] = useState<AppVersionInfo[]>(() => getCachedHistory());
  const [autoUpdate, setAutoUpdate] = useState<boolean>(() => isAutoUpdateEnabled());
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const justUpdatedTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if we just reloaded from an update completion
  useEffect(() => {
    const notice = consumeJustUpdatedNotification();
    if (notice) {
      setJustUpdated(notice);
      setCurrentVersionSha(notice.commitSha || getCurrentVersionSha());
      playUpdateChime();

      // Automatically hide celebration toast after 6 seconds
      justUpdatedTimerRef.current = setTimeout(() => {
        setJustUpdated(null);
      }, 6000);
    }

    return () => {
      if (justUpdatedTimerRef.current) {
        clearTimeout(justUpdatedTimerRef.current);
      }
    };
  }, []);

  /**
   * Check for updates from GitHub API and deployed version.
   * If isManual is true, provides user-facing feedback toast.
   */
  const checkForUpdates = useCallback(async (isManual = false) => {
    setIsChecking(true);
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }

    try {
      // 1. Fetch commits from GitHub
      const commits = await fetchGitHubCommits();
      const activeSha = getCurrentVersionSha();
      let latestCommit: AppVersionInfo | null = null;

      if (commits && commits.length > 0) {
        setHistory(commits);
        latestCommit = commits[0];
      }

      // 2. Fetch deployed version.json as backup
      const deployed = await fetchDeployedVersion();
      if (!latestCommit && deployed) {
        latestCommit = deployed;
      }

      const now = new Date();
      setLastChecked(now);

      if (latestCommit) {
        const upToDate = isSameCommit(latestCommit.commitSha, activeSha) ||
                         isSameCommit(latestCommit.version, activeSha);

        if (!upToDate) {
          // New update available!
          setUpdateAvailable(latestCommit);

          if (isManual) {
            setManualFeedback({
              status: 'update_available',
              message: `Nueva versión detectada (${latestCommit.version}): "${latestCommit.message}".`,
              version: latestCommit.version,
              commitSha: latestCommit.commitSha,
              timestamp: now,
            });
          }
        } else {
          // Everything is up to date!
          setUpdateAvailable(null);

          if (isManual) {
            setManualFeedback({
              status: 'up_to_date',
              message: `¡Todas las actualizaciones están al día! Tu aplicación tiene la versión más reciente (v${APP_SEMANTIC_VERSION} · ${activeSha}).`,
              version: APP_SEMANTIC_VERSION,
              commitSha: activeSha,
              timestamp: now,
            });

            // Auto-hide the "up to date" notification after 4.5 seconds
            feedbackTimerRef.current = setTimeout(() => {
              setManualFeedback(null);
            }, 4500);
          }
        }
      } else {
        // Fallback: up to date
        setUpdateAvailable(null);
        if (isManual) {
          setManualFeedback({
            status: 'up_to_date',
            message: `¡Todas las actualizaciones están al día! Estás en la última versión (v${APP_SEMANTIC_VERSION}).`,
            version: APP_SEMANTIC_VERSION,
            commitSha: activeSha,
            timestamp: now,
          });
          feedbackTimerRef.current = setTimeout(() => {
            setManualFeedback(null);
          }, 4500);
        }
      }
    } catch (e) {
      console.error('Error checking for updates:', e);
      if (isManual) {
        setManualFeedback({
          status: 'error',
          message: 'No se pudo conectar con GitHub en este momento. Inténtalo de nuevo más tarde.',
          timestamp: new Date(),
        });
        feedbackTimerRef.current = setTimeout(() => {
          setManualFeedback(null);
        }, 4500);
      }
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Silent initial check on mount only (no spam, no countdown)
  useEffect(() => {
    checkForUpdates(false);
  }, [checkForUpdates]);

  const handleInstallNow = (versionToInstall?: AppVersionInfo) => {
    const target = versionToInstall || updateAvailable;
    if (target) {
      setIsUpdating(true);
      applyAppUpdate(target);
    }
  };

  const handleToggleAutoUpdate = (enabled: boolean) => {
    setAutoUpdate(enabled);
    saveAutoUpdatePref(enabled);
  };

  const dismissJustUpdated = () => {
    if (justUpdatedTimerRef.current) {
      clearTimeout(justUpdatedTimerRef.current);
    }
    setJustUpdated(null);
  };

  const dismissManualFeedback = () => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    setManualFeedback(null);
  };

  return {
    currentVersion: APP_SEMANTIC_VERSION,
    currentVersionSha,
    isChecking,
    isUpdating,
    updateAvailable,
    justUpdated,
    manualFeedback,
    history,
    autoUpdate,
    lastChecked,
    checkForUpdates,
    handleInstallNow,
    handleToggleAutoUpdate,
    dismissJustUpdated,
    dismissManualFeedback,
  };
}
