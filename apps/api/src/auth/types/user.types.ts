export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  OPERATOR = 'OPERATOR',
  CLIENT = 'CLIENT',
  SUBORDINATE = 'SUBORDINATE',
}

export enum AppRoute {
  ADMIN = '/admin',
  TENANT = '/tenant',
  LOGIN = '/login',
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
  user: SupabaseUser;
}

export class User {
  constructor(private user: SupabaseUser) {}

  isSuperadmin(): boolean {
    return this.user.user_metadata?.role === UserRole.SUPERADMIN;
  }

  isOperator(): boolean {
    return this.user.user_metadata?.role === UserRole.OPERATOR;
  }

  isClient(): boolean {
    return this.user.user_metadata?.role === UserRole.CLIENT;
  }

  isSubordinate(): boolean {
    return this.user.user_metadata?.role === UserRole.SUBORDINATE;
  }

  isSaaSUser(): boolean {
    return this.isSuperadmin() || this.isOperator();
  }

  isTenantUser(): boolean {
    return this.isClient() || this.isSubordinate();
  }

  getDashboardRoute(): AppRoute {
    return this.isSaaSUser() ? AppRoute.ADMIN : AppRoute.TENANT;
  }

  getRole(): UserRole | undefined {
    return this.user.user_metadata?.role;
  }

  getFullName(): string {
    const first = this.user.user_metadata?.first_name || '';
    const last = this.user.user_metadata?.last_name || '';
    return `${first} ${last}`.trim() || this.user.email;
  }
}
