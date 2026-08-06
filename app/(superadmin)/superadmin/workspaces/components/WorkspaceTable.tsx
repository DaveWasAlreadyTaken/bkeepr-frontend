import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Workspace } from "../types";
import { WorkspaceTableRow } from "./WorkspaceTableRow";
import { WorkspaceTableSkeleton } from "./WorkspaceTableSkeleton";

interface WorkspaceTableProps {
  workspaces: Workspace[];
  isLoading?: boolean;
}

export const WorkspaceTable = ({
  workspaces,
  isLoading = false,
}: WorkspaceTableProps) => {
  return (
    <Card>
      <CardContent className="mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Erstellt am</TableHead>
              <TableHead>Plan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <WorkspaceTableSkeleton />
            ) : (
              workspaces.map((workspace) => (
                <WorkspaceTableRow key={workspace.id} workspace={workspace} />
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
