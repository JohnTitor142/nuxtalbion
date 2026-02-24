'use client'

import { Sidebar } from './Sidebar'
import { useAuth } from '@/hooks/useAuth'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const isAuthPage = pathname === '/login' || pathname === '/signup'

  useEffect(() => {
    if (!loading && !user && !isAuthPage) {
      router.push('/login')
    }
  }, [user, loading, isAuthPage, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        {/* Loading content */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-slate-300 text-lg font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  if (isAuthPage || !user) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Animated background for the main app */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '6s' }}></div>
      </div>
      
      <Sidebar />
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="w-full h-full px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
