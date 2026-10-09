import { AppVersionInfo, JustUpdatedNotification } from '../types/version';

export const GITHUB_REPO = 'Gaguegu/Cartera-de-Valores';
export const GITHUB_COMMITS_API = `https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=15`;
export const APP_SEMANTIC_VERSION = 'v1.0.0';

const KEY_CURRENT_VERSION = 'cartera_current_version_sha';
const KEY_JUST_UPDATED = 'cartera_just_updated_notification';
const KEY_AUTO_UPDATE_ENABLED = 'cartera_auto_update_enabled';
const KEY_CACHED_HISTORY = 'cartera_cached_versions_history';

// Latest commit from GitHub repository (Gaguegu/Cartera-de-Valores)
export const INITIAL_FALLBACK_VERSION = '1a1718d';

/**
 * Checks if two commits are identical by comparing their short SHAs.
 */
export function isSameCommit(sha1?: string | null, sha2?: string | null): boolean {
  if (!sha1 || !sha2) return false;
  const clean1 = sha1.trim().substring(0, 7).toLowerCase();
  const clean2 = sha2.trim().substring(0, 7).toLowerCase();
  return clean1 === clean2;
}

/**
 * Gets the currently active/installed commit SHA in this client.
 */
export function getCurrentVersionSha(): string {
  const saved = localStorage.getItem(KEY_CURRENT_VERSION);
  if (saved && saved.trim().length > 0) {
    return saved.trim().substring(0, 7);
  }
  // Initialize with the current repository version
  localStorage.setItem(KEY_CURRENT_VERSION, INITIAL_FALLBACK_VERSION);
  return INITIAL_FALLBACK_VERSION;
}

/**
 * Sets the currently active/installed version SHA.
 */
export function setCurrentVersionSha(sha: string): void {
  const cleanSha = sha.trim().substring(0, 7);
  localStorage.setItem(KEY_CURRENT_VERSION, cleanSha);
}

/**
 * Checks if auto-update preference is enabled (default: false to avoid loops).
 */
export function isAutoUpdateEnabled(): boolean {
  const val = localStorage.getItem(KEY_AUTO_UPDATE_ENABLED);
  return val === 'true';
}

/**
 * Sets auto-update preference.
 */
export function setAutoUpdateEnabled(enabled: boolean): void {
  localStorage.setItem(KEY_AUTO_UPDATE_ENABLED, enabled ? 'true' : 'false');
}

/**
 * Gets and clears any post-update notification.
 */
export function consumeJustUpdatedNotification(): JustUpdatedNotification | null {
  const raw = localStorage.getItem(KEY_JUST_UPDATED);
  if (!raw) return null;
  try {
    localStorage.removeItem(KEY_JUST_UPDATED);
    const parsed = JSON.parse(raw);
    return {
      version: parsed.version || APP_SEMANTIC_VERSION,
      commitSha: parsed.commitSha || INITIAL_FALLBACK_VERSION,
      message: parsed.message || 'Actualización a la última versión',
      date: parsed.date || new Date().toISOString(),
    };
  } catch {
    localStorage.removeItem(KEY_JUST_UPDATED);
    return null;
  }
}

/**
 * Sets a notification to be shown after the app updates.
 */
export function setJustUpdatedNotification(notification: JustUpdatedNotification): void {
  localStorage.setItem(KEY_JUST_UPDATED, JSON.stringify(notification));
}

/**
 * Fetches the version.json file deployed with the app.
 */
export async function fetchDeployedVersion(): Promise<AppVersionInfo | null> {
  try {
    const res = await fetch(`./version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    const shortSha = (data.commitSha || data.version || '').substring(0, 7);
    return {
      version: data.version || APP_SEMANTIC_VERSION,
      commitSha: shortSha || INITIAL_FALLBACK_VERSION,
      message: data.message || 'Actualización de la aplicación',
      date: data.buildTime || new Date().toISOString(),
      author: data.author || 'Ansama',
      url: `https://github.com/${GITHUB_REPO}/commit/${data.commitSha || ''}`,
    };
  } catch {
    return null;
  }
}

/**
 * Fetches recent commit history directly from GitHub API.
 */
export async function fetchGitHubCommits(): Promise<AppVersionInfo[]> {
  try {
    const response = await fetch(GITHUB_COMMITS_API, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      console.warn(`GitHub API returned status ${response.status}, falling back to cache`);
      return getCachedHistory();
    }

    const data = await response.json();
    if (!Array.isArray(data)) return getCachedHistory();

    const currentSha = getCurrentVersionSha();

    const history: AppVersionInfo[] = data.map((item: any) => {
      const shortSha = item.sha.substring(0, 7);
      const firstLineMsg = (item.commit?.message || 'Actualización').split('\n')[0];
      return {
        version: shortSha,
        commitSha: item.sha,
        message: firstLineMsg,
        date: item.commit?.author?.date || new Date().toISOString(),
        author: item.commit?.author?.name || item.author?.login || 'Ansama',
        url: item.html_url || `https://github.com/${GITHUB_REPO}/commit/${item.sha}`,
        isCurrent: isSameCommit(shortSha, currentSha),
      };
    });

    // Cache to localStorage
    if (history.length > 0) {
      localStorage.setItem(KEY_CACHED_HISTORY, JSON.stringify(history));
    }

    return history;
  } catch (error) {
    console.warn('Could not fetch commits directly from GitHub API, using cache:', error);
    return getCachedHistory();
  }
}

