import { Observable } from 'rxjs';

/** CP-Auth Organization plugin roles — maps to Kaguzi capability tiers */
export type CpAuthOrgRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  workspaceId?: string;
  externalId?: string;
  /** Set when CP-Auth org plugin is active; takes precedence over role for capability checks */
  orgRole?: CpAuthOrgRole;
  /** Seat limit enforced by checking this against the subscription tier */
  orgMemberCount?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface IAuthService {
  readonly currentUser$: Observable<CurrentUser | null>;
  readonly isAuthenticated$: Observable<boolean>;
  readonly token: string | null;
  readonly currentUser: CurrentUser | null;
  readonly isAuthenticated: boolean;
  login(credentials: LoginRequest): Observable<unknown>;
  logout(): void;
  refreshProfile(): Observable<CurrentUser | null>;
  register(data: RegisterRequest): Observable<unknown>;
}

export interface IWorkspaceService {
  readonly workspaceId$: Observable<string | null>;
  readonly workspaceId: string | null;
}

export interface ICapabilityService {
  isCapable(capability: string): Observable<boolean>;
  isCapableSync(capability: string): boolean;
}

export interface QuestionTypeDefinition {
  type: string;
  label: string;
  icon: string;
  description: string;
  category: 'input' | 'choice' | 'advanced' | 'media';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: any;
}

export interface UiExtension {
  slot: 'builder-toolbar' | 'dashboard-header' | 'analytics-page';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: any;
  priority?: number;
}

export interface AuthRoutes {
  login: string;
  register: string;
  dashboard: string;
}

export interface AppEnvironment {
  production: boolean;
  apiUrl: string;
  sentryDsn?: string;
  authProviderUrl?: string;
  features?: {
    workspaces?: boolean;
    externalAuth?: boolean;
    customQuestionTypes?: boolean;
    uiExtensions?: boolean;
  };
}
