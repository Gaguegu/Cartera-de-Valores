import { useState, useEffect, useCallback, useRef } from 'react';
import { AppVersionInfo, JustUpdatedNotification } from '../types/version';
import {
  getCurrentVersionSha,
  fetchGitHubCommits,
  fetchDeployedVersion,
  applyAppUpdate,
  consumeJustUpdatedNotification,
  playUpdateChime,
  isAutoUpdateEnabled,
  setAutoUpdateEnabled as saveAutoUpdatePref,
  getCachedHistory,
} from '../utils/versionService';

export function useAppUpdater() {
  const [currentVersion, setCurrentVersion] = useState<string>(() => getCurrentVersionSha());
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [updateAvailable, setUpdateAvailable] = useState<AppVersionInfo | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [justUpdated, setJustUpdated] = useState<JustUpdatedNotification | null>(null);
  const [history, setHistory] = useState<AppVersionInfo[]>(() => getCachedHistory());
  const [autoUpdate, setAutoUpdate] = useState<boolean>(() => isAutoUpdateEnabled());
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if we just reloaded from an update
  useEffect(() => {
    const notice = consumeJustUpdatedNotification();
    if (notice) {
      setJustUpdated(notice);
      setCurrentVersion(notice.version);
      // Play celebratory sound chime
      playUpdateChime();
    }
  }, []);

  const checkForUpdates = useCallback(async (isManual = false) => {
    setIsChecking(true);
    try {
      // 1. Fetch commits from GitHub
      const commits = await fetchGitHubCommits();
      if (commits && commits.length > 0) {
        setHistory(commits);
        const latest = commits[0];
        const activeSha = getCurrentVersionSha();

        // Check if latest commit is different from active
        if (latest && latest.version !== activeSha && latest.commitSha !== activeSha) {
          // If we are not already counting down for this version
          setUpdateAvailable(latest);
          if (autoUpdate && !countdownTimerRef.current) {
            setCountdown(4); // 4-second countdown before refreshing
          }
        } else {
          // No update available
          if (isManual) {
            setUpdateAvailable(null);
          }
        }
      }

      // 2. Also check deployed version.json as auxiliary verification
      const deployed = await fetchDeployedVersion();
      if (deployed) {
        const activeSha = getCurrentVersionSha();
        if (deployed.version !== activeSha && deployed.commitSha !== activeSha) {
          setUpdateAvailable(prev => prev || deployed);
          if (autoUpdate && !countdownTimerRef.current) {
            setCountdown(4);
          }
        }
      }

      setLastChecked(new Date());
    } catch (e) {
      console.error('Error checking for updates:', e);
    } finally {
      setIsChecking(false);
    }
  }, [autoUpdate]);

  // Initial check on mount
  useEffect(() => {
    checkForUpdates(false);
  }, [checkForUpdates]);

  // Periodic interval checking (every 60s) and window focus
  useEffect(() => {
    const interval = setInterval(() => {
      checkForUpdates(false);
    }, 60000);

    const onFocus = () => {
      checkForUpdates(false);
    };

    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [checkForUpdates]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      countdownTimerRef.current = setTimeout(() => {
        setCountdown(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (countdown === 0 && updateAvailable) {
      // Execute the update
      applyAppUpdate(updateAvailable);
    }

    return () => {
      if (countdownTimerRef.current) {
        clearTimeout(countdownTimerRef.current);
      }
    };
  }, [countdown, updateAvailable]);

  const handleInstallNow = (versionToInstall?: AppVersionInfo) => {
    const target = versionToInstall || updateAvailable;
    if (target) {
      applyAppUpdate(target);
    }
  };

  const handlePauseUpdate = () => {
    if (countdownTimerRef.current) {
      clearTimeout(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
  };

  const handleToggleAutoUpdate = (enabled: boolean) => {
    setAutoUpdate(enabled);
    saveAutoUpdatePref(enabled);
    if (!enabled && countdown !== null) {
      handlePauseUpdate();
    }
  };

  const dismissJustUpdated = () => {
    setJustUpdated(null);
  };

  return {
    currentVersion,
    isChecking,
    updateAvailable,
    countdown,
    justUpdated,
    history,
    autoUpdate,
    lastChecked,
    checkForUpdates,
    handleInstallNow,
    handlePauseUpdate,
    handleToggleAutoUpdate,
    dismissJustUpdated,
  };
}
