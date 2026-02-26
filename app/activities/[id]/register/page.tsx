'use client'

import { use, useEffect, useState } from 'react'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { WeaponSelector } from '@/components/WeaponSelector'
import { createClient } from '@/lib/supabase/client'
import type { Activity, Weapon, ActivityRegistration, Composition } from '@/types'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Save } from 'lucide-react'
import Link from 'next/link'

export default function RegisterToActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, loading: authLoading } = useRequireAuth()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [composition, setComposition] = useState<Composition | null>(null)
  const [weapons, setWeapons] = useState<Weapon[]>([])
  const [existingRegistration, setExistingRegistration] = useState<ActivityRegistration | null>(null)
  const [weapon1Id, setWeapon1Id] = useState('')
  const [weapon2Id, setWeapon2Id] = useState('')
  const [weapon3Id, setWeapon3Id] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, id])

  const loadData = async () => {
    try {
      setLoading(true)

      // Charger l'activité
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
      const comp = (activityData as any).composition
      setComposition(Array.isArray(comp) ? comp[0] : comp)

      // Vérifier que l'activité accepte les inscriptions (upcoming ou ongoing)
      const activityStatus = (activityData as any).status
      const isRegistrationAllowed = activityStatus === 'upcoming' || activityStatus === 'ongoing'

      if (!isRegistrationAllowed) {
        setError("Les inscriptions sont fermées pour cette activité (statut: " + activityStatus + ")")
        return
      }

      // Charger les armes
      const { data: weaponsData } = await supabase
        .from('weapons')
        .select('*')
        .eq('is_active', true)
        .order('subcategory_name', { ascending: true })
        .order('name', { ascending: true })

      setWeapons(weaponsData || [])

      // Charger l'inscription existante
      const { data: registration } = await supabase
        .from('activity_registrations')
        .select('*')
        .eq('activity_id', id)
        .eq('user_id', user?.id!)
        .single()

      if (registration) {
        setExistingRegistration(registration as ActivityRegistration)
        setWeapon1Id((registration as any).weapon1_id)
        setWeapon2Id((registration as any).weapon2_id || '')
        setWeapon3Id((registration as any).weapon3_id || '')
        setNotes((registration as any).notes || '')
      }
    } catch (error) {
      console.error('Error loading data:', error)
      setError("Erreur lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      if (!weapon1Id) {
        setError("Vous devez sélectionner au moins une arme")
        return
      }

      const registrationData = {
        activity_id: id,
        user_id: user?.id!,
        weapon1_id: weapon1Id,
        weapon2_id: weapon2Id || null,
        weapon3_id: weapon3Id || null,
        notes: notes || null,
      }

      if (existingRegistration) {
        // Mettre à jour
        const { error: updateError } = await (supabase as any)
          .from('activity_registrations')
          .update(registrationData)
          .eq('id', existingRegistration.id)

        if (updateError) throw updateError
      } else {
        // Créer
        const { error: insertError } = await (supabase as any)
          .from('activity_registrations')
          .insert(registrationData)

        if (insertError) throw insertError
      }

      router.push('/activities')
    } catch (error: any) {
      console.error('Error saving registration:', error)
      setError(error.message || "Erreur lors de l'enregistrement")
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

  const isRegistrationAllowed = activity?.status === 'upcoming' || activity?.status === 'ongoing'

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/activities">
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">
            {existingRegistration ? 'Modifier mon inscription' : "S'inscrire à l'activité"}
          </h1>
          <p className="text-slate-400">
            {activity?.name}
          </p>
        </div>
      </div>

      {/* Info Activité */}
      <Card className="glass-effect border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Informations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-slate-300">
          <p>
            <span className="font-semibold">Date :</span>{' '}
            {new Date(activity!.scheduled_at).toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          {composition && (
            <p>
              <span className="font-semibold">Composition :</span> {composition.name}
            </p>
          )}
          {activity?.description && (
            <p className="text-slate-400 mt-2">{activity.description}</p>
          )}
        </CardContent>
      </Card>

      {/* Formulaire d'inscription */}
      {!isRegistrationAllowed && !existingRegistration && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-6 py-4 rounded-lg text-center">
          <p className="font-semibold text-lg">Les inscriptions sont actuellement fermées pour cette activité.</p>
          <p className="text-sm mt-1">Le statut de l'activité est "{activity?.status}".</p>
        </div>
      )}

      <Card className={`glass-effect border-slate-700/50 ${!isRegistrationAllowed && !existingRegistration ? 'opacity-50 pointer-events-none' : ''}`}>
        <CardHeader>
          <CardTitle className="text-white">Vos choix d'armes</CardTitle>
          <CardDescription className="text-slate-400">
            Sélectionnez 1 à 3 armes que vous souhaitez jouer (par ordre de préférence)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <WeaponSelector
              id="weapon1"
              label="Arme principale (choix 1)"
              weapons={weapons}
              value={weapon1Id}
              onChange={setWeapon1Id}
              required
              disabled={!isRegistrationAllowed}
            />

            <WeaponSelector
              id="weapon2"
              label="Arme alternative (choix 2)"
              weapons={weapons}
              value={weapon2Id}
              onChange={setWeapon2Id}
              disabled={!isRegistrationAllowed}
            />

            <WeaponSelector
              id="weapon3"
              label="Arme alternative (choix 3)"
              weapons={weapons}
              value={weapon3Id}
              onChange={setWeapon3Id}
              disabled={!isRegistrationAllowed}
            />

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-white font-medium">
                Notes (optionnel)
              </Label>
              <Textarea
                id="notes"
                placeholder="Précisez des informations complémentaires..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 min-h-[100px]"
                disabled={!isRegistrationAllowed}
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600"
                disabled={saving || !isRegistrationAllowed}
              >
                {saving ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Enregistrement...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {existingRegistration ? 'Modifier mon inscription' : 'Confirmer mon inscription'}
                  </>
                )}
              </Button>
              <Link href="/activities">
                <Button type="button" variant="outline" className="border-slate-700">
                  Annuler
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
