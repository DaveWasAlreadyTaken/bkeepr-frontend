"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authService } from "@/app/services/auth.service";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { GoogleLoginButton } from "../login/google-button";

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validierung
    if (
      !formData.email ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.password
    ) {
      toast.error("Bitte fülle alle Pflichtfelder aus.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Die Passwörter stimmen nicht überein.");
      return;
    }

    // Einfache E-Mail-Validierung
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }

    // Passwort-Validierung (mindestens 8 Zeichen)
    if (formData.password.length < 8) {
      toast.error("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }

    try {
      setIsLoading(true);

      // Wir entfernen confirmPassword, da es nicht an den Server gesendet werden soll
      const { confirmPassword, ...registrationData } = formData;

      await authService.register(registrationData);
      toast.success("Registrierung erfolgreich!");
      router.push("/"); // Zur Startseite weiterleiten
    } catch (error) {
      // Fehler werden bereits vom AuthService und ApiException behandelt
      // Hier nur Logging für Debugging-Zwecke
      console.error("Registrierung fehlgeschlagen:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Registrieren</CardTitle>
          <CardDescription>
            Erstelle ein neues Konto bei Elephant Bookings
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <GoogleLoginButton />
            <div className="space-y-2">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium">
                  Vorname
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Max"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  autoComplete="given-name"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium">
                  Nachname
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Mustermann"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Passwort
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">
                Mindestens 8 Zeichen
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Passwort bestätigen
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Registrierung läuft..." : "Registrieren"}
            </Button>

            <div className="text-center text-sm">
              Bereits ein Konto?{" "}
              <a href="/auth/login" className="text-primary hover:underline">
                Anmelden
              </a>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
