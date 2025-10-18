'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkBreaks from 'remark-breaks'
import rehypeKatex from 'rehype-katex'
import { supabase } from '@/lib/supabase'
import { Post, Comment } from '@/types/database'
import { CalendarIcon, TagIcon } from '@/components/Icons'
import 'katex/dist/katex.min.css'

export default function PostDetailPage() {
  const { id } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState({ name: '', content: '' })
  const [submitting, setSubmitting] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        try {
          await Promise.all([
            fetchPost(),
            fetchComments(),
            incrementClickCount()
          ])
        } catch (error) {
          console.error('Error loading post data:', error)
        }
      }
    }
    loadData()
  }, [id])
  
  // Reading progress indicator
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return
      
      const element = contentRef.current
      const totalHeight = element.scrollHeight - window.innerHeight
      const scrollPosition = window.scrollY - element.offsetTop
      const progress = Math.min(Math.max((scrollPosition / totalHeight) * 100, 0), 100)
      
      setReadingProgress(progress)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [post])

  async function fetchPost() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .eq('is_draft', false)
        .single()

      if (error) throw error
      setPost(data)
    } catch (error) {
      console.error('Error fetching post:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchComments() {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  async function incrementClickCount() {
    try {
      const { error } = await supabase.rpc('increment_click_count', {
        table_name: 'posts',
        item_id: id
      })
      
      if (error) {
        console.error('Error incrementing click count:', error)
      }
    } catch (error) {
      console.error('Error incrementing click count:', error)
    }
  }

  async function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.name.trim() || !newComment.content.trim()) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: id,
          author_name: newComment.name,
          content: newComment.content
        })

      if (error) throw error

      setNewComment({ name: '', content: '' })
      fetchComments()
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.split(/\s+/).length
    const minutes = Math.ceil(words / wordsPerMinute)
    return minutes
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-none h-12 w-12 border-b-2 border-purple-700"></div>
      </main>
    )
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <p className="text-white/60 dark:text-white/70">Post not found.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      {/* Reading progress bar */}
      <div className="reading-progress" style={{ width: `${readingProgress}%` }} />
      
      <article ref={contentRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Post Header */}
          <header className="mb-12 text-center">
            <div className="mb-6">
              {post.tag && (
                <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white/80 dark:text-white/80 bg-purple-900/10 dark:bg-black/30 rounded-none">
                  <TagIcon className="w-4 h-4" />
                  {post.tag}
                </span>
              )}
            </div>
            
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-8 text-white dark:text-white leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/60 dark:text-white/70 pb-8 border-b border-purple-700/40 dark:border-purple-700/40">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                <span>{formatDate(post.published_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{calculateReadingTime(post.content)} min read</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{post.click_count} views</span>
              </div>
            </div>
          </header>

          {/* Post Content */}
          <div className="bg-white dark:bg-black rounded-none shadow-sm p-8 md:p-12 mb-12">
            <div className="markdown-content prose prose-lg dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkMath, remarkBreaks]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  img: ({ src, alt }) => (
                    <img
                      src={src}
                      alt={alt}
                      className="rounded-none shadow-md my-6 max-w-full h-auto"
                    />
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/80 dark:text-white/80 hover:underline"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Comments Section */}
          <section className="bg-white dark:bg-black rounded-none shadow-sm p-8">
            <h2 className="text-3xl font-serif font-bold mb-8 text-white dark:text-white flex items-center gap-3">
              <svg className="w-8 h-8 text-white/60 dark:text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Comments ({comments.length})
            </h2>

            {/* Comment Form */}
            <div className="bg-white dark:bg-black/50 rounded-none p-6 mb-10">
              <h3 className="text-lg font-semibold mb-4 text-white dark:text-white">Leave a Comment</h3>
              <form onSubmit={handleCommentSubmit}>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={newComment.name}
                    onChange={(e) => setNewComment({ ...newComment, name: e.target.value })}
                    className="px-4 py-3 bg-white dark:bg-black border border-purple-700/40 dark:border-purple-700/40 rounded-none focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent transition-all btn-animate"
                    required
                  />
                  <div className="flex items-center text-sm text-white/60 dark:text-white/70">
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Your comment will be visible after moderation
                  </div>
                </div>
                <div className="mb-4">
                  <textarea
                    placeholder="Share your thoughts..."
                    value={newComment.content}
                    onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-white dark:bg-black border border-purple-700/40 dark:border-purple-700/40 rounded-none focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent resize-none transition-all"
                    required
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-purple-900/40 hover:bg-black text-white rounded-none font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed btn-animate"
                  >
                    {submitting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      'Post Comment'
                    )}
                  </button>
                  <span className="text-sm text-white/60 dark:text-white/70">
                    {newComment.content.length}/500 characters
                  </span>
                </div>
              </form>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-white/80 dark:text-white/60 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-white/60 dark:text-white/70 text-lg">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                </div>
              ) : (
                comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-black/50 rounded-none p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar placeholder */}
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-none flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {comment.author_name.charAt(0).toUpperCase()}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-white dark:text-white">
                            {comment.author_name}
                          </h4>
                          <time className="text-sm text-white/60 dark:text-white/70">
                            {formatDate(comment.created_at)}
                          </time>
                        </div>
                        <p className="text-white/80 dark:text-white/80 leading-relaxed">
                          {comment.content}
                        </p>
                        
                        {comment.is_approved === false && (
                          <div className="mt-3 flex items-center text-sm text-yellow-600 dark:text-yellow-400">
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Pending moderation
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>
        </motion.div>
      </article>
    </main>
  )
}