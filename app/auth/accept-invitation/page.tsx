"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BRANDING } from "@/app/config/branding";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { authService } from "@/app/services/auth.service";
import { useAuthStore } from "@/app/stores/auth.store";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Schema für die Formularvalidierung
const acceptInvitationSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Passwort muss mindestens 8 Zeichen lang sein" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwörter stimmen nicht überein",
    path: ["confirmPassword"],
  });

type AcceptInvitationFormData = z.infer<typeof acceptInvitationSchema>;

export default function AcceptInvitationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
          <Loader2 className="size-12 animate-spin text-primary" />
        </div>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );
}

function AcceptInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const isTokenValid = token !== null;
  const [isLoading, setIsLoading] = useState(false);
  const [isAcceptComplete, setIsAcceptComplete] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  // Formularinitialisierung mit zod-Validierung
  const form = useForm<AcceptInvitationFormData>({
    resolver: zodResolver(acceptInvitationSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Meldung, wenn der Link keinen Token enthält
  useEffect(() => {
    if (!isTokenValid) {
      toast.error("Fehler", {
        description:
          "Der Einladungslink ist ungültig oder abgelaufen. Bitte kontaktiere den Administrator für einen neuen Link.",
      });
    }
  }, [isTokenValid]);

  // Formularverarbeitung
  const onSubmit = async (data: AcceptInvitationFormData) => {
    if (!token) {
      toast.error("Fehler", {
        description:
          "Kein Token vorhanden. Bitte kontaktiere den Administrator für einen neuen Link.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const userData = await authService.acceptInvitation(token, data.password);

      // Benutzer im Store setzen und einloggen
      setUser({
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        workspaces: userData.workspaces || [],
      });

      setIsAcceptComplete(true);
      toast.success("Einladung angenommen", {
        description:
          "Dein Konto wurde erfolgreich aktiviert. Du wirst automatisch weitergeleitet.",
      });

      // Benutzerinformationen und Rollen abrufen
      const state = useAuthStore.getState();
      const isSuperAdmin = state.isSuperAdmin;
      const user = state.user;

      // Weiterleitungslogik nach 3 Sekunden
      setTimeout(() => {
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
      }, 3000);
    } catch (error) {
      console.error("Fehler beim Annehmen der Einladung:", error);
      toast.error("Einladung konnte nicht angenommen werden", {
        description:
          error instanceof Error
            ? error.message
            : "Bitte versuche es später erneut oder wende dich an den Support.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Wenn der Token ungültig ist
  if (!isTokenValid) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              Ungültiger Link
            </CardTitle>
            <CardDescription>
              Der Einladungslink ist ungültig oder abgelaufen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">
                Bitte kontaktiere den Administrator für einen neuen
                Einladungslink.
              </div>
            </div>

            <Button
              onClick={() => router.push("/auth/login")}
              className="w-full"
            >
              Zur Anmeldung
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Wenn die Einladung erfolgreich angenommen wurde
  if (isAcceptComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              Einladung angenommen
            </CardTitle>
            <CardDescription>
              Dein Konto wurde erfolgreich aktiviert.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">
                Du bist jetzt angemeldet und wirst automatisch weitergeleitet.
              </div>
            </div>

            <Button
              onClick={() => {
                // Benutzerinformationen und Rollen abrufen
                const state = useAuthStore.getState();
                const isSuperAdmin = state.isSuperAdmin;
                const user = state.user;

                // Weiterleitungslogik
                if (isSuperAdmin) {
                  router.push("/superadmin/workspaces");
                } else if (user?.workspaces && user.workspaces.length > 0) {
                  router.push(`/workspace/${user.workspaces[0].id}`);
                } else {
                  router.push("/");
                }
              }}
              className="w-full"
            >
              Jetzt zur Anwendung
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formular zum Setzen des Passworts
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Willkommen bei {BRANDING.appName}
          </CardTitle>
          <CardDescription>
            Bitte setze ein Passwort, um deine Einladung anzunehmen und dein
            Konto zu aktivieren.
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Neues Passwort</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passwort bestätigen</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Konto wird aktiviert..." : "Einladung annehmen"}
              </Button>
            </CardContent>
          </form>
        </Form>

        <CardFooter className="flex justify-center">
          <div className="text-center text-sm">
            <Link
              href="/auth/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              Zurück zur Anmeldung
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
