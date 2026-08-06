import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { GenericUserTableRow } from "./GenericUserTableRow";
import { GenericUserTableSkeleton } from "./GenericUserTableSkeleton";

export interface RoleInfo {
  label: string;
  className: string;
}

export interface GenericUserTableProps<T> {
  users: T[];
  onEdit?: (user: T) => void;
  onDelete?: (user: T) => void;
  isLoading?: boolean;
  getRoleInfo: (user: T) => RoleInfo;
  columns?: {
    id?: boolean;
    firstName?: boolean;
    lastName?: boolean;
    email?: boolean;
    role?: boolean;
    workspaces?: boolean;
    actions?: boolean;
  };
  columnLabels?: {
    role?: string;
    workspaces?: string;
  };
  canEditUser?: (user: T) => boolean;
  canDeleteUser?: (user: T) => boolean;
}

export function GenericUserTable<
  T extends {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    emailVerified?: boolean;
    hasPendingInvitation?: boolean;
    workspaces?: Array<{
      id: string;
      name: string;
      workspaceRole: string;
    }>;
  },
>({
  users,
  onEdit,
  onDelete,
  isLoading = false,
  getRoleInfo,
  columns = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    role: true,
    workspaces: true,
    actions: true,
  },
  columnLabels = {},
  canEditUser,
  canDeleteUser,
}: GenericUserTableProps<T>) {
  // Feste Spaltenbeschriftungen
  const fixedColumnLabels = {
    id: "#",
    firstName: "Vorname",
    lastName: "Nachname",
    email: "E-Mail",
    workspaces: "Workspaces",
    actions: "Aktionen",
  };

  return (
    <Card>
      <CardContent className="mt-4 px-4">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.id && <TableHead>{fixedColumnLabels.id}</TableHead>}
              {columns.firstName && (
                <TableHead>{fixedColumnLabels.firstName}</TableHead>
              )}
              {columns.lastName && (
                <TableHead>{fixedColumnLabels.lastName}</TableHead>
              )}
              {columns.email && (
                <TableHead>{fixedColumnLabels.email}</TableHead>
              )}
              {columns.role && <TableHead>{columnLabels.role}</TableHead>}
              {columns.workspaces && (
                <TableHead>{fixedColumnLabels.workspaces}</TableHead>
              )}
              {columns.actions && (
                <TableHead className="w-[100px]">
                  {fixedColumnLabels.actions}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <GenericUserTableSkeleton
                columns={Object.values(columns).filter(Boolean).length}
              />
            ) : (
              users.map((user) => (
                <GenericUserTableRow
                  key={user.id}
                  user={user}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  getRoleInfo={getRoleInfo}
                  columns={columns}
                  canEditUser={canEditUser}
                  canDeleteUser={canDeleteUser}
                />
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
