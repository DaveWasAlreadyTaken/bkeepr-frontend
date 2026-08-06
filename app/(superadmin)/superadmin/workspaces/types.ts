export interface Workspace {
  id: string;
  name: string;
  domain: string;
  state: string;
  createdAt: string;
  plan: string;
  isPrivate: boolean;
}

export interface NewWorkspace {
  name: string;
  domain: string;
  state: string;
  plan: string;
  isPrivate: boolean;
}
