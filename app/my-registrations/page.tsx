'use client'

import { useRequireAuth } from '@/hooks/useRequireAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ActivityRegistration, Activity, Weapon } from '@/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface RegistrationWithDetails extends ActivityRegistration {
  activity?: Activity
  weapon?: Weapon
}

export default function MyRegistrationsPage() {
  const { user, loading } = useRequireAuth()
  const [registrations, setRegistrations] = useState<RegistrationWithDetails[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadRegistrations()
    }
  }, [user])

  const loadRegistrations = async () => {
    try {
      setLoadingData(true)
      const { data, error } = await supabase
        .from('activity_registrations')
        .select(`
          *,
          activity:activities(*),
          weapon:weapons(*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRegistrations(data || [])
    } catch (error) {
      console.error('Error loading registrations:', error)
    } finally {
      setLoadingData(false)
    }
  }

  if (loading || loadingData) {
    return <div className="text-white">Chargement...</div>
  }

  const pendingRegistrations = registrations.filter(r => r.status === 'pending')
  const approvedRegistrations = registrations.filter(r => r.status === 'approved')
  const declinedRegistrations = registrations.filter(r => r.status === 'declined')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Mes Inscriptions</h1>
        <p className="text-slate-400">
          Gérez vos inscriptions aux activités
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-slate-900 border-slate-800">
          <TabsTrigger value="pending" className="data-[state=active]:bg-slate-800">
            En attente ({pendingRegistrations.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="data-[state=active]:bg-slate-800">
            Approuvées ({approvedRegistrations.length})
          </TabsTrigger>
          <TabsTrigger value="declined" className="data-[state=active]:bg-slate-800">
            Refusées ({declinedRegistrations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <RegistrationsList registrations={pendingRegistrations} />
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <RegistrationsList registrations={approvedRegistrations} />
        </TabsContent>

        <TabsContent value="declined" className="mt-6">
          <RegistrationsList registrations={declinedRegistrations} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function RegistrationsList({ registrations }: { registrations: RegistrationWithDetails[] }) {
  if (registrations.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="py-8">
          <p className="text-center text-slate-400">
            Aucune inscription dans cette catégorie
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {registrations.map((registration) => (
        <Card key={registration.id} className="bg-slate-900 border-slate-800">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-white">
                  {registration.activity?.name}
                </CardTitle>
                <p className="text-sm text-slate-400 mt-1">
                  {registration.activity?.scheduled_at &&
                    new Date(registration.activity.scheduled_at).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                </p>
              </div>
              <StatusBadge status={registration.status} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Arme:</span>
                <span className="text-sm text-white font-medium">
                  {registration.weapon?.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Priorité:</span>
                <span className="text-sm text-white font-medium">
                  #{registration.priority}
                </span>
              </div>
              {registration.notes && (
                <div className="mt-2 p-3 bg-slate-800 rounded">
                  <p className="text-sm text-slate-300">{registration.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    pending: { label: 'En attente', color: 'bg-yellow-500/10 text-yellow-400' },
    approved: { label: 'Approuvée', color: 'bg-green-500/10 text-green-400' },
    declined: { label: 'Refusée', color: 'bg-red-500/10 text-red-400' },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending

  return (
    <span className={`px-3 py-1 rounded-full text-sm ${config.color}`}>
      {config.label}
    </span>
  )
}
