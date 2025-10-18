'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CommunityDatabasePage() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-white/70">Redirecting...</p>
      </div>
    </div>
  )
}
