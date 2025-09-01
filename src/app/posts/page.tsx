'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { containerStagger, itemFade, viewportOnce } from '@/lib/motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Post } from '@/types/database'
import { SearchIcon, TagIcon, CalendarIcon } from '@/components/Icons'

export default function PostsPage() {
  useReducedMotion()
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchPosts()
      } catch (error) {
        console.error('Error in useEffect:', error)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase()
    
    if (!query) {
      setFilteredPosts(posts)
      return
    }

    // Check if query has @ attribute
    if (query.startsWith('@')) {
      const parts = query.split(' ')
      const attribute = parts[0].substring(1) // Remove @
      const searchTerm = parts.slice(1).join(' ')
      
      if (!searchTerm) {
        setFilteredPosts(posts)
        return
      }

      const filtered = posts.filter(post => {
        switch (attribute) {
          case 'tag':
          case 'tags':
            return post.tag && post.tag.toLowerCase().includes(searchTerm)
          case 'content':
            return post.content.toLowerCase().includes(searchTerm)
          default:
            return false
        }
      })
      setFilteredPosts(filtered)
    } else {
      // Default: search by title only
      const filtered = posts.filter(post => 
        post.title.toLowerCase().includes(query)
      )
      setFilteredPosts(filtered)
    }
  }, [searchQuery, posts])

  async function fetchPosts() {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('is_draft', false)
        .order('published_date', { ascending: false })

      if (error) {
        throw error
      }
      setPosts(data || [])
      setFilteredPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
      if (error && typeof error === 'object' && 'code' in error && error.code === '42P01') {
        setError('Database tables not found. Please run the database setup script in Supabase.')
      } else {
        setError('Failed to load posts. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    // Remove markdown formatting for preview
    const plainText = content
      .replace(/#{1,6}\s/g, '') // Remove headers
      .replace(/\*\*|__|\*|_/g, '') // Remove bold/italic
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
      .replace(/`{1,3}[^`]*`{1,3}/g, '') // Remove code
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim()
    
    if (plainText.length <= maxLength) return plainText
    return plainText.substring(0, maxLength).trim() + '...'
  }
  
  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200
    const words = content.split(/\s+/).length
    const minutes = Math.ceil(words / wordsPerMinute)
    return minutes
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
              Posts
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Explore our collection of articles on neuroscience, psychology, teen health, and cutting-edge research
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or use @tag, @content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400"
              />
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
              <p className="text-red-700 dark:text-red-400">{error}</p>
              {error.includes('Database tables not found') && (
                <div className="mt-4 text-sm text-red-600 dark:text-red-300">
                  <p className="font-semibold mb-2">To set up the database:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Go to your Supabase project dashboard</li>
                    <li>Navigate to the SQL Editor</li>
                    <li>Copy and run the contents of <code className="bg-red-100 dark:bg-red-900/50 px-1 rounded">supabase/schema-clean.sql</code></li>
                    <li>Optionally run <code className="bg-red-100 dark:bg-red-900/50 px-1 rounded">supabase/demo-content.sql</code> for demo data</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Posts Grid */}
          {!error && (
            loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  {searchQuery ? 'No posts found matching your search.' : 'No posts available yet.'}
                </p>
              </div>
            ) : (
              <motion.div
                variants={containerStagger(0.06, 0.1)}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
              >
                {filteredPosts.map((post) => (
                  <motion.article
                    key={post.id}
                    variants={itemFade(18, 0.45)}
                    className="post-card group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md overflow-hidden border border-gray-200 dark:border-gray-700"
                  >
                    {/* Gradient accent bar */}
                    <div className="h-1 bg-gradient-to-r from-gray-500 to-gray-700 dark:from-gray-400 dark:to-gray-600" />
                    
                    <Link href={`/posts/${post.id}`} className="block p-8">
                      {/* Tag */}
                      {post.tag && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-900/30 rounded-full">
                          <TagIcon className="w-3 h-3" />
                          <span>{post.tag}</span>
                        </div>
                      )}
                      
                      {/* Title */}
                      <h2 className="text-2xl font-serif font-bold mb-3 text-gray-900 dark:text-white group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                      
                      {/* Content preview */}
                      <p className="text-gray-600 dark:text-gray-300 mb-5 line-clamp-3 leading-relaxed">
                        {truncateContent(post.content, 180)}
                      </p>
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{formatDate(post.published_date)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{calculateReadingTime(post.content)} min read</span>
                          </div>
                        </div>
                        
                        {/* Read more arrow */}
                        <div className="text-gray-600 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </motion.div>
            )
          )}
        </motion.div>
      </div>
    </main>
  )
}