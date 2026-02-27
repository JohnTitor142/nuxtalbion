'use client'

import { use, useEffect, useState } from 'react'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Activity, ActivityRegistration, Weapon, UserProfile, CompositionSlot, ActivityStatus } from '@/types'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, Save, Play, Lock, Edit, Settings, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, pointerWithin, useSensor, useSensors, PointerSensor, MouseSensor } from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { getWeaponIcon, ACTIVITY_STATUS_LABELS } from '@/types'

interface RegistrationWithDetails extends ActivityRegistration {
  id: string
  user_id: string
  user?: UserProfile
  weapon1?: Weapon
  weapon2?: Weapon
  weapon3?: Weapon
}

interface RoasterSlot {
  group_number: number
  slot_position: number
  user_id?: string
  weapon_id?: string
  registration?: RegistrationWithDetails
  composition_weapon_id?: string
}

interface PlayerCardProps {
  registration: RegistrationWithDetails
  selectedWeaponId: string
  onSelectWeapon: (weaponId: string) => void
  isDragging?: boolean
  canManage?: boolean
}

function PlayerCard({ registration, selectedWeaponId, onSelectWeapon, isDragging = false, canManage = false }: PlayerCardProps) {
  const weapons = [
    registration.weapon1,
    registration.weapon2,
    registration.weapon3
  ].filter(Boolean) as Weapon[]

  const selectedWeapon = weapons.find(w => w.id === selectedWeaponId) || weapons[0]

  const { attributes, listeners, setNodeRef, transform, isDragging: isDraggingState } = useDraggable({
    id: `reg-${registration.id}`,
    data: {
      registration,
      selectedWeaponId: selectedWeapon?.id
    },
    disabled: !canManage
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  const bgColor = 'bg-gradient-to-br from-purple-600 to-pink-600'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(canManage ? listeners : {})}
      {...(canManage ? attributes : {})}
      className={`${bgColor} rounded-xl p-5 ${canManage ? 'cursor-move' : 'cursor-default'} transition-all ${canManage ? 'hover:scale-105 hover:shadow-xl' : ''} ${isDraggingState ? 'opacity-50' : ''} shadow-lg`}
    >
      {/* Nom du joueur */}
      <div className="flex items-center justify-center mb-4">
        <p className="font-bold text-white text-lg tracking-wide bg-black/20 px-4 py-1 rounded-full shadow-inner">{registration.user?.username}</p>
      </div>

      {/* Sélection des armes - UNIQUEMENT avec images */}
      <div className="flex gap-4 justify-center">
        {weapons.map((weapon, idx) => (
          <button
            key={`${weapon.id}-${idx}`}
            onClick={(e) => {
              e.stopPropagation()
              onSelectWeapon(weapon.id)
            }}
            className={`relative group transition-all ${selectedWeaponId === weapon.id
              ? 'ring-4 ring-white ring-offset-2 ring-offset-purple-600 scale-110 z-10'
              : 'opacity-60 hover:opacity-100 hover:scale-105'
              }`}
            disabled={!canManage}
            title={weapon.name}
          >
            <div className={`w-16 h-16 bg-black/40 rounded-xl p-2 flex items-center justify-center shadow-inner ${selectedWeaponId === weapon.id ? 'bg-white/20' : ''
              }`}>
              {weapon.icon_url ? (
                <img
                  src={weapon.icon_url}
                  alt={weapon.name}
                  className="w-full h-full object-contain drop-shadow-md"
                />
              ) : (
                <div className="w-full h-full bg-slate-700/50 rounded-lg flex items-center justify-center text-sm font-bold text-slate-400">?</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

interface SlotProps {
  slot: RoasterSlot
  onRemove: () => void
  compositionWeapon?: Weapon
  isLocked: boolean
  canManage?: boolean
}

function Slot({ slot, onRemove, compositionWeapon, isLocked, canManage = false }: SlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${slot.group_number}-${slot.slot_position}`,
    data: slot,
    disabled: !canManage
  })

  // Trouver l'arme actuellement assignée
  let assignedWeapon: Weapon | undefined
  if (slot.weapon_id && slot.registration) {
    if (slot.registration.weapon1?.id === slot.weapon_id) assignedWeapon = slot.registration.weapon1
    if (slot.registration.weapon2?.id === slot.weapon_id) assignedWeapon = slot.registration.weapon2
    if (slot.registration.weapon3?.id === slot.weapon_id) assignedWeapon = slot.registration.weapon3
  }

  const bgColor = assignedWeapon ? 'bg-gradient-to-br from-purple-600/80 to-pink-600/80' : 'bg-slate-800/30'

  return (
    <div
      ref={setNodeRef}
      className={`aspect-square rounded border-2 border-dashed p-3 text-center transition-all flex flex-col relative overflow-hidden ${isOver ? 'border-purple-400 bg-purple-400/20 scale-105' :
        slot.user_id ? `${bgColor} border-transparent shadow-md` :
          'border-slate-700/50 hover:border-slate-600'
        }`}
    >
      {!slot.user_id ? (
        // Slot vide : Arme requise au centre
        <div className="flex-1 flex flex-col items-center justify-center">
          {compositionWeapon ? (
            <div className="flex flex-col items-center gap-2 opacity-60">
              {compositionWeapon.icon_url ? (
                <img
                  src={compositionWeapon.icon_url}
                  alt={compositionWeapon.name}
                  className="w-20 h-20 object-contain drop-shadow-md"
                  title={compositionWeapon.name}
                />
              ) : (
                <div className="w-20 h-20 bg-slate-800/80 rounded-xl flex items-center justify-center text-slate-500 font-bold text-2xl drop-shadow-sm">?</div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-40">
              <span className="text-slate-500 text-sm font-semibold">Libre</span>
            </div>
          )}
        </div>
      ) : (
        // Slot assigné : Arme du joueur au centre
        <>
          {/* Indicateur de l'arme demandée en miniature (en haut à gauche) */}
          {compositionWeapon && (
            <div className="absolute top-2 left-2 opacity-50">
              {compositionWeapon.icon_url && (
                <img
                  src={compositionWeapon.icon_url}
                  alt={compositionWeapon.name}
                  className="w-7 h-7 object-contain drop-shadow"
                  title={`Requis: ${compositionWeapon.name}`}
                />
              )}
            </div>
          )}

          <div className="flex-1 flex flex-col items-center justify-center min-h-0 relative z-10">
            {assignedWeapon && assignedWeapon.icon_url && (
              <div className="w-24 h-24 bg-black/20 rounded-xl p-2 flex items-center justify-center drop-shadow-xl transform transition-transform hover:scale-105">
                <img
                  src={assignedWeapon.icon_url}
                  alt={assignedWeapon.name}
                  className="w-full h-full object-contain drop-shadow-md"
                  title={assignedWeapon.name}
                />
              </div>
            )}
          </div>

          {/* Joueur assigné - en bas */}
          <div className="flex-shrink-0 mt-2 relative z-20">
            <div className="bg-black/60 backdrop-blur-sm rounded-md px-2 py-1.5 shadow-lg border border-white/5 mx-1">
              <p className="text-white text-[13px] font-bold truncate tracking-wide">
                {slot.registration?.user?.username}
              </p>
            </div>
            {!isLocked && canManage && (
              <button
                onClick={onRemove}
                className="absolute -top-2 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold hover:bg-red-600 shadow-xl border border-white/20 transition-transform hover:scale-110"
              >
                ✕
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default function RoasterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, loading: authLoading } = useRequireAuth() // Accessible à tous les utilisateurs connectés
  const [activity, setActivity] = useState<Activity | null>(null)
  const [registrations, setRegistrations] = useState<RegistrationWithDetails[]>([])
  const [roasterSlots, setRoasterSlots] = useState<RoasterSlot[]>([])
  const [compositionSlots, setCompositionSlots] = useState<CompositionSlot[]>([])
  const [weapons, setWeapons] = useState<Weapon[]>([])
  const [selectedWeapons, setSelectedWeapons] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)

  // Nouveaux états pour les paramètres
  const [compositions, setCompositions] = useState<any[]>([])
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    composition_id: '',
    scheduled_at: ''
  })
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsDeleting, setSettingsDeleting] = useState(false)
  const [settingsError, setSettingsError] = useState('')

  const supabase = createClient()
  const router = useRouter()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  )

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, id])

  const loadData = async () => {
    try {
      setLoading(true)

      // Charger l'activité avec composition
      const { data: activityData, error: activityError } = await supabase
        .from('activities')
        .select('*, composition:compositions(*)')
        .eq('id', id)
        .single()

      if (activityError || !activityData) {
        setError("Activité non trouvée")
        return
      }

      setActivity(activityData as Activity)

      const composition = (activityData as any).composition
      const comp = Array.isArray(composition) ? composition[0] : composition
      const totalGroups = comp?.total_groups || 1

      // Charger les inscriptions avec détails
      const { data: regs } = await supabase
        .from('activity_registrations')
        .select(`
          *,
          user:users_profiles(*),
          weapon1:weapon1_id(*),
          weapon2:weapon2_id(*),
          weapon3:weapon3_id(*)
        `)
        .eq('activity_id', id)

      setRegistrations(regs || [])

      // Initialiser les armes sélectionnées (par défaut weapon1)
      const initialSelected: Record<string, string> = {}
      regs?.forEach((reg: any) => {
        if (reg.weapon1_id) {
          initialSelected[reg.id] = reg.weapon1_id
        }
      })
      setSelectedWeapons(initialSelected)

      // Charger les slots de composition
      let compSlots: any[] = []
      if (comp?.id) {
        const { data: compSlotsData } = await supabase
          .from('composition_slots')
          .select('*, weapon:weapons(*)')
          .eq('composition_id', comp.id)
          .order('group_number')

        compSlots = compSlotsData || []
        setCompositionSlots(compSlots)
      }

      // Charger toutes les armes pour référence
      const { data: weaponsData } = await supabase
        .from('weapons')
        .select('*')
        .eq('is_active', true)

      setWeapons(weaponsData || [])

      // Charger les compositions
      const { data: comps } = await supabase
        .from('compositions')
        .select('*')
        .order('name', { ascending: true })
      setCompositions(comps || [])

      // Charger le roaster existant
      const { data: existingRoaster } = await supabase
        .from('roasters')
        .select('*')
        .eq('activity_id', id)

      // Initialiser les slots (grilles 4x5 par groupe)
      const slots: RoasterSlot[] = []
      for (let group = 1; group <= totalGroups; group++) {
        // Récupérer les armes de composition pour ce groupe
        const groupCompSlots = compSlots.filter((cs: any) => cs.group_number === group)

        // Distribuer les armes selon les quantités
        let currentSlotIndex = 0
        const weaponDistribution: string[] = []

        for (const compSlot of groupCompSlots) {
          const quantity = compSlot.quantity || 1
          for (let i = 0; i < quantity; i++) {
            weaponDistribution.push(compSlot.weapon_id)
          }
        }

        for (let slot = 1; slot <= 20; slot++) {
          const existing = existingRoaster?.find((r: any) => r.group_number === group && r.slot_position === slot) as any
          const registration = regs?.find((r: any) => r.user_id === existing?.user_id) as any

          // Assigner l'arme de composition pour ce slot
          const compWeaponId = weaponDistribution[slot - 1] || undefined

          slots.push({
            group_number: group,
            slot_position: slot,
            user_id: existing?.user_id,
            weapon_id: existing?.weapon_id,
            registration: registration,
            composition_weapon_id: compWeaponId
          })
        }
      }

      setRoasterSlots(slots)
    } catch (error) {
      console.error('Error loading roaster:', error)
      setError("Erreur lors du chargement")
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Si on drop sur un slot
    if (overId.startsWith('slot-')) {
      const [, groupStr, slotStr] = overId.split('-')
      const group = parseInt(groupStr)
      const slot = parseInt(slotStr)

      // Si on drag depuis la liste de registrations
      if (activeId.startsWith('reg-')) {
        const regId = activeId.replace('reg-', '')
        const registration = registrations.find(r => r.id === regId)
        const selectedWeaponId = selectedWeapons[regId]

        if (registration && selectedWeaponId) {
          // Ajouter au roaster
          setRoasterSlots(prev => prev.map(s => {
            if (s.group_number === group && s.slot_position === slot) {
              return {
                ...s,
                user_id: registration.user_id,
                weapon_id: selectedWeaponId,
                registration
              }
            }
            return s
          }))
        }
      }
    }
  }

  const handleRemoveFromSlot = (group: number, slot: number) => {
    setRoasterSlots(prev => prev.map(s => {
      if (s.group_number === group && s.slot_position === slot) {
        return {
          ...s,
          user_id: undefined,
          weapon_id: undefined,
          registration: undefined
        }
      }
      return s
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')

    try {
      // Supprimer l'ancien roaster
      await supabase
        .from('roasters')
        .delete()
        .eq('activity_id', id)

      // Créer le nouveau roaster
      const roasterData = roasterSlots
        .filter(s => s.user_id && s.weapon_id)
        .map(s => ({
          activity_id: id,
          user_id: s.user_id!,
          weapon_id: s.weapon_id!,
          group_number: s.group_number,
          slot_position: s.slot_position,
          assigned_by: user?.id!,
        }))

      if (roasterData.length > 0) {
        const { error: insertError } = await (supabase as any)
          .from('roasters')
          .insert(roasterData)

        if (insertError) throw insertError
      }

      alert('Roaster sauvegardé avec succès')
    } catch (error: any) {
      console.error('Error saving roaster:', error)
      setError(error.message || "Erreur lors de la sauvegarde")
    } finally {
      setSaving(false)
    }
  }

  const handleOpenSettings = () => {
    if (!activity) return
    const localDate = new Date(activity.scheduled_at)
    const tzOffsetMs = localDate.getTimezoneOffset() * 60000
    const localISOTime = (new Date(localDate.getTime() - tzOffsetMs)).toISOString().slice(0, 16)

    setFormData({
      name: activity.name,
      description: activity.description || '',
      composition_id: activity.composition_id || '',
      scheduled_at: localISOTime
    })
    setSettingsError('')
    setShowSettingsModal(true)
  }

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSettingsSaving(true)
    setSettingsError('')

    try {
      const activityData = {
        name: formData.name,
        description: formData.description || null,
        composition_id: formData.composition_id || null,
        scheduled_at: new Date(formData.scheduled_at).toISOString(),
      }

      const { error: updateError } = await (supabase as any)
        .from('activities')
        .update(activityData)
        .eq('id', id)

      if (updateError) throw updateError

      setShowSettingsModal(false)
      loadData()
    } catch (error: any) {
      console.error('Error saving activity:', error)
      setSettingsError(error.message || "Erreur lors de l'enregistrement")
    } finally {
      setSettingsSaving(false)
    }
  }

  const handleDeleteActivity = async () => {
    if (!confirm("Voulez-vous vraiment supprimer cette activité ? Toutes les inscriptions et données liées seront effacées définitivement.")) {
      return
    }

    setSettingsDeleting(true)
    setSettingsError('')

    try {
      const { error: deleteError } = await (supabase as any)
        .from('activities')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      router.push('/activities')
    } catch (error: any) {
      console.error('Error deleting activity:', error)
      setSettingsError(error.message || "Erreur lors de la suppression")
      setSettingsDeleting(false)
    }
  }

  const handleStatusChange = async (newStatus: ActivityStatus) => {
    setSaving(true)
    setError('')

    try {
      const { error: updateError } = await (supabase as any)
        .from('activities')
        .update({ status: newStatus })
        .eq('id', id)

      if (updateError) throw updateError

      setActivity(prev => prev ? { ...prev, status: newStatus } : null)
    } catch (error: any) {
      console.error('Error changing status:', error)
      setError(error.message || "Erreur lors du changement de statut")
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="text-slate-400">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error && !activity) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-6 py-4 rounded-lg">
          {error}
        </div>
        <Link href="/activities">
          <Button variant="outline" className="mt-4 border-slate-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux activités
          </Button>
        </Link>
      </div>
    )
  }

  const composition = (activity as any)?.composition
  const comp = Array.isArray(composition) ? composition[0] : composition
  const totalGroups = comp?.total_groups || 1
  const isAdminOrShotcaller = user?.role === 'admin' || user?.role === 'shotcaller'
  const isCompleted = activity?.status === 'completed'
  const canManage = isAdminOrShotcaller && !isCompleted

  // Filtrer les joueurs déjà assignés - ils ne doivent apparaître qu'une seule fois
  const assignedUserIds = new Set(roasterSlots.filter(s => s.user_id).map(s => s.user_id))
  const availableRegistrations = registrations.filter(r => !assignedUserIds.has(r.user_id))

  const isRegistered = user ? registrations.some(r => r.user_id === user.id) : false
  const canRegisterOrEdit = activity?.status === 'upcoming' || activity?.status === 'ongoing'

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      collisionDetection={pointerWithin}
    >
      <div className="space-y-6 animate-fade-in max-w-[1800px] mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/activities">
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Users className="w-7 h-7 text-purple-400" />
                {canManage ? 'Gestion des Joueurs' : 'Roster de l\'activité'}
              </h1>
              <p className="text-slate-400 mt-1">{activity?.name}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 md:gap-3 items-center">
            {canManage && (
              <Button
                onClick={handleOpenSettings}
                variant="outline"
                className="border-slate-700 hover:bg-slate-800 h-[40px] px-3 md:px-4"
                title="Paramètres de l'activité"
              >
                <Settings className="w-4 h-4 md:mr-2 text-slate-400" />
                <span className="hidden md:inline">Paramètres</span>
              </Button>
            )}

            {canRegisterOrEdit && (
              <>
                {!isRegistered ? (
                  <Link href={`/activities/${activity.id}/register`}>
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-[40px] px-3 md:px-4">
                      <span className="hidden md:inline">S'inscrire</span>
                      <span className="md:hidden">S'inscrire</span>
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/activities/${activity.id}/register`}>
                    <Button variant="outline" className="border-slate-700 text-purple-300 hover:text-purple-200 h-[40px] px-3 md:px-4">
                      <Edit className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">Gérer mon inscription</span>
                      <span className="md:hidden">Gérer</span>
                    </Button>
                  </Link>
                )}
              </>
            )}

            {canManage && (
              <>
                <div className="w-px h-8 bg-slate-700 mx-1 hidden md:block"></div>
                <label className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="whitespace-nowrap hidden lg:inline">Statut :</span>
                  <select
                    value={activity?.status || 'upcoming'}
                    onChange={(e) => handleStatusChange(e.target.value as ActivityStatus)}
                    className="rounded-md border border-slate-600 bg-slate-800/80 px-2 md:px-3 py-1.5 text-white text-sm font-medium focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 focus:outline-none cursor-pointer h-[40px]"
                    disabled={saving}
                  >
                    <option value="upcoming">{ACTIVITY_STATUS_LABELS.upcoming}</option>
                    <option value="ongoing">{ACTIVITY_STATUS_LABELS.ongoing}</option>
                    <option value="completed">{ACTIVITY_STATUS_LABELS.completed}</option>
                  </select>
                </label>
                <Button
                  onClick={handleSave}
                  variant="outline"
                  className="border-slate-700 h-[40px] px-3 md:px-4"
                  disabled={saving}
                >
                  <Save className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Sauvegarder roaster</span>
                  <span className="md:hidden">Sauver</span>
                </Button>
              </>
            )}
            {isCompleted && (
              <span className="px-4 py-2 rounded-lg bg-slate-600/50 text-slate-300 flex items-center gap-2 h-[40px]">
                Activité terminée — modification du roster désactivée
              </span>
            )}
            {!canManage && !isCompleted && activity?.status && (
              <span className={`px-4 py-2 rounded-lg bg-gradient-to-r text-sm font-medium border shadow-lg flex items-center h-[40px]
                ${activity.status === 'upcoming' ? 'from-blue-500/20 to-cyan-500/20 border-blue-500/30' : ''}
                ${activity.status === 'ongoing' ? 'from-green-500/20 to-emerald-500/20 border-green-500/30' : ''}
              `}>
                {ACTIVITY_STATUS_LABELS[activity.status]}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Grille des emplacements - 4/5 de l'écran */}
          <div className="lg:col-span-4">
            <h2 className="text-xl font-bold text-white mb-4">Roster</h2>
            {/* Un groupe par ligne, à la verticale */}
            <div className="space-y-4">
              {Array.from({ length: totalGroups }, (_, groupIndex) => {
                const groupNum = groupIndex + 1
                const groupSlots = roasterSlots.filter(s => s.group_number === groupNum)

                return (
                  <Card key={groupNum} className="glass-effect border-slate-700/50">
                    <CardHeader className="py-3 px-5 border-b border-slate-700/50">
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                          {groupNum}
                        </div>
                        <span>Groupe {groupNum}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5">
                      {/* Grille 4 lignes x 5 colonnes */}
                      <div className="grid grid-cols-5 gap-3">
                        {groupSlots.map((slot) => {
                          const compositionWeapon = weapons.find(w => w.id === slot.composition_weapon_id)

                          return (
                            <Slot
                              key={`${groupNum}-${slot.slot_position}`}
                              slot={slot}
                              onRemove={() => handleRemoveFromSlot(groupNum, slot.slot_position)}
                              compositionWeapon={compositionWeapon}
                              isLocked={false}
                              canManage={canManage}
                            />
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Liste des joueurs inscrits - 1/5 de l'écran */}
          {canManage && (
            <div className="lg:col-span-1">
              <h2 className="text-xl font-bold text-white mb-4">
                Joueurs en attente ({availableRegistrations.length})
              </h2>
              <Card className="glass-effect border-slate-700/50 sticky top-6">
                <CardContent className="p-4">
                  <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2" style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#475569 #1e293b'
                  }}>
                    {availableRegistrations.map((reg) => (
                      <PlayerCard
                        key={reg.id}
                        registration={reg}
                        selectedWeaponId={selectedWeapons[reg.id]}
                        onSelectWeapon={(weaponId) => {
                          setSelectedWeapons(prev => ({
                            ...prev,
                            [reg.id]: weaponId
                          }))
                        }}
                        canManage={canManage}
                      />
                    ))}
                    {availableRegistrations.length === 0 && (
                      <div className="text-center text-slate-500 py-12">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-sm">Tous les joueurs sont assignés</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Liste des joueurs inscrits pour les utilisateurs sans droits de gestion */}
          {!canManage && registrations.length > 0 && (
            <div className="lg:col-span-1">
              <h2 className="text-xl font-bold text-white mb-4">
                Joueurs inscrits ({registrations.length})
              </h2>
              <Card className="glass-effect border-slate-700/50 sticky top-6">
                <CardContent className="p-4">
                  <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto pr-2" style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#475569 #1e293b'
                  }}>
                    {registrations.map((reg) => {
                      // Afficher l'arme assignée dans le roster, ou la première arme par défaut
                      const assignedSlot = roasterSlots.find(s => s.user_id === reg.user_id)
                      const defaultWeaponId = assignedSlot?.weapon_id || reg.weapon1?.id || reg.weapon2?.id || reg.weapon3?.id

                      return (
                        <PlayerCard
                          key={reg.id}
                          registration={reg}
                          selectedWeaponId={defaultWeaponId || ''}
                          onSelectWeapon={() => { }}
                          canManage={false}
                        />
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay dropAnimation={null}>
        {activeId && activeId.startsWith('reg-') ? (
          <div className="opacity-90 cursor-grabbing">
            {(() => {
              const regId = activeId.replace('reg-', '')
              const reg = registrations.find(r => r.id === regId)
              return reg ? (
                <PlayerCard
                  registration={reg}
                  selectedWeaponId={selectedWeapons[regId]}
                  onSelectWeapon={() => { }}
                  isDragging
                  canManage={canManage}
                />
              ) : null
            })()}
          </div>
        ) : null}
      </DragOverlay>

      {/* Modal de Paramètres d'Activité */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="glass-effect border-slate-700/50 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-purple-400" />
              Paramètres de l'Activité
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Modifiez les détails de cette activité ou supprimez-la
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveSettings} className="space-y-5 mt-4">
            {settingsError && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
                {settingsError}
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
                La composition servira de template pour les inscriptions. Modifier ceci n'impacte pas le roster déjà construit de manière immédiate, mais changera le template des backgrounds.
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
              <Button
                type="button"
                variant="outline"
                onClick={handleDeleteActivity}
                disabled={settingsSaving || settingsDeleting}
                className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                title="Supprimer l'activité"
              >
                {settingsDeleting ? (
                  <div className="w-4 h-4 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>

              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600"
                disabled={settingsSaving || settingsDeleting}
              >
                {settingsSaving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Enregistrement...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSettingsModal(false)}
                className="border-slate-700"
                disabled={settingsSaving || settingsDeleting}
              >
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DndContext>
  )
}
