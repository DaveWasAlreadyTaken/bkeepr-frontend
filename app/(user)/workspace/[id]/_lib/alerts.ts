import type { AlertSeverity, AlertType, Device, DeviceAlert } from "@/app/services/device.service";

export type AlertTone = "warning" | "danger" | "beard";

/** Bienenbart ist Markenwelt, kein Fehler (docs/brand-guide.md §1.3). */
export function isBrandAlert(alert: DeviceAlert): boolean {
  return alert.type === "BEARD";
}

/** Einziger irreversibler Alert — sieht anders aus als die übrigen sieben (§5.2). */
export function isIrreversible(alert: DeviceAlert): boolean {
  return alert.type === "UNPULLED_DELETED";
}

export function alertTone(alert: DeviceAlert): AlertTone {
  if (isBrandAlert(alert)) return "beard";
  if (isIrreversible(alert) || alert.severity === "ERROR") return "danger";
  return "warning";
}

/** Aktive, nicht-quittierte Alerts eines Geräts, ohne Bienenbart (kein "Problem"). */
export function problemAlerts(device: Device): DeviceAlert[] {
  return device.activeAlerts.filter(
    (a) => !isBrandAlert(a) && a.state !== "RESOLVED",
  );
}

export function deviceTone(device: Device): "ok" | "warning" | "danger" {
  if (!device.online) return "danger";
  const problems = problemAlerts(device);
  if (problems.some((a) => a.severity === "ERROR" || isIrreversible(a))) {
    return "danger";
  }
  return problems.length > 0 ? "warning" : "ok";
}

export interface AlertCopy {
  title: string;
  description: string;
  rawHint: string;
}

const SEVERITY_LABEL: Record<AlertSeverity, string> = {
  INFO: "info",
  WARNING: "warnung",
  ERROR: "fehler",
};

/**
 * Klartext-Tabelle aus docs/brand-guide.md §4.1/§5.1 — der Server liefert nur
 * Typ + Rohwerte (context), die Übersetzung in "Deutung zuerst" passiert hier.
 */
export function describeAlert(alert: DeviceAlert): AlertCopy {
  const ctx = alert.context ?? {};

  switch (alert.type) {
    case "SSD_MISSING":
      return {
        title: "SSD fehlt — Aufnahme läuft nicht",
        description: "Kabel prüfen, die Aufzeichnung steht bis dahin still.",
        rawHint: "ssd_mounted false",
      };
    case "UNDERVOLTAGE":
      return {
        title: "Stromversorgung instabil",
        description: "Unterspannung erkannt — ein aktiver USB-Hub ist nötig.",
        rawHint: `${String(ctx.throttled ?? "?")} · throttled`,
      };
    case "DISK_FULL":
      return {
        title: "Platte voll",
        description: "Über 80 % belegt — zieh Clips auf den Laptop.",
        rawHint: `disk_used_ratio ${formatNum(ctx.diskUsedRatio)}`,
      };
    case "UNPULLED_DELETED": {
      const count = Number(ctx.unpulledDeleted ?? 0);
      return {
        title: "Ungesichertes Material wurde gelöscht",
        description: `Die Platte war voll, ${count} nicht abgeholte${count === 1 ? "r Clip ist" : " Clips sind"} unwiederbringlich verloren. Zieh künftig früher Material auf den Laptop.`,
        rawHint: `unpulled_deleted ${count} · irreversibel`,
      };
    }
    case "SHARPNESS":
      return {
        title: "Sichtqualität unzureichend",
        description:
          "Schärfe deutlich unter dem 7-Tage-Median. Linse putzen, auf Spinnennetz prüfen, Halterung kontrollieren.",
        rawHint: `sharpness ${formatNum(ctx.sharpness)} · Median ${formatNum(ctx.median)}`,
      };
    case "BEARD":
      return {
        title: "Bienenbart · Sicht verdeckt",
        description: "Traube vor dem Flugloch am warmen Abend.",
        rawHint: `beard_density ${formatNum(ctx.beardDensity)}`,
      };
    case "TIME_NOT_SYNCED":
      return {
        title: "Zeit nicht synchron",
        description: "Zeitstempel sind über längere Zeit unzuverlässig.",
        rawHint: "time_synced false",
      };
    default:
      return {
        title: alert.type,
        description: `Aktueller Zustand: ${SEVERITY_LABEL[alert.severity]}.`,
        rawHint: "",
      };
  }
}

function formatNum(value: unknown): string {
  if (typeof value !== "number") return "?";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export const ALERT_TYPES: AlertType[] = [
  "SSD_MISSING",
  "UNDERVOLTAGE",
  "DISK_FULL",
  "UNPULLED_DELETED",
  "SHARPNESS",
  "BEARD",
  "TIME_NOT_SYNCED",
];
