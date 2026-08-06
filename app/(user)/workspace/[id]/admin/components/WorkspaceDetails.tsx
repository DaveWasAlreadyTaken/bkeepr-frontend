import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Workspace,
  NewWorkspace,
} from "../../../../../(superadmin)/superadmin/workspaces/types";
import { Checkbox } from "@/components/ui/checkbox";
import { GlobeIcon, LockKeyholeIcon } from "lucide-react";

// Hilfsfunktion zum Vergleichen der Workspace-Daten
const hasChanges = (original: Workspace, edited: NewWorkspace): boolean => {
  return (
    original.name !== edited.name ||
    original.domain !== edited.domain ||
    original.state !== edited.state ||
    original.plan !== edited.plan ||
    original.isPrivate !== edited.isPrivate
  );
};

interface WorkspaceDetailsProps {
  workspace: Workspace;
  onSave: (updatedWorkspace: NewWorkspace) => Promise<void>;
  isSaving: boolean;
  canEdit: boolean;
  isSuperAdmin: boolean;
}

export const WorkspaceDetails = ({
  workspace,
  onSave,
  isSaving,
  canEdit,
  isSuperAdmin,
}: WorkspaceDetailsProps) => {
  const [editedWorkspace, setEditedWorkspace] = useState<NewWorkspace>({
    name: workspace.name,
    domain: workspace.domain,
    state: workspace.state,
    plan: workspace.plan,
    isPrivate: workspace.isPrivate,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(editedWorkspace);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Workspace-Details</CardTitle>
        {canEdit && isSuperAdmin ? (
          <div className="flex items-center space-x-2 font-medium">
            <Checkbox
              id="isPrivate"
              checked={editedWorkspace.isPrivate}
              onCheckedChange={(checked) =>
                setEditedWorkspace({
                  ...editedWorkspace,
                  isPrivate: checked as boolean,
                })
              }
            />
            <label
              htmlFor="isPrivate"
              className="flex cursor-pointer items-center text-sm"
            >
              <span>Privater Workspace</span>
              <LockKeyholeIcon className="ml-1 h-4 w-4" />
            </label>
          </div>
        ) : (
          <div className="flex items-center text-sm font-medium">
            {workspace.isPrivate ? (
              <>
                <LockKeyholeIcon className="mr-1 h-4 w-4" />
                <span>Privater Workspace</span>
              </>
            ) : (
              <>
                <GlobeIcon className="mr-1 h-4 w-4" />
                <span>Öffentlicher Workspace</span>
              </>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Erste Spalte: Name und Domain */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  value={editedWorkspace.name}
                  onChange={(e) =>
                    setEditedWorkspace({
                      ...editedWorkspace,
                      name: e.target.value,
                    })
                  }
                  placeholder="Workspace-Name"
                  required
                  readOnly={!canEdit}
                  className={!canEdit ? "opacity-60" : ""}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="domain" className="text-sm font-medium">
                  Domain
                </label>
                <Input
                  id="domain"
                  value={editedWorkspace.domain}
                  onChange={(e) =>
                    setEditedWorkspace({
                      ...editedWorkspace,
                      domain: e.target.value,
                    })
                  }
                  placeholder="mein-workspace"
                  required
                  readOnly={!isSuperAdmin}
                  className={!isSuperAdmin ? "opacity-60" : ""}
                />
                <p className="text-xs text-muted-foreground">
                  Die Domain wird für die URL verwendet:
                  https://mein-workspace.elephant-bookings.com
                </p>
              </div>
            </div>

            {/* Zweite Spalte: Status und Plan */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="state" className="text-sm font-medium">
                  Status
                </label>
                <Select
                  value={editedWorkspace.state}
                  onValueChange={(value: string) =>
                    setEditedWorkspace({
                      ...editedWorkspace,
                      state: value,
                    })
                  }
                  required
                  disabled={!isSuperAdmin}
                >
                  <SelectTrigger className={!isSuperAdmin ? "opacity-60" : ""}>
                    <SelectValue placeholder="Wählen Sie einen Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Aktiv</SelectItem>
                    <SelectItem value="PENDING">Ausstehend</SelectItem>
                    <SelectItem value="INACTIVE">Inaktiv</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="plan" className="text-sm font-medium">
                  Plan
                </label>
                <Select
                  value={editedWorkspace.plan}
                  onValueChange={(value: string) =>
                    setEditedWorkspace({
                      ...editedWorkspace,
                      plan: value,
                    })
                  }
                  required
                  disabled={!isSuperAdmin}
                >
                  <SelectTrigger className={!isSuperAdmin ? "opacity-60" : ""}>
                    <SelectValue placeholder="Wählen Sie einen Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BASIC">Basic</SelectItem>
                    <SelectItem value="PREMIUM">Premium</SelectItem>
                    <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            {canEdit && (
              <Button
                type="submit"
                disabled={isSaving || !hasChanges(workspace, editedWorkspace)}
                loading={isSaving}
              >
                Speichern
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
