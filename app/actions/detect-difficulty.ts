'use server'

import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function detectDifficulty(
  title: string,
  brief: string
): Promise<
  { difficulty: 'easy' | 'medium' | 'hard'; xp: number } |
  { error: string; message: string }
> {
  if (!brief.trim() || brief.trim().length < 20) {
    return { error: 'too_short', message: 'Brief is too short to detect difficulty.' }
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_tokens: 40,
      messages: [
        {
          role: 'system',
          content: `You are a task difficulty and XP classifier for a bounty platform. Your job is to classify a task and assign a fair XP reward.

DIFFICULTY RULES:
- easy: Simple, well-defined tasks requiring minimal skill or time. Examples: write a short paragraph, find information online, answer basic questions, create a simple social media post, take a screenshot, test a basic feature.
- medium: Tasks requiring moderate skill, time, or domain knowledge. Examples: write a detailed article, create a design mockup, build a simple script, conduct research and summarize findings, translate a document, test a complex feature and write a report.
- hard: Tasks requiring significant expertise, extended time, deep domain knowledge, or complex deliverables. Examples: build a fully functional feature, create a complete design system, write comprehensive technical documentation, develop an integration, perform a security audit.

XP RULES:
- easy range: 500 to 2000 XP
- medium range: 2100 to 6000 XP
- hard range: 6100 to 10000 XP
- Assign XP as a multiple of 100 (e.g. 500, 600, 1200, 3400, 7500)
- Base XP on: clarity of requirements, estimated completion time, skill level needed, specificity of deliverable
- When in doubt between two difficulty levels, choose the harder one
- Never assign XP outside the range for the detected difficulty

Respond with ONLY a valid JSON object, no explanation, no markdown, no backticks:
{"difficulty":"easy","xp":800}`,
        },
        {
          role: 'user',
          content: `Title: ${title.trim()}\n\nDescription: ${brief.trim()}`,
        },
      ],
    })

    const raw = completion.choices[0]?.message?.content?.trim()
    if (!raw) return { error: 'empty_response', message: 'Could not detect difficulty. Please select manually.' }

    const parsed = JSON.parse(raw)

    const validDifficulties = ['easy', 'medium', 'hard']
    if (!validDifficulties.includes(parsed.difficulty)) {
      return { error: 'invalid_difficulty', message: 'Could not detect difficulty. Please select manually.' }
    }

    const xp = parseInt(parsed.xp)
    if (isNaN(xp) || xp < 500 || xp > 10000) {
      return { error: 'invalid_xp', message: 'Could not detect difficulty. Please select manually.' }
    }

    const ranges: Record<string, [number, number]> = {
      easy: [500, 2000],
      medium: [2100, 6000],
      hard: [6100, 10000],
    }
    const [min, max] = ranges[parsed.difficulty]
    if (xp < min || xp > max) {
      return { error: 'xp_out_of_range', message: 'Could not detect difficulty. Please select manually.' }
    }

    return { difficulty: parsed.difficulty as 'easy' | 'medium' | 'hard', xp }
  } catch (err) {
    console.error('Groq difficulty detection failed:', err)
    return { error: 'detection_failed', message: 'Could not detect difficulty. Please select manually.' }
  }
}
