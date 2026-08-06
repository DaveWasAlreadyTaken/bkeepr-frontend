import { apiService } from "./api.service";
import { ApiException } from "./api-config";

/**
 * Notification-Typen
 */
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  text: string;
  isNew: boolean;
  createdAt: string;
  updatedAt: string;
  data?: Record<string, unknown>;
}

export interface PaginatedNotificationResponse {
  data: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Service für die Verwaltung von Benutzerbenachrichtigungen
 * Kapselt die API-Aufrufe und bietet domänenspezifische Fehlerbehandlung
 */
class NotificationService {
  private static instance: NotificationService;
  private readonly baseEndpoint = "/notification";

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Holt alle Benachrichtigungen für einen bestimmten Benutzer
   * @param userId Die ID des Benutzers
   * @param page Die Seitennummer (Standard: 1)
   * @param limit Anzahl der Einträge pro Seite (Standard: 10)
   * @throws ApiException bei Netzwerk- oder Serverfehlern
   */
  public async getUserNotifications(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedNotificationResponse> {
    try {
      const response = await apiService.get<PaginatedNotificationResponse>(
        `${this.baseEndpoint}/user/${userId}?page=${page}&limit=${limit}`,
      );
      return (
        response.data || {
          data: [],
          meta: { total: 0, page, limit, totalPages: 0 },
        }
      );
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
        throw error;
      }
      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error
            ? error.message
            : "Fehler beim Laden der Benachrichtigungen",
        status: 500,
        code: "NOTIFICATION_FETCH_ERROR",
      });
    }
  }

  /**
   * Markiert eine Benachrichtigung als gelesen
   * @param id Die ID der Benachrichtigung
   * @throws ApiException bei Netzwerk- oder Serverfehlern
   */
  public async markNotificationAsRead(id: string): Promise<Notification> {
    try {
      const response = await apiService.patch<Notification>(
        `${this.baseEndpoint}/read/${id}`,
      );

      if (!response.data) {
        throw new ApiException({
          message: "Benachrichtigung konnte nicht als gelesen markiert werden",
          status: 500,
          code: "NOTIFICATION_UPDATE_ERROR",
        });
      }

      return response.data;
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
        // Bei 404 Not Found eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 404) {
          error.error.message = `Benachrichtigung mit ID ${id} wurde nicht gefunden`;
          error.error.code = "NOTIFICATION_NOT_FOUND";
        }
        throw error;
      }
      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error
            ? error.message
            : `Fehler beim Markieren der Benachrichtigung mit ID ${id} als gelesen`,
        status: 500,
        code: "NOTIFICATION_UPDATE_ERROR",
      });
    }
  }

  /**
   * Löscht eine Benachrichtigung
   * @param id Die ID der zu löschenden Benachrichtigung
   * @throws ApiException bei Netzwerk- oder Serverfehlern
   */
  public async deleteNotification(id: string): Promise<void> {
    try {
      await apiService.delete<void>(`${this.baseEndpoint}/${id}`);
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
        // Bei 404 Not Found eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 404) {
          error.error.message = `Benachrichtigung mit ID ${id} wurde nicht gefunden`;
          error.error.code = "NOTIFICATION_NOT_FOUND";
        }
        throw error;
      }
      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error
            ? error.message
            : `Fehler beim Löschen der Benachrichtigung mit ID ${id}`,
        status: 500,
        code: "NOTIFICATION_DELETE_ERROR",
      });
    }
  }
}

export const notificationService = NotificationService.getInstance();
