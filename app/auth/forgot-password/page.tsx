"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm, ControllerRenderProps } from "react-hook-form";
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

// Schema für die Formularvalidierung
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "E-Mail-Adresse ist erforderlich" })
    .email({ message: "Ungültige E-Mail-Adresse" }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Formularinitialisierung mit zod-Validierung
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Formularverarbeitung
  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      await authService.forgotPassword(data.email);
      setIsSuccess(true);
    } catch (error) {
      console.error("Fehler beim Anfordern des Zurücksetzungs-Links:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Passwort zurücksetzen
          </CardTitle>
          <CardDescription>
            Gib deine E-Mail-Adresse ein, um einen Link zum Zurücksetzen deines
            Passworts zu erhalten.
          </CardDescription>
        </CardHeader>

        {isSuccess ? (
          <CardContent className="space-y-4">
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">
                Wir haben dir eine E-Mail mit einem Link zum Zurücksetzen deines
                Passworts an{" "}
                <span className="font-medium underline">
                  {form.getValues("email")}
                </span>{" "}
                gesendet. Bitte überprüfe deinen Posteingang und folge den
                Anweisungen in der E-Mail.
              </div>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Die E-Mail sollte in wenigen Minuten ankommen. Falls du keine
              E-Mail erhältst, überprüfe bitte deinen Spam-Ordner oder stelle
              sicher, dass die eingegebene E-Mail-Adresse korrekt ist.
            </div>
          </CardContent>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({
                    field,
                  }: {
                    field: ControllerRenderProps<
                      ForgotPasswordFormData,
                      "email"
                    >;
                  }) => (
                    <FormItem>
                      <FormLabel>E-Mail-Adresse</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="name@beispiel.de"
                          type="email"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Wird gesendet..." : "Link anfordern"}
                </Button>
              </CardContent>
            </form>
          </Form>
        )}

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
