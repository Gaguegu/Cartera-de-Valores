import { AppVersionInfo, JustUpdatedNotification } from '../types/version';

export const GITHUB_REPO = 'Gaguegu/Cartera-de-Valores';
export const GITHUB_COMMITS_API = `https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=15`;
export const APP_SEMANTIC_VERSION = '2.9.9';

const KEY_CURRENT_VERSION = 'cartera_current_version_sha';
const KEY_JUST_UPDATED = 'cartera_just_updated_notification';
const KEY_AUTO_UPDATE_ENABLED = 'cartera_auto_update_enabled';
const KEY_CACHED_HISTORY = 'cartera_cached_versions_history';

// Current latest deployed commit fallback
export const INITIAL_FALLBACK_VERSION = '8e54940';

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
  // Initialize with initial fallback
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
 * Checks if auto-update preference is enabled (default: false to avoid violent reloads).
 */
export function isAutoUpdateEnabled(): boolean {
  const val = localStorage.getItem(KEY_AUTO_UPDATE_ENABLED);
  return val === 'true'; // Default is FALSE: no violent surprise reloads
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
 * Sets a notification to be shown after the app reloads.
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
      author: data.author || 'Gaguegu',
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
      throw new Error(`GitHub API HTTP ${response.status}`);
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
        author: item.commit?.author?.name || item.author?.login || 'Gaguegu',
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
 * Retrieves cached versions history.
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

  // Fallback initial list if completely offline or first load
  return [
    {
      version: '8e54940',
      commitSha: '8e54940',
      message: 'feat: implement automatic update checker and version tracking',
      date: '2026-10-09T17:25:00Z',
      author: 'Gaguegu',
      url: `https://github.com/${GITHUB_REPO}/commit/8e54940`,
      isCurrent: isSameCommit(currentSha, '8e54940'),
    },
    {
      version: '0e15465',
      commitSha: '0e15465',
      message: 'build: upgrade esbuild and update dependency install',
      date: '2026-10-09T16:58:01Z',
      author: 'Gaguegu',
      url: `https://github.com/${GITHUB_REPO}/commit/0e15465`,
      isCurrent: isSameCommit(currentSha, '0e15465'),
    },
    {
      version: 'fb5cec6',
      commitSha: 'fb5cec6',
      message: 'build: initialize project dependencies',
      date: '2026-10-09T16:53:30Z',
      author: 'Gaguegu',
      url: `https://github.com/${GITHUB_REPO}/commit/fb5cec6`,
      isCurrent: isSameCommit(currentSha, 'fb5cec6'),
    },
    {
      version: '054dc0a',
      commitSha: '054dc0a',
      message: 'ci: update deployment workflow and dependency install',
      date: '2026-10-09T16:08:13Z',
      author: 'Gaguegu',
      url: `https://github.com/${GITHUB_REPO}/commit/054dc0a`,
      isCurrent: isSameCommit(currentSha, '054dc0a'),
    },
  ];
}

/**
 * Triggers the actual update by saving state and performing a clean reload.
 */
export function applyAppUpdate(newVersion: AppVersionInfo): void {
  const targetSha = (newVersion.commitSha || newVersion.version || INITIAL_FALLBACK_VERSION).substring(0, 7);
  
  // Save new version and prepare notification for reload
  setCurrentVersionSha(targetSha);
  setJustUpdatedNotification({
    version: APP_SEMANTIC_VERSION,
    commitSha: targetSha,
    message: newVersion.message || 'Actualización aplicada correctamente',
    date: new Date().toISOString(),
  });

  // Try to update Service Worker if available
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(reg => reg.update());
    }).catch(() => {});
  }

  // Force cache-busting reload
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('_v', targetSha);
  currentUrl.searchParams.set('_t', Date.now().toString());
  window.location.href = currentUrl.toString();
}

/**
 * Subtle sound effect when app update is completed
 */
export function playUpdateChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Nice double chime (bell-like)
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.4);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12); // A5
    gain2.gain.setValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch {
    // Ignore audio errors if blocked by browser
  }
}
