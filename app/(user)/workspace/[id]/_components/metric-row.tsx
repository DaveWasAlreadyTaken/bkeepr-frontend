import { cn } from "@/lib/utils";
import type { StatusTone } from "./status-pill";

const DOT_CLASSES: Record<StatusTone, string> = {
  ok: "bg-success",
  warning: "bg-warning",
  danger: "bg-destructive",
  beard: "bg-beard",
  neutral: "bg-muted-foreground",
};

const HEADLINE_CLASSES: Record<StatusTone, string> = {
  ok: "",
  warning: "text-warning-strong",
  danger: "text-destructive",
  beard: "text-beard",
  neutral: "",
};

/**
 * Metrik-Pattern (docs/brand-guide.md §4): Deutung zuerst, Rohwert daneben.
 * Drei Ebenen — Klartext trägt die Farbe, Kontext eine Zeile, Rohwert klein/grau/Mono.
 */
export function MetricRow({
  tone,
  headline,
  context,
  raw,
}: {
  tone: StatusTone;
  headline: string;
  context?: string;
  raw?: string;
}) {
  return (
    <div className="flex gap-3">
      <span
        className={cn(
          "mt-1.5 h-2 w-2 flex-none rounded-full",
          DOT_CLASSES[tone],
        )}
      />
      <div>
        <div className={cn("text-sm font-semibold", HEADLINE_CLASSES[tone])}>
          {headline}
        </div>
        {context && (
          <div className="text-xs text-muted-foreground">{context}</div>
        )}
        {raw && (
          <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
            {raw}
          </div>
        )}
      </div>
    </div>
  );
}
