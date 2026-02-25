'use client'

import { useRequireAuth } from '@/hooks/useRequireAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Weapon } from '@/types'
import { Sword, Eye, EyeOff, RefreshCw, Search } from 'lucide-react'

export default function AdminWeaponsPage() {
  const { user, loading } = useRequireAuth('admin')
  const [weapons, setWeapons] = useState<Weapon[]>([])
  const [filteredWeapons, setFilteredWeapons] = useState<Weapon[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all')
  const [loadingData, setLoadingData] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadWeapons()
    }
  }, [user])

  useEffect(() => {
    filterWeapons()
  }, [weapons, searchTerm, selectedSubcategory])

  const loadWeapons = async () => {
    try {
      setLoadingData(true)
      const { data } = await supabase
        .from('weapons')
        .select('*')
        .order('subcategory_name', { ascending: true })
        .order('name', { ascending: true })

      setWeapons(data || [])
    } catch (error) {
      console.error('Error loading weapons:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const filterWeapons = () => {
    let filtered = weapons

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.subcategory_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtre par sous-catégorie
    if (selectedSubcategory !== 'all') {
      filtered = filtered.filter(w => w.subcategory_name === selectedSubcategory)
    }

    setFilteredWeapons(filtered)
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

  // Grouper par sous-catégorie
  const weaponsBySubcategory = filteredWeapons.reduce((acc, weapon) => {
    const subcategory = weapon.subcategory_name || 'Autre'
    if (!acc[subcategory]) {
      acc[subcategory] = []
    }
    acc[subcategory].push(weapon)
    return acc
  }, {} as Record<string, Weapon[]>)

  // Liste des sous-catégories pour le filtre
  const subcategories = Array.from(new Set(weapons.map(w => w.subcategory_name || 'Autre'))).sort()

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Sword className="w-8 h-8 text-purple-400" />
              Gestion des Armes
            </h1>
            <p className="text-slate-400 text-lg">
              {weapons.length} armes Tier 8.0 disponibles
            </p>
          </div>

          <Button
            onClick={loadWeapons}
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
        </div>

        {/* Filtres */}
        <Card className="glass-effect border-slate-700/50">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-white">Rechercher</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nom de l'arme ou catégorie..."
                    className="bg-slate-900/50 border-slate-700 text-white pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subcategory" className="text-white">Type d'arme</Label>
                <select
                  id="subcategory"
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="flex h-11 w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-white focus:border-purple-500 focus:ring-purple-500/20 focus:outline-none"
                >
                  <option value="all">Tous les types</option>
                  {subcategories.map(subcategory => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory} ({weapons.filter(w => (w.subcategory_name || 'Autre') === subcategory).length})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste par sous-catégorie */}
      <div className="space-y-6">
        {Object.entries(weaponsBySubcategory).map(([subcategory, subcategoryWeapons]) => (
          <Card key={subcategory} className="glass-effect border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                  {subcategory}
                </span>
                <span className="text-sm text-slate-400">
                  ({subcategoryWeapons.length} armes)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {subcategoryWeapons.map(weapon => (
                  <div
                    key={weapon.id}
                    className={`p-4 rounded-lg border flex flex-col gap-3 transition-all hover:shadow-lg ${
                      weapon.is_active
                        ? 'bg-slate-800/50 border-slate-700/50 hover:border-purple-500/50'
                        : 'bg-slate-900/30 border-slate-800/30 opacity-50'
                    }`}
                  >
                    {/* Image de l'arme */}
                    <div className="flex items-center justify-center p-4 bg-slate-900/50 rounded-lg">
                      {weapon.icon_url ? (
                        <img
                          src={weapon.icon_url}
                          alt={weapon.name}
                          className="w-20 h-20 object-contain"
                        />
                      ) : (
                        <Sword className="w-20 h-20 text-slate-600" />
                      )}
                    </div>

                    {/* Informations */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-sm mb-1">
                        {weapon.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                          T{weapon.tier}
                        </span>
                        {weapon.item_power && (
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded">
                            {weapon.item_power} IP
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        {weapon.identifier}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-slate-700/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(weapon)}
                        className={`flex-1 ${weapon.is_active ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'}`}
                      >
                        {weapon.is_active ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-1" />
                            Désactiver
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-1" />
                            Activer
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Message si aucun résultat */}
      {filteredWeapons.length === 0 && (
        <Card className="glass-effect border-slate-700/50">
          <CardContent className="py-12 text-center">
            <Sword className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">
              Aucune arme trouvée
            </p>
            <p className="text-slate-500 text-sm mt-2">
              Essayez de modifier vos filtres ou votre recherche
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
