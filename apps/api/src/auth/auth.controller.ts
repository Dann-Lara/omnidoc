import { Controller, Post, Body, HttpCode, HttpStatus, Logger, Res, ForbiddenException, UseGuards, Req, Put, Param } from '@nestjs/common';
import { flattenRolePermissions } from '../lib/permissions';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Response, Request } from 'express';
import { randomBytes } from 'crypto';
import { UserRole } from './types/user.types';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PrismaService } from '../database/prisma.service';
import { MailService } from '../mail/mail.service';
import { t } from '@/i18n/translations';

interface LoginResponseCookies {
  user: {
    id: string;
    email: string;
    role: string | null;
    org_id: string | null;
    first_name: string | null;
    last_name: string | null;
    subtype: string | null;
    avatar: string | null;
    permissions?: Record<string, boolean>;
  };
  organization: {
    org_id: string | null;
    org_slug: string | null;
    org_name: string | null;
    specialties: string[];
  } | null;
  dashboard_route?: string;
  message: string;
  error?: string;
}

interface SignupResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: {
    id: string;
    email: string;
    role?: UserRole;
    org_slug?: string;
    first_name?: string;
    last_name?: string;
  };
  message?: string;
  error?: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private readonly supabaseUrl: string;
  private readonly supabaseAdminKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {
    this.supabaseUrl = this.configService.get<string>('SUPABASE_URL') || 'http://localhost:9999';
    this.supabaseAdminKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') || this.configService.get<string>('SUPABASE_ANON_KEY') || '';
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { limit: 5 }, medium: { limit: 10 } })
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<LoginResponseCookies> {
    const { email, password } = body;

    this.logger.log(`Login attempt for email: ${email}`);

      if (!email || !password) {
        return { error: 'Email and password are required', message: '', user: { id: '', email: '', role: null, org_id: null, first_name: null, last_name: null, subtype: null, avatar: null }, organization: null };
      }

    try {
      const response = await fetch(`${this.supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseAdminKey,
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      const supabaseId = data.user?.id;

      if (!response.ok) {
        this.logger.warn(`Login failed for ${email}: ${JSON.stringify(data)}`);
        return {
          error: data.error_description || data.error || 'Invalid credentials',
          message: '',
          user: { id: '', email: '', role: null, org_id: null, first_name: null, last_name: null, subtype: null, avatar: null },
          organization: null,
        };
      }

      if (!supabaseId) {
        this.logger.warn(`Login failed: No supabase ID for ${email}`);
        return {
          error: 'Invalid user data',
          message: '',
          user: { id: '', email: '', role: null, org_id: null, first_name: null, last_name: null, subtype: null, avatar: null },
          organization: null,
        };
      }

      let dbRole: UserRole | null = null;
      let dbUserType: string | null = null;
      let dbSubtype: string | null = null;
      let dbOrgId: string | null = null;
      let dbOrgSlug: string | null = null;
      let dbOrgName: string | null = null;
      let dbSpecialties: string[] = [];
      let dbFirstName: string | null = null;
      let dbLastName: string | null = null;
      let dbAvatar: string | null = null;
      let dbUserExists = false;
      let localUser: any = null;

      if (supabaseId) {
        this.logger.log(`Looking up user with supabaseId: ${supabaseId}`);
        localUser = await this.prisma.user.findUnique({
          where: { supabaseId },
          include: { role: true, organization: true },
        });

        if (localUser) {
          dbUserExists = true;
          dbRole = localUser.role?.name as UserRole | null;
          dbUserType = localUser.userType;
          dbSubtype = localUser.subtype;
          dbOrgId = localUser.organizationId || null;
          dbOrgSlug = localUser.organization?.slug || null;
          dbOrgName = localUser.organization?.name || null;
          dbSpecialties = (localUser.organization as any)?.specialtyIds || [];
          dbFirstName = localUser.firstName || null;
          dbLastName = localUser.lastName || null;
          dbAvatar = localUser.avatar || null;
        } else {
          this.logger.warn(`User not found in database for supabaseId: ${supabaseId}`);
        }
      } else {
        this.logger.warn(`No supabaseId provided`);
      }

      if (!dbUserExists) {
        this.logger.warn(`Login failed: User ${email} not found in database`);
        return {
          error: 'Usuario no encontrado en el sistema. Por favor contacta al administrador.',
          message: '',
          user: { id: '', email: '', role: null, org_id: null, first_name: null, last_name: null, subtype: null, avatar: null },
          organization: null,
        };
      }

      const roleFromDb = dbRole ? dbRole as UserRole : this.extractRole(data.user?.user_metadata);
      const subtype = dbSubtype;
      const orgSlug = dbOrgSlug || data.user?.user_metadata?.org_slug as string | undefined;
      const orgName = dbOrgName;
      const orgId = dbOrgId;
      const specialties = dbSpecialties;
      const firstName = dbFirstName || data.user?.user_metadata?.first_name as string | undefined;

      // Para superadmin/operator, usar el role de la DB directamente
      const finalRole = roleFromDb === UserRole.SUPERADMIN || roleFromDb === UserRole.OPERATOR
        ? roleFromDb
        : (dbUserType || (roleFromDb === UserRole.OWNER || roleFromDb === UserRole.COLLABORATOR ? roleFromDb : (!dbUserExists && orgId ? UserRole.OWNER : null)));

      const isSaaSUser = finalRole === UserRole.SUPERADMIN || finalRole === UserRole.OPERATOR
      
      let dashboardRoute: string
      if (isSaaSUser) {
        dashboardRoute = '/admin'
      } else if (orgSlug) {
        dashboardRoute = `/${orgSlug}/dashboard`
      } else if (orgName) {
        dashboardRoute = `/${this.slugify(orgName)}/dashboard`
      } else if (firstName) {
        dashboardRoute = `/${this.slugify(firstName)}/dashboard`
      } else {
        dashboardRoute = `/${this.slugify(data.user?.email || 'user')}/dashboard`
      }

      this.logger.log(`Login successful for: ${email}, role: ${finalRole}, org_slug: ${orgSlug}, route: ${dashboardRoute}`);

      // Set HttpOnly cookies
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
        maxAge: data.expires_in * 1000,
      };

      res.cookie('sb-access-token', data.access_token, cookieOptions);
      res.cookie('sb-refresh-token', data.refresh_token, {
        ...cookieOptions,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Cookie accessible by JS for navigation
      if (orgSlug) {
        res.cookie('sb-org-slug', orgSlug, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict' as const,
          path: '/',
          maxAge: data.expires_in * 1000,
        });
      }
      if (orgName) {
        res.cookie('sb-org-name', orgName, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict' as const,
          path: '/',
          maxAge: data.expires_in * 1000,
        });
      }

      const organization = orgId ? {
        org_id: orgId,
        org_slug: orgSlug || null,
        org_name: orgName || null,
        specialties: specialties,
      } : null;

      // Set user role cookie for middleware
      res.cookie('sb-user-role', finalRole, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
        maxAge: data.expires_in * 1000,
      });

      let permissions: Record<string, boolean> | undefined
      if (localUser?.permissions && typeof localUser.permissions === 'object') {
        permissions = localUser.permissions as Record<string, boolean>
      } else if (localUser?.role?.permissions) {
        permissions = flattenRolePermissions(localUser.role.permissions as string[])
      }

      return {
        user: {
          id: data.user?.id || '',
          email: data.user?.email || '',
          role: finalRole,
          org_id: orgId,
          first_name: dbFirstName || data.user?.user_metadata?.first_name || null,
          last_name: dbLastName || data.user?.user_metadata?.last_name || null,
          subtype: subtype,
          avatar: dbAvatar,
          permissions,
        },
        organization,
        dashboard_route: dashboardRoute,
        message: 'Login successful',
      };
    } catch (error) {
      this.logger.error(`Login error: ${error}`);
      return {
        error: 'Authentication service unavailable',
        message: '',
        user: { id: '', email: '', role: null, org_id: null, first_name: null, last_name: null, subtype: null, avatar: null },
        organization: null,
      };
    }
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { limit: 3 }, medium: { limit: 5 } })
  @ApiOperation({ summary: 'Create a new user and organization' })
  @ApiResponse({ status: 201, description: 'User and organization created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async signup(
    @Body() body: SignupDto,
  ): Promise<SignupResponse> {
    const { email, password, firstName, lastName, orgName, specialties, lang } = body;

    this.logger.log(`Signup attempt for email: ${email}, org: ${orgName}`);

    if (!email || !password || !orgName) {
      return { error: 'Email, password, and organization name are required' };
    }

    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters' };
    }

    try {
      const orgSlug = this.generateSlug(orgName);

      this.logger.log(`Creating user in Supabase for: ${email}, org_slug: ${orgSlug}`);

      const signupResponse = await fetch(`${this.supabaseUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseAdminKey,
        },
        body: JSON.stringify({
          email,
          password,
          data: {
            first_name: firstName || '',
            last_name: lastName || '',
            org_name: orgName,
            org_slug: orgSlug,
            role: UserRole.OWNER,
          },
        }),
      });

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        this.logger.warn(`Signup failed for ${email}: ${JSON.stringify(signupData)}`);
        return { error: signupData.msg || signupData.error || 'Signup failed' };
      }

      const supabaseUserId = signupData.user?.id;

      this.logger.log(`User created in Supabase for: ${email}, supabaseId: ${supabaseUserId}`);

      let confirmToken: string | null = null;

      try {
        const freePlan = await this.prisma.plan.findFirst({
          where: { name: 'Free' },
        });

        const organization = await this.prisma.organization.create({
          data: {
            name: orgName,
            slug: orgSlug,
            type: body.orgType as 'INDIVIDUAL' | 'CLINIC' || 'INDIVIDUAL',
            planId: freePlan?.id,
            subscriptionStatus: 'TRIALING',
            specialtyIds: specialties && specialties.length > 0 ? specialties : [],
            settings: {
              lang: lang || 'es',
            },
          },
        });

        const ownerRole = await this.prisma.role.create({
          data: {
            organizationId: organization.id,
            name: 'owner',
            permissions: [
              'appointments:read',
              'appointments:write',
              'appointments:delete',
              'patients:read',
              'patients:write',
              'patients:sensitive',
              'users:manage',
              'roles:manage',
              'billing:manage',
              'analytics:view',
              'settings:manage',
            ],
            isDefault: true,
          },
        });

        await this.prisma.user.create({
          data: {
            supabaseId: supabaseUserId,
            organizationId: organization.id,
            roleId: ownerRole.id,
            email: email,
            firstName: firstName || '',
            lastName: lastName || '',
            userType: 'OWNER',
          },
        });

        this.logger.log(`Organization and user created in DB for: ${email}, org: ${orgSlug}, userId: ${supabaseUserId}`);

        confirmToken = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await this.prisma.invitation.create({
          data: {
            token: confirmToken,
            email: email,
            organizationId: organization.id,
            role: 'OWNER',
            status: 'PENDING',
            expiresAt,
            createdBy: supabaseUserId,
          },
        });

        await this.mailService.sendWelcomeEmail({
          to: email,
          firstName: firstName || '',
          orgName: orgName,
          confirmToken: confirmToken,
          lang: lang || 'es',
        });

        this.logger.log(`Welcome email sent to ${email}`);
      } catch (orgError) {
        this.logger.error(`Failed to create organization in DB: ${JSON.stringify(orgError)}`);
      }

      return {
        user: {
          id: supabaseUserId || '',
          email: email,
          role: UserRole.OWNER,
          org_slug: orgSlug,
          first_name: firstName || '',
          last_name: lastName || '',
        },
        message: 'User created successfully. Please check your email to confirm your account.',
      };
    } catch (error) {
      this.logger.error(`Signup error: ${error}`);
      return { error: 'Authentication service unavailable' };
    }
  }

  @Put('confirm-email/:token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm email with token' })
  @ApiResponse({ status: 200, description: 'Email confirmed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async confirmEmail(@Param('token') token: string) {
    this.logger.log(`Confirm email request for token: ${token}`);

    try {
      const invitation = await this.prisma.invitation.findUnique({
        where: { token },
      });

      if (!invitation) {
        this.logger.warn(`Invitation not found for token: ${token}`);
        return { error: 'Token inválido o expirado' };
      }

      if (invitation.expiresAt < new Date()) {
        this.logger.warn(`Invitation expired for token: ${token}`);
        return { error: 'Token expirado. Solicita un nuevo correo de confirmación.' };
      }

      if (invitation.status === 'ACCEPTED') {
        this.logger.warn(`Invitation already accepted for token: ${token}`);
        return { error: 'Este correo ya ha sido confirmado anteriormente' };
      }

      // Find user in Supabase by email and confirm
      const email = invitation.email;
      this.logger.log(`Confirming email in Supabase for: ${email}`);

      // Search for user by email using admin API
      const searchResponse = await fetch(
        `${this.supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}`,
        {
          method: 'GET',
          headers: {
            'apikey': this.supabaseAdminKey,
            'Authorization': `Bearer ${this.supabaseAdminKey}`,
          },
        }
      );

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        const users = searchData.users || [];
        
        if (users.length > 0) {
          const supabaseUserId = users[0].id;
          
          // Confirm user in Supabase
          const confirmResponse = await fetch(
            `${this.supabaseUrl}/auth/v1/admin/users/${supabaseUserId}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'apikey': this.supabaseAdminKey,
                'Authorization': `Bearer ${this.supabaseAdminKey}`,
              },
              body: JSON.stringify({
                email_confirm: true,
              }),
            }
          );

          if (confirmResponse.ok) {
            this.logger.log(`Email confirmed in Supabase for: ${email}`);
          } else {
            this.logger.warn(`Failed to confirm email in Supabase for: ${email}`);
          }
        } else {
          this.logger.warn(`User not found in Supabase for: ${email}`);
        }
      }

      // Update invitation status in local DB
      await this.prisma.invitation.update({
        where: { token },
        data: { status: 'ACCEPTED' },
      });

      this.logger.log(`Email confirmed successfully for: ${invitation.email}`);
      return { message: 'Email confirmado exitosamente. Ahora puedes iniciar sesión.' };
    } catch (error) {
      this.logger.error(`Error confirming email: ${error}`);
      return { error: 'Error al confirmar el email' };
    }
  }

  @Post('dev-login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @Throttle({ long: { limit: 1 } })
  @ApiOperation({ summary: 'Dev login - returns superadmin session' })
  async devLogin(@Res({ passthrough: true }) res: Response): Promise<LoginResponseCookies> {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException(t('errors.auth.devNotAvailable', 'es'));
    }
    
    const result = await this.login({
      email: 'superadmin@omnidoc.dev',
      password: 'dev-superadmin-123',
    }, res);
    
    return result;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset email' })
  @ApiResponse({ status: 200, description: 'Reset email sent if user exists' })
  async forgotPassword(@Body() body: { email?: string }): Promise<{ message: string; error?: string }> {
    const { email } = body;

    this.logger.log(`Password reset requested for: ${email}`);

    if (!email) {
      return { error: 'Email is required', message: '' };
    }

    try {
      const appUrl = this.configService.get<string>('APP_URL') || 'http://localhost:3000';
      
      const response = await fetch(`${this.supabaseUrl}/auth/v1/recover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseAdminKey,
        },
        body: JSON.stringify({
          email,
          options: {
            redirectTo: `${appUrl}/reset-password`,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        this.logger.warn(`Password reset failed for ${email}: ${JSON.stringify(data)}`);
        return { error: data.error_description || data.error || 'Failed to send reset email', message: '' };
      }

      this.logger.log(`Password reset email sent to: ${email}`);
      
      return { message: 'If an account exists with this email, a password reset link has been sent.' };
    } catch (error) {
      this.logger.error(`Password reset error: ${error}`);
      return { error: 'Authentication service unavailable', message: '' };
    }
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with access token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 401, description: 'Invalid or expired token' })
  async resetPassword(
    @Body() body: { access_token?: string; new_password?: string },
  ): Promise<{ message: string; error?: string }> {
    const { access_token, new_password } = body;

    this.logger.log(`Password reset attempt`);

    if (!access_token || !new_password) {
      return { error: 'Access token and new password are required', message: '' };
    }

    if (new_password.length < 8) {
      return { error: 'Password must be at least 8 characters', message: '' };
    }

    try {
      const response = await fetch(`${this.supabaseUrl}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.supabaseAdminKey,
          'Authorization': `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          password: new_password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        this.logger.warn(`Password reset failed: ${JSON.stringify(data)}`);
        return { error: data.error_description || data.error || 'Failed to reset password', message: '' };
      }

      this.logger.log(`Password reset successful`);
      
      return { message: 'Password has been reset successfully' };
    } catch (error) {
      this.logger.error(`Password reset error: ${error}`);
      return { error: 'Authentication service unavailable', message: '' };
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user and invalidate token' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string; error?: string }> {
    const accessToken = (req as Request & { cookies?: Record<string, string> }).cookies?.['sb-access-token'];

    this.logger.log(`Logout request`);

    try {
      if (accessToken) {
        await fetch(`${this.supabaseUrl}/auth/v1/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': this.supabaseAdminKey,
            'Authorization': `Bearer ${accessToken}`,
          },
        });
      }

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/',
        maxAge: 0,
      };

      res.cookie('sb-access-token', '', cookieOptions);
      res.cookie('sb-refresh-token', '', cookieOptions);
      res.cookie('sb-org-slug', '', { ...cookieOptions, maxAge: 0 });

      this.logger.log(`Logout successful`);
      return { message: 'Logged out successfully' };
    } catch (error) {
      this.logger.error(`Logout error: ${error}`);
      return { error: 'Logout failed', message: '' };
    }
  }

  private extractRole(metadata?: Record<string, unknown>): UserRole | null {
    if (!metadata) return null;
    const role = metadata.role;
    if (role && Object.values(UserRole).includes(role as UserRole)) {
      return role as UserRole;
    }
    return null;
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
  }
}
