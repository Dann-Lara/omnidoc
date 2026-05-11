export interface PermissionModule {
  key: string
  label: string
  labelEn: string
  actions: string[]
}

export const PERMISSION_MODULES: PermissionModule[] = [
  { key: 'appointments',     label: 'Agenda',           labelEn: 'Appointments',     actions: ['read', 'write', 'delete'] },
  { key: 'patients',         label: 'Pacientes',        labelEn: 'Patients',         actions: ['read', 'write', 'delete', 'sensitive'] },
  { key: 'clinical_history', label: 'Expedientes',      labelEn: 'Clinical History', actions: ['read', 'write'] },
  { key: 'inventory',        label: 'Inventario',        labelEn: 'Inventory',        actions: ['read', 'write', 'delete'] },
  { key: 'pharmacy',         label: 'Farmacia',          labelEn: 'Pharmacy',         actions: ['read', 'dispense', 'restock', 'adjust'] },
  { key: 'notes',            label: 'Notas Clínicas',    labelEn: 'Clinical Notes',   actions: ['read', 'write', 'vitals'] },
  { key: 'billing',          label: 'Facturación',       labelEn: 'Billing',          actions: ['read', 'manage'] },
  { key: 'users',            label: 'Usuarios',          labelEn: 'Users',            actions: ['read', 'manage'] },
  { key: 'settings',         label: 'Configuración',     labelEn: 'Settings',         actions: ['read', 'manage'] },
  { key: 'analytics',        label: 'Analíticas',        labelEn: 'Analytics',        actions: ['view'] },
]

export function flattenPermissions(perms: string[]): Record<string, boolean> {
  const flat: Record<string, boolean> = {}
  for (const p of perms) {
    const key = p.replace(/:/g, '.')
    flat[key] = true
  }
  return flat
}
