'use client'

import { useRequireAuth } from '@/hooks/useRequireAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile, UserRole } from '@/types'
import { Shield, Users, Edit, Trash2, Save, X, UserX, UserCheck } from 'lucide-react'

export default function AdminUsersPage() {
  const { user, loading } = useRequireAuth('admin')
  const [users, setUsers] = useState<UserProfile[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    role: 'user' as UserRole
  })
  const [loadingData, setLoadingData] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      loadUsers()
    }
  }, [user])

  const loadUsers = async () => {
    try {
      setLoadingData(true)
      const { data } = await supabase
        .from('users_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const handleEdit = (userProfile: UserProfile) => {
    setEditingId(userProfile.id)
    setFormData({
      username: userProfile.username,
      role: userProfile.role
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (!editingId) {
        alert("Impossible de créer un utilisateur via cette interface. Utilisez la page d'inscription.")
        return
      }

      const { error } = await supabase
        .from('users_profiles')
        .update({
          username: formData.username,
          role: formData.role
        })
        .eq('id', editingId)

      if (error) throw error

      setShowForm(false)
      loadUsers()
    } catch (error: any) {
      console.error('Error saving user:', error)
      alert(error.message || "Erreur lors de la sauvegarde")
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (userProfile: UserProfile) => {
    try {
      const { error } = await supabase
        .from('users_profiles')
        .update({ is_active: !userProfile.is_active })
        .eq('id', userProfile.id)

      if (error) throw error

      loadUsers()
    } catch (error: any) {
      console.error('Error toggling user:', error)
      alert(error.message || "Erreur")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('users_profiles')
        .delete()
        .eq('id', id)

      if (error) throw error

      loadUsers()
    } catch (error: any) {
      console.error('Error deleting user:', error)
      alert(error.message || "Erreur lors de la suppression")
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

  const roleLabels = {
    admin: 'Administrateur',
    shotcaller: 'Shotcaller',
    user: 'Joueur'
  }

  const roleColors = {
    admin: 'from-red-500 to-pink-500',
    shotcaller: 'from-yellow-500 to-orange-500',
    user: 'from-blue-500 to-cyan-500'
  }

  const activeUsers = users.filter(u => u.is_active)
  const inactiveUsers = users.filter(u => !u.is_active)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-400" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-slate-400 text-lg">
            Gérez les rôles et permissions des membres
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-slate-400">{activeUsers.length} actifs</span>
          </div>
          <div className="flex items-center gap-2">
            <UserX className="w-4 h-4 text-red-400" />
            <span className="text-slate-400">{inactiveUsers.length} inactifs</span>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <Card className="glass-effect border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">
              Modifier l'utilisateur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">Pseudo *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="bg-slate-900/50 border-slate-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role" className="text-white">Rôle *</Label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    required
                    className="flex h-11 w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-white focus:border-purple-500 focus:ring-purple-500/20 focus:outline-none"
                  >
                    <option value="user">Joueur</option>
                    <option value="shotcaller">Shotcaller</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600"
                  disabled={saving}
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Enregistrement...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Mettre à jour
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-slate-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Liste utilisateurs actifs */}
      {!showForm && (
        <>
          <Card className="glass-effect border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-green-400" />
                Utilisateurs Actifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeUsers.map(userProfile => (
                  <div
                    key={userProfile.id}
                    className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">
                          {userProfile.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-white">{userProfile.username}</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${roleColors[userProfile.role]} bg-opacity-20 text-white mt-1`}>
                          {roleLabels[userProfile.role]}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(userProfile)}
                        className="text-yellow-400 hover:text-yellow-300"
                        title="Désactiver"
                      >
                        <UserX className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(userProfile)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(userProfile.id)}
                        className="text-red-400 hover:text-red-300"
                        disabled={userProfile.id === user?.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Liste utilisateurs inactifs */}
          {inactiveUsers.length > 0 && (
            <Card className="glass-effect border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <UserX className="w-5 h-5 text-red-400" />
                  Utilisateurs Inactifs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inactiveUsers.map(userProfile => (
                    <div
                      key={userProfile.id}
                      className="p-4 rounded-lg bg-slate-900/30 border border-slate-800/30 opacity-50 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-700 flex items-center justify-center">
                          <span className="text-slate-400 font-bold text-lg">
                            {userProfile.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-400">{userProfile.username}</p>
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-400 mt-1">
                            {roleLabels[userProfile.role]}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(userProfile)}
                          className="text-green-400 hover:text-green-300"
                          title="Réactiver"
                        >
                          <UserCheck className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(userProfile.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
