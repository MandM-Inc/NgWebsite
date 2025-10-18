'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  isAdmin: boolean
  login: (password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Security: Using Web Crypto API for password hashing
// Note: In production, authentication should be done server-side with proper backend
const SALT_KEY = 'ng-admin-salt-v1'
const SESSION_KEY = 'ng-admin-session'
const SESSION_EXPIRY_KEY = 'ng-admin-session-expiry'
const LOGIN_ATTEMPTS_KEY = 'ng-admin-login-attempts'
const LOGIN_LOCKOUT_KEY = 'ng-admin-lockout-until'

// Session expires after 8 hours
const SESSION_DURATION = 8 * 60 * 60 * 1000

// Lock out after 5 failed attempts for 15 minutes
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if valid session exists
    const session = localStorage.getItem(SESSION_KEY)
    const expiry = localStorage.getItem(SESSION_EXPIRY_KEY)
    
    if (session && expiry) {
      const expiryTime = parseInt(expiry, 10)
      if (Date.now() < expiryTime) {
        setIsAdmin(true)
      } else {
        // Session expired, clean up
        cleanupSession()
      }
    }
  }, [])

  // Hash password using PBKDF2
  async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password + SALT_KEY)
    
    try {
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      return hashHex
    } catch (error) {
      console.error('Error hashing password:', error)
      throw new Error('Failed to hash password')
    }
  }

  // Get stored password hash from environment or localStorage
  async function getStoredPasswordHash(): Promise<string> {
    // Check for custom password first
    const customHash = localStorage.getItem('ng-admin-password-hash')
    if (customHash) {
      return customHash
    }
    
    // Fall back to environment password
    const envPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    if (!envPassword) {
      console.error('SECURITY WARNING: No admin password configured!')
      return ''
    }
    
    return await hashPassword(envPassword)
  }

  // Check if user is locked out due to too many failed attempts
  function isLockedOut(): boolean {
    const lockoutUntil = localStorage.getItem(LOGIN_LOCKOUT_KEY)
    if (lockoutUntil) {
      const lockoutTime = parseInt(lockoutUntil, 10)
      if (Date.now() < lockoutTime) {
        return true
      } else {
        // Lockout expired, clean up
        localStorage.removeItem(LOGIN_LOCKOUT_KEY)
        localStorage.removeItem(LOGIN_ATTEMPTS_KEY)
      }
    }
    return false
  }

  // Record failed login attempt
  function recordFailedAttempt(): void {
    const attempts = parseInt(localStorage.getItem(LOGIN_ATTEMPTS_KEY) || '0', 10)
    const newAttempts = attempts + 1
    
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, newAttempts.toString())
    
    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      const lockoutUntil = Date.now() + LOCKOUT_DURATION
      localStorage.setItem(LOGIN_LOCKOUT_KEY, lockoutUntil.toString())
    }
  }

  // Clear login attempts on successful login
  function clearLoginAttempts(): void {
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY)
    localStorage.removeItem(LOGIN_LOCKOUT_KEY)
  }

  // Create session token
  function createSession(): void {
    const token = crypto.randomUUID()
    const expiry = Date.now() + SESSION_DURATION
    
    localStorage.setItem(SESSION_KEY, token)
    localStorage.setItem(SESSION_EXPIRY_KEY, expiry.toString())
  }

  // Clean up session
  function cleanupSession(): void {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(SESSION_EXPIRY_KEY)
  }

  const login = async (password: string): Promise<boolean> => {
    try {
      // Check if locked out
      if (isLockedOut()) {
        throw new Error('Too many failed attempts. Please try again later.')
      }

      const storedHash = await getStoredPasswordHash()
      const inputHash = await hashPassword(password)
      
      if (inputHash === storedHash) {
        setIsAdmin(true)
        createSession()
        clearLoginAttempts()
        return true
      } else {
        recordFailedAttempt()
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      setIsAdmin(false)
      cleanupSession()
      await router.push('/')
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Helper function to change admin password (to be used in settings)
export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate new password
    if (newPassword.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters long' }
    }

    if (currentPassword === newPassword) {
      return { success: false, error: 'New password must be different from current password' }
    }

    // Hash passwords
    const encoder = new TextEncoder()
    const currentData = encoder.encode(currentPassword + SALT_KEY)
    const currentHashBuffer = await crypto.subtle.digest('SHA-256', currentData)
    const currentHashArray = Array.from(new Uint8Array(currentHashBuffer))
    const currentHash = currentHashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Verify current password
    const storedHash = localStorage.getItem('ng-admin-password-hash')
    const envPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    
    let isCurrentValid = false
    if (storedHash) {
      isCurrentValid = currentHash === storedHash
    } else if (envPassword) {
      const envData = encoder.encode(envPassword + SALT_KEY)
      const envHashBuffer = await crypto.subtle.digest('SHA-256', envData)
      const envHashArray = Array.from(new Uint8Array(envHashBuffer))
      const envHash = envHashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      isCurrentValid = currentHash === envHash
    }

    if (!isCurrentValid) {
      return { success: false, error: 'Current password is incorrect' }
    }

    // Hash new password
    const newData = encoder.encode(newPassword + SALT_KEY)
    const newHashBuffer = await crypto.subtle.digest('SHA-256', newData)
    const newHashArray = Array.from(new Uint8Array(newHashBuffer))
    const newHash = newHashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // Store new password hash
    localStorage.setItem('ng-admin-password-hash', newHash)

    return { success: true }
  } catch (error) {
    console.error('Error changing password:', error)
    return { success: false, error: 'Failed to change password' }
  }
}
