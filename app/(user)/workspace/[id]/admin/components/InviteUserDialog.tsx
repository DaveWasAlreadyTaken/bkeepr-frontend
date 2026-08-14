import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { authService } from "@/app/services/auth.service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface InviteUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  email?: string;
  workspaceId: string;
  onInviteSuccess: () => void;
}

export function InviteUserDialog({
  isOpen,
  onOpenChange,
  email = "",
  workspaceId,
  onInviteSuccess,
}: InviteUserDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <InviteUserDialogContent
        key={isOpen ? `open-${email}` : "closed"}
        onOpenChange={onOpenChange}
        email={email}
        workspaceId={workspaceId}
        onInviteSuccess={onInviteSuccess}
      />
    </Dialog>
  );
}

function InviteUserDialogContent({
  onOpenChange,
  email = "",
  workspaceId,
  onInviteSuccess,
}: Omit<InviteUserDialogProps, "isOpen">) {
  const [inviteData, setInviteData] = useState({
    email: email,
    firstName: "",
    lastName: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteData.email || !inviteData.firstName || !inviteData.lastName) {
      toast.error("Bitte füllen Sie alle Felder aus.");
      return;
    }

    setIsLoading(true);

    try {
      // Benutzer einladen - die Rolle wird im Backend automatisch auf MEMBER gesetzt
      await authService.inviteUser(
        inviteData.email,
        inviteData.firstName,
        inviteData.lastName,
        workspaceId,
      );

      toast.success("Benutzer erfolgreich eingeladen", {
        description: `Eine Einladung wurde an ${inviteData.email} gesendet.`,
      });

      onOpenChange(false);
      onInviteSuccess();
    } catch (error) {
      console.error("Fehler beim Einladen des Benutzers:", error);
      // Der Fehler wird bereits vom authService behandelt
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Benutzer einladen</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              E-Mail-Adresse
            </label>
            <Input
              id="email"
              type="email"
              value={inviteData.email}
              onChange={(e) =>
                setInviteData({ ...inviteData, email: e.target.value })
              }
              required
              disabled={!!email}
            />
          </div>
          <div>
            <label
              htmlFor="firstName"
              className="text-sm font-medium text-gray-700"
            >
              Vorname
            </label>
            <Input
              id="firstName"
              value={inviteData.firstName}
              onChange={(e) =>
                setInviteData({ ...inviteData, firstName: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="text-sm font-medium text-gray-700"
            >
              Nachname
            </label>
            <Input
              id="lastName"
              value={inviteData.lastName}
              onChange={(e) =>
                setInviteData({ ...inviteData, lastName: e.target.value })
              }
              required
            />
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                Wird eingeladen
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </>
            ) : (
              "Einladen"
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
