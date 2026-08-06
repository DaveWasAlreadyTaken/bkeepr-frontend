import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, User, MailQuestion, MailOpen } from "lucide-react";
import Link from "next/link";
import { RoleInfo } from "./GenericUserTable";
import { useAuthStore } from "@/app/stores/auth.store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GenericUserTableRowProps<T> {
  user: T;
  onEdit?: (user: T) => void;
  onDelete?: (user: T) => void;
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
  canEditUser?: (user: T) => boolean;
  canDeleteUser?: (user: T) => boolean;
}

export function GenericUserTableRow<
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
  user,
  onEdit,
  onDelete,
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
  canEditUser,
  canDeleteUser,
}: GenericUserTableRowProps<T>) {
  const roleInfo = getRoleInfo(user);
  const currentUser = useAuthStore((state) => state.user);
  const isCurrentUser = currentUser?.email === user.email;

  // Prüfe die Berechtigungen für die Buttons
  const showEditButton = onEdit && canEditUser?.(user);
  const showDeleteButton = onDelete && canDeleteUser?.(user);

  return (
    <TableRow className="group hover:bg-muted/50">
      {columns.id && (
        <TableCell className="text-muted-foreground">
          <div className="flex items-center gap-4">
            {user.id}
            {isCurrentUser && (
              <span title="Das sind Sie">
                <User className="h-4 w-4 text-primary" />
              </span>
            )}
          </div>
        </TableCell>
      )}
      {columns.firstName && (
        <TableCell className="py-3">{user.firstName}</TableCell>
      )}
      {columns.lastName && (
        <TableCell className="py-3">{user.lastName}</TableCell>
      )}
      {columns.email && (
        <TableCell className="py-3">
          <div className="flex items-center gap-2">
            {user.email}
            {user.hasPendingInvitation ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <MailOpen className="h-4 w-4 text-amber-500" />
                  </TooltipTrigger>
                  <TooltipContent>
                    Bestätigung der Einladung ausstehend
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              !user.emailVerified && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <MailQuestion className="h-4 w-4 text-amber-500" />
                    </TooltipTrigger>
                    <TooltipContent>E-Mail noch nicht bestätigt</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )
            )}
          </div>
        </TableCell>
      )}
      {columns.role && (
        <TableCell className="py-3">
          <span
            className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${roleInfo.className}`}
          >
            {roleInfo.label}
          </span>
        </TableCell>
      )}
      {columns.workspaces && (
        <TableCell>
          <div className="flex flex-wrap gap-1">
            {user.workspaces?.map((workspace) => (
              <Link
                key={workspace.id}
                href={`/workspace/${workspace.id}/admin`}
                className="text-nowrap rounded-full bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
              >
                <span>{workspace.name}</span>
              </Link>
            ))}
          </div>
        </TableCell>
      )}
      {columns.actions && (showEditButton || showDeleteButton) && (
        <TableCell>
          <div className="flex space-x-1">
            {showEditButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(user)}
                tooltip="Bearbeiten"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {showDeleteButton && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600"
                    tooltip="Benutzer entfernen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Benutzer löschen</AlertDialogTitle>
                    <AlertDialogDescription>
                      Möchten Sie den Benutzer {user.firstName} {user.lastName}{" "}
                      wirklich löschen? Diese Aktion kann nicht rückgängig
                      gemacht werden.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(user)}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" /> Löschen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </TableCell>
      )}
    </TableRow>
  );
}
