import { cn } from "@/lib/utils";

export type GapSegmentKind =
  | "recording"
  | "night"
  | "beard"
  | "poor-quality"
  | "offline";

export interface GapSegment {
  kind: GapSegmentKind;
  widthPercent: number;
  label: string;
}

const SEGMENT_CLASS: Record<GapSegmentKind, string> = {
  recording: "bg-primary",
  night: "bg-muted",
  beard: "bg-beard/25 border-x border-beard/40",
  "poor-quality": "",
  offline: "",
};

const HATCH_STYLE: Partial<Record<GapSegmentKind, React.CSSProperties>> = {
  "poor-quality": {
    backgroundImage:
      "repeating-linear-gradient(45deg, hsl(var(--muted-foreground) / .35) 0 4px, hsl(var(--muted-foreground) / .1) 4px 8px)",
  },
  offline: {
    backgroundImage:
      "repeating-linear-gradient(45deg, hsl(var(--destructive) / .6) 0 4px, hsl(var(--destructive) / .15) 4px 8px)",
  },
};

const LEGEND: { kind: GapSegmentKind; label: string }[] = [
  { kind: "recording", label: "Aufnahme" },
  { kind: "night", label: "Nacht" },
  { kind: "beard", label: "Bienenbart" },
  { kind: "poor-quality", label: "Sicht unzureichend" },
  { kind: "offline", label: "Offline" },
];

/**
 * Die Kurve/das Band bricht über eine Lücke, statt zu interpolieren (harte Regel #1,
 * docs/brand-guide.md §6.1). Jedes Segment trägt seinen Grund als title-Attribut.
 */
export function GapTimeline({
  segments,
  className,
  compact = false,
}: {
  segments: GapSegment[];
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={className}>
      <div
        className={cn(
          "flex overflow-hidden rounded-lg border",
          compact ? "h-9" : "h-11",
        )}
      >
        {segments.map((segment, i) => (
          <div
            key={i}
            title={segment.label}
            style={{
              flex: `0 0 ${segment.widthPercent}%`,
              ...HATCH_STYLE[segment.kind],
            }}
            className={SEGMENT_CLASS[segment.kind]}
          />
        ))}
      </div>
      {!compact && (
        <div className="mt-1.5 flex justify-between font-mono text-[10px] text-muted-foreground">
          <span>00</span>
          <span>06</span>
          <span>12</span>
          <span>18</span>
          <span>24</span>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
        {LEGEND.map(({ kind, label }) => (
          <span key={kind} className="inline-flex items-center gap-1.5">
            <span
              className={cn("h-3.5 w-3.5 rounded-sm", SEGMENT_CLASS[kind])}
              style={HATCH_STYLE[kind]}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
