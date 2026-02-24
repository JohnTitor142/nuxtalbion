'use client'

import { useRequireAuth } from '@/hooks/useRequireAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Weapon } from '@/types'
import { WEAPON_CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS } from '@/types'
import { Sword, Plus, Edit, Trash2, Save, X, Eye, EyeOff } from 'lucide-react'

export default function AdminWeaponsPage() {
  const { user, loading } = useRequireAuth('admin')
  const [weapons, setWeapons] = useState<Weapon[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    tier: '',
    icon_url: ''
  })
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadWeapons()
    }
  }, [user])

  const loadWeapons = async () => {
    try {
      setLoadingData(true)
      const { data } = await supabase
        .from('weapons')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      setWeapons(data || [])
    } catch (error) {
      console.error('Error loading weapons:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleCreate = () => {
    setEditingId(null)
    setFormData({ name: '', category: '', tier: '', icon_url: '' })
    setShowForm(true)
  }

  const handleEdit = (weapon: Weapon) => {
    setEditingId(weapon.id)
    setFormData({
      name: weapon.name,
      category: weapon.category,
      tier: weapon.tier?.toString() || '',
      icon_url: weapon.icon_url || ''
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const weaponData = {
        name: formData.name,
        category: formData.category,
        tier: formData.tier ? parseInt(formData.tier) : null,
        icon_url: formData.icon_url || null,
      }

      if (editingId) {
        const { error } = await (supabase as any)
          .from('weapons')
          .update(weaponData)
          .eq('id', editingId)

        if (error) throw error
      } else {
        const { error } = await (supabase as any)
          .from('weapons')
          .insert(weaponData)

        if (error) throw error
      }

      setShowForm(false)
      loadWeapons()
    } catch (error: any) {
      console.error('Error saving weapon:', error)
      alert(error.message || "Erreur lors de la sauvegarde")
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (weapon: Weapon) => {
    try {
      const { error } = await (supabase as any)
        .from('weapons')
        .update({ is_active: !weapon.is_active })
        .eq('id', weapon.id)

      if (error) throw error

      loadWeapons()
    } catch (error: any) {
      console.error('Error toggling weapon:', error)
      alert(error.message || "Erreur")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette arme ?')) {
      return
    }

    try {
      const { error } = await (supabase as any)
        .from('weapons')
        .delete()
        .eq('id', id)

      if (error) throw error

      loadWeapons()
    } catch (error: any) {
      console.error('Error deleting weapon:', error)
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

  const weaponsByCategory = WEAPON_CATEGORIES.reduce((acc, category) => {
    acc[category] = weapons.filter(w => w.category === category)
    return acc
  }, {} as Record<string, Weapon[]>)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Sword className="w-8 h-8 text-purple-400" />
            Gestion des Armes
          </h1>
          <p className="text-slate-400 text-lg">
            Gérez le catalogue d'armes disponibles
          </p>
        </div>

        {!showForm && (
          <Button
            onClick={handleCreate}
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une arme
          </Button>
        )}
      </div>

      {/* Formulaire */}
      {showForm && (
        <Card className="glass-effect border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">
              {editingId ? 'Modifier l\'arme' : 'Nouvelle arme'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label htmlFor="category" className="text-white">Catégorie *</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="flex h-11 w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-white focus:border-purple-500 focus:ring-purple-500/20 focus:outline-none"
                  >
                    <option value="">-- Sélectionner --</option>
                    {WEAPON_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {CATEGORY_ICONS[cat]} {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tier" className="text-white">Tier</Label>
                  <Input
                    id="tier"
                    type="number"
                    min="1"
                    max="8"
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    placeholder="Ex: 8"
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon_url" className="text-white">URL Icône</Label>
                  <Input
                    id="icon_url"
                    type="url"
                    value={formData.icon_url}
                    onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                    placeholder="https://..."
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>
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

      {/* Liste par catégorie */}
      {!showForm && (
        <div className="space-y-6">
          {WEAPON_CATEGORIES.map(category => {
            const categoryWeapons = weaponsByCategory[category] || []
            if (categoryWeapons.length === 0) return null

            return (
              <Card key={category} className="glass-effect border-slate-700/50">
                <CardHeader>
                  <CardTitle className={`text-white flex items-center gap-2 bg-gradient-to-r ${CATEGORY_COLORS[category]} bg-clip-text text-transparent`}>
                    <span>{CATEGORY_ICONS[category]}</span>
                    <span>{category}</span>
                    <span className="text-sm text-slate-400">({categoryWeapons.length})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {categoryWeapons.map(weapon => (
                      <div
                        key={weapon.id}
                        className={`p-4 rounded-lg border flex items-center justify-between ${
                          weapon.is_active
                            ? 'bg-slate-800/50 border-slate-700/50'
                            : 'bg-slate-900/30 border-slate-800/30 opacity-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {weapon.icon_url && (
                            <img src={weapon.icon_url} alt={weapon.name} className="w-8 h-8" />
                          )}
                          <div>
                            <p className="font-semibold text-white">
                              {weapon.name}
                              {weapon.tier && (
                                <span className="ml-2 text-sm text-slate-400">T{weapon.tier}</span>
                              )}
                            </p>
                            <p className="text-xs text-slate-500">
                              {weapon.is_active ? 'Active' : 'Désactivée'}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(weapon)}
                            className={weapon.is_active ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'}
                          >
                            {weapon.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(weapon)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(weapon.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
