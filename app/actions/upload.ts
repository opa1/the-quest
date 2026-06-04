'use server'

import { createClient } from '@/lib/supabase/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadProofImage(
  formData: FormData
): Promise<{ url: string } | { error: string; message: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'not_authenticated', message: 'You must be signed in.' }

  const file = formData.get('file') as File
  if (!file) return { error: 'no_file', message: 'No file provided.' }

  const maxMb = parseFloat(process.env.NEXT_PUBLIC_MAX_PROOF_IMAGE_SIZE_MB ?? '5')
  const maxBytes = maxMb * 1024 * 1024

  if (file.size > maxBytes) {
    return {
      error: 'file_too_large',
      message: `Image must be under ${maxMb}MB.`,
    }
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return {
      error: 'invalid_type',
      message: 'Only JPEG, PNG, WEBP, and GIF images are allowed.',
    }
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `thequest/proofs/${user.id}`,
            resource_type: 'image',
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          },
          (error, result) => {
            if (error || !result) reject(error)
            else resolve(result as { secure_url: string })
          }
        )
        .end(buffer)
    })

    return { url: result.secure_url }
  } catch (err) {
    console.error('Cloudinary upload failed:', err)
    return { error: 'upload_failed', message: 'Image upload failed. Please try again.' }
  }
}
