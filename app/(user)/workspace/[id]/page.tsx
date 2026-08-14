"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  Clock,
  Database,
  Download,
  Sunrise,
  Sunset,
  TrendingDown,
  TrendingUp,
  Video,
} from "lucide-react";
import { Area, ComposedChart, Line, ReferenceLine, XAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  deviceService,
  type Device,
  type DeviceDetail,
} from "@/app/services/device.service";
import { ApiException } from "@/app/services/api-config";

import { ClipsGuideDialog } from "./_components/clips-guide-dialog";
import { GapTimeline } from "./_components/gap-timeline";
import { StatusPill } from "./_components/status-pill";
import { sunTimes } from "./_lib/suntimes";
import { buildTodaySegments } from "./_lib/timeline";
import { formatAbsolute, formatRelative } from "./_lib/format";

type LoadState = "loading" | "error" | "ready";
type Period = "day" | "week" | "season";

const ACTIVITY_CHART_CONFIG: ChartConfig = {
  out: { label: "Ausflüge", color: "hsl(var(--primary))" },
  in: { label: "Einflüge", color: "hsl(var(--primary-strong))" },
  temp: { label: "Temperatur (Kontext)", color: "hsl(var(--weather))" },
};

// Illustrativ für die "Vorschau: mit Zählwerten" — der Detektor (AP-9) existiert
// noch nicht, es gibt keine echten Zählwerte. Nacht (0–4, 21–23) und die
// Bienenbart-Stunde (19) sind bewusst null: die Kurve bricht statt zu interpolieren.
const ACTIVITY_DATA = [
  { hour: "00", out: null, in: null, temp: 14.2 },
  { hour: "01", out: null, in: null, temp: 13.8 },
  { hour: "02", out: null, in: null, temp: 13.1 },
  { hour: "03", out: null, in: null, temp: 12.6 },
  { hour: "04", out: null, in: null, temp: 12.4 },
  { hour: "05", out: 20, in: 15, temp: 13.0 },
  { hour: "06", out: 140, in: 110, temp: 14.5 },
  { hour: "07", out: 360, in: 320, temp: 16.8 },
  { hour: "08", out: 620, in: 560, temp: 19.2 },
  { hour: "09", out: 780, in: 720, temp: 21.6 },
  { hour: "10", out: 690, in: 660, temp: 23.4 },
  { hour: "11", out: 610, in: 590, temp: 24.8 },
  { hour: "12", out: 540, in: 520, temp: 25.6 },
  { hour: "13", out: 580, in: 555, temp: 25.9 },
  { hour: "14", out: 640, in: 610, temp: 25.3 },
  { hour: "15", out: 590, in: 565, temp: 24.4 },
  { hour: "16", out: 520, in: 500, temp: 23.1 },
  { hour: "17", out: 430, in: 415, temp: 21.5 },
  { hour: "18", out: 340, in: 330, temp: 19.8 },
  { hour: "19", out: null, in: null, temp: 18.0 },
  { hour: "20", out: 90, in: 75, temp: 16.6 },
  { hour: "21", out: null, in: null, temp: 15.4 },
  { hour: "22", out: null, in: null, temp: 14.7 },
  { hour: "23", out: null, in: null, temp: 14.3 },
];

