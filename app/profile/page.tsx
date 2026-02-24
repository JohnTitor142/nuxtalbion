'use client'

import { useRequireAuth } from '@/hooks/useRequireAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ActivityRegistration, Activity, Roaster, Weapon } from '@/types'
import { User, Calendar, Trophy, Shield, Users as UsersIcon } from 'lucide-react'
import { CATEGORY_ICONS } from '@/types'

interface RegistrationWithDetails extends ActivityRegistration {
  activity?: Activity
  weapon1?: Weapon
  weapon2?: Weapon
  weapon3?: Weapon
}

interface RoasterWithDetails extends Roaster {
  activity?: Activity
  weapon?: Weapon
}

export default function ProfilePage() {
  const { user, loading } = useRequireAuth()
  const [registrations, setRegistrations] = useState<RegistrationWithDetails[]>([])
  const [pastParticipations, setPastParticipations] = useState<RoasterWithDetails[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      setLoadingData(true)

      // Charger les inscriptions
      const { data: regs } = await supabase
        .from('activity_registrations')
        .select(`
          *,
          activity:activities(*),
          weapon1:weapon1_id(*),
          weapon2:weapon2_id(*),
          weapon3:weapon3_id(*)
        `)
        .eq('user_id', user?.id!)
        .order('created_at', { ascending: false })

      setRegistrations(regs || [])

      // Charger les participations passées (roasters)
      const { data: roasters } = await supabase
        .from('roasters')
        .select(`
          *,
          activity:activities(*),
          weapon:weapons(*)
        `)
        .eq('user_id', user?.id!)
        .order('assigned_at', { ascending: false })

      setPastParticipations(roasters || [])
    } catch (error) {
      console.error('Error loading profile data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-slate-400">Chargement...</p>
        </div>
      </div>
    )
  }

  const roleLabels = {
    admin: 'Administrateur',
    shotcaller: 'Shotcaller',
    user: 'Joueur'
  }

  const roleIcons = {
    admin: <Shield className="w-5 h-5 text-red-400" />,
    shotcaller: <UsersIcon className="w-5 h-5 text-yellow-400" />,
    user: <User className="w-5 h-5 text-blue-400" />
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-6 mb-8">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-2xl">
          <User className="w-12 h-12 text-white" />
        </div>
        <div>
          <h1 className="text-5xl font-bold text-white mb-2">{user?.username}</h1>
          <p className="text-slate-400 flex items-center gap-2 text-lg">
            {roleIcons[user!.role]}
            <span>{roleLabels[user!.role]}</span>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass-effect border-slate-700/50">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{registrations.length}</p>
                <p className="text-base text-slate-400">Inscriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-slate-700/50">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{pastParticipations.length}</p>
                <p className="text-base text-slate-400">Participations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-slate-700/50">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-base text-slate-400">Membre depuis</p>
                <p className="text-xl text-white font-medium">
                  {new Date(user!.created_at).toLocaleDateString('fr-FR', {
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mes Inscriptions */}
      <Card className="glass-effect border-slate-700/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-2 text-2xl">
            <Calendar className="w-6 h-6 text-purple-400" />
            Mes Inscriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {registrations.length === 0 ? (
            <div className="text-center text-slate-400 py-16">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Aucune inscription pour le moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              {registrations.map((reg) => (
                <div key={reg.id} className="p-5 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-2 text-lg">
                        {reg.activity?.name}
                      </h3>
                      <p className="text-base text-slate-400 mb-3">
                        {reg.activity?.scheduled_at && new Date(reg.activity.scheduled_at).toLocaleDateString('fr-FR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {reg.weapon1 && (
                          <span className="px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 text-base font-medium">
                            {CATEGORY_ICONS[reg.weapon1.category]} {reg.weapon1.name}
                          </span>
                        )}
                        {reg.weapon2 && (
                          <span className="px-4 py-2 rounded-full bg-blue-500/20 text-blue-300 text-base font-medium">
                            {CATEGORY_ICONS[reg.weapon2.category]} {reg.weapon2.name}
                          </span>
                        )}
                        {reg.weapon3 && (
                          <span className="px-4 py-2 rounded-full bg-green-500/20 text-green-300 text-base font-medium">
                            {CATEGORY_ICONS[reg.weapon3.category]} {reg.weapon3.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mes Participations Passées */}
      {pastParticipations.length > 0 && (
        <Card className="glass-effect border-slate-700/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-white flex items-center gap-2 text-2xl">
              <Trophy className="w-6 h-6 text-green-400" />
              Participations Passées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastParticipations.map((participation) => (
                <div key={participation.id} className="p-5 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:border-slate-600/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-300 mb-2 text-lg">
                        {participation.activity?.name}
                      </h3>
                      <p className="text-base text-slate-500 mb-3">
                        {participation.activity?.scheduled_at && new Date(participation.activity.scheduled_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                      {participation.weapon && (
                        <span className="px-4 py-2 rounded-full bg-slate-700/50 text-slate-400 text-base">
                          {CATEGORY_ICONS[participation.weapon.category]} {participation.weapon.name}
                        </span>
                      )}
                    </div>
                    <div className="text-base text-slate-500 font-medium">
                      Groupe {participation.group_number}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
