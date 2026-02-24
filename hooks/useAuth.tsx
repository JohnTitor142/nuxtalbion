'use client'

import { useEffect, useState, createContext, useContext } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile, UserRole } from '@/types'
import { useRouter } from 'next/navigation'

// Helper functions pour gérer les cookies
function setCookie(name: string, value: string, days: number) {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
}

function getCookie(name: string): string | null {
  const nameEQ = name + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  signUp: (username: string) => Promise<{ user: UserProfile; pin: string }>
  signIn: (username: string, pin: string) => Promise<void>
  signOut: () => Promise<void>
  hasRole: (role: UserRole | UserRole[]) => boolean
  isAdmin: () => boolean
  isShotcaller: () => boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Charger l'utilisateur depuis les cookies
    const loadUser = async () => {
      try {
        const userId = getCookie('userId')
        console.log('🔍 Cookie userId:', userId)
        
        if (userId) {
          const { data: profile, error } = await supabase
            .from('users_profiles')
            .select('*')
            .eq('id', userId)
            .eq('is_active', true)
            .single()

          if (profile && !error) {
            setUser(profile)
            console.log('✅ Utilisateur chargé depuis cookie:', profile)
          } else {
            deleteCookie('userId')
          }
        }
      } catch (error) {
        console.error('Error loading user:', error)
        deleteCookie('userId')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [supabase])

  const signUp = async (username: string): Promise<{ user: UserProfile; pin: string }> => {
    // Valider le username
    if (username.length < 3 || username.length > 20) {
      throw new Error('Le pseudo doit contenir entre 3 et 20 caractères')
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new Error('Le pseudo ne peut contenir que des lettres, chiffres et underscores')
    }

    // Vérifier unicité
    const { data: existing } = await supabase
      .from('users_profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (existing) {
      throw new Error('Ce pseudo est déjà utilisé')
    }

    // Générer PIN aléatoire 4 chiffres
    const pin = Math.floor(1000 + Math.random() * 9000).toString()

    // Créer l'utilisateur (PIN en clair - pas de hash)
    const { data: newUser, error } = await supabase
      .from('users_profiles')
      .insert({
        username,
        pin: pin,  // PIN stocké en clair
        role: 'user' as UserRole,
      })
      .select()
      .single()

    if (error || !newUser) {
      throw new Error(error?.message || 'Erreur lors de la création du compte')
    }

    // Sauvegarder la session dans les cookies
    setCookie('userId', newUser.id, 7) // 7 jours
    setUser(newUser)

    return { user: newUser, pin }
  }

  const signIn = async (username: string, pin: string): Promise<void> => {
    console.log('🔍 signIn appelé avec:', { username, pin })
    
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      throw new Error('Le PIN doit contenir exactement 4 chiffres')
    }

    console.log('🔍 Recherche de l\'utilisateur dans Supabase...')

    // Récupérer l'utilisateur
    const { data: profile, error } = await supabase
      .from('users_profiles')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single()

    console.log('🔍 Résultat Supabase:', { profile, error })

    if (error || !profile) {
      console.error('❌ Utilisateur non trouvé ou erreur:', error)
      throw new Error('Pseudo ou PIN incorrect')
    }

    console.log('🔍 Utilisateur trouvé, vérification du PIN...')
    console.log('🔍 PIN dans la DB:', (profile as any).pin)
    console.log('🔍 PIN saisi:', pin)

    // Vérifier le PIN (comparaison directe - pas de hash)
    if ((profile as any).pin !== pin) {
      console.error('❌ PIN incorrect')
      throw new Error('Pseudo ou PIN incorrect')
    }

    console.log('✅ PIN correct, sauvegarde de la session...')

    // Sauvegarder la session dans les cookies (pour le middleware)
    setCookie('userId', profile.id, 7) // 7 jours
    setUser(profile)

    console.log('✅ Session sauvegardée dans cookie, utilisateur connecté:', profile)
  }

  const signOut = async (): Promise<void> => {
    deleteCookie('userId')
    setUser(null)
    router.push('/login')
  }

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!user) return false

    if (Array.isArray(role)) {
      return role.includes(user.role)
    }

    return user.role === role
  }

  const isAdmin = (): boolean => hasRole('admin')
  const isShotcaller = (): boolean => hasRole(['admin', 'shotcaller'])

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    hasRole,
    isAdmin,
    isShotcaller,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
