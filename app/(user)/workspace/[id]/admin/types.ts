// Enums
export enum EWorkspaceRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  OWNER = "OWNER",
  // Weitere Rollen aus dem Backend hinzufügen
}

export enum EGlobalRole {
  ADMIN = "ADMIN",
  USER = "USER",
  // Weitere globale Rollen aus dem Backend hinzufügen
}

// Basis-Interfaces
export interface Role {
  id: string;
  name: EGlobalRole;
}

export interface Workspace {
  id: string;
  name: string;
  role: EWorkspaceRole;
}

// Server Response Interface
export interface ServerWorkspaceUser {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    emailVerified?: boolean;
    hasPendingInvitation?: boolean;
    globalRoles: {
      id: string;
      name: string;
    }[];
  };
  roles: EWorkspaceRole[];
}

// Table Data Interface
export interface WorkspaceUserTableData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified?: boolean;
  hasPendingInvitation?: boolean;
  role: EWorkspaceRole;
  workspaces: Workspace[];
  originalUser: ServerWorkspaceUser["user"];
}

// Workspace User Interface
export interface WorkspaceUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: EWorkspaceRole;
}

// New Workspace User Interface
export interface NewWorkspaceUser {
  firstName: string;
  lastName: string;
  email: string;
  role: EWorkspaceRole;
}

// Workspace Assignment Interface (für Updates)
export interface WorkspaceAssignment {
  workspaceId: string;
  role: EWorkspaceRole;
}
