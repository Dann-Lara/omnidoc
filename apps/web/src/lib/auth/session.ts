import { UserInfo, OrganizationInfo, LoginResponse } from './types';

const AUTH_STORAGE_KEYS = {
  USER: 'sb-user',
  ROLE: 'sb-role',
  EMAIL: 'sb-email',
  USER_ID: 'sb-user-id',
  ORG_ID: 'sb-org-id',
  ORG_SLUG: 'sb-org-slug',
  ORG_NAME: 'sb-org-name',
  SPECIALTIES: 'sb-specialties',
  PERMISSIONS: 'sb-permissions',
} as const;

export function saveAuthSession(session: LoginResponse): void {
  if (session.user) {
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(session.user));
    localStorage.setItem(AUTH_STORAGE_KEYS.USER_ID, session.user.id);
    localStorage.setItem(AUTH_STORAGE_KEYS.ROLE, session.user.role || '');
    localStorage.setItem(AUTH_STORAGE_KEYS.EMAIL, session.user.email);
    localStorage.setItem(AUTH_STORAGE_KEYS.ORG_ID, session.user.org_id || '');
    if (session.user.permissions) {
      localStorage.setItem(AUTH_STORAGE_KEYS.PERMISSIONS, JSON.stringify(session.user.permissions));
    }
  }
  if (session.organization) {
    localStorage.setItem(AUTH_STORAGE_KEYS.ORG_ID, session.organization.org_id);
    localStorage.setItem(AUTH_STORAGE_KEYS.ORG_SLUG, session.organization.org_slug || '');
    localStorage.setItem(AUTH_STORAGE_KEYS.ORG_NAME, session.organization.org_name || '');
    localStorage.setItem(AUTH_STORAGE_KEYS.SPECIALTIES, JSON.stringify(session.organization.specialties || []));
  }
}

export function clearAuthSession(): void {
  Object.values(AUTH_STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

export function getStoredUser(): UserInfo | null {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as UserInfo;
  } catch {
    return null;
  }
}

export function getStoredRole(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS.ROLE);
}

export function getStoredUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS.USER_ID);
}

export function isAuthenticated(): boolean {
  return !!getStoredUserId();
}

export function getStoredOrgId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS.ORG_ID);
}

export function getStoredOrgSlug(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS.ORG_SLUG);
}

export function getStoredOrgName(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_STORAGE_KEYS.ORG_NAME);
}

export function getStoredSpecialties(): string[] {
  if (typeof window === 'undefined') return [];
  const specialtiesStr = localStorage.getItem(AUTH_STORAGE_KEYS.SPECIALTIES);
  if (!specialtiesStr) return [];
  try {
    return JSON.parse(specialtiesStr) as string[];
  } catch {
    return [];
  }
}
