'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Brain, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Brain icon */}
        <motion.div
          className="text-white/60 dark:text-white/70 mb-8"
          animate={{ 
            y: [0, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Brain className="w-20 h-20 mx-auto" />
        </motion.div>

        {/* 404 text */}
        <h1 className="text-6xl font-bold text-white dark:text-white mb-4">
          404
        </h1>

        {/* Error message */}
        <h2 className="text-2xl font-serif mb-4 text-white dark:text-white/80">
          Page Not Found
        </h2>
        
        <p className="text-white/60 dark:text-white/70 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-900/40 hover:bg-black text-white rounded-none font-semibold transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-black hover:bg-white dark:hover:bg-purple-900/40 text-white/80 dark:text-white/80 rounded-none font-semibold transition-colors border border-gray-300 dark:border-gray-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </motion.div>
    </main>
  )
}