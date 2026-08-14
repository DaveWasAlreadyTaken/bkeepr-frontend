"use client";

import { useState } from "react";
import { Check, Copy, HardDrive } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ClipsGuideDialog({
  open,
  onOpenChange,
  deviceId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deviceId: string;
}) {
  const pullCommand = `./tools/pull-clips.sh ${deviceId}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[800px]">
        <DialogHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-primary text-primary-foreground">
            <HardDrive className="h-5 w-5" />
          </div>
          <DialogTitle className="mt-3">
            So kommst du an deine Aufnahmen
          </DialogTitle>
          <DialogDescription>
            Video verlässt den Pi nie über WLAN — das ist Architektur, keine
            fehlende Funktion. Vom Laptop im Repo-Root diesen Befehl ausführen:
            rsync + Markierung als abgeholt. Der Hostname ist die{" "}
            <code className="font-mono text-foreground">device_id</code> dieses
            Geräts.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <CommandBlock
            label="Clips holen"
            hint={`Im Repo-Root. Ziel: ${deviceId}.local · Ablage: clips/${deviceId}/`}
            command={pullCommand}
          />

          <div className="rounded-lg border bg-muted/40 p-4 text-[13px] leading-relaxed text-muted-foreground">
            Voraussetzung: SSH-Key zum Pi, gleiches WLAN, Hostname per Install
            gesetzt. Videos bleiben danach zusätzlich auf der SSD, bis die
            400-GB-Quota greift — der Laptop ist deine einzige Archivkopie, eine
            zweite einplanen.
          </div>

          <div className="text-[13px] leading-relaxed text-muted-foreground">
            Zum Sichtprüfen und Handauszählen einzelner Clips:{" "}
            <code className="font-mono">tools/count/</code> im Repo — lädt
            eine lokale Videodatei per Drag-and-drop, kein Upload.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CommandBlock({
  label,
  hint,
  command,
}: {
  label: string;
  hint?: string;
  command: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(command).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      {hint && (
        <p className="mt-1 text-[13px] text-muted-foreground">{hint}</p>
      )}
      <div className="mt-2 flex items-stretch gap-2">
        <pre className="flex-1 overflow-x-auto rounded-lg border bg-background px-3 py-3 font-mono text-[13px] leading-relaxed">
          {command}
        </pre>
        <Button
          variant="outline"
          size="icon"
          className="h-auto flex-none"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
