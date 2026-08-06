"use client";

import { ReactNode, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/app/stores/auth.store";

interface WorkspaceLayoutProps {
  children: ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const params = useParams();
  const router = useRouter();
  const { user, isSuperAdmin } = useAuthStore();
  const workspaceId = params.id as string;

  useEffect(() => {
    // SUPERADMINs haben immer Zugriff, auch wenn sie nicht Mitglied des Workspaces sind
    if (isSuperAdmin) {
      return;
    }

    // Für normale Benutzer: Prüfen, ob der Benutzer Mitglied im aktuellen Workspace ist
    if (user) {
      const isMember = user.workspaces.some(
        (workspace) => workspace.id === workspaceId,
      );

      if (!isMember) {
        // Wenn der Benutzer kein Mitglied ist, zur Access-Seite weiterleiten
        router.push(`/workspace/${workspaceId}/access`);
      }
    }
  }, [user, workspaceId, router, isSuperAdmin]);

  // Wenn die Access-Prüfung erfolgreich ist, rendern wir die Unterseiten
  return <>{children}</>;
}
