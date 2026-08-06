import {
  User,
  NewUser,
  UpdateUser,
  PaginatedResponse,
} from "../(superadmin)/superadmin/users/types";
import { apiService } from "./api.service";
import { ApiException } from "./api-config";

/**
 * Service für die Verwaltung von Benutzern
 * Kapselt die API-Aufrufe und bietet domänenspezifische Fehlerbehandlung
 */
class UserService {
  private static instance: UserService;
  private readonly baseEndpoint = "/users";

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Holt alle Benutzer mit ihren globalen Rollen
   * @param page Die Seitennummer (Standard: 1)
   * @param limit Anzahl der Einträge pro Seite (Standard: 10)
   * @throws ApiException bei Netzwerk- oder Serverfehlern
   */
  public async getAllUsers(
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<User>> {
    try {
      const response = await apiService.get<PaginatedResponse<User>>(
        `${this.baseEndpoint}?page=${page}&limit=${limit}`,
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
            : "Fehler beim Laden der Benutzer",
        status: 500,
        code: "USER_FETCH_ERROR",
      });
    }
  }

  /**
   * Holt einen Benutzer anhand seiner ID
   * @throws ApiException bei Netzwerk- oder Serverfehlern
   */
  public async getUserById(id: string): Promise<User> {
    try {
      const response = await apiService.get<User>(`${this.baseEndpoint}/${id}`);
      if (!response.data) {
        throw new ApiException({
          message: `Benutzer mit ID ${id} wurde nicht gefunden`,
          status: 404,
          code: "USER_NOT_FOUND",
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
            : `Fehler beim Laden des Benutzers mit ID ${id}`,
        status: 500,
        code: "USER_FETCH_ERROR",
      });
    }
  }

  /**
   * Erstellt einen neuen Benutzer
   * @throws ApiException bei Validierungs-, Netzwerk- oder Serverfehlern
   */
  public async createUser(user: NewUser): Promise<User> {
    try {
      const response = await apiService.post<User>(this.baseEndpoint, user);
      if (!response.data) {
        throw new ApiException({
          message: "Benutzer konnte nicht erstellt werden",
          status: 500,
          code: "USER_CREATE_ERROR",
        });
      }
      return response.data;
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
        // Bei 409 Conflict eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 409) {
          error.error.message = `Ein Benutzer mit der E-Mail ${user.email} existiert bereits`;
          error.error.code = "USER_ALREADY_EXISTS";
        }
        throw error;
      }
      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error
            ? error.message
            : "Fehler beim Erstellen des Benutzers",
        status: 500,
        code: "USER_CREATE_ERROR",
      });
    }
  }

  /**
   * Aktualisiert einen bestehenden Benutzer
   * @throws ApiException bei Validierungs-, Netzwerk- oder Serverfehlern
   */
  public async updateUser(id: string, user: UpdateUser): Promise<User> {
    try {
      const response = await apiService.patch<User>(
        `${this.baseEndpoint}/${id}`,
        user,
      );
      if (!response.data) {
        throw new ApiException({
          message: "Benutzer konnte nicht aktualisiert werden",
          status: 500,
          code: "USER_UPDATE_ERROR",
        });
      }
      return response.data;
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
        // Bei 404 Not Found eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 404) {
          error.error.message = `Benutzer mit ID ${id} wurde nicht gefunden`;
          error.error.code = "USER_NOT_FOUND";
        }
        // Bei 409 Conflict eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 409) {
          error.error.message = `Ein anderer Benutzer mit der E-Mail ${user.email} existiert bereits`;
          error.error.code = "USER_EMAIL_CONFLICT";
        }
        throw error;
      }
      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error
            ? error.message
            : `Fehler beim Aktualisieren des Benutzers mit ID ${id}`,
        status: 500,
        code: "USER_UPDATE_ERROR",
      });
    }
  }

  /**
   * Löscht einen Benutzer
   * @throws ApiException bei Netzwerk- oder Serverfehlern
   */
  public async deleteUser(id: string): Promise<void> {
    try {
      await apiService.delete<void>(`${this.baseEndpoint}/${id}`);
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
        // Bei 404 Not Found eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 404) {
          error.error.message = `Benutzer mit ID ${id} wurde nicht gefunden`;
          error.error.code = "USER_NOT_FOUND";
        }
        throw error;
      }
      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error
            ? error.message
            : `Fehler beim Löschen des Benutzers mit ID ${id}`,
        status: 500,
        code: "USER_DELETE_ERROR",
      });
    }
  }

  /**
   * Sucht nach Benutzern anhand eines Suchbegriffs
   * @throws ApiException bei Netzwerk- oder Serverfehlern
   */
  public async searchUsers(
    query: string,
    workspaceId: string,
  ): Promise<User[]> {
    try {
      const response = await apiService.get<User[]>(
        `${this.baseEndpoint}/search?query=${encodeURIComponent(query)}&workspaceId=${workspaceId}`,
      );
      return response.data || [];
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
            : "Fehler bei der Benutzersuche",
        status: 500,
        code: "USER_SEARCH_ERROR",
      });
    }
  }

  /**
   * Erstellt einen neuen Benutzer und ordnet ihn direkt einem Workspace zu
   * @throws ApiException bei Validierungs-, Netzwerk- oder Serverfehlern
   */
  public async createWorkspaceUser(
    user: NewUser,
    workspaceId: string,
    workspaceRole: string,
  ): Promise<User> {
    try {
      const response = await apiService.post<User>(
        `${this.baseEndpoint}/workspace/${workspaceId}`,
        {
          ...user,
          workspaceRole,
        },
      );
      if (!response.data) {
        throw new ApiException({
          message: "Workspace-Benutzer konnte nicht erstellt werden",
          status: 500,
          code: "WORKSPACE_USER_CREATE_ERROR",
        });
      }
      return response.data;
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
        // Bei 409 Conflict eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 409) {
          error.error.message = `Ein Benutzer mit der E-Mail ${user.email} existiert bereits`;
          error.error.code = "USER_ALREADY_EXISTS";
        }
        // Bei 404 Not Found eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 404) {
          error.error.message = `Workspace mit ID ${workspaceId} wurde nicht gefunden`;
          error.error.code = "WORKSPACE_NOT_FOUND";
        }
        throw error;
      }
      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error
            ? error.message
            : "Fehler beim Erstellen des Workspace-Benutzers",
        status: 500,
        code: "WORKSPACE_USER_CREATE_ERROR",
      });
    }
  }
}

export const userService = UserService.getInstance();
