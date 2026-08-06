import { TableCell, TableRow } from "@/components/ui/table";
import { Workspace } from "../types";
import { useRouter } from "next/navigation";

interface WorkspaceTableRowProps {
  workspace: Workspace;
}

export const WorkspaceTableRow = ({ workspace }: WorkspaceTableRowProps) => {
  const router = useRouter();

  return (
    <TableRow
      className="group cursor-pointer hover:bg-muted/50"
      onClick={() => {
        router.push(`/workspace/${workspace.id}/admin`);
      }}
    >
      <TableCell className="py-3 text-muted-foreground">
        {workspace.id}
      </TableCell>
      <TableCell className="py-3">
        <div className="flex items-center group-hover:underline">
          {workspace.name}
        </div>
      </TableCell>
      <TableCell className="py-3">{workspace.domain}</TableCell>
      <TableCell className="py-3">
        <span
          className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${
            workspace.state === "ACTIVE"
              ? "bg-green-200/50 text-green-900 dark:bg-green-300/50 dark:text-green-100"
              : workspace.state === "PENDING"
                ? "bg-yellow-200/50 text-yellow-900 dark:bg-yellow-300/50 dark:text-yellow-100"
                : workspace.state === "INACTIVE"
                  ? "bg-red-200/50 text-red-900 dark:bg-red-300/50 dark:text-red-100"
                  : "bg-gray-200/50 text-gray-900 dark:bg-gray-300/50 dark:text-gray-100"
          }`}
        >
          {workspace.state === "ACTIVE"
            ? "Aktiv"
            : workspace.state === "PENDING"
              ? "Ausstehend"
              : workspace.state === "INACTIVE"
                ? "Inaktiv"
                : workspace.state}
        </span>
      </TableCell>
      <TableCell className="py-3">
        {new Date(workspace.createdAt).toLocaleDateString("de-DE")}
      </TableCell>
      <TableCell className="py-3">
        <span className="rounded-full bg-blue-100/50 px-2 py-1 text-xs font-medium capitalize text-blue-900 dark:bg-blue-300/50 dark:text-blue-100">
          {workspace.plan === "FREE"
            ? "Kostenlos"
            : workspace.plan === "BASIC"
              ? "Basic"
              : workspace.plan === "PREMIUM"
                ? "Premium"
                : workspace.plan === "ENTERPRISE"
                  ? "Enterprise"
                  : workspace.plan}
        </span>
      </TableCell>
    </TableRow>
  );
};
