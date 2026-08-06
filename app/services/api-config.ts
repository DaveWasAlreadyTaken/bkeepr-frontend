export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
  },
} as const;

import { toast } from "sonner";
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// Debounce-Mechanismus für Fehlermeldungen
const errorDebounce = new Map<string, number>();
const DEBOUNCE_TIME = 1000; // 1 Sekunde

// Hilfsfunktion, um zu prüfen, ob eine Fehlermeldung kürzlich angezeigt wurde
const shouldShowError = (errorKey: string): boolean => {
  const now = Date.now();
  const lastShown = errorDebounce.get(errorKey);

  if (lastShown && now - lastShown < DEBOUNCE_TIME) {
    return false;
  }

  errorDebounce.set(errorKey, now);
  return true;
};

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

/**
 * Behandelt 401 Unauthorized Fehler durch Weiterleitung zur Login-Seite
 */
const handleUnauthorized = () => {
  // Überprüfen, ob wir im Browser sind
  if (typeof window !== "undefined") {
    // Aktuelle URL für Redirect-Back speichern
    const currentPath = window.location.pathname;
    const searchParams = new URLSearchParams();
    searchParams.set("returnTo", currentPath);

    // Zur Login-Seite weiterleiten
    if (!window.location.pathname.startsWith("/auth/login")) {
      window.location.href = `/auth/login?${searchParams.toString()}`;
    }
  }
};

/**
 * Behandelt 403 Forbidden Fehler durch Anzeige einer Toast-Meldung
 */
const handleForbidden = () => {
  if (typeof window !== "undefined") {
    // Prüfen, ob die Fehlermeldung kürzlich angezeigt wurde
    if (shouldShowError("forbidden")) {
      // Toast-Fehlermeldung anzeigen
      toast.error("Keine Berechtigung", {
        description:
          "Sie haben keine Berechtigung, diese Aktion durchzuführen.",
      });
    }
  }
};

/**
 * Behandelt 404 Not Found Fehler
 */
const handleNotFound = (message: string) => {
  if (typeof window !== "undefined") {
    if (shouldShowError("notFound")) {
      toast.error("Nicht gefunden", {
        description:
          message || "Die angeforderte Ressource wurde nicht gefunden.",
      });
    }
  }
};

/**
 * Behandelt 422 Validation Error Fehler
 */
const handleValidationError = (message: string) => {
  if (typeof window !== "undefined") {
    if (shouldShowError("validationError")) {
      toast.error("Validierungsfehler", {
        description: message || "Bitte überprüfen Sie Ihre Eingaben.",
      });
    }
  }
};

/**
 * Behandelt 429 Too Many Requests Fehler
 */
const handleTooManyRequests = () => {
  if (typeof window !== "undefined") {
    if (shouldShowError("tooManyRequests")) {
      toast.error("Zu viele Anfragen", {
        description: "Bitte versuchen Sie es später erneut.",
      });
    }
  }
};

/**
 * Behandelt 500 Internal Server Error und andere Serverfehler
 */
const handleServerError = (message: string) => {
  if (typeof window !== "undefined") {
    if (shouldShowError("serverError")) {
      toast.error("Serverfehler", {
        description:
          message || "Ein unerwarteter Serverfehler ist aufgetreten.",
      });
    }
  }
};

/**
 * Behandelt generische Fehler
 */
const handleGenericError = (error: ApiError) => {
  if (typeof window !== "undefined") {
    if (shouldShowError(`genericError-${error.status}`)) {
      toast.error("Fehler", {
        description:
          error.message || "Ein unerwarteter Fehler ist aufgetreten.",
      });
    }
  }
};

/**
 * ApiException-Klasse für einheitliche Fehlerbehandlung
 * Behandelt automatisch verschiedene HTTP-Statuscodes und zeigt entsprechende Fehlermeldungen an
 */
export class ApiException extends Error {
  constructor(public error: ApiError) {
    super(error.message);
    this.name = "ApiException";

    if (typeof window !== "undefined") {
      // Automatische Fehlerbehandlung basierend auf HTTP-Statuscode
      switch (error.status) {
        case 401:
          handleUnauthorized();
          break;
        case 403:
          handleForbidden();
          break;
        case 404:
          handleNotFound(error.message);
          break;
        case 422:
          handleValidationError(error.message);
          break;
        case 429:
          handleTooManyRequests();
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          handleServerError(error.message);
          break;
        default:
          // Generische Fehlerbehandlung für andere Statuscodes
          if (error.status >= 400) {
            handleGenericError(error);
          }
          break;
      }
    }
  }
}
