import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private prisma: PrismaService) {}

  async getGlobalLang(): Promise<{ lang: 'en' | 'es' }> {
    try {
      const systemSettings = await this.prisma.systemSettings.findUnique({
        where: { id: 'global' },
      });

      if (systemSettings) {
        return { lang: systemSettings.lang as 'en' | 'es' };
      }

      // Create default if not exists
      await this.prisma.systemSettings.create({
        data: { id: 'global', lang: 'es' },
      });

      return { lang: 'es' };
    } catch (error) {
      this.logger.error(`Error getting global lang: ${error}`);
      return { lang: 'es' };
    }
  }

  async setGlobalLang(lang: 'en' | 'es'): Promise<{ lang: 'en' | 'es' }> {
    try {
      const existing = await this.prisma.systemSettings.findUnique({
        where: { id: 'global' },
      });

      if (existing) {
        await this.prisma.systemSettings.update({
          where: { id: 'global' },
          data: { lang },
        });
      } else {
        await this.prisma.systemSettings.create({
          data: { id: 'global', lang },
        });
      }

      this.logger.log(`Global lang set to: ${lang}`);
      return { lang };
    } catch (error) {
      this.logger.error(`Error setting global lang: ${error}`);
      throw error;
    }
  }

  async getOrgLang(orgIdOrSlug: string): Promise<{ lang: 'en' | 'es' }> {
    try {
      this.logger.log(`getOrgLang called with: ${orgIdOrSlug}`);

      // Try to find by ID first, then by slug
      let organization = await this.prisma.organization.findUnique({
        where: { id: orgIdOrSlug },
        select: { settings: true, slug: true },
      });

      // If not found by ID, try by slug
      if (!organization) {
        this.logger.log(`Not found by ID, trying slug: ${orgIdOrSlug}`);
        organization = await this.prisma.organization.findUnique({
          where: { slug: orgIdOrSlug },
          select: { settings: true, slug: true },
        });
      }

      if (!organization) {
        this.logger.warn(`Organization not found: ${orgIdOrSlug}`);
        return { lang: 'es' };
      }

      this.logger.log(`Found org: ${organization.slug}, settings: ${JSON.stringify(organization.settings)}`);

      if (organization) {
        const settings = organization.settings as Record<string, unknown>;
        const lang = settings?.lang as 'en' | 'es' | undefined;
        if (lang) {
          this.logger.log(`Returning lang: ${lang}`);
          return { lang };
        }
      }

      this.logger.log(`No lang found in settings, returning default: es`);
      return { lang: 'es' };
    } catch (error) {
      this.logger.error(`Error getting org lang: ${error}`);
      return { lang: 'es' };
    }
  }

  async updateOrgLang(orgIdOrSlug: string, lang: 'en' | 'es'): Promise<{ lang: 'en' | 'es' }> {
    try {
      // Try to find by ID first, then by slug
      let organization = await this.prisma.organization.findUnique({
        where: { id: orgIdOrSlug },
      });

      // If not found by ID, try by slug
      if (!organization) {
        organization = await this.prisma.organization.findUnique({
          where: { slug: orgIdOrSlug },
        });
      }

      if (!organization) {
        throw new Error('Organization not found');
      }

      const currentSettings = (organization.settings as Record<string, unknown>) || {};
      await this.prisma.organization.update({
        where: { id: organization.id },
        data: {
          settings: {
            ...currentSettings,
            lang,
          },
        },
      });

      this.logger.log(`Org ${orgIdOrSlug} lang updated to: ${lang}`);
      return { lang };
    } catch (error) {
      this.logger.error(`Error updating org lang: ${error}`);
      throw error;
    }
  }
}