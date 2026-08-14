import { apiService } from "./api.service";
import { ApiException } from "./api-config";
import { toast } from "sonner";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  access_token: string;
  profilePicture?: string;
  workspaces: Array<{
    id: string;
    name: string;
    role: string;
  }>;
}

export interface RegisterResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  access_token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface AcceptInvitationRequest {
  token: string;
  password: string;
}

export interface UserResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    profilePicture?: string;
    workspaces: Array<{
      id: string;
      name: string;
      role: string;
    }>;
  };
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
}

/**
 * Service für die Authentifizierung von Benutzern
 * Kapselt die API-Aufrufe und bietet domänenspezifische Fehlerbehandlung
 */
class AuthService {
  private static instance: AuthService;
  private readonly baseEndpoint = "/auth";

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Führt den Login-Prozess durch
   * @throws ApiException bei ungültigen Anmeldedaten oder Serverfehlern
   */
  public async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiService.post<LoginResponse>(
        `${this.baseEndpoint}/login`,
        credentials,
      );
      console.log("response", response);
      if (!response.data) {
        throw new ApiException({
          message: "Anmeldung fehlgeschlagen: Keine Daten vom Server erhalten",
          status: 500,
          code: "LOGIN_FAILED",
        });
      }

      // Speichere Token im localStorage (oder in einem sichereren Speicher)
      if (response.data.access_token) {
        localStorage.setItem("auth_token", response.data.access_token);
      } else {
        throw new ApiException({
          message: "Anmeldung fehlgeschlagen: Kein Token erhalten",
          status: 500,
          code: "NO_TOKEN_RECEIVED",
        });
      }

