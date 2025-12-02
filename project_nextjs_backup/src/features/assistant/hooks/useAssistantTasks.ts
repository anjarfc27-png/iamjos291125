"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

export type AssistantTask = {
  id: string;
  submissionId: string;
  submissionTitle: string;
  stage: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type UseAssistantTasksReturn = {
  tasks: AssistantTask[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
};

/**
 * Custom hook untuk load tasks assigned to assistant
 */
export function useAssistantTasks(): UseAssistantTasksReturn {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<AssistantTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/editor/assistant/tasks");
      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Failed to load tasks");
      }

      setTasks(data.tasks || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load tasks";
      setError(errorMessage);
      console.error("Error loading tasks:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    loading,
    error,
    reload: loadTasks,
  };
}

