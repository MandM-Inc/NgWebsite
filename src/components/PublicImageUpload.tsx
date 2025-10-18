'use client'

import { useState, ChangeEvent } from 'react'

interface PublicImageUploadProps {
  onImageUploaded?: (imageUrl: string, altText: string) => void
  className?: string
  buttonText?: string
  showPreview?: boolean
}

export default function PublicImageUpload({ 
  onImageUploaded, 
  className = '', 
  buttonText = 'Upload Image',
  showPreview = true 
}: PublicImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setSelectedFile(file || null)
    setError(null)
    setUploadedUrl(null)
    
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, WebP, or GIF)')
        return
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        setError('Image file must be smaller than 5MB')
        return
      }

      const url = URL.createObjectURL(file)
      setPreview(url)
    } else {
      setPreview(null)
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError('Please select an image first')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('entityType', 'general')
      formData.append('entityId', 'public')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed')
      }

      setUploadedUrl(result.url)
      
      // Call the callback if provided
      if (onImageUploaded) {
        onImageUploaded(result.url, result.altText)
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
    } finally {
      setUploading(false)
    }
  }

  function clearSelection() {
    setSelectedFile(null)
    setPreview(null)
    setError(null)
    setUploadedUrl(null)
    
    // Reset file input
    const fileInput = document.getElementById('public-image-upload') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            id="public-image-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-white/60 dark:text-white/70
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-none file:border-0
                     file:text-sm file:font-medium
                     file:bg-purple-50 file:text-purple-700
                     hover:file:bg-purple-100
                     dark:file:bg-purple-900 dark:file:text-purple-500
                     dark:hover:file:bg-purple-800
                     file:cursor-pointer cursor-pointer"
          />
        </div>
        
        {selectedFile && !uploadedUrl && (
          <div className="flex gap-2">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 bg-purple-800 hover:bg-purple-700 disabled:bg-purple-600 text-white rounded-none font-medium transition-colors text-sm"
            >
              {uploading ? 'Uploading...' : buttonText}
            </button>
            <button
              onClick={clearSelection}
              disabled={uploading}
              className="px-4 py-2 bg-white0 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded-none font-medium transition-colors text-sm"
            >
              Clear
            </button>
          </div>
        )}

        {uploadedUrl && (
          <button
            onClick={clearSelection}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-none font-medium transition-colors text-sm"
          >
            Upload Another
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-none">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {uploadedUrl && (
        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-none">
          <p className="text-sm text-green-600 dark:text-green-400">
            ✅ Image uploaded successfully! 
          </p>
          <div className="mt-2">
            <input
              type="text"
              value={uploadedUrl}
              readOnly
              className="w-full px-3 py-1 bg-white dark:bg-black border border-purple-700/40 dark:border-purple-700/40 text-sm font-mono"
              onClick={(e) => e.currentTarget.select()}
            />
            <p className="text-xs text-white/60 dark:text-white/70 mt-1">
              Click to select and copy the URL
            </p>
          </div>
        </div>
      )}

      {showPreview && preview && (
        <div className="space-y-2">
          <p className="text-sm text-white/60 dark:text-white/70">Preview:</p>
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Preview"
              className="max-w-xs max-h-48 rounded-none border border-purple-700/40 dark:border-purple-700/40"
            />
            <div className="mt-2 text-xs text-white/60 dark:text-white/70">
              {selectedFile?.name} ({((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB)
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-white/60 dark:text-white/70">
        Supported formats: JPEG, PNG, WebP, GIF. Max file size: 5MB.
      </div>
    </div>
  )
}
