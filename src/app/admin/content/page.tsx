'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Post, Event } from '@/types/database'

export const dynamic = 'force-dynamic'

export default function ContentManagementPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [activeTab, setActiveTab] = useState<'posts' | 'events'>('posts')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin) {
      router.push('/admin')
      return
    }
    fetchContent()
  }, [isAdmin, router])

  async function fetchContent() {
    try {
      setError(null)
      const [postsResult, eventsResult] = await Promise.all([
        supabase.from('posts').select('*').order('created_at', { ascending: false }),
        supabase.from('events').select('*').order('created_at', { ascending: false })
      ])

      if (postsResult.error) throw postsResult.error
      if (eventsResult.error) throw eventsResult.error

      setPosts(postsResult.data || [])
      setEvents(eventsResult.data || [])
    } catch (error) {
      console.error('Error fetching content:', error)
      setError(error instanceof Error ? error.message : 'Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  async function deletePost(id: string) {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return

    setActionLoading(`delete-post-${id}`)
    try {
      const { error } = await supabase.from('posts').delete().eq('id', id)
      if (error) throw error
      
      // Update local state immediately for better UX
      setPosts(posts.filter(post => post.id !== id))
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setActionLoading(null)
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return

    setActionLoading(`delete-event-${id}`)
    try {
      const { error } = await supabase.from('events').delete().eq('id', id)
      if (error) throw error
      
      // Update local state immediately for better UX
      setEvents(events.filter(event => event.id !== id))
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Failed to delete event: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setActionLoading(null)
    }
  }

  async function togglePostDraft(post: Post) {
    setActionLoading(`toggle-post-${post.id}`)
    try {
      const { error } = await supabase
        .from('posts')
        .update({ is_draft: !post.is_draft })
        .eq('id', post.id)
      
      if (error) throw error
      
      // Update local state immediately
      setPosts(posts.map(p => 
        p.id === post.id ? { ...p, is_draft: !p.is_draft } : p
      ))
    } catch (error) {
      console.error('Error updating post:', error)
      alert('Failed to update post: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setActionLoading(null)
    }
  }

  async function toggleEventDraft(event: Event) {
    setActionLoading(`toggle-event-${event.id}`)
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_draft: !event.is_draft })
        .eq('id', event.id)
      
      if (error) throw error
      
      // Update local state immediately
      setEvents(events.map(e => 
        e.id === event.id ? { ...e, is_draft: !e.is_draft } : e
      ))
    } catch (error) {
      console.error('Error updating event:', error)
      alert('Failed to update event: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'Invalid date'
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
            onClick={fetchContent}
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
            Content Management
          </h1>
          <div className="flex gap-3">
            <Link
              href="/admin/posts/new"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              New Post
            </Link>
            <Link
              href="/admin/events/new"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              New Event
            </Link>
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'posts'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === 'events'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Events ({events.length})
          </button>
        </div>

        {/* Content List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {activeTab === 'posts' ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {posts.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No posts yet</p>
                  <Link
                    href="/admin/posts/new"
                    className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold"
                  >
                    Create Your First Post
                  </Link>
                </div>
              ) : (
                posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
                          {post.title}
                          {post.is_draft && (
                            <span className="ml-2 text-sm font-normal text-amber-600 dark:text-amber-400">(Draft)</span>
                          )}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span>{formatDate(post.created_at)}</span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {post.click_count} views
                          </span>
                          {post.tag && (
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-md text-xs">
                              {post.tag}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                          href={`/posts/${post.id}`}
                          target="_blank"
                          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                          title="View post"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => togglePostDraft(post)}
                          disabled={actionLoading === `toggle-post-${post.id}`}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors disabled:opacity-50"
                        >
                          {actionLoading === `toggle-post-${post.id}` ? '...' : (post.is_draft ? 'Publish' : 'Draft')}
                        </button>
                        <button
                          onClick={() => deletePost(post.id)}
                          disabled={actionLoading === `delete-post-${post.id}`}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors disabled:opacity-50"
                        >
                          {actionLoading === `delete-post-${post.id}` ? '...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {events.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">No events yet</p>
                  <Link
                    href="/admin/events/new"
                    className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold"
                  >
                    Create Your First Event
                  </Link>
                </div>
              ) : (
                events.map((event) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
                          {event.title}
                          {event.is_draft && (
                            <span className="ml-2 text-sm font-normal text-amber-600 dark:text-amber-400">(Draft)</span>
                          )}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(event.start_date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            {event.click_count} views
                          </span>
                          {event.tag && (
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-md text-xs">
                              {event.tag}
                            </span>
                          )}
                          {new Date(event.start_date) > new Date() && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-md text-xs">
                              Upcoming
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                          href={`/events/${event.id}`}
                          target="_blank"
                          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                          title="View event"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                        <Link
                          href={`/admin/events/${event.id}/edit`}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => toggleEventDraft(event)}
                          disabled={actionLoading === `toggle-event-${event.id}`}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors disabled:opacity-50"
                        >
                          {actionLoading === `toggle-event-${event.id}` ? '...' : (event.is_draft ? 'Publish' : 'Draft')}
                        </button>
                        <button
                          onClick={() => deleteEvent(event.id)}
                          disabled={actionLoading === `delete-event-${event.id}`}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors disabled:opacity-50"
                        >
                          {actionLoading === `delete-event-${event.id}` ? '...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}