import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, NewUser, Role } from "../types";
import { rolesService } from "@/app/services/roles.service";
import { useEffect, useState } from "react";
import { toast } from "sonner";
interface UserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  editingUser: User | null;
  newUser: NewUser;
  setNewUser: (user: NewUser) => void;
}

// Hilfsfunktion zum Formatieren des Rollennamens
const formatRoleName = (name: string): string => {
  const roleMap: { [key: string]: string } = {
    SUPERADMIN: "Superadmin",
    ADMIN: "Administrator",
    MANAGER: "Manager",
    USER: "Benutzer",
  };
  return roleMap[name] || name;
};

export const UserDialog = ({
  isOpen,
  onOpenChange,
  onSubmit,
  editingUser,
  newUser,
  setNewUser,
}: UserDialogProps) => {
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setIsLoadingRoles(true);
        const roles = await rolesService.getGlobalRoles();
        if (roles) {
          setAvailableRoles(roles);
        }
      } catch (error) {
        toast.error("Fehler beim Laden der Rollen", {
          description: `${error}`,
        });
      } finally {
        setIsLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingUser ? "Benutzer bearbeiten" : "Neuen Benutzer hinzufügen"}
          </DialogTitle>
          <DialogDescription>
            {editingUser
              ? "Bearbeiten Sie die Daten des Benutzers."
              : "Füllen Sie die folgenden Felder aus, um einen neuen Benutzer anzulegen."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium">
              Vorname
            </label>
            <Input
              id="firstName"
              value={newUser.firstName}
              onChange={(e) =>
                setNewUser({ ...newUser, firstName: e.target.value })
              }
              placeholder="Max"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium">
              Nachname
            </label>
            <Input
              id="lastName"
              value={newUser.lastName}
              onChange={(e) =>
                setNewUser({ ...newUser, lastName: e.target.value })
              }
              placeholder="Mustermann"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              E-Mail
            </label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              placeholder="max.mustermann@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              Globale Rolle
            </label>
            <Select
              value={newUser.roleIds?.[0] || ""}
              onValueChange={(value: string) =>
                setNewUser({
                  ...newUser,
                  roleIds: [value],
                })
              }
              required
              disabled={isLoadingRoles}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wählen Sie eine Rolle" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {formatRoleName(role.name)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit">
              {editingUser ? "Speichern" : "Benutzer anlegen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