/**
 * Retrieves cached versions history or fallback repository list.
 */
export function getCachedHistory(): AppVersionInfo[] {
  const raw = localStorage.getItem(KEY_CACHED_HISTORY);
  const currentSha = getCurrentVersionSha();

  if (raw) {
    try {
      const parsed: AppVersionInfo[] = JSON.parse(raw);
      return parsed.map(p => ({
        ...p,
        isCurrent: isSameCommit(p.version, currentSha) || isSameCommit(p.commitSha, currentSha),
      }));
    } catch {
      // ignore
    }
  }

  // Fallback initial list matching GitHub repository commits
  return [
    {
      version: '1a1718d',
      commitSha: '1a1718d859d8ad7c83bbcbb77d794e6eeeb05d19',
      message: 'feat: implement manual update check functionality',
      date: '2026-10-09T18:02:26Z',
      author: 'Ansama',
      url: `https://github.com/${GITHUB_REPO}/commit/1a1718d859d8ad7c83bbcbb77d794e6eeeb05d19`,
      isCurrent: isSameCommit(currentSha, '1a1718d'),
    },
    {
      version: '755adff',
      commitSha: '755adff4c9af6a38cf81ac9a3cae4bc22483530a',
      message: 'feat: implement manual update check functionality',
      date: '2026-10-09T17:50:53Z',
      author: 'Ansama',
      url: `https://github.com/${GITHUB_REPO}/commit/755adff4c9af6a38cf81ac9a3cae4bc22483530a`,
      isCurrent: isSameCommit(currentSha, '755adff'),
    },
    {
      version: '8e54940',
      commitSha: '8e54940213992b3fc1a33f1e7eabd6a2d0c76d98',
      message: 'feat: implement automatic update checker and version tracking',
      date: '2026-10-09T17:33:24Z',
      author: 'Ansama',
      url: `https://github.com/${GITHUB_REPO}/commit/8e54940213992b3fc1a33f1e7eabd6a2d0c76d98`,
      isCurrent: isSameCommit(currentSha, '8e54940'),
    },
    {
      version: '0e15465',
      commitSha: '0e154658255c99b2cdbf7a9965b9cc7f7ef9680f',
      message: 'build: upgrade esbuild and update dependency install',
      date: '2026-10-09T16:58:01Z',
      author: 'Ansama',
      url: `https://github.com/${GITHUB_REPO}/commit/0e154658255c99b2cdbf7a9965b9cc7f7ef9680f`,
      isCurrent: isSameCommit(currentSha, '0e15465'),
    },
    {
      version: 'fb5cec6',
      commitSha: 'fb5cec673bcd417443aa4a0d7e0130b3da5dca79',
      message: 'build: initialize project dependencies',
      date: '2026-10-09T16:53:30Z',
      author: 'Ansama',
      url: `https://github.com/${GITHUB_REPO}/commit/fb5cec673bcd417443aa4a0d7e0130b3da5dca79`,
      isCurrent: isSameCommit(currentSha, 'fb5cec6'),
    },
    {
      version: '054dc0a',
      commitSha: '054dc0ad387f0f9d38157dae7424eeaeb7fde2cd',
      message: 'ci: update deployment workflow and dependency install',
      date: '2026-10-09T16:08:13Z',
      author: 'Ansama',
      url: `https://github.com/${GITHUB_REPO}/commit/054dc0ad387f0f9d38157dae7424eeaeb7fde2cd`,
      isCurrent: isSameCommit(currentSha, '054dc0a'),
    },
    {
      version: 'ad1eee0',
      commitSha: 'ad1eee0bcda48627a7fcb166869b7b082cc000be',
      message: 'feat: initial project scaffold',
      date: '2026-10-09T15:54:07Z',
      author: 'Ansama',
      url: `https://github.com/${GITHUB_REPO}/commit/ad1eee0bcda48627a7fcb166869b7b082cc000be`,
      isCurrent: isSameCommit(currentSha, 'ad1eee0'),
    },
    {
      version: 'a85ac28',
      commitSha: 'a85ac2838501c94df36769f0a9d2d1be6d7dff7d',
      message: 'Initial commit',
      date: '2026-10-09T15:51:27Z',
      author: 'Ansama',
      url: `https://github.com/${GITHUB_REPO}/commit/a85ac2838501c94df36769f0a9d2d1be6d7dff7d`,
      isCurrent: isSameCommit(currentSha, 'a85ac28'),
    },
  ];
}

/**
 * Applies an update cleanly in client storage without causing disruptive infinite reloads.
 */
export function applyAppUpdate(newVersion: AppVersionInfo): JustUpdatedNotification {
  const targetSha = (newVersion.commitSha || newVersion.version || INITIAL_FALLBACK_VERSION).substring(0, 7);
  
  // Set current version in local storage
  setCurrentVersionSha(targetSha);

  const notification: JustUpdatedNotification = {
    version: newVersion.version || APP_SEMANTIC_VERSION,
    commitSha: targetSha,
    message: newVersion.message || 'Actualización completada a la última versión',
    date: new Date().toISOString(),
  };

  // Store update banner confirmation
  setJustUpdatedNotification(notification);

  return notification;
}

/**
 * Sound notification on successful update.
 */
export function playUpdateChime() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch {
    // AudioContext might be blocked until user gesture, safely ignore
  }
}
