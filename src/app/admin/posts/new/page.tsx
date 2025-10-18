'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import MarkdownEditor from '@/components/MarkdownEditor'
import ImageUpload from '@/components/ImageUpload'

export const dynamic = 'force-dynamic'

export default function NewPostPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [post, setPost] = useState({
    title: '',
    content: '',
    tag: '',
    is_draft: false
  })
  const [saving, setSaving] = useState(false)
  const [postId, setPostId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin) {
      router.push('/admin')
    }
  }, [isAdmin, router])

  async function handleSave(isDraft: boolean) {
    if (!post.title.trim() || !post.content.trim()) {
      alert('Please fill in title and content')
      return
    }

    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          title: post.title,
          content: post.content,
          tag: post.tag || null,
          is_draft: isDraft
        })
        .select()
        .single()

      if (error) throw error
      
      if (data) {
        setPostId(data.id)
      }

      router.push('/admin/content')
    } catch (error) {
      console.error('Error saving post:', error)
      alert('Error saving post')
    } finally {
      setSaving(false)
    }
  }

  function handleImageInserted(markdownText: string) {
    setPost({ ...post, content: post.content + '\n\n' + markdownText + '\n\n' })
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Create New Post
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
                entityId={postId || 'temp'}
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
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
