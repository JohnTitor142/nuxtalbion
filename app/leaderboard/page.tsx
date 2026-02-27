'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Trophy, Coins, Medal, Crown, TrendingUp } from 'lucide-react'

interface LeaderboardEntry {
    id: string
    username: string
    silver: number
    role: string
}

function formatSilver(amount: number): string {
    if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
    if (amount >= 1_000) return (amount / 1_000).toFixed(1).replace(/\.0$/, '') + 'K'
    return amount.toLocaleString('fr-FR')
}

function formatSilverFull(amount: number): string {
    return amount.toLocaleString('fr-FR')
}

export default function LeaderboardPage() {
    const [players, setPlayers] = useState<LeaderboardEntry[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        loadLeaderboard()
    }, [])

    const loadLeaderboard = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('users_profiles')
                .select('id, username, silver, role')
                .eq('is_active', true)
                .order('silver', { ascending: false })
                .limit(50)

            if (!error && data) {
                setPlayers(data as LeaderboardEntry[])
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error)
        } finally {
            setLoading(false)
        }
    }

    const getRankStyle = (index: number) => {
        switch (index) {
            case 0:
                return {
                    border: 'border-yellow-500/50',
                    bg: 'bg-gradient-to-r from-yellow-500/10 to-amber-500/10',
                    badge: 'bg-gradient-to-br from-yellow-400 to-amber-500',
                    text: 'text-yellow-400',
                    icon: <Crown className="w-6 h-6 text-white" />,
                    glow: 'shadow-lg shadow-yellow-500/20',
                }
            case 1:
                return {
                    border: 'border-slate-400/50',
                    bg: 'bg-gradient-to-r from-slate-400/10 to-slate-300/10',
                    badge: 'bg-gradient-to-br from-slate-300 to-slate-400',
                    text: 'text-slate-300',
                    icon: <Medal className="w-5 h-5 text-white" />,
                    glow: 'shadow-lg shadow-slate-400/20',
                }
            case 2:
                return {
                    border: 'border-orange-600/50',
                    bg: 'bg-gradient-to-r from-orange-600/10 to-amber-700/10',
                    badge: 'bg-gradient-to-br from-orange-500 to-amber-700',
                    text: 'text-orange-400',
                    icon: <Medal className="w-5 h-5 text-white" />,
                    glow: 'shadow-lg shadow-orange-500/20',
                }
            default:
                return {
                    border: 'border-slate-700/50',
                    bg: 'bg-slate-800/30',
                    badge: 'bg-slate-700',
                    text: 'text-slate-400',
                    icon: null,
                    glow: '',
                }
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400">Chargement du classement...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-yellow-500/30">
                    <Trophy className="w-10 h-10 text-white" />
                </div>
                <div>
                    <h1 className="text-5xl font-bold gradient-text mb-1">Leaderboard</h1>
                    <p className="text-slate-400 text-lg flex items-center gap-2">
                        <Coins className="w-5 h-5 text-yellow-400" />
                        Les joueurs les plus riches
                    </p>
                </div>
            </div>

            {/* Leaderboard */}
            <Card className="glass-effect border-slate-700/50">
                <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center gap-2 text-2xl">
                        <TrendingUp className="w-6 h-6 text-yellow-400" />
                        Classement Silver
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {players.length === 0 ? (
                        <div className="text-center text-slate-400 py-16">
                            <Coins className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">Aucun joueur trouvé</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {players.map((player, index) => {
                                const style = getRankStyle(index)
                                return (
                                    <div
                                        key={player.id}
                                        className={`flex items-center gap-4 p-4 rounded-xl ${style.bg} border ${style.border} ${style.glow} transition-all hover:scale-[1.01]`}
                                    >
                                        {/* Rank */}
                                        <div className={`w-10 h-10 rounded-lg ${style.badge} flex items-center justify-center flex-shrink-0`}>
                                            {style.icon || (
                                                <span className="text-white font-bold text-sm">{index + 1}</span>
                                            )}
                                        </div>

                                        {/* Avatar + Name */}
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                                <span className="text-white font-semibold text-sm">
                                                    {player.username.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`font-semibold truncate ${index < 3 ? style.text : 'text-white'}`}>
                                                    {player.username}
                                                </p>
                                                <p className="text-xs text-slate-500 capitalize">{player.role === 'admin' ? 'Admin' : player.role === 'shotcaller' ? 'Shotcaller' : 'Joueur'}</p>
                                            </div>
                                        </div>

                                        {/* Silver Amount */}
                                        <div className="text-right flex-shrink-0">
                                            <p className={`text-xl font-bold ${style.text} flex items-center gap-1.5`}>
                                                <Coins className="w-5 h-5 text-yellow-500" />
                                                {formatSilver(player.silver)}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {formatSilverFull(player.silver)} silver
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
