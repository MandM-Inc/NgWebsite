'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { Event } from '@/types/database'
import { SearchIcon, TagIcon, CalendarIcon, ClockIcon } from '@/components/Icons'

export const dynamic = 'force-dynamic'

export default function EventsPage() {
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

    if (query.startsWith('@')) {
      const parts = query.split(' ')
      const attribute = parts[0].substring(1)
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

      if (error) throw error
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
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white">
            Events
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Join our workshops, seminars, and hands-on activities designed to deepen your understanding of neuroscience and psychology
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
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/70">
                {searchQuery ? 'No events found matching your search.' : 'No events available yet.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => {
                const eventStatus = getEventStatus(event.start_date, event.end_date)
                return (
                  <article key={event.id} className="card group hover:border-purple-900/40 transition-colors relative">
                    {/* Status badge */}
                    <div className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-none text-xs font-medium ${
                      eventStatus.status === 'ongoing'
                        ? 'bg-purple-800 text-white'
                        : eventStatus.status === 'today' || eventStatus.status === 'tomorrow'
                        ? 'bg-purple-900/30 text-white/90'
                        : eventStatus.status === 'upcoming'
                        ? 'bg-purple-900/30 text-white/80'
                        : 'bg-black text-white/60'
                    }`}>
                      {eventStatus.label}
                    </div>
                    
                    <div className="h-1 bg-purple-800 rounded-t-lg" />
                    
                    <Link href={`/events/${event.id}`} className="block p-6">
                      {event.tag && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 text-xs font-medium text-white/80 bg-purple-900/30 rounded-none">
                          <TagIcon className="w-3 h-3" />
                          <span>{event.tag}</span>
                        </div>
                      )}
                      
                      <h2 className="text-2xl font-bold mb-3 text-white group-hover:text-white/90 transition-colors line-clamp-2">
                        {event.title}
                      </h2>
                      
                      <p className="text-white/70 mb-5 line-clamp-3 leading-relaxed">
                        {truncateContent(event.content, 180)}
                      </p>
                      
                      <div className="space-y-3 mb-5">
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <CalendarIcon className="w-4 h-4" />
                          <span className="font-medium">{formatDate(event.start_date)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <ClockIcon className="w-4 h-4" />
                          <span>{formatTime(event.start_date)} • {formatDuration(event.duration)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-purple-700/40">
                        <div className="flex items-center gap-1.5 text-sm text-white/60">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>{event.click_count} views</span>
                        </div>
                        
                        <div className="text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </div>
                    </Link>
                  </article>
                )
              })}
            </div>
          )
        )}
      </div>
    </main>
  )
}
