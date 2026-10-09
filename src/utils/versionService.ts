import { AppVersionInfo, JustUpdatedNotification } from '../types/version';

export const GITHUB_REPO = 'Gaguegu/Cartera-de-Valores';
export const GITHUB_COMMITS_API = `https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=15`;

const KEY_CURRENT_VERSION = 'cartera_current_version_sha';
const KEY_JUST_UPDATED = 'cartera_just_updated_notification';
const KEY_AUTO_UPDATE_ENABLED = 'cartera_auto_update_enabled';
const KEY_CACHED_HISTORY = 'cartera_cached_versions_history';

// Default initial version if not yet set in storage
export const INITIAL_FALLBACK_VERSION = '0e15465';

/**
 * Gets the currently active/installed commit SHA in this client.
 */
export function getCurrentVersionSha(): string {
  const saved = localStorage.getItem(KEY_CURRENT_VERSION);
  if (saved) return saved;
  // Initialize with initial fallback
  localStorage.setItem(KEY_CURRENT_VERSION, INITIAL_FALLBACK_VERSION);
  return INITIAL_FALLBACK_VERSION;
}

/**
 * Sets the currently active/installed version SHA.
 */
export function setCurrentVersionSha(sha: string): void {
  localStorage.setItem(KEY_CURRENT_VERSION, sha);
}

/**
 * Checks if auto-update is enabled (default: true).
 */
export function isAutoUpdateEnabled(): boolean {
  const val = localStorage.getItem(KEY_AUTO_UPDATE_ENABLED);
  return val === null ? true : val === 'true';
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
    return JSON.parse(raw);
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
    return {
      version: (data.version || data.commitSha || '').substring(0, 7) || 'latest',
      commitSha: data.commitSha || data.version || '',
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
        isCurrent: shortSha === currentSha || item.sha === currentSha,
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
  if (raw) {
    try {
      const currentSha = getCurrentVersionSha();
      const parsed: AppVersionInfo[] = JSON.parse(raw);
      return parsed.map(p => ({
        ...p,
        isCurrent: p.version === currentSha || p.commitSha === currentSha,
      }));
    } catch {
      // ignore
    }
  }

  // Fallback initial list if completely offline or first load
  const currentSha = getCurrentVersionSha();
  return [
    {
      version: '0e15465',
      commitSha: '0e15465',
      message: 'build: upgrade esbuild and update dependency install',
      date: '2026-10-09T16:58:01Z',
      author: 'Gaguegu',
      url: `https://github.com/${GITHUB_REPO}/commit/0e15465`,
      isCurrent: currentSha === '0e15465',
    },
    {
      version: 'fb5cec6',
      commitSha: 'fb5cec6',
      message: 'build: initialize project dependencies',
      date: '2026-10-09T16:53:30Z',
      author: 'Gaguegu',
      url: `https://github.com/${GITHUB_REPO}/commit/fb5cec6`,
      isCurrent: currentSha === 'fb5cec6',
    },
    {
      version: '054dc0a',
      commitSha: '054dc0a',
      message: 'ci: update deployment workflow and dependency install',
      date: '2026-10-09T16:08:13Z',
      author: 'Gaguegu',
      url: `https://github.com/${GITHUB_REPO}/commit/054dc0a`,
      isCurrent: currentSha === '054dc0a',
    },
  ];
}

/**
 * Triggers the actual update by refreshing the page and applying cache busters.
 */
export function applyAppUpdate(newVersion: AppVersionInfo): void {
  // Save new version and prepare notification for reload
  setCurrentVersionSha(newVersion.version);
  setJustUpdatedNotification({
    version: newVersion.version,
    message: newVersion.message,
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
  currentUrl.searchParams.set('_v', newVersion.version);
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
