"use client";

import React, { useState } from "react";
import { User, NewUser, EGlobalRole } from "./types";
import { UserDialog } from "./components/UserDialog";
import { GenericUserTable } from "@/components/shared/tables/GenericUserTable";
import { PaginatedContent, ApiResponse } from "@/components/shared/pagination";
import { userService } from "@/app/services/user.service";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InviteUserDialog } from "@/app/(user)/workspace/[id]/admin/components/InviteUserDialog";

// Hilfsobjekt für die Anzeige in der Tabelle
interface UserTableData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified?: boolean;
  hasPendingInvitation?: boolean;
  role: string;
  workspaces: Array<{
    id: string;
    name: string;
    workspaceRole: string;
  }>;
  originalUser: User;
}

// Definiert den Typ für die API-Antwort mit UserTableData
type UsersResponse = ApiResponse<UserTableData>;

const UsersPage = () => {
  const [userResponse, setUserResponse] = useState<UsersResponse>({
    data: [],
    meta: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<NewUser>({
    firstName: "",
    lastName: "",
    email: "",
    roleIds: [],
  });

  React.useEffect(() => {
    fetchUsers(userResponse.meta.page);
  }, []);

  /**
   * Lädt alle Benutzer vom Server
   */
  const fetchUsers = async (currentPage: number) => {
    setIsLoading(true);

    try {
      const response = await userService.getAllUsers(currentPage);

      // Transformiere die Backend-Daten für die GenericUserTable
      const tableData: UserTableData[] = response.data.map((user) => ({
        id: parseInt(user.id),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        emailVerified: user.emailVerified,
        hasPendingInvitation: user.hasPendingInvitation,
        role: user.globalRoles?.map((r) => r.name).join(", ") || "",
        workspaces:
          user.workspaces?.map((ws) => ({
            id: ws.id,
            name: ws.name,
            workspaceRole: ws.role,
          })) || [],
        originalUser: user,
      }));

      setUserResponse({
        data: tableData,
        meta: response.meta,
      });
    } catch (error) {
      console.error("Fehler beim Laden der Benutzer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verarbeitet das Formular zum Erstellen oder Aktualisieren eines Benutzers
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingUser) {
        // Bearbeiten eines vorhandenen Benutzers
        const updatedUser = await userService.updateUser(editingUser.id, {
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          roleIds: newUser.roleIds,
        });

        // Aktualisiere den Benutzer direkt im lokalen State
        setUserResponse((prev) => ({
          ...prev,
          data: prev.data.map((user) =>
            user.id === parseInt(updatedUser.id)
              ? {
                  id: parseInt(updatedUser.id),
                  firstName: updatedUser.firstName,
                  lastName: updatedUser.lastName,
                  email: updatedUser.email,
                  emailVerified: updatedUser.emailVerified,
                  hasPendingInvitation: updatedUser.hasPendingInvitation,
                  role: updatedUser.globalRoles.map((r) => r.name).join(", "),
                  workspaces: updatedUser.workspaces.map((ws) => ({
                    id: ws.id,
                    name: ws.name,
                    workspaceRole: ws.role,
                  })),
                  originalUser: updatedUser,
                }
              : user,
          ),
        }));

        toast.success("Benutzer erfolgreich aktualisiert", {
          description: `${updatedUser.firstName} ${updatedUser.lastName} wurde aktualisiert`,
        });
      } else {
        // Hinzufügen eines neuen Benutzers
        const userToCreate = {
          ...newUser,
          globalRoles: {
            connect: [{ id: "2" }], // Standard-Rolle "USER" (ID: 2)
          },
        };

        const createdUser = await userService.createUser(userToCreate);

        // Füge den neuen Benutzer direkt zum lokalen State hinzu
        const newTableData: UserTableData = {
          id: parseInt(createdUser.id),
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          email: createdUser.email,
          emailVerified: createdUser.emailVerified,
          hasPendingInvitation: createdUser.hasPendingInvitation,
          role: createdUser.globalRoles.map((r) => r.name).join(", "),
          workspaces: createdUser.workspaces.map((ws) => ({
            id: ws.id,
            name: ws.name,
            workspaceRole: ws.role,
          })),
          originalUser: createdUser,
        };

        setUserResponse((prev) => ({
          ...prev,
          data: [...prev.data, newTableData],
          meta: {
            ...prev.meta,
            total: prev.meta.total + 1,
          },
        }));

        toast.success("Benutzer erfolgreich erstellt", {
          description: `${createdUser.firstName} ${createdUser.lastName} wurde hinzugefügt`,
        });
      }

      // Dialog schließen und Formular zurücksetzen
      setIsOpen(false);
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        roleIds: [],
      });
      setEditingUser(null);
    } catch (error) {
      // Fehler werden bereits vom ApiService und UserService behandelt
      // Hier nur Logging für Debugging-Zwecke
      console.error("Fehler beim Speichern des Benutzers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Öffnet den Dialog zum Bearbeiten eines Benutzers
   */
  const handleEdit = (userTableData: UserTableData) => {
    // Verwende die originale User-Datenstruktur für die Bearbeitung
    const user = userTableData.originalUser;
    console.log("Benutzer bearbeiten:", user.firstName, user.lastName);
    setEditingUser(user);
    setNewUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roleIds: user.globalRoles.map((role) => role.id),
    });
    setIsOpen(true);
  };

  /**
   * Löscht einen Benutzer
   */
  const handleDelete = async (userTableData: UserTableData) => {
    setIsLoading(true);

    try {
      await userService.deleteUser(userTableData.originalUser.id);

      // Entferne den Benutzer direkt aus dem lokalen State
      setUserResponse((prev) => ({
        ...prev,
        data: prev.data.filter((user) => user.id !== userTableData.id),
        meta: {
          ...prev.meta,
          total: prev.meta.total - 1,
        },
      }));

      toast.success("Benutzer erfolgreich gelöscht", {
        description: `${userTableData.firstName} ${userTableData.lastName} wurde gelöscht`,
      });
    } catch (error) {
      // Fehler werden bereits vom ApiService und UserService behandelt
      // Hier nur Logging für Debugging-Zwecke
      console.error("Fehler beim Löschen des Benutzers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Behandelt das Öffnen und Schließen des Dialogs
   */
  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setEditingUser(null);
      setNewUser({
        firstName: "",
        lastName: "",
        email: "",
        roleIds: [],
      });
    }
  };

  /**
   * Bestimmt die Anzeige der Rolle für einen Benutzer
   */
  const getRoleInfo = (user: UserTableData) => {
    // Finde die höchste Rolle für die Anzeige
    const roles = user.originalUser.globalRoles;

    if (roles.some((r) => r.name === EGlobalRole.SUPERADMIN)) {
      return {
        label: "Superadmin",
        className:
          "bg-orange-200/50 text-orange-900 dark:bg-orange-400/50 dark:text-white",
      };
    } else if (roles.some((r) => r.name === EGlobalRole.USER)) {
      return {
        label: "User",
        className:
          "bg-yellow-200/50 text-yellow-900 dark:bg-yellow-400/50 dark:text-white",
      };
    } else {
      return {
        label: user.role,
        className:
          "bg-gray-200/50 text-gray-900 dark:bg-gray-300/50 dark:text-white",
      };
    }
  };

  return (
    <>
      <section className="p-4">
        <div className="space-y-6">
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 font-semibold leading-none tracking-tight">
              <span className="text-nowrap text-xl">Alle Benutzer</span>{" "}
              <div className="rounded border px-2 py-1">
                {userResponse.meta.total}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={() => setIsInviteOpen(true)}>
                Benutzer einladen <Mail className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {userResponse.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="mb-4 text-muted-foreground">
                Es sind noch keine Benutzer vorhanden.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => setIsInviteOpen(true)}>
                  Benutzer einladen <Mail className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <PaginatedContent
                response={userResponse}
                onPageChange={fetchUsers}
                renderContent={(users) => (
                  <GenericUserTable
                    users={users}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isLoading={isLoading}
                    getRoleInfo={getRoleInfo}
                    columns={{
                      id: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                      role: true,
                      workspaces: true,
                      actions: true,
                    }}
                    columnLabels={{
                      role: "Globale Rolle",
                    }}
                    canEditUser={() => true}
                    canDeleteUser={() => true}
                  />
                )}
              />
            </div>
          )}
        </div>
      </section>

      <InviteUserDialog
        isOpen={isInviteOpen}
        onOpenChange={setIsInviteOpen}
        workspaceId=""
        onInviteSuccess={() => fetchUsers(userResponse.meta.page)}
      />

      {/* Dialog für Benutzerbearbeitung, nicht mehr als Trigger verwendet */}
      <UserDialog
        isOpen={isOpen}
        onOpenChange={handleDialogOpenChange}
        onSubmit={handleSubmit}
        editingUser={editingUser}
        newUser={newUser}
        setNewUser={setNewUser}
      />
    </>
  );
};

export default UsersPage;
