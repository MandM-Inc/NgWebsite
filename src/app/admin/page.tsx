'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { isAdmin, login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isAdmin) {
      router.push('/admin/dashboard')
    }
  }, [isAdmin, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const success = await login(password)
      if (success) {
        router.push('/admin/dashboard')
      } else {
        setError('Invalid password')
        setPassword('')
      }
    } catch (err) {
      setError('Login failed. Please try again.')
      setPassword('')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-center mb-6 text-white">
            Admin Login
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-black border border-purple-700/40 rounded-none text-white focus:outline-none focus:ring-2 focus:ring-purple-800"
                required
              />
            </div>
            
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            
            <button
              type="submit"
              className="w-full px-4 py-2 bg-purple-800 hover:bg-purple-700 text-white rounded-none font-semibold transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
