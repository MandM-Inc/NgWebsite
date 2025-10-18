'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import MarkdownEditor from '@/components/MarkdownEditor'
import ImageUpload from '@/components/ImageUpload'

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

  function handleImageInserted(markdownText: string) {
    setPost({ ...post, content: post.content + '\n\n' + markdownText + '\n\n' })
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-none h-12 w-12 border-b-2 border-purple-800"></div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/content')}
            className="px-4 py-2 bg-purple-800 hover:bg-purple-700 text-white rounded-none btn-animate"
          >
            Back to Content
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Edit Post
          </h1>
          <button
            onClick={() => router.push('/admin/content')}
            className="text-white/70 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="card p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Title
              </label>
              <input
                type="text"
                value={post.title}
                onChange={(e) => setPost({ ...post, title: e.target.value })}
                className="w-full px-4 py-2 bg-black border border-purple-700/40 rounded-none text-white focus:outline-none focus:ring-2 focus:ring-purple-800"
                placeholder="Enter post title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Tag
              </label>
              <input
                type="text"
                value={post.tag}
                onChange={(e) => setPost({ ...post, tag: e.target.value })}
                className="w-full px-4 py-2 bg-black border border-purple-700/40 rounded-none text-white focus:outline-none focus:ring-2 focus:ring-purple-800"
                placeholder="Enter tag (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Content
              </label>
              <MarkdownEditor
                value={post.content}
                onChange={(content) => setPost({ ...post, content })}
                placeholder="Write your post content here... You can use Markdown and LaTeX!"
              />
            </div>

            <div className="border-t border-purple-700/40 pt-6">
              <ImageUpload
                onImageInserted={handleImageInserted}
                entityType="posts"
                entityId={postId}
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="px-6 py-2 bg-purple-900/40 hover:bg-purple-900/40 text-white rounded-none font-semibold transition-colors disabled:opacity-50 btn-animate"
              >
                Save as Draft
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="px-6 py-2 bg-purple-800 hover:bg-purple-700 text-white rounded-none font-semibold transition-colors disabled:opacity-50 btn-animate"
              >
                {post.is_draft ? 'Publish' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
