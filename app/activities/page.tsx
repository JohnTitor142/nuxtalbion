'use client'

import { useRequireAuth } from '@/hooks/useRequireAuth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ActivityCard } from '@/components/ActivityCard'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Activity, ActivityRegistration, Composition, ActivityStatus } from '@/types'
import { Plus, Calendar as CalendarIcon, History, Save, X, Settings, Trash2 } from 'lucide-react'

interface ActivityWithComposition extends Activity {
  id: string
  composition?: Composition
  userRegistration?: ActivityRegistration
}

export default function ActivitiesPage() {
  const { user, loading } = useRequireAuth()
  const [upcomingActivities, setUpcomingActivities] = useState<ActivityWithComposition[]>([])
  const [completedActivities, setCompletedActivities] = useState<ActivityWithComposition[]>([])
  const [compositions, setCompositions] = useState<Composition[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    composition_id: '',
    scheduled_at: ''
  })
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const canManage = user?.role === 'admin' || user?.role === 'shotcaller'

  useEffect(() => {
    if (user) {
      loadActivities()
      loadCompositions()
    }
  }, [user])

  const loadCompositions = async () => {
    try {
      const { data } = await supabase
        .from('compositions')
        .select('*')
        .order('name', { ascending: true })

      setCompositions(data || [])
    } catch (error) {
      console.error('Error loading compositions:', error)
    }
  }

  const loadActivities = async () => {
    try {
      setLoadingData(true)

      // Charger activités à venir (upcoming et ongoing)
      const { data: upcoming } = await supabase
        .from('activities')
        .select('*, composition:compositions(*)')
        .in('status', ['upcoming', 'ongoing'])
        .order('scheduled_at', { ascending: true })

      // Charger activités passées
      const { data: completed } = await supabase
        .from('activities')
        .select('*, composition:compositions(*)')
        .eq('status', 'completed')
        .order('scheduled_at', { ascending: false })
        .limit(10)

      // Charger les inscriptions de l'utilisateur
      const { data: registrations } = await supabase
        .from('activity_registrations')
        .select('*')
        .eq('user_id', user?.id!)

      // Mapper les inscriptions aux activités
      const registrationsMap = new Map(
        registrations?.map((r: any) => [r.activity_id, r]) || []
      )

      setUpcomingActivities(
        upcoming?.map((a: any) => ({
          ...a,
          composition: Array.isArray(a.composition) ? a.composition[0] : a.composition,
          userRegistration: registrationsMap.get(a.id)
        })) || []
      )

      setCompletedActivities(
        completed?.map((a: any) => ({
          ...a,
          composition: Array.isArray(a.composition) ? a.composition[0] : a.composition,
          userRegistration: registrationsMap.get(a.id)
        })) || []
      )
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleOpenCreateModal = () => {
    setEditingActivityId(null)
    setFormData({ name: '', description: '', composition_id: '', scheduled_at: '' })
    setError('')
    setShowCreateModal(true)
  }

  const handleOpenEditModal = (activity: ActivityWithComposition) => {
    setEditingActivityId(activity.id)
    // Convertir la date du backend, typiquement ISO 8601, pour un <input type="datetime-local"> 
    // qui attend le format "YYYY-MM-DDThh:mm"
    const localDate = new Date(activity.scheduled_at)
    // On doit ajuster l'offset pour avoir l'heure correcte au format YYYY-MM-DDTHH:mm
    const tzOffsetMs = localDate.getTimezoneOffset() * 60000
    const localISOTime = (new Date(localDate.getTime() - tzOffsetMs)).toISOString().slice(0, 16)

    setFormData({
      name: activity.name,
      description: activity.description || '',
      composition_id: activity.composition_id || '',
      scheduled_at: localISOTime
    })
    setError('')
    setShowCreateModal(true)
  }

  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const activityData = {
        name: formData.name,
        description: formData.description || null,
        composition_id: formData.composition_id || null,
        scheduled_at: new Date(formData.scheduled_at).toISOString(),
      }

      if (editingActivityId) {
        // Mode modification
        const { error: updateError } = await (supabase as any)
          .from('activities')
          .update(activityData)
          .eq('id', editingActivityId)

        if (updateError) throw updateError
      } else {
        // Mode création
        const { error: insertError } = await (supabase as any)
          .from('activities')
          .insert({
            ...activityData,
            created_by: user?.id,
            status: 'upcoming'
          })

        if (insertError) throw insertError
      }

      setShowCreateModal(false)
      loadActivities()
    } catch (error: any) {
      console.error('Error saving activity:', error)
      setError(error.message || "Erreur lors de l'enregistrement")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteActivity = async () => {
    if (!editingActivityId) return
    if (!confirm("Voulez-vous vraiment supprimer cette activité ? Toutes les inscriptions et données liées seront effacées définitivement.")) {
      return
    }

    setDeleting(true)
    setError('')

    try {
      const { error: deleteError } = await (supabase as any)
        .from('activities')
        .delete()
        .eq('id', editingActivityId)

      if (deleteError) throw deleteError

      setShowCreateModal(false)
      loadActivities()
    } catch (error: any) {
      console.error('Error deleting activity:', error)
      setError(error.message || "Erreur lors de la suppression")
    } finally {
      setDeleting(false)
    }
  }

  const handleStatusChange = async (activityId: string, newStatus: ActivityStatus) => {
    try {
      const { error: updateError } = await (supabase as any)
        .from('activities')
        .update({ status: newStatus })
        .eq('id', activityId)

      if (updateError) throw updateError
      loadActivities()
    } catch (err: any) {
      console.error('Erreur lors du changement de statut:', err)
      setError(err.message || 'Erreur lors du changement de statut')
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

  // Fonction utilitaire pour grouper les activités par date
  const groupedUpcomingActivities = upcomingActivities.reduce((groups, activity) => {
    const date = new Date(activity.scheduled_at)
    // On garde uniquement la date "YYYY-MM-DD" pour le groupement
    const dateKey = date.toISOString().split('T')[0]

    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(activity)

    return groups
  }, {} as Record<string, ActivityWithComposition[]>)

  // Fonction pour formater la date du groupe
  const formatGroupDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const activityDate = new Date(date)
    activityDate.setHours(0, 0, 0, 0)

    if (activityDate.getTime() === today.getTime()) {
      return "Aujourd'hui"
    } else if (activityDate.getTime() === tomorrow.getTime()) {
      return "Demain"
    } else {
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }).replace(/^\w/, c => c.toUpperCase()) // Majuscule 1ere lettre
    }
  }

  return (
    <>
      <div className="space-y-10 animate-fade-in max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-5xl font-bold text-white mb-3 flex items-center gap-3">
              <CalendarIcon className="w-10 h-10 text-purple-400" />
              Activités
            </h1>
            <p className="text-slate-400 text-xl">
              Gérez vos participations aux activités de guilde
            </p>
          </div>

          {canManage && (
            <Button
              onClick={handleOpenCreateModal}
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer une activité
            </Button>
          )}
        </div>

        {/* Prochaines Activités */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <CalendarIcon className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">
              Prochaines Activités
            </h2>
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium">
              {upcomingActivities.length}
            </span>
          </div>

          {upcomingActivities.length === 0 ? (
            <Card className="glass-effect border-slate-700/50">
              <CardContent className="py-12">
                <div className="text-center">
                  <CalendarIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">
                    Aucune activité prévue pour le moment
                  </p>
                  {canManage && (
                    <p className="text-slate-500 text-sm mt-2">
                      Créez une activité pour commencer
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedUpcomingActivities)
                .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                .map(([dateString, activities]) => (
                  <div key={dateString} className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-300 border-b border-slate-700/50 pb-2">
                      {formatGroupDate(dateString)}
                    </h3>
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <ActivityCard
                          key={activity.id}
                          activity={activity}
                          userRole={user!.role}
                          isUpcoming={true}
                          isRegistered={!!activity.userRegistration}
                          compositionName={activity.composition?.name}
                          onStatusChange={canManage ? handleStatusChange : undefined}
                          onEdit={canManage ? handleOpenEditModal : undefined}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Activités Passées */}
        {completedActivities.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <History className="w-6 h-6 text-slate-500" />
              <h2 className="text-2xl font-bold text-slate-400">
                Activités Passées
              </h2>
              <span className="px-3 py-1 rounded-full bg-slate-700/50 text-slate-400 text-sm font-medium">
                {completedActivities.length}
              </span>
            </div>

            <div className="space-y-6">
              {completedActivities.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  userRole={user!.role}
                  isUpcoming={false}
                  isRegistered={!!activity.userRegistration}
                  compositionName={activity.composition?.name}
                  onStatusChange={canManage ? handleStatusChange : undefined}
                  onEdit={canManage ? handleOpenEditModal : undefined}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Création/Modification d'Activité */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="glass-effect border-slate-700/50 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              {editingActivityId ? (
                <>
                  <Settings className="w-6 h-6 text-purple-400" />
                  Paramètres de l'Activité
                </>
              ) : (
                <>
                  <Plus className="w-6 h-6 text-purple-400" />
                  Créer une Activité
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingActivityId
                ? "Modifiez les détails de cette activité ou supprimez-la"
                : "Planifiez une nouvelle activité pour votre guilde"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveActivity} className="space-y-5 mt-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-white font-medium">Nom de l'activité *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: ZvZ Caerleon"
                required
                className="bg-slate-900/50 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled_at" className="text-white font-medium">Date et heure *</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                required
                className="bg-slate-900/50 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="composition_id" className="text-white font-medium">Composition</Label>
              <select
                id="composition_id"
                value={formData.composition_id}
                onChange={(e) => setFormData({ ...formData, composition_id: e.target.value })}
                className="flex h-11 w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-white focus:border-purple-500 focus:ring-purple-500/20 focus:outline-none"
              >
                <option value="">-- Aucune composition --</option>
                {compositions.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name} ({comp.total_groups} groupe{comp.total_groups > 1 ? 's' : ''})
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                La composition servira de template pour les inscriptions
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white font-medium">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Détails de l'activité..."
                className="bg-slate-900/50 border-slate-700 text-white min-h-[100px]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              {editingActivityId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDeleteActivity}
                  disabled={saving || deleting}
                  className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                  title="Supprimer l'activité"
                >
                  {deleting ? (
                    <div className="w-4 h-4 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              )}

              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600"
                disabled={saving || deleting}
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Enregistrement...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editingActivityId ? "Enregistrer les modifications" : "Créer l'activité"}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="border-slate-700"
                disabled={saving || deleting}
              >
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
