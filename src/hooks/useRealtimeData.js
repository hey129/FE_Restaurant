import { useEffect } from "react";
import { supabase } from "~/Api/supabase";

/**
 * Custom hook to listen for real-time changes in Supabase
 * @param {string} table - Table name to listen to
 * @param {Function} callback - Callback function to execute when data changes
 */
export function useRealtimeData(table, callback) {
  useEffect(() => {
    if (!table || !callback) return;

    // Subscribe to changes
    const subscription = supabase
      .channel(`public:${table}`)
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events: INSERT, UPDATE, DELETE
          schema: "public",
          table: table,
        },
        (payload) => {
          console.log(`[Realtime] Change detected in ${table}:`, payload);
          // Call callback when data changes
          callback(payload);
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`[Realtime] Subscribed to ${table}`);
        } else if (status === "CLOSED") {
          console.log(`[Realtime] Unsubscribed from ${table}`);
        }
      });

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [table, callback]);
}

/**
 * Hook to listen for changes in multiple tables
 * @param {Array<string>} tables - Array of table names
 * @param {Function} onDataChange - Callback when any table changes
 */
export function useRealtimeMultipleTables(tables, onDataChange) {
  useEffect(() => {
    if (!tables || tables.length === 0 || !onDataChange) return;

    const subscriptions = tables.map((table) =>
      supabase
        .channel(`public:${table}`)
        .on(
          "postgres_changes",
          {
            event: "*", // All events
            schema: "public",
            table: table,
          },
          (payload) => {
            console.log(`[Realtime] Change in ${table}:`, payload.eventType);
            onDataChange({ table, payload });
          }
        )
        .subscribe()
    );

    return () => {
      subscriptions.forEach((sub) => supabase.removeChannel(sub));
    };
  }, [tables, onDataChange]);
}
