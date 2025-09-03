'use client'

import { useState, ChangeEvent } from 'react'
import { supabase } from '@/lib/supabase'

interface ImageUploadProps {
  onImageInserted: (markdownText: string) => void
  entityType: 'posts' | 'events'
  entityId?: string
  className?: string
}

const IMAGES_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_IMAGES_BUCKET || 'images'

export default function ImageUpload({ onImageInserted, entityType, entityId, className = '' }: ImageUploadProps) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setImageFile(file || null)
    setError(null)
    
    if (file) {
      const url = URL.createObjectURL(file)
      setImagePreview(url)
    } else {
      setImagePreview(null)
    }
  }

  async function handleImageUpload() {
    if (!imageFile) {
      setError('Please choose an image first')
      return
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(imageFile.type)) {
      setError('Please select a valid image file (JPEG, PNG, WebP, or GIF)')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (imageFile.size > maxSize) {
      setError('Image file must be smaller than 5MB')
      return
    }

    try {
      setUploading(true)
      setError(null)
      
      const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'png'
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 15)
      const fileName = `${entityId || 'temp'}-${timestamp}-${randomId}.${fileExt}`
      const filePath = `${entityType}/${entityId || 'temp'}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(IMAGES_BUCKET)
        .upload(filePath, imageFile, {
          contentType: imageFile.type,
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from(IMAGES_BUCKET)
        .getPublicUrl(filePath)

      const publicUrl = publicUrlData.publicUrl
      if (!publicUrl) throw new Error('Failed to get public URL')

      // Generate alt text from filename (remove extension and clean up)
      const altText = imageFile.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
      const markdownToInsert = `![${altText}](${publicUrl})`
      
      // Call the callback to insert the markdown
      onImageInserted(markdownToInsert)

      // Clear the form
      setImageFile(null)
      setImagePreview(null)
      
      // Reset file input
      const fileInput = document.getElementById('image-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('Error uploading image:', message)
      setError(`Upload failed: ${message}`)
    } finally {
      setUploading(false)
    }
  }

  function clearSelection() {
    setImageFile(null)
    setImagePreview(null)
    setError(null)
    const fileInput = document.getElementById('image-upload') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Upload Image
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 dark:text-gray-400
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-lg file:border-0
                     file:text-sm file:font-medium
                     file:bg-purple-50 file:text-purple-700
                     hover:file:bg-purple-100
                     dark:file:bg-purple-900 dark:file:text-purple-300
                     dark:hover:file:bg-purple-800
                     file:cursor-pointer cursor-pointer"
          />
        </div>
        
        {imageFile && (
          <div className="flex gap-2">
            <button
              onClick={handleImageUpload}
              disabled={uploading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg font-medium transition-colors text-sm"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
            <button
              onClick={clearSelection}
              disabled={uploading}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors text-sm"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {imagePreview && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">Preview:</p>
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="max-w-xs max-h-48 rounded-lg border border-gray-200 dark:border-gray-700"
            />
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {imageFile?.name} ({((imageFile?.size || 0) / 1024 / 1024).toFixed(2)} MB)
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400">
        Supported formats: JPEG, PNG, WebP, GIF. Max file size: 5MB.
      </div>
    </div>
  )
}
