function getStoredRole(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('sb-role')
}

function getStoredPermissions(): Record<string, any> {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem('sb-permissions')
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function checkPermission(perms: Record<string, any>, module: string, action: string): boolean {
  const dotKey = `${module}.${action}`
  if (perms[dotKey] === true) return true
  if (perms[module]?.[action] === true) return true
  return false
}

export function hasPermission(module: string, action: string): boolean {
  const role = getStoredRole()
  if (role === 'OWNER' || role === 'SUPERADMIN') return true
  const perms = getStoredPermissions()
  if (!perms || typeof perms !== 'object') return false
  return checkPermission(perms, module, action)
}

export function usePermissions() {
  const role = getStoredRole()
  const perms = getStoredPermissions()
  const isOwner = role === 'OWNER' || role === 'SUPERADMIN'

  return {
    can: (module: string, action: string) => {
      if (isOwner) return true
      return checkPermission(perms, module, action)
    },
    raw: perms,
  }
}
