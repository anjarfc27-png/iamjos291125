"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

type SettingsMap = Record<string, unknown>;

type SettingsApiResponse<T extends SettingsMap> =
  | { ok: true; settings: T }
  | { ok: false; message?: string };

export type UseJournalSettingsOptions = {
  section: string;
  journalId?: string;
  autoLoad?: boolean;
};

export type UseJournalSettingsReturn<T extends SettingsMap> = {
  settings: T;
  loading: boolean;
  error: string | null;
  saveSettings: (newSettings: Partial<T>) => Promise<boolean>;
  reload: () => Promise<void>;
  journalId: string | null;
};

/**
 * Custom hook untuk load dan save journal settings dari database
 * Menggantikan localStorage dengan database integration
 */
export function useJournalSettings<T extends SettingsMap = SettingsMap>(
  options: UseJournalSettingsOptions
): UseJournalSettingsReturn<T> {
  const { section, journalId: providedJournalId, autoLoad = true } = options;
  const { user } = useAuth();
  const [settings, setSettings] = useState<T>({} as T);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  // Get journal ID from props or user roles
  const getJournalId = useCallback((): string | null => {
    if (providedJournalId) {
      return providedJournalId;
    }
    if (user?.roles && user.roles.length > 0) {
      const journalRole = user.roles.find((r) => r.context_id);
      return journalRole?.context_id || null;
    }
    return null;
  }, [providedJournalId, user]);

  // Load settings from API
  const loadSettings = useCallback(async () => {
    const currentJournalId = getJournalId();
    if (!currentJournalId) {
      setError("Journal ID not found");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/editor/settings/${section}?journalId=${currentJournalId}`
      );
      const data = (await response.json()) as SettingsApiResponse<T>;

      if (!response.ok) {
        throw new Error(response.statusText || "Failed to load settings");
      }
      if (!data.ok) {
        throw new Error(data.message || "Failed to load settings");
      }

      setSettings(data.settings ?? ({} as T));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load settings";
      setError(errorMessage);
      console.error("Error loading settings:", err);
    } finally {
      setLoading(false);
    }
  }, [section, getJournalId]);

  // Save settings to API
  const saveSettings = useCallback(
    async (newSettings: Partial<T>): Promise<boolean> => {
      const currentJournalId = getJournalId();
      if (!currentJournalId) {
        setError("Journal ID not found");
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/editor/settings/${section}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            journalId: currentJournalId,
            settings: newSettings,
          }),
        });

        const data = (await response.json()) as SettingsApiResponse<T>;

        if (!response.ok) {
          throw new Error(response.statusText || "Failed to save settings");
        }
        if (!data.ok) {
          throw new Error(data.message || "Failed to save settings");
        }

        // Update local state with saved settings
        setSettings((prev) => ({ ...prev, ...(data.settings ?? ({} as T)) }));
        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to save settings";
        setError(errorMessage);
        console.error("Error saving settings:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [section, getJournalId]
  );

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad && user) {
      loadSettings();
    }
  }, [autoLoad, user, loadSettings]);

  const [currentJournalId, setCurrentJournalId] = useState<string | null>(null);

  // Update currentJournalId when it changes
  useEffect(() => {
    const id = getJournalId();
    setCurrentJournalId(id);
  }, [getJournalId]);

  return {
    settings,
    loading,
    error,
    saveSettings,
    reload: loadSettings,
    journalId: currentJournalId,
  };
}

/**
 * Helper hook untuk migrate localStorage data to database
 * Call this once when migrating from localStorage to database
 */
export function useMigrateLocalStorageToDatabase(
  section: string,
  localStorageKeys: string[],
  journalId?: string
) {
  const { settings, saveSettings, loading } = useJournalSettings({
    section,
    journalId,
    autoLoad: false,
  });
  const [migrating, setMigrating] = useState(false);
  const [migrated, setMigrated] = useState(false);

  const migrate = useCallback(async () => {
    if (typeof window === "undefined" || migrated) {
      return;
    }

    setMigrating(true);

    try {
      // Check if settings already exist in database
      if (Object.keys(settings).length > 0) {
        // Settings already exist, skip migration
        setMigrated(true);
        setMigrating(false);
        return;
      }

      // Load from localStorage
      const localStorageData: Record<string, unknown> = {};
      for (const key of localStorageKeys) {
        const item = localStorage.getItem(`ojs_settings_${key}`);
        if (item) {
          try {
            localStorageData[key] = JSON.parse(item);
          } catch {
            localStorageData[key] = item;
          }
        }
      }

      // Save to database if there's data
      if (Object.keys(localStorageData).length > 0) {
        await saveSettings(localStorageData);
        setMigrated(true);
      }
    } catch (error) {
      console.error("Error migrating localStorage to database:", error);
    } finally {
      setMigrating(false);
    }
  }, [localStorageKeys, settings, saveSettings, migrated]);

  return { migrate, migrating, migrated };
}

