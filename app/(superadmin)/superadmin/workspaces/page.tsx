"use client";

import React, { useState } from "react";
import { Workspace, NewWorkspace } from "./types";
import { WorkspaceDialog } from "./components/WorkspaceDialog";
import { WorkspaceTable } from "./components/WorkspaceTable";
import { workspaceService } from "../../../services/workspace.service";
import { toast } from "sonner";
import { PaginatedContent, ApiResponse } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// Typ für die paginierte Antwort von Workspaces
type WorkspacesResponse = ApiResponse<Workspace>;

const WorkspacesPage = () => {
  const [workspacesResponse, setWorkspacesResponse] =
    useState<WorkspacesResponse>({
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
  const [newWorkspace, setNewWorkspace] = useState<NewWorkspace>({
    name: "",
    domain: "",
    state: "",
    plan: "",
    isPrivate: false,
  });

  /**
   * Lädt alle Workspaces vom Server
   */
  const fetchWorkspaces = async (
    currentPage: number = workspacesResponse.meta.page,
  ) => {
    setIsLoading(true);

    try {
      const response =
        await workspaceService.getAllWorkspacesPaginated(currentPage);
      setWorkspacesResponse(response);
    } catch (error) {
      // Fehler werden bereits vom WorkspaceService und ApiException behandelt
      // Hier nur Logging für Debugging-Zwecke
      console.error("Fehler beim Laden der Workspaces:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchWorkspaces(workspacesResponse.meta.page);
  }, []);

  /**
   * Verarbeitet das Formular zum Erstellen eines Workspaces
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const createdWorkspace =
        await workspaceService.createWorkspace(newWorkspace);

      // Füge den neuen Workspace zur Liste hinzu
      setWorkspacesResponse((prev) => ({
        ...prev,
        data: [...prev.data, createdWorkspace],
        meta: {
          ...prev.meta,
          total: prev.meta.total + 1,
        },
      }));
      toast.success("Workspace erfolgreich erstellt");

      // Dialog schließen und Formular zurücksetzen
      setIsOpen(false);
      setNewWorkspace({
        name: "",
        domain: "",
        state: "",
        plan: "",
        isPrivate: false,
      });
    } catch (error) {
      // Fehler werden bereits vom WorkspaceService und ApiException behandelt
      // Hier nur Logging für Debugging-Zwecke
      console.error("Fehler beim Speichern des Workspaces:", error);
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
      setNewWorkspace({
        name: "",
        domain: "",
        state: "",
        plan: "",
        isPrivate: false,
      });
    }
  };

  return (
    <>
      <section className="p-4">
        <div className="space-y-6">
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 font-semibold leading-none tracking-tight">
              <span className="text-nowrap text-xl">Alle Workspaces</span>{" "}
              <div className="rounded border px-2 py-1">
                {workspacesResponse.meta.total}
              </div>
            </div>
            <div>
              <WorkspaceDialog
                isOpen={isOpen}
                onOpenChange={handleDialogOpenChange}
                onSubmit={handleSubmit}
                newWorkspace={newWorkspace}
                setNewWorkspace={setNewWorkspace}
              />
            </div>
          </div>

          {workspacesResponse.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="mb-4 text-muted-foreground">
                Es sind noch keine Workspaces vorhanden.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => setIsOpen(true)}>
                  Neuen Workspace anlegen <Plus className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <PaginatedContent
                response={workspacesResponse}
                onPageChange={fetchWorkspaces}
                renderContent={(workspaces) => (
                  <WorkspaceTable
                    workspaces={workspaces}
                    isLoading={isLoading}
                  />
                )}
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default WorkspacesPage;
