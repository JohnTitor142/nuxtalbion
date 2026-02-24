import type { Database } from './database'

export type UserProfile = Database['public']['Tables']['users_profiles']['Row']
export type Weapon = Database['public']['Tables']['weapons']['Row']
export type Composition = Database['public']['Tables']['compositions']['Row']
export type CompositionSlot = Database['public']['Tables']['composition_slots']['Row']
export type Activity = Database['public']['Tables']['activities']['Row']
export type ActivityRegistration = Database['public']['Tables']['activity_registrations']['Row']
export type Roaster = Database['public']['Tables']['roasters']['Row']

export type { UserRole, ActivityStatus } from './database'

// Constantes Albion
export const WEAPON_CATEGORIES = [
  "Tank",
  "Healer",
  "DPS Melee",
  "DPS Range",
  "Support"
] as const

export const CATEGORY_COLORS: Record<string, string> = {
  "Tank": "from-blue-500 to-cyan-500",
  "Healer": "from-green-500 to-emerald-500",
  "DPS Melee": "from-red-500 to-pink-500",
  "DPS Range": "from-purple-500 to-violet-500",
  "Support": "from-orange-500 to-yellow-500"
}

export const CATEGORY_BG_COLORS: Record<string, string> = {
  "Tank": "bg-blue-500",
  "Healer": "bg-green-500",
  "DPS Melee": "bg-red-500",
  "DPS Range": "bg-purple-500",
  "Support": "bg-orange-500"
}

export const CATEGORY_ICONS: Record<string, string> = {
  "Tank": "🛡️",
  "Healer": "💚",
  "DPS Melee": "⚔️",
  "DPS Range": "🏹",
  "Support": "✨"
}

export const ACTIVITY_STATUS_LABELS: Record<string, string> = {
  "upcoming": "🔵 À venir",
  "ongoing": "🟢 En cours",
  "completed": "⚫ Terminée"
}

export interface CompositionWithSlots extends Composition {
  slots: CompositionSlot[]
  weapons?: Weapon[]
}

export interface ActivityWithDetails extends Activity {
  composition?: Composition
  composition_slots?: CompositionSlot[]
  registrations?: (ActivityRegistration & { user?: UserProfile; weapon1?: Weapon; weapon2?: Weapon; weapon3?: Weapon })[]
  roasters?: (Roaster & { user?: UserProfile; weapon?: Weapon })[]
  creator?: UserProfile
}

export interface RegistrationWithWeapons extends ActivityRegistration {
  weapon1?: Weapon
  weapon2?: Weapon
  weapon3?: Weapon
  user?: UserProfile
}

export interface RoasterWithDetails extends Roaster {
  user?: UserProfile
  weapon?: Weapon
  assigned_by_user?: UserProfile
}
