'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import DifficultyRadioOption from '@/components/atoms/DifficultyRadioOption'
import FormFieldError from '@/components/atoms/FormFieldError'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import { detectDifficulty } from '@/app/actions/detect-difficulty'
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'
import type { PostMissionForm, PostMissionError } from '@/lib/types/missions'

interface MissionFormFieldsProps {
  form: PostMissionForm
  error: PostMissionError
  onChange: (field: keyof PostMissionForm, value: string) => void
  onDifficultyChange: (value: 'easy' | 'medium' | 'hard') => void
  onAdaRewardChange: (value: number) => void
  onProofTypeChange: (value: 'url' | 'text' | 'image' | 'any') => void
}

type DetectionState = 'idle' | 'detecting' | 'detected' | 'failed'

const categories = QUEST_CONFIG.missions.categories.filter((c) => c.value !== 'ALL')
const difficulties = ['easy', 'medium', 'hard'] as const
const { form: cfg, ...pmCfg } = QUEST_CONFIG.postMission

const proofTypeOptions = [
  { value: 'any',   label: 'Any (URL, text, or image)' },
  { value: 'url',   label: 'URL' },
  { value: 'text',  label: 'Text' },
  { value: 'image', label: 'Image' },
] as const

export default function MissionFormFields({
  form,
  error,
  onChange,
  onDifficultyChange,
  onAdaRewardChange,
  onProofTypeChange,
}: MissionFormFieldsProps) {
  const [detectionState, setDetectionState] = useState<DetectionState>('idle')
  const [detectionError, setDetectionError] = useState<string | null>(null)
  const [showManualSelector, setShowManualSelector] = useState(false)

  const fieldError = (field: keyof PostMissionForm) =>
    error?.field === field ? error.message : null

  const runDetection = async () => {
    const title = form.title
    const brief = form.description
    if (!brief.trim() || brief.trim().length < 20) return

    setDetectionState('detecting')
    setDetectionError(null)

    const result = await detectDifficulty(title, brief)

    if ('difficulty' in result) {
      setDetectionState('detected')
      onDifficultyChange(result.difficulty)
    } else {
      setDetectionState('failed')
      setDetectionError(result.message)
    }
  }

  const handleBriefBlur = () => {
    if (form.description.trim().length >= 20) {
      runDetection()
    }
  }

  const showDifficultySelector =
    (detectionState === 'failed' && showManualSelector) ||
    (detectionState === 'detected' && showManualSelector)

  const difficultyLabel = form.difficulty
    ? form.difficulty.charAt(0).toUpperCase() + form.difficulty.slice(1).toLowerCase()
    : ''

  return (
    <div className="flex flex-col gap-6">

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
            {cfg.titleLabel}
          </Label>
          <span className="text-xs text-muted-foreground tabular-nums">
            {form.title.length}/{cfg.titleMaxLength}
          </span>
        </div>
        <Input
          value={form.title}
          onChange={(e) => onChange('title', e.target.value)}
          placeholder={cfg.titlePlaceholder}
          maxLength={cfg.titleMaxLength}
          className="bg-muted/30 border-border/50 focus:border-primary"
        />
        <FormFieldError message={fieldError('title')} />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
            {cfg.descriptionLabel}
          </Label>
          <span className="text-xs text-muted-foreground tabular-nums">
            {form.description.length}/{cfg.descriptionMaxLength}
          </span>
        </div>
        <Textarea
          value={form.description}
          onChange={(e) => onChange('description', e.target.value)}
          onBlur={handleBriefBlur}
          placeholder={cfg.descriptionPlaceholder}
          maxLength={cfg.descriptionMaxLength}
          rows={6}
          className="bg-muted/30 border-border/50 focus:border-primary resize-none"
        />
        <FormFieldError message={fieldError('description')} />

        {/* Detection status */}
        {detectionState === 'detecting' && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            {pmCfg.detectingDifficulty}
          </p>
        )}

        {detectionState === 'detected' && !showManualSelector && (
          <div className="flex items-center gap-2 mt-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
            <span className="text-xs text-green-400">
              {pmCfg.difficultyDetected}:{' '}
              <span className="font-bold uppercase tracking-widest text-primary">
                {difficultyLabel}
              </span>
            </span>
            <button
              type="button"
              onClick={runDetection}
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
            >
              {pmCfg.redetectButton}
            </button>
            <button
              type="button"
              onClick={() => setShowManualSelector(true)}
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
            >
              {pmCfg.overrideLink}
            </button>
          </div>
        )}

        {detectionState === 'failed' && !showManualSelector && (
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="text-xs text-amber-400">{detectionError ?? pmCfg.difficultyDetectFailed}</span>
            <button
              type="button"
              onClick={runDetection}
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
            >
              {pmCfg.tryAgainButton}
            </button>
            <button
              type="button"
              onClick={() => setShowManualSelector(true)}
              className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
            >
              {pmCfg.selectManuallyLink}
            </button>
          </div>
        )}
      </div>

      {/* Category */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
          {cfg.categoryLabel}
        </Label>
        <Select value={form.category} onValueChange={(v) => onChange('category', v)}>
          <SelectTrigger className="bg-muted/30 border-border/50 focus:border-primary">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value} className="text-xs uppercase tracking-widest">
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormFieldError message={fieldError('category')} />
      </div>

      {/* Difficulty — only shown when manual selector is active or on idle (no detection run yet) */}
      {(detectionState === 'idle' || showDifficultySelector) && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
              {cfg.difficultyLabel}
            </Label>
            {showManualSelector && detectionState !== 'idle' && (
              <button
                type="button"
                onClick={() => setShowManualSelector(false)}
                className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Hide
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {difficulties.map((d) => (
              <DifficultyRadioOption
                key={d}
                value={d}
                isSelected={form.difficulty === d}
                onClick={() => onDifficultyChange(d)}
              />
            ))}
          </div>
          <FormFieldError message={fieldError('difficulty')} />
        </div>
      )}

      {/* Proof Type */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
          {cfg.proofTypeLabel}
        </Label>
        <Select
          value={form.proof_type}
          onValueChange={(v) => onProofTypeChange(v as 'url' | 'text' | 'image' | 'any')}
        >
          <SelectTrigger className="bg-muted/30 border-border/50 focus:border-primary">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {proofTypeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ADA Reward */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
          {cfg.adaRewardLabel}
        </Label>
        <Input
          type="number"
          min={0}
          value={form.ada_reward === 0 ? '' : form.ada_reward}
          onChange={(e) => onAdaRewardChange(Number(e.target.value) || 0)}
          placeholder={cfg.adaRewardPlaceholder}
          className="bg-muted/30 border-border/50 focus:border-primary"
        />
        <p className="text-xs text-muted-foreground">{cfg.adaRewardHelper}</p>
      </div>

    </div>
  )
}
