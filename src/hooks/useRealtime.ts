"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getOrgContext } from "@/lib/api";

// ── Types for real-time events ──────────────────────────────────────────────

export type RealtimeEventType =
  | "incident.new"
  | "incident.resolved"
  | "incident.updated"
  | "check.completed"
  | "dependency.down"
  | "dependency.recovered"
  | "evidence.generated";

export interface RealtimeEvent {
  type: RealtimeEventType;
  org_id: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

export interface UseRealtimeOptions {
  /** Polling interval in ms (default: 5000 for incidents, 10000 for checks) */
  interval?: number;
  /** Whether the realtime hook is enabled */
  enabled?: boolean;
  /** Event types to listen for */
  events?: RealtimeEventType[];
}

export interface UseRealtimeReturn {
  /** Latest events (most recent first) */
  events: RealtimeEvent[];
  /** Whether there are unread events */
  hasUnread: boolean;
  /** Clear all events */
  clearEvents: () => void;
  /** Connection status */
  status: "connecting" | "connected" | "polling" | "disconnected" | "error";
  /** Last poll timestamp */
  lastPollAt: Date | null;
}

// ── Real-time hook using polling (upgradeable to WebSocket) ─────────────────

/**
 * useRealtime — provides real-time event updates using polling.
 * 
 * Currently uses TanStack Query's built-in refetchInterval for polling since
 * the API does not yet expose WebSocket endpoints. When WebSocket support
 * is added to the API, this hook can be upgraded to use native WebSocket
 * while maintaining the same interface.
 * 
 * Usage:
 *   const { events, hasUnread, clearEvents, status } = useRealtime({
 *     events: ["incident.new", "check.completed", "dependency.down"],
 *   });
 */
export function useRealtime(options: UseRealtimeOptions = {}): UseRealtimeReturn {
  const {
    interval = 5000,
    enabled = true,
    events: eventFilter,
  } = options;

  const queryClient = useQueryClient();
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [status, setStatus] = useState<UseRealtimeReturn["status"]>("connecting");
  const [lastPollAt, setLastPollAt] = useState<Date | null>(null);
  const prevDataRef = useRef<Map<string, unknown>>(new Map());

  // Set up polling for incident and check data.
  // Note: org context resolves asynchronously after login, so the interval is
  // always created and simply no-ops until a session exists — invalidated
  // queries are disabled without a token, so this is safe.
  useEffect(() => {
    const hasSession = () => !!getOrgContext() || !!localStorage.getItem("reliastra_access_token");

    const pollInterval = enabled
      ? setInterval(() => {
          if (!hasSession()) return;
          // Invalidate queries to trigger refetch
          const invalidationKeys: string[][] = [];

          if (!eventFilter || eventFilter.some((e) => e.startsWith("incident"))) {
            invalidationKeys.push(["incidents"]);
            invalidationKeys.push(["dashboard", "summary"]);
          }
          if (!eventFilter || eventFilter.some((e) => e.startsWith("check") || e.startsWith("dependency"))) {
            invalidationKeys.push(["dashboard", "recent-checks"]);
            invalidationKeys.push(["dashboard", "dependency-health"]);
          }
          if (!eventFilter || eventFilter.some((e) => e.startsWith("evidence"))) {
            invalidationKeys.push(["evidence"]);
          }

          for (const key of invalidationKeys) {
            queryClient.invalidateQueries({ queryKey: key });
          }

          setLastPollAt(new Date());
        }, interval)
      : null;

    // Defer status transitions to avoid synchronous setState in the effect body
    queueMicrotask(() => setStatus(enabled ? "polling" : "disconnected"));

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [enabled, interval, eventFilter, queryClient]);

  // Detect data changes and generate synthetic events
  useEffect(() => {
    const checkForChanges = () => {
      const state = queryClient.getQueryCache().findAll();

      for (const query of state) {
        const key = query.queryKey.join(".");
        const newData = query.state.data;

        if (newData !== undefined && newData !== prevDataRef.current.get(key)) {
          const prevData = prevDataRef.current.get(key);

          // Generate events based on what changed
          if (Array.isArray(newData) && Array.isArray(prevData)) {
            const newLen = newData.length;
            const prevLen = prevData.length;

            // New incidents detected
            if (key.includes("incidents") && newLen > prevLen && prevLen >= 0) {
              const newItems = newData.slice(0, newLen - prevLen);
              for (const item of newItems) {
                const incident = item as { id: string; severity: string; status: string };
                const event: RealtimeEvent = {
                  type: "incident.new",
                  org_id: getOrgContext() || "",
                  timestamp: new Date().toISOString(),
                  payload: incident,
                };
                setEvents((prev) => [event, ...prev].slice(0, 50)); // Keep max 50 events
              }
            }

            // New check results
            if (key.includes("recent-checks") && newLen > prevLen && prevLen >= 0) {
              const newItems = newData.slice(0, newLen - prevLen);
              for (const item of newItems) {
                const check = item as { id: string; is_up: boolean; dependency_id: string };
                const event: RealtimeEvent = {
                  type: check.is_up ? "check.completed" : "dependency.down",
                  org_id: getOrgContext() || "",
                  timestamp: new Date().toISOString(),
                  payload: check,
                };
                setEvents((prev) => [event, ...prev].slice(0, 50));
              }
            }
          }

          prevDataRef.current.set(key, newData);
        }
      }
    };

    const changeInterval = setInterval(checkForChanges, interval);
    return () => clearInterval(changeInterval);
  }, [queryClient, interval]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    events,
    hasUnread: events.length > 0,
    clearEvents,
    status,
    lastPollAt,
  };
}

// ── Simpler hook: auto-refetch specific query keys ──────────────────────────

/**
 * useAutoRefetch — periodically refetch specified query keys.
 * Simpler alternative to useRealtime when you just want data freshness.
 */
export function useAutoRefetch(
  queryKeys: string[][],
  intervalMs: number = 10_000,
  enabled: boolean = true
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      for (const key of queryKeys) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    }, intervalMs);

    return () => clearInterval(interval);
  }, [queryClient, queryKeys, intervalMs, enabled]);
}

// ── WebSocket-ready hook (for future API support) ──────────────────────────

/**
 * useWebSocket — future-proof WebSocket hook.
 * When the API adds WebSocket support, this hook will connect
 * and dispatch events into the TanStack Query cache.
 * 
 * For now, it falls back to polling.
 */
export function useWebSocket(
  channel: string,
  options: { enabled?: boolean; onEvent?: (event: RealtimeEvent) => void } = {}
) {
  const { enabled = true, onEvent } = options;
  // WebSocket is not yet supported by the API — polling is used instead,
  // so the socket is always reported as disconnected for now.
  const connected = false;
  void channel;
  void enabled;
  void onEvent;

  return { connected, reconnect: () => {} };
}
