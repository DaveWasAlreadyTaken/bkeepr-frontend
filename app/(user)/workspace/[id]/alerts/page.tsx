"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { alertService, type UsableDay } from "@/app/services/alert.service";
import type { DeviceAlert } from "@/app/services/device.service";
import { ApiException } from "@/app/services/api-config";

import { AlertCard } from "../_components/alert-card";

type LoadState = "loading" | "error" | "ready";
type DayKind = UsableDay["kind"];

const DAY_BAR_CLASS: Record<DayKind, string> = {
  ok: "bg-primary",
  beard: "bg-beard",
  offline: "",
  none: "bg-muted",
};

const DAY_BAR_HATCH: Partial<Record<DayKind, React.CSSProperties>> = {
  offline: {
    backgroundImage:
      "repeating-linear-gradient(45deg, hsl(var(--destructive) / .7) 0 3px, hsl(var(--destructive) / .2) 3px 6px)",
  },
};

const now = new Date();
const MONTH_LABEL = now.toLocaleDateString("de-DE", { month: "long" });

export default function AlertsPage() {
  const params = useParams();
  const workspaceId = params.id as string;

  const [alerts, setAlerts] = useState<DeviceAlert[]>([]);
  const [usableDays, setUsableDays] = useState<UsableDay[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const load = useCallback(async () => {
    setLoadState("loading");
    try {
      const [alertResult, usableResult] = await Promise.all([
        alertService.listAlerts(workspaceId),
        alertService.getUsableDays(workspaceId, now.getFullYear(), now.getMonth() + 1),
      ]);
      setAlerts(alertResult);
      setUsableDays(usableResult);
      setLoadState("ready");
    } catch (error) {
      setErrorMessage(
        error instanceof ApiException ? error.error.message : "Unbekannter Fehler",
      );
      setLoadState("error");
    }
  }, [workspaceId]);

  useEffect(() => {
    load();
  }, [load]);

  async function resolve(alert: DeviceAlert) {
    try {
      await alertService.acknowledgeAlert(workspaceId, alert.id);
      toast.success(alert.type === "UNPULLED_DELETED" ? "Verstanden" : "Quittiert");
      load();
    } catch {
      toast.error("Quittieren fehlgeschlagen");
    }
  }

  if (loadState === "loading") {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-24 rounded-xl" />
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Alerts nicht erreichbar</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {errorMessage}
          </p>
        </div>
        <Button onClick={load}>Erneut versuchen</Button>
      </div>
    );
  }

  const active = alerts.filter((a) => a.state !== "RESOLVED");
  const daysWithData = usableDays.filter((d) => d.kind !== "none");
  const goodDays = daysWithData.filter((d) => d.kind === "ok").length;
  const tickDays = usableDays.filter((d) => [1, 8, 15, 22, 29].includes(d.day));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Alerts &amp; Ereignisse
      </h1>

      <div>
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Aktive Zustände
        </div>
        {active.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              Keine aktiven Zustände — alles gut.
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {active.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                deviceName={alert.deviceName ?? undefined}
                onResolve={() => resolve(alert)}
              />
            ))}
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-[15px] font-semibold">
                Brauchbare Tage · {MONTH_LABEL}
              </div>
              <div className="mt-0.5 max-w-lg text-[12.5px] text-muted-foreground">
                Ein Balken pro Tag — beantwortet, wie viele Tage dieses
                Monats überhaupt auswertbar waren.
              </div>
            </div>
            <div className="flex gap-1.5">
              <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium">
                Alle Völker
              </span>
              <span className="rounded-md border px-2.5 py-1 text-xs text-muted-foreground">
                Alle Arten
              </span>
            </div>
          </div>

          {usableDays.length === 0 ? (
            <div className="mt-5 flex h-[70px] items-center justify-center rounded-lg border text-xs text-muted-foreground">
              Noch keine Daten diesen Monat
            </div>
          ) : (
            <>
              <div className="mt-5 flex h-[70px] items-end gap-1">
                {usableDays.map((d) => (
                  <div
                    key={d.day}
                    title={`${d.day}. ${MONTH_LABEL}`}
                    style={{
                      height: `${d.pct}%`,
                      ...DAY_BAR_HATCH[d.kind],
                    }}
                    className={cn("flex-1 rounded-sm", DAY_BAR_CLASS[d.kind])}
                  />
                ))}
              </div>
              <div className="mt-1.5 flex justify-between font-mono text-[10px] text-muted-foreground">
                {tickDays.map((d) => (
                  <span key={d.day}>{String(d.day).padStart(2, "0")}</span>
                ))}
              </div>
            </>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm">
              <strong className="font-mono font-bold">{goodDays}</strong>{" "}
              <span className="text-muted-foreground">
                von {daysWithData.length} Tagen brauchbar
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <LegendSwatch className="bg-primary" label="brauchbar" />
              <LegendSwatch className="bg-beard" label="teils Bienenbart" />
              <LegendSwatch style={DAY_BAR_HATCH.offline} label="offline" />
              <LegendSwatch className="bg-muted" label="keine Daten" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LegendSwatch({
  className,
  style,
  label,
}: {
  className?: string;
  style?: React.CSSProperties;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-3 w-3 rounded-sm", className)} style={style} />
      {label}
    </span>
  );
}
