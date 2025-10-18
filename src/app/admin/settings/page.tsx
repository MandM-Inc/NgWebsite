'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth, changeAdminPassword } from '@/lib/auth'

export default function AdminSettingsPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (!isAdmin) {
      router.push('/admin')
      return
    }
  }, [isAdmin, router])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'All fields are required' })
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    setLoading(true)

    try {
      const result = await changeAdminPassword(currentPassword, newPassword)
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        
        setTimeout(() => {
          router.push('/admin/dashboard')
        }, 2000)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to change password' })
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setMessage({ type: 'error', text: 'Failed to change password' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Admin Settings
          </h1>
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 bg-purple-900/30 hover:bg-purple-900/40 text-white rounded-none text-sm font-semibold transition-colors btn-animate"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            Change Password
          </h2>

          {message && (
            <div
              className={`mb-6 p-4 rounded-none ${
                message.type === 'success'
                  ? 'bg-green-900/30 text-green-400'
                  : 'bg-red-900/30 text-red-400'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 bg-black border border-purple-700/40 rounded-none text-white focus:outline-none focus:ring-2 focus:ring-purple-800"
                placeholder="Enter current password"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 bg-black border border-purple-700/40 rounded-none text-white focus:outline-none focus:ring-2 focus:ring-purple-800"
                placeholder="Enter new password (min. 8 characters)"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-black border border-purple-700/40 rounded-none text-white focus:outline-none focus:ring-2 focus:ring-purple-800"
                placeholder="Confirm new password"
                disabled={loading}
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-purple-800 hover:bg-purple-700 text-white rounded-none font-semibold transition-colors disabled:opacity-50"
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-purple-700/40">
            <h3 className="text-lg font-semibold text-white mb-4">
              Security Notes
            </h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>Passwords must be at least 8 characters long</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>Use a combination of letters, numbers, and symbols for better security</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>Do not share your admin password with anyone</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>Change your password regularly for better security</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>Sessions expire after 8 hours of inactivity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>Too many failed login attempts will lock you out for 15 minutes</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
