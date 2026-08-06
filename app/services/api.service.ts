import {
  API_CONFIG,
  ApiException,
  ApiResponse,
  HttpMethod,
} from "./api-config";

class ApiService {
  private static instance: ApiService;
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  private constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.defaultHeaders = API_CONFIG.DEFAULT_HEADERS;
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Hilfsmethode, um den Auth-Token zu holen
  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }

  // Hilfsmethode, um die Headers mit dem Auth-Token zu erweitern
  private getAuthHeaders(customHeaders?: HeadersInit): HeadersInit {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    const token = this.getAuthToken();

    if (token) {
      return {
        ...headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return headers;
  }

  /**
   * Zentrale Methode für alle HTTP-Anfragen
   * Behandelt Fehler einheitlich und gibt eine typisierte Antwort zurück
   */
  private async request<T>(
    endpoint: string,
    method: HttpMethod,
    data?: unknown,
    customHeaders?: HeadersInit,
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers = this.getAuthHeaders(customHeaders);

      const config: RequestInit = {
        method,
        headers,
        credentials: "include", // Für Cookie-basierte Auth
      };

      if (data && method !== "GET") {
        config.body = JSON.stringify(data);
      }

      // Fetch-Anfrage ausführen
      let response: Response;

      try {
        response = await fetch(url, config);
      } catch {
        // Netzwerkfehler abfangen und in ApiException umwandeln
        throw new ApiException({
          message:
            "Netzwerkfehler: Bitte überprüfen Sie Ihre Internetverbindung",
          status: 0,
          code: "NETWORK_ERROR",
        });
      }

      // Versuche, die Antwort als JSON zu parsen
      let responseData = null;
      const contentType = response.headers.get("content-type");

      if (
        contentType &&
        contentType.includes("application/json") &&
        response.status !== 204
      ) {
        try {
          responseData = await response.json();
        } catch {
          // Bei Parsing-Fehler und nicht-erfolgreicher Antwort einen Fehler werfen
          if (!response.ok) {
            throw new ApiException({
              message: `Fehler beim Parsen der Serverantwort: ${response.statusText}`,
              status: response.status,
              code: "PARSE_ERROR",
            });
          }
          // Bei erfolgreicher Antwort ohne gültiges JSON bleibt responseData null
        }
      }

      // HTTP-Fehler behandeln
      if (!response.ok) {
        throw new ApiException({
          message:
            responseData?.message ||
            responseData?.error ||
            `HTTP-Fehler: ${response.statusText}`,
          status: response.status,
          code: responseData?.code,
        });
      }

      // Erfolgreiche Antwort
      return {
        data: responseData,
        status: response.status,
      };
    } catch (error) {
      // ApiException direkt durchreichen
      if (error instanceof ApiException) {
        throw error;
      }

      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error
            ? error.message
            : "Ein unerwarteter Fehler ist aufgetreten",
        status: 500,
        code: "UNKNOWN_ERROR",
      });
    }
  }

  // GET-Methode
  public async get<T>(
    endpoint: string,
    headers?: HeadersInit,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, "GET", undefined, headers);
  }

  // POST-Methode
  public async post<T>(
    endpoint: string,
    data?: unknown,
    headers?: HeadersInit,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, "POST", data, headers);
  }

  // PUT-Methode
  public async put<T>(
    endpoint: string,
    data?: unknown,
    headers?: HeadersInit,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, "PUT", data, headers);
  }

  // PATCH-Methode
  public async patch<T>(
    endpoint: string,
    data?: unknown,
    headers?: HeadersInit,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, "PATCH", data, headers);
  }

  // DELETE-Methode
  public async delete<T>(
    endpoint: string,
    headers?: HeadersInit,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, "DELETE", undefined, headers);
  }
}

export const apiService = ApiService.getInstance();
