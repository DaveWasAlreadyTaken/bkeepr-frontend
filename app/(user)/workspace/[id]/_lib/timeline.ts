import type { GapSegment, GapSegmentKind } from "../_components/gap-timeline";
import type { SunTimes } from "./suntimes";

interface HeartbeatPoint {
  receivedAt: string;
  ssdMounted: boolean;
  beardDensity: number | null;
  lastRecordingUsable: boolean | null;
}

const LABELS: Record<GapSegmentKind, string> = {
  recording: "Aufnahme",
  night: "Nacht — keine Aufnahme",
  beard: "Bienenbart — Sicht verdeckt",
  "poor-quality": "Sichtqualität unzureichend",
  offline: "Gerät offline",
};

// Heartbeat kommt alle 5 Minuten. Eine Lücke deutlich darüber heißt: das
// Gerät hat nicht geantwortet, nicht "es gab nichts zu melden".
const GAP_THRESHOLD_FRACTION = 12 / (24 * 60);

function classify(h: HeartbeatPoint): GapSegmentKind {
  if (h.beardDensity != null && h.beardDensity > 0.5) return "beard";
  if (h.lastRecordingUsable === false || !h.ssdMounted) return "poor-quality";
  return "recording";
}

function dayFraction(date: Date, dayStart: Date): number {
  const dayMs = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.min(1, (date.getTime() - dayStart.getTime()) / dayMs));
}

function splitByNight(
  from: number,
  to: number,
  sunrise: number | null,
  sunset: number | null,
): { from: number; to: number; isNight: boolean }[] {
  if (sunrise == null || sunset == null) {
    return [{ from, to, isNight: false }];
  }

  const cuts = [from, to];
  if (sunrise > from && sunrise < to) cuts.push(sunrise);
  if (sunset > from && sunset < to) cuts.push(sunset);
  cuts.sort((a, b) => a - b);

  const pieces: { from: number; to: number; isNight: boolean }[] = [];
  for (let i = 0; i < cuts.length - 1; i++) {
    const a = cuts[i];
    const b = cuts[i + 1];
    if (b <= a) continue;
    const mid = (a + b) / 2;
    pieces.push({ from: a, to: b, isNight: mid < sunrise || mid >= sunset });
  }
  return pieces;
}

/**
 * Baut die "Aufnahmefenster heute"-Segmente aus echten Heartbeats dieses
 * Tages. Nacht-Bänder kommen aus der Sonnengleichung (lat/lon), unabhängig
 * von Heartbeats — der Agent meldet sich auch nachts, aber es wird nicht
 * aufgenommen. Innerhalb des Tages gilt: Lücke > 12 Min = Gerät offline,
 * sonst der Zustand des letzten Heartbeats davor (docs/brand-guide.md §6.1 —
 * die Kurve bricht, es wird nie interpoliert).
 */
export function buildTodaySegments(
  heartbeats: HeartbeatPoint[],
  sun: SunTimes | null,
  now: Date,
): GapSegment[] {
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const frac = (d: Date) => dayFraction(d, dayStart);

  const nowFrac = frac(now);
  const sunriseFrac = sun ? frac(sun.sunrise) : null;
  const sunsetFrac = sun ? frac(sun.sunset) : null;

  const points = heartbeats
    .map((h) => ({ t: frac(new Date(h.receivedAt)), kind: classify(h) }))
    .sort((a, b) => a.t - b.t);

  const raw: { from: number; to: number; kind: GapSegmentKind }[] = [];

  if (points.length === 0) {
    if (nowFrac > 0) raw.push({ from: 0, to: nowFrac, kind: "offline" });
  } else {
    if (points[0].t > 0) {
      raw.push({ from: 0, to: points[0].t, kind: "offline" });
    }

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const next = points[i + 1];
      const segEnd = next ? next.t : nowFrac;
      if (segEnd <= p.t) continue;

      const gap = segEnd - p.t;
      if (gap > GAP_THRESHOLD_FRACTION) {
        raw.push({ from: p.t, to: p.t + GAP_THRESHOLD_FRACTION, kind: p.kind });
        raw.push({ from: p.t + GAP_THRESHOLD_FRACTION, to: segEnd, kind: "offline" });
      } else {
        raw.push({ from: p.t, to: segEnd, kind: p.kind });
      }
    }
  }

  const withNight: { from: number; to: number; kind: GapSegmentKind }[] = [];
  for (const seg of raw) {
    for (const piece of splitByNight(seg.from, seg.to, sunriseFrac, sunsetFrac)) {
      withNight.push({
        from: piece.from,
        to: piece.to,
        kind: piece.isNight ? "night" : seg.kind,
      });
    }
  }

  return withNight
    .filter((s) => s.to > s.from)
    .map((s) => ({
      kind: s.kind,
      widthPercent: (s.to - s.from) * 100,
      label: LABELS[s.kind],
    }));
}
