import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const IMAGES_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_IMAGES_BUCKET || 'images'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const entityType = formData.get('entityType') as string || 'general'
    const entityId = formData.get('entityId') as string || 'temp'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPEG, PNG, WebP, or GIF images.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png'
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const fileName = `${entityId}-${timestamp}-${randomId}.${fileExt}`
    const filePath = `${entityType}/${entityId}/${fileName}`

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(IMAGES_BUCKET)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(IMAGES_BUCKET)
      .getPublicUrl(filePath)

    const publicUrl = publicUrlData.publicUrl
    if (!publicUrl) {
      return NextResponse.json(
        { error: 'Failed to get public URL' },
        { status: 500 }
      )
    }

    // Generate alt text from filename
    const altText = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')

    return NextResponse.json({
      success: true,
      url: publicUrl,
      altText,
      fileName,
      filePath
    })

  } catch (error) {
    console.error('API upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
