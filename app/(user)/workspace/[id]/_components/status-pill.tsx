import { AlertTriangle, ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";

export type StatusTone = "ok" | "warning" | "danger" | "beard" | "neutral";

const TONE_CLASSES: Record<StatusTone, string> = {
  ok: "bg-success/10 text-success border-success/25",
  warning: "bg-warning/10 text-warning-strong border-warning/30",
  danger: "bg-destructive/10 text-destructive border-destructive/30",
  beard: "bg-beard/10 text-beard border-beard/30",
  neutral: "bg-muted text-muted-foreground border-border",
};

const DOT_CLASSES: Record<StatusTone, string> = {
  ok: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  beard: "bg-beard",
  neutral: "bg-muted-foreground",
};

/**
 * Status nie allein über Farbe (harte Designregel #2): immer Farbe + Icon/Punkt + Text.
 * Warnung und Fehler tragen zusätzlich ein Icon, Marke (ok/beard) nie.
 */
export function StatusPill({
  tone,
  children,
  className,
}: {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {tone === "warning" || tone === "danger" ? (
        <AlertTriangle className="h-3 w-3" />
      ) : (
        <span className={cn("h-1.5 w-1.5 rounded-full", DOT_CLASSES[tone])} />
      )}
      {children}
    </span>
  );
}

export function IrreversibleIcon({ className }: { className?: string }) {
  return <ShieldAlert className={className} />;
}

export { TONE_CLASSES, DOT_CLASSES };
