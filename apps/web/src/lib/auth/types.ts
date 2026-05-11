export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  OPERATOR = 'OPERATOR',
  OWNER = 'OWNER',
  COLLABORATOR = 'COLLABORATOR',
}

export enum AppRoute {
  ADMIN = '/admin',
  LOGIN = '/login',
  DASHBOARD = '/dashboard',
}

export interface SupabaseUser {
  id: string;
  email: string;
  user_metadata: {
    role?: UserRole;
    first_name?: string;
    last_name?: string;
  };
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  user: UserInfo;
  organization?: OrganizationInfo;
}

export interface UserInfo {
  id: string;
  email: string;
  role: UserRole | null;
  org_id: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar: string | null;
  subtype: string | null;
  permissions?: Record<string, boolean>;
}

export interface OrganizationInfo {
  org_id: string;
  org_slug: string;
  org_name: string;
  specialties: string[];
}

export interface LoginResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  user: UserInfo;
  organization?: OrganizationInfo | null;
  dashboard_route?: string;
  message?: string;
  error?: string;
}

export class User {
  private organization: OrganizationInfo | null = null;

  constructor(private user: UserInfo, organization?: OrganizationInfo) {
    this.organization = organization || null;
  }

  isSuperadmin(): boolean {
    return this.user.role === UserRole.SUPERADMIN;
  }

  isOperator(): boolean {
    return this.user.role === UserRole.OPERATOR;
  }

  isClient(): boolean {
    return this.user.role === UserRole.OWNER;
  }

  isSubordinate(): boolean {
    return this.user.role === UserRole.COLLABORATOR;
  }

  isOwner(): boolean {
    return this.user.role === UserRole.OWNER;
  }

  isCollaborator(): boolean {
    return this.user.role === UserRole.COLLABORATOR;
  }

  isTenantUser(): boolean {
    return this.isClient() || this.isCollaborator();
  }

  isSaaSUser(): boolean {
    return this.isSuperadmin() || this.isOperator();
  }

  getDashboardRoute(): string {
    if (this.isSaaSUser()) {
      return AppRoute.ADMIN
    }
    if (this.organization?.org_slug) {
      return `/${this.organization.org_slug}/dashboard`
    }
    const first = this.user.first_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'user'
    return `/${first}/dashboard`
  }

  getRole(): UserRole | null {
    return this.user.role;
  }

  getFullName(): string {
    const first = this.user.first_name || '';
    const last = this.user.last_name || '';
    return `${first} ${last}`.trim() || this.user.email;
  }

  getOrgId(): string | null {
    return this.user.org_id;
  }

  getOrgSlug(): string | null {
    return this.organization?.org_slug || null;
  }

  getSpecialties(): string[] {
    return this.organization?.specialties || [];
  }
}

export function createUser(user: UserInfo, organization?: OrganizationInfo): User {
  return new User(user, organization);
}
