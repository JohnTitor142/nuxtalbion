'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Activity, UserRole } from '@/types'
import type { ActivityStatus } from '@/types'
import { Calendar, Users, CheckCircle, Edit, Play } from 'lucide-react'
import { ACTIVITY_STATUS_LABELS } from '@/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface ActivityCardProps {
  activity: Activity
  userRole: UserRole
  isUpcoming: boolean
  isRegistered?: boolean
  compositionName?: string
  onStatusChange?: (activityId: string, newStatus: ActivityStatus) => void
}

export function ActivityCard({
  activity,
  userRole,
  isUpcoming,
  isRegistered,
  compositionName,
  onStatusChange
}: ActivityCardProps) {
  const canManage = userRole === 'admin' || userRole === 'shotcaller'
  const canRegisterOrEdit = activity.status === 'upcoming' || activity.status === 'ongoing'
  const canEditRoaster = canManage && activity.status !== 'completed'
  const router = useRouter()

  const statusColors = {
    upcoming: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    ongoing: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    completed: 'from-slate-500/20 to-slate-600/20 border-slate-500/30'
  }

  const handleCardClick = () => {
    router.push(`/activities/${activity.id}/roaster`)
  }

  return (
    <Card 
      onClick={handleCardClick}
      className={`glass-effect border-slate-700/50 card-hover cursor-pointer transition-transform hover:scale-[1.02] ${
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
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {onStatusChange && canManage ? (
                <label className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="whitespace-nowrap">Statut :</span>
                  <select
                    value={activity.status}
                    onChange={(e) => onStatusChange(activity.id, e.target.value as ActivityStatus)}
                    className="rounded-md border border-slate-600 bg-slate-800/80 px-3 py-1.5 text-white text-sm font-medium focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 focus:outline-none cursor-pointer"
                  >
                    <option value="upcoming">{ACTIVITY_STATUS_LABELS.upcoming}</option>
                    <option value="ongoing">{ACTIVITY_STATUS_LABELS.ongoing}</option>
                    <option value="completed">{ACTIVITY_STATUS_LABELS.completed}</option>
                  </select>
                </label>
              ) : (
                <span className={`px-4 py-2 rounded-lg bg-gradient-to-r text-sm font-medium border shadow-lg ${statusColors[activity.status]}`}>
                  {ACTIVITY_STATUS_LABELS[activity.status]}
                </span>
              )}
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
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {canRegisterOrEdit && (
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

              {canEditRoaster && (
                <Link href={`/activities/${activity.id}/roaster`}>
                  <Button size="sm" variant="outline" className="border-slate-700">
                    <Users className="w-4 h-4 mr-1" />
                    Gérer Roaster
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
  )
}
