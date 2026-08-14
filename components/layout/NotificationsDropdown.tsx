"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Bell, Loader2, RefreshCcw } from "lucide-react";
import {
  notificationService,
  Notification,
} from "@/app/services/notification.service";
import { useAuthStore } from "@/app/stores/auth.store";
import { NotificationItem } from "./NotificationItem";

export function NotificationsDropdown() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [processingNotifications, setProcessingNotifications] = useState<
    Record<string, boolean>
  >({});
  const [isOpen, setIsOpen] = useState(false);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(5); // Kleinere Seitengröße für bessere UX im Dropdown
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Funktion, die nur die Anzahl der Benachrichtigungen lädt, ohne die vollständigen Daten
  const fetchNotificationCount = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Lade nur eine minimale Menge von Daten (Limit 1), um die Metadaten zu erhalten
      const response = await notificationService.getUserNotifications(
        user.id,
        1,
        1,
      );
      setTotalNotifications(response.meta.total);
      setTotalPages(response.meta.totalPages);

      // Zähle ungelesene Benachrichtigungen
      const unreadCount =
        response.data.filter((n) => n.isNew).length > 0
          ? response.meta.total
          : 0;
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error("Fehler beim Laden der Benachrichtigungsanzahl:", error);
      // Hier keine Toast-Meldung, um den Benutzer nicht beim Laden der Seite zu stören
    } finally {
      setIsInitialLoading(false);
    }
  }, [user]);

  const fetchNotifications = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (!user?.id) return;

      if (page === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const response = await notificationService.getUserNotifications(
          user.id,
          page,
          limit,
        );

        if (append) {
          setNotifications((prev) => [...prev, ...response.data]);
        } else {
          setNotifications(response.data);
        }

        setTotalNotifications(response.meta.total);
        setCurrentPage(response.meta.page);
        setTotalPages(response.meta.totalPages);

        // Zähle ungelesene Benachrichtigungen
        const unreadCount = response.data.filter((n) => n.isNew).length;
        setUnreadCount(unreadCount);
      } catch (error) {
        console.error("Fehler beim Laden der Benachrichtigungen:", error);
        toast.error("Fehler beim Laden der Benachrichtigungen", {
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
    },
    [user, limit],
  );

  const loadMoreNotifications = useCallback(() => {
    if (currentPage < totalPages && !isLoadingMore) {
      fetchNotifications(currentPage + 1, true);
    }
  }, [currentPage, totalPages, isLoadingMore, fetchNotifications]);

  // Lade die Anzahl der Benachrichtigungen beim Mounten der Komponente
  // und richte ein Intervall für regelmäßige Aktualisierungen ein
  useEffect(() => {
    if (user?.id) {
      // Initiale Abfrage
      fetchNotificationCount();

      // Intervall für regelmäßige Aktualisierungen (einmal pro Minute)
      intervalRef.current = setInterval(() => {
        fetchNotificationCount();

        // Wenn das Dropdown geöffnet ist, auch die vollständigen Daten aktualisieren
        if (isOpen) {
          fetchNotifications(currentPage, false);
        }
      }, 60000); // 60000 ms = 1 Minute
    }

    // Cleanup-Funktion beim Unmounten der Komponente
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    user?.id,
    isOpen,
    currentPage,
    fetchNotificationCount,
    fetchNotifications,
  ]);

  // Lade die vollständigen Daten nur beim Öffnen des Dropdowns
  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    if (nextOpen && user?.id) {
      // Bei jedem Öffnen des Dropdowns zurück zur ersten Seite
      setCurrentPage(1);
      fetchNotifications(1, false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    setProcessingNotifications((prev) => ({ ...prev, [notificationId]: true }));
    try {
      const result =
        await notificationService.markNotificationAsRead(notificationId);

      if (result) {
        // Aktualisiere den Status in der lokalen Liste
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isNew: false }
              : notification,
          ),
        );

        // Reduziere den Zähler für ungelesene Benachrichtigungen
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error(
        "Fehler beim Markieren der Benachrichtigung als gelesen:",
        error,
      );
      toast.error("Fehler beim Markieren als gelesen", {
        description:
          error instanceof Error
            ? error.message
            : "Bitte versuche es später erneut",
      });
    } finally {
      setProcessingNotifications((prev) => ({
        ...prev,
        [notificationId]: false,
      }));
    }
  };

  const handleDelete = async (notificationId: string) => {
    setProcessingNotifications((prev) => ({ ...prev, [notificationId]: true }));
    try {
      await notificationService.deleteNotification(notificationId);

      // Benachrichtigung aus der Liste entfernen
      setNotifications((prev) =>
        prev.filter((notification) => notification.id !== notificationId),
      );
      setTotalNotifications((prev) => prev - 1);
    } catch (error) {
      console.error("Fehler beim Löschen der Benachrichtigung:", error);
      toast.error("Fehler beim Löschen der Benachrichtigung", {
        description:
          error instanceof Error
            ? error.message
            : "Bitte versuche es später erneut",
      });
    } finally {
      setProcessingNotifications((prev) => ({
        ...prev,
        [notificationId]: false,
      }));
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          tooltip="Benachrichtigungen anzeigen"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {isInitialLoading ? (
            <span className="absolute -right-[0px] -top-[1px] flex size-3 items-center justify-center rounded-full bg-accent text-xs text-accent-foreground">
              <Loader2 className="size-3 animate-spin" />
            </span>
          ) : (
            unreadCount > 0 && (
              <>
                <span className="absolute -right-[0px] -top-[1px] flex size-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex size-3 rounded-full bg-sky-500"></span>
                </span>
              </>
            )
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="flex items-center p-2 font-medium">
          Benachrichtigungen{" "}
          {totalNotifications > 0 && (
            <span className="ml-1 text-xs text-muted-foreground">
              ({totalNotifications})
            </span>
          )}
          {isInitialLoading && (
            <Loader2 className="ml-2 h-3 w-3 animate-spin" />
          )}
        </div>
        {isLoading ? (
          <div className="p-2">
            <div className="flex items-start space-x-2 py-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex justify-between">
                  <Skeleton className="h-2 w-16" />
                  <Skeleton className="h-2 w-24" />
                </div>
              </div>
            </div>
            <div className="flex items-start space-x-2 py-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex justify-between">
                  <Skeleton className="h-2 w-16" />
                  <Skeleton className="h-2 w-24" />
                </div>
              </div>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Keine Benachrichtigungen vorhanden
          </div>
        ) : (
          <>
            <div className="max-h-[400px] overflow-auto px-1">
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                    isProcessing={!!processingNotifications[notification.id]}
                  />
                ))}
              </div>
            </div>

            {currentPage < totalPages && (
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-xs"
                  onClick={loadMoreNotifications}
                  disabled={isLoadingMore}
                >
                  Weitere Benachrichtigungen laden
                  {isLoadingMore ? (
                    <RefreshCcw className="ml-2 h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCcw className="ml-2 h-3 w-3" />
                  )}
                </Button>
              </div>
            )}

            {totalNotifications > 0 && (
              <div className="p-2 pt-0 text-center text-xs text-muted-foreground">
                {notifications.length} von {totalNotifications}{" "}
                Benachrichtigungen angezeigt
              </div>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
