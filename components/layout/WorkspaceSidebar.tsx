"use client";

import * as React from "react";
import {
  FileText,
  Calendar,
  Users,
  Settings,
  Home,
  Briefcase,
  GalleryVerticalEndIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { SidebarMenuActiveBtn } from "./SidebarMenuActiveBtn";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { NavUser } from "./NavUser";
import { useAuthStore } from "@/app/stores/auth.store";

export function WorkspaceSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { hasWorkspaceRole, isSuperAdmin } = useAuthStore();

  // Extrahiere die Workspace-ID aus dem Pfad (Format: /workspace/{id}/...)
  const workspaceIdMatch = pathname.match(/\/workspace\/([^\/]+)/);
  const workspaceId = workspaceIdMatch ? workspaceIdMatch[1] : "";

  // Prüfe, ob der Benutzer Admin oder Owner im aktuellen Workspace ist
  const isAdminOrOwner =
    hasWorkspaceRole(workspaceId, "OWNER") ||
    hasWorkspaceRole(workspaceId, "ADMIN");

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <WorkspaceSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Hauptmenü</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuActiveBtn
              href={`/workspace/${workspaceId}`}
              title="Dashboard"
              icon={<Home className="h-4 w-4" />}
            />
            <SidebarMenuActiveBtn
              href={`/workspace/${workspaceId}/calendar`}
              title="Kalender"
              icon={<Calendar className="h-4 w-4" />}
            />
            <SidebarMenuActiveBtn
              href={`/workspace/${workspaceId}/bookings`}
              title="Buchungen"
              icon={<FileText className="h-4 w-4" />}
            />
            <SidebarMenuActiveBtn
              href={`/workspace/${workspaceId}/resources`}
              title="Ressourcen"
              icon={<Briefcase className="h-4 w-4" />}
            />
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Verwaltung</SidebarGroupLabel>
          <SidebarMenu>
            {isAdminOrOwner && (
              <SidebarMenuActiveBtn
                href={`/workspace/${workspaceId}/admin`}
                title="Workspace Einstellungen"
                icon={<Settings className="h-4 w-4" />}
              />
            )}
          </SidebarMenu>
        </SidebarGroup>

        {isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Superadmin</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuActiveBtn
                href="/superadmin/workspaces"
                title="Workspaces"
                icon={<GalleryVerticalEndIcon className="h-4 w-4" />}
              />
              <SidebarMenuActiveBtn
                href="/superadmin/users"
                title="Users"
                icon={<Users className="h-4 w-4" />}
              />
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
