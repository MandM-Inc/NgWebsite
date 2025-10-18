'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Post } from '@/types/database'
import { SearchIcon, TagIcon, CalendarIcon } from '@/components/Icons'

export default function PostsPage() {
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

    if (query.startsWith('@')) {
      const parts = query.split(' ')
      const attribute = parts[0].substring(1)
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

      if (error) throw error
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
    const plainText = content
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*|__|\*|_/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/`{1,3}[^`]*`{1,3}/g, '')
      .replace(/\n+/g, ' ')
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
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">
            Posts
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Explore our collection of articles on neuroscience, psychology, teen health, and cutting-edge research
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70" />
            <input
              type="text"
              placeholder="Search by title or use @tag, @content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-black border border-purple-700/40 rounded-none text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-800"
            />
          </div>
        </div>

        {error && (
          <div className="card border-red-900 p-4 mb-8">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {!error && (
          loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-none h-12 w-12 border-b-2 border-purple-800"></div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/70">
                {searchQuery ? 'No posts found matching your search.' : 'No posts available yet.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post) => (
                <article key={post.id} className="card group hover:border-purple-900/40 transition-colors">
                  <div className="h-1 bg-purple-800 rounded-t-lg" />
                  
                  <Link href={`/posts/${post.id}`} className="block p-6">
                    {post.tag && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 text-xs font-medium text-white/80 bg-purple-900/30 rounded-none">
                        <TagIcon className="w-3 h-3" />
                        <span>{post.tag}</span>
                      </div>
                    )}
                    
                    <h2 className="text-2xl font-bold mb-3 text-white group-hover:text-white/90 transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    
                    <p className="text-white/70 mb-5 line-clamp-3 leading-relaxed">
                      {truncateContent(post.content, 180)}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm pt-4 border-t border-purple-700/40">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-white/60">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{formatDate(post.published_date)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-white/60">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{calculateReadingTime(post.content)} min</span>
                        </div>
                      </div>
                      
                      <div className="text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )
        )}
      </div>
    </main>
  )
}
