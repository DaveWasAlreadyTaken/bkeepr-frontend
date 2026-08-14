import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { GalleryVerticalEndIcon, Users } from "lucide-react";
import { SidebarMenuActiveBtn } from "./SidebarMenuActiveBtn";
import { BKeeprLogo } from "./BKeeprLogo";

const data = {
  navMain: [
    {
      title: "Administration",
      url: "#",
      items: [
        {
          title: "Workspaces",
          url: "/superadmin/workspaces",
          icon: GalleryVerticalEndIcon,
          isActive: true,
        },
        {
          title: "Users",
          url: "/superadmin/users",
          icon: Users,
          isActive: false,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="mt-2">
        <BKeeprLogo />
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuActiveBtn
                      href={item.url}
                      title={item.title}
                      icon={<item.icon className="h-5 w-5" />}
                    />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
