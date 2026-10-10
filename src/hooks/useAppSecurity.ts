import { useState, useEffect, useCallback, useRef } from 'react';
import { hashMasterPassword, verifyMasterPassword } from '../utils/cryptoService';

export interface SecurityConfig {
  hasPassword: boolean;
  passwordHash: string;
  saltHex: string;
  hint: string;
  autoLockMinutes: number;
  lastUpdated: string;
}

const STORAGE_KEY_CONFIG = 'cartera_security_config';
const STORAGE_KEY_SESSION = 'cartera_session_token';

export function useAppSecurity() {
  const [config, setConfig] = useState<SecurityConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading security config:', e);
    }
    return {
      hasPassword: false,
      passwordHash: '',
      saltHex: '',
      hint: '',
      autoLockMinutes: 15,
      lastUpdated: '',
    };
  });

  // Determines if the screen is currently locked
  const [isLocked, setIsLocked] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (!saved) return false;
      const parsed: SecurityConfig = JSON.parse(saved);
      if (!parsed.hasPassword) return false;
      
      // If there is a password set, check if we have a valid session token in sessionStorage
      const sessionToken = sessionStorage.getItem(STORAGE_KEY_SESSION);
      return !sessionToken;
    } catch {
      return false;
    }
  });

  // Keep in-memory active password for quick backup encryption while session is open
  const sessionPasswordRef = useRef<string | null>(null);

  // Inactivity tracking for auto-lock
  useEffect(() => {
    if (!config.hasPassword || config.autoLockMinutes <= 0 || isLocked) {
      return;
    }

    let timeoutId: number;

    const resetTimer = () => {
      window.clearTimeout(timeoutId);
      const ms = config.autoLockMinutes * 60 * 1000;
      timeoutId = window.setTimeout(() => {
        setIsLocked(true);
        sessionStorage.removeItem(STORAGE_KEY_SESSION);
        sessionPasswordRef.current = null;
      }, ms);
    };

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach(evt => window.addEventListener(evt, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      window.clearTimeout(timeoutId);
      activityEvents.forEach(evt => window.removeEventListener(evt, resetTimer));
    };
  }, [config.hasPassword, config.autoLockMinutes, isLocked]);

  // Lock application immediately
  const lockApp = useCallback(() => {
    if (!config.hasPassword) return;
    sessionStorage.removeItem(STORAGE_KEY_SESSION);
    sessionPasswordRef.current = null;
    setIsLocked(true);
  }, [config.hasPassword]);

  // Unlock application
  const unlockApp = useCallback(
    async (password: string): Promise<{ success: boolean; error?: string }> => {
      if (!config.hasPassword) {
        setIsLocked(false);
        return { success: true };
      }

      if (!password || !password.trim()) {
        return { success: false, error: 'Por favor, introduce tu contraseña de acceso.' };
      }

      const isValid = await verifyMasterPassword(password, config.passwordHash, config.saltHex);
      if (isValid) {
        const token = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem(STORAGE_KEY_SESSION, token);
        sessionPasswordRef.current = password;
        setIsLocked(false);
        return { success: true };
      } else {
        return {
          success: false,
          error: 'Contraseña incorrecta. Verifica las mayúsculas y minúsculas.',
        };
      }
    },
    [config.hasPassword, config.passwordHash, config.saltHex]
  );

  // Setup initial master password
  const setupPassword = useCallback(
    async (password: string, hint = ''): Promise<{ success: boolean; error?: string }> => {
      if (!password || password.length < 4) {
        return { success: false, error: 'La contraseña debe tener al menos 4 caracteres.' };
      }

      try {
        const { hash, salt } = await hashMasterPassword(password);
        const newConfig: SecurityConfig = {
          hasPassword: true,
          passwordHash: hash,
          saltHex: salt,
          hint: hint.trim(),
          autoLockMinutes: config.autoLockMinutes || 15,
          lastUpdated: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(newConfig));
        setConfig(newConfig);

        // Auto unlock
        const token = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem(STORAGE_KEY_SESSION, token);
        sessionPasswordRef.current = password;
        setIsLocked(false);

        return { success: true };
      } catch (err: any) {
        return { success: false, error: `Error al configurar contraseña: ${err?.message || ''}` };
      }
    },
    [config.autoLockMinutes]
  );

  // Change existing password
  const changePassword = useCallback(
    async (
      currentPassword: string,
      newPassword: string,
      newHint = ''
    ): Promise<{ success: boolean; error?: string }> => {
      if (!config.hasPassword) {
        return setupPassword(newPassword, newHint);
      }

      const isCurrentValid = await verifyMasterPassword(currentPassword, config.passwordHash, config.saltHex);
      if (!isCurrentValid) {
        return { success: false, error: 'La contraseña actual no es correcta.' };
      }

      if (!newPassword || newPassword.length < 4) {
        return { success: false, error: 'La nueva contraseña debe tener al menos 4 caracteres.' };
      }

      try {
        const { hash, salt } = await hashMasterPassword(newPassword);
        const newConfig: SecurityConfig = {
          ...config,
          passwordHash: hash,
          saltHex: salt,
          hint: newHint !== undefined ? newHint.trim() : config.hint,
          lastUpdated: new Date().toISOString(),
        };

        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(newConfig));
        setConfig(newConfig);
        sessionPasswordRef.current = newPassword;

        return { success: true };
      } catch (err: any) {
        return { success: false, error: `Error al cambiar contraseña: ${err?.message || ''}` };
      }
    },
    [config, setupPassword]
  );

  // Remove password protection
  const removePassword = useCallback(
    async (currentPassword: string): Promise<{ success: boolean; error?: string }> => {
      if (!config.hasPassword) return { success: true };

      const isCurrentValid = await verifyMasterPassword(currentPassword, config.passwordHash, config.saltHex);
      if (!isCurrentValid) {
        return { success: false, error: 'La contraseña actual es incorrecta para desactivar la seguridad.' };
      }

      const clearedConfig: SecurityConfig = {
        hasPassword: false,
        passwordHash: '',
        saltHex: '',
        hint: '',
        autoLockMinutes: 0,
        lastUpdated: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(clearedConfig));
      sessionStorage.removeItem(STORAGE_KEY_SESSION);
      sessionPasswordRef.current = null;
      setConfig(clearedConfig);
      setIsLocked(false);

      return { success: true };
    },
    [config]
  );

  // Update auto-lock timeout
  const updateAutoLock = useCallback(
    (minutes: number) => {
      const updated = { ...config, autoLockMinutes: minutes };
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updated));
      setConfig(updated);
    },
    [config]
  );

  return {
    hasPassword: config.hasPassword,
    isLocked,
    hint: config.hint,
    autoLockMinutes: config.autoLockMinutes,
    sessionPassword: sessionPasswordRef.current,
    lockApp,
    unlockApp,
    setupPassword,
    changePassword,
    removePassword,
    updateAutoLock,
    setIsLocked,
  };
}
