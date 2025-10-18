'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Comment, Post, Event } from '@/types/database'

interface CommentWithContent extends Comment {
  post?: Post
  event?: Event
}

export const dynamic = 'force-dynamic'

export default function CommentsManagementPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [comments, setComments] = useState<CommentWithContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'posts' | 'events'>('all')

  useEffect(() => {
    if (!isAdmin) {
      router.push('/admin')
      return
    }
    fetchComments()
  }, [isAdmin, router])

  async function fetchComments() {
    try {
      setError(null)
      
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false })

      if (commentsError) throw commentsError

      const postIds = [...new Set(commentsData?.filter(c => c.post_id).map(c => c.post_id) || [])]
      const eventIds = [...new Set(commentsData?.filter(c => c.event_id).map(c => c.event_id) || [])]

      const [postsResult, eventsResult] = await Promise.all([
        postIds.length > 0 ? supabase.from('posts').select('id, title').in('id', postIds) : { data: [] },
        eventIds.length > 0 ? supabase.from('events').select('id, title').in('id', eventIds) : { data: [] }
      ])

      const postsMap = new Map(postsResult.data?.map(p => [p.id, p]) || [])
      const eventsMap = new Map(eventsResult.data?.map(e => [e.id, e]) || [])

      const enrichedComments = commentsData?.map(comment => ({
        ...comment,
        post: comment.post_id ? postsMap.get(comment.post_id) : undefined,
        event: comment.event_id ? eventsMap.get(comment.event_id) : undefined
      })) || []

      setComments(enrichedComments)
    } catch (error) {
      console.error('Error fetching comments:', error)
      setError(error instanceof Error ? error.message : 'Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  async function deleteComment(id: string) {
    if (!confirm('Are you sure you want to delete this comment?')) return

    setActionLoading(`delete-${id}`)
    try {
      const { error } = await supabase.from('comments').delete().eq('id', id)
      if (error) throw error
      setComments(comments.filter(comment => comment.id !== id))
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Failed to delete comment')
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredComments = comments.filter(comment => {
    if (filter === 'posts') return comment.post_id !== null
    if (filter === 'events') return comment.event_id !== null
    return true
  })

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
          <button onClick={fetchComments} className="px-4 py-2 bg-purple-800 hover:bg-purple-700 text-white rounded-none btn-animate">
            Try Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-white">Comment Management</h1>
          <Link href="/admin/dashboard" className="px-4 py-2 bg-purple-900/30 hover:bg-purple-900/40 text-white rounded-none text-sm font-semibold transition-colors btn-animate">
            Back to Dashboard
          </Link>
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-none font-semibold transition-colors ${
              filter === 'all' ? 'bg-purple-800 text-white' : 'bg-purple-900/30 text-white/80 hover:bg-purple-900/40'
            }`}
          >
            All Comments ({comments.length})
          </button>
          <button
            onClick={() => setFilter('posts')}
            className={`px-4 py-2 rounded-none font-semibold transition-colors ${
              filter === 'posts' ? 'bg-purple-800 text-white' : 'bg-purple-900/30 text-white/80 hover:bg-purple-900/40'
            }`}
          >
            Post Comments ({comments.filter(c => c.post_id).length})
          </button>
          <button
            onClick={() => setFilter('events')}
            className={`px-4 py-2 rounded-none font-semibold transition-colors ${
              filter === 'events' ? 'bg-purple-800 text-white' : 'bg-purple-900/30 text-white/80 hover:bg-purple-900/40'
            }`}
          >
            Event Comments ({comments.filter(c => c.event_id).length})
          </button>
        </div>

        <div className="card overflow-hidden">
          {filteredComments.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-white/70">No comments found for the selected filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-purple-700/40">
              {filteredComments.map((comment) => (
                <div key={comment.id} className="p-6 hover:bg-purple-900/30/50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white">{comment.author_name}</h3>
                        <span className="text-sm text-white/60">{formatDate(comment.created_at)}</span>
                      </div>
                      
                      <p className="text-white/80 mb-3">{comment.content}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        {comment.post && (
                          <Link href={`/posts/${comment.post_id}`} target="_blank" className="text-purple-600 hover:text-purple-500">
                            Post: {comment.post.title}
                          </Link>
                        )}
                        {comment.event && (
                          <Link href={`/events/${comment.event_id}`} target="_blank" className="text-purple-600 hover:text-purple-500">
                            Event: {comment.event.title}
                          </Link>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteComment(comment.id)}
                      disabled={actionLoading === `delete-${comment.id}`}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm transition-colors disabled:opacity-50 btn-animate"
                    >
                      {actionLoading === `delete-${comment.id}` ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
