// Enums
export enum EWorkspaceRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  OWNER = "OWNER",
  // Fügen Sie weitere Rollen hinzu, die im Backend definiert sind
}

export enum EGlobalRole {
  SUPERADMIN = "SUPERADMIN",
  USER = "USER",
  // Fügen Sie weitere globale Rollen hinzu, die im Backend definiert sind
}

// Interfaces für die API-Responses
export interface Role {
  id: string;
  name: EGlobalRole;
}

export interface UserWorkspace {
  id: string;
  name: string;
  role: EWorkspaceRole;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified?: boolean;
  hasPendingInvitation?: boolean;
  createdAt: string;
  globalRoles: Role[];
  workspaces: UserWorkspace[];
}

// DTOs für Requests
export interface NewUser {
  email: string;
  firstName: string;
  lastName: string;
  roleIds?: string[];
}

export interface WorkspaceAssignment {
  workspaceId: string;
  role: EWorkspaceRole;
}

export interface UpdateUser {
  email?: string;
  firstName?: string;
  lastName?: string;
  roleIds?: string[];
  workspaces?: WorkspaceAssignment[]; // Ersetzt workspaceRole
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
