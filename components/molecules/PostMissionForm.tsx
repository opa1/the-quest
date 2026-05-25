'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import MissionFormFields from '@/components/molecules/MissionFormFields'
import MissionPreview from '@/components/molecules/MissionPreview'
import FormFieldError from '@/components/atoms/FormFieldError'
import { createMission } from '@/app/actions/tasks'
import { QUEST_CONFIG } from '@/lib/config/quest.config'
import type { PostMissionForm as FormType, PostMissionError } from '@/lib/types/missions'

export default function PostMissionForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormType>({
    title: '',
    description: '',
    category: '',
    difficulty: 'easy',
    ada_reward: 0,
    proof_type: 'any',
  })
  const [error, setError] = useState<PostMissionError>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { form: cfg } = QUEST_CONFIG.postMission

  const onChange = (field: keyof FormType, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (error?.field === field) setError(null)
  }

  const onDifficultyChange = (value: 'easy' | 'medium' | 'hard') => {
    setForm((prev) => ({ ...prev, difficulty: value }))
  }

  const onAdaRewardChange = (value: number) => {
    setForm((prev) => ({ ...prev, ada_reward: value }))
  }

  const onProofTypeChange = (value: 'url' | 'text' | 'image' | 'any') => {
    setForm((prev) => ({ ...prev, proof_type: value }))
  }

  const validate = (): PostMissionError => {
    if (!form.title.trim() || form.title.trim().length < 10)
      return { field: 'title', message: 'Title must be at least 10 characters.' }
    if (!form.description.trim() || form.description.trim().length < 30)
      return { field: 'description', message: 'Brief must be at least 30 characters.' }
    if (!form.category)
      return { field: 'category', message: 'Please select a category.' }
    return null
  }

  const handleSubmit = async () => {
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setIsSubmitting(true)
    setError(null)
    const result = await createMission(form)
    if ('error' in result && result.error) {
      setError({ field: 'submit', message: 'Failed to deploy mission. Please try again.' })
      setIsSubmitting(false)
      return
    }
    if ('taskId' in result && result.taskId) {
      router.push(`/tasks/${result.taskId}`)
    }
  }

  const submitButton = (
    <Button
      variant="default"
      size="lg"
      className="w-full"
      onClick={handleSubmit}
      disabled={isSubmitting}
    >
      {isSubmitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
      <span className="uppercase tracking-widest text-sm font-bold">
        {isSubmitting ? cfg.submittingLabel : cfg.submitLabel}
      </span>
    </Button>
  )

  return (
    <>
      {/* Desktop (lg+) — two columns */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_380px] lg:gap-12">
        {/* Left — form */}
        <div className="flex flex-col gap-6">
          <MissionFormFields
            form={form}
            error={error}
            onChange={onChange}
            onDifficultyChange={onDifficultyChange}
            onAdaRewardChange={onAdaRewardChange}
            onProofTypeChange={onProofTypeChange}
          />
          <Separator />
          {error?.field === 'submit' && <FormFieldError message={error.message} />}
          {submitButton}
        </div>

        {/* Right — sticky preview */}
        <div className="sticky top-24 self-start">
          <MissionPreview form={form} />
        </div>
      </div>

      {/* Mobile / tablet (< lg) — tabs */}
      <div className="lg:hidden">
        <Tabs defaultValue="form">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="form" className="flex-1 uppercase tracking-widest text-xs font-bold">
              {cfg.submitLabel === 'DEPLOY MISSION' ? QUEST_CONFIG.postMission.formTab : QUEST_CONFIG.postMission.formTab}
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex-1 uppercase tracking-widest text-xs font-bold">
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
              />
              <Separator />
              {error?.field === 'submit' && <FormFieldError message={error.message} />}
              {submitButton}
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <MissionPreview form={form} />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
