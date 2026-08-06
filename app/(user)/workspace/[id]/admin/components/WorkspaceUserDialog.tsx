import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import {
  EWorkspaceRole,
  NewWorkspaceUser,
  WorkspaceUserTableData,
} from "../types";

interface WorkspaceUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  editingUser: WorkspaceUserTableData | null;
  newUser: NewWorkspaceUser;
  setNewUser: React.Dispatch<React.SetStateAction<NewWorkspaceUser>>;
}

// Helper-Funktion für die Anzeige der Rollenbezeichnungen
const getRoleLabel = (role: EWorkspaceRole): string => {
  const roleLabels: Record<EWorkspaceRole, string> = {
    [EWorkspaceRole.ADMIN]: "Administrator",
    [EWorkspaceRole.MEMBER]: "Mitglied",
    [EWorkspaceRole.OWNER]: "Besitzer",
  };
  return roleLabels[role] || role;
};

// Helper-Funktion für die verfügbaren Rollen
const AVAILABLE_ROLES = Object.values(EWorkspaceRole);

export function WorkspaceUserDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  editingUser,
  newUser,
  setNewUser,
}: WorkspaceUserDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingUser ? "Benutzer bearbeiten" : "Neuen Benutzer hinzufügen"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="space-y-4">
            {!editingUser && (
              <>
                <div>
                  <label
                    htmlFor="firstName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Vorname
                  </label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, firstName: e.target.value })
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
                    value={newUser.lastName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, lastName: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    E-Mail
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    required
                  />
                </div>
              </>
            )}
            <div>
              <label
                htmlFor="role"
                className="text-sm font-medium text-gray-700"
              >
                Workspace-Rolle
              </label>
              <Select
                value={newUser.role}
                onValueChange={(value: EWorkspaceRole) =>
                  setNewUser({ ...newUser, role: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wähle eine Rolle" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {getRoleLabel(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="submit">
              {editingUser ? "Rolle speichern" : "Hinzufügen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
