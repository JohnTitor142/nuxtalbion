'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import {
  Calendar,
  Puzzle,
  Users,
  Sword,
  Shield,
  LogOut,
  Sparkles,
  User,
  Trophy
} from 'lucide-react'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  requiredRole?: string[]
}

const navItems: NavItem[] = [
  {
    title: 'Activités',
    href: '/activities',
    icon: Calendar,
  },
  {
    title: 'Leaderboard',
    href: '/leaderboard',
    icon: Trophy,
  },
  {
    title: 'Mon Profil',
    href: '/profile',
    icon: User,
  },
]

const shotcallerNavItems: NavItem[] = [
  {
    title: 'Compositions',
    href: '/compositions',
    icon: Puzzle,
    requiredRole: ['admin', 'shotcaller'],
  },
]

const adminNavItems: NavItem[] = [
  {
    title: 'Gestion Armes',
    href: '/admin/weapons',
    icon: Sword,
    requiredRole: ['admin'],
  },
  {
    title: 'Gestion Utilisateurs',
    href: '/admin/users',
    icon: Shield,
    requiredRole: ['admin'],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, signOut, hasRole } = useAuth()

  const canAccessItem = (item: NavItem) => {
    if (!item.requiredRole) return true
    return hasRole(item.requiredRole as any)
  }

  if (!user) return null

  const isShotcaller = hasRole(['admin', 'shotcaller'])
  const isAdmin = hasRole('admin')

  return (
    <div className="flex flex-col h-full glass-effect border-r border-slate-700/50 w-64 relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-pink-500/5 pointer-events-none"></div>

      <div className="relative z-10 p-6">
        <Link href="/activities" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-lg shadow-purple-500/25 group-hover:shadow-xl group-hover:shadow-purple-500/40 transition-all">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl gradient-text">Albion Zerg</span>
        </Link>
      </div>

      <Separator className="bg-slate-700/50" />

      <div className="flex-1 overflow-y-auto py-4 px-3 relative z-10">
        {/* Navigation principale */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            if (!canAccessItem(item)) return null

            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative overflow-hidden',
                  isActive
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white shadow-lg shadow-purple-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-xl"></div>
                )}
                <Icon className={cn(
                  "h-5 w-5 relative z-10 transition-transform group-hover:scale-110",
                  isActive && "text-purple-400"
                )} />
                <span className="relative z-10 font-medium">{item.title}</span>
              </Link>
            )
          })}
        </nav>

        {/* Section Shotcaller */}
        {isShotcaller && (
          <>
            <Separator className="my-4 bg-slate-700/50" />
            <div className="px-4 mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Puzzle className="w-3 h-3" />
                Shotcaller
              </p>
            </div>
            <nav className="space-y-1">
              {shotcallerNavItems.map((item) => {
                if (!canAccessItem(item)) return null

                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative overflow-hidden',
                      isActive
                        ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-white shadow-lg shadow-green-500/10'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    )}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 blur-xl"></div>
                    )}
                    <Icon className={cn(
                      "h-5 w-5 relative z-10 transition-transform group-hover:scale-110",
                      isActive && "text-green-400"
                    )} />
                    <span className="relative z-10 font-medium">{item.title}</span>
                  </Link>
                )
              })}
            </nav>
          </>
        )}

        {/* Section Admin */}
        {isAdmin && (
          <>
            <Separator className="my-4 bg-slate-700/50" />
            <div className="px-4 mb-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-3 h-3" />
                Administration
              </p>
            </div>
            <nav className="space-y-1">
              {adminNavItems.map((item) => {
                if (!canAccessItem(item)) return null

                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative overflow-hidden',
                      isActive
                        ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-white shadow-lg shadow-red-500/10'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    )}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 blur-xl"></div>
                    )}
                    <Icon className={cn(
                      "h-5 w-5 relative z-10 transition-transform group-hover:scale-110",
                      isActive && "text-red-400"
                    )} />
                    <span className="relative z-10 font-medium">{item.title}</span>
                  </Link>
                )
              })}
            </nav>
          </>
        )}
      </div>

      <Separator className="bg-slate-700/50" />

      <div className="p-4 relative z-10">
        <div className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <Avatar className="h-10 w-10 ring-2 ring-purple-500/20">
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
              {user.username?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.username}</p>
            <p className="text-xs text-slate-400 capitalize flex items-center gap-1">
              {user.role === 'admin' && <Shield className="w-3 h-3 text-red-400" />}
              {user.role === 'shotcaller' && <Users className="w-3 h-3 text-yellow-400" />}
              {user.role === 'user' && <User className="w-3 h-3 text-blue-400" />}
              {user.role === 'admin' ? 'Admin' : user.role === 'shotcaller' ? 'Shotcaller' : 'Joueur'}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start border-slate-700 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 transition-all group"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
          Déconnexion
        </Button>
      </div>
    </div>
  )
}
