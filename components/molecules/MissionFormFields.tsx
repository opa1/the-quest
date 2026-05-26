'use client'

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
import type { PostMissionForm, PostMissionError } from '@/lib/types/missions'

interface MissionFormFieldsProps {
  form: PostMissionForm
  error: PostMissionError
  onChange: (field: keyof PostMissionForm, value: string) => void
  onDifficultyChange: (value: 'easy' | 'medium' | 'hard') => void
  onAdaRewardChange: (value: number) => void
  onProofTypeChange: (value: 'url' | 'text' | 'image' | 'any') => void
}

const categories = QUEST_CONFIG.missions.categories.filter((c) => c.value !== 'ALL')
const difficulties = ['easy', 'medium', 'hard'] as const
const { form: cfg } = QUEST_CONFIG.postMission

const proofTypeOptions = [
  { value: 'any',   label: 'Any (URL, text, or image)' },
  { value: 'url',   label: 'URL' },
  { value: 'text',  label: 'Text' },
  { value: 'image', label: 'Image' },
] as const

export default function MissionFormFields({ form, error, onChange, onDifficultyChange, onAdaRewardChange, onProofTypeChange }: MissionFormFieldsProps) {
  const fieldError = (field: keyof PostMissionForm) =>
    error?.field === field ? error.message : null

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
          placeholder={cfg.descriptionPlaceholder}
          maxLength={cfg.descriptionMaxLength}
          rows={6}
          className="bg-muted/30 border-border/50 focus:border-primary resize-none"
        />
        <FormFieldError message={fieldError('description')} />
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

      {/* Difficulty */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">
          {cfg.difficultyLabel}
        </Label>
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
