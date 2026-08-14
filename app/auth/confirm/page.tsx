"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authService } from "@/app/services/auth.service";
import { useAuthStore } from "@/app/stores/auth.store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function ConfirmEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
          <Loader2 className="size-12 animate-spin text-primary" />
        </div>
      }
    >
      <ConfirmEmailContent />
    </Suspense>
  );
}

function ConfirmEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState<string>("");
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token = searchParams.get("token");

        if (!token) {
          setStatus("error");
          setErrorMessage(
            "Kein Bestätigungstoken gefunden. Bitte überprüfe den Link.",
          );
          return;
        }

        // Token an den Backend-Endpunkt senden
        const userData = await authService.confirmEmail(token);

        // Benutzer im Store setzen und einloggen
        setUser({
          id: userData.id,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role,
          workspaces: userData.workspaces || [],
        });

        setStatus("success");

        // Weiterleitung zur Startseite nach 3 Sekunden
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } catch (error) {
        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Bei der E-Mail-Bestätigung ist ein Fehler aufgetreten.",
        );
        toast.error("E-Mail-Bestätigung fehlgeschlagen", {
          description:
            error instanceof Error
              ? error.message
              : "Bitte versuche es später erneut oder wende dich an den Support.",
        });
      }
    };

    confirmEmail();
  }, [searchParams, router, setUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            E-Mail-Bestätigung
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Deine E-Mail-Adresse wird bestätigt..."}
            {status === "success" &&
              "Deine E-Mail-Adresse wurde erfolgreich bestätigt."}
            {status === "error" &&
              "Bei der E-Mail-Bestätigung ist ein Problem aufgetreten."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="size-12 animate-spin text-primary" />
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Bitte warte, während wir deine E-Mail-Adresse bestätigen...
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Du wirst automatisch zur Startseite weitergeleitet.
              </p>
              <Button onClick={() => router.push("/")} className="w-full">
                Zur Startseite
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-destructive">{errorMessage}</p>
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={() => router.push("/auth/login")}
                  className="w-full"
                >
                  Zur Anmeldeseite
                </Button>
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="w-full"
                >
                  Zur Startseite
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
