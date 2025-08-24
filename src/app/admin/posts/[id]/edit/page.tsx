'use client'

import { useState, useEffect, ChangeEvent } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import MarkdownEditor from '@/components/MarkdownEditor'
// import { Post } from '@/types/database'

const IMAGES_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_IMAGES_BUCKET || 'images'

export const dynamic = 'force-dynamic'

export default function EditPostPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  const [post, setPost] = useState({
    title: '',
    content: '',
    tag: '',
    is_draft: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin) {
      router.push('/admin')
      return
    }
    if (postId) {
      fetchPost()
    }
  }, [isAdmin, router, postId])

  async function fetchPost() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single()

      if (error) throw error
      if (!data) throw new Error('Post not found')

      setPost({
        title: data.title,
        content: data.content,
        tag: data.tag || '',
        is_draft: data.is_draft
      })
    } catch (error) {
      console.error('Error fetching post:', error)
      setError(error instanceof Error ? error.message : 'Failed to load post')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(isDraft: boolean) {
    if (!post.title.trim() || !post.content.trim()) {
      alert('Please fill in title and content')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('posts')
        .update({
          title: post.title,
          content: post.content,
          tag: post.tag || null,
          is_draft: isDraft,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)

      if (error) throw error

      router.push('/admin/content')
    } catch (error) {
      console.error('Error saving post:', error)
      alert('Error saving post: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null
    setImageFile(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setImagePreview(url)
    } else {
      setImagePreview(null)
    }
  }

  async function handleImageUpload() {
    if (!imageFile) {
      alert('Please choose an image first')
      return
    }
    try {
      setUploadingImage(true)
      setUploadError(null)
      const fileExt = imageFile.name.split('.').pop()?.toLowerCase() || 'png'
      const fileName = `${postId}-${Date.now()}.${fileExt}`
      const filePath = `posts/${postId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from(IMAGES_BUCKET)
        .upload(filePath, imageFile, {
          contentType: imageFile.type || 'image/*'
        })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from(IMAGES_BUCKET)
        .getPublicUrl(filePath)

      const publicUrl = publicUrlData.publicUrl
      if (!publicUrl) throw new Error('Failed to get public URL')

      const altText = imageFile.name.replace(/\.[^/.]+$/, '')
      const markdownToInsert = `\n\n![${altText}](${publicUrl})\n\n`
      setPost({ ...post, content: post.content + markdownToInsert })

      // Clear selection
      setImageFile(null)
      setImagePreview(null)
      alert('Image uploaded and inserted into content')
    } catch (err) {
      const message = err instanceof Error ? err.message : typeof err === 'string' ? err : JSON.stringify(err)
      console.error('Error uploading image:', message)
      setUploadError(message)
      alert(`Error uploading image: ${message}\n\nTip: ensure a public Storage bucket named "images" exists and your client has permission to upload.`)
    } finally {
      setUploadingImage(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/content')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            Back to Content
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">
              Edit Post
            </h1>
            <button
              onClick={() => router.push('/admin/content')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              Cancel
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={post.title}
                  onChange={(e) => setPost({ ...post, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter post title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tag
                </label>
                <input
                  type="text"
                  value={post.tag}
                  onChange={(e) => setPost({ ...post, tag: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter tag (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Image
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-gray-700 dark:file:text-gray-200"
                  />
                  <button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={uploadingImage || !imageFile}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg"
                  >
                    {uploadingImage ? 'Uploading…' : 'Upload & Insert'}
                  </button>
                </div>
                {imagePreview && (
                  <div className="mt-3">
                    <img src={imagePreview} alt="Preview" className="max-h-48 rounded-lg border border-gray-200 dark:border-gray-700" />
                  </div>
                )}
                {uploadError && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{uploadError}</p>
                )}
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Images are uploaded to the '{IMAGES_BUCKET}' bucket and inserted into content as Markdown.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <MarkdownEditor
                  value={post.content}
                  onChange={(content) => setPost({ ...post, content })}
                  placeholder="Write your post content here... You can use Markdown and LaTeX!"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {post.is_draft ? 'Publish' : 'Update'}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}