'use client'

import { useRequireAuth } from '@/hooks/useRequireAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Activity, ActivityAssignment, UserProfile } from '@/types'
import { Users } from 'lucide-react'

interface ActivityWithAssignments extends Activity {
  assignments?: (ActivityAssignment & { user?: UserProfile })[]
}

export default function RostersPage() {
  const { user, loading } = useRequireAuth()
  const [activities, setActivities] = useState<ActivityWithAssignments[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadRosters()
    }
  }, [user])

  const loadRosters = async () => {
    try {
      setLoadingData(true)
      const { data: activitiesData } = await supabase
        .from('activities')
        .select('*')
        .in('status', ['locked', 'completed'])
        .order('scheduled_at', { ascending: false })

      if (activitiesData) {
        const activitiesWithAssignments = await Promise.all(
          activitiesData.map(async (activity) => {
            const { data: assignments } = await supabase
              .from('activity_assignments')
              .select(`
                *,
                user:users_profiles(*)
              `)
              .eq('activity_id', activity.id)

            return { ...activity, assignments: assignments || [] }
          })
        )
        setActivities(activitiesWithAssignments)
      }
    } catch (error) {
      console.error('Error loading rosters:', error)
    } finally {
      setLoadingData(false)
    }
  }

  if (loading || loadingData) {
    return <div className="text-white">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Rosters</h1>
        <p className="text-slate-400">Consultez les rosters des activités</p>
      </div>

      {activities.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-8">
            <p className="text-center text-slate-400">
              Aucun roster disponible pour le moment
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <Card key={activity.id} className="bg-slate-900 border-slate-800">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {activity.name}
                    </CardTitle>
                    <p className="text-sm text-slate-400 mt-1">
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
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {activity.assignments?.length || 0}
                    </div>
                    <p className="text-xs text-slate-400">participants</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {activity.assignments && activity.assignments.length > 0 ? (
                  <div className="space-y-2">
                    {activity.assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between p-3 bg-slate-800 rounded"
                      >
                        <span className="text-white font-medium">
                          {assignment.user?.username || 'Utilisateur inconnu'}
                        </span>
                        <span className="text-sm text-slate-400">
                          {assignment.notes}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-400 py-4">
                    Aucun participant assigné
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
