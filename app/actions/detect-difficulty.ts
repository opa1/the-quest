'use server'

import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function detectDifficulty(
  title: string,
  brief: string
): Promise<{ difficulty: 'easy' | 'medium' | 'hard' } | { error: string; message: string }> {
  if (!brief.trim() || brief.trim().length < 20) {
    return { error: 'too_short', message: 'Brief is too short to detect difficulty.' }
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_tokens: 10,
      messages: [
        {
          role: 'system',
          content: `You are a task difficulty classifier for a bounty platform. Your only job is to classify a task as easy, medium, or hard based on its title and description.

Classification rules:
- easy: Simple, well-defined tasks that require minimal skill or time. Examples: write a short paragraph, find information online, fill out a form, answer basic questions, create a simple social media post, take a screenshot, test a basic feature.
- medium: Tasks that require moderate skill, time, or domain knowledge. Examples: write a detailed article, create a design mockup, build a simple script, conduct research and summarize findings, translate a document, create a short video, test a complex feature and write a report.
- hard: Tasks that require significant expertise, extended time, deep domain knowledge, or complex deliverables. Examples: build a fully functional feature, create a complete design system, write comprehensive technical documentation, develop an integration, perform a security audit, build a data pipeline, create a professional video production.

When in doubt between two levels, choose the harder one.

Respond with exactly one word: easy, medium, or hard. No punctuation. No explanation. No other text.`,
        },
        {
          role: 'user',
          content: `Title: ${title.trim()}\n\nDescription: ${brief.trim()}`,
        },
      ],
    })

    const raw = completion.choices[0]?.message?.content?.trim().toLowerCase()

    if (raw === 'easy' || raw === 'medium' || raw === 'hard') {
      return { difficulty: raw }
    }

    return { error: 'invalid_response', message: 'Could not detect difficulty. Please select manually.' }
  } catch (err) {
    console.error('Groq difficulty detection failed:', err)
    return { error: 'detection_failed', message: 'Could not detect difficulty. Please select manually.' }
  }
}
