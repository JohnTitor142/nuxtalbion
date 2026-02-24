'use client'

import { useRequireAuth } from '@/hooks/useRequireAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, Puzzle, TrendingUp, Sparkles, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Activity } from '@/types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const { user, loading } = useRequireAuth()
  const [activities, setActivities] = useState<Activity[]>([])
  const [stats, setStats] = useState({
    upcomingActivities: 0,
    myRegistrations: 0,
    totalCompositions: 0,
  })
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      const { data: upcomingActivities } = await supabase
        .from('activities')
        .select('*')
        .eq('status', 'open')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(5)

      const { data: myRegistrations } = await supabase
        .from('activity_registrations')
        .select('*')
        .eq('user_id', user?.id)

      const { data: compositions } = await supabase
        .from('compositions')
        .select('*')

      setActivities(upcomingActivities || [])
      setStats({
        upcomingActivities: upcomingActivities?.length || 0,
        myRegistrations: myRegistrations?.length || 0,
        totalCompositions: compositions?.length || 0,
      })
    } catch (error) {
      console.error('Error loading dashboard:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-slate-400">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="relative">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-400" />
            Dashboard
          </h1>
          <p className="text-slate-400 text-lg">
            Bienvenue, <span className="text-white font-semibold gradient-text">{user?.username}</span> ! 👋
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass-effect border-slate-700/50 card-hover relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-400">
              Activités à venir
            </CardTitle>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-white mb-1">{stats.upcomingActivities}</div>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              Activités planifiées
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-slate-700/50 card-hover relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-400">
              Mes Inscriptions
            </CardTitle>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-white mb-1">{stats.myRegistrations}</div>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              Inscriptions actives
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-slate-700/50 card-hover relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-slate-400">
              Compositions
            </CardTitle>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/25">
              <Puzzle className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-white mb-1">{stats.totalCompositions}</div>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-400" />
              Disponibles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Activities */}
      <Card className="glass-effect border-slate-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-pink-500/10 to-transparent rounded-full blur-3xl"></div>
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-400" />
              Prochaines Activités
            </CardTitle>
            <Link href="/activities">
              <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10">
                Voir tout
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">
                Aucune activité planifiée pour le moment
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="group p-5 rounded-xl glass-effect border border-slate-700/50 hover:border-purple-500/50 transition-all card-hover"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-purple-400 transition-colors">
                        {activity.name}
                      </h3>
                      <p className="text-sm text-slate-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(activity.scheduled_at).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 text-sm font-medium border border-green-500/30 shadow-lg shadow-green-500/10">
                        🟢 Ouvert
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
