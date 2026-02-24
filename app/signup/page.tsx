'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { PinDialog } from '@/components/PinDialog'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { Swords, Sparkles, UserPlus } from 'lucide-react'

export default function SignupPage() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPinDialog, setShowPinDialog] = useState(false)
  const [generatedPin, setGeneratedPin] = useState('')
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { pin } = await signUp(username)
      setGeneratedPin(pin)
      setShowPinDialog(true)
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création du compte")
    } finally {
      setLoading(false)
    }
  }

  const handlePinDialogClose = () => {
    setShowPinDialog(false)
    router.push('/activities')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 mb-4 shadow-2xl animate-pulse-glow">
            <Swords className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-3 gradient-text">
            Albion Zerg
          </h1>
          <p className="text-slate-400 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Créez votre compte joueur
            <UserPlus className="w-4 h-4 text-pink-400" />
          </p>
        </div>

        {/* Signup Card */}
        <Card className="glass-effect border-slate-700/50 shadow-2xl backdrop-blur-xl card-hover">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-white">Inscription</CardTitle>
            <CardDescription className="text-slate-400">
              Choisissez votre pseudo de joueur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg backdrop-blur-sm animate-fade-in">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300 font-medium">
                  Pseudo
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="VotrePseudo"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="[a-zA-Z0-9_]+"
                  title="Uniquement lettres, chiffres et underscores"
                  className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-purple-500/20 h-11 transition-all"
                />
                <p className="text-xs text-slate-500">
                  3-20 caractères, lettres, chiffres et _ uniquement
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/40 hover:scale-[1.02]" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Création en cours...
                  </div>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Créer mon compte
                  </>
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700/50"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-900/50 px-2 text-slate-500">ou</span>
                </div>
              </div>

              <div className="text-center text-sm">
                <span className="text-slate-400">Déjà un compte ? </span>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                  onClick={() => router.push('/login')}
                >
                  Se connecter
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>Un code PIN de 4 chiffres sera généré automatiquement</p>
        </div>
      </div>

      {/* PIN Dialog */}
      <PinDialog 
        open={showPinDialog}
        pin={generatedPin}
        onClose={handlePinDialogClose}
      />
    </div>
  )
}
