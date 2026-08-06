"use client";

import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationsDropdown } from "./NotificationsDropdown";

export function Topbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center px-2 md:pe-3">
        <SidebarTrigger />
        <div className="flex items-center gap-2 md:hidden"></div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <NotificationsDropdown />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
