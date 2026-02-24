'use client'

import { useRequireAuth } from '@/hooks/useRequireAuth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WeaponSelector } from '@/components/WeaponSelector'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Composition, CompositionSlot, Weapon } from '@/types'
import { Plus, Puzzle, Edit, Trash2, Save, X } from 'lucide-react'

interface CompositionWithSlots extends Composition {
  slots?: CompositionSlot[]
}

interface SlotInput {
  weapon_id: string
  quantity: number
  group_number: number
}

export default function CompositionsPage() {
  const { user, loading } = useRequireAuth(['admin', 'shotcaller'])
  const [compositions, setCompositions] = useState<CompositionWithSlots[]>([])
  const [weapons, setWeapons] = useState<Weapon[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    total_groups: 1
  })
  const [slots, setSlots] = useState<SlotInput[]>([])
  const [activeGroupForm, setActiveGroupForm] = useState(1)
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    try {
      setLoadingData(true)

      // Charger compositions
      const { data: comps } = await supabase
        .from('compositions')
        .select('*, slots:composition_slots(*)')
        .order('created_at', { ascending: false })

      setCompositions(comps || [])

      // Charger armes
      const { data: weaponsData } = await supabase
        .from('weapons')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      setWeapons(weaponsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleCreate = () => {
    setEditingId(null)
    setFormData({ name: '', description: '', total_groups: 1 })
    setSlots([])
    setActiveGroupForm(1)
    setShowForm(true)
  }

  const handleEdit = (comp: CompositionWithSlots) => {
    setEditingId(comp.id)
    setFormData({
      name: comp.name,
      description: comp.description || '',
      total_groups: comp.total_groups
    })
    setSlots(comp.slots?.map(s => ({
      weapon_id: s.weapon_id || '',
      quantity: s.quantity,
      group_number: s.group_number
    })) || [])
    setActiveGroupForm(1)
    setShowForm(true)
  }

  const handleAddSlot = () => {
    const groupSlots = slots.filter(s => s.group_number === activeGroupForm)
    const totalInGroup = groupSlots.reduce((sum, s) => sum + s.quantity, 0)
    
    if (totalInGroup >= 20) {
      alert('Un groupe ne peut pas avoir plus de 20 slots')
      return
    }

    setSlots([...slots, { weapon_id: '', quantity: 1, group_number: activeGroupForm }])
  }

  const handleRemoveSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index))
  }

  const handleSlotChange = (index: number, field: 'weapon_id' | 'quantity', value: string | number) => {
    setSlots(slots.map((s, i) => i === index ? { ...s, [field]: value } : s))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Valider les slots
      const validSlots = slots.filter(s => s.weapon_id && s.quantity > 0)
      
      // Vérifier les limites par groupe
      for (let group = 1; group <= formData.total_groups; group++) {
        const groupSlots = validSlots.filter(s => s.group_number === group)
        const total = groupSlots.reduce((sum, s) => sum + s.quantity, 0)
        if (total > 20) {
          alert(`Le groupe ${group} dépasse la limite de 20 slots`)
          return
        }
      }

      if (editingId) {
        // Mise à jour
        const { error: updateError } = await (supabase as any)
          .from('compositions')
          .update({
            name: formData.name,
            description: formData.description || null,
            total_groups: formData.total_groups
          })
          .eq('id', editingId)

        if (updateError) throw updateError

        // Supprimer anciens slots
        await supabase
          .from('composition_slots')
          .delete()
          .eq('composition_id', editingId)

        // Créer nouveaux slots
        if (validSlots.length > 0) {
          const { error: slotsError } = await (supabase as any)
            .from('composition_slots')
            .insert(validSlots.map(s => ({
              composition_id: editingId,
              weapon_id: s.weapon_id,
              group_number: s.group_number,
              quantity: s.quantity
            })))

          if (slotsError) throw slotsError
        }
      } else {
        // Création
        const { data: newComp, error: createError } = await (supabase as any)
          .from('compositions')
          .insert({
            name: formData.name,
            description: formData.description || null,
            total_groups: formData.total_groups
          })
          .select()
          .single()

        if (createError) throw createError

        // Créer les slots
        if (validSlots.length > 0) {
          const { error: slotsError } = await (supabase as any)
            .from('composition_slots')
            .insert(validSlots.map(s => ({
              composition_id: newComp.id,
              weapon_id: s.weapon_id,
              group_number: s.group_number,
              quantity: s.quantity
            })))

          if (slotsError) throw slotsError
        }
      }

      setShowForm(false)
      loadData()
    } catch (error: any) {
      console.error('Error saving composition:', error)
      alert(error.message || "Erreur lors de la sauvegarde")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette composition ?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('compositions')
        .delete()
        .eq('id', id)

      if (error) throw error

      loadData()
    } catch (error: any) {
      console.error('Error deleting composition:', error)
      alert(error.message || "Erreur lors de la suppression")
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

  const groupSlotsForm = slots.filter(s => s.group_number === activeGroupForm)
  const totalInGroupForm = groupSlotsForm.reduce((sum, s) => sum + s.quantity, 0)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Puzzle className="w-8 h-8 text-purple-400" />
            Compositions
          </h1>
          <p className="text-slate-400 text-lg">
            Gérez vos compositions de groupe pour les activités
          </p>
        </div>

        {!showForm && (
          <Button
            onClick={handleCreate}
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer une composition
          </Button>
        )}
      </div>

      {/* Formulaire */}
      {showForm && (
        <Card className="glass-effect border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">
              {editingId ? 'Modifier la composition' : 'Nouvelle composition'}
            </CardTitle>
            <CardDescription className="text-slate-400">
              Configurez les groupes et les armes requises
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Nom *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total_groups" className="text-white">Nombre de groupes *</Label>
                  <Input
                    id="total_groups"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.total_groups}
                    onChange={(e) => setFormData({ ...formData, total_groups: parseInt(e.target.value) })}
                    required
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-900/50 border-slate-700 text-white min-h-[80px]"
                />
              </div>

              {/* Slots par groupe */}
              <div>
                <Label className="text-white mb-3 block">Slots par groupe</Label>
                <Tabs value={activeGroupForm.toString()} onValueChange={(v) => setActiveGroupForm(parseInt(v))}>
                  <TabsList className="bg-slate-800/50">
                    {Array.from({ length: formData.total_groups }, (_, i) => i + 1).map(groupNum => {
                      const groupSlots = slots.filter(s => s.group_number === groupNum)
                      const total = groupSlots.reduce((sum, s) => sum + s.quantity, 0)
                      return (
                        <TabsTrigger key={groupNum} value={groupNum.toString()}>
                          Groupe {groupNum} ({total}/20)
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>

                  {Array.from({ length: formData.total_groups }, (_, i) => i + 1).map(groupNum => (
                    <TabsContent key={groupNum} value={groupNum.toString()} className="mt-4">
                      <div className="space-y-3">
                        {groupSlotsForm.map((slot, index) => {
                          const globalIndex = slots.findIndex(s => s === slot)
                          return (
                            <div key={index} className="flex gap-2 items-end">
                              <div className="flex-1">
                                <WeaponSelector
                                  id={`weapon-${globalIndex}`}
                                  label="Arme"
                                  weapons={weapons}
                                  value={slot.weapon_id}
                                  onChange={(v) => handleSlotChange(globalIndex, 'weapon_id', v)}
                                  required
                                />
                              </div>
                              <div className="w-24">
                                <Label htmlFor={`quantity-${globalIndex}`} className="text-white text-sm">Quantité</Label>
                                <Input
                                  id={`quantity-${globalIndex}`}
                                  type="number"
                                  min="1"
                                  max="20"
                                  value={slot.quantity}
                                  onChange={(e) => handleSlotChange(globalIndex, 'quantity', parseInt(e.target.value))}
                                  className="bg-slate-900/50 border-slate-700 text-white"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveSlot(globalIndex)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )
                        })}

                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddSlot}
                          disabled={totalInGroupForm >= 20}
                          className="w-full border-slate-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Ajouter un slot
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600"
                  disabled={saving}
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Enregistrement...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingId ? 'Mettre à jour' : 'Créer'}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-slate-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Liste compositions */}
      {!showForm && (
        <div className="grid gap-4">
          {compositions.length === 0 ? (
            <Card className="glass-effect border-slate-700/50">
              <CardContent className="py-12">
                <div className="text-center">
                  <Puzzle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg">
                    Aucune composition créée
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    Créez votre première composition pour commencer
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            compositions.map((comp) => {
              const totalSlots = comp.slots?.reduce((sum, s) => sum + s.quantity, 0) || 0
              return (
                <Card key={comp.id} className="glass-effect border-slate-700/50 card-hover">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-white text-xl">{comp.name}</CardTitle>
                        {comp.description && (
                          <CardDescription className="text-slate-400 mt-1">
                            {comp.description}
                          </CardDescription>
                        )}
                        <div className="flex gap-4 mt-3 text-sm">
                          <span className="text-slate-400">
                            {comp.total_groups} groupe{comp.total_groups > 1 ? 's' : ''}
                          </span>
                          <span className="text-slate-400">
                            {totalSlots} slots total
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(comp)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(comp.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