export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = params.id as string;

  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [devices, setDevices] = useState<Device[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DeviceDetail | null>(null);
  const [period, setPeriod] = useState<Period>("day");
  const [showVollzustand, setShowVollzustand] = useState(false);

  const load = useCallback(async () => {
    setLoadState("loading");
    try {
      const list = await deviceService.listDevices(workspaceId);
      setDevices(list);
      const firstId = list[0]?.id ?? null;
      setActiveDeviceId((current) => current ?? firstId);
      setLoadState("ready");
    } catch (error) {
      setErrorMessage(
        error instanceof ApiException
          ? error.error.message
          : "Unbekannter Fehler",
      );
      setLoadState("error");
    }
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!activeDeviceId) {
      return;
    }
    let cancelled = false;
    deviceService
      .getDevice(workspaceId, activeDeviceId)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch(() => {
        if (!cancelled) setDetail(null);
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId, activeDeviceId]);

  const effectiveDetail = activeDeviceId ? detail : null;

  if (loadState === "loading") {
    return <DashboardSkeleton />;
  }

  if (loadState === "error") {
    return (
      <ErrorState
        workspaceId={workspaceId}
        message={errorMessage}
        onRetry={load}
      />
    );
  }

  const device = devices.find((d) => d.id === activeDeviceId) ?? devices[0];

  if (!device) {
    return <NoDeviceEmptyState workspaceId={workspaceId} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Volk
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            {devices.length > 1 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border bg-card px-3 py-1.5 text-xl font-bold tracking-tight sm:text-2xl">
                    <span
                      className={`h-2 w-2 flex-none rounded-full ${device.online ? "bg-success" : "bg-destructive"}`}
                    />
                    {device.name ?? device.deviceId}
                    <ChevronDown className="h-4 w-4 flex-none text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {devices.map((d) => (
                    <DropdownMenuItem
                      key={d.id}
                      onClick={() => setActiveDeviceId(d.id)}
                    >
                      <span
                        className={`mr-2 h-2 w-2 rounded-full ${d.online ? "bg-success" : "bg-destructive"}`}
                      />
                      {d.name ?? d.deviceId}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <h1 className="whitespace-nowrap text-xl font-bold tracking-tight sm:text-2xl">
                {device.name ?? device.deviceId}
              </h1>
            )}
            <StatusPill tone={device.online ? "ok" : "danger"}>
              {device.online ? "Online · zeichnet auf" : "Offline"}
            </StatusPill>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <Switch
              checked={showVollzustand}
              onCheckedChange={setShowVollzustand}
            />
            Vorschau: mit Zählwerten
          </label>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <TabsList>
              <TabsTrigger value="day">Tag</TabsTrigger>
              <TabsTrigger value="week">Woche</TabsTrigger>
              <TabsTrigger value="season">Saison</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {showVollzustand ? (
        <VollzustandView />
      ) : effectiveDetail ? (
        <LeerzustandView detail={effectiveDetail} />
      ) : (
        <DetailSkeleton />
      )}
    </div>
  );
}

