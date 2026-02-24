'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface PinDialogProps {
  open: boolean
  pin: string
  onClose: () => void
}

export function PinDialog({ open, pin, onClose }: PinDialogProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pin)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-effect border-slate-700/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            🎉 Compte créé avec succès !
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Votre code PIN a été généré. Conservez-le précieusement !
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <div className="text-center mb-4">
            <p className="text-sm text-slate-400 mb-3">Votre code PIN :</p>
            <div className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <span className="text-5xl font-bold text-white tracking-wider">
                {pin.split('').join(' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="border-slate-700 hover:bg-slate-800"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2 text-green-400" />
                  Copié !
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copier le PIN
                </>
              )}
            </Button>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <p className="text-sm text-yellow-400 text-center">
              ⚠️ <strong>Important :</strong> Sauvegardez ce code PIN quelque part en sécurité.
              Vous en aurez besoin pour vos prochaines connexions.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white font-semibold"
          >
            J'ai noté mon PIN
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
