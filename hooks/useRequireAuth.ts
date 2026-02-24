'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './useAuth'
import type { UserRole } from '@/types'

export function useRequireAuth(requiredRole?: UserRole | UserRole[]) {
  const { user, loading, hasRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (requiredRole && !hasRole(requiredRole)) {
        router.push('/activities')
      }
    }
  }, [user, loading, requiredRole, hasRole, router])

  return { user, loading }
}
