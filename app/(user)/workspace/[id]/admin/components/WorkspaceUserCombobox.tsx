"use client";

import * as React from "react";
import { Check, LoaderCircle, Mail, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@/app/(superadmin)/superadmin/users/types";
import { userService } from "@/app/services/user.service";
import { EWorkspaceRole } from "@/app/(superadmin)/superadmin/users/types";
import { workspaceService } from "@/app/services/workspace.service";
import { ServerWorkspaceUser } from "@/app/(user)/workspace/[id]/admin/types";

interface WorkspaceUserComboboxProps {
  workspaceId: string;
  onUserSelect: (user: User, role: EWorkspaceRole) => void;
  onCreateNew: (email: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alignPopover?: "center" | "start" | "end" | undefined;
  currentWorkspaceUsers: string[]; // IDs der aktuellen Workspace-Benutzer
  isSuperAdmin: boolean; // Neue Prop: Ist der aktuelle Benutzer ein Superadmin?
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

// Helper-Funktion zur Überprüfung einer gültigen E-Mail-Adresse
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function WorkspaceUserCombobox({
  workspaceId,
  onUserSelect,
  onCreateNew,
  open,
  onOpenChange,
  alignPopover,
  currentWorkspaceUsers,
  isSuperAdmin,
}: WorkspaceUserComboboxProps) {
  const [searchValue, setSearchValue] = React.useState("");
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [existingWorkspaceEmails, setExistingWorkspaceEmails] = React.useState<
    string[]
  >([]);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [selectedRoles, setSelectedRoles] = React.useState<
    Record<string, EWorkspaceRole>
  >({});

  // Lade E-Mails der bestehenden Workspace-Benutzer
  React.useEffect(() => {
    const loadExistingEmails = async () => {
      try {
        const numericWorkspaceId = workspaceId.replace(/\D/g, "");
        const workspaceUsers =
          await workspaceService.getWorkspaceUsers(numericWorkspaceId);
        const emails =
          workspaceUsers?.data?.map((user: ServerWorkspaceUser) =>
            user.user.email.toLowerCase(),
          ) || [];
        setExistingWorkspaceEmails(emails);
      } catch (error) {
        console.error("Fehler beim Laden der Workspace-Benutzer:", error);
      }
    };

    if (open) {
      loadExistingEmails();
    }
  }, [workspaceId, open]);

  // Benutzersuche wenn Suchtext eingegeben wird
  const searchUsers = React.useCallback(
    async (query: string) => {
      if (!query) {
        // loadAllUsers nur für Superadmins ausführen
        if (isSuperAdmin) {
          await loadAllUsers();
        } else {
          setUsers([]);
        }
        return;
      }

      // Für normale Workspace-Benutzer (Owner/Admin) nur suchen, wenn eine gültige E-Mail eingegeben wurde
      if (!isSuperAdmin && !isValidEmail(query)) {
        setUsers([]);
        return;
      }

      try {
        setIsLoading(true);
        const numericWorkspaceId = workspaceId.replace(/\D/g, "");
        const results = await userService.searchUsers(
          query,
          numericWorkspaceId,
        );
        // Filtere Benutzer, die bereits im Workspace sind
        const filteredResults =
          results?.filter((user) => !currentWorkspaceUsers.includes(user.id)) ||
          [];
        setUsers(filteredResults);
      } catch (error) {
        console.error("Fehler bei der Benutzersuche:", error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    },
    [workspaceId, currentWorkspaceUsers, isSuperAdmin],
  );

  // Lade alle verfügbaren Benutzer
  const loadAllUsers = async () => {
    // Wenn kein Superadmin, dann keine Benutzer ohne Suche anzeigen
    if (!isSuperAdmin) {
      setUsers([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await userService.getAllUsers(1, 5);
      // Filtere Benutzer, die bereits im Workspace sind
      const filteredResults =
        response?.data?.filter(
          (user) => !currentWorkspaceUsers.includes(user.id),
        ) || [];
      setUsers(filteredResults);
    } catch (error) {
      console.error("Fehler beim Laden der Benutzer:", error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce für die Suche
  React.useEffect(() => {
    if (!open) return; // Nur suchen wenn die Combobox offen ist

    const debounceTimeout = setTimeout(() => {
      if (searchValue) {
        searchUsers(searchValue);
      } else {
        loadAllUsers();
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [searchValue, searchUsers, open]);

  // Benutzer auswählen und Fokus setzen
  const handleSelect = React.useCallback(
    (userId: string) => {
      const selectedUser = users.find((user) => user.id === userId);
      if (selectedUser) {
        const role = selectedRoles[userId] || EWorkspaceRole.MEMBER;
        onUserSelect(selectedUser, role);
        onOpenChange(false);
        setSearchValue("");
        setSelectedRoles({});
        setTimeout(() => triggerRef.current?.focus(), 0);
      }
    },
    [users, onUserSelect, onOpenChange, selectedRoles],
  );

  // Handler für Rollenänderungen
  const handleRoleChange = (userId: string, role: EWorkspaceRole) => {
    setSelectedRoles((prev) => ({
      ...prev,
      [userId]: role,
    }));
  };

  // Verhindere Propagation des Klick-Events für das Select
  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedRoles({});
      setUsers([]);
    }
    onOpenChange(newOpen);
  };

  // Prüfen, ob wir den "Benutzer erstellen" Button anzeigen sollten
  const isEmailAlreadyInWorkspace = React.useMemo(() => {
    if (!searchValue || !isValidEmail(searchValue)) return false;
    return existingWorkspaceEmails.includes(searchValue.toLowerCase());
  }, [searchValue, existingWorkspaceEmails]);

  const shouldShowCreateButton =
    !isLoading &&
    users.length === 0 &&
    isValidEmail(searchValue) &&
    !isEmailAlreadyInWorkspace;

  // Handler für den "Benutzer erstellen" Button
  const handleCreateNew = () => {
    onCreateNew(searchValue);
    onOpenChange(false);
    setSearchValue("");
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          role="combobox"
          aria-expanded={open}
          className="justify-between"
        >
          Benutzer hinzufügen
          <Plus className="ml-2 h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full p-2 md:min-w-[600px]"
        align={alignPopover}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={
              isSuperAdmin
                ? "Nach Name oder E-Mail suchen..."
                : "Bitte geben Sie eine vollständige E-Mail Adresse ein..."
            }
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-6 text-sm">
                <span>Lade Benutzer</span>
                <LoaderCircle className="animate-spin" />
              </div>
            )}

            {!isLoading && users.length === 0 && (
              <div className="flex flex-col gap-2 p-2">
                <p className="py-2 text-center text-sm text-muted-foreground">
                  {isSuperAdmin
                    ? isEmailAlreadyInWorkspace
                      ? "Dieser Benutzer ist bereits Teil des Workspaces"
                      : "Keine Benutzer gefunden"
                    : isValidEmail(searchValue)
                      ? isEmailAlreadyInWorkspace
                        ? "Dieser Benutzer ist bereits Teil des Workspaces"
                        : "Keine Benutzer mit dieser E-Mail gefunden"
                      : "Bitte geben Sie eine vollständige E-Mail Adresse ein"}
                </p>
              </div>
            )}

            {users.length > 0 && (
              <CommandGroup>
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    onSelect={() => handleSelect(user.id)}
                    value={user.id}
                    className="flex flex-col items-start"
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center">
                        <Check className={cn("mr-2 h-4 w-4", "opacity-0")} />
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </div>
                      <div onClick={handleSelectClick}>
                        <Select
                          value={
                            selectedRoles[user.id] || EWorkspaceRole.MEMBER
                          }
                          onValueChange={(value: EWorkspaceRole) =>
                            handleRoleChange(user.id, value)
                          }
                        >
                          <SelectTrigger className="h-8 w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.values(EWorkspaceRole).map((role) => (
                              <SelectItem key={role} value={role}>
                                {getRoleLabel(role)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
        {shouldShowCreateButton && (
          <Button
            onClick={handleCreateNew}
            size="sm"
            variant="outline"
            className="mt-6 w-full"
          >
            {searchValue} einladen
            <Mail className="h-4 w-4" />
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
