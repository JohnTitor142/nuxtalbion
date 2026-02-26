'use client'

import { Label } from '@/components/ui/label'
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
  // Grouper les armes par sous-catégorie
  const weaponsBySubcategory = weapons
    .filter(w => w.is_active)
    .reduce((acc, weapon) => {
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
    <div className="space-y-2">
      <Label htmlFor={id} className="text-white font-medium">
        {label} {required && <span className="text-red-400">*</span>}
      </Label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className="flex h-11 w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-white focus:border-purple-500 focus:ring-purple-500/20 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">-- Sélectionner une arme --</option>
        {sortedSubcategories.map((subcategory) => {
          const subcategoryWeapons = weaponsBySubcategory[subcategory]
          if (!subcategoryWeapons || subcategoryWeapons.length === 0) return null
          
          return (
            <optgroup key={subcategory} label={`⚔️ ${subcategory}`}>
              {subcategoryWeapons.map((weapon) => (
                <option key={weapon.id} value={weapon.id}>
                  {weapon.name} (T{weapon.tier})
                </option>
              ))}
            </optgroup>
          )
        })}
      </select>
    </div>
  )
}
