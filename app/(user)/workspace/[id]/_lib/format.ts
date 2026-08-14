/** "vor 4 Min" / "vor 2 Std" / "vor 3 Tagen" — Regel 4: relative Zeit im Text. */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "noch nie";
  const diffMs = Date.now() - new Date(iso).getTime();
  if (diffMs < 0) return "gerade jetzt";

  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "gerade jetzt";
  if (minutes < 60) return `vor ${minutes} Min`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `vor ${hours} Std`;

  const days = Math.round(hours / 24);
  return `vor ${days} ${days === 1 ? "Tag" : "Tagen"}`;
}

/** Absoluter Wert für den Tooltip hinter der relativen Zeit (Regel 4). */
export function formatAbsolute(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
