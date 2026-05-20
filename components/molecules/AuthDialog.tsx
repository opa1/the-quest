'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import XIcon from '@/components/atoms/XIcon'
import { useAuthStore } from '@/lib/stores/auth.store'
import { QUEST_CONFIG } from '@/lib/config/quest.config'

export default function AuthDialog() {
  const { isDialogOpen, closeDialog, signInWithX } = useAuthStore()
  const { dialog } = QUEST_CONFIG.auth

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="bg-card border-border/50 rounded-[16px] max-w-md p-8">
        <DialogHeader className="space-y-3">
          <div className="flex justify-center mb-2">
            <span className="text-xs uppercase tracking-[0.3em] text-primary font-semibold font-heading">
              THE QUEST
            </span>
          </div>

          <DialogTitle className="text-4xl font-black uppercase tracking-widest text-foreground text-center font-heading">
            {dialog.title}
          </DialogTitle>

          <DialogDescription className="text-sm text-muted-foreground text-center leading-relaxed">
            {dialog.subtext}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-6 items-center">
          <div className="flex flex-col gap-2 w-fit">
            <Button
              variant="default"
              size="lg"
              onClick={signInWithX}
            >
              <XIcon className="w-4 h-4 mr-2" />
              <span className="uppercase tracking-widest text-sm font-bold">
                {dialog.xButton}
              </span>
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              {dialog.xSubtext}
            </p>
          </div>
        </div>

        <Separator className="my-4" />

        <p className="text-[10px] text-muted-foreground/60 text-center leading-relaxed">
          {dialog.terms}
        </p>
      </DialogContent>
    </Dialog>
  )
}
