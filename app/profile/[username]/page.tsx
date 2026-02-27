'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import type { UserProfile, ActivityRegistration, Activity, Roaster, Weapon } from '@/types'
import { getWeaponIcon } from '@/types'
import { User, Calendar, Trophy, Shield, Users as UsersIcon, Coins, Plus, Minus, Search, X } from 'lucide-react'
import Link from 'next/link'

function formatSilver(amount: number): string {
    if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
    if (amount >= 1_000) return (amount / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
    return amount.toLocaleString('fr-FR')
}

interface RegistrationWithDetails extends ActivityRegistration {
    id: string
    activity?: Activity
    weapon1?: Weapon
    weapon2?: Weapon
    weapon3?: Weapon
}

interface RoasterWithDetails extends Roaster {
    id: string
    group_number: number
    slot_position: number
    activity?: Activity
    weapon?: Weapon
}

export default function PublicProfilePage() {
    const params = useParams()
    const username = params.username as string
    const { user: currentUser, hasRole } = useAuth()
    const supabase = createClient()

    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [registrations, setRegistrations] = useState<RegistrationWithDetails[]>([])
    const [pastParticipations, setPastParticipations] = useState<RoasterWithDetails[]>([])
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    // Silver adjustment state
    const [silverDialogOpen, setSilverDialogOpen] = useState(false)
    const [silverAmount, setSilverAmount] = useState('')
    const [silverMode, setSilverMode] = useState<'add' | 'remove'>('add')
    const [silverUpdating, setSilverUpdating] = useState(false)

    // Search state
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<{ id: string; username: string; role: string }[]>([])
    const [searchLoading, setSearchLoading] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)

    const canManageSilver = currentUser && hasRole(['admin', 'shotcaller'])
    const isOwnProfile = currentUser?.username === username

    useEffect(() => {
        if (username) {
            loadProfile()
        }
    }, [username])

    // Search users with debounce
    useEffect(() => {
        if (!searchQuery || searchQuery.length < 2) {
            setSearchResults([])
            return
        }

        const timeout = setTimeout(async () => {
            setSearchLoading(true)
            try {
                const { data } = await supabase
                    .from('users_profiles')
                    .select('id, username, role')
                    .eq('is_active', true)
                    .ilike('username', `%${searchQuery}%`)
                    .limit(8)

                setSearchResults((data as any) || [])
            } catch (e) {
                console.error('Search error:', e)
            } finally {
                setSearchLoading(false)
            }
        }, 300)

        return () => clearTimeout(timeout)
    }, [searchQuery])

    const loadProfile = async () => {
        try {
            setLoading(true)
            setNotFound(false)

            // Charger le profil par username
            const { data: profileData, error } = await supabase
                .from('users_profiles')
                .select('*')
                .eq('username', username)
                .eq('is_active', true)
                .single()

            if (error || !profileData) {
                setNotFound(true)
                return
            }

            const typedProfile = profileData as UserProfile
            setProfile(typedProfile)

            // Charger les inscriptions
            const { data: regs } = await supabase
                .from('activity_registrations')
                .select(`
          *,
          activity:activities(*),
          weapon1:weapon1_id(*),
          weapon2:weapon2_id(*),
          weapon3:weapon3_id(*)
        `)
                .eq('user_id', typedProfile.id)
                .order('created_at', { ascending: false })

            setRegistrations((regs as any) || [])

            // Charger les participations passées
            const { data: roasters } = await supabase
                .from('roasters')
                .select(`
          *,
          activity:activities(*),
          weapon:weapons(*)
        `)
                .eq('user_id', typedProfile.id)
                .order('assigned_at', { ascending: false })

            setPastParticipations((roasters as any) || [])
        } catch (error) {
            console.error('Error loading profile:', error)
            setNotFound(true)
        } finally {
            setLoading(false)
        }
    }

    const handleSilverAdjust = async () => {
        if (!profile || !silverAmount) return
        const amount = parseInt(silverAmount)
        if (isNaN(amount) || amount <= 0) return

        setSilverUpdating(true)
        try {
            const newSilver = silverMode === 'add'
                ? (profile.silver ?? 0) + amount
                : Math.max(0, (profile.silver ?? 0) - amount)

            const { error } = await (supabase as any)
                .from('users_profiles')
                .update({ silver: newSilver })
                .eq('id', profile.id)

            if (!error) {
                setProfile({ ...profile, silver: newSilver })
                setSilverDialogOpen(false)
                setSilverAmount('')
            }
        } catch (error) {
            console.error('Error updating silver:', error)
        } finally {
            setSilverUpdating(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400">Chargement du profil...</p>
                </div>
            </div>
        )
    }

    if (notFound || !profile) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <User className="w-20 h-20 mx-auto mb-4 text-slate-600" />
                    <h1 className="text-3xl font-bold text-white mb-2">Joueur introuvable</h1>
                    <p className="text-slate-400">Le joueur &quot;{username}&quot; n&apos;existe pas ou a été désactivé.</p>
                </div>
            </div>
        )
    }

    const roleLabels: Record<string, string> = {
        admin: 'Administrateur',
        shotcaller: 'Shotcaller',
        user: 'Joueur'
    }

    const roleIcons: Record<string, React.ReactNode> = {
        admin: <Shield className="w-5 h-5 text-red-400" />,
        shotcaller: <UsersIcon className="w-5 h-5 text-yellow-400" />,
        user: <User className="w-5 h-5 text-blue-400" />
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-2xl">
                    <User className="w-12 h-12 text-white" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-5xl font-bold text-white mb-2">{profile.username}</h1>
                        {isOwnProfile && (
                            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-sm font-medium">
                                Vous
                            </span>
                        )}
                    </div>
                    <p className="text-slate-400 flex items-center gap-2 text-lg">
                        {roleIcons[profile.role]}
                        <span>{roleLabels[profile.role]}</span>
                    </p>
                </div>

                {/* Silver Management Button */}
                {canManageSilver && (
                    <Button
                        onClick={() => setSilverDialogOpen(true)}
                        className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-yellow-500/25"
                    >
                        <Coins className="w-4 h-4 mr-2" />
                        Gérer Silver
                    </Button>
                )}
            </div>

            {/* Search Bar */}
            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Rechercher un joueur..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value)
                            setSearchOpen(true)
                        }}
                        onFocus={() => setSearchOpen(true)}
                        className="w-full pl-12 pr-10 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => { setSearchQuery(''); setSearchResults([]); setSearchOpen(false) }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Search Results Dropdown */}
                {searchOpen && searchQuery.length >= 2 && (
                    <div className="absolute z-50 w-full mt-2 rounded-xl glass-effect border border-slate-700/50 shadow-2xl overflow-hidden">
                        {searchLoading ? (
                            <div className="p-4 text-center text-slate-400">
                                <div className="w-5 h-5 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto mb-2"></div>
                                Recherche...
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className="p-4 text-center text-slate-500">Aucun joueur trouvé</div>
                        ) : (
                            searchResults.map((result) => (
                                <Link
                                    key={result.id}
                                    href={`/profile/${result.username}`}
                                    onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                                    className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-semibold text-xs">
                                            {result.username.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{result.username}</p>
                                        <p className="text-xs text-slate-500 capitalize">
                                            {result.role === 'admin' ? 'Admin' : result.role === 'shotcaller' ? 'Shotcaller' : 'Joueur'}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Silver */}
                <Card className="glass-effect border-yellow-500/30 hover:border-yellow-500/50 transition-colors">
                    <CardContent className="pt-8 pb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/25">
                                <Coins className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-yellow-400">{formatSilver(profile.silver ?? 0)}</p>
                                <p className="text-base text-slate-400">Silver</p>
                                <p className="text-xs text-slate-500">{(profile.silver ?? 0).toLocaleString('fr-FR')} silver</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-effect border-slate-700/50">
                    <CardContent className="pt-8 pb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                                <Calendar className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">{registrations.length}</p>
                                <p className="text-base text-slate-400">Inscriptions</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-effect border-slate-700/50">
                    <CardContent className="pt-8 pb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                                <Trophy className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">{pastParticipations.length}</p>
                                <p className="text-base text-slate-400">Participations</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-effect border-slate-700/50">
                    <CardContent className="pt-8 pb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                <User className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <p className="text-base text-slate-400">Membre depuis</p>
                                <p className="text-xl text-white font-medium">
                                    {new Date(profile.created_at).toLocaleDateString('fr-FR', {
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Inscriptions */}
            <Card className="glass-effect border-slate-700/50">
                <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center gap-2 text-2xl">
                        <Calendar className="w-6 h-6 text-purple-400" />
                        {isOwnProfile ? 'Mes Inscriptions' : 'Inscriptions'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {registrations.length === 0 ? (
                        <div className="text-center text-slate-400 py-16">
                            <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">Aucune inscription pour le moment</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {registrations.map((reg) => (
                                <div key={reg.id} className="p-5 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-white mb-2 text-lg">
                                                {reg.activity?.name}
                                            </h3>
                                            <p className="text-base text-slate-400 mb-3">
                                                {reg.activity?.scheduled_at && new Date(reg.activity.scheduled_at).toLocaleDateString('fr-FR', {
                                                    weekday: 'short',
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {reg.weapon1 && (
                                                    <span className="px-4 py-2 rounded-full bg-purple-500/20 text-purple-300 text-base font-medium flex items-center gap-2">
                                                        {reg.weapon1.icon_url && (
                                                            <img src={reg.weapon1.icon_url} alt="" className="w-5 h-5 inline-block" />
                                                        )}
                                                        {getWeaponIcon(reg.weapon1)} {reg.weapon1.name}
                                                    </span>
                                                )}
                                                {reg.weapon2 && (
                                                    <span className="px-4 py-2 rounded-full bg-blue-500/20 text-blue-300 text-base font-medium flex items-center gap-2">
                                                        {reg.weapon2.icon_url && (
                                                            <img src={reg.weapon2.icon_url} alt="" className="w-5 h-5 inline-block" />
                                                        )}
                                                        {getWeaponIcon(reg.weapon2)} {reg.weapon2.name}
                                                    </span>
                                                )}
                                                {reg.weapon3 && (
                                                    <span className="px-4 py-2 rounded-full bg-green-500/20 text-green-300 text-base font-medium flex items-center gap-2">
                                                        {reg.weapon3.icon_url && (
                                                            <img src={reg.weapon3.icon_url} alt="" className="w-5 h-5 inline-block" />
                                                        )}
                                                        {getWeaponIcon(reg.weapon3)} {reg.weapon3.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Participations Passées */}
            {pastParticipations.length > 0 && (
                <Card className="glass-effect border-slate-700/50">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-white flex items-center gap-2 text-2xl">
                            <Trophy className="w-6 h-6 text-green-400" />
                            Participations Passées
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {pastParticipations.map((participation) => (
                                <div key={participation.id} className="p-5 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:border-slate-600/30 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold text-slate-300 mb-2 text-lg">
                                                {participation.activity?.name}
                                            </h3>
                                            <p className="text-base text-slate-500 mb-3">
                                                {participation.activity?.scheduled_at && new Date(participation.activity.scheduled_at).toLocaleDateString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                            {participation.weapon && (
                                                <span className="px-4 py-2 rounded-full bg-slate-700/50 text-slate-400 text-base flex items-center gap-2">
                                                    {participation.weapon.icon_url && (
                                                        <img src={participation.weapon.icon_url} alt="" className="w-5 h-5 inline-block" />
                                                    )}
                                                    {getWeaponIcon(participation.weapon)} {participation.weapon.name}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-base text-slate-500 font-medium">
                                            Groupe {participation.group_number}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Silver Adjustment Dialog */}
            <Dialog open={silverDialogOpen} onOpenChange={setSilverDialogOpen}>
                <DialogContent className="glass-effect border-slate-700/50">
                    <DialogHeader>
                        <DialogTitle className="text-white flex items-center gap-2">
                            <Coins className="w-5 h-5 text-yellow-400" />
                            Gérer le Silver de {profile.username}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Solde actuel : <span className="text-yellow-400 font-semibold">{(profile.silver ?? 0).toLocaleString('fr-FR')}</span> silver
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        {/* Mode Toggle */}
                        <div className="flex gap-2">
                            <Button
                                variant={silverMode === 'add' ? 'default' : 'outline'}
                                onClick={() => setSilverMode('add')}
                                className={silverMode === 'add'
                                    ? 'flex-1 bg-green-600 hover:bg-green-700 text-white'
                                    : 'flex-1 border-slate-700 text-slate-400 hover:text-white'}
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Ajouter
                            </Button>
                            <Button
                                variant={silverMode === 'remove' ? 'default' : 'outline'}
                                onClick={() => setSilverMode('remove')}
                                className={silverMode === 'remove'
                                    ? 'flex-1 bg-red-600 hover:bg-red-700 text-white'
                                    : 'flex-1 border-slate-700 text-slate-400 hover:text-white'}
                            >
                                <Minus className="w-4 h-4 mr-1" />
                                Retirer
                            </Button>
                        </div>

                        {/* Amount */}
                        <div className="space-y-2">
                            <Label className="text-slate-300">Montant</Label>
                            <Input
                                type="number"
                                min="1"
                                placeholder="Ex: 100000"
                                value={silverAmount}
                                onChange={(e) => setSilverAmount(e.target.value)}
                                className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
                            />
                            {silverAmount && !isNaN(parseInt(silverAmount)) && parseInt(silverAmount) > 0 && (
                                <p className="text-sm text-slate-400">
                                    Nouveau solde : <span className="text-yellow-400 font-semibold">
                                        {(silverMode === 'add'
                                            ? (profile.silver ?? 0) + parseInt(silverAmount)
                                            : Math.max(0, (profile.silver ?? 0) - parseInt(silverAmount))
                                        ).toLocaleString('fr-FR')}
                                    </span> silver
                                </p>
                            )}
                        </div>

                        <Button
                            onClick={handleSilverAdjust}
                            disabled={silverUpdating || !silverAmount || isNaN(parseInt(silverAmount)) || parseInt(silverAmount) <= 0}
                            className={`w-full font-semibold ${silverMode === 'add'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                                : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
                                } text-white`}
                        >
                            {silverUpdating ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    Mise à jour...
                                </div>
                            ) : (
                                <>
                                    {silverMode === 'add' ? 'Ajouter' : 'Retirer'} {silverAmount ? parseInt(silverAmount).toLocaleString('fr-FR') : '0'} silver
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
