'use client'

import { useRequireAuth } from '@/hooks/useRequireAuth'
import { redirect } from 'next/navigation'
import { useEffect } from 'react'

export default function MyProfilePage() {
  const { user, loading } = useRequireAuth()

  useEffect(() => {
    if (!loading && user) {
      window.location.replace(`/profile/${user.username}`)
    }
  }, [user, loading])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
        <p className="text-slate-400">Redirection vers votre profil...</p>
      </div>
    </div>
  )
}
