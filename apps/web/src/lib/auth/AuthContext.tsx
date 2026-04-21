'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UserInfo, OrganizationInfo } from './types'
import { getStoredUser, getStoredOrgId, getStoredOrgSlug, getStoredOrgName, getStoredSpecialties, clearAuthSession as clearSession } from './session'

interface AuthContextType {
  user: UserInfo | null
  organization: OrganizationInfo | null
  isLoading: boolean
  updateUser: (updates: Partial<UserInfo>) => void
  updateOrganization: (updates: Partial<OrganizationInfo>) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [organization, setOrganization] = useState<OrganizationInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = getStoredUser()
    setUser(stored)
    const orgId = getStoredOrgId()
    const orgSlug = getStoredOrgSlug()
    const orgName = getStoredOrgName()
    const specialties = getStoredSpecialties()
    if (orgId && orgSlug && orgName) {
      setOrganization({
        org_id: orgId,
        org_slug: orgSlug,
        org_name: orgName,
        specialties,
      })
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sb-user') {
        const stored = getStoredUser()
        setUser(stored)
      }
      if (e.key === 'sb-org-slug' || e.key === 'sb-org-name' || e.key === 'sb-specialties') {
        const orgId = getStoredOrgId()
        const orgSlug = getStoredOrgSlug()
        const orgName = getStoredOrgName()
        const specialties = getStoredSpecialties()
        if (orgId && orgSlug && orgName) {
          setOrganization({
            org_id: orgId,
            org_slug: orgSlug,
            org_name: orgName,
            specialties,
          })
        }
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const updateUser = (updates: Partial<UserInfo>) => {
    setUser((prev: UserInfo | null) => {
      if (!prev) return null
      const updated = { ...prev, ...updates }
      localStorage.setItem('sb-user', JSON.stringify(updated))
      return updated
    })
  }

  const updateOrganization = (updates: Partial<OrganizationInfo>) => {
    setOrganization((prev: OrganizationInfo | null) => {
      if (!prev) return null
      const updated = { ...prev, ...updates }
      if (updated.org_slug) {
        localStorage.setItem('sb-org-slug', updated.org_slug)
      }
      if (updated.org_name) {
        localStorage.setItem('sb-org-name', updated.org_name)
      }
      if (updated.specialties) {
        localStorage.setItem('sb-specialties', JSON.stringify(updated.specialties))
      }
      return updated
    })
  }

  const logout = () => {
    clearSession()
    setUser(null)
    setOrganization(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, organization, isLoading, updateUser, updateOrganization, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}