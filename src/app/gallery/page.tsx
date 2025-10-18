'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import PublicImageUpload from '@/components/PublicImageUpload'

export default function GalleryPage() {
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadImages()
  }, [])

  async function loadImages() {
    try {
      const res = await fetch('/api/gallery', { cache: 'no-store' })
      const data = await res.json()
      if (Array.isArray(data.images)) {
        setImages(data.images)
      }
    } catch (error) {
      console.error('Error loading images:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleImageUploaded() {
    // Reload the gallery to show the new image
    loadImages()
  }

  return (
    <main className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
              Image Gallery
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Share your neuroscience and psychology related images with the community
            </p>
          </div>

          {/* Upload Section */}
          <div className="bg-black/80 backdrop-blur-md border border-purple-700/40 rounded-none p-8 mb-12">
            <h2 className="text-2xl font-semibold text-white mb-4">Upload an Image</h2>
            <p className="text-white/80 mb-6">
              Upload images related to neuroscience, psychology, events, or research to share with the community.
            </p>
            <PublicImageUpload 
              onImageUploaded={handleImageUploaded}
              buttonText="Upload to Gallery"
            />
          </div>

          {/* Gallery Grid */}
          <div className="mb-8">
            <h2 className="text-3xl font-serif font-bold text-white mb-8">Community Gallery</h2>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-none h-12 w-12 border-b-2 border-purple-800"></div>
              </div>
            ) : images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {images.map((image, index) => (
                  <motion.div
                    key={image}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="group relative overflow-hidden rounded-none bg-black aspect-square"
                  >
                    <img
                      src={image}
                      alt={`Gallery image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-sm font-medium">
                        {image.split('/').pop()?.split('.')[0]?.replace(/-/g, ' ') || 'Image'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-white/70 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white/80 mb-2">No images yet</h3>
                <p className="text-white/70">
                  Be the first to upload an image to the community gallery!
                </p>
              </div>
            )}
          </div>

          {/* Guidelines */}
          <div className="bg-black/60 backdrop-blur-md border border-purple-700/40 rounded-none p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Upload Guidelines</h3>
            <ul className="text-white/80 text-sm space-y-2">
              <li>• Images should be related to neuroscience, psychology, or our community events</li>
              <li>• Supported formats: JPEG, PNG, WebP, GIF</li>
              <li>• Maximum file size: 5MB</li>
              <li>• Please ensure you have permission to share the image</li>
              <li>• Inappropriate content will be removed</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
