import { useEffect, useState } from "react";

/**
 * True only after the first client-side effect ran. Persisted zustand state
 * (localStorage) is unavailable during SSR, so anything gated on it renders
 * differently on the server than on the client — a hydration mismatch.
 * Rendering the "not yet hydrated" branch on both the server AND the initial
 * client pass keeps the first paint identical; the real content appears a
 * tick later via a normal state update, not during hydration reconciliation.
 */
export function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
}
