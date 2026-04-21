import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { t } from '@/i18n/translations';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;
  private readonly appUrl: string;
  private readonly devEmail: string | undefined;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY') || '');
    this.fromEmail = this.configService.get('EMAIL_FROM') || 'noreply@omnidoc.com';
    this.appUrl = this.configService.get('APP_URL') || 'http://localhost:3000';
    this.devEmail = this.configService.get('DEV_EMAIL');
  }

  private getEmailRecipient(originalTo: string): { actualRecipient: string; displayRecipient: string } {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      return { actualRecipient: originalTo, displayRecipient: originalTo };
    }
    
    const devEmail = this.devEmail || 'REDACTED_EMAIL<';
    this.logger.log(`[DEV MODE] Redirecting email from ${originalTo} to ${devEmail}`);
    return { actualRecipient: devEmail, displayRecipient: originalTo };
  }

  async sendInvitationEmail(data: {
    to: string;
    inviterName: string;
    organizationName: string;
    organizationSlug: string;
    token: string;
    roleName: string;
    roleNameEn: string;
    expiresInDays: number;
    lang?: 'en' | 'es';
  }): Promise<void> {
    const { to, inviterName, organizationName, token, roleName, roleNameEn, expiresInDays, lang = 'es' } = data;
    const { actualRecipient, displayRecipient } = this.getEmailRecipient(to);

    const acceptUrl = `${this.appUrl}/invitation/${token}`;
    const html = this.getInvitationHtml({
      inviterName,
      organizationName,
      roleName: roleNameEn || roleName,
      acceptUrl,
      expiresInDays,
      to: displayRecipient,
      lang,
    });

    const subject = t('mail.invitation.subject', lang, { organizationName });

    this.logger.log(`Attempting to send invitation email - fromEmail: ${this.fromEmail}, to: ${actualRecipient}, subject: ${subject}, isProduction: ${process.env.NODE_ENV === 'production'}`);

    try {
      this.logger.log(`RESEND_API_KEY present: ${!!this.configService.get('RESEND_API_KEY')}`);
      
      if (!this.configService.get('RESEND_API_KEY')) {
        this.logger.warn('RESEND_API_KEY is not set, skipping email send');
        return;
      }
      
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: actualRecipient,
        subject,
        html,
      });

      if (result.error) {
        this.logger.error(`Failed to send invitation email to ${actualRecipient}: ${result.error.message}`);
        throw new Error(result.error.message);
      }

      this.logger.log(`Invitation email sent to ${actualRecipient} (original: ${displayRecipient})`);
    } catch (error) {
      this.logger.error(`Error sending invitation email: ${error}`);
      throw error;
    }
  }

  async sendWelcomeEmail(data: {
    to: string;
    firstName: string;
    orgName: string;
    confirmToken: string;
    lang?: 'en' | 'es';
  }): Promise<void> {
    const { to, firstName, orgName, confirmToken, lang = 'es' } = data;
    const { actualRecipient, displayRecipient } = this.getEmailRecipient(to);
    const confirmUrl = `${this.appUrl}/confirm-email/${confirmToken}`;
    
    const html = this.getWelcomeEmailHtml({
      firstName,
      orgName,
      confirmUrl,
      to: displayRecipient,
      lang,
    });

    const subject = t('mail.welcome.subject', lang, { organizationName: orgName });

    try {
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: actualRecipient,
        subject,
        html,
      });

      if (result.error) {
        this.logger.error(`Failed to send welcome email to ${actualRecipient}: ${result.error.message}`);
        throw new Error(result.error.message);
      }

      this.logger.log(`Welcome email sent to ${actualRecipient} (original: ${displayRecipient})`);
    } catch (error) {
      this.logger.error(`Error sending welcome email: ${error}`);
      throw error;
    }
  }

  private getInvitationHtml(data: {
    inviterName: string;
    organizationName: string;
    roleName: string;
    acceptUrl: string;
    expiresInDays: number;
    to: string;
    lang?: 'en' | 'es';
  }): string {
    const { inviterName, organizationName, roleName, acceptUrl, expiresInDays, to, lang = 'es' } = data;
    const year = new Date().getFullYear();

    return `<!DOCTYPE html>
<html lang="${lang}" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Clinical Invitation | OmniDoc</title>
</head>
<body style="margin:0;padding:0;background-color:#f8f9fb;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8f9fb;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="680" style="width:100%;max-width:680px;background-color:#ffffff;border:1px solid #eceef0;border-radius:10px;overflow:hidden;">
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid #eceef0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:24px;width:32px;" valign="middle">🩺</td>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:24px;color:#00355f;font-weight:700;" valign="middle">
                    OmniDoc Connect
                  </td>
                  <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;color:#48626e;font-weight:700;letter-spacing:1px;text-transform:uppercase;" valign="middle">
                    ${t('mail.invitation.precisionAccess', lang)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 24px;">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8EZH0AFBO_ISdgdyL659ivjxZLlHEhJHcskQrlute9aEGahYQmueW_IDMzQOVo54YTIRKu9umlPAzAW4XFTEfYPn9_1QKhS9dyE9-vVPcbd0NBKYTkh-3hzuyB3xltWStwbfHrL4mD_tYsDknLyo0WedklsGWfs_fTiDlB_v_pK08XjFpAco7_SSGisrHdekFKP5iK0t1thoLHNoFre9MHtpXbclSjYCIYY-Rvkg2Ul8MenIZ5teF8luh-67SaoaRs5NUIpyan_s"
                alt="Modern clinical facility"
                width="632"
                style="display:block;width:100%;height:auto;border:0;outline:none;text-decoration:none;border-radius:8px;margin-top:24px;"
              />
            </td>
          </tr>

          <tr>
            <td style="padding:28px 24px 12px 24px;font-family:Arial,Helvetica,sans-serif;color:#191c1e;">
              <h1 style="margin:0 0 12px 0;font-size:32px;line-height:38px;color:#00355f;font-weight:700;">
                ${t('mail.invitation.welcomeTitle', lang, { organizationName })}
              </h1>
              <p style="margin:0;font-size:18px;line-height:28px;color:#42474f;">
                ${t('mail.invitation.invitedAs', lang, { inviterName, roleName })}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:12px 24px 0 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f2f4f6;border-radius:8px;">
                <tr>
                  <td style="padding:18px;font-family:Arial,Helvetica,sans-serif;color:#42474f;">
                    <p style="margin:0 0 10px 0;font-size:14px;line-height:22px;">
                      ${t('mail.invitation.workspaceReady', lang)}
                    </p>
                    <p style="margin:0;font-size:12px;line-height:18px;color:#48626e;font-weight:700;letter-spacing:0.4px;text-transform:uppercase;">
                      ${t('mail.invitation.verifiedFacility', lang)} ${organizationName}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:28px 24px 12px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" bgcolor="#00355f" style="border-radius:6px;">
                    <a href="${acceptUrl}" target="_blank" style="display:inline-block;padding:14px 30px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:6px;">
                      ${t('mail.invitation.acceptButton', lang)}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:14px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#42474f;">
                ${t('mail.invitation.expiresIn', lang, { days: expiresInDays })}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:12px 24px 0 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #eceef0;">
                <tr>
                  <td style="padding:18px 0 0 0;font-family:Arial,Helvetica,sans-serif;">
                    <p style="margin:0 0 6px 0;font-size:16px;line-height:24px;font-weight:700;color:#00355f;">${t('mail.invitation.securityNote', lang)}</p>
                    <p style="margin:0;font-size:14px;line-height:22px;color:#42474f;">
                      ${t('mail.invitation.securityText', lang)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px;margin:0;background-color:#e0e3e5;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;font-weight:700;color:#00355f;">
                OmniDoc Clinical Operations
              </p>
              <p style="margin:4px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;color:#42474f;text-transform:uppercase;">
                Managed by ClinicianConnect Enterprise
              </p>
               <p style="margin:16px 0 0 0;padding-top:14px;border-top:1px solid #c2c7d1;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:16px;color:#42474f;">
                ${t('mail.invitation.emailTo', lang)} ${to || 'the invited user'}. ${t('mail.invitation.notExpected', lang)} ClinicianConnect Platform © ${year}.
               </p>
            </td>
          </tr>
        </table>
       </td>
     </tr>
   </table>
</body>
</html>`;
  }

  private getWelcomeEmailHtml(data: {
    firstName: string;
    orgName: string;
    confirmUrl: string;
    to: string;
    lang?: 'en' | 'es';
  }): string {
    const { firstName, orgName, confirmUrl, to, lang = 'es' } = data;
    const year = new Date().getFullYear();

    return `<!DOCTYPE html>
<html lang="${lang}" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Bienvenido a OmniDoc</title>
</head>
<body style="margin:0;padding:0;background-color:#f8f9fb;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8f9fb;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="680" style="width:100%;max-width:680px;background-color:#ffffff;border:1px solid #eceef0;border-radius:10px;overflow:hidden;">
          <tr>
            <td style="padding:20px 24px;border-bottom:1px solid #eceef0;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:24px;width:32px;" valign="middle">🩺</td>
                  <td style="font-family:Arial,Helvetica,sans-serif;font-size:24px;line-height:24px;color:#00355f;font-weight:700;" valign="middle">
                    OmniDoc Connect
                  </td>
                  <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;color:#48626e;font-weight:700;letter-spacing:1px;text-transform:uppercase;" valign="middle">
                    ${t('mail.invitation.precisionAccess', lang)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 24px;">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8EZH0AFBO_ISdgdyL659ivjxZLlHEhJHcskQrlute9aEGahYQmueW_IDMzQOVo54YTIRKu9umlPAzAW4XFTEfYPn9_1QKhS9dyE9-vVPcbd0NBKYTkh-3hzuyB3xltWStwbfHrL4mD_tYsDknLyo0WedklsGWfs_fTiDlB_v_pK08XjFpAco7_SSGisrHdekFKP5iK0t1thoLHNoFre9MHtpXbclSjYCIYY-Rvkg2Ul8MenIZ5teF8luh-67SaoaRs5NUIpyan_s"
                alt="Modern clinical facility"
                width="632"
                style="display:block;width:100%;height:auto;border:0;outline:none;text-decoration:none;border-radius:8px;margin-top:24px;"
              />
            </td>
          </tr>

          <tr>
            <td style="padding:28px 24px 12px 24px;font-family:Arial,Helvetica,sans-serif;color:#191c1e;">
              <h1 style="margin:0 0 12px 0;font-size:32px;line-height:38px;color:#00355f;font-weight:700;">
                ${t('mail.welcome.welcomeTitle', lang, { firstName: firstName || 'Doctor' })}
              </h1>
              <p style="margin:0;font-size:18px;line-height:28px;color:#42474f;">
                ${t('mail.welcome.orgCreated', lang, { organizationName: orgName })}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:12px 24px 0 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f2f4f6;border-radius:8px;">
                <tr>
                  <td style="padding:18px;font-family:Arial,Helvetica,sans-serif;color:#42474f;">
                    <p style="margin:0 0 10px 0;font-size:14px;line-height:22px;">
                      ${t('mail.welcome.nextStep', lang)}
                    </p>
                    <p style="margin:0;font-size:12px;line-height:18px;color:#48626e;font-weight:700;letter-spacing:0.4px;text-transform:uppercase;">
                      ${t('mail.welcome.verifiedFacility', lang)} ${orgName}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="padding:28px 24px 12px 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" bgcolor="#00355f" style="border-radius:6px;">
                    <a href="${confirmUrl}" target="_blank" style="display:inline-block;padding:14px 30px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:6px;">
                      ${t('mail.welcome.confirmButton', lang)}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:14px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#42474f;">
                ${t('mail.welcome.expiresIn', lang)}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:12px 24px 0 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-top:1px solid #eceef0;">
                <tr>
                  <td style="padding:18px 0 0 0;font-family:Arial,Helvetica,sans-serif;">
                    <p style="margin:0 0 6px 0;font-size:16px;line-height:24px;font-weight:700;color:#00355f;">${t('mail.welcome.securityNote', lang)}</p>
                    <p style="margin:0;font-size:14px;line-height:22px;color:#42474f;">
                      ${t('mail.welcome.securityText', lang)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px;margin:0;background-color:#e0e3e5;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:20px;font-weight:700;color:#00355f;">
                OmniDoc Clinical Operations
              </p>
              <p style="margin:4px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:16px;color:#42474f;text-transform:uppercase;">
                Managed by ClinicianConnect Enterprise
              </p>
               <p style="margin:16px 0 0 0;padding-top:14px;border-top:1px solid #c2c7d1;font-family:Arial,Helvetica,sans-serif;font-size:10px;line-height:16px;color:#42474f;">
                ${t('mail.invitation.emailTo', lang)} ${to || 'the registered user'}. ${t('mail.invitation.notExpected', lang)} ClinicianConnect Platform © ${year}.
               </p>
            </td>
          </tr>
        </table>
       </td>
     </tr>
   </table>
</body>
</html>`;
  }
}