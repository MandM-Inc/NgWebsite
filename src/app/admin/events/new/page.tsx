'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import MarkdownEditor from '@/components/MarkdownEditor'
import ImageUpload from '@/components/ImageUpload'

export const dynamic = 'force-dynamic'

export default function NewEventPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [event, setEvent] = useState({
    title: '',
    content: '',
    tag: '',
    start_date: '',
    start_time: '',
    duration_hours: 1,
    duration_minutes: 0,
    is_draft: false
  })
  const [saving, setSaving] = useState(false)
  const [eventId, setEventId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin) {
      router.push('/admin')
    }
  }, [isAdmin, router])

  async function handleSave(isDraft: boolean) {
    if (!event.title.trim() || !event.content.trim() || !event.start_date || !event.start_time) {
      alert('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      // Combine date and time
      const startDateTime = new Date(`${event.start_date}T${event.start_time}`)
      
      // Format duration as PostgreSQL interval
      const duration = `${event.duration_hours}:${event.duration_minutes.toString().padStart(2, '0')}:00`

      const { data, error } = await supabase
        .from('events')
        .insert({
          title: event.title,
          content: event.content,
          tag: event.tag || null,
          start_date: startDateTime.toISOString(),
          duration: duration,
          is_draft: isDraft
        })
        .select()
        .single()

      if (error) throw error
      
      if (data) {
        setEventId(data.id)
      }

      router.push('/admin/content')
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Error saving event')
    } finally {
      setSaving(false)
    }
  }

  function handleImageInserted(markdownText: string) {
    setEvent({ ...event, content: event.content + '\n\n' + markdownText + '\n\n' })
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Create New Event
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
                Title *
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
                placeholder="Enter tag (e.g., Workshop, Seminar)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Event Date *
                </label>
                <input
                  type="date"
                  value={event.start_date}
                  onChange={(e) => setEvent({ ...event, start_date: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-purple-700/40 rounded-none text-white focus:outline-none focus:ring-2 focus:ring-purple-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={event.start_time}
                  onChange={(e) => setEvent({ ...event, start_time: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-purple-700/40 rounded-none text-white focus:outline-none focus:ring-2 focus:ring-purple-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Duration
              </label>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={event.duration_hours}
                    onChange={(e) => setEvent({ ...event, duration_hours: parseInt(e.target.value) || 0 })}
                    className="w-20 px-3 py-2 bg-black border border-purple-700/40 rounded-none text-white focus:outline-none focus:ring-2 focus:ring-purple-800"
                  />
                  <span className="text-white/80">hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={event.duration_minutes}
                    onChange={(e) => setEvent({ ...event, duration_minutes: parseInt(e.target.value) || 0 })}
                    className="w-20 px-3 py-2 bg-black border border-purple-700/40 rounded-none text-white focus:outline-none focus:ring-2 focus:ring-purple-800"
                  />
                  <span className="text-white/80">minutes</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Content *
              </label>
              <MarkdownEditor
                value={event.content}
                onChange={(content) => setEvent({ ...event, content })}
                placeholder="Write your event description here... You can use Markdown and LaTeX!"
              />
            </div>

            <div className="border-t border-purple-700/40 pt-6">
              <ImageUpload
                onImageInserted={handleImageInserted}
                entityType="events"
                entityId={eventId || 'temp'}
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
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
