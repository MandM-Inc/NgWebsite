'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
    if (!confirm('Are you sure you want to delete this post?')) return

    setActionLoading(`delete-post-${id}`)
    try {
      const { error } = await supabase.from('posts').delete().eq('id', id)
      if (error) throw error
      setPosts(posts.filter(post => post.id !== id))
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post')
    } finally {
      setActionLoading(null)
    }
  }

  async function deleteEvent(id: string) {
    if (!confirm('Are you sure you want to delete this event?')) return

    setActionLoading(`delete-event-${id}`)
    try {
      const { error } = await supabase.from('events').delete().eq('id', id)
      if (error) throw error
      setEvents(events.filter(event => event.id !== id))
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('Failed to delete event')
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
      setPosts(posts.map(p => p.id === post.id ? { ...p, is_draft: !p.is_draft } : p))
    } catch (error) {
      console.error('Error updating post:', error)
      alert('Failed to update post')
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
      setEvents(events.map(e => e.id === event.id ? { ...e, is_draft: !e.is_draft } : e))
    } catch (error) {
      console.error('Error updating event:', error)
      alert('Failed to update event')
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
          <button onClick={fetchContent} className="px-4 py-2 bg-purple-800 hover:bg-purple-700 text-white rounded-none btn-animate">
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
          <h1 className="text-3xl font-bold text-white">Content Management</h1>
          <div className="flex gap-3">
            <Link href="/admin/posts/new" className="px-4 py-2 bg-purple-800 hover:bg-purple-700 text-white rounded-none text-sm font-semibold transition-colors btn-animate">
              New Post
            </Link>
            <Link href="/admin/events/new" className="px-4 py-2 bg-purple-800 hover:bg-purple-700 text-white rounded-none text-sm font-semibold transition-colors btn-animate">
              New Event
            </Link>
            <Link href="/admin/dashboard" className="px-4 py-2 bg-purple-900/30 hover:bg-purple-900/40 text-white rounded-none text-sm font-semibold transition-colors btn-animate">
              Dashboard
            </Link>
          </div>
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2 rounded-none font-semibold transition-colors ${
              activeTab === 'posts' ? 'bg-purple-800 text-white' : 'bg-purple-900/30 text-white/80 hover:bg-purple-900/40'
            }`}
          >
            Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-none font-semibold transition-colors ${
              activeTab === 'events' ? 'bg-purple-800 text-white' : 'bg-purple-900/30 text-white/80 hover:bg-purple-900/40'
            }`}
          >
            Events ({events.length})
          </button>
        </div>

        <div className="card overflow-hidden">
          {activeTab === 'posts' ? (
            <div className="divide-y divide-purple-700/40">
              {posts.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-white/70 mb-4">No posts yet</p>
                  <Link href="/admin/posts/new" className="inline-block px-4 py-2 bg-purple-800 hover:bg-purple-700 text-white rounded-none text-sm font-semibold">
                    Create Your First Post
                  </Link>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="p-6 hover:bg-purple-900/30/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-1 truncate">
                          {post.title}
                          {post.is_draft && <span className="ml-2 text-sm font-normal text-amber-400">(Draft)</span>}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                          <span>{formatDate(post.created_at)}</span>
                          <span>{post.click_count} views</span>
                          {post.tag && <span className="px-2 py-1 bg-purple-900/30 text-purple-600 rounded-none text-xs btn-animate">{post.tag}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/posts/${post.id}/edit`} className="px-3 py-1 bg-purple-800 hover:bg-purple-700 text-white text-sm btn-animate">
                          Edit
                        </Link>
                        <button onClick={() => togglePostDraft(post)} disabled={actionLoading === `toggle-post-${post.id}`} className="px-3 py-1 bg-purple-900/40 hover:bg-purple-900/40 text-white text-sm disabled:opacity-50 btn-animate">
                          {actionLoading === `toggle-post-${post.id}` ? '...' : (post.is_draft ? 'Publish' : 'Draft')}
                        </button>
                        <button onClick={() => deletePost(post.id)} disabled={actionLoading === `delete-post-${post.id}`} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm disabled:opacity-50 btn-animate">
                          {actionLoading === `delete-post-${post.id}` ? '...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="divide-y divide-purple-700/40">
              {events.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-white/70 mb-4">No events yet</p>
                  <Link href="/admin/events/new" className="inline-block px-4 py-2 bg-purple-800 hover:bg-purple-700 text-white rounded-none text-sm font-semibold">
                    Create Your First Event
                  </Link>
                </div>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="p-6 hover:bg-purple-900/30/50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-1 truncate">
                          {event.title}
                          {event.is_draft && <span className="ml-2 text-sm font-normal text-amber-400">(Draft)</span>}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                          <span>{formatDate(event.start_date)}</span>
                          <span>{event.click_count} views</span>
                          {event.tag && <span className="px-2 py-1 bg-purple-900/30 text-purple-600 rounded-none text-xs btn-animate">{event.tag}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/events/${event.id}/edit`} className="px-3 py-1 bg-purple-800 hover:bg-purple-700 text-white text-sm btn-animate">
                          Edit
                        </Link>
                        <button onClick={() => toggleEventDraft(event)} disabled={actionLoading === `toggle-event-${event.id}`} className="px-3 py-1 bg-purple-900/40 hover:bg-purple-900/40 text-white text-sm disabled:opacity-50 btn-animate">
                          {actionLoading === `toggle-event-${event.id}` ? '...' : (event.is_draft ? 'Publish' : 'Draft')}
                        </button>
                        <button onClick={() => deleteEvent(event.id)} disabled={actionLoading === `delete-event-${event.id}`} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm disabled:opacity-50 btn-animate">
                          {actionLoading === `delete-event-${event.id}` ? '...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
