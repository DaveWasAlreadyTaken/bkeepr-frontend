import {
  Workspace,
  NewWorkspace,
} from "../(superadmin)/superadmin/workspaces/types";
import { ServerWorkspaceUser } from "../(user)/workspace/[id]/admin/types";
import { apiService } from "./api.service";
import { ApiException } from "./api-config";

/**
 * Service für die Verwaltung von Workspaces
 * Kapselt die API-Aufrufe und bietet domänenspezifische Fehlerbehandlung
 */
class WorkspaceService {
  private static instance: WorkspaceService;
  private readonly baseEndpoint = "/workspaces";

  private constructor() {}

  public static getInstance(): WorkspaceService {
    if (!WorkspaceService.instance) {
      WorkspaceService.instance = new WorkspaceService();
    }
    return WorkspaceService.instance;
  }

  /**
   * Holt alle Workspaces
   * @throws ApiException bei Netzwerk- oder Serverfehlern
   */
  public async getAllWorkspaces(): Promise<Workspace[]> {
    try {
      const response = await apiService.get<Workspace[]>(this.baseEndpoint);
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
            : "Fehler beim Laden der Workspaces",
        status: 500,
        code: "WORKSPACE_FETCH_ERROR",
      });
    }
  }

  /**
   * Erstellt einen neuen Workspace
   * @throws ApiException bei Validierungs-, Netzwerk- oder Serverfehlern
   */
  public async createWorkspace(workspace: NewWorkspace): Promise<Workspace> {
    try {
      const response = await apiService.post<Workspace>(
        this.baseEndpoint,
        workspace,
      );

      if (!response.data) {
        throw new ApiException({
          message: "Workspace konnte nicht erstellt werden",
          status: 500,
          code: "WORKSPACE_CREATE_ERROR",
        });
      }

      return response.data;
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
        // Bei 409 Conflict eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 409) {
          error.error.message = `Ein Workspace mit dem Namen ${workspace.name} existiert bereits`;
          error.error.code = "WORKSPACE_ALREADY_EXISTS";
        }
        throw error;
      }
      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error
            ? error.message
            : "Fehler beim Erstellen des Workspaces",
        status: 500,
        code: "WORKSPACE_CREATE_ERROR",
      });
    }
  }

  /**
   * Aktualisiert einen bestehenden Workspace
   * @throws ApiException bei Validierungs-, Netzwerk- oder Serverfehlern
   */
  public async updateWorkspace(
    id: string,
    workspace: Partial<NewWorkspace>,
  ): Promise<Workspace> {
    try {
      const response = await apiService.patch<Workspace>(
        `${this.baseEndpoint}/${id}`,
        workspace,
      );

      if (!response.data) {
        throw new ApiException({
          message: "Workspace konnte nicht aktualisiert werden",
          status: 500,
          code: "WORKSPACE_UPDATE_ERROR",
        });
      }

      return response.data;
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
        // Bei 404 Not Found eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 404) {
          error.error.message = `Workspace mit ID ${id} wurde nicht gefunden`;
          error.error.code = "WORKSPACE_NOT_FOUND";
        }
        // Bei 409 Conflict eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 409 && workspace.name) {
          error.error.message = `Ein anderer Workspace mit dem Namen ${workspace.name} existiert bereits`;
          error.error.code = "WORKSPACE_NAME_CONFLICT";
        }
        throw error;
      }
      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error
            ? error.message
            : `Fehler beim Aktualisieren des Workspaces mit ID ${id}`,
        status: 500,
        code: "WORKSPACE_UPDATE_ERROR",
      });
    }
  }

  /**
   * Löscht einen Workspace
   * @throws ApiException bei Netzwerk- oder Serverfehlern
   */
  public async deleteWorkspace(id: string): Promise<void> {
    try {
      await apiService.delete<void>(`${this.baseEndpoint}/${id}`);
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
        // Bei 404 Not Found eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 404) {
          error.error.message = `Workspace mit ID ${id} wurde nicht gefunden`;
          error.error.code = "WORKSPACE_NOT_FOUND";
        }
        throw error;
      }
      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error
            ? error.message
            : `Fehler beim Löschen des Workspaces mit ID ${id}`,
        status: 500,
        code: "WORKSPACE_DELETE_ERROR",
      });
    }
  }

  /**
   * Holt einen Workspace anhand seiner ID
   * @throws ApiException bei Netzwerk- oder Serverfehlern
   */
  public async getWorkspaceById(id: string): Promise<Workspace> {
    try {
      const response = await apiService.get<Workspace>(
        `${this.baseEndpoint}/${id}`,
      );

      if (!response.data) {
        throw new ApiException({
          message: `Workspace mit ID ${id} wurde nicht gefunden`,
          status: 404,
          code: "WORKSPACE_NOT_FOUND",
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
            : `Fehler beim Laden des Workspaces mit ID ${id}`,
        status: 500,
        code: "WORKSPACE_FETCH_ERROR",
      });
    }
  }

  /**
   * Holt alle Benutzer eines Workspaces
   * @throws ApiException bei Netzwerk- oder Serverfehlern
   */
  public async getWorkspaceUsers(
    workspaceId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: ServerWorkspaceUser[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await apiService.get<{
        data: ServerWorkspaceUser[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>(`${this.baseEndpoint}/${workspaceId}/members?${queryParams}`);
      console.log("response.data", response.data);
      return {
        data: response.data?.data || [],
        meta: response.data?.meta || { total: 0, page, limit, totalPages: 0 },
      };
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
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
            : `Fehler beim Laden der Benutzer für Workspace mit ID ${workspaceId}`,
        status: 500,
        code: "WORKSPACE_USERS_FETCH_ERROR",
      });
    }
  }

  /**
   * Entfernt einen Benutzer aus einem Workspace
   * @throws ApiException bei Netzwerk- oder Serverfehlern
   */
  public async deleteWorkspaceUser(
    workspaceId: string,
    userId: string,
  ): Promise<void> {
    try {
      await apiService.delete<void>(
        `${this.baseEndpoint}/${workspaceId}/members/${userId}`,
      );
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
        // Bei 404 Not Found eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 404) {
          error.error.message = `Benutzer mit ID ${userId} wurde im Workspace mit ID ${workspaceId} nicht gefunden`;
          error.error.code = "WORKSPACE_USER_NOT_FOUND";
        }
        throw error;
      }
      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error
            ? error.message
            : `Fehler beim Entfernen des Benutzers mit ID ${userId} aus dem Workspace mit ID ${workspaceId}`,
        status: 500,
        code: "WORKSPACE_USER_DELETE_ERROR",
      });
    }
  }

  /**
   * Aktualisiert einen Benutzer in einem Workspace
   * @throws ApiException bei Validierungs-, Netzwerk- oder Serverfehlern
   */
  public async updateWorkspaceUser(
    workspaceId: string,
    userId: string,
    userData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      workspaceRole?: string;
    },
  ): Promise<ServerWorkspaceUser> {
    try {
      const response = await apiService.patch<ServerWorkspaceUser>(
        `${this.baseEndpoint}/${workspaceId}/members/${userId}`,
        userData,
      );

      if (!response.data) {
        throw new ApiException({
          message: "Workspace-Benutzer konnte nicht aktualisiert werden",
          status: 500,
          code: "WORKSPACE_USER_UPDATE_ERROR",
        });
      }

      return response.data;
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
        // Bei 404 Not Found eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 404) {
          error.error.message = `Benutzer mit ID ${userId} wurde im Workspace mit ID ${workspaceId} nicht gefunden`;
          error.error.code = "WORKSPACE_USER_NOT_FOUND";
        }
        // Bei 409 Conflict eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 409 && userData.email) {
          error.error.message = `Ein anderer Benutzer mit der E-Mail ${userData.email} existiert bereits`;
          error.error.code = "USER_EMAIL_CONFLICT";
        }
        throw error;
      }
      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error
            ? error.message
            : `Fehler beim Aktualisieren des Benutzers mit ID ${userId} im Workspace mit ID ${workspaceId}`,
        status: 500,
        code: "WORKSPACE_USER_UPDATE_ERROR",
      });
    }
  }

  /**
   * Fügt einen Benutzer zu einem Workspace hinzu
   * @throws ApiException bei Validierungs-, Netzwerk- oder Serverfehlern
   */
  public async addWorkspaceUser(
    workspaceId: string,
    userId: string,
    data: {
      role: string;
    },
  ): Promise<ServerWorkspaceUser> {
    try {
      const response = await apiService.post<ServerWorkspaceUser>(
        `${this.baseEndpoint}/${workspaceId}/members/${userId}`,
        data,
      );
      if (!response.data) {
        throw new ApiException({
          message: "Benutzer konnte nicht zum Workspace hinzugefügt werden",
          status: 500,
          code: "WORKSPACE_USER_ADD_ERROR",
        });
      }

      return response.data;
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
        // Bei 404 Not Found eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 404) {
          error.error.message = `Workspace mit ID ${workspaceId} oder Benutzer mit ID ${userId} wurde nicht gefunden`;
          error.error.code = "WORKSPACE_OR_USER_NOT_FOUND";
        }
        // Bei 409 Conflict eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 409) {
          error.error.message = `Der Benutzer mit ID ${userId} ist bereits Mitglied des Workspaces mit ID ${workspaceId}`;
          error.error.code = "USER_ALREADY_IN_WORKSPACE";
        }
        throw error;
      }
      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error
            ? error.message
            : `Fehler beim Hinzufügen des Benutzers mit ID ${userId} zum Workspace mit ID ${workspaceId}`,
        status: 500,
        code: "WORKSPACE_USER_ADD_ERROR",
      });
    }
  }

  /**
   * Aktualisiert die Rollen eines Benutzers in einem Workspace
   * @throws ApiException bei Validierungs-, Netzwerk- oder Serverfehlern
   */
  public async updateWorkspaceUserRoles(
    workspaceId: string,
    userId: string,
    roles: string[],
  ): Promise<ServerWorkspaceUser> {
    try {
      const response = await apiService.post<ServerWorkspaceUser>(
        `${this.baseEndpoint}/${workspaceId}/members`,
        {
          userId,
          roles,
        },
      );

      if (!response.data) {
        throw new ApiException({
          message: "Benutzerrollen konnten nicht aktualisiert werden",
          status: 500,
          code: "WORKSPACE_USER_ROLES_UPDATE_ERROR",
        });
      }

      return response.data;
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
        // Bei 404 Not Found eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 404) {
          error.error.message = `Benutzer mit ID ${userId} wurde im Workspace mit ID ${workspaceId} nicht gefunden`;
          error.error.code = "WORKSPACE_USER_NOT_FOUND";
        }
        throw error;
      }
      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error
            ? error.message
            : `Fehler beim Aktualisieren der Rollen für Benutzer mit ID ${userId} im Workspace mit ID ${workspaceId}`,
        status: 500,
        code: "WORKSPACE_USER_ROLES_UPDATE_ERROR",
      });
    }
  }

  /**
   * Holt alle Workspaces (paginiert)
   * @throws ApiException bei Netzwerk- oder Serverfehlern
   */
  public async getAllWorkspacesPaginated(
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Workspace[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await apiService.get<{
        data: Workspace[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>(`${this.baseEndpoint}?${queryParams}`);

      return {
        data: response.data?.data || [],
        meta: response.data?.meta || { total: 0, page, limit, totalPages: 0 },
      };
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
            : "Fehler beim Laden der Workspaces",
        status: 500,
        code: "WORKSPACE_FETCH_ERROR",
      });
    }
  }

  /**
   * Holt den Status eines Workspaces
   * Prüft, ob der aktuelle Benutzer Mitglied ist und ob der Workspace privat ist
   * @throws ApiException bei Netzwerk- oder Serverfehlern
   */
  public async getWorkspaceStatus(workspaceId: string): Promise<{
    isPrivate: boolean;
    isMember: boolean;
    name: string;
    requestStatus: string | null; // 'ACCEPTED', 'REJECTED', 'PENDING' oder null
  }> {
    try {
      const response = await apiService.get<{
        isPrivate: boolean;
        isMember: boolean;
        name: string;
        requestStatus: string | null;
      }>(`${this.baseEndpoint}/${workspaceId}/status`);

      if (!response.data) {
        throw new ApiException({
          message: `Status für Workspace mit ID ${workspaceId} konnte nicht abgerufen werden`,
          status: 404,
          code: "WORKSPACE_STATUS_NOT_FOUND",
        });
      }

      return response.data;
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
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
            : `Fehler beim Laden des Status für Workspace mit ID ${workspaceId}`,
        status: 500,
        code: "WORKSPACE_STATUS_FETCH_ERROR",
      });
    }
  }

  /**
   * Tritt einem Workspace bei oder stellt eine Beitrittsanfrage
   * Bei öffentlichen Workspaces (isPrivate = false): Direkter Beitritt als MEMBER
   * Bei privaten Workspaces (isPrivate = true): Erstellt eine Beitrittsanfrage
   *
   * @param workspaceId ID des Workspace
   * @returns Bei öffentlichen Workspaces: { userId: string, workspaceId: string, roles: ['MEMBER'] }
   *          Bei privaten Workspaces: { workspaceId: string, userId: string, status: 'PENDING' }
   * @throws ApiException bei Netzwerk- oder Serverfehlern
   */
  public async joinWorkspace(
    workspaceId: string,
  ): Promise<
    | { userId: string; workspaceId: string; roles: string[] }
    | { workspaceId: string; userId: string; status: string }
  > {
    try {
      const response = await apiService.post<
        | { userId: string; workspaceId: string; roles: string[] }
        | { workspaceId: string; userId: string; status: string }
      >(`${this.baseEndpoint}/${workspaceId}/join`);

      if (!response.data) {
        throw new ApiException({
          message: `Beitritt zum Workspace mit ID ${workspaceId} fehlgeschlagen`,
          status: 500,
          code: "WORKSPACE_JOIN_ERROR",
        });
      }

      return response.data;
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
        // Bei 404 Not Found eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 404) {
          error.error.message = `Workspace mit ID ${workspaceId} wurde nicht gefunden`;
          error.error.code = "WORKSPACE_NOT_FOUND";
        }
        // Bei 409 Conflict eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 409) {
          error.error.message = `Du bist bereits Mitglied dieses Workspaces oder hast bereits eine Beitrittsanfrage gestellt`;
          error.error.code = "WORKSPACE_JOIN_CONFLICT";
        }
        throw error;
      }
      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error
            ? error.message
            : `Fehler beim Beitritt zum Workspace mit ID ${workspaceId}`,
        status: 500,
        code: "WORKSPACE_JOIN_ERROR",
      });
    }
  }

  /**
   * Zieht eine Beitrittsanfrage für einen Workspace zurück
   *
   * @param workspaceId ID des Workspace
   * @throws ApiException bei Netzwerk- oder Serverfehlern
   */
  public async withdrawJoinRequest(workspaceId: string): Promise<void> {
    try {
      await apiService.delete(
        `${this.baseEndpoint}/${workspaceId}/join-request`,
      );
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
        // Bei 404 Not Found eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 404) {
          error.error.message = `Keine ausstehende Beitrittsanfrage gefunden`;
          error.error.code = "JOIN_REQUEST_NOT_FOUND";
        }
        throw error;
      }
      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error
            ? error.message
            : `Fehler beim Zurückziehen der Beitrittsanfrage für Workspace mit ID ${workspaceId}`,
        status: 500,
        code: "WITHDRAW_REQUEST_ERROR",
      });
    }
  }

  /**
   * Ruft Beitrittsanfragen für einen Workspace ab
   *
   * @param workspaceId ID des Workspace
   * @param page Seitenzahl (Standard: 1)
   * @param limit Anzahl der Ergebnisse pro Seite (Standard: 10)
   * @returns Liste der Beitrittsanfragen mit Paginierungsinformationen
   * @throws ApiException bei fehlenden Berechtigungen oder Netzwerkfehlern
   */
  public async getJoinRequests(
    workspaceId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: Array<{
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
    }>;
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await apiService.get<{
        data: Array<{
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
        }>;
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>(`${this.baseEndpoint}/${workspaceId}/join-requests?${queryParams}`);

      if (!response.data) {
        throw new ApiException({
          message: `Fehler beim Abrufen der Beitrittsanfragen für Workspace mit ID ${workspaceId}`,
          status: 500,
          code: "JOIN_REQUESTS_FETCH_ERROR",
        });
      }

      return response.data;
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
        // Bei 403 Forbidden eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 403) {
          error.error.message = `Du hast keine Berechtigung, Beitrittsanfragen für diesen Workspace einzusehen`;
          error.error.code = "JOIN_REQUESTS_PERMISSION_DENIED";
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
            : `Fehler beim Abrufen der Beitrittsanfragen für Workspace mit ID ${workspaceId}`,
        status: 500,
        code: "JOIN_REQUESTS_FETCH_ERROR",
      });
    }
  }

  /**
   * Genehmigt eine Beitrittsanfrage und fügt den Benutzer zum Workspace hinzu
   *
   * @param workspaceId ID des Workspace
   * @param requestId ID der Beitrittsanfrage
   * @returns Die aktualisierte Beitrittsanfrage mit Status "APPROVED"
   * @throws ApiException bei fehlenden Berechtigungen oder Netzwerkfehlern
   */
  public async approveJoinRequest(
    workspaceId: string,
    requestId: string,
  ): Promise<{
    id: string;
    status: string;
  }> {
    try {
      const response = await apiService.patch<{
        id: string;
        status: string;
      }>(`${this.baseEndpoint}/${workspaceId}/join-requests/${requestId}`, {
        approved: true,
      });

      if (!response.data) {
        throw new ApiException({
          message: `Fehler beim Genehmigen der Beitrittsanfrage`,
          status: 500,
          code: "JOIN_REQUEST_APPROVE_ERROR",
        });
      }

      return response.data;
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
        // Bei 403 Forbidden eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 403) {
          error.error.message = `Du hast keine Berechtigung, Beitrittsanfragen für diesen Workspace zu genehmigen`;
          error.error.code = "JOIN_REQUEST_APPROVE_PERMISSION_DENIED";
        }
        // Bei 404 Not Found eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 404) {
          error.error.message = `Beitrittsanfrage nicht gefunden`;
          error.error.code = "JOIN_REQUEST_NOT_FOUND";
        }
        throw error;
      }
      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error
            ? error.message
            : `Fehler beim Genehmigen der Beitrittsanfrage`,
        status: 500,
        code: "JOIN_REQUEST_APPROVE_ERROR",
      });
    }
  }

  /**
   * Lehnt eine Beitrittsanfrage ab
   *
   * @param workspaceId ID des Workspace
   * @param requestId ID der Beitrittsanfrage
   * @returns Die aktualisierte Beitrittsanfrage mit Status "REJECTED"
   * @throws ApiException bei fehlenden Berechtigungen oder Netzwerkfehlern
   */
  public async rejectJoinRequest(
    workspaceId: string,
    requestId: string,
  ): Promise<{
    id: string;
    status: string;
  }> {
    try {
      const response = await apiService.patch<{
        id: string;
        status: string;
      }>(`${this.baseEndpoint}/${workspaceId}/join-requests/${requestId}`, {
        approved: false,
      });

      if (!response.data) {
        throw new ApiException({
          message: `Fehler beim Ablehnen der Beitrittsanfrage`,
          status: 500,
          code: "JOIN_REQUEST_REJECT_ERROR",
        });
      }

      return response.data;
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
        // Bei 403 Forbidden eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 403) {
          error.error.message = `Du hast keine Berechtigung, Beitrittsanfragen für diesen Workspace abzulehnen`;
          error.error.code = "JOIN_REQUEST_REJECT_PERMISSION_DENIED";
        }
        // Bei 404 Not Found eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 404) {
          error.error.message = `Beitrittsanfrage nicht gefunden`;
          error.error.code = "JOIN_REQUEST_NOT_FOUND";
        }
        throw error;
      }
      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error
            ? error.message
            : `Fehler beim Ablehnen der Beitrittsanfrage`,
        status: 500,
        code: "JOIN_REQUEST_REJECT_ERROR",
      });
    }
  }
}

export const workspaceService = WorkspaceService.getInstance();
