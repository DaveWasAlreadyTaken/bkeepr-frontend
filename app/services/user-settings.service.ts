import { apiService } from "./api.service";
import { ApiException } from "./api-config";

/**
 * Typdefinition für Benutzereinstellungen
 */
export interface UserSettings {
  emailNotificationsEnabled: boolean;
}

/**
 * Service für die Verwaltung von Benutzereinstellungen
 * Kapselt die API-Aufrufe und bietet domänenspezifische Fehlerbehandlung
 */
class UserSettingsService {
  private static instance: UserSettingsService;
  private readonly baseEndpoint = "/user-settings";

  private constructor() {}

  public static getInstance(): UserSettingsService {
    if (!UserSettingsService.instance) {
      UserSettingsService.instance = new UserSettingsService();
    }
    return UserSettingsService.instance;
  }

  /**
   * Holt die Einstellungen des aktuellen Benutzers
   * @throws ApiException bei Netzwerk- oder Serverfehlern
   */
  public async getUserSettings(): Promise<UserSettings> {
    try {
      const response = await apiService.get<UserSettings>(this.baseEndpoint);
      if (!response.data) {
        throw new ApiException({
          message: "Benutzereinstellungen konnten nicht geladen werden",
          status: 500,
          code: "USER_SETTINGS_FETCH_ERROR",
        });
      }
      return response.data;
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
            : "Fehler beim Laden der Benutzereinstellungen",
        status: 500,
        code: "USER_SETTINGS_FETCH_ERROR",
      });
    }
  }

  /**
   * Aktualisiert die Einstellungen des aktuellen Benutzers
   * @throws ApiException bei Validierungs-, Netzwerk- oder Serverfehlern
   */
  public async updateUserSettings(
    settings: UserSettings,
  ): Promise<UserSettings> {
    try {
      const response = await apiService.patch<UserSettings>(
        this.baseEndpoint,
        settings,
      );
      if (!response.data) {
        throw new ApiException({
          message: "Benutzereinstellungen konnten nicht aktualisiert werden",
          status: 500,
          code: "USER_SETTINGS_UPDATE_ERROR",
        });
      }
      return response.data;
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
            : "Fehler beim Aktualisieren der Benutzereinstellungen",
        status: 500,
        code: "USER_SETTINGS_UPDATE_ERROR",
      });
    }
  }
}

export const userSettingsService = UserSettingsService.getInstance();
