'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import MarkdownEditor from '@/components/MarkdownEditor'
import ImageUpload from '@/components/ImageUpload'

export const dynamic = 'force-dynamic'

export default function EditEventPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string

  const [event, setEvent] = useState({
    title: '',
    content: '',
    tag: '',
    start_date: '',
    duration: '01:00:00',
    is_draft: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin) {
      router.push('/admin')
      return
    }
    if (eventId) {
      fetchEvent()
    }
  }, [isAdmin, router, eventId])

  async function fetchEvent() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (error) throw error
      if (!data) throw new Error('Event not found')

      // Format the start_date for datetime-local input
      const startDate = new Date(data.start_date)
      const formattedDate = startDate.toISOString().slice(0, 16)

      setEvent({
        title: data.title,
        content: data.content,
        tag: data.tag || '',
        start_date: formattedDate,
        duration: data.duration,
        is_draft: data.is_draft
      })
    } catch (error) {
      console.error('Error fetching event:', error)
      setError(error instanceof Error ? error.message : 'Failed to load event')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(isDraft: boolean) {
    if (!event.title.trim() || !event.content.trim() || !event.start_date) {
      alert('Please fill in title, content, and start date')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('events')
        .update({
          title: event.title,
          content: event.content,
          tag: event.tag || null,
          start_date: new Date(event.start_date).toISOString(),
          duration: event.duration,
          is_draft: isDraft,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)

      if (error) throw error

      router.push('/admin/content')
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Error saving event: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  function handleImageInserted(markdownText: string) {
    setEvent({ ...event, content: event.content + '\n\n' + markdownText + '\n\n' })
  }

  const parseDuration = (duration: string) => {
    const match = duration.match(/(\d+):(\d+):(\d+)/)
    if (!match) return { hours: 1, minutes: 0 }
    return {
      hours: parseInt(match[1]),
      minutes: parseInt(match[2])
    }
  }

  const formatDuration = (hours: number, minutes: number) => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`
  }

  const { hours, minutes } = parseDuration(event.duration)

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
          <button
            onClick={() => router.push('/admin/content')}
            className="px-4 py-2 bg-purple-800 hover:bg-purple-700 text-white rounded-none btn-animate"
          >
            Back to Content
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Edit Event
          </h1>
          <button
            onClick={() => router.push('/admin/content')}
            className="text-white/70 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="card p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Title
              </label>
              <input
                type="text"
                value={event.title}
                onChange={(e) => setEvent({ ...event, title: e.target.value })}
                className="w-full px-4 py-2 bg-black border border-purple-700/40 rounded-none text-white focus:outline-none focus:ring-2 focus:ring-purple-800"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Tag
              </label>
              <input
                type="text"
                value={event.tag}
                onChange={(e) => setEvent({ ...event, tag: e.target.value })}
                className="w-full px-4 py-2 bg-black border border-purple-700/40 rounded-none text-white focus:outline-none focus:ring-2 focus:ring-purple-800"
                placeholder="Enter tag (optional)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={event.start_date}
                  onChange={(e) => setEvent({ ...event, start_date: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-purple-700/40 rounded-none text-white focus:outline-none focus:ring-2 focus:ring-purple-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Duration
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs text-white/70 mb-1">Hours</label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      value={hours}
                      onChange={(e) => {
                        const newHours = Math.max(0, Math.min(24, parseInt(e.target.value) || 0))
                        setEvent({ ...event, duration: formatDuration(newHours, minutes) })
                      }}
                      className="w-full px-3 py-2 bg-black border border-purple-700/40 rounded-none text-white focus:outline-none focus:ring-2 focus:ring-purple-800"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-white/70 mb-1">Minutes</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      step="15"
                      value={minutes}
                      onChange={(e) => {
                        const newMinutes = Math.max(0, Math.min(59, parseInt(e.target.value) || 0))
                        setEvent({ ...event, duration: formatDuration(hours, newMinutes) })
                      }}
                      className="w-full px-3 py-2 bg-black border border-purple-700/40 rounded-none text-white focus:outline-none focus:ring-2 focus:ring-purple-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Content
              </label>
              <MarkdownEditor
                value={event.content}
                onChange={(content) => setEvent({ ...event, content })}
                placeholder="Write your event content here... You can use Markdown and LaTeX!"
              />
            </div>

            <div className="border-t border-purple-700/40 pt-6">
              <ImageUpload
                onImageInserted={handleImageInserted}
                entityType="events"
                entityId={eventId}
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="px-6 py-2 bg-purple-900/40 hover:bg-purple-900/40 text-white rounded-none font-semibold transition-colors disabled:opacity-50 btn-animate"
              >
                Save as Draft
              </button>
              <button
                onClick={() => handleSave(false)}
                disabled={saving}
                className="px-6 py-2 bg-purple-800 hover:bg-purple-700 text-white rounded-none font-semibold transition-colors disabled:opacity-50 btn-animate"
              >
                {event.is_draft ? 'Publish' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
