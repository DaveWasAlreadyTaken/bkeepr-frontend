import { AlertTriangle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DeviceAlert } from "@/app/services/device.service";
import { describeAlert, isBrandAlert, isIrreversible } from "../_lib/alerts";
import { formatAbsolute, formatRelative } from "../_lib/format";

/**
 * Einheitliche Alert-Darstellung für Alerts-Seite und Gerätedetail. Drei Formen
 * (docs/brand-guide.md §5): irreversibel = gefüllte rote Karte, Bienenbart = Markenwelt
 * ohne Aktion, alles andere = Warnung mit Quittieren. Eine Stelle, damit beide Screens
 * nie auseinanderlaufen.
 */
export function AlertCard({
  alert,
  deviceName,
  onResolve,
}: {
  alert: DeviceAlert;
  deviceName?: string;
  onResolve: () => void;
}) {
  const prefix = deviceName ? `${deviceName} · ` : "";
  const copy = describeAlert(alert);
  const opened = `${formatRelative(alert.openedAt)} · aktiv`;

  if (isIrreversible(alert)) {
    return (
      <div className="flex items-start gap-3.5 rounded-xl bg-destructive p-4 text-white shadow-lg shadow-destructive/30">
        <Trash2 className="mt-0.5 h-5 w-5 flex-none" />
        <div className="flex-1">
          <div className="text-base font-bold">{copy.title}</div>
          <div className="mt-0.5 text-[13.5px] opacity-95">
            {prefix}
            {copy.description}
          </div>
          <div
            className="mt-1.5 font-mono text-[11px] opacity-85"
            title={formatAbsolute(alert.openedAt)}
          >
            {formatRelative(alert.openedAt)} · {copy.rawHint}
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="flex-none border-white/50 bg-white/10 text-white hover:bg-white/20"
          onClick={onResolve}
        >
          Verstanden
        </Button>
      </div>
    );
  }

  if (isBrandAlert(alert)) {
    return (
      <div className="flex items-start gap-3.5 rounded-xl border border-beard/30 bg-beard/10 p-4">
        <BeardIcon className="mt-0.5 h-5 w-5 flex-none text-beard" />
        <div className="flex-1">
          <div className="text-[15px] font-semibold text-beard">
            {copy.title}
          </div>
          <div className="mt-0.5 text-[13px] text-muted-foreground">
            {prefix}
            {copy.description}{" "}
            <strong className="text-foreground">Kein Defekt</strong> — der
            Zeitraum ist nur nicht auswertbar.
          </div>
          <div
            className="mt-1.5 font-mono text-[11px] text-muted-foreground"
            title={formatAbsolute(alert.openedAt)}
          >
            {formatRelative(alert.openedAt)} · {copy.rawHint}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3.5 rounded-xl border border-warning/30 bg-warning/10 p-4">
      <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-warning" />
      <div className="flex-1">
        <div className="text-[15px] font-semibold text-warning-strong">
          {copy.title}
        </div>
        <div className="mt-0.5 text-[13px] text-muted-foreground">
          {prefix}
          {copy.description}
        </div>
        <div
          className="mt-1.5 font-mono text-[11px] text-muted-foreground"
          title={formatAbsolute(alert.openedAt)}
        >
          {opened} · {copy.rawHint}
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="flex-none border-warning/30"
        onClick={onResolve}
      >
        Quittieren
      </Button>
    </div>
  );
}

function BeardIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
}
