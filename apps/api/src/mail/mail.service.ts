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
    
    const devEmail = this.devEmail || 'dkubdannspc@gmail.com';
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

  async sendAppointmentConfirmationEmail(data: {
    to: string;
    patientName: string;
    doctorName: string;
    specialty: string;
    date: string;
    time: string;
    location: string;
    locationDetail?: string;
    appointmentUrl: string;
    organizationName: string;
    organizationSlug: string;
    lang?: 'en' | 'es';
  }): Promise<void> {
    const { to, patientName, doctorName, specialty, date, time, location, locationDetail, appointmentUrl, organizationName, lang = 'es' } = data;
    const { actualRecipient, displayRecipient } = this.getEmailRecipient(to);

    const subject = t('mail.appointment.subject', lang, { organizationName });
    const html = this.getAppointmentConfirmationHtml({
      patientName, doctorName, specialty, date, time, location, locationDetail, appointmentUrl, organizationName, lang,
    });

    this.logger.log(`Attempting to send appointment confirmation email - to: ${actualRecipient}, subject: ${subject}`);

    try {
      if (!this.configService.get('RESEND_API_KEY')) {
        this.logger.warn('RESEND_API_KEY is not set, skipping appointment confirmation email');
        return;
      }

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: actualRecipient,
        subject,
        html,
      });

      if (result.error) {
        this.logger.error(`Failed to send appointment confirmation email to ${actualRecipient}: ${result.error.message}`);
        throw new Error(result.error.message);
      }

      this.logger.log(`Appointment confirmation email sent to ${actualRecipient} (original: ${displayRecipient})`);
    } catch (error) {
      this.logger.error(`Error sending appointment confirmation email: ${error}`);
    }
  }

  async sendAppointmentStatusChangeEmail(data: {
    to: string;
    patientName: string;
    doctorName: string;
    specialty: string;
    date: string;
    time: string;
    location: string;
    organizationName: string;
    status: 'CONFIRMED' | 'CANCELED';
    lang?: 'en' | 'es';
  }): Promise<void> {
    const { to, patientName, doctorName, specialty, date, time, location, organizationName, status, lang = 'es' } = data;
    const { actualRecipient, displayRecipient } = this.getEmailRecipient(to);

    const isConfirmed = status === 'CONFIRMED';
    const subject = isConfirmed
      ? t('mail.appointment.statusConfirmedSubject', lang, { organizationName })
      : t('mail.appointment.statusCanceledSubject', lang, { organizationName });

    const html = this.getStatusChangeEmailHtml({
      patientName, doctorName, specialty, date, time, location, organizationName, status, lang,
    });

    this.logger.log(`Attempting to send appointment status change email - to: ${actualRecipient}, status: ${status}`);

    try {
      if (!this.configService.get('RESEND_API_KEY')) {
        this.logger.warn('RESEND_API_KEY is not set, skipping appointment status change email');
        return;
      }

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: actualRecipient,
        subject,
        html,
      });

      if (result.error) {
        this.logger.error(`Failed to send appointment status change email to ${actualRecipient}: ${result.error.message}`);
        throw new Error(result.error.message);
      }

      this.logger.log(`Appointment status change email sent to ${actualRecipient} (original: ${displayRecipient})`);
    } catch (error) {
      this.logger.error(`Error sending appointment status change email: ${error}`);
    }
  }

  async sendEmail(data: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    const { to, subject, html } = data;
    const { actualRecipient, displayRecipient } = this.getEmailRecipient(to);

    this.logger.log(`[sendEmail] Attempting to send to: ${actualRecipient}`);

    if (!this.configService.get('RESEND_API_KEY')) {
      this.logger.warn('RESEND_API_KEY is not set, skipping email send');
      return;
    }

    try {
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: actualRecipient,
        subject,
        html,
      });

      if (result.error) {
        this.logger.error(`Failed to send email to ${actualRecipient}: ${result.error.message}`);
        throw new Error(result.error.message);
      }

      this.logger.log(`Email sent to ${actualRecipient} (original: ${displayRecipient})`);
    } catch (error) {
      this.logger.error(`Error sending email: ${error}`);
      throw error;
    }
  }

  async sendEmailWithAttachment(data: {
    to: string;
    subject: string;
    html: string;
    attachment: Buffer;
    attachmentFilename: string;
  }): Promise<void> {
    const { to, subject, html, attachment, attachmentFilename } = data;
    const { actualRecipient, displayRecipient } = this.getEmailRecipient(to);

    this.logger.log(`[sendEmailWithAttachment] Attempting to send to: ${actualRecipient}`);

    if (!this.configService.get('RESEND_API_KEY')) {
      this.logger.warn('RESEND_API_KEY is not set, skipping email send');
      return;
    }

    try {
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: actualRecipient,
        subject,
        html,
        attachments: [
          {
            filename: attachmentFilename,
            content: attachment.toString('base64'),
            contentType: 'application/pdf',
          },
        ],
      });

      if (result.error) {
        this.logger.error(`Failed to send email to ${actualRecipient}: ${result.error.message}`);
        throw new Error(result.error.message);
      }

      this.logger.log(`Email with attachment sent to ${actualRecipient} (original: ${displayRecipient})`);
    } catch (error) {
      this.logger.error(`Error sending email with attachment: ${error}`);
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

  private getAppointmentConfirmationHtml(data: {
    patientName: string;
    doctorName: string;
    specialty: string;
    date: string;
    time: string;
    location: string;
    locationDetail?: string;
    appointmentUrl: string;
    organizationName: string;
    lang: 'en' | 'es';
  }): string {
    const { patientName, doctorName, specialty, date, time, location, locationDetail, appointmentUrl, organizationName, lang } = data;
    const year = new Date().getFullYear();
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    const ico = (symbol: string, color: string, size = 20) => `<span style="display:inline-block;width:${size}px;height:${size}px;line-height:${size}px;text-align:center;font-size:${size}px;color:${color};vertical-align:middle;">${symbol}</span>`;

    return `<!DOCTYPE html>
<html lang="${lang}" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Cita Confirmada | ${organizationName}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8f9fb;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8f9fb;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:32px 24px 24px 24px;text-align:center;background-color:#ffffff;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color:#0f4c81;border-radius:8px;padding:10px;text-align:center;line-height:1;" valign="middle">
                          ${ico('&#x2695;', '#8ebdf9')}
                        </td>
                        <td style="padding-left:12px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:800;color:#00355f;letter-spacing:-0.5px;" valign="middle">
                          ${organizationName}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <h1 style="margin:24px 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:28px;line-height:34px;color:#00355f;font-weight:700;">
                ${t('mail.appointment.title', lang)}
              </h1>
              <p style="margin:0 auto;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#42474f;max-width:400px;">
                ${t('mail.appointment.subtitle', lang)}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:0 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f2f4f6;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="width:40%;padding:24px;background-color:#f8f9fb;text-align:center;vertical-align:top;" valign="top">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC44BZgVbEx_xKiKNtyaeU0bnoFQuuIsqBCWpVQUhjjGan_RsStqKHIvkdBZUWUsyKW4YYlNMEyh7XgKK8Z2L72J5Pw5sBHqS3Z9iU_hML5YoRTz0JcAYAjobaFnmFq3-29sgEjUCKJdiAnGXdW2smYWF9svYcImb7du2usrXRnc09bN_el-TweF80nh1cr8LmcAYVt39Krk6JooisRd6UpJ04PUadBteivHT-x9mUqmO0xvlANPlCTha1WALWXbnI44w_VXo6eCmc" alt="Doctor" style="width:120px;height:120px;border-radius:50%;object-fit:cover;border:4px solid #ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.08);" />
                    <p style="margin:16px 0 4px 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#42474f;letter-spacing:1.5px;text-transform:uppercase;">
                      ${t('mail.appointment.specialtyLabel', lang)}
                    </p>
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;color:#00355f;">
                      ${specialty}
                    </p>
                  </td>
                  <td style="width:60%;padding:24px 28px;background-color:#ffffff;vertical-align:top;" valign="top">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom:16px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding-right:12px;" valign="middle">${ico('&#x1F468;', '#0f4c81')}</td>
                              <td>
                                <p style="margin:0 0 2px 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#42474f;letter-spacing:1.2px;text-transform:uppercase;">
                                  ${t('mail.appointment.patientLabel', lang)}
                                </p>
                                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#191c1e;">${patientName}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom:16px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding-right:12px;" valign="middle">${ico('&#x1F691;', '#0f4c81')}</td>
                              <td>
                                <p style="margin:0 0 2px 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#42474f;letter-spacing:1.2px;text-transform:uppercase;">
                                  ${t('mail.appointment.doctorLabel', lang)}
                                </p>
                                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#191c1e;">${doctorName}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom:16px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td width="50%" style="padding-right:12px;">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="padding-right:8px;" valign="middle">${ico('&#x1F4C5;', '#0f4c81')}</td>
                                    <td>
                                      <p style="margin:0 0 2px 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#42474f;letter-spacing:1.2px;text-transform:uppercase;">
                                        ${t('mail.appointment.dateLabel', lang)}
                                      </p>
                                      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#191c1e;">${date}</p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <td width="50%">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="padding-right:8px;" valign="middle">${ico('&#x23F0;', '#0f4c81')}</td>
                                    <td>
                                      <p style="margin:0 0 2px 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#42474f;letter-spacing:1.2px;text-transform:uppercase;">
                                        ${t('mail.appointment.timeLabel', lang)}
                                      </p>
                                      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#191c1e;">${time}</p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding-right:12px;" valign="middle">${ico('&#x1F4CD;', '#0f4c81')}</td>
                              <td>
                                <p style="margin:0 0 2px 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#42474f;letter-spacing:1.2px;text-transform:uppercase;">
                                  ${t('mail.appointment.locationLabel', lang)}
                                </p>
                                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#191c1e;">${location}</p>
                                ${locationDetail ? `<p style="margin:2px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#42474f;">${locationDetail}</p>` : ''}
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 24px 0 24px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" bgcolor="#00355f" style="border-radius:12px;">
                    <a href="${appointmentUrl}" target="_blank" style="display:inline-block;padding:16px 32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;">
                      ${t('mail.appointment.calendarCta', lang)}
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0 0;">
                <a href="${appointmentUrl}" target="_blank" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#07497d;text-decoration:none;font-weight:500;">
                  ${t('mail.appointment.viewDetails', lang)} &nearr;
                </a>
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 24px 0 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-radius:12px;overflow:hidden;background-color:#e0e3e5;">
                <tr>
                  <td style="height:180px;text-align:center;vertical-align:middle;background:linear-gradient(135deg,#e0e3e5 0%,#c2c7d1 100%);">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                      <tr>
                        <td style="background-color:#ffffff;border-radius:24px;padding:8px 16px;box-shadow:0 4px 16px rgba(0,0,0,0.1);">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding-right:6px;" valign="middle">${ico('&#x1F9ED;', '#00355f')}</td>
                              <td>
                                <a href="${googleMapsUrl}" target="_blank" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:700;color:#00355f;text-decoration:none;">
                                  ${t('mail.appointment.directions', lang)}
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 24px 0 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f2f4f6;border-radius:12px;">
                <tr>
                  <td style="padding:20px;text-align:center;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                      <tr>
                        <td style="padding:0 16px;text-align:center;" valign="top">
                          <p style="margin:0 0 4px 0;font-size:16px;">&#x1F512;</p>
                          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:700;color:#42474f;letter-spacing:0.5px;text-transform:uppercase;">
                            ${t('mail.appointment.encrypted', lang)}
                          </p>
                        </td>
                        <td style="padding:0 16px;text-align:center;" valign="top">
                          <p style="margin:0 0 4px 0;font-size:16px;">&#x1F6E1;</p>
                          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:700;color:#42474f;letter-spacing:0.5px;text-transform:uppercase;">
                            ${t('mail.appointment.hipaa', lang)}
                          </p>
                        </td>
                        <td style="padding:0 16px;text-align:center;" valign="top">
                          <p style="margin:0 0 4px 0;font-size:16px;">&#x1F6E1;</p>
                          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:700;color:#42474f;letter-spacing:0.5px;text-transform:uppercase;">
                            ${t('mail.appointment.privacy', lang)}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 24px 32px 24px;text-align:center;">
              <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:18px;color:#42474f;">
                ${t('mail.appointment.footerDisclaimer', lang, { organizationName })}
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td style="padding:0 8px;">
                    <a href="#" style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#48626e;letter-spacing:1px;text-transform:uppercase;text-decoration:none;">${t('mail.appointment.privacyNotice', lang)}</a>
                  </td>
                  <td style="color:#c2c7d1;">|</td>
                  <td style="padding:0 8px;">
                    <a href="#" style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#48626e;letter-spacing:1px;text-transform:uppercase;text-decoration:none;">${t('mail.appointment.terms', lang)}</a>
                  </td>
                  <td style="color:#c2c7d1;">|</td>
                  <td style="padding:0 8px;">
                    <a href="#" style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#48626e;letter-spacing:1px;text-transform:uppercase;text-decoration:none;">${t('mail.appointment.support', lang)}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:16px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#42474f;">
                &copy; ${year} ${organizationName}. ${t('mail.appointment.footerRights', lang)}
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

  private getStatusChangeEmailHtml(data: {
    patientName: string;
    doctorName: string;
    specialty: string;
    date: string;
    time: string;
    location: string;
    organizationName: string;
    status: 'CONFIRMED' | 'CANCELED';
    lang: 'en' | 'es';
  }): string {
    const { patientName, doctorName, specialty, date, time, location, organizationName, status, lang } = data;
    const year = new Date().getFullYear();
    const isConfirmed = status === 'CONFIRMED';
    const icon = isConfirmed ? '&#x2705;' : '&#x274C;';
    const headerBg = isConfirmed ? '#059669' : '#ba1a1a';
    const headerText = isConfirmed ? t('mail.appointment.statusConfirmedTitle', lang) : t('mail.appointment.statusCanceledTitle', lang);
    const subtitleText = isConfirmed ? t('mail.appointment.statusConfirmedSubtitle', lang) : t('mail.appointment.statusCanceledSubtitle', lang);
    const badgeBg = isConfirmed ? '#d1fae5' : '#fee2e2';
    const badgeText = isConfirmed ? '#065f46' : '#991b1b';
    const badgeLabel = isConfirmed ? t('mail.appointment.statusConfirmedBadge', lang) : t('mail.appointment.statusCanceledBadge', lang);

    return `<!DOCTYPE html>
<html lang="${lang}" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${headerText} | ${organizationName}</title>
</head>
<body style="margin:0;padding:0;background-color:#f8f9fb;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8f9fb;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:32px 24px 24px 24px;text-align:center;background-color:#ffffff;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color:${headerBg};border-radius:8px;padding:10px;text-align:center;line-height:1;" valign="middle">
                          <span style="display:inline-block;width:20px;height:20px;line-height:20px;text-align:center;font-size:20px;color:#ffffff;vertical-align:middle;">${icon}</span>
                        </td>
                        <td style="padding-left:12px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:800;color:#00355f;letter-spacing:-0.5px;" valign="middle">
                          ${organizationName}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <h1 style="margin:24px 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:28px;line-height:34px;color:#00355f;font-weight:700;">
                ${headerText}
              </h1>
              <p style="margin:0 auto;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#42474f;max-width:400px;">
                ${subtitleText}
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin-top:16px;">
                <tr>
                  <td style="background-color:${badgeBg};border-radius:20px;padding:6px 16px;">
                    <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;color:${badgeText};letter-spacing:0.5px;text-transform:uppercase;">
                      ${badgeLabel}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:0 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f2f4f6;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:24px 28px;background-color:#ffffff;vertical-align:top;" valign="top">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td style="padding-bottom:16px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding-right:12px;" valign="middle"><span style="display:inline-block;width:20px;height:20px;line-height:20px;text-align:center;font-size:20px;color:#0f4c81;vertical-align:middle;">&#x1F468;</span></td>
                              <td>
                                <p style="margin:0 0 2px 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#42474f;letter-spacing:1.2px;text-transform:uppercase;">
                                  ${t('mail.appointment.patientLabel', lang)}
                                </p>
                                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#191c1e;">${patientName}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom:16px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding-right:12px;" valign="middle"><span style="display:inline-block;width:20px;height:20px;line-height:20px;text-align:center;font-size:20px;color:#0f4c81;vertical-align:middle;">&#x1F691;</span></td>
                              <td>
                                <p style="margin:0 0 2px 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#42474f;letter-spacing:1.2px;text-transform:uppercase;">
                                  ${t('mail.appointment.doctorLabel', lang)}
                                </p>
                                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#191c1e;">${doctorName}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom:16px;">
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td width="50%" style="padding-right:12px;">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="padding-right:8px;" valign="middle"><span style="display:inline-block;width:20px;height:20px;line-height:20px;text-align:center;font-size:20px;color:#0f4c81;vertical-align:middle;">&#x1F4C5;</span></td>
                                    <td>
                                      <p style="margin:0 0 2px 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#42474f;letter-spacing:1.2px;text-transform:uppercase;">
                                        ${t('mail.appointment.dateLabel', lang)}
                                      </p>
                                      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#191c1e;">${date}</p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                              <td width="50%">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td style="padding-right:8px;" valign="middle"><span style="display:inline-block;width:20px;height:20px;line-height:20px;text-align:center;font-size:20px;color:#0f4c81;vertical-align:middle;">&#x23F0;</span></td>
                                    <td>
                                      <p style="margin:0 0 2px 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#42474f;letter-spacing:1.2px;text-transform:uppercase;">
                                        ${t('mail.appointment.timeLabel', lang)}
                                      </p>
                                      <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#191c1e;">${time}</p>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td style="padding-right:12px;" valign="middle"><span style="display:inline-block;width:20px;height:20px;line-height:20px;text-align:center;font-size:20px;color:#0f4c81;vertical-align:middle;">&#x1F4CD;</span></td>
                              <td>
                                <p style="margin:0 0 2px 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;color:#42474f;letter-spacing:1.2px;text-transform:uppercase;">
                                  ${t('mail.appointment.locationLabel', lang)}
                                </p>
                                <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:600;color:#191c1e;">${location}</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${isConfirmed ? `
          <tr>
            <td style="padding:24px 24px 0 24px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding:20px;text-align:center;background-color:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0;">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#065f46;line-height:20px;">
                      &#x1F4CB; ${t('mail.appointment.statusConfirmedInstructions', lang)}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <tr>
            <td style="padding:24px 24px 0 24px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f2f4f6;border-radius:12px;">
                <tr>
                  <td style="padding:20px;text-align:center;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                      <tr>
                        <td style="padding:0 16px;text-align:center;" valign="top">
                          <p style="margin:0 0 4px 0;font-size:16px;">&#x1F512;</p>
                          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:700;color:#42474f;letter-spacing:0.5px;text-transform:uppercase;">
                            ${t('mail.appointment.encrypted', lang)}
                          </p>
                        </td>
                        <td style="padding:0 16px;text-align:center;" valign="top">
                          <p style="margin:0 0 4px 0;font-size:16px;">&#x1F6E1;</p>
                          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:9px;font-weight:700;color:#42474f;letter-spacing:0.5px;text-transform:uppercase;">
                            ${t('mail.appointment.hipaa', lang)}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:24px 24px 32px 24px;text-align:center;">
              <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:18px;color:#42474f;">
                ${t('mail.appointment.footerDisclaimer', lang, { organizationName })}
              </p>
              <p style="margin:16px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#42474f;">
                &copy; ${year} ${organizationName}. ${t('mail.appointment.footerRights', lang)}
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