'use client'

import { use, useEffect, useState } from 'react'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { Activity, ActivityRegistration, Weapon, UserProfile, CompositionSlot } from '@/types'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, Save, Play, Lock } from 'lucide-react'
import Link from 'next/link'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, pointerWithin, useSensor, useSensors, PointerSensor, MouseSensor } from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { CATEGORY_BG_COLORS, CATEGORY_ICONS } from '@/types'

interface RegistrationWithDetails extends ActivityRegistration {
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
}

function PlayerCard({ registration, selectedWeaponId, onSelectWeapon, isDragging = false }: PlayerCardProps) {
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
    }
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined

  const bgColor = selectedWeapon ? CATEGORY_BG_COLORS[selectedWeapon.category] : 'bg-slate-700'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${bgColor} rounded-lg p-3 cursor-move transition-all hover:scale-105 ${isDraggingState ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="font-bold text-white text-sm">{registration.user?.username}</p>
        <span className="text-xs text-white/80 font-semibold">
          {selectedWeapon ? CATEGORY_ICONS[selectedWeapon.category] : ''}
        </span>
      </div>
      <div className="flex gap-1">
        {weapons.map((weapon) => (
          <button
            key={weapon.id}
            onClick={(e) => {
              e.stopPropagation()
              onSelectWeapon(weapon.id)
            }}
            className={`flex-1 px-2 py-1 text-xs rounded transition-all ${
              selectedWeaponId === weapon.id
                ? 'bg-white/30 text-white font-bold'
                : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {weapon.name}
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
}

function Slot({ slot, onRemove, compositionWeapon, isLocked }: SlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${slot.group_number}-${slot.slot_position}`,
    data: slot
  })

  const weapon = slot.registration?.weapon1 || slot.registration?.weapon2 || slot.registration?.weapon3
  
  // Trouver l'arme actuellement assignée
  let assignedWeapon: Weapon | undefined
  if (slot.weapon_id && slot.registration) {
    if (slot.registration.weapon1?.id === slot.weapon_id) assignedWeapon = slot.registration.weapon1
    if (slot.registration.weapon2?.id === slot.weapon_id) assignedWeapon = slot.registration.weapon2
    if (slot.registration.weapon3?.id === slot.weapon_id) assignedWeapon = slot.registration.weapon3
  }
  
  const bgColor = assignedWeapon ? CATEGORY_BG_COLORS[assignedWeapon.category] : 'bg-slate-800/30'

  return (
    <div
      ref={setNodeRef}
      className={`aspect-square rounded border-2 border-dashed p-2 text-center transition-all ${
        isOver ? 'border-purple-400 bg-purple-400/20 scale-105' : 
        slot.user_id ? `${bgColor} border-transparent` : 
        'border-slate-700/50 hover:border-slate-600'
      }`}
    >
      {slot.user_id && slot.registration ? (
        <div className="flex flex-col h-full justify-center items-center relative">
          <p className="text-white text-xs font-bold truncate w-full mb-1">
            {slot.registration.user?.username}
          </p>
          {!isLocked && (
            <button
              onClick={onRemove}
              className="absolute top-0 right-0 text-white/70 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col h-full justify-center items-center px-1">
          {compositionWeapon ? (
            <>
              <span className="text-slate-500 text-lg mb-1">
                {CATEGORY_ICONS[compositionWeapon.category]}
              </span>
              <span className="text-slate-400 text-[9px] font-medium text-center leading-tight truncate w-full">
                {compositionWeapon.name}
              </span>
            </>
          ) : (
            <span className="text-slate-600 text-xs font-semibold">fill</span>
          )}
        </div>
      )}
    </div>
  )
}

export default function RoasterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, loading: authLoading } = useRequireAuth(['admin', 'shotcaller'])
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
        let slotIndex = 0
        
        for (let slot = 1; slot <= 20; slot++) {
          const existing = existingRoaster?.find((r: any) => r.group_number === group && r.slot_position === slot) as any
          const registration = regs?.find((r: any) => r.user_id === existing?.user_id) as any
          
          // Trouver l'arme de composition pour ce slot
          let compWeaponId: string | undefined
          for (const compSlot of groupCompSlots) {
            const quantity = compSlot.quantity || 1
            if (slotIndex < quantity) {
              compWeaponId = compSlot.weapon_id
              break
            }
            slotIndex -= quantity
          }
          slotIndex++
          
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

  const handleLockAndStart = async () => {
    if (!confirm('Voulez-vous confirmer le roaster et démarrer l\'activité ? Cette action est irréversible.')) {
      return
    }

    setSaving(true)
    setError('')

    try {
      // Sauvegarder le roaster d'abord
      await handleSave()

      // Mettre à jour l'activité
      const { error: updateError } = await (supabase as any)
        .from('activities')
        .update({
          roaster_locked: true,
          status: 'ongoing'
        })
        .eq('id', id)

      if (updateError) throw updateError

      router.push('/activities')
    } catch (error: any) {
      console.error('Error locking roaster:', error)
      setError(error.message || "Erreur")
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
      <div className="space-y-6 animate-fade-in max-w-[1800px] mx-auto">
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
                Gestion des Joueurs
              </h1>
              <p className="text-slate-400 mt-1">{activity?.name}</p>
            </div>
          </div>

          <div className="flex gap-3">{!activity?.roaster_locked && (
              <>
                <Button
                  onClick={handleSave}
                  variant="outline"
                  className="border-slate-700"
                  disabled={saving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
                <Button
                  onClick={handleLockAndStart}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  disabled={saving}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Confirmer et Démarrer
                </Button>
              </>
            )}
            {activity?.roaster_locked && (
              <span className="px-4 py-2 rounded-lg bg-slate-700/50 text-slate-400 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Roaster verrouillé
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Grille des emplacements - 3/4 de l'écran */}
          <div className="lg:col-span-3">
            <h2 className="text-xl font-bold text-white mb-4">Roster</h2>
            <div className="grid gap-4" style={{ 
              gridTemplateColumns: `repeat(${totalGroups}, 1fr)`,
              maxWidth: '100%'
            }}>
              {Array.from({ length: totalGroups }, (_, groupIndex) => {
                const groupNum = groupIndex + 1
                const groupSlots = roasterSlots.filter(s => s.group_number === groupNum)
                
                return (
                  <Card key={groupNum} className="glass-effect border-slate-700/50">
                    <CardHeader className="py-4 px-4">
                      <CardTitle className="text-center text-lg text-white">Groupe {groupNum}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-5 gap-2">
                        {groupSlots.map((slot) => {
                          const compositionWeapon = weapons.find(w => w.id === slot.composition_weapon_id)
                          
                          return (
                            <Slot
                              key={`${groupNum}-${slot.slot_position}`}
                              slot={slot}
                              onRemove={() => handleRemoveFromSlot(groupNum, slot.slot_position)}
                              compositionWeapon={compositionWeapon}
                              isLocked={!!activity?.roaster_locked}
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

          {/* Liste des joueurs inscrits - 1/4 de l'écran */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-bold text-white mb-4">
              Joueurs en attente ({availableRegistrations.length})
            </h2>
            <Card className="glass-effect border-slate-700/50">
              <CardContent className="p-4">
                <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2" style={{
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
                    />
                  ))}
                  {availableRegistrations.length === 0 && (
                    <div className="text-center text-slate-500 py-12">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Tous les joueurs sont assignés</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
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
                  onSelectWeapon={() => {}}
                  isDragging
                />
              ) : null
            })()}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
