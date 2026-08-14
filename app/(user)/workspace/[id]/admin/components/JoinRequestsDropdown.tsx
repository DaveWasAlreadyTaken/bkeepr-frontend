"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { workspaceService } from "@/app/services/workspace.service";
import { toast } from "sonner";
import { Check, X, Loader2, RefreshCcw, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { EWorkspaceRole } from "@/app/(superadmin)/superadmin/users/types";

interface JoinRequest {
  id: string;
  workspaceId: string;
  userId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
}

interface JoinRequestsDropdownProps {
  workspaceId: string;
  onUserApproved?: (user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    role: EWorkspaceRole;
  }) => void;
}

/**
 * Extrahiert die Initialen aus einem Namen
 */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/**
 * Formatiert ein Datum als relativen Zeitabstand (z.B. "vor 2 Tagen")
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffDays > 0) {
    return `vor ${diffDays} ${diffDays === 1 ? "Tag" : "Tagen"}`;
  } else if (diffHours > 0) {
    return `vor ${diffHours} ${diffHours === 1 ? "Stunde" : "Stunden"}`;
  } else if (diffMinutes > 0) {
    return `vor ${diffMinutes} ${diffMinutes === 1 ? "Minute" : "Minuten"}`;
  } else {
    return "gerade eben";
  }
}

export function JoinRequestsDropdown({
  workspaceId,
  onUserApproved,
}: JoinRequestsDropdownProps) {
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [processingRequests, setProcessingRequests] = useState<
    Record<string, boolean>
  >({});
  const [isOpen, setIsOpen] = useState(false);
  const [totalRequests, setTotalRequests] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(5); // Kleinere Seitengröße für bessere UX im Dropdown
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Funktion, die nur die Anzahl der Anfragen lädt, ohne die vollständigen Daten
  const fetchRequestCount = async () => {
    try {
      // Lade nur eine minimale Menge von Daten (Limit 1), um die Metadaten zu erhalten
      const response = await workspaceService.getJoinRequests(
        workspaceId,
        1,
        1,
      );
      setTotalRequests(response.meta.total);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error("Fehler beim Laden der Anfragenanzahl:", error);
      // Hier keine Toast-Meldung, um den Benutzer nicht beim Laden der Seite zu stören
    } finally {
      setIsInitialLoading(false);
    }
  };

  const fetchJoinRequests = async (
    page: number = 1,
    append: boolean = false,
  ) => {
    if (page === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await workspaceService.getJoinRequests(
        workspaceId,
        page,
        limit,
      );

      if (append) {
        setJoinRequests((prev) => [...prev, ...response.data]);
      } else {
        setJoinRequests(response.data);
      }

      setTotalRequests(response.meta.total);
      setCurrentPage(response.meta.page);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error("Fehler beim Laden der Beitrittsanfragen:", error);
      toast.error("Fehler beim Laden der Beitrittsanfragen", {
        description:
          error instanceof Error
            ? error.message
            : "Bitte versuche es später erneut",
      });
    } finally {
      if (page === 1) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  };

  const loadMoreRequests = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      fetchJoinRequests(currentPage + 1, true);
    }
  };

  // Lade die Anzahl der Anfragen beim Mounten der Komponente
  useEffect(() => {
    fetchRequestCount();
  }, [workspaceId]);

  // Lade die vollständigen Daten nur beim Öffnen des Dropdowns
  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    if (nextOpen) {
      // Bei jedem Öffnen des Dropdowns zurück zur ersten Seite
      setCurrentPage(1);
      fetchJoinRequests(1, false);
    }
  };

  const handleApprove = async (requestId: string) => {
    setProcessingRequests((prev) => ({ ...prev, [requestId]: true }));
    try {
      const result = await workspaceService.approveJoinRequest(
        workspaceId,
        requestId,
      );

      if (result.status === "APPROVED") {
        // Finde den Namen des Benutzers für die Erfolgsmeldung
        const request = joinRequests.find((req) => req.id === requestId);
        const userName = request
          ? `${request.user.firstName} ${request.user.lastName}`
          : "Der Benutzer";

        toast.success("Beitrittsanfrage angenommen", {
          description: `${userName} wurde zum Workspace hinzugefügt.`,
        });

        // Callback aufrufen, wenn ein Benutzer angenommen wurde
        if (request && onUserApproved) {
          onUserApproved({
            id: request.user.id,
            firstName: request.user.firstName,
            lastName: request.user.lastName,
            email: request.user.email,
            profilePicture: request.user.profilePicture,
            role: EWorkspaceRole.MEMBER, // Standardmäßig als Mitglied hinzufügen
          });
        }

        // Anfrage aus der Liste entfernen
        setJoinRequests((prev) => prev.filter((req) => req.id !== requestId));
        setTotalRequests((prev) => prev - 1);
      } else {
        toast.error("Fehler beim Annehmen der Anfrage", {
          description: "Status der Anfrage konnte nicht aktualisiert werden.",
        });
      }
    } catch (error) {
      console.error("Fehler beim Annehmen der Anfrage:", error);
      toast.error("Fehler beim Annehmen der Anfrage", {
        description:
          error instanceof Error
            ? error.message
            : "Bitte versuche es später erneut",
      });
    } finally {
      setProcessingRequests((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const handleReject = async (requestId: string) => {
    setProcessingRequests((prev) => ({ ...prev, [requestId]: true }));
    try {
      const result = await workspaceService.rejectJoinRequest(
        workspaceId,
        requestId,
      );

      if (result.status === "REJECTED") {
        // Finde den Namen des Benutzers für die Erfolgsmeldung
        const request = joinRequests.find((req) => req.id === requestId);
        const userName = request
          ? `${request.user.firstName} ${request.user.lastName}`
          : "Die Anfrage";

        toast.success("Beitrittsanfrage abgelehnt", {
          description: `Die Anfrage von ${userName} wurde abgelehnt.`,
        });

        // Anfrage aus der Liste entfernen
        setJoinRequests((prev) => prev.filter((req) => req.id !== requestId));
        setTotalRequests((prev) => prev - 1);
      } else {
        toast.error("Fehler beim Ablehnen der Anfrage", {
          description: "Status der Anfrage konnte nicht aktualisiert werden.",
        });
      }
    } catch (error) {
      console.error("Fehler beim Ablehnen der Anfrage:", error);
      toast.error("Fehler beim Ablehnen der Anfrage", {
        description:
          error instanceof Error
            ? error.message
            : "Bitte versuche es später erneut",
      });
    } finally {
      setProcessingRequests((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          tooltip="Beitrittsanfragen anzeigen"
          className="relative"
        >
          <UserPlus className="h-5 w-5" />
          {isInitialLoading ? (
            <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs text-accent-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
            </span>
          ) : (
            totalRequests > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
                {totalRequests}
              </span>
            )
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center p-2 font-medium">
          Beitrittsanfragen{" "}
          {totalRequests > 0 && (
            <span className="ml-1 text-xs text-muted-foreground">
              ({totalRequests})
            </span>
          )}
          {isInitialLoading && (
            <Loader2 className="ml-2 h-3 w-3 animate-spin" />
          )}
        </div>
        {isLoading ? (
          <div className="p-2">
            <div className="flex items-center space-x-2 py-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <div className="flex items-center space-x-2 py-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </div>
        ) : joinRequests.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Keine ausstehenden Beitrittsanfragen
          </div>
        ) : (
          <>
            <div className="max-h-[300px] overflow-auto">
              {joinRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between rounded-lg p-2 hover:bg-accent"
                >
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={request.user.profilePicture} />
                      <AvatarFallback>
                        {getInitials(
                          `${request.user.firstName} ${request.user.lastName}`,
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {request.user.firstName} {request.user.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {request.user.email} ·{" "}
                        {formatRelativeTime(request.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 text-green-500",
                        "hover:bg-green-50 hover:text-green-600",
                        "dark:hover:bg-green-950/20",
                      )}
                      onClick={() => handleApprove(request.id)}
                      disabled={!!processingRequests[request.id]}
                    >
                      {processingRequests[request.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8 text-red-500",
                        "hover:bg-red-50 hover:text-red-600",
                        "dark:hover:bg-red-950/20",
                      )}
                      onClick={() => handleReject(request.id)}
                      disabled={!!processingRequests[request.id]}
                    >
                      {processingRequests[request.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {currentPage < totalPages && (
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-xs"
                  onClick={loadMoreRequests}
                  disabled={isLoadingMore}
                >
                  Weitere Anfragen laden
                  {isLoadingMore ? (
                    <RefreshCcw className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCcw className="h-3 w-3" />
                  )}
                </Button>
              </div>
            )}

            {totalRequests > 0 && (
              <div className="p-2 pt-0 text-center text-xs text-muted-foreground">
                {joinRequests.length} von {totalRequests} Anfragen angezeigt
              </div>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
