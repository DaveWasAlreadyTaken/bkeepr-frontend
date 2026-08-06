import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authService } from "@/app/services/auth.service";
import { toast } from "sonner";

export interface Workspace {
  id: string;
  name: string;
  role: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  workspaces: Workspace[];
  profilePicture?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  hasWorkspaceRole: (workspaceId: string, role: string) => boolean;
  getWorkspaceRole: (workspaceId: string) => string | null;
  updateCurrentUser: () => Promise<void>;
}

// Selektoren für Benutzerrollen
interface AuthSelectors {
  isSuperAdmin: boolean;
}

type AuthStore = AuthState & AuthActions & AuthSelectors;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Selektoren als normale Properties
      isSuperAdmin: false,

      // Workspace Role Helpers
      hasWorkspaceRole: (workspaceId: string, role: string) => {
        const user = get().user;
        if (!user) return false;
        const workspace = user.workspaces.find((w) => w.id === workspaceId);
        return workspace?.role === role;
      },

      getWorkspaceRole: (workspaceId: string) => {
        const user = get().user;
        if (!user) return null;
        const workspace = user.workspaces.find((w) => w.id === workspaceId);
        return workspace?.role || null;
      },

      // Actions
      login: async (credentials) => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.login(credentials);

          // Transformiere die Server-Antwort in unser User-Format
          const user: User = {
            id: response.id,
            email: response.email,
            firstName: response.firstName,
            lastName: response.lastName,
            role: response.role,
            workspaces: response.workspaces || [],
            profilePicture: response.profilePicture || undefined,
          };

          // Setze User und aktualisiere Rollen
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            isSuperAdmin: user.role === "SUPERADMIN",
          });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Login fehlgeschlagen",
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          toast.error("Login fehlgeschlagen", {
            description:
              error instanceof Error
                ? error.message
                : "Bitte versuchen Sie es später erneut",
          });
          // Fehler weiterwerfen, damit die Login-Page ihn abfangen kann
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          await authService.logout();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isSuperAdmin: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Logout fehlgeschlagen",
            isLoading: false,
          });
          toast.error("Logout fehlgeschlagen", {
            description: "Bitte versuchen Sie es später erneut",
          });
        }
      },

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          error: null,
          isSuperAdmin: user?.role === "SUPERADMIN",
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      updateCurrentUser: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await authService.getCurrentUser();

          // Extrahiere Benutzerdaten aus der Antwort
          const userData = response.user;

          // Aktualisiere nur die Felder, die sich geändert haben
          const currentUser = get().user;

          if (currentUser) {
            // Erstelle ein neues User-Objekt, das vorhandene Werte beibehält
            // und nur aktualisierte Werte überschreibt
            const updatedUser: User = {
              ...currentUser,
              id: userData.id,
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              role: userData.role,
              workspaces: userData.workspaces,
              profilePicture: userData.profilePicture,
            };

            set({
              user: updatedUser,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              isSuperAdmin: updatedUser.role === "SUPERADMIN",
            });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Aktualisierung der Benutzerdaten fehlgeschlagen",
            isLoading: false,
          });
          toast.error("Aktualisierung der Benutzerdaten fehlgeschlagen", {
            description:
              error instanceof Error
                ? error.message
                : "Bitte versuchen Sie es später erneut",
          });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isSuperAdmin: state.isSuperAdmin,
      }),
      onRehydrateStorage: () => (state) => {
        // Aktualisiere die Rollen basierend auf dem hydratisierten User
        if (state?.user) {
          state.isSuperAdmin = state.user.role === "SUPERADMIN";
        }
      },
    },
  ),
);
