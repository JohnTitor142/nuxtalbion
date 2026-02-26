'use client'

import { use, useEffect, useState } from 'react'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Activity, ActivityRegistration, Weapon, UserProfile, CompositionSlot, ActivityStatus } from '@/types'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, Save, Play, Lock } from 'lucide-react'
import Link from 'next/link'
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
      className={`${bgColor} rounded-lg p-4 ${canManage ? 'cursor-move' : 'cursor-default'} transition-all ${canManage ? 'hover:scale-105 hover:shadow-xl' : ''} ${isDraggingState ? 'opacity-50' : ''} shadow-lg`}
    >
      {/* Nom du joueur + image de l'arme sélectionnée */}
      <div className="flex items-center justify-between mb-3">
        <p className="font-bold text-white text-base">{registration.user?.username}</p>
        <div className="flex items-center gap-1">
          {selectedWeapon?.icon_url && (
            <div className="w-10 h-10 bg-black/20 rounded p-1 flex items-center justify-center">
              <img
                src={selectedWeapon.icon_url}
                alt={selectedWeapon.name}
                className="w-full h-full object-contain"
                title={selectedWeapon.name}
              />
            </div>
          )}
        </div>
      </div>

      {/* Sélection des armes - UNIQUEMENT avec images */}
      <div className="flex gap-2 justify-center">
        {weapons.map((weapon) => (
          <button
            key={weapon.id}
            onClick={(e) => {
              e.stopPropagation()
              onSelectWeapon(weapon.id)
            }}
            className={`relative group transition-all ${selectedWeaponId === weapon.id
              ? 'ring-2 ring-white ring-offset-2 ring-offset-purple-600 scale-110'
              : 'opacity-60 hover:opacity-100 hover:scale-105'
              }`}
            disabled={!canManage}
            title={weapon.name}
          >
            <div className={`w-12 h-12 bg-black/30 rounded p-1.5 flex items-center justify-center ${selectedWeaponId === weapon.id ? 'bg-white/20' : ''
              }`}>
              {weapon.icon_url ? (
                <img
                  src={weapon.icon_url}
                  alt={weapon.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-slate-700 rounded flex items-center justify-center text-xs text-slate-400">?</div>
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
      className={`aspect-square rounded border-2 border-dashed p-3 text-center transition-all flex flex-col ${isOver ? 'border-purple-400 bg-purple-400/20 scale-105' :
        slot.user_id ? `${bgColor} border-transparent` :
          'border-slate-700/50 hover:border-slate-600'
        }`}
    >
      {/* Arme de composition - en haut */}
      <div className="flex-shrink-0 mb-auto">
        {compositionWeapon ? (
          <div className="flex flex-col items-center gap-1">
            {compositionWeapon.icon_url ? (
              <img
                src={compositionWeapon.icon_url}
                alt={compositionWeapon.name}
                className="w-10 h-10 object-contain"
                title={compositionWeapon.name}
              />
            ) : (
              <div className="w-10 h-10 bg-slate-700 rounded flex items-center justify-center text-slate-400">?</div>
            )}
          </div>
        ) : (
          <div className="w-10 h-10 flex items-center justify-center">
            <span className="text-slate-600 text-xs font-semibold">fill</span>
          </div>
        )}
      </div>

      {/* Arme assignée au joueur - au centre */}
      {assignedWeapon && (
        <div className="flex-shrink-0 my-1">
          <div className="flex flex-col items-center">
            {assignedWeapon.icon_url && (
              <div className="w-12 h-12 bg-black/40 rounded p-1 flex items-center justify-center">
                <img
                  src={assignedWeapon.icon_url}
                  alt={assignedWeapon.name}
                  className="w-full h-full object-contain"
                  title={assignedWeapon.name}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Joueur assigné - en bas */}
      {slot.user_id && slot.registration && (
        <div className="flex-shrink-0 mt-auto relative">
          <div className="bg-black/40 rounded px-2 py-1.5">
            <p className="text-white text-[11px] font-bold truncate">
              {slot.registration.user?.username}
            </p>
          </div>
          {!isLocked && canManage && (
            <button
              onClick={onRemove}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 shadow-lg"
            >
              ✕
            </button>
          )}
        </div>
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

          <div className="flex gap-3">
            {canManage && (
              <>
                <label className="flex items-center gap-2 text-sm text-slate-400 mr-2">
                  <span className="whitespace-nowrap hidden sm:inline">Statut :</span>
                  <select
                    value={activity?.status || 'upcoming'}
                    onChange={(e) => handleStatusChange(e.target.value as ActivityStatus)}
                    className="rounded-md border border-slate-600 bg-slate-800/80 px-3 py-1.5 text-white text-sm font-medium focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 focus:outline-none cursor-pointer h-[40px]"
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
                  className="border-slate-700 h-[40px]"
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
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
    </DndContext>
  )
}
