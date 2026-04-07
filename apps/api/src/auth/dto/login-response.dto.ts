import { UserRole, AppRoute } from '../types/user.types';

export class LoginResponseDto {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  user: {
    id: string;
    email: string;
    role: UserRole | null;
    first_name: string | null;
    last_name: string | null;
  };
  dashboard_route: AppRoute;
  message: string;

  constructor(data: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    expires_at: number;
    user: {
      id: string;
      email: string;
      role: UserRole | null;
      first_name: string | null;
      last_name: string | null;
    };
  }) {
    this.access_token = data.access_token;
    this.refresh_token = data.refresh_token;
    this.expires_in = data.expires_in;
    this.expires_at = data.expires_at;
    this.user = data.user;
    this.dashboard_route = this.user.role === UserRole.SUPERADMIN || this.user.role === UserRole.OPERATOR
      ? AppRoute.ADMIN
      : AppRoute.TENANT;
    this.message = 'Login successful';
  }
}
