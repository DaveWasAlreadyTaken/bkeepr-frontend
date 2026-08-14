"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardPaste,
  Loader2,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { deviceService } from "@/app/services/device.service";
import { ApiException } from "@/app/services/api-config";

type Step = "code" | "details" | "confirm";

export function PairDeviceDialog({
  workspaceId,
  open,
  onOpenChange,
  onPaired,
}: {
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaired: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <PairDeviceDialogContent
        key={open ? "open" : "closed"}
        workspaceId={workspaceId}
        onOpenChange={onOpenChange}
        onPaired={onPaired}
      />
    </Dialog>
  );
}

function PairDeviceDialogContent({
  workspaceId,
  onOpenChange,
  onPaired,
}: {
  workspaceId: string;
  onOpenChange: (open: boolean) => void;
  onPaired: () => void;
}) {
  const [step, setStep] = useState<Step>("code");
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [codeError, setCodeError] = useState<string | null>(null);
  const [checkingCode, setCheckingCode] = useState(false);
  const [pairedDeviceId, setPairedDeviceId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [saving, setSaving] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step !== "confirm") return;
    const interval = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const code = digits.join("");

  function handleDigitChange(index: number, value: string) {
    const char = value.slice(-1).toUpperCase();
    if (char && !/^[A-Z0-9]$/.test(char)) return;
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    setCodeError(null);
    if (char && index < 5) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const text = e.clipboardData
      .getData("text")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
    if (!text) return;
    e.preventDefault();
    const next = Array(6).fill("");
    for (let i = 0; i < 6 && i < text.length; i++) next[i] = text[i];
    setDigits(next);
    setCodeError(null);
    inputRefs.current[Math.min(text.length, 5)]?.focus();
  }

  async function handleCheckCode() {
    if (code.length < 6 || checkingCode) return;
    setCheckingCode(true);
    setCodeError(null);
    try {
      const result = await deviceService.pairDevice({
        pairingCode: code,
        workspaceId,
      });
      setPairedDeviceId(result.id);
      setStep("details");
    } catch (error) {
      if (error instanceof ApiException && error.error.status === 404) {
        setCodeError("Kein Gerät mit diesem Code");
      } else if (error instanceof ApiException && error.error.status === 403) {
        setCodeError("Nur OWNER und ADMIN dürfen koppeln");
      } else {
        setCodeError("Koppeln fehlgeschlagen — versuch es erneut");
      }
    } finally {
      setCheckingCode(false);
    }
  }

  async function handleConfirmPairing() {
    if (!pairedDeviceId || saving) return;
    setSaving(true);
    try {
      await deviceService.updateDevice(workspaceId, pairedDeviceId, {
        name: name.trim() || undefined,
        lat: lat.trim() ? Number(lat) : undefined,
        lon: lon.trim() ? Number(lon) : undefined,
      });
      setStep("confirm");
    } catch {
      // Das Gerät ist schon gekoppelt — Name/Standort lassen sich später in
      // den Einstellungen nachtragen, deshalb blockiert ein Fehler hier nicht.
      setStep("confirm");
    } finally {
      setSaving(false);
    }
  }

  function handleFinish() {
    onPaired();
    onOpenChange(false);
  }

  return (
    <DialogContent className="sm:max-w-[440px]">
      {step === "code" && (
        <>
          <DialogHeader>
            <StepBadge n={1} />
            <DialogTitle className="mt-3">Code eingeben</DialogTitle>
            <DialogDescription>
              Der Code steht auf dem Bildschirm des Telefons, das gerade mit dem
              Pi verbunden war. Sechs Zeichen, Großbuchstaben und Ziffern.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <Input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                value={d}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                maxLength={1}
                className={cn(
                  "h-[60px] flex-1 text-center font-mono text-2xl font-semibold",
                  codeError && "border-destructive bg-destructive/5",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={async () => {
              const text = await navigator.clipboard.readText().catch(() => "");
              if (!text) return;
              const clean = text.toUpperCase().replace(/[^A-Z0-9]/g, "");
              const next = Array(6).fill("");
              for (let i = 0; i < 6 && i < clean.length; i++)
                next[i] = clean[i];
              setDigits(next);
              setCodeError(null);
            }}
            className="inline-flex w-fit items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs text-muted-foreground"
          >
            <ClipboardPaste className="h-3.5 w-3.5" />
            Aus Zwischenablage einfügen
          </button>

          {codeError && (
            <div className="flex gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 p-3.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-destructive" />
              <div>
                <div className="text-sm font-semibold text-destructive">
                  {codeError}
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  Prüfe auf einen Tippfehler. Wenn der Pi noch kein WLAN hat,
                  taucht er hier noch nicht auf — dann zuerst das Setup am Pi
                  abschließen.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={handleCheckCode}
              disabled={code.length < 6 || checkingCode}
            >
              {checkingCode
                ? "Prüfe …"
                : codeError
                  ? "Erneut prüfen"
                  : "Weiter"}
            </Button>
          </div>
        </>
      )}

      {step === "details" && (
        <>
          <DialogHeader>
            <StepBadge n={2} />
            <DialogTitle className="mt-3">
              Volk benennen und verorten
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div>
              <Label htmlFor="pair-name">Volksname</Label>
              <Input
                id="pair-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Stock 2 · Kontrolle"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Standort</Label>
              <div className="relative mt-1.5 flex h-[110px] items-center justify-center rounded-lg border bg-[linear-gradient(hsl(var(--muted))_1px,transparent_1px),linear-gradient(90deg,hsl(var(--muted))_1px,transparent_1px)] bg-[size:22px_22px]">
                <MapPin className="h-6 w-6 fill-primary text-primary-strong" />
                <span className="absolute bottom-2 left-2.5 rounded bg-card/80 px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                  Kartenplatzhalter
                </span>
              </div>
              <div className="mt-2.5 flex gap-2.5">
                <div className="flex-1">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    lat
                  </span>
                  <Input
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="48.1372"
                    className="mt-0.5 font-mono text-[13px]"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    lon
                  </span>
                  <Input
                    value={lon}
                    onChange={(e) => setLon(e.target.value)}
                    placeholder="11.5756"
                    className="mt-0.5 font-mono text-[13px]"
                  />
                </div>
              </div>
              <p className="mt-2.5 flex gap-2 text-[12.5px] leading-relaxed text-muted-foreground">
                <MapPin className="mt-0.5 h-3.5 w-3.5 flex-none" />
                Der Standort bestimmt Sonnenauf- und -untergang und damit das
                Aufnahmefenster des Pi.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setStep("code")}>
              Zurück
            </Button>
            <Button onClick={handleConfirmPairing} disabled={saving}>
              {saving ? "Speichere …" : "Koppeln"}
            </Button>
          </div>
        </>
      )}

      {step === "confirm" && (
        <>
          <DialogHeader>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success text-white">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
            <DialogTitle className="sr-only">Gekoppelt</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center text-center">
            <div className="flex h-[60px] w-[60px] items-center justify-center rounded-2xl border border-success/25 bg-success/10 text-success">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-xl font-semibold tracking-tight">
              {name.trim() || "Das Gerät"} ist gekoppelt
            </h2>
            <p className="mt-2 max-w-[320px] text-[13.5px] leading-relaxed text-muted-foreground">
              Der Pi fragt jetzt jede Minute nach. Der erste Heartbeat kommt in
              spätestens fünf Minuten — dann erscheint das Volk in der
              Anlage-Liste.
            </p>
            <div className="mt-4 flex w-full items-center gap-2.5 rounded-lg border bg-background px-3.5 py-3">
              <Loader2 className="h-4 w-4 flex-none animate-spin text-muted-foreground" />
              <span className="text-left text-[13px] text-muted-foreground">
                Warte auf ersten Heartbeat …
              </span>
              <span className="ml-auto font-mono text-xs text-muted-foreground">
                0:{countdown.toString().padStart(2, "0")}
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleFinish}>Zur Anlage-Liste</Button>
          </div>
        </>
      )}
    </DialogContent>
  );
}

function StepBadge({ n }: { n: number }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary font-mono text-[11px] text-primary-foreground">
        {n}
      </span>
      Schritt {n} von 3
    </div>
  );
}
