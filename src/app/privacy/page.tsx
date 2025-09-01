'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-center mb-12 text-gray-900 dark:text-white">
            Privacy Policy
          </h1>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12">
            <p className="text-lg text-gray-600 dark:text-gray-300 text-center mb-8">
              Information coming soon...
            </p>
            
            <div className="flex justify-center">
              <Link 
                href="/"
                className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-gray-700 hover:bg-gray-800 rounded-full transition-colors duration-200"
              >
                Back to Homepage
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}