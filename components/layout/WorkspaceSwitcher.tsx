"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Store } from "lucide-react";
import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/app/stores/auth.store";

export function WorkspaceSwitcher() {
  const { isMobile } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { user, getWorkspaceRole } = useAuthStore();

  // Extrahiere die aktuelle Workspace-ID aus dem Pfad
  const workspaceIdMatch = pathname.match(/\/workspace\/([^\/]+)/);
  const currentWorkspaceId = workspaceIdMatch ? workspaceIdMatch[1] : "";

  // Hole die Workspaces aus dem Auth Store
  const workspaces = user?.workspaces || [];

  // Aktuelle Rolle direkt aus dem Auth-Store
  const currentRole = currentWorkspaceId
    ? getWorkspaceRole(currentWorkspaceId)
    : null;

  // Finde den aktiven Workspace anhand der ID aus der URL, oder falle auf
  // den ersten Workspace zurück, wenn keiner zur URL passt.
  const activeWorkspace = React.useMemo<{
    id: string;
    name: string;
    role: string;
    logo?: React.ElementType | string;
  } | null>(() => {
    if (workspaces.length === 0) return null;

    const workspace =
      workspaces.find((ws) => ws.id === currentWorkspaceId) ?? workspaces[0];

    // WICHTIG: Verwende immer die Rolle aus dem Auth-Store
    const role = getWorkspaceRole(workspace.id) || workspace.role;

    return { ...workspace, role, logo: Store };
  }, [currentWorkspaceId, workspaces, getWorkspaceRole]);

  // Wechsle zu einem anderen Workspace
  const handleWorkspaceChange = (workspace: {
    id: string;
    name: string;
    role: string;
  }) => {
    // Navigiere zum neuen Workspace
    router.push(`/workspace/${workspace.id}`);
  };

  // Wenn kein Workspace vorhanden ist oder der User nicht eingeloggt ist
  if (!activeWorkspace || workspaces.length === 0) {
    return null;
  }

  // Der anzuzeigende Workspace mit der aktuellen Rolle aus dem Auth-Store
  const displayWorkspace = {
    ...activeWorkspace,
    // Überschreibe die Rolle mit der aktuellen Rolle aus dem Auth-Store
    role: currentRole || activeWorkspace.role,
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                {displayWorkspace.logo ? (
                  typeof displayWorkspace.logo === "string" ? (
                    <Image
                      src={displayWorkspace.logo}
                      alt={`${displayWorkspace.name} Logo`}
                      width={24}
                      height={24}
                      className="size-5 object-contain"
                    />
                  ) : (
                    <displayWorkspace.logo className="size-5" />
                  )
                ) : (
                  <Store className="size-5" />
                )}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {displayWorkspace.name}
                </span>
                <span className="truncate text-xs capitalize">
                  {displayWorkspace.role}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Workspaces
            </DropdownMenuLabel>
            {workspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => handleWorkspaceChange(workspace)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  {displayWorkspace.logo ? (
                    typeof displayWorkspace.logo === "string" ? (
                      <Image
                        src={displayWorkspace.logo}
                        alt={`${workspace.name} Logo`}
                        width={24}
                        height={24}
                        className="size-4 object-contain"
                      />
                    ) : (
                      <displayWorkspace.logo className="size-4" />
                    )
                  ) : (
                    <Store className="size-4" />
                  )}
                </div>
                {workspace.name}
                {/* <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut> */}
              </DropdownMenuItem>
            ))}
            {user?.role === "SUPERADMIN" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 p-2"
                  onClick={() => router.push("/superadmin/workspaces")}
                >
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">
                    Workspace erstellen
                  </div>
                </DropdownMenuItem>
              </>
            )}

            {/* <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => router.push("/")}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Home className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Zurück zur Startseite
              </div>
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
