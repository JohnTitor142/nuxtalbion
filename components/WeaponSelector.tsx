'use client'

import { Label } from '@/components/ui/label'
import type { Weapon } from '@/types'
import { WEAPON_CATEGORIES, CATEGORY_ICONS } from '@/types'

interface WeaponSelectorProps {
  weapons: Weapon[]
  value: string
  onChange: (weaponId: string) => void
  label: string
  required?: boolean
  id: string
}

export function WeaponSelector({
  weapons,
  value,
  onChange,
  label,
  required = false,
  id
}: WeaponSelectorProps) {
  // Grouper les armes par catégorie
  const weaponsByCategory = WEAPON_CATEGORIES.reduce((acc, category) => {
    acc[category] = weapons.filter(w => w.category === category && w.is_active)
    return acc
  }, {} as Record<string, Weapon[]>)

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
        className="flex h-11 w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-white focus:border-purple-500 focus:ring-purple-500/20 focus:outline-none transition-all"
      >
        <option value="">-- Sélectionner une arme --</option>
        {WEAPON_CATEGORIES.map((category) => {
          const categoryWeapons = weaponsByCategory[category]
          if (!categoryWeapons || categoryWeapons.length === 0) return null
          
          return (
            <optgroup key={category} label={`${CATEGORY_ICONS[category]} ${category}`}>
              {categoryWeapons.map((weapon) => (
                <option key={weapon.id} value={weapon.id}>
                  {weapon.name} {weapon.tier ? `(T${weapon.tier})` : ''}
                </option>
              ))}
            </optgroup>
          )
        })}
      </select>
    </div>
  )
}
