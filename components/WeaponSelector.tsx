'use client'

import { useState, useRef, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Search, ChevronDown, Check } from 'lucide-react'
import type { Weapon } from '@/types'

interface WeaponSelectorProps {
  weapons: Weapon[]
  value: string
  onChange: (weaponId: string) => void
  label: string
  required?: boolean
  id: string
  disabled?: boolean
}

export function WeaponSelector({
  weapons,
  value,
  onChange,
  label,
  required = false,
  id,
  disabled = false
}: WeaponSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')
  const wrapperRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Positionner le menu déroulant au-dessus si pas assez de place en bas
  useEffect(() => {
    if (isOpen && wrapperRef.current) {
      const wrapperRect = wrapperRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const dropdownMaxHeight = 320 // hauteur approx du menu (max-h-80 = 20rem = 320px)

      const spaceBelow = windowHeight - wrapperRect.bottom
      const spaceAbove = wrapperRect.top

      if (spaceBelow < dropdownMaxHeight && spaceAbove > spaceBelow) {
        setDropdownPosition('top')
      } else {
        setDropdownPosition('bottom')
      }
    }
  }, [isOpen])

  // Trouver l'arme sélectionnée
  const selectedWeapon = weapons.find(w => w.id === value)

  // Filtrer les armes actives
  const activeWeapons = weapons.filter(w => w.is_active)

  // Filtrer par recherche
  const filteredWeapons = activeWeapons.filter(weapon => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      weapon.name.toLowerCase().includes(searchLower) ||
      (weapon.subcategory_name?.toLowerCase().includes(searchLower)) ||
      (weapon.category_name?.toLowerCase().includes(searchLower))
    )
  })

  // Grouper les armes filtrées par sous-catégorie
  const weaponsBySubcategory = filteredWeapons.reduce((acc, weapon) => {
    const subcategory = weapon.subcategory_name || 'Autre'
    if (!acc[subcategory]) {
      acc[subcategory] = []
    }
    acc[subcategory].push(weapon)
    return acc
  }, {} as Record<string, Weapon[]>)

  // Trier les sous-catégories
  const sortedSubcategories = Object.keys(weaponsBySubcategory).sort()

  return (
    <div className="space-y-2 relative" ref={wrapperRef}>
      <Label htmlFor={id} className="text-white font-medium">
        {label} {required && <span className="text-red-400">*</span>}
      </Label>

      {/* Bouton de sélection (simule le select natif) */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex h-11 w-full items-center justify-between rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-left focus:border-purple-500 focus:ring-purple-500/20 focus:outline-none transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-800/50'
          }`}
      >
        <span className={`block truncate ${!selectedWeapon ? 'text-slate-400' : 'text-white'}`}>
          {selectedWeapon ? `${selectedWeapon.name} (T${selectedWeapon.tier})` : '-- Sélectionner une arme --'}
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-purple-400' : 'text-slate-400'}`} />
      </button>

      {/* Menu déroulant */}
      {isOpen && (
        <div className={`absolute z-50 w-full max-h-80 overflow-auto rounded-md border border-slate-700 bg-slate-900 shadow-xl shadow-black/50 thin-scrollbar ${dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}>

          {/* Champ de recherche sticky */}
          <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800 p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher une arme..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()} // Évite de fermer au clic
                className="h-9 w-full rounded-md bg-slate-800/50 pl-9 pr-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500 border border-transparent focus:border-purple-500"
                autoFocus // Focus automatique lors de l'ouverture
              />
            </div>
          </div>

          {/* Liste des résultats */}
          <div className="p-1">
            {sortedSubcategories.length === 0 ? (
              <div className="py-6 text-center text-sm text-slate-400">
                Aucune arme trouvée.
              </div>
            ) : (
              sortedSubcategories.map((subcategory) => (
                <div key={subcategory} className="mb-2">
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center bg-slate-800/30 rounded-t-sm mt-1">
                    ⚔️ {subcategory}
                  </div>
                  <div className="space-y-0.5">
                    {weaponsBySubcategory[subcategory].map((weapon) => {
                      const isSelected = value === weapon.id
                      return (
                        <button
                          key={weapon.id}
                          type="button"
                          onClick={() => {
                            onChange(weapon.id)
                            setIsOpen(false)
                            setSearchQuery('')
                          }}
                          className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm outline-none transition-colors hover:bg-slate-800 hover:text-white ${isSelected ? 'bg-purple-500/10 text-purple-300 font-medium' : 'text-slate-200'
                            }`}
                        >
                          {isSelected && (
                            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                              <Check className="h-4 w-4 text-purple-400" />
                            </span>
                          )}
                          <span className="truncate">{weapon.name} (T{weapon.tier})</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
