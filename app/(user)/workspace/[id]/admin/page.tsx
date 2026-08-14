"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Workspace,
  NewWorkspace,
} from "../../../../(superadmin)/superadmin/workspaces/types";
import { WorkspaceUserTableData, NewWorkspaceUser } from "./types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { WorkspaceUserDialog } from "./components/WorkspaceUserDialog";
import { WorkspaceDetails } from "./components/WorkspaceDetails";
import { toast } from "sonner";
import { GenericUserTable } from "@/components/shared/tables/GenericUserTable";
import WorkspaceDetailsSkeleton from "./components/WorkspaceDetailsSkeleton";
import { workspaceService } from "@/app/services/workspace.service";
import { userService } from "@/app/services/user.service";
import { EWorkspaceRole } from "@/app/(superadmin)/superadmin/users/types";
import { WorkspaceUserCombobox } from "./components/WorkspaceUserCombobox";
import { User } from "@/app/(superadmin)/superadmin/users/types";
import { useAuthStore } from "@/app/stores/auth.store";
import { PaginatedContent, ApiResponse } from "@/components/shared/pagination";
import { InviteUserDialog } from "./components/InviteUserDialog";
import { JoinRequestsDropdown } from "./components/JoinRequestsDropdown";

// Typ für die paginierte Antwort von Benutzern in einem Workspace
type WorkspaceUsersResponse = ApiResponse<WorkspaceUserTableData>;

const WorkspaceDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [workspaceUsersResponse, setWorkspaceUsersResponse] =
    useState<WorkspaceUsersResponse>({
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    });
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Zustand für den Benutzer-Dialog
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<WorkspaceUserTableData | null>(
    null,
  );
  const [newUser, setNewUser] = useState<NewWorkspaceUser>({
    firstName: "",
    lastName: "",
    email: "",
    role: EWorkspaceRole.MEMBER,
  });

  const [isComboboxOpen, setIsComboboxOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  // Auth Store Selektoren für Berechtigungen
  const isSuperAdmin = useAuthStore((state) => state.isSuperAdmin);
  const hasWorkspaceRole = useAuthStore((state) => state.hasWorkspaceRole);

  // Berechtigungsprüfungen
  const canEdit = isSuperAdmin || hasWorkspaceRole(workspaceId, "OWNER");
  const canManageUsers =
    isSuperAdmin ||
    hasWorkspaceRole(workspaceId, "OWNER") ||
    hasWorkspaceRole(workspaceId, "ADMIN");
  const canDeleteUsers = isSuperAdmin || hasWorkspaceRole(workspaceId, "OWNER");

  // Neue Berechtigungsprüfungen für die Tabelle
  const canEditUser = () => {
    if (isSuperAdmin) return true;
    if (hasWorkspaceRole(workspaceId, "OWNER")) return true;
    return false;
  };

  const canDeleteUser = (user: { role: EWorkspaceRole }) => {
    if (isSuperAdmin) return true;
    if (hasWorkspaceRole(workspaceId, "OWNER")) return true;
    if (
      hasWorkspaceRole(workspaceId, "ADMIN") &&
      user.role === EWorkspaceRole.MEMBER
    )
      return true;
    return false;
  };

  /**
   * Lädt den Workspace vom Server
   */
  const fetchWorkspace = async () => {
    setIsLoading(true);

    try {
      const data = await workspaceService.getWorkspaceById(workspaceId);
      setWorkspace(data);
    } catch (error) {
      // Fehler werden bereits vom WorkspaceService und ApiException behandelt
      // Hier nur Logging für Debugging-Zwecke
      console.error("Fehler beim Laden des Workspaces:", error);

      // Bei Fehler zur Workspace-Übersicht zurückkehren
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Lädt die Benutzer des Workspaces vom Server
   */
  const fetchWorkspaceUsers = async (
    currentPage: number = workspaceUsersResponse.meta.page,
  ) => {
    setIsLoadingUsers(true);

    try {
      const response = await workspaceService.getWorkspaceUsers(
        workspaceId,
        currentPage,
      );

      // Transformiere die Server-Antwort in das erwartete Format der GenericUserTable
      const transformedUsers: WorkspaceUserTableData[] = response.data.map(
        (workspaceUser) => ({
          id: workspaceUser.user.id,
          firstName: workspaceUser.user.firstName,
          lastName: workspaceUser.user.lastName,
          email: workspaceUser.user.email,
          role: workspaceUser.roles[0] || EWorkspaceRole.MEMBER,
          workspaces: [], // Da wir die Workspace-Informationen hier nicht haben
          originalUser: workspaceUser.user,
        }),
      );

      setWorkspaceUsersResponse({
        data: transformedUsers,
        meta: response.meta,
      });
    } catch (error) {
      // Fehler werden bereits vom WorkspaceService und ApiException behandelt
      // Hier nur Logging für Debugging-Zwecke
      console.error("Fehler beim Laden der Workspace-Benutzer:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchWorkspace();
    fetchWorkspaceUsers(workspaceUsersResponse.meta.page);
  }, [workspaceId]);

  /**
   * Speichert Änderungen am Workspace
   */
  const handleSave = async (updatedWorkspace: NewWorkspace) => {
    setIsSaving(true);

    try {
      const updated = await workspaceService.updateWorkspace(
        workspaceId,
        updatedWorkspace,
      );

      setWorkspace(updated);
      toast.success("Workspace erfolgreich gespeichert");
    } catch (error) {
      // Fehler werden bereits vom WorkspaceService und ApiException behandelt
      // Hier nur Logging für Debugging-Zwecke
      console.error("Fehler beim Speichern des Workspaces:", error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Öffnet den Dialog zum Bearbeiten eines Benutzers
   */
  const handleEdit = (userTableData: WorkspaceUserTableData) => {
    setEditingUser(userTableData);
    setNewUser({
      firstName: userTableData.firstName,
      lastName: userTableData.lastName,
      email: userTableData.email,
      role: userTableData.role,
    });
    setIsUserDialogOpen(true);
  };

  /**
   * Entfernt einen Benutzer aus dem Workspace
   */
  const handleDeleteUser = async (user: WorkspaceUserTableData) => {
    try {
      await workspaceService.deleteWorkspaceUser(
        workspaceId,
        user.originalUser.id,
      );

      // Aktualisiere die lokalen Daten
      setWorkspaceUsersResponse((prev) => ({
        ...prev,
        data: prev.data.filter((u) => u.id !== user.id),
        meta: {
          ...prev.meta,
          total: prev.meta.total - 1,
        },
      }));

      toast.success("Benutzer erfolgreich aus dem Workspace entfernt");
    } catch (error) {
      // Fehler werden bereits vom WorkspaceService und ApiException behandelt
      // Hier nur Logging für Debugging-Zwecke
      console.error(
        "Fehler beim Entfernen des Benutzers aus dem Workspace:",
        error,
      );
    }
  };

  /**
   * Fügt einen bestehenden Benutzer zum Workspace hinzu
   */
  const handleUserSelect = async (user: User, role: EWorkspaceRole) => {
    setIsLoadingUsers(true);
    try {
      await workspaceService.addWorkspaceUser(workspaceId, user.id, {
        role: role,
      });

      await fetchWorkspaceUsers();
      toast.success("Benutzer erfolgreich hinzugefügt");
    } catch (error) {
      // Fehler werden bereits vom WorkspaceService und ApiException behandelt
      // Hier nur Logging für Debugging-Zwecke
      console.error("Fehler beim Hinzufügen des Benutzers:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  /**
   * Öffnet den Dialog zum Einladen eines neuen Benutzers
   */
  const handleInviteUser = (email: string) => {
    setInviteEmail(email);
    setIsInviteDialogOpen(true);
  };

  /**
   * Callback nach erfolgreicher Einladung
   */
  const handleInviteSuccess = () => {
    // Nach einer erfolgreichen Einladung aktualisieren wir die Benutzerliste,
    // damit wir die passenden Icons für eingeladene Benutzer anzeigen können
    fetchWorkspaceUsers(workspaceUsersResponse.meta.page);
    setInviteEmail("");
  };

  /**
   * Behandelt das Öffnen und Schließen des Dialogs
   */
  const handleDialogOpenChange = (open: boolean) => {
    setIsUserDialogOpen(open);
    if (!open) {
      setEditingUser(null);
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        role: EWorkspaceRole.MEMBER,
      });
    }
  };

  /**
   * Verarbeitet das Formular zum Erstellen oder Aktualisieren eines Benutzers
   */
  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingUsers(true);

    try {
      if (editingUser) {
        // Aktualisiere nur die Rolle des Benutzers
        await workspaceService.updateWorkspaceUserRoles(
          workspaceId,
          editingUser.id,
          [newUser.role],
        );

        // Aktualisiere den lokalen State
        setWorkspaceUsersResponse((prev) => ({
          ...prev,
          data: prev.data.map((user) =>
            user.id === editingUser.id ? { ...user, role: newUser.role } : user,
          ),
        }));

        toast.success("Benutzerrolle erfolgreich aktualisiert");
      } else {
        // Erstelle einen neuen Benutzer und ordne ihn dem Workspace zu
        const createdUser = await userService.createWorkspaceUser(
          {
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
          },
          workspaceId,
          newUser.role,
        );

        toast.success("Benutzer erfolgreich erstellt", {
          description: `${createdUser.firstName} ${createdUser.lastName} wurde hinzugefügt`,
        });

        // Aktualisiere die Benutzerliste
        await fetchWorkspaceUsers();
      }

      // Dialog schließen und Formular zurücksetzen
      setIsUserDialogOpen(false);
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        role: EWorkspaceRole.MEMBER,
      });
      setEditingUser(null);
    } catch (error) {
      // Fehler werden bereits vom UserService und ApiException behandelt
      // Hier nur Logging für Debugging-Zwecke
      console.error("Fehler beim Speichern des Benutzers:", error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const getRoleInfo = (user: WorkspaceUserTableData) => {
    const role = user.role;
    if (role === EWorkspaceRole.ADMIN) {
      return {
        label: "Administrator",
        className:
          "bg-purple-100/50 text-purple-900 dark:bg-purple-300/50 dark:text-purple-100",
      };
    } else if (role === EWorkspaceRole.MEMBER) {
      return {
        label: "Mitglied",
        className:
          "bg-green-100/50 text-green-900 dark:bg-green-300/50 dark:text-green-100",
      };
    } else if (role === EWorkspaceRole.OWNER) {
      return {
        label: "Besitzer",
        className:
          "bg-orange-100/50 text-orange-900 dark:bg-orange-300/50 dark:text-orange-100",
      };
    } else {
      return {
        label: role,
        className:
          "bg-gray-100/50 text-gray-900 dark:bg-gray-300/50 dark:text-gray-100",
      };
    }
  };

  const handleGenericEdit = (user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    workspaces?: { id: string; name: string; workspaceRole: string }[];
  }) => {
    // Finde den originalen WorkspaceUserTableData
    const originalUser = workspaceUsersResponse.data.find(
      (wu) => wu.id === user.id.toString(),
    );
    if (originalUser) {
      handleEdit(originalUser);
    }
  };

  const handleGenericDelete = async (user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    workspaces?: { id: string; name: string; workspaceRole: string }[];
  }) => {
    // Finde den originalen WorkspaceUserTableData
    const originalUser = workspaceUsersResponse.data.find(
      (wu) => wu.id === user.id.toString(),
    );
    if (originalUser) {
      await handleDeleteUser(originalUser);
    }
  };

  const getGenericRoleInfo = (user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    workspaces?: { id: string; name: string; workspaceRole: string }[];
  }) => {
    // Finde den originalen WorkspaceUserTableData
    const originalUser = workspaceUsersResponse.data.find(
      (wu) => wu.id === user.id.toString(),
    );
    if (originalUser) {
      return getRoleInfo(originalUser);
    }
    return {
      label: "Unbekannt",
      className:
        "bg-gray-100/50 text-gray-900 dark:bg-gray-300/50 dark:text-gray-100",
    };
  };

  /**
   * Behandelt die Annahme einer Beitrittsanfrage und fügt den Benutzer direkt zur Tabelle hinzu
   */
  const handleUserApproved = (user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    role: EWorkspaceRole;
  }) => {
    // Prüfen, ob der Benutzer bereits in der Tabelle vorhanden ist
    if (workspaceUsersResponse.data.some((u) => u.id === user.id)) {
      return;
    }

    // Neuen Benutzer zum lokalen State hinzufügen
    const newUserTableData: WorkspaceUserTableData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      workspaces: [],
      originalUser: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: false, // Standardwert, da wir diesen nicht kennen
        hasPendingInvitation: false,
        globalRoles: [], // Erforderliches Feld hinzufügen
      },
    };

    // Aktualisiere die lokalen Daten
    setWorkspaceUsersResponse((prev) => ({
      ...prev,
      data: [...prev.data, newUserTableData],
      meta: {
        ...prev.meta,
        total: prev.meta.total + 1,
      },
    }));
  };

  if (isLoading) {
    return (
      <section className="p-4">
        <WorkspaceDetailsSkeleton />
      </section>
    );
  }

  if (!workspace) {
    router.push("/superadmin/workspaces");
    return (
      <section className="p-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Workspace nicht gefunden</h1>
        </div>
      </section>
    );
  }

  return (
    <section className="p-4">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{workspace.name}</h1>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <WorkspaceDetails
            workspace={workspace}
            onSave={handleSave}
            isSaving={isSaving}
            canEdit={canEdit}
            isSuperAdmin={isSuperAdmin}
          />

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-4 text-nowrap">
                  <span>Benutzer in diesem Workspace</span>{" "}
                  <div className="rounded border px-2 py-1">
                    {workspaceUsersResponse.meta.total}
                  </div>
                </CardTitle>
                {workspaceUsersResponse.data.length > 0 && canManageUsers && (
                  <div className="flex space-x-4">
                    <JoinRequestsDropdown
                      workspaceId={workspaceId}
                      onUserApproved={handleUserApproved}
                    />
                    <WorkspaceUserCombobox
                      workspaceId={workspaceId}
                      onUserSelect={handleUserSelect}
                      onCreateNew={handleInviteUser}
                      open={isComboboxOpen}
                      onOpenChange={setIsComboboxOpen}
                      alignPopover="end"
                      currentWorkspaceUsers={workspaceUsersResponse.data.map(
                        (user) => user.id,
                      )}
                      isSuperAdmin={isSuperAdmin}
                    />
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {workspaceUsersResponse.data.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="mb-4 text-muted-foreground">
                    Diesem Workspace sind noch keine Benutzer zugeordnet.
                  </p>
                  {canManageUsers && (
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <JoinRequestsDropdown
                        workspaceId={workspaceId}
                        onUserApproved={handleUserApproved}
                      />
                      <WorkspaceUserCombobox
                        workspaceId={workspaceId}
                        onUserSelect={handleUserSelect}
                        onCreateNew={handleInviteUser}
                        open={isComboboxOpen}
                        onOpenChange={setIsComboboxOpen}
                        currentWorkspaceUsers={[]}
                        isSuperAdmin={isSuperAdmin}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <PaginatedContent
                  response={workspaceUsersResponse}
                  onPageChange={fetchWorkspaceUsers}
                  renderContent={(users) => (
                    <GenericUserTable
                      users={users.map((user) => ({
                        id: parseInt(user.id),
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        emailVerified: user.originalUser.emailVerified,
                        hasPendingInvitation:
                          user.originalUser.hasPendingInvitation,
                        workspaces: user.workspaces.map((ws) => ({
                          id: ws.id,
                          name: ws.name,
                          workspaceRole: ws.role,
                        })),
                        role: user.role,
                        originalUser: user.originalUser,
                      }))}
                      onEdit={handleGenericEdit}
                      onDelete={handleGenericDelete}
                      isLoading={isLoadingUsers}
                      getRoleInfo={getGenericRoleInfo}
                      columns={{
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true,
                        workspaces: false,
                        actions: canManageUsers || canDeleteUsers,
                      }}
                      columnLabels={{
                        role: "Workspace-Rolle",
                      }}
                      canEditUser={canEditUser}
                      canDeleteUser={canDeleteUser}
                    />
                  )}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {canManageUsers && (
          <>
            <WorkspaceUserDialog
              isOpen={isUserDialogOpen}
              onOpenChange={handleDialogOpenChange}
              onSubmit={handleUserSubmit}
              editingUser={editingUser}
              newUser={newUser}
              setNewUser={setNewUser}
            />
            <InviteUserDialog
              isOpen={isInviteDialogOpen}
              onOpenChange={setIsInviteDialogOpen}
              email={inviteEmail}
              workspaceId={workspaceId}
              onInviteSuccess={handleInviteSuccess}
            />
          </>
        )}
      </div>
    </section>
  );
};

export default WorkspaceDetailPage;
