import * as React from "react";
import Image from "next/image";

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
import elephantIcon from "@/public/logos/elephant-icon.png";
// This is sample data.
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
        <div className="flex items-center gap-4">
          <Image
            src={elephantIcon}
            alt="Elephant Bookings Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-nowrap font-semibold">Elephant Bookings</span>
        </div>
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
