import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Check,
  Info,
  AlertCircle,
  Bell,
  X,
  CircleCheck,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Notification } from "@/app/services/notification.service";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isProcessing: boolean;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  isProcessing,
}: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Wähle ein Icon basierend auf dem Typ der Benachrichtigung
  const getNotificationIcon = () => {
    switch (notification.type?.toUpperCase()) {
      case "INFO":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "SUCCESS":
        return <CircleCheck className="h-4 w-4 text-green-500" />;
      case "WARNING":
        return <TriangleAlert className="h-4 w-4 text-amber-500" />;
      case "ERROR":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-primary" />;
    }
  };

  // Formatiert ein Datum als relativen Zeitabstand (z.B. "vor 2 Tagen")
  const formatRelativeTime = (dateString: string): string => {
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
  };

  return (
    <div
      className={cn(
        "group relative flex gap-3 rounded-lg p-3 transition-colors",
        notification.isNew
          ? "bg-blue-50 dark:bg-blue-950/20"
          : "hover:bg-accent/50",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon für Benachrichtigungstyp */}
      <div className="mt-0.5 flex-shrink-0">{getNotificationIcon()}</div>

      {/* Löschen-Button (nur bei Hover anzeigen) */}
      {(isHovered || isProcessing) && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1 h-6 w-6 text-muted-foreground opacity-70 hover:opacity-100"
          onClick={() => onDelete(notification.id)}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <X className="h-3 w-3" />
          )}
        </Button>
      )}

      {/* Benachrichtigungsinhalt */}
      <div className="flex flex-1 flex-col space-y-1">
        <div className="font-medium leading-tight">{notification.title}</div>
        <div className="text-sm text-foreground/90">{notification.text}</div>

        {/* Zusätzliche Daten, falls vorhanden */}
        {notification.data && Object.keys(notification.data).length > 0 && (
          <div className="mt-1 rounded bg-muted/50 p-1.5 text-xs">
            <pre className="overflow-x-auto whitespace-pre-wrap text-xs text-muted-foreground">
              {JSON.stringify(notification.data, null, 2)}
            </pre>
          </div>
        )}

        {/* Footer mit Zeitstempel und "Als gelesen markieren"-Button */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(notification.createdAt)}
          </span>

          {notification.isNew && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs font-normal text-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/20"
              onClick={() => onMarkAsRead(notification.id)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Check className="h-3 w-3" />
              )}
              Als gelesen markieren
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
