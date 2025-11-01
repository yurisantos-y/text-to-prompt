/**
 * Secure storage utility using chrome.storage API
 * Replaces localStorage for sensitive data like API keys
 */

import { AIProvider } from '@/types';

export interface SecureSettings {
  provider: AIProvider;
  apiKey: string;
  isConfigured: boolean;
  // Add timestamp for key rotation tracking
  lastUpdated?: number;
}

/**
 * Encrypt API key before storage (basic obfuscation)
 * Note: This is NOT strong encryption, just obfuscation.
 * Chrome storage is already encrypted at rest.
 */
function obfuscate(text: string): string {
  // Simple base64 encoding for obfuscation
  // The main security comes from chrome.storage being encrypted
  return btoa(text);
}

/**
 * Decrypt API key after retrieval
 */
function deobfuscate(encoded: string): string {
  try {
    return atob(encoded);
  } catch {
    return '';
  }
}

/**
 * Secure storage utilities using chrome.storage.local
 */
export const secureStorage = {
  /**
   * Get settings from secure storage
   */
  async getSettings(): Promise<SecureSettings | null> {
    try {
      const result = await chrome.storage.local.get(['secureSettings']);
      
      if (!result.secureSettings) {
        return null;
      }

      const settings = result.secureSettings as SecureSettings;
      
      // Deobfuscate the API key
      if (settings.apiKey) {
        settings.apiKey = deobfuscate(settings.apiKey);
      }

      return settings;
    } catch (error) {
      console.error('[SecureStorage] Failed to get settings:', error);
      return null;
    }
  },

  /**
   * Save settings to secure storage
   */
  async saveSettings(
    provider: AIProvider,
    apiKey: string,
    isConfigured: boolean
  ): Promise<boolean> {
    try {
      const settings: SecureSettings = {
        provider,
        apiKey: obfuscate(apiKey), // Obfuscate before storing
        isConfigured,
        lastUpdated: Date.now(),
      };

      await chrome.storage.local.set({ secureSettings: settings });
      return true;
    } catch (error) {
      console.error('[SecureStorage] Failed to save settings:', error);
      return false;
    }
  },

  /**
   * Clear all settings from secure storage
   */
  async clearSettings(): Promise<boolean> {
    try {
      await chrome.storage.local.remove(['secureSettings']);
      return true;
    } catch (error) {
      console.error('[SecureStorage] Failed to clear settings:', error);
      return false;
    }
  },

  /**
   * Migrate from localStorage to chrome.storage
   * This helps transition existing users
   */
  async migrateFromLocalStorage(): Promise<boolean> {
    try {
      // Check if there's data in localStorage
      const oldData = localStorage.getItem('text-to-prompt-settings');
      
      if (!oldData) {
        return false; // Nothing to migrate
      }

      const parsed = JSON.parse(oldData) as SecureSettings;
      
      // Save to chrome.storage
      await this.saveSettings(parsed.provider, parsed.apiKey, parsed.isConfigured);
      
      // Clear from localStorage
      localStorage.removeItem('text-to-prompt-settings');
      
      console.log('[SecureStorage] Successfully migrated from localStorage');
      return true;
    } catch (error) {
      console.error('[SecureStorage] Migration failed:', error);
      return false;
    }
  },

  /**
   * Check if settings are stored in old localStorage
   */
  hasLegacyStorage(): boolean {
    try {
      return localStorage.getItem('text-to-prompt-settings') !== null;
    } catch {
      return false;
    }
  },
};

/**
 * Legacy wrapper for backward compatibility with old storage API
 * @deprecated Use secureStorage instead
 * This allows gradual migration of code
 */
export const legacyStorage = {
  getSettings: (): SecureSettings | null => {
    // For backward compatibility, try to get from localStorage first
    // Then suggest migration
    const legacyData = localStorage.getItem('text-to-prompt-settings');
    if (legacyData) {
      console.warn('[Storage] Using legacy localStorage. Please migrate to secure storage.');
      try {
        return JSON.parse(legacyData) as SecureSettings;
      } catch {
        return null;
      }
    }
    
    // Note: This is now async in secureStorage, so this sync version
    // should be gradually replaced
    return null;
  },

  saveSettings: (
    provider: AIProvider,
    apiKey: string,
    isConfigured: boolean
  ): void => {
    console.warn('[Storage] Using legacy localStorage. Please migrate to secure storage.');
    localStorage.setItem(
      'text-to-prompt-settings',
      JSON.stringify({ provider, apiKey, isConfigured })
    );
  },

  clearSettings: (): void => {
    localStorage.removeItem('text-to-prompt-settings');
  },
};
