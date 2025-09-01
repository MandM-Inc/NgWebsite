'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { containerStagger, itemFade, viewportOnce } from '@/lib/motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Event } from '@/types/database'
import { SearchIcon, TagIcon, CalendarIcon, ClockIcon } from '@/components/Icons'

export const dynamic = 'force-dynamic'

export default function EventsPage() {
  useReducedMotion()
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchEvents()
      } catch (error) {
        console.error('Error in useEffect:', error)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase()
    
    if (!query) {
      setFilteredEvents(events)
      return
    }

    // Check if query has @ attribute
    if (query.startsWith('@')) {
      const parts = query.split(' ')
      const attribute = parts[0].substring(1) // Remove @
      const searchTerm = parts.slice(1).join(' ')
      
      if (!searchTerm) {
        setFilteredEvents(events)
        return
      }

      const filtered = events.filter(event => {
        switch (attribute) {
          case 'tag':
          case 'tags':
            return event.tag && event.tag.toLowerCase().includes(searchTerm)
          case 'content':
            return event.content.toLowerCase().includes(searchTerm)
          default:
            return false
        }
      })
      setFilteredEvents(filtered)
    } else {
      // Default: search by title only
      const filtered = events.filter(event => 
        event.title.toLowerCase().includes(query)
      )
      setFilteredEvents(filtered)
    }
  }, [searchQuery, events])

  async function fetchEvents() {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_draft', false)
        .order('start_date', { ascending: true })

      if (error) {
        throw error
      }
      setEvents(data || [])
      setFilteredEvents(data || [])
    } catch (error) {
      console.error('Error fetching events:', error)
      if (error && typeof error === 'object' && 'code' in error && error.code === '42P01') {
        setError('Database tables not found. Please run the database setup script in Supabase.')
      } else {
        setError('Failed to load events. Please try again later.')
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDuration = (duration: string) => {
    const match = duration.match(/(\d+):(\d+):(\d+)/)
    if (!match) return duration
    
    const hours = parseInt(match[1])
    const minutes = parseInt(match[2])
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`
    } else {
      return `${minutes} minutes`
    }
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
  
  const getEventStatus = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (now < start) {
      const daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntil === 0) return { status: 'today', label: 'Today' }
      if (daysUntil === 1) return { status: 'tomorrow', label: 'Tomorrow' }
      if (daysUntil <= 7) return { status: 'upcoming', label: `In ${daysUntil} days` }
      return { status: 'upcoming', label: 'Upcoming' }
    } else if (now >= start && now <= end) {
      return { status: 'ongoing', label: 'Happening Now' }
    } else {
      return { status: 'past', label: 'Past Event' }
    }
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-4 text-gray-100">
              Events
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Join our workshops, seminars, and hands-on activities designed to deepen your understanding of neuroscience and psychology
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
                className="w-full pl-12 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 bg-gray-900 border border-gray-800 text-gray-100 placeholder:text-gray-500"
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

          {/* Events Grid */}
          {!error && (
            loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">
                {searchQuery ? 'No events found matching your search.' : 'No events available yet.'}
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
              {filteredEvents.map((event) => {
                const eventStatus = getEventStatus(event.start_date, event.end_date)
                return (
                  <motion.article
                    key={event.id}
                    variants={itemFade(18, 0.45)}
                    className="post-card group glass-panel rounded-xl overflow-hidden relative"
                  >
                    {/* Status ribbon (neutral) */}
                    <div className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-medium border ${
                      eventStatus.status === 'ongoing'
                        ? 'bg-gray-800 text-gray-100 border-gray-700'
                        : eventStatus.status === 'today' || eventStatus.status === 'tomorrow'
                        ? 'bg-gray-900 text-gray-300 border-gray-800'
                        : eventStatus.status === 'upcoming'
                        ? 'bg-gray-900 text-gray-300 border-gray-800'
                        : 'bg-gray-900 text-gray-500 border-gray-800'
                    }`}>
                      {eventStatus.label}
                    </div>
                    
                    <Link href={`/events/${event.id}`} className="block p-8">
                      {/* Tag */}
                      {event.tag && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 text-xs font-medium text-gray-300 bg-gray-800 rounded-full">
                          <TagIcon className="w-3 h-3" />
                          <span>{event.tag}</span>
                        </div>
                      )}
                      
                      {/* Title */}
                      <h2 className="text-2xl font-serif font-bold mb-3 text-gray-100 group-hover:text-white transition-colors line-clamp-2">
                        {event.title}
                      </h2>
                      
                      {/* Content preview */}
                      <p className="text-gray-300 mb-5 line-clamp-3 leading-relaxed">
                        {truncateContent(event.content, 180)}
                      </p>
                      
                      {/* Event details */}
                      <div className="space-y-3 mb-5">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <CalendarIcon className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{formatDate(event.start_date)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span>{formatTime(event.start_date)} • {formatDuration(event.duration)}</span>
                        </div>
                      </div>
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>{event.click_count} views</span>
                          </div>
                        </div>
                        
                        {/* Register/Learn more arrow */}
                        <div className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                )
              })}
            </motion.div>
            )
          )}
        </motion.div>
      </div>
    </main>
  )
}