'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Post, Event, Comment } from '@/types/database'

interface Analytics {
  totalPosts: number
  totalEvents: number
  totalComments: number
  totalViews: number
  recentComments: Comment[]
  popularPosts: Post[]
  upcomingEvents: Event[]
}

export const dynamic = 'force-dynamic'

export default function AdminDashboard() {
  const { isAdmin, logout } = useAuth()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<Analytics>({
    totalPosts: 0,
    totalEvents: 0,
    totalComments: 0,
    totalViews: 0,
    recentComments: [],
    popularPosts: [],
    upcomingEvents: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdmin) {
      router.push('/admin')
      return
    }
    fetchAnalytics()
  }, [isAdmin, router])

  async function fetchAnalytics() {
    try {
      const [postsResult, eventsResult, commentsResult] = await Promise.all([
        supabase.from('posts').select('id, click_count', { count: 'exact' }),
        supabase.from('events').select('id, click_count', { count: 'exact' }),
        supabase.from('comments').select('id', { count: 'exact' })
      ])

      const totalPostViews = postsResult.data?.reduce((sum, post) => sum + post.click_count, 0) || 0
      const totalEventViews = eventsResult.data?.reduce((sum, event) => sum + event.click_count, 0) || 0

      const { data: recentComments } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: popularPosts } = await supabase
        .from('posts')
        .select('*')
        .order('click_count', { ascending: false })
        .limit(5)

      const { data: upcomingEvents } = await supabase
        .from('events')
        .select('*')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(5)

      setAnalytics({
        totalPosts: postsResult.count || 0,
        totalEvents: eventsResult.count || 0,
        totalComments: commentsResult.count || 0,
        totalViews: totalPostViews + totalEventViews,
        recentComments: recentComments || [],
        popularPosts: popularPosts || [],
        upcomingEvents: upcomingEvents || []
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  async function deleteComment(commentId: string) {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error
      fetchAnalytics()
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-none h-16 w-16 border-t-4 border-b-4 border-purple-700"></div>
          <p className="text-white/70 text-lg">Loading dashboard...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-purple-950/5 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-white/60 text-lg">
              Welcome back! Here's what's happening with your content.
            </p>
          </div>
          <button
            onClick={logout}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-none font-semibold transition-all shadow-lg shadow-red-500/20 hover:shadow-xl hover:shadow-red-500/30 flex items-center gap-2 btn-animate"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

        {/* Analytics Overview - Enhanced Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="card p-6 hover:border-purple-600/60 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-700/20 rounded-none group-hover:bg-purple-700/30 transition-colors">
                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-green-400 text-sm font-semibold flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                Active
              </span>
            </div>
            <h3 className="text-white/60 text-sm font-medium mb-1">Total Posts</h3>
            <p className="text-4xl font-bold text-white mb-1">{analytics.totalPosts}</p>
            <p className="text-white/40 text-xs">Content pieces published</p>
          </div>

          <div className="card p-6 hover:border-purple-600/60 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-700/20 rounded-none group-hover:bg-purple-700/30 transition-colors">
                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-blue-400 text-sm font-semibold flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Scheduled
              </span>
            </div>
            <h3 className="text-white/60 text-sm font-medium mb-1">Total Events</h3>
            <p className="text-4xl font-bold text-white mb-1">{analytics.totalEvents}</p>
            <p className="text-white/40 text-xs">Events organized</p>
          </div>

          <div className="card p-6 hover:border-purple-600/60 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-700/20 rounded-none group-hover:bg-purple-700/30 transition-colors">
                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-purple-600 text-sm font-semibold flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                New
              </span>
            </div>
            <h3 className="text-white/60 text-sm font-medium mb-1">Comments</h3>
            <p className="text-4xl font-bold text-white mb-1">{analytics.totalComments}</p>
            <p className="text-white/40 text-xs">Community engagement</p>
          </div>

          <div className="card p-6 hover:border-purple-600/60 transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-700/20 rounded-none group-hover:bg-purple-700/30 transition-colors">
                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <span className="text-yellow-400 text-sm font-semibold flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Growing
              </span>
            </div>
            <h3 className="text-white/60 text-sm font-medium mb-1">Total Views</h3>
            <p className="text-4xl font-bold text-white mb-1">{analytics.totalViews.toLocaleString()}</p>
            <p className="text-white/40 text-xs">Content impressions</p>
          </div>
        </div>

        {/* Quick Actions - Enhanced */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-1 h-8 bg-gradient-to-b from-purple-700 to-purple-800 rounded-none"></span>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/posts/new"
              className="card p-6 hover:border-purple-600/60 transition-all group hover:scale-105 transform"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-4 bg-gradient-to-br from-purple-700/20 to-purple-800/20 rounded-none group-hover:from-purple-700/30 group-hover:to-purple-800/30 transition-colors">
                  <svg className="w-10 h-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-1">New Post</h3>
                  <p className="text-white/50 text-sm">Create article</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/events/new"
              className="card p-6 hover:border-purple-600/60 transition-all group hover:scale-105 transform"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-4 bg-gradient-to-br from-purple-700/20 to-purple-800/20 rounded-none group-hover:from-purple-700/30 group-hover:to-purple-800/30 transition-colors">
                  <svg className="w-10 h-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-1">New Event</h3>
                  <p className="text-white/50 text-sm">Schedule activity</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/content"
              className="card p-6 hover:border-purple-600/60 transition-all group hover:scale-105 transform"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-4 bg-gradient-to-br from-purple-700/20 to-purple-800/20 rounded-none group-hover:from-purple-700/30 group-hover:to-purple-800/30 transition-colors">
                  <svg className="w-10 h-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-1">Manage Content</h3>
                  <p className="text-white/50 text-sm">Edit & organize</p>
                </div>
              </div>
            </Link>

            <Link
              href="/admin/comments"
              className="card p-6 hover:border-purple-600/60 transition-all group hover:scale-105 transform"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-4 bg-gradient-to-br from-purple-700/20 to-purple-800/20 rounded-none group-hover:from-purple-700/30 group-hover:to-purple-800/30 transition-colors">
                  <svg className="w-10 h-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-1">Comments</h3>
                  <p className="text-white/50 text-sm">Moderate discussions</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Settings & Logout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <Link
            href="/admin/settings"
            className="card p-5 hover:border-purple-600/60 transition-all flex items-center gap-4 group"
          >
            <div className="p-3 bg-purple-700/20 rounded-none group-hover:bg-purple-700/30 transition-colors">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white text-lg">Settings & Security</h3>
              <p className="text-white/50 text-sm">Manage your preferences</p>
            </div>
            <svg className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/"
            className="card p-5 hover:border-purple-600/60 transition-all flex items-center gap-4 group"
          >
            <div className="p-3 bg-purple-700/20 rounded-none group-hover:bg-purple-700/30 transition-colors">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white text-lg">View Public Site</h3>
              <p className="text-white/50 text-sm">See your live website</p>
            </div>
            <svg className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </div>

        {/* Content Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Comments */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="w-1 h-6 bg-gradient-to-b from-purple-700 to-purple-800 rounded-none"></span>
                Recent Comments
              </h2>
              <Link
                href="/admin/comments"
                className="text-sm text-purple-600 hover:text-purple-500 font-medium flex items-center gap-1 transition-colors"
              >
                View All
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="space-y-4">
              {analytics.recentComments.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-white/20 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-white/50">No comments yet</p>
                </div>
              ) : (
                analytics.recentComments.map((comment) => (
                  <div key={comment.id} className="border-2 border-purple-700/20 rounded-none p-4 hover:border-purple-700/40 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-800 rounded-none flex items-center justify-center text-white font-bold text-sm">
                          {comment.author_name.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-semibold text-white">{comment.author_name}</p>
                      </div>
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="text-sm text-white/70 line-clamp-2 pl-10">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Popular Posts */}
          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-3">
              <span className="w-1 h-6 bg-gradient-to-b from-purple-700 to-purple-800 rounded-none"></span>
              Popular Posts
            </h2>
            <div className="space-y-3">
              {analytics.popularPosts.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-white/20 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-white/50">No posts yet</p>
                </div>
              ) : (
                analytics.popularPosts.map((post, index) => (
                  <div key={post.id} className="flex items-center gap-4 border-2 border-purple-700/20 rounded-none p-4 hover:border-purple-700/40 transition-colors group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-none bg-purple-700/20 text-purple-600 font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-white font-medium hover:text-purple-600 transition-colors line-clamp-1 block"
                      >
                        {post.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <svg className="w-4 h-4 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-sm text-white/50">{post.click_count} views</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
