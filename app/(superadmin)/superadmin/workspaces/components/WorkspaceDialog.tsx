import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LockKeyholeIcon, Plus } from "lucide-react";
import { NewWorkspace } from "../types";
import { Checkbox } from "@/components/ui/checkbox";

interface WorkspaceDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  newWorkspace: NewWorkspace;
  setNewWorkspace: (workspace: NewWorkspace) => void;
}

export const WorkspaceDialog = ({
  isOpen,
  onOpenChange,
  onSubmit,
  newWorkspace,
  setNewWorkspace,
}: WorkspaceDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>
          Neuen Workspace anlegen <Plus className="ml-2 h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Neuen Workspace anlegen</DialogTitle>
          <DialogDescription>
            Füllen Sie die folgenden Felder aus, um einen neuen Workspace
            anzulegen.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              value={newWorkspace.name}
              onChange={(e) =>
                setNewWorkspace({ ...newWorkspace, name: e.target.value })
              }
              placeholder="Mein Workspace"
              className="w-full"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="domain" className="block text-sm font-medium">
              Domain
            </label>
            <Input
              id="domain"
              value={newWorkspace.domain}
              onChange={(e) =>
                setNewWorkspace({ ...newWorkspace, domain: e.target.value })
              }
              placeholder="mein-workspace"
              className="w-full"
              required
            />
            <p className="text-xs text-muted-foreground">
              Die Domain wird für die URL verwendet:
              https://mein-workspace.elephant-bookings.com
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="status" className="block text-sm font-medium">
              Status
            </label>
            <Select
              value={newWorkspace.state}
              onValueChange={(value: string) =>
                setNewWorkspace({ ...newWorkspace, state: value })
              }
              required
            >
              <SelectTrigger className="w-full">
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
            <label htmlFor="plan" className="block text-sm font-medium">
              Plan
            </label>
            <Select
              value={newWorkspace.plan}
              onValueChange={(value: string) =>
                setNewWorkspace({ ...newWorkspace, plan: value })
              }
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Wählen Sie einen Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FREE">Kostenlos</SelectItem>
                <SelectItem value="BASIC">Basic</SelectItem>
                <SelectItem value="PREMIUM">Premium</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <h3 className="block text-sm font-medium">Sichtbarkeit</h3>
            <p className="text-xs text-muted-foreground">
              Nutzer müssen eine Beitrittsanfrage an den Workspace stellen
            </p>
            <div className="my-2 flex items-center space-x-2">
              <Checkbox
                id="isPrivate"
                checked={newWorkspace.isPrivate}
                onCheckedChange={(checked) =>
                  setNewWorkspace({
                    ...newWorkspace,
                    isPrivate: checked as boolean,
                  })
                }
              />
              <label
                htmlFor="isPrivate"
                className="flex cursor-pointer items-center text-sm"
              >
                <span>Privat</span>
                <LockKeyholeIcon className="ml-1 h-3 w-3" />
              </label>
            </div>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Abbrechen
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Workspace anlegen
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
