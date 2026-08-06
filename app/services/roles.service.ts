import { Role } from "../(superadmin)/superadmin/users/types";
import { apiService } from "./api.service";
import { ApiException } from "./api-config";

/**
 * Service für die Verwaltung von globalen Rollen
 * Kapselt die API-Aufrufe und bietet domänenspezifische Fehlerbehandlung
 */
class RolesService {
  private static instance: RolesService;
  private readonly baseEndpoint = "/roles";

  private constructor() {}

  public static getInstance(): RolesService {
    if (!RolesService.instance) {
      RolesService.instance = new RolesService();
    }
    return RolesService.instance;
  }

  /**
   * Holt alle verfügbaren globalen Rollen
   * @throws ApiException bei Netzwerk- oder Serverfehlern
   */
  public async getGlobalRoles(): Promise<Role[]> {
    try {
      const response = await apiService.get<Role[]>(this.baseEndpoint);
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
            : "Fehler beim Laden der globalen Rollen",
        status: 500,
        code: "ROLES_FETCH_ERROR",
      });
    }
  }
}

export const rolesService = RolesService.getInstance();