function LeerzustandView({ detail }: { detail: DeviceDetail }) {
  const hb = detail.latestHeartbeat;
  const [clipsGuideOpen, setClipsGuideOpen] = useState(false);
  const [now] = useState(() => Date.now());

  const sun = useMemo(
    () =>
      detail.lat != null && detail.lon != null
        ? sunTimes(detail.lat, detail.lon, new Date())
        : null,
    [detail.lat, detail.lon],
  );

  const segments = useMemo(
    () => buildTodaySegments(detail.todaysHeartbeats, sun, new Date()),
    [detail.todaysHeartbeats, sun],
  );

  const diskFreeGb = hb?.diskFreeBytes ? Number(hb.diskFreeBytes) / 1e9 : null;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Clock className="h-4 w-4" />}
          label="Aufzeichnung seit"
          value={new Date(detail.createdAt).toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "long",
          })}
          hint={`seit ${Math.max(1, Math.round((now - new Date(detail.createdAt).getTime()) / 86400000))} Tagen`}
        />
        <StatCard
          icon={<Database className="h-4 w-4" />}
          label="Material auf SSD"
          value={
            hb?.diskUsedRatio != null ? (
              <>
                {Math.round(hb.diskUsedRatio * 100)}
                <span className="ml-1 text-base font-medium text-muted-foreground">
                  %
                </span>
              </>
            ) : (
              "—"
            )
          }
          hint={
            diskFreeGb != null
              ? `${diskFreeGb.toFixed(0)} GB frei`
              : "noch kein Heartbeat"
          }
        />
        <StatCard
          icon={<Video className="h-4 w-4" />}
          label="Aufgezeichnete Clips"
          value={
            hb?.clipsRecorded != null
              ? hb.clipsRecorded.toLocaleString("de-DE")
              : "—"
          }
          hint={
            <span title={formatAbsolute(detail.lastHeartbeatAt)}>
              Heartbeat {formatRelative(detail.lastHeartbeatAt)}
            </span>
          }
          action={
            <button
              type="button"
              onClick={() => setClipsGuideOpen(true)}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              <Download className="h-3 w-3" />
              downloaden
            </button>
          }
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Letzte Aufnahme"
          value={hb?.lastRecordingAt ? formatRelative(hb.lastRecordingAt) : "—"}
          hint={
            hb?.lastRecordingAt ? (
              <span
                className={
                  hb.lastRecordingUsable
                    ? "text-success"
                    : "text-warning-strong"
                }
              >
                {hb.lastRecordingUsable ? "brauchbar" : "unbrauchbar"} ·{" "}
                <span className="font-mono text-muted-foreground">
                  {formatAbsolute(hb.lastRecordingAt)}
                </span>
              </span>
            ) : (
              "noch keine Aufnahme gemeldet"
            )
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,340px)_1fr]">
        <Card>
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Noch keine Zählwerte
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Die Kamera zeichnet auf, aber der Detektor, der Bienen zählt,
                läuft noch nicht. Sobald er die Clips auswertet, erscheinen hier
                Ein- und Ausflüge, Pollenanteil und der Vergleich zum eigenen
                7-Tage-Median.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2.5">
                <span className="mt-0.5 flex h-[18px] w-[18px] flex-none items-center justify-center rounded-full border border-success/30 bg-success/10 text-success">
                  <CheckCircle2 className="h-3 w-3" />
                </span>
                <span className="text-sm leading-snug">
                  <strong className="font-semibold">Läuft:</strong>{" "}
                  <span className="text-muted-foreground">
                    Aufzeichnung, Heartbeat alle 5 Min, SSD gesichert.
                  </span>
                </span>
              </div>
              <div className="flex gap-2.5">
                <span className="mt-0.5 h-[18px] w-[18px] flex-none rounded-full border bg-muted" />
                <span className="text-sm leading-snug">
                  <strong className="font-semibold">Fehlt:</strong>{" "}
                  <span className="text-muted-foreground">
                    Der Detektor. Kommt mit AP-9 — bis dahin sammeln wir
                    Rohmaterial.
                  </span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-5 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[15px] font-semibold">
                  Aufnahmefenster heute
                </div>
                <div className="mt-0.5 text-[12.5px] text-muted-foreground">
                  Aus den heutigen Heartbeats abgeleitet — Nacht aus
                  Sonnenauf-/-untergang für den Standort des Geräts.
                </div>
              </div>
              {sun && (
                <div className="flex items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground">
                  <Sunrise className="h-3.5 w-3.5" />
                  {sun.sunrise.toLocaleTimeString("de-DE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  <Sunset className="ml-1.5 h-3.5 w-3.5" />
                  {sun.sunset.toLocaleTimeString("de-DE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>

            {segments.length > 0 ? (
              <GapTimeline segments={segments} />
            ) : (
              <div className="flex h-11 items-center justify-center rounded-lg border text-xs text-muted-foreground">
                Noch keine Heartbeats heute
              </div>
            )}
            {!sun && (
              <div className="text-[11px] text-muted-foreground">
                Kein Standort gesetzt — Nacht-Bänder brauchen lat/lon
                (Einstellungen im Gerätedetail).
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="font-mono text-[11px] text-muted-foreground">
        Regel 6 · Nie über eine Lücke interpolieren — die Linie endet und
        beginnt neu, dahinter ein farbcodiertes Band mit Grund.
      </div>

      <ClipsGuideDialog
        open={clipsGuideOpen}
        onOpenChange={setClipsGuideOpen}
        deviceId={detail.deviceId}
      />
    </>
  );
}

function VollzustandView() {
  return (
    <>
      <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-[12.5px] text-warning-strong">
        Vorschau mit Beispieldaten — der Detektor (AP-9) existiert noch nicht,
        diese Zahlen sind nicht real.
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Netto-Bilanz heute"
          value="+340"
          hint={
            <span className="inline-flex items-center gap-1 text-success">
              <TrendingUp className="h-3.5 w-3.5" />
              <span className="font-mono">+12 %</span> ggü. 7-Tage-Median
            </span>
          }
        />
        <StatCard
          label="Ausflüge"
          value="8.420"
          hint={
            <span>
              Median <span className="font-mono">7.900</span>
            </span>
          }
        />
        <StatCard
          label="Einflüge"
          value="8.080"
          hint={
            <span>
              Median <span className="font-mono">7.740</span>
            </span>
          }
        />
        <StatCard
          label="Pollenanteil"
          value="34 %"
          hint={
            <span className="inline-flex items-center gap-1 text-warning-strong">
              <TrendingDown className="h-3.5 w-3.5" />
              <span className="font-mono">−6 %</span> ggü. Median
            </span>
          }
        />
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-[15px] font-semibold">
                Ein- und Ausflüge über den Tag
              </div>
              <div className="mt-0.5 max-w-xl text-[12.5px] text-muted-foreground">
                Wetter (Temperatur) liegt als Fläche dahinter — Kontext, kein
                Vergleichswert. Ohne Kontrollvolk ist ein Rückgang sonst nicht
                deutbar.
              </div>
            </div>
          </div>

          <ChartContainer
            config={ACTIVITY_CHART_CONFIG}
            className="mt-4 aspect-auto h-[260px] w-full"
          >
            <ComposedChart data={ACTIVITY_DATA}>
              <XAxis
                dataKey="hour"
                tickLine={false}
                axisLine={false}
                interval={5}
                className="font-mono text-[10px]"
              />
              <ReferenceLine
                x="05"
                stroke="hsl(var(--warning))"
                strokeDasharray="3 4"
                strokeOpacity={0.5}
              />
              <ReferenceLine
                x="19"
                stroke="hsl(var(--warning))"
                strokeDasharray="3 4"
                strokeOpacity={0.5}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                dataKey="temp"
                type="monotone"
                fill="hsl(var(--weather))"
                fillOpacity={0.16}
                stroke="hsl(var(--weather))"
                strokeOpacity={0.5}
                strokeDasharray="2 5"
                isAnimationActive={false}
              />
              <Line
                dataKey="out"
                type="monotone"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
              <Line
                dataKey="in"
                type="monotone"
                stroke="hsl(var(--primary-strong))"
                strokeWidth={2}
                strokeOpacity={0.75}
                dot={false}
                connectNulls={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ChartContainer>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-[3px] w-4 rounded bg-primary" />
              Ausflüge
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-[3px] w-4 rounded bg-primary-strong" />
              Einflüge
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-3.5 rounded-sm border border-weather/50 bg-weather/20" />
              Temperatur (Kontext)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-3.5 rounded-sm border border-beard/40 bg-beard/25" />
              Bienenbart · Kurve bricht
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-3.5 rounded-sm border bg-muted" />
              Nacht
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="font-mono text-[11px] text-muted-foreground">
        Keine Nachkommastellen bei Zählwerten · Vergleich immer gegen den
        eigenen 7-Tage-Median · Sonnenzeiten markieren das Aufnahmefenster.
      </div>
    </>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  action,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            {icon}
            {label}
          </div>
          {action}
        </div>
        <div className="mt-3 font-mono text-2xl font-semibold tabular-nums tracking-tight">
          {value}
        </div>
        {hint && (
          <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
        )}
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-9 w-40 rounded-lg" />
      </div>
      <DetailSkeleton />
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,340px)_1fr]">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

function ErrorState({
  workspaceId,
  message,
  onRetry,
}: {
  workspaceId: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive">
        <Activity className="h-7 w-7" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Daten nicht erreichbar</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          {message ||
            "Der Server antwortet gerade nicht. Deine Aufzeichnung läuft davon unberührt weiter — es fehlt nur die Anzeige."}
        </p>
      </div>
      <div className="rounded-md bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">
        api/workspaces/{workspaceId}/devices
      </div>
      <Button onClick={onRetry}>Erneut versuchen</Button>
    </div>
  );
}

function NoDeviceEmptyState({ workspaceId }: { workspaceId: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Video className="h-7 w-7" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Noch kein Volk gekoppelt</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Koppele zuerst ein Gerät auf der Anlage-Seite, um hier die
          Aufzeichnung deines Volks zu sehen.
        </p>
      </div>
      <Button asChild>
        <a href={`/workspace/${workspaceId}/devices`}>Zur Anlage</a>
      </Button>
    </div>
  );
}
