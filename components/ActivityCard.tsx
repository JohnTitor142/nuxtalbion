'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Activity, UserRole } from '@/types'
import { Calendar, Users, CheckCircle, Edit, Play } from 'lucide-react'
import { ACTIVITY_STATUS_LABELS } from '@/types'
import Link from 'next/link'

interface ActivityCardProps {
  activity: Activity
  userRole: UserRole
  isUpcoming: boolean
  isRegistered?: boolean
  compositionName?: string
}

export function ActivityCard({
  activity,
  userRole,
  isUpcoming,
  isRegistered,
  compositionName
}: ActivityCardProps) {
  const canManage = userRole === 'admin' || userRole === 'shotcaller'

  const statusColors = {
    upcoming: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    ongoing: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    completed: 'from-slate-500/20 to-slate-600/20 border-slate-500/30'
  }

  return (
    <Card className={`glass-effect border-slate-700/50 card-hover ${
      !isUpcoming ? 'opacity-60' : ''
    }`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white text-xl mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              {activity.name}
            </CardTitle>
            <p className="text-sm text-slate-400">
              {new Date(activity.scheduled_at).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            {compositionName && (
              <p className="text-sm text-slate-500 mt-1">
                Composition: {compositionName}
              </p>
            )}
          </div>
          <div>
            <span className={`px-4 py-2 rounded-lg bg-gradient-to-r text-sm font-medium border shadow-lg ${statusColors[activity.status]}`}>
              {ACTIVITY_STATUS_LABELS[activity.status]}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {/* Info section */}
          <div className="flex items-center gap-4 text-sm text-slate-400">
            {isRegistered && (
              <div className="flex items-center gap-1 text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>Inscrit</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isUpcoming && !activity.roaster_locked && (
              <>
                {!isRegistered ? (
                  <Link href={`/activities/${activity.id}/register`}>
                    <Button size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      S'inscrire
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/activities/${activity.id}/register`}>
                    <Button size="sm" variant="outline" className="border-slate-700">
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </Button>
                  </Link>
                )}
              </>
            )}

            {canManage && isUpcoming && (
              <Link href={`/activities/${activity.id}/roaster`}>
                <Button size="sm" variant="outline" className="border-slate-700">
                  <Users className="w-4 h-4 mr-1" />
                  Gérer Roaster
                </Button>
              </Link>
            )}

            {!isUpcoming && (
              <Link href={`/activities/${activity.id}/roaster`}>
                <Button size="sm" variant="ghost" className="text-slate-400">
                  Voir Roaster
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
