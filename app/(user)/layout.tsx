import { Topbar } from "@/components/layout/Topbar";
import { WorkspaceSidebar } from "@/components/layout/WorkspaceSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden">
        <WorkspaceSidebar />
        <div className="flex flex-1 flex-col">
          <Topbar />
          <div className="flex-1 overflow-auto p-3 md:p-5">{children}</div>
        </div>
      </div>
    </SidebarProvider>
  );
}
