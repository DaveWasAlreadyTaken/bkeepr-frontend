import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * True only after the first client-side render. Persisted zustand state
 * (localStorage) is unavailable during SSR, so anything gated on it renders
 * differently on the server than on the client — a hydration mismatch.
 * Rendering the "not yet hydrated" branch on both the server AND the initial
 * client pass keeps the first paint identical; the real content appears once
 * React re-renders with the client snapshot.
 */
export function useHasHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
