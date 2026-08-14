"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/app/stores/auth.store";
import { useHasHydrated } from "@/hooks/use-has-hydrated";
import {
  deviceService,
  type DeviceDetail,
} from "@/app/services/device.service";
import { alertService } from "@/app/services/alert.service";
import { ApiException } from "@/app/services/api-config";

import { alertTone, problemAlerts } from "../../_lib/alerts";
import { formatAbsolute, formatRelative } from "../../_lib/format";
import { AlertCard } from "../../_components/alert-card";
import { MetricRow } from "../../_components/metric-row";
import { StatusPill } from "../../_components/status-pill";

type LoadState = "loading" | "error" | "not-found" | "ready";

export default function DeviceDetailPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const deviceId = params.deviceId as string;
  const { hasWorkspaceRole } = useAuthStore();
  const hasHydrated = useHasHydrated();
  const canManage =
    hasHydrated &&
    (hasWorkspaceRole(workspaceId, "OWNER") ||
      hasWorkspaceRole(workspaceId, "ADMIN"));

  const [device, setDevice] = useState<DeviceDetail | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [recordingMode, setRecordingMode] = useState<"SPARSE" | "CONTINUOUS">(
    "SPARSE",
  );
  const [saving, setSaving] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [unpairing, setUnpairing] = useState(false);

  const load = useCallback(async () => {
    setLoadState("loading");
    try {
      const result = await deviceService.getDevice(workspaceId, deviceId);
      setDevice(result);
      setName(result.name ?? "");
      setLat(result.lat != null ? String(result.lat) : "");
      setLon(result.lon != null ? String(result.lon) : "");
      setRecordingMode(
        result.recordingMode === "continuous" ? "CONTINUOUS" : "SPARSE",
      );
      setLoadState("ready");
    } catch (error) {
      if (error instanceof ApiException && error.error.status === 404) {
        setLoadState("not-found");
      } else {
        setLoadState("error");
      }
    }
  }, [workspaceId, deviceId]);

  useEffect(() => {
    load();
  }, [load]);

  async function acknowledge(alertId: string, title: string) {
    if (!device) return;
    try {
      await alertService.acknowledgeAlert(workspaceId, alertId);
      toast.success(`„${title}“ quittiert`);
      load();
    } catch {
      toast.error("Quittieren fehlgeschlagen");
    }
  }

  async function handleSaveSettings() {
    setSaving(true);
    try {
      await deviceService.updateDevice(workspaceId, deviceId, {
        name: name.trim() || undefined,
        lat: lat.trim() ? Number(lat) : undefined,
        lon: lon.trim() ? Number(lon) : undefined,
        recordingMode,
      });
      toast.success("Einstellungen gespeichert");
      load();
    } catch {
      toast.error("Speichern fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  }

  async function handleRotateToken() {
    if (!window.confirm("Token rotieren? Der Pi muss sich danach über den Pairing-Code neu melden.")) {
      return;
    }
    setRotating(true);
    try {
      await deviceService.rotateToken(workspaceId, deviceId);
      toast.success("Token rotiert");
    } catch {
      toast.error("Rotieren fehlgeschlagen");
    } finally {
      setRotating(false);
    }
  }

  async function handleUnpair() {
    if (
      !window.confirm(
        "Gerät wirklich entkoppeln? Das Volk verliert seine Historie.",
      )
    ) {
      return;
    }
    setUnpairing(true);
    try {
      await deviceService.unpairDevice(workspaceId, deviceId);
      toast.success("Gerät entkoppelt");
      window.location.href = `/workspace/${workspaceId}/devices`;
    } catch {
      toast.error("Entkoppeln fehlgeschlagen");
      setUnpairing(false);
    }
  }

  if (loadState === "loading") {
    return <DeviceDetailSkeleton />;
  }

  if (loadState === "not-found") {
    return (
      <EmptyMessage
        title="Gerät nicht gefunden"
        description="Es gehört nicht zu diesem Workspace oder wurde entkoppelt."
        workspaceId={workspaceId}
      />
    );
  }

  if (loadState === "error" || !device) {
    return (
      <EmptyMessage
        title="Gerät nicht erreichbar"
        description="Der Server antwortet gerade nicht."
        workspaceId={workspaceId}
        onRetry={load}
      />
    );
  }

  const activeAlerts = device.activeAlerts.filter(
    (a) => a.state !== "RESOLVED",
  );
  const problems = problemAlerts(device);
  const hasVisionWarning = activeAlerts.some((a) => a.type === "SHARPNESS");
  const hb = device.latestHeartbeat;

  return (
    <div className="flex flex-col gap-5">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/workspace/${workspaceId}/devices`}>Anlage</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{device.name ?? device.deviceId}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {device.name ?? device.deviceId}
            </h1>
            {!device.online ? (
              <StatusPill tone="danger">Offline</StatusPill>
            ) : problems.length > 0 ? (
              <StatusPill tone={alertTone(problems[0])}>
                {describeTitle(problems[0].type)}
              </StatusPill>
            ) : (
              <StatusPill tone="ok">Alles gut</StatusPill>
            )}
          </div>
          <div className="mt-2 flex gap-3.5 text-[12.5px] text-muted-foreground">
            <span>
              Firmware{" "}
              <span className="font-mono">{hb?.fwVersion ?? "—"}</span>
            </span>
            <span className="font-mono opacity-80">
              device_id {device.deviceId}
            </span>
          </div>
        </div>
      </div>

      {activeAlerts.map((alert) => (
        <AlertCard
          key={alert.id}
          alert={alert}
          onResolve={() => acknowledge(alert.id, describeTitle(alert.type))}
        />
      ))}

      {!hb ? (
        <Card>
          <CardContent className="flex items-center gap-3 p-5 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Noch kein Heartbeat empfangen. Der Pi fragt jede Minute nach —
            das kann bis zu fünf Minuten dauern.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <MetricGroup title="Verbindung">
              <MetricRow
                tone={device.online ? "ok" : "danger"}
                headline={
                  device.online
                    ? `Online · ${formatRelative(device.lastHeartbeatAt)}`
                    : `Offline seit ${formatRelative(device.lastHeartbeatAt)}`
                }
                context="Heartbeat alle 5 Minuten erwartet"
                raw={`received_at ${formatAbsolute(hb.receivedAt)}`}
              />
              <MetricRow
                tone={
                  hb.wifiRssi == null
                    ? "neutral"
                    : hb.wifiRssi > -70
                      ? "ok"
                      : "warning"
                }
                headline={
                  hb.wifiRssi == null
                    ? "WLAN-Signal unbekannt"
                    : hb.wifiRssi > -70
                      ? "WLAN stark"
                      : "WLAN schwach"
                }
                context="Signalstärke des letzten Heartbeats"
                raw={`wifi_rssi ${hb.wifiRssi ?? "?"} dBm`}
              />
              <MetricRow
                tone={hb.timeSynced ? "ok" : "warning"}
                headline={
                  hb.timeSynced
                    ? "Zeit synchron · Queue leer"
                    : "Zeit nicht synchron"
                }
                context={
                  hb.queueDepth > 0
                    ? `${hb.queueDepth} nachgereichte Heartbeats`
                    : "keine nachgereichten Heartbeats"
                }
                raw={`time_synced ${hb.timeSynced} · queue_depth ${hb.queueDepth}`}
              />
            </MetricGroup>

            <MetricGroup title="Speicher">
              <MetricRow
                tone={hb.ssdMounted ? "ok" : "danger"}
                headline={
                  hb.ssdMounted
                    ? `SSD eingehängt${hb.diskUsedRatio != null ? ` · ${Math.round(hb.diskUsedRatio * 100)} % belegt` : ""}`
                    : "SSD fehlt — Aufnahme läuft nicht"
                }
                context={
                  hb.diskFreeBytes
                    ? `${(Number(hb.diskFreeBytes) / 1e9).toFixed(0)} GB frei`
                    : undefined
                }
                raw={`ssd_mounted ${hb.ssdMounted} · disk_used_ratio ${hb.diskUsedRatio ?? "?"}`}
              />
              <MetricRow
                tone={hb.unpulledDeleted > 0 ? "danger" : "ok"}
                headline={
                  hb.unpulledDeleted > 0 ? "Material verloren" : "Nichts verloren"
                }
                context={
                  hb.oldestDay ? `ältestes Material ${hb.oldestDay}` : undefined
                }
                raw={`unpulled_deleted ${hb.unpulledDeleted} · oldest_day ${hb.oldestDay ?? "?"}`}
              />
            </MetricGroup>

            <MetricGroup title="Zustand">
              <MetricRow
                tone={
                  hb.cpuTempC == null
                    ? "neutral"
                    : hb.cpuTempC < 65
                      ? "ok"
                      : "warning"
                }
                headline={
                  hb.cpuTempC != null ? `CPU ${hb.cpuTempC.toFixed(0)} °C` : "CPU-Temperatur unbekannt"
                }
                context={hb.cpuTempC != null ? "im grünen Bereich" : undefined}
                raw={`cpu_temp ${hb.cpuTempC?.toFixed(1) ?? "?"} °C`}
              />
              <MetricRow
                tone={!hb.throttled || hb.throttled === "0x0" ? "ok" : "danger"}
                headline={
                  !hb.throttled || hb.throttled === "0x0"
                    ? "Stromversorgung stabil"
                    : "Stromversorgung instabil"
                }
                context={
                  !hb.throttled || hb.throttled === "0x0"
                    ? "keine Unterspannung"
                    : "aktiver USB-Hub nötig"
                }
                raw={`${hb.throttled ?? "0x0"} · throttled`}
              />
            </MetricGroup>

            <MetricGroup title="Sicht" warn={hasVisionWarning}>
              <MetricRow
                tone={hasVisionWarning ? "warning" : "ok"}
                headline={
                  hb.sharpness != null
                    ? `Sicht ${hasVisionWarning ? "unscharf" : "scharf"} · ${hb.sharpness.toFixed(0)}`
                    : "Schärfe unbekannt"
                }
                context={
                  device.sharpnessMedian7d != null
                    ? `üblich sind hier ${device.sharpnessMedian7d.toFixed(0)}${hasVisionWarning ? " — schleichender Abfall" : ""}`
                    : "noch kein 7-Tage-Median"
                }
                raw={`sharpness ${hb.sharpness?.toFixed(1) ?? "?"} · Median ${device.sharpnessMedian7d?.toFixed(0) ?? "?"}`}
              />
              <MetricRow
                tone={hb.beardDensity != null && hb.beardDensity > 0.5 ? "beard" : "ok"}
                headline={
                  hb.beardDensity != null && hb.beardDensity > 0.5
                    ? "Bienenbart · Flugloch verdeckt"
                    : "Flugloch frei"
                }
                context={
                  hb.lastRecordingUsable != null
                    ? hb.lastRecordingUsable
                      ? "letzte Aufnahme brauchbar"
                      : "letzte Aufnahme unbrauchbar"
                    : undefined
                }
                raw={`beard_density ${hb.beardDensity?.toFixed(2) ?? "?"} · usable ${hb.lastRecordingUsable ?? "?"}`}
              />
            </MetricGroup>
          </div>

          {(device.sharpnessTrend.length > 0 ||
            device.cpuTempTrend.length > 0 ||
            device.diskUsedTrend.length > 0) && (
            <Card>
              <CardContent className="p-5">
                <div className="text-[15px] font-semibold">Verläufe · 7 Tage</div>
                <div className="mt-1 text-[12.5px] text-muted-foreground">
                  Die Schärfekurve ist das Frühwarnsignal — ein schleichender
                  Abfall zeigt die verschmutzte Linse an, lange bevor Bilder
                  ausfallen.
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr_1fr]">
                  <div
                    className={`rounded-lg border p-4 ${hasVisionWarning ? "border-warning/30 bg-warning/10" : "border-border"}`}
                  >
                    <div className="flex items-baseline justify-between">
                      <span
                        className={`text-[13px] font-semibold ${hasVisionWarning ? "text-warning-strong" : ""}`}
                      >
                        Schärfe
                      </span>
                    </div>
                    <Sparkline
                      values={device.sharpnessTrend.map((p) => p.value)}
                      stroke={hasVisionWarning ? "hsl(var(--warning))" : "hsl(var(--primary-strong))"}
                      median={device.sharpnessMedian7d ?? undefined}
                    />
                    {device.sharpnessMedian7d != null && (
                      <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                        gestrichelt: 7-Tage-Median ({device.sharpnessMedian7d.toFixed(0)})
                      </div>
                    )}
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-[13px] font-semibold">CPU-Temp</div>
                    <Sparkline
                      values={device.cpuTempTrend.map((p) => p.value)}
                      stroke="hsl(var(--primary-strong))"
                    />
                  </div>
                  <div className="rounded-lg border p-4">
                    <div className="text-[13px] font-semibold">Belegung</div>
                    <Sparkline
                      values={device.diskUsedTrend.map((p) => p.value)}
                      stroke="hsl(var(--primary-strong))"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 text-[15px] font-semibold">Einstellungen</div>
            <Label htmlFor="device-name">Volksname</Label>
            <Input
              id="device-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!canManage}
              className="mt-1.5"
            />
            <div className="mt-3.5 flex gap-2.5">
              <div className="flex-1">
                <Label>Standort (lat / lon)</Label>
                <div className="mt-1.5 flex gap-2">
                  <Input
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    disabled={!canManage}
                    className="font-mono text-[13px]"
                  />
                  <Input
                    value={lon}
                    onChange={(e) => setLon(e.target.value)}
                    disabled={!canManage}
                    className="font-mono text-[13px]"
                  />
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Der Standort steuert die Sonnenzeiten auf dem Pi — und damit
              das Aufnahmefenster.
            </p>
            <Label className="mb-1.5 mt-3.5 block">Aufnahmemodus</Label>
            <Tabs
              value={recordingMode}
              onValueChange={(v) => setRecordingMode(v as "SPARSE" | "CONTINUOUS")}
            >
              <TabsList>
                <TabsTrigger value="SPARSE" disabled={!canManage}>
                  Sparse · 5 von 30 Min
                </TabsTrigger>
                <TabsTrigger value="CONTINUOUS" disabled={!canManage}>
                  Durchgehend
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {canManage && (
              <Button
                className="mt-4"
                size="sm"
                onClick={handleSaveSettings}
                disabled={saving}
              >
                {saving ? "Speichere …" : "Speichern"}
              </Button>
            )}
          </CardContent>
        </Card>

        {canManage && (
          <Card className="border-destructive/30">
            <CardContent className="p-5">
              <div className="text-[15px] font-semibold text-destructive">
                Gefahrenzone
              </div>
              <div className="mb-1 mt-1 text-[12.5px] text-muted-foreground">
                Nur OWNER und ADMIN. Beide Aktionen mit ausgeschriebener
                Konsequenz.
              </div>
              <div className="flex items-center justify-between gap-3 border-t py-3.5">
                <div>
                  <div className="text-sm font-semibold">Token rotieren</div>
                  <div className="text-[12.5px] text-muted-foreground">
                    Danach meldet sich der Pi über den Pairing-Code neu.
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-none border-destructive/30 text-destructive"
                  onClick={handleRotateToken}
                  disabled={rotating}
                >
                  {rotating ? "…" : "Rotieren"}
                </Button>
              </div>
              <div className="flex items-center justify-between gap-3 border-t py-3.5">
                <div>
                  <div className="text-sm font-semibold">Gerät entkoppeln</div>
                  <div className="text-[12.5px] text-muted-foreground">
                    Das Volk verliert seine Historie — Volk und Gerät sind
                    identisch.
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-none"
                  onClick={handleUnpair}
                  disabled={unpairing}
                >
                  {unpairing ? "…" : "Entkoppeln"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function describeTitle(type: string): string {
  const titles: Record<string, string> = {
    SSD_MISSING: "SSD fehlt",
    UNDERVOLTAGE: "Stromversorgung instabil",
    DISK_FULL: "Platte voll",
    UNPULLED_DELETED: "Ungesichertes Material gelöscht",
    SHARPNESS: "Sichtqualität unzureichend",
    BEARD: "Bienenbart · Sicht verdeckt",
    TIME_NOT_SYNCED: "Zeit nicht synchron",
  };
  return titles[type] ?? type;
}

function MetricGroup({
  title,
  warn,
  children,
}: {
  title: string;
  warn?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card className={warn ? "border-warning/30" : undefined}>
      <CardContent className="p-5">
        <div className="mb-3.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </div>
        <div className="flex flex-col gap-3.5">{children}</div>
      </CardContent>
    </Card>
  );
}

function Sparkline({
  values,
  stroke,
  median,
}: {
  values: number[];
  stroke: string;
  median?: number;
}) {
  if (values.length < 2) {
    return (
      <div className="mt-2 flex h-[70px] items-center justify-center text-xs text-muted-foreground">
        noch zu wenig Daten
      </div>
    );
  }

  const width = 160;
  const height = 70;
  const min = Math.min(...values, median ?? Infinity);
  const max = Math.max(...values, median ?? -Infinity);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const medianY = median !== undefined ? height - ((median - min) / range) * height : null;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mt-2 h-[70px] w-full"
      preserveAspectRatio="none"
    >
      {medianY !== null && (
        <line
          x1={0}
          y1={medianY}
          x2={width}
          y2={medianY}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={1}
          strokeDasharray="3 4"
          opacity={0.5}
        />
      )}
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DeviceDetailSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function EmptyMessage({
  title,
  description,
  workspaceId,
  onRetry,
}: {
  title: string;
  description: string;
  workspaceId: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      {onRetry ? (
        <Button onClick={onRetry}>Erneut versuchen</Button>
      ) : (
        <Button asChild variant="outline">
          <Link href={`/workspace/${workspaceId}/devices`}>Zur Anlage</Link>
        </Button>
      )}
    </div>
  );
}
