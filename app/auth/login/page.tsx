"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { useAuthStore } from "@/app/stores/auth.store";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { GoogleLoginButton } from "./google-button";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Bitte gib deine E-Mail und dein Passwort ein.");
      return;
    }

    setIsLoading(true);

    try {
      await login(formData);
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
      // Der Fehler wird bereits im Store behandelt, wir verhindern hier nur den Redirect
      console.error("Login fehlgeschlagen:", error);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Anmelden</CardTitle>
          <CardDescription>
            Nutze eine der folgenden Optionen, um dich anzumelden
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <GoogleLoginButton />
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Oder
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                E-Mail
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@beispiel.de"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Passwort
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                Passwort vergessen?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Anmeldung läuft..." : "Anmelden"}
            </Button>
          </CardContent>
        </form>

        <CardFooter className="flex justify-center">
          <div className="text-center text-sm">
            Noch kein Konto?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Registrieren
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
