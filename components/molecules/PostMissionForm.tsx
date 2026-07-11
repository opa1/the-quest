"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import MissionFormFields from "@/components/molecules/MissionFormFields"
import MissionPreview from "@/components/molecules/MissionPreview"
import FormFieldError from "@/components/atoms/FormFieldError"
import CardanoTxStatus from "@/components/atoms/CardanoTxStatus"
import { useCardano } from "@cardano-foundation/cardano-connect-with-wallet"
import { NetworkType } from "@cardano-foundation/cardano-connect-with-wallet-core"
import { createMission } from "@/app/actions/tasks"
import { QUEST_CONFIG } from "@/lib/config/quest.config"
import { activeNetworkFromCookie } from "@/lib/config/network"
import { useAda } from "@/lib/hooks/useAda"
import { randomXpForDifficulty } from "@/lib/utils/xp"
import type {
  PostMissionForm as FormType,
  PostMissionError,
} from "@/lib/types/missions"

type TxState =
  | "idle"
  | "building"
  | "awaiting_signature"
  | "submitting"
  | "confirmed"
  | "failed"

interface PostMissionFormProps {
  hasWallet: boolean
}

export default function PostMissionForm({ hasWallet }: PostMissionFormProps) {
  const router = useRouter()
  const { adaLabel } = useAda()
  const walletNetwork =
    activeNetworkFromCookie() === "Mainnet"
      ? NetworkType.MAINNET
      : NetworkType.TESTNET
  const { enabledWallet } = useCardano({ limitNetwork: walletNetwork })
  const [form, setForm] = useState<FormType>({
    title: "",
    description: "",
    category: "",
    difficulty: "easy",
    ada_reward: 0,
    proof_type: "any",
    max_claimers: 1,
  })
  const [error, setError] = useState<PostMissionError>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [txState, setTxState] = useState<TxState>("idle")
  const [detectedXp, setDetectedXp] = useState<number | null>(null)
  const [isMultiple, setIsMultiple] = useState(false)
  const [rewardPerPerson, setRewardPerPerson] = useState<number>(
    QUEST_CONFIG.postMission.minRewardPerPerson
  )
  const [deadline, setDeadline] = useState<string | null>(null)
  const { form: cfg } = QUEST_CONFIG.postMission

  const onXpChange = (xp: number) => setDetectedXp(xp)

  const onChange = (field: keyof FormType, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (error?.field === field) setError(null)
  }

  const onDifficultyChange = (value: "easy" | "medium" | "hard") => {
    setForm((prev) => ({ ...prev, difficulty: value }))
  }

  const onAdaRewardChange = (value: number) => {
    setForm((prev) => ({ ...prev, ada_reward: value }))
  }

  const onProofTypeChange = (value: "url" | "text" | "image" | "any") => {
    setForm((prev) => ({ ...prev, proof_type: value }))
  }

  const onMaxClaimersChange = (value: number) => {
    setForm((prev) => ({ ...prev, max_claimers: value }))
  }

  const onToggleMultiple = (multiple: boolean) => {
    setIsMultiple(multiple)
    setForm((prev) => ({
      ...prev,
      max_claimers: multiple ? Math.max(2, prev.max_claimers) : 1,
    }))
  }

  const validate = (): PostMissionError => {
    if (!form.title.trim() || form.title.trim().length < 10)
      return { field: "title", message: "Title must be at least 10 characters." }
    if (!form.description.trim() || form.description.trim().length < 30)
      return { field: "description", message: "Brief must be at least 30 characters." }
    if (!form.category)
      return { field: "category", message: "Please select a category." }
    return null
  }

  const handleSubmit = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    if (isMultiple) {
      if (form.max_claimers < 2 || form.max_claimers > 100) {
        setError({ field: "submit", message: "Slot count must be between 2 and 100." })
        return
      }
      if (rewardPerPerson < QUEST_CONFIG.postMission.minRewardPerPerson) {
        setError({ field: "submit", message: "Minimum reward per person is 5 ADA." })
        return
      }
    } else if (!form.ada_reward || form.ada_reward <= 0) {
      setError({ field: "submit", message: QUEST_CONFIG.postMission.adaRequiredError.replaceAll("{ADA}", adaLabel) })
      return
    }

    if (deadline) {
      const d = new Date(deadline)
      const now = new Date()
      if (d < new Date(now.getTime() + 24 * 60 * 60 * 1000)) {
        setError({ field: "submit", message: "Deadline must be at least 24 hours from now." })
        return
      }
      if (d > new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)) {
        setError({ field: "submit", message: "Deadline cannot be more than 3 months from now." })
        return
      }
    }

    setIsSubmitting(true)
    setError(null)

    let depositTxHash: string | undefined

    try {
      if (!enabledWallet) {
        setError({ field: "submit", message: QUEST_CONFIG.postMission.noWalletError })
        setIsSubmitting(false)
        return
      }

      setTxState("building")
      const cardano = (
        window as unknown as {
          cardano?: Record<string, { enable: () => Promise<unknown> }>
        }
      ).cardano

      if (!cardano?.[enabledWallet]) {
        setError({ field: "submit", message: QUEST_CONFIG.postMission.noWalletError })
        setIsSubmitting(false)
        setTxState("idle")
        return
      }

      const api = await cardano[enabledWallet].enable()
      setTxState("awaiting_signature")

      const { depositBounty } = await import("@/lib/cardano/deposit")
      // Escrow covers one payout per claimer slot.
      const depositLovelace = isMultiple
        ? form.max_claimers * Math.round(rewardPerPerson * 1_000_000)
        : Math.round(form.ada_reward * 1_000_000)
      const depositResult = await depositBounty(api, BigInt(depositLovelace))
      setTxState("submitting")

      if ("error" in depositResult) {
        setError({ field: "submit", message: depositResult.message })
        setIsSubmitting(false)
        setTxState("failed")
        return
      }

      depositTxHash = depositResult.txHash
      setTxState("confirmed")
    } catch {
      setError({ field: "submit", message: "Wallet interaction failed. Please try again." })
      setIsSubmitting(false)
      setTxState("failed")
      return
    }

    const result = await createMission({
      ...form,
      ada_reward: isMultiple ? rewardPerPerson : form.ada_reward,
      max_claimers: isMultiple ? form.max_claimers : 1,
      reward_per_claimer: isMultiple
        ? Math.round(rewardPerPerson * 1_000_000)
        : Math.round(form.ada_reward * 1_000_000),
      deadline: deadline ? new Date(deadline).toISOString() : null,
      deposit_tx_hash: depositTxHash,
      reward_credits: detectedXp ?? randomXpForDifficulty(form.difficulty),
    })
    if ("error" in result && result.error) {
      const msg =
        "message" in result && result.message
          ? result.message
          : "Failed to deploy mission. Please try again."
      console.error("[PostMissionForm] createMission error:", result)
      setError({ field: "submit", message: msg })
      setIsSubmitting(false)
      setTxState("idle")
      return
    }
    if ("taskId" in result && result.taskId) {
      router.push(`/tasks/${result.taskId}`)
    }
  }

  const isActiveTx = ["building", "awaiting_signature", "submitting"].includes(txState)

  const submitButton = (
    <div className="flex flex-col gap-3">
      {txState !== "idle" && <CardanoTxStatus state={txState} />}
      <Button
        variant="default"
        size="lg"
        className="w-full"
        onClick={handleSubmit}
        disabled={isSubmitting || isActiveTx}
      >
        {(isSubmitting || isActiveTx) && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        <span className="text-sm font-bold tracking-widest uppercase">
          {isActiveTx
            ? QUEST_CONFIG.postMission.processingPaymentLabel
            : isSubmitting
              ? cfg.submittingLabel
              : cfg.submitLabel}
        </span>
      </Button>
    </div>
  )

  if (!hasWallet) {
    return (
      <Card className="flex max-w-md flex-col gap-4 rounded-[16px] border-primary/40 bg-card p-8">
        <h2 className="font-heading text-base font-black tracking-widest text-foreground uppercase">
          {QUEST_CONFIG.postMission.walletRequired.title}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {QUEST_CONFIG.postMission.walletRequired.subtext}
        </p>
        <Button variant="default" size="lg" asChild>
          <Link href="/profile">
            <span className="text-sm font-bold tracking-widest uppercase">
              {QUEST_CONFIG.postMission.walletRequired.ctaLabel}
            </span>
          </Link>
        </Button>
      </Card>
    )
  }

  return (
    <>
      {/* Desktop (lg+) - two columns */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_380px] lg:gap-12">
        {/* Left - form */}
        <div className="flex flex-col gap-6">
          <MissionFormFields
            form={form}
            error={error}
            onChange={onChange}
            onDifficultyChange={onDifficultyChange}
            onAdaRewardChange={onAdaRewardChange}
            onProofTypeChange={onProofTypeChange}
            onMaxClaimersChange={onMaxClaimersChange}
            onXpChange={onXpChange}
            isMultiple={isMultiple}
            onToggleMultiple={onToggleMultiple}
            rewardPerPerson={rewardPerPerson}
            onRewardPerPersonChange={setRewardPerPerson}
            deadline={deadline}
            onDeadlineChange={setDeadline}
          />
          <Separator />
          {error?.field === "submit" && (
            <FormFieldError message={error.message} />
          )}
          {submitButton}
        </div>

        {/* Right - sticky preview */}
        <div className="sticky top-24 self-start">
          <MissionPreview
            form={form}
            xp={detectedXp ?? undefined}
            maxClaimers={isMultiple ? form.max_claimers : 1}
            rewardPerPerson={isMultiple ? rewardPerPerson : undefined}
            deadline={deadline}
          />
        </div>
      </div>

      {/* Mobile / tablet (< lg) - tabs */}
      <div className="lg:hidden">
        <Tabs defaultValue="form">
          <TabsList className="mb-6 w-full">
            <TabsTrigger
              value="form"
              className="flex-1 text-xs font-bold tracking-widest uppercase"
            >
              {QUEST_CONFIG.postMission.formTab}
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="flex-1 text-xs font-bold tracking-widest uppercase"
            >
              {QUEST_CONFIG.postMission.previewTab}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="form">
            <div className="flex flex-col gap-6">
              <MissionFormFields
                form={form}
                error={error}
                onChange={onChange}
                onDifficultyChange={onDifficultyChange}
                onAdaRewardChange={onAdaRewardChange}
                onProofTypeChange={onProofTypeChange}
                onMaxClaimersChange={onMaxClaimersChange}
                onXpChange={onXpChange}
                isMultiple={isMultiple}
                onToggleMultiple={onToggleMultiple}
                rewardPerPerson={rewardPerPerson}
                onRewardPerPersonChange={setRewardPerPerson}
                deadline={deadline}
                onDeadlineChange={setDeadline}
              />
              <Separator />
              {error?.field === "submit" && (
                <FormFieldError message={error.message} />
              )}
              {submitButton}
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <MissionPreview
            form={form}
            xp={detectedXp ?? undefined}
            maxClaimers={isMultiple ? form.max_claimers : 1}
            rewardPerPerson={isMultiple ? rewardPerPerson : undefined}
            deadline={deadline}
          />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
