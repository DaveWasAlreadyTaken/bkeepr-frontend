"use client";

import { useState, useEffect } from "react";
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
const resetPasswordSchema = z
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

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [isResetComplete, setIsResetComplete] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  // Formularinitialisierung mit zod-Validierung
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Token aus URL extrahieren
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      setIsTokenValid(true);
    } else {
      setIsTokenValid(false);
      toast.error("Fehler", {
        description:
          "Der Link ist ungültig oder abgelaufen. Bitte fordere einen neuen Link an.",
      });
    }
  }, [searchParams]);

  // Formularverarbeitung
  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast.error("Fehler", {
        description: "Kein Token vorhanden. Bitte fordere einen neuen Link an.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const userData = await authService.resetPassword(token, data.password);

      // Benutzer im Store setzen und einloggen
      setUser({
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        workspaces: userData.workspaces || [],
      });

      setIsResetComplete(true);
      toast.success("Passwort zurückgesetzt", {
        description:
          "Dein Passwort wurde erfolgreich zurückgesetzt. Du wirst automatisch weitergeleitet.",
      });

      // Weiterleitung zur Startseite nach 3 Sekunden
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error) {
      console.error("Fehler beim Zurücksetzen des Passworts:", error);
      toast.error("Zurücksetzen fehlgeschlagen", {
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
  if (isTokenValid === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              Ungültiger Link
            </CardTitle>
            <CardDescription>
              Der Link zur Passwort-Zurücksetzung ist ungültig oder abgelaufen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">
                Bitte fordere einen neuen Link zur Passwort-Zurücksetzung an.
              </div>
            </div>

            <Button
              onClick={() => router.push("/auth/forgot-password")}
              className="w-full"
            >
              Neuen Link anfordern
            </Button>
          </CardContent>
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

  // Wenn das Passwort erfolgreich zurückgesetzt wurde
  if (isResetComplete) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              Passwort zurückgesetzt
            </CardTitle>
            <CardDescription>
              Dein Passwort wurde erfolgreich zurückgesetzt.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">
                Du bist jetzt angemeldet und wirst zur Startseite
                weitergeleitet.
              </div>
            </div>

            <Button onClick={() => router.push("/")} className="w-full">
              Zur Startseite
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Wenn der Token noch überprüft wird
  if (isTokenValid === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              Passwort zurücksetzen
            </CardTitle>
            <CardDescription>Wir überprüfen deinen Link...</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="size-12 animate-spin text-primary" />
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Bitte warte einen Moment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Formular zum Zurücksetzen des Passworts
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Neues Passwort festlegen
          </CardTitle>
          <CardDescription>
            Gib dein neues Passwort ein, um es zurückzusetzen.
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
                {isLoading
                  ? "Passwort wird zurückgesetzt..."
                  : "Passwort zurücksetzen"}
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
