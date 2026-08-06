"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { AppSidebar } from "@/components/layout/SuperadminSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuthStore } from "@/app/stores/auth.store";
import { toast } from "sonner";

export default function SuperadminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { isSuperAdmin } = useAuthStore();

  // Überprüfe beim ersten Rendern, ob der Benutzer ein Superadmin ist
  useEffect(() => {
    // Wenn der Benutzer kein Superadmin ist, zeige eine Meldung und leite zurück
    if (!isSuperAdmin) {
      toast.error("Keine Berechtigung", {
        description: "Sie haben keine Berechtigung für diesen Bereich.",
      });
      router.push("/");
    }
  }, [isSuperAdmin, router]);

  // Wenn der Benutzer kein Superadmin ist, zeige nichts an (während des Weiterleitens)
  if (!isSuperAdmin) {
    return null;
  }

  // Wenn der Benutzer ein Superadmin ist, zeige den normalen Inhalt
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <Topbar />
          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
