export function flattenRolePermissions(perms: string[]): Record<string, boolean> {
  const flat: Record<string, boolean> = {}
  for (const p of perms ?? []) {
    flat[p.replace(':', '.')] = true
  }
  return flat
}

export function expandPermissions(permissions: Record<string, any>): string[] {
  const result: string[] = []

  for (const [module, perms] of Object.entries(permissions)) {
    if (typeof perms === 'object' && perms !== null) {
      for (const [action, enabled] of Object.entries(perms)) {
        if (enabled) {
          result.push(`${module}:${action}`)
        }
      }
    } else if (perms === true) {
      result.push(module)
    }
  }

  return result
}
