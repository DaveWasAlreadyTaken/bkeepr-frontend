"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Plus,
  Video,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/app/stores/auth.store";
import { useHasHydrated } from "@/hooks/use-has-hydrated";
import { deviceService, type Device } from "@/app/services/device.service";
import { ApiException } from "@/app/services/api-config";

import { alertTone, describeAlert, deviceTone, problemAlerts } from "../_lib/alerts";
import { formatRelative } from "../_lib/format";
import { PairDeviceDialog } from "../_components/pair-device-dialog";
import { StatusPill } from "../_components/status-pill";

type LoadState = "loading" | "error" | "ready";

function overallTone(devices: Device[]): "ok" | "warning" | "danger" {
  let tone: "ok" | "warning" | "danger" = "ok";
  for (const d of devices) {
    const t = deviceTone(d);
    if (t === "danger") return "danger";
    if (t === "warning") tone = "warning";
  }
  return tone;
}

const STRIP_CLASSES: Record<
  "ok" | "warning" | "danger",
  { container: string; iconBg: string; headline: string }
> = {
  ok: {
    container: "border-success/25 bg-success/10",
    iconBg: "bg-success",
    headline: "text-success",
  },
  warning: {
    container: "border-warning/30 bg-warning/10",
    iconBg: "bg-warning",
    headline: "text-warning-strong",
  },
  danger: {
    container: "border-destructive/30 bg-destructive/10",
    iconBg: "bg-destructive",
    headline: "text-destructive",
  },
};

export default function DevicesPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const { hasWorkspaceRole } = useAuthStore();
  const hasHydrated = useHasHydrated();
  const canManageDevices =
    hasHydrated &&
    (hasWorkspaceRole(workspaceId, "OWNER") ||
      hasWorkspaceRole(workspaceId, "ADMIN"));

  const [devices, setDevices] = useState<Device[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [pairingOpen, setPairingOpen] = useState(false);

  const load = useCallback(async () => {
    setLoadState("loading");
    try {
      const result = await deviceService.listDevices(workspaceId);
      setDevices(result);
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

  if (loadState === "loading") {
    return <DevicesSkeleton />;
  }

  if (loadState === "error") {
    return <ErrorState message={errorMessage} onRetry={load} />;
  }

  const tone = overallTone(devices);
  const offlineDevice = devices.find((d) => !d.online);
  const issueDevice = devices.find((d) => deviceTone(d) !== "ok");
  const issueAlert = issueDevice ? problemAlerts(issueDevice)[0] : undefined;
  const strip = STRIP_CLASSES[tone];

  if (devices.length === 0) {
    return (
      <>
        <EmptyDevicesState
          canManageDevices={canManageDevices}
          onAdd={() => setPairingOpen(true)}
        />
        <PairDeviceDialog
          workspaceId={workspaceId}
          open={pairingOpen}
          onOpenChange={setPairingOpen}
          onPaired={load}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Anlage</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Alle Geräte dieses Standorts und ihr Zustand.
          </p>
        </div>
        {canManageDevices && (
          <Button onClick={() => setPairingOpen(true)}>
            <Plus className="h-4 w-4" />
            Volk hinzufügen
          </Button>
        )}
      </div>

      {/* 2-Sekunden-Rückversicherung — "alles gut", ohne dass man etwas lesen muss */}
      <div
        className={`flex items-center gap-3 rounded-xl border p-3.5 ${strip.container}`}
      >
        <span
          className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg text-white ${strip.iconBg}`}
        >
          {tone === "ok" ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertTriangle className="h-4 w-4" />
          )}
        </span>
        <div>
          <div className={`text-[15px] font-semibold ${strip.headline}`}>
            {tone === "ok"
              ? devices.length > 1
                ? "Alle Geräte online"
                : "Gerät online"
              : offlineDevice
                ? `${offlineDevice.name ?? "Gerät"} ist offline`
                : tone === "danger"
                  ? "Ein Alarm braucht deine Aufmerksamkeit"
                  : "Ein Hinweis wartet auf dich"}
          </div>
          {tone !== "ok" && !offlineDevice && issueDevice && issueAlert && (
            <div className="text-[13px] text-muted-foreground">
              {describeAlert(issueAlert).title} an{" "}
              {issueDevice.name ?? issueDevice.deviceId}.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {devices.map((device) => (
          <DeviceCard key={device.id} workspaceId={workspaceId} device={device} />
        ))}
      </div>

      {!canManageDevices && (
        <div className="font-mono text-[11px] text-muted-foreground">
          MEMBER-Zustand: identische Liste, aber ohne „Volk hinzufügen“ —
          reduzierte Oberfläche, keine ausgegrauten Buttons.
        </div>
      )}

      <PairDeviceDialog
        workspaceId={workspaceId}
        open={pairingOpen}
        onOpenChange={setPairingOpen}
        onPaired={load}
      />
    </div>
  );
}

function DeviceCard({
  workspaceId,
  device,
}: {
  workspaceId: string;
  device: Device;
}) {
  const problems = problemAlerts(device);
  const tone = deviceTone(device);
  const borderClass =
    tone === "danger"
      ? "border-destructive/30"
      : tone === "warning"
        ? "border-warning/30"
        : "border-border";
  const barClass =
    tone === "danger" ? "bg-destructive" : tone === "warning" ? "bg-warning" : "bg-success";

  return (
    <Link
      href={`/workspace/${workspaceId}/devices/${device.id}`}
      className={`flex overflow-hidden rounded-xl border bg-card shadow-sm ${borderClass}`}
    >
      <span className={`w-[5px] flex-none ${barClass}`} />
      <div className="flex-1 p-5">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <span className={`h-[9px] w-[9px] rounded-full ${barClass}`} />
            <span className="text-[17px] font-semibold">
              {device.name ?? device.deviceId}
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-4 flex flex-wrap gap-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Zustand
            </div>
            <div
              className={`mt-1 text-sm font-semibold ${
                tone === "danger"
                  ? "text-destructive"
                  : tone === "warning"
                    ? "text-warning-strong"
                    : "text-success"
              }`}
            >
              {!device.online
                ? "Offline"
                : tone === "danger"
                  ? "Online · Alarm"
                  : tone === "warning"
                    ? "Online · Hinweis"
                    : "Online · alles gut"}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Letzter Heartbeat
            </div>
            <div className="mt-1 text-sm">
              {formatRelative(device.lastHeartbeatAt)}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Alerts
            </div>
            <div className="mt-1">
              {problems.length === 0 ? (
                <span className="text-sm text-muted-foreground">keine</span>
              ) : (
                <StatusPill tone={alertTone(problems[0])}>
                  {describeAlert(problems[0]).title}
                </StatusPill>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function EmptyDevicesState({
  canManageDevices,
  onAdd,
}: {
  canManageDevices: boolean;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Video className="h-7 w-7" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Noch kein Gerät gekoppelt</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Schließe zuerst das Setup am Pi ab — er zeigt danach einen
          sechsstelligen Pairing-Code an. Den gibst du hier ein, um dein
          erstes Volk anzulegen.
        </p>
      </div>
      {canManageDevices && (
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Volk hinzufügen
        </Button>
      )}
    </div>
  );
}

function DevicesSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-40 rounded-lg" />
      </div>
      <Skeleton className="h-16 rounded-xl" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Anlage nicht erreichbar</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          {message}
        </p>
      </div>
      <Button onClick={onRetry}>Erneut versuchen</Button>
    </div>
  );
}
