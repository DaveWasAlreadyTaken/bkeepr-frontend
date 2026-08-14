"use client";

import * as React from "react";
import { Home, Settings, Video, GalleryVerticalEndIcon, Users, BellRing } from "lucide-react";
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
import { useHasHydrated } from "@/hooks/use-has-hydrated";

export function WorkspaceSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { hasWorkspaceRole, isSuperAdmin } = useAuthStore();
  const hasHydrated = useHasHydrated();

  const workspaceIdMatch = pathname.match(/\/workspace\/([^\/]+)/);
  const workspaceId = workspaceIdMatch ? workspaceIdMatch[1] : "";

  // Rollen kommen aus dem localStorage-persistierten Auth-Store, der erst nach
  // dem Mount verfügbar ist. Vor `hasHydrated` immer false rendern, sonst
  // weicht die erste Client-Röhre von der SSR-Ausgabe ab (Hydration-Fehler).
  const isAdminOrOwner =
    hasHydrated &&
    (hasWorkspaceRole(workspaceId, "OWNER") ||
      hasWorkspaceRole(workspaceId, "ADMIN"));
  const showSuperadmin = hasHydrated && isSuperAdmin;

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
              title="Volk"
              icon={<Home className="h-4 w-4" />}
            />
            <SidebarMenuActiveBtn
              href={`/workspace/${workspaceId}/devices`}
              title="Anlage"
              icon={<Video className="h-4 w-4" />}
            />
            <SidebarMenuActiveBtn
              href={`/workspace/${workspaceId}/alerts`}
              title="Alerts"
              icon={<BellRing className="h-4 w-4" />}
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

        {showSuperadmin && (
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
