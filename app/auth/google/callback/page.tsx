"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/app/stores/auth.store";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function GoogleAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    async function processCallback() {
      try {
        // Prüfe auf Fehler-Parameter
        const error = searchParams.get("error");
        if (error) {
          setErrorMessage(error);
          toast.error("Google Anmeldung fehlgeschlagen", {
            description: error,
          });
          setTimeout(() => router.push("/auth/login"), 3000);
          return;
        }

        // Token aus den Parametern holen (falls vorhanden)
        const token = searchParams.get("token");
        if (!token) {
          const error = "Keine Authentifizierungsdaten empfangen";
          setErrorMessage(error);
          toast.error("Google Anmeldung fehlgeschlagen", {
            description: error,
          });
          setTimeout(() => router.push("/auth/login"), 3000);
          return;
        }

        // Token im localStorage speichern
        localStorage.setItem("auth_token", token);

        // Benutzerdaten aus dem JSON-String parsen
        const userStr = searchParams.get("user");
        if (!userStr) {
          const error = "Keine Benutzerdaten empfangen";
          setErrorMessage(error);
          toast.error("Google Anmeldung fehlgeschlagen", {
            description: error,
          });
          setTimeout(() => router.push("/auth/login"), 3000);
          return;
        }

        let userData;
        try {
          userData = JSON.parse(decodeURIComponent(userStr));
        } catch (e) {
          console.error("Fehler beim Parsen der Benutzerdaten:", e);
          const error = "Ungültiges Benutzerdaten-Format";
          setErrorMessage(error);
          toast.error("Google Anmeldung fehlgeschlagen", {
            description: error,
          });
          setTimeout(() => router.push("/auth/login"), 3000);
          return;
        }

        // Benutzer im AuthStore setzen
        setUser(userData);

        // Benutzerinformationen und Rollen abrufen
        const state = useAuthStore.getState();
        const isSuperAdmin = state.isSuperAdmin;
        const user = state.user;

        // Weiterleitungslogik
        if (isSuperAdmin) {
          // Superadmin zu Workspaces weiterleiten
          router.push("/superadmin/workspaces");
        } else if (user?.workspaces && user.workspaces.length > 0) {
          // Benutzer mit mindestens einem Workspace zum ersten Workspace weiterleiten
          router.push(`/workspace/${user.workspaces[0].id}`);
        } else {
          // Andere Benutzer zur Startseite
          router.push("/");
        }
      } catch (error) {
        console.error("Fehler bei der Verarbeitung des Callbacks:", error);
        setErrorMessage("Ein unerwarteter Fehler ist aufgetreten");
        toast.error("Google Anmeldung fehlgeschlagen", {
          description: "Bitte versuche es später erneut",
        });
        setTimeout(() => router.push("/auth/login"), 3000);
      }
    }

    processCallback();
  }, [searchParams, router, setUser]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
      {errorMessage ? (
        <>
          <h1 className="text-2xl font-bold text-destructive">
            Fehler bei der Anmeldung
          </h1>
          <p className="text-muted-foreground">{errorMessage}</p>
          <p className="text-sm">Du wirst zur Login-Seite weitergeleitet...</p>
        </>
      ) : (
        <>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <h1 className="text-2xl font-bold">
            Google Anmeldung wird verarbeitet
          </h1>
          <p className="text-muted-foreground">
            Bitte warte, während wir dich anmelden...
          </p>
        </>
      )}
    </div>
  );
}