      return response.data;
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
        // Bei 401 eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 401) {
          error.error.message = "Ungültige E-Mail oder Passwort";
          error.error.code = "INVALID_CREDENTIALS";
        }
        throw error;
      }

      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error ? error.message : "Anmeldung fehlgeschlagen",
        status: 500,
        code: "LOGIN_ERROR",
      });
    }
  }

  /**
   * Führt den Registrierungsprozess durch
   * @throws ApiException bei Validierungsfehlern oder Serverfehlern
   */
  public async register(
    credentials: RegisterCredentials,
  ): Promise<RegisterResponse> {
    try {
      const response = await apiService.post<RegisterResponse>(
        `${this.baseEndpoint}/register`,
        credentials,
      );

      if (!response.data) {
        throw new ApiException({
          message:
            "Registrierung fehlgeschlagen: Keine Daten vom Server erhalten",
          status: 500,
          code: "REGISTRATION_FAILED",
        });
      }

      // Speichere Token im localStorage (oder in einem sichereren Speicher)
      if (response.data.access_token) {
        localStorage.setItem("auth_token", response.data.access_token);
      } else {
        throw new ApiException({
          message: "Registrierung fehlgeschlagen: Kein Token erhalten",
          status: 500,
          code: "NO_TOKEN_RECEIVED",
        });
      }

      return response.data;
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
        // Bei 409 Conflict eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 409) {
          error.error.message = `Ein Benutzer mit der E-Mail ${credentials.email} existiert bereits`;
          error.error.code = "EMAIL_ALREADY_EXISTS";
        }
        // Bei 422 Validation Error eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 422) {
          error.error.message = "Bitte überprüfen Sie Ihre Eingaben";
          error.error.code = "VALIDATION_ERROR";
        }
        throw error;
      }

      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error
            ? error.message
            : "Registrierung fehlgeschlagen",
        status: 500,
        code: "REGISTRATION_ERROR",
      });
    }
  }

  /**
   * Führt den Logout-Prozess durch
   */
  public async logout(): Promise<void> {
    try {
      await apiService.post(`${this.baseEndpoint}/logout`);
    } catch (error) {
      // Fehler beim Logout ignorieren, da wir den Benutzer trotzdem ausloggen wollen
      console.error("Fehler beim Logout:", error);
    } finally {
      // Entferne Token aus dem localStorage
      localStorage.removeItem("auth_token");
      // Weiterleitung zur Login-Seite
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }
  }

  /**
   * Bestätigt eine E-Mail-Adresse mit dem gegebenen Token
   * @throws ApiException bei ungültigem Token oder Serverfehlern
   */
  public async confirmEmail(token: string): Promise<LoginResponse> {
    try {
      const response = await apiService.post<LoginResponse>(
        `${this.baseEndpoint}/confirm-email`,
        { token },
      );

      if (!response.data) {
        throw new ApiException({
          message:
            "E-Mail-Bestätigung fehlgeschlagen: Keine Daten vom Server erhalten",
          status: 500,
          code: "CONFIRMATION_FAILED",
        });
      }

      // Speichere Token im localStorage
      if (response.data.access_token) {
        localStorage.setItem("auth_token", response.data.access_token);
      } else {
        throw new ApiException({
          message: "E-Mail-Bestätigung fehlgeschlagen: Kein Token erhalten",
          status: 500,
          code: "NO_TOKEN_RECEIVED",
        });
      }

      return response.data;
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
        if (error.error.status === 400) {
          error.error.message = "Ungültiger oder abgelaufener Bestätigungslink";
          error.error.code = "INVALID_TOKEN";
        }
        throw error;
      }

      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error
            ? error.message
            : "E-Mail-Bestätigung fehlgeschlagen",
        status: 500,
        code: "CONFIRMATION_ERROR",
      });
    }
  }

  /**
   * Prüft, ob der Benutzer eingeloggt ist
   */
  public isLoggedIn(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("auth_token");
  }

  /**
   * Holt den aktuellen Auth-Token
   */
  public getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }

  /**
   * Sendet eine Passwort-Zurücksetz-Anfrage
   * @param email Die E-Mail-Adresse des Benutzers
   * @throws ApiException bei Serverfehlern
   */
  public async forgotPassword(email: string): Promise<void> {
    try {
      await apiService.post(`${this.baseEndpoint}/forgot-password`, { email });

      // Erfolgsbenachrichtigung anzeigen
      toast.success("E-Mail gesendet", {
        description:
          "Wenn ein Konto mit dieser E-Mail-Adresse existiert, wurde eine E-Mail mit Anweisungen zum Zurücksetzen des Passworts gesendet.",
      });
    } catch (error) {
      // Bei 404 (Benutzer nicht gefunden) keinen Fehler werfen,
      // sondern die gleiche positive Nachricht anzeigen wie bei erfolgreicher Anfrage
      if (error instanceof ApiException && error.error.status === 404) {
        // Erfolgsbenachrichtigung anzeigen, auch wenn der Benutzer nicht existiert
        toast.success("E-Mail gesendet", {
          description:
            "Wenn ein Konto mit dieser E-Mail-Adresse existiert, wurde eine E-Mail mit Anweisungen zum Zurücksetzen des Passworts gesendet.",
        });
        return;
      }

      // Fehlerbenachrichtigung für andere Fehler
      toast.error("Bei der Verarbeitung ist ein Fehler aufgetreten", {
        description:
          "Bitte versuche es später erneut oder wende dich an den Support.",
      });

      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error
            ? error.message
            : "Bei der Verarbeitung Ihrer Anfrage ist ein Fehler aufgetreten",
        status: 500,
        code: "FORGOT_PASSWORD_ERROR",
      });
    }
  }

  /**
   * Setzt das Passwort mit einem Token zurück
   * @param token Das Passwort-Zurücksetz-Token
   * @param password Das neue Passwort
   * @throws ApiException bei ungültigem Token oder Serverfehlern
   */
  public async resetPassword(
    token: string,
    password: string,
  ): Promise<LoginResponse> {
    try {
      const response = await apiService.post<LoginResponse>(
        `${this.baseEndpoint}/reset-password`,
        { token, password },
      );
      if (!response.data) {
        throw new ApiException({
          message:
            "Passwort-Zurücksetzung fehlgeschlagen: Keine Daten vom Server erhalten",
          status: 500,
          code: "RESET_PASSWORD_FAILED",
        });
      }

      // Speichere Token im localStorage
      if (response.data.access_token) {
        localStorage.setItem("auth_token", response.data.access_token);
      } else {
        throw new ApiException({
          message: "Passwort-Zurücksetzung fehlgeschlagen: Kein Token erhalten",
          status: 500,
          code: "NO_TOKEN_RECEIVED",
        });
      }

      return response.data;
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
        if (error.error.status === 400) {
          error.error.message =
            "Ungültiger oder abgelaufener Zurücksetzungs-Link";
          error.error.code = "INVALID_TOKEN";
        }
        throw error;
      }

      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error
            ? error.message
            : "Passwort-Zurücksetzung fehlgeschlagen",
        status: 500,
        code: "RESET_PASSWORD_ERROR",
      });
    }
  }

  /**
   * Startet den Google OAuth-Prozess
   */
  public initiateGoogleLogin(): void {
    if (typeof window === "undefined") return;
    window.location.href = `http://localhost:8081/api/auth/google`;
  }

  /**
   * Akzeptiert eine Einladung und setzt ein Passwort für den Benutzer
   * @param token Das Einladungs-Token
   * @param password Das zu setzende Passwort
   * @throws ApiException bei ungültigem Token oder Serverfehlern
   */
  public async acceptInvitation(
    token: string,
    password: string,
  ): Promise<LoginResponse> {
    try {
      const response = await apiService.post<LoginResponse>(
        `${this.baseEndpoint}/accept-invitation`,
        { token, password },
      );

      if (!response.data) {
        throw new ApiException({
          message:
            "Einladung konnte nicht angenommen werden: Keine Daten vom Server erhalten",
          status: 500,
          code: "ACCEPT_INVITATION_FAILED",
        });
      }

      // Speichere Token im localStorage
      if (response.data.access_token) {
        localStorage.setItem("auth_token", response.data.access_token);
      } else {
        throw new ApiException({
          message:
            "Einladung konnte nicht angenommen werden: Kein Token erhalten",
          status: 500,
          code: "NO_TOKEN_RECEIVED",
        });
      }

      return response.data;
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
        if (error.error.status === 400) {
          error.error.message = "Ungültiger oder abgelaufener Einladungs-Link";
          error.error.code = "INVALID_TOKEN";
        }
        throw error;
      }

      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error
            ? error.message
            : "Einladung konnte nicht angenommen werden",
        status: 500,
        code: "ACCEPT_INVITATION_ERROR",
      });
    }
  }

  /**
   * Lädt einen Benutzer per E-Mail ein
   * @param email Die E-Mail-Adresse des einzuladenden Benutzers
   * @param firstName Der Vorname des einzuladenden Benutzers
   * @param lastName Der Nachname des einzuladenden Benutzers
   * @param workspaceId Die ID des Workspaces, zu dem der Benutzer eingeladen wird
   * @param role Die Rolle, die der Benutzer im Workspace haben soll
   * @throws ApiException bei Serverfehlern oder wenn die E-Mail bereits existiert
   */
  public async inviteUser(
    email: string,
    firstName: string,
    lastName: string,
    workspaceId: string,
    role?: string,
  ): Promise<{ message: string }> {
    try {
      const response = await apiService.post<{ message: string }>(
        `${this.baseEndpoint}/invite`,
        { email, firstName, lastName, workspaceId, role },
      );

      if (!response.data) {
        throw new ApiException({
          message:
            "Benutzer konnte nicht eingeladen werden: Keine Antwort vom Server",
          status: 500,
          code: "INVITE_USER_FAILED",
        });
      }

      return response.data;
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
        // Bei 409 Conflict eine spezifischere Fehlermeldung hinzufügen
        if (error.error.status === 409) {
          error.error.message = `Ein Benutzer mit der E-Mail ${email} existiert bereits`;
          error.error.code = "EMAIL_ALREADY_EXISTS";
        }
        throw error;
      }

      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error
            ? error.message
            : "Benutzer konnte nicht eingeladen werden",
        status: 500,
        code: "INVITE_USER_ERROR",
      });
    }
  }

  /**
   * Ruft die aktuellen Benutzerdaten vom Server ab
   * @throws ApiException bei Serverfehlern oder wenn der Benutzer nicht authentifiziert ist
   */
  public async getCurrentUser(): Promise<UserResponse> {
    try {
      const response = await apiService.get<UserResponse>(`/users/me`);

      if (!response.data) {
        throw new ApiException({
          message:
            "Benutzerdaten konnten nicht abgerufen werden: Keine Daten vom Server erhalten",
          status: 500,
          code: "GET_USER_FAILED",
        });
      }

      return response.data;
    } catch (error) {
      // ApiException durchreichen
      if (error instanceof ApiException) {
        if (error.error.status === 401) {
          error.error.message = "Nicht authentifiziert";
          error.error.code = "UNAUTHORIZED";
        }
        throw error;
      }

      // Andere Fehler in ApiException umwandeln
      throw new ApiException({
        message:
          error instanceof Error
            ? error.message
            : "Benutzerdaten konnten nicht abgerufen werden",
        status: 500,
        code: "GET_USER_ERROR",
      });
    }
  }
}

export const authService = AuthService.getInstance();
