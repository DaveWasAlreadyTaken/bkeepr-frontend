"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GlobeIcon,
  LockKeyholeIcon,
  MailIcon,
  ArrowRight,
  XCircleIcon,
} from "lucide-react";
import { workspaceService } from "@/app/services/workspace.service";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/app/stores/auth.store";

interface WorkspaceStatus {
  isPrivate: boolean;
  isMember: boolean;
  name: string;
  requestStatus: string | null; // 'ACCEPTED', 'REJECTED', 'PENDING' oder null
}

const WorkspaceAccessPage = () => {
  const params = useParams();
  const router = useRouter();
  const updateCurrentUser = useAuthStore((state) => state.updateCurrentUser);
  const user = useAuthStore((state) => state.user);
  const workspaceId = params.id as string;
  const [status, setStatus] = useState<WorkspaceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  // Referenz, um zu verfolgen, ob ein Redirect bereits eingeleitet wurde
  const redirectingRef = useRef(false);
  // Referenz, um zu verfolgen, ob die Initialisierung bereits erfolgt ist
  const initializedRef = useRef(false);

  // Funktion zum Laden des Workspace-Status
  const fetchWorkspaceStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const workspaceStatus =
        await workspaceService.getWorkspaceStatus(workspaceId);
      setStatus(workspaceStatus);

      // Wenn der Benutzer bereits Mitglied ist (laut API-Antwort),
      // zum Workspace weiterleiten
      if (workspaceStatus.isMember && !redirectingRef.current) {
        redirectingRef.current = true;
        toast.info("Du bist bereits Mitglied dieses Workspaces");
        router.push(`/workspace/${workspaceId}`);
      }
    } catch (error) {
      console.error("Fehler beim Laden des Workspace-Status:", error);
      toast.error("Fehler beim Laden des Workspace-Status", {
        description:
          error instanceof Error
            ? error.message
            : "Bitte versuche es später erneut",
      });
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId, router, redirectingRef]);

  // Funktion zum Prüfen der Workspace-Mitgliedschaft
  const checkWorkspaceMembership = useCallback(() => {
    if (user && workspaceId) {
      const isMember = user.workspaces.some(
        (workspace) => workspace.id === workspaceId,
      );

      if (isMember && !redirectingRef.current) {
        redirectingRef.current = true;
        toast.info("Du bist bereits Mitglied dieses Workspaces");
        router.push(`/workspace/${workspaceId}`);
        return true;
      }
    }
    return false;
  }, [user, workspaceId, router, redirectingRef]);

  // Initialisierung
  const initialize = useCallback(async () => {
    if (redirectingRef.current) return;

    try {
      // Aktualisiere zuerst die Benutzerdaten vom Server
      await updateCurrentUser();

      // Prüfe, ob der Benutzer bereits Mitglied ist
      const isMember = checkWorkspaceMembership();

      // Wenn der Benutzer kein Mitglied ist und kein Redirect
      // eingeleitet wurde, lade den Workspace-Status
      if (!isMember && !redirectingRef.current) {
        await fetchWorkspaceStatus();
      }
    } catch (error) {
      console.error("Fehler bei der Initialisierung:", error);

      // Bei Fehlern trotzdem den Workspace-Status laden
      if (!redirectingRef.current) {
        await fetchWorkspaceStatus();
      }
    }
  }, [
    updateCurrentUser,
    checkWorkspaceMembership,
    fetchWorkspaceStatus,
    redirectingRef,
  ]);

  useEffect(() => {
    // Verhindere mehrfache Ausführung - führe den Code nur einmal aus
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Starte die Initialisierung
    initialize();
  }, [initialize]);

  const handleJoinWorkspace = async () => {
    try {
      setIsJoining(true);
      const result = await workspaceService.joinWorkspace(workspaceId);

      // Bei einem öffentlichen Workspace erfolgt direkter Beitritt
      if ("roles" in result && result.roles.includes("MEMBER")) {
        // Aktualisiere den Benutzer mit den aktuellen Daten vom Server
        await updateCurrentUser();

        toast.success("Erfolgreich beigetreten", {
          description: `Du bist dem Workspace "${status?.name}" erfolgreich beigetreten.`,
        });

        // Redirect zum Workspace
        router.push(`/workspace/${workspaceId}`);
      }
    } catch (error) {
      console.error("Fehler beim Beitritt zum Workspace:", error);
      toast.error("Beitritt fehlgeschlagen", {
        description:
          error instanceof Error
            ? error.message
            : "Bitte versuche es später erneut",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleRequestAccess = async () => {
    try {
      setIsJoining(true);
      const result = await workspaceService.joinWorkspace(workspaceId);

      // Bei einem privaten Workspace wird eine Anfrage gestellt
      if ("status" in result && result.status === "PENDING") {
        toast.success("Anfrage gesendet", {
          description: `Deine Beitrittsanfrage für "${status?.name}" wurde erfolgreich gesendet und wird geprüft.`,
        });

        // Benutzerdaten aktualisieren und dann den Workspace-Status neu laden
        await updateCurrentUser();

        // Status lokal aktualisieren
        if (status) {
          setStatus({
            ...status,
            requestStatus: "PENDING",
          });
        }
      }
    } catch (error) {
      console.error("Fehler beim Senden der Beitrittsanfrage:", error);
      toast.error("Anfrage fehlgeschlagen", {
        description:
          error instanceof Error
            ? error.message
            : "Bitte versuche es später erneut",
      });
    } finally {
      setIsJoining(false);
    }
  };

  const handleWithdrawRequest = async () => {
    try {
      setIsWithdrawing(true);
      await workspaceService.withdrawJoinRequest(workspaceId);

      toast.success("Anfrage zurückgezogen", {
        description: `Deine Beitrittsanfrage für "${status?.name}" wurde erfolgreich zurückgezogen.`,
      });

      // Benutzerdaten aktualisieren
      await updateCurrentUser();

      // Status lokal aktualisieren
      if (status) {
        setStatus({
          ...status,
          requestStatus: null,
        });
      }
    } catch (error) {
      console.error("Fehler beim Zurückziehen der Beitrittsanfrage:", error);
      toast.error("Zurückziehen der Anfrage fehlgeschlagen", {
        description:
          error instanceof Error
            ? error.message
            : "Bitte versuche es später erneut",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  const renderActionButton = () => {
    if (!status) return null;

    if (status.isPrivate) {
      // Für private Workspaces
      if (status.requestStatus === "PENDING") {
        return (
          <Button
            onClick={handleWithdrawRequest}
            className="w-full bg-amber-500 hover:bg-amber-600"
            disabled={isWithdrawing}
            loading={isWithdrawing}
          >
            {isWithdrawing ? (
              <>Anfrage wird zurückgezogen</>
            ) : (
              <>
                Beitrittsanfrage zurückziehen
                <XCircleIcon className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        );
      } else if (status.requestStatus === "REJECTED") {
        return (
          <div className="space-y-2">
            <div className="rounded-md bg-red-50 p-3">
              <p className="text-sm text-red-800">
                Deine Beitrittsanfrage wurde abgelehnt.
              </p>
            </div>
            <Button
              onClick={handleRequestAccess}
              className="w-full"
              disabled={isJoining}
              loading={isJoining}
            >
              {isJoining ? (
                <>Anfrage wird gesendet</>
              ) : (
                <>
                  Erneut anfragen
                  <MailIcon className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        );
      } else {
        return (
          <Button
            onClick={handleRequestAccess}
            className="w-full"
            disabled={isJoining}
            loading={isJoining}
          >
            {isJoining ? (
              <>Anfrage wird gesendet</>
            ) : (
              <>
                Beitrittsanfrage senden
                <MailIcon className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        );
      }
    } else {
      // Für öffentliche Workspaces
      return (
        <Button
          onClick={handleJoinWorkspace}
          className="group w-full"
          disabled={isJoining}
          loading={isJoining}
        >
          {isJoining ? (
            <>Beitritt wird verarbeitet</>
          ) : (
            <>
              Workspace beitreten
              <ArrowRight className="ml-2 h-4 w-4 duration-200 group-hover:translate-x-1" />
            </>
          )}
        </Button>
      );
    }
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-md">
        {isLoading ? (
          <>
            <CardHeader className="flex flex-row items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <div className="pt-4">
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="flex flex-row items-end gap-2">
              {status?.isPrivate ? (
                <LockKeyholeIcon className="h-5 w-5 text-amber-500" />
              ) : (
                <GlobeIcon className="h-5 w-5 text-green-500" />
              )}
              <CardTitle>
                {status?.isPrivate
                  ? "Privater Workspace"
                  : "Öffentlicher Workspace"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="text-lg font-medium">{status?.name}</div>
              <p className="text-muted-foreground">
                {status?.isPrivate
                  ? status?.requestStatus === "PENDING"
                    ? "Du hast bereits eine Beitrittsanfrage für diesen privaten Workspace gestellt. Die Anfrage wird geprüft."
                    : status?.requestStatus === "REJECTED"
                      ? "Deine letzte Beitrittsanfrage wurde abgelehnt. Du kannst erneut eine Anfrage stellen."
                      : "Dies ist ein privater Workspace. Um beizutreten, benötigst du eine Einladung oder musst eine Beitrittsanfrage stellen."
                  : "Dies ist ein öffentlicher Workspace. Du kannst diesem Workspace direkt beitreten."}
              </p>

              <div className="flex flex-col gap-2 pt-4">
                {renderActionButton()}
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default WorkspaceAccessPage;
