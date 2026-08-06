/**
 * Extrahiert die Initialen aus einem Namen
 * @param name Vollständiger Name (z.B. "Max Mustermann")
 * @returns Initialen (z.B. "MM")
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}
