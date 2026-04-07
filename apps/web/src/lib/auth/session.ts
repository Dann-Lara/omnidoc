import { UserInfo, LoginResponse } from './types';

const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: 'sb-access-token',
  REFRESH_TOKEN: 'sb-refresh-token',
  USER: 'sb-user',
  ROLE: 'sb-role',
  EMAIL: 'sb-email',
  USER_ID: 'sb-user-id',
} as const;

export function saveAuthSession(session: LoginResponse): void {
  localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, session.access_token);
  localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, session.refresh_token);
  localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(session.user));
  localStorage.setItem(AUTH_STORAGE_KEYS.ROLE, session.user.role || '');
  localStorage.setItem(AUTH_STORAGE_KEYS.EMAIL, session.user.email);
  localStorage.setItem(AUTH_STORAGE_KEYS.USER_ID, session.user.id);
}

export function clearAuthSession(): void {
  Object.values(AUTH_STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

export function getStoredUser(): UserInfo | null {
  const userStr = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as UserInfo;
  } catch {
    return null;
  }
}

export function getStoredRole(): string | null {
  return localStorage.getItem(AUTH_STORAGE_KEYS.ROLE);
}

export function getStoredUserId(): string | null {
  return localStorage.getItem(AUTH_STORAGE_KEYS.USER_ID);
}

export function isAuthenticated(): boolean {
  return !!getStoredUserId();
}
