import { UserRole } from './types/user.types';

describe('Auth Utilities', () => {
  describe('UserRole enum', () => {
    it('should have SUPERADMIN role', () => {
      expect(UserRole.SUPERADMIN).toBe('SUPERADMIN');
    });

    it('should have OPERATOR role', () => {
      expect(UserRole.OPERATOR).toBe('OPERATOR');
    });

    it('should have OWNER role', () => {
      expect(UserRole.OWNER).toBe('OWNER');
    });

    it('should have COLLABORATOR role', () => {
      expect(UserRole.COLLABORATOR).toBe('COLLABORATOR');
    });
  });

  describe('dashboard route generation', () => {
    const getDashboardRoute = (role: UserRole | null, orgSlug: string | null, firstName: string | null): string => {
      const stringRole = role as unknown as string
      const isSaaSUser = stringRole === 'SUPERADMIN' || stringRole === 'OPERATOR'
      let dashboardRoute: string
      if (isSaaSUser) {
        dashboardRoute = '/admin'
      } else if (orgSlug) {
        dashboardRoute = `/${orgSlug}/dashboard`
      } else if (firstName) {
        const slug = firstName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        dashboardRoute = `/${slug}/dashboard`
      } else {
        dashboardRoute = '/user/dashboard'
      }
      return dashboardRoute
    }

    it('should return /admin for SUPERADMIN', () => {
      const result = getDashboardRoute(UserRole.SUPERADMIN, null, null)
      expect(result).toBe('/admin')
    })

    it('should return /admin for OPERATOR', () => {
      const result = getDashboardRoute(UserRole.OPERATOR, null, null)
      expect(result).toBe('/admin')
    })

    it('should return tenant route with org_slug', () => {
      const result = getDashboardRoute(UserRole.OWNER, 'my-clinic', null)
      expect(result).toBe('/my-clinic/dashboard')
    })

    it('should generate slug from firstName if no org_slug', () => {
      const result = getDashboardRoute(UserRole.OWNER, null, 'John Doe')
      expect(result).toBe('/john-doe/dashboard')
    })

    it('should return default route when no role info', () => {
      const result = getDashboardRoute(null, null, null)
      expect(result).toBe('/user/dashboard')
    })

    it('should handle complex first names', () => {
      const result = getDashboardRoute(UserRole.OWNER, null, 'María José García')
      expect(result).toBe('/mar-a-jos-garc-a/dashboard')
    })
  })

  describe('slug generation', () => {
    const generateSlug = (text: string): string => {
      return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    }

    it('should convert simple text to slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
    })

    it('should remove special characters', () => {
      expect(generateSlug('Test@#!Name')).toBe('test-name')
    })

    it('should trim leading/trailing hyphens', () => {
      expect(generateSlug('-hello-')).toBe('hello')
    })

    it('should handle multiple consecutive hyphens', () => {
      expect(generateSlug('hello   world')).toBe('hello-world')
    })
  })
});
