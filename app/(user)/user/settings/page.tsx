"use client";

import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  userSettingsService,
  UserSettings,
} from "@/app/services/user-settings.service";
import { ApiException } from "@/app/services/api-config";

function UserSettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        const userSettings = await userSettingsService.getUserSettings();
        setSettings(userSettings);
      } catch (error) {
        console.error("Fehler beim Laden der Einstellungen:", error);
        toast.error(
          error instanceof ApiException
            ? error.error.message
            : "Einstellungen konnten nicht geladen werden",
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleEmailNotificationsChange = async (enabled: boolean) => {
    if (!settings) return;

    try {
      setIsSaving(true);

      const updatedSettings = {
        ...settings,
        emailNotificationsEnabled: enabled,
      };

      await userSettingsService.updateUserSettings(updatedSettings);
      setSettings(updatedSettings);

      toast.success("Einstellungen wurden gespeichert");
    } catch (error) {
      console.error("Fehler beim Speichern der Einstellungen:", error);
      toast.error(
        error instanceof ApiException
          ? error.error.message
          : "Einstellungen konnten nicht gespeichert werden",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Benutzereinstellungen</h1>

      <Card>
        <CardHeader>
          <CardTitle>Benachrichtigungen</CardTitle>
          <CardDescription>
            Verwalten Sie Ihre Benachrichtigungseinstellungen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-4">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">
                  E-Mail-Benachrichtigungen
                </Label>
                <p className="text-sm text-muted-foreground">
                  Erhalten Sie Benachrichtigungen über wichtige Ereignisse auch
                  per E-Mail
                </p>
              </div>
            </div>
            <Switch
              id="email-notifications"
              checked={settings?.emailNotificationsEnabled ?? false}
              onCheckedChange={handleEmailNotificationsChange}
              disabled={isLoading || isSaving}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UserSettingsPage;
