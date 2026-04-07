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
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  email: string;
  role: UserRole | null;
  first_name: string | null;
  last_name: string | null;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  user: UserInfo;
  dashboard_route: AppRoute;
  message: string;
  error?: string;
}

export class User {
  constructor(private user: UserInfo) {}

  isSuperadmin(): boolean {
    return this.user.role === UserRole.SUPERADMIN;
  }

  isOperator(): boolean {
    return this.user.role === UserRole.OPERATOR;
  }

  isClient(): boolean {
    return this.user.role === UserRole.CLIENT;
  }

  isSubordinate(): boolean {
    return this.user.role === UserRole.SUBORDINATE;
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

  getRole(): UserRole | null {
    return this.user.role;
  }

  getFullName(): string {
    const first = this.user.first_name || '';
    const last = this.user.last_name || '';
    return `${first} ${last}`.trim() || this.user.email;
  }
}

export function createUser(user: UserInfo): User {
  return new User(user);
}
