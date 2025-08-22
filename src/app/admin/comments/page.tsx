'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
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
    const loadData = async () => {
      try {
        await fetchComments()
      } catch (error) {
        console.error('Error in useEffect:', error)
      }
    }
    loadData()
  }, [isAdmin, router])

  async function fetchComments() {
    try {
      setError(null)
      
      // Fetch comments with related posts and events
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false })

      if (commentsError) throw commentsError

      // Fetch related posts and events
      const postIds = [...new Set(commentsData?.filter(c => c.post_id).map(c => c.post_id) || [])]
      const eventIds = [...new Set(commentsData?.filter(c => c.event_id).map(c => c.event_id) || [])]

      const [postsResult, eventsResult] = await Promise.all([
        postIds.length > 0 
          ? supabase.from('posts').select('id, title').in('id', postIds)
          : { data: [] },
        eventIds.length > 0
          ? supabase.from('events').select('id, title').in('id', eventIds)
          : { data: [] }
      ])

      // Map posts and events by ID for quick lookup
      const postsMap = new Map(postsResult.data?.map(p => [p.id, p]) || [])
      const eventsMap = new Map(eventsResult.data?.map(e => [e.id, e]) || [])

      // Combine comments with their related content
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
    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) return

    setActionLoading(`delete-${id}`)
    try {
      const { error } = await supabase.from('comments').delete().eq('id', id)
      if (error) throw error
      
      // Update local state immediately
      setComments(comments.filter(comment => comment.id !== id))
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('Failed to delete comment: ' + (error instanceof Error ? error.message : 'Unknown error'))
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

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const filteredComments = comments.filter(comment => {
    if (filter === 'posts') return comment.post_id !== null
    if (filter === 'events') return comment.event_id !== null
    return true
  })

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
            onClick={fetchComments}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">
            Comment Management
          </h1>
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All Comments ({comments.length})
          </button>
          <button
            onClick={() => setFilter('posts')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'posts'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Post Comments ({comments.filter(c => c.post_id).length})
          </button>
          <button
            onClick={() => setFilter('events')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              filter === 'events'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Event Comments ({comments.filter(c => c.event_id).length})
          </button>
        </div>

        {/* Comments List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {filteredComments.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No comments found for the selected filter.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredComments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {comment.author_name}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {truncateContent(comment.content)}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        {comment.post && (
                          <Link
                            href={`/posts/${comment.post_id}`}
                            target="_blank"
                            className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Post: {comment.post.title}
                          </Link>
                        )}
                        {comment.event && (
                          <Link
                            href={`/events/${comment.event_id}`}
                            target="_blank"
                            className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Event: {comment.event.title}
                          </Link>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => deleteComment(comment.id)}
                        disabled={actionLoading === `delete-${comment.id}`}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors disabled:opacity-50"
                      >
                        {actionLoading === `delete-${comment.id}` ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}