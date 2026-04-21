export const translations = {
  mail: {
    invitation: {
      subject: {
        es: 'Invitación a OmniDoc - {organizationName}',
        en: 'Invitation to OmniDoc - {organizationName}',
      },
      welcomeTitle: {
        es: 'Bienvenido al equipo de {organizationName}.',
        en: 'Welcome to the team at {organizationName}.',
      },
      invitedAs: {
        es: 'Has sido invitado por {inviterName} para unirte como {roleName}.',
        en: 'You have been invited by {inviterName} to join as {roleName}.',
      },
      workspaceReady: {
        es: 'Tu espacio de trabajo está listo para inicializar. Una vez aceptado, tendrás acceso a OmniDoc Clinical Suite, registros de pacientes y herramientas de colaboración en tiempo real.',
        en: 'Your workspace is ready for initialization. Once accepted, you will have access to the OmniDoc Clinical Suite, patient records, and real-time collaboration tools.',
      },
      verifiedFacility: {
        es: '✓ Instalación Verificada:',
        en: '✓ Verified Facility:',
      },
      acceptButton: {
        es: 'Aceptar invitación',
        en: 'Accept Invitation',
      },
      expiresIn: {
        es: 'Este enlace expira en {days} días por seguridad.',
        en: 'Link expires in {days} days for security compliance.',
      },
      securityNote: {
        es: 'Nota de Seguridad',
        en: 'Security Note',
      },
      securityText: {
        es: 'OmniDoc utiliza encriptación de grado hospitalario (AES-256) para todas las transmisiones de datos clínicos. Este entorno es completamente compatible con HIPAA y GDPR, asegurando que todas las interacciones con pacientes permanezcan estrictamente confidenciales y con auditoría.',
        en: 'OmniDoc utilizes hospital-grade encryption (AES-256) for all clinical data transmissions. This environment is fully HIPAA and GDPR compliant, ensuring that all patient interactions remain strictly confidential and audit-trailed.',
      },
      precisionAccess: {
        es: 'Acceso de Precisión',
        en: 'Precision Access',
      },
      emailTo: {
        es: 'Este correo fue enviado a',
        en: 'This email was sent to',
      },
      notExpected: {
        es: 'Si no esperabas esta invitación, por favor ignórala o repórtalo al departamento de TI de tu instalación.',
        en: 'If you were not expecting this invitation, please ignore this message or report it to your facility\'s IT department.',
      },
    },
    welcome: {
      subject: {
        es: 'Bienvenido a OmniDoc - {organizationName}',
        en: 'Welcome to OmniDoc - {organizationName}',
      },
      welcomeTitle: {
        es: '¡Bienvenido a OmniDoc, {firstName}!',
        en: 'Welcome to OmniDoc, {firstName}!',
      },
      orgCreated: {
        es: 'Tu organización {organizationName} ha sido creada exitosamente.',
        en: 'Your organization {organizationName} has been created successfully.',
      },
      nextStep: {
        es: 'Estás a un paso de comenzar a usar OmniDoc. Confirma tu correo electrónico para activar tu cuenta y acceder a todas las funcionalidades de la plataforma.',
        en: 'You are one step away from starting to use OmniDoc. Confirm your email to activate your account and access all platform features.',
      },
      verifiedFacility: {
        es: '✓ Instalación Verificada:',
        en: '✓ Verified Facility:',
      },
      confirmButton: {
        es: 'Confirmar Correo Electrónico',
        en: 'Confirm Email',
      },
      expiresIn: {
        es: 'Este enlace expira en 7 días por seguridad.',
        en: 'This link expires in 7 days for security.',
      },
      securityNote: {
        es: 'Nota de Seguridad',
        en: 'Security Note',
      },
      securityText: {
        es: 'OmniDoc utiliza encriptación de grado hospitalario (AES-256) para todas las transmisiones de datos clínicos. Este entorno es completamente compatible con HIPAA y GDPR, asegurando que todas las interacciones con pacientes permanezcan estrictamente confidenciales y con auditoría.',
        en: 'OmniDoc utilizes hospital-grade encryption (AES-256) for all clinical data transmissions. This environment is fully HIPAA and GDPR compliant, ensuring that all patient interactions remain strictly confidential and audit-trailed.',
      },
    },
  },
  errors: {
    team: {
      memberNotFound: {
        es: 'Miembro del equipo no encontrado',
        en: 'Team member not found',
      },
      invitationNotFound: {
        es: 'Invitación no encontrada',
        en: 'Invitation not found',
      },
      invitationAlreadySent: {
        es: 'Ya se ha enviado una invitación a este correo',
        en: 'An invitation has already been sent to this email',
      },
      invitationNotPending: {
        es: 'La invitación no está pendiente',
        en: 'Invitation is not pending',
      },
      invitationExpired: {
        es: 'La invitación ha expirado',
        en: 'Invitation has already been used',
      },
      invitationAlreadyUsed: {
        es: 'La invitación ya ha sido utilizada',
        en: 'Invitation has already been used',
      },
      defaultRoleNotFound: {
        es: 'Rol predeterminado no encontrado para la organización',
        en: 'Default role not found for organization',
      },
      userAlreadyExists: {
        es: 'Ya existe un usuario con este correo en el equipo',
        en: 'A user with this email already exists in the team',
      },
    },
    auth: {
      organizationNotFound: {
        es: 'Organización no encontrada',
        en: 'Organization not found',
      },
      invalidParams: {
        es: 'Parámetros de consulta inválidos',
        en: 'Invalid query parameters',
      },
      userTypesRequired: {
        es: 'Los datos de tipos de usuario son requeridos',
        en: 'User types data is required',
      },
      onlyOwners: {
        es: 'Solo los propietarios pueden actualizar tipos de usuario',
        en: 'Only organization owners can update user types',
      },
      requiredFields: {
        es: 'El nombre, apellido y contraseña son requeridos',
        en: 'First name, last name and password are required',
      },
      devNotAvailable: {
        es: 'Login de desarrollo no disponible en producción',
        en: 'Dev login not available in production',
      },
    },
    user: {
      notFound: {
        es: 'Usuario no encontrado',
        en: 'User not found',
      },
    },
    specialty: {
      notFound: {
        es: 'Especialidad no encontrada: {id}',
        en: 'Specialty not found: {id}',
      },
    },
  },
} as const

export type Lang = 'en' | 'es'
export type TranslationSection = keyof typeof translations
export type TranslationKey = keyof typeof translations[TranslationSection]

type TranslationRecord = Record<string, unknown>

export function t(key: string, lang: Lang, params?: Record<string, string | number>): string {
  const keys = key.split('.')
  let result: unknown = translations

  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = (result as TranslationRecord)[k]
    } else {
      return key
    }
  }

  if (result && typeof result === 'object' && lang in result) {
    let text = String((result as Record<Lang, string>)[lang])

    if (params) {
      for (const [paramKey, value] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value))
      }
    }

    return text
  }

  return key
}