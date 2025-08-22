'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import MarkdownEditor from '@/components/MarkdownEditor'

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

      const { error } = await supabase
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

      router.push('/admin/content')
    } catch (error) {
      console.error('Error saving event:', error)
      alert('Error saving event')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">
              Create New Event
            </h1>
            <button
              onClick={() => router.push('/admin/content')}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            >
              Cancel
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={event.title}
                  onChange={(e) => setEvent({ ...event, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tag
                </label>
                <input
                  type="text"
                  value={event.tag}
                  onChange={(e) => setEvent({ ...event, tag: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter tag (e.g., Workshop, Seminar)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    value={event.start_date}
                    onChange={(e) => setEvent({ ...event, start_date: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={event.start_time}
                    onChange={(e) => setEvent({ ...event, start_time: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration
                </label>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={event.duration_hours}
                      onChange={(e) => setEvent({ ...event, duration_hours: parseInt(e.target.value) || 0 })}
                      className="w-20 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={event.duration_minutes}
                      onChange={(e) => setEvent({ ...event, duration_minutes: parseInt(e.target.value) || 0 })}
                      className="w-20 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-gray-700 dark:text-gray-300">minutes</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content *
                </label>
                <MarkdownEditor
                  value={event.content}
                  onChange={(content) => setEvent({ ...event, content })}
                  placeholder="Write your event description here... You can use Markdown and LaTeX!"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  Publish
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}