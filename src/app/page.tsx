'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ButtonLink } from '@/components/Button'
import { CalendarIcon, TagIcon } from '@/components/Icons'

export default function Home() {
  const [images, setImages] = useState<string[]>([])
  const [bgIndex, setBgIndex] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function loadImages() {
      try {
        const res = await fetch('/api/gallery', { cache: 'no-store' })
        const data = await res.json()
        if (!cancelled && Array.isArray(data.images)) {
          setImages(data.images)
          setBgIndex(0)
        }
      } catch {
        // ignore; keep default empty list
      }
    }
    loadImages()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (images.length <= 1) return
    const id = setInterval(() => setBgIndex((i) => (i + 1) % images.length), 7000)
    return () => clearInterval(id)
  }, [images])

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative border-b border-white/20 dark:border-white/10">
        {/* Background image layer */}
        <div className="absolute inset-0">
          <motion.div
            key={images[bgIndex]}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: images.length ? `url(${images[bgIndex]})` : 'none', backgroundColor: images.length ? undefined : '#111827' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-gray-900/30 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-white">
              NeuroGeneration
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              Empowering teens to explore neuroscience and psychology, shaping the future of brain research
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <ButtonLink href="/posts" variant="primary" size="lg">
                Explore Posts
              </ButtonLink>
              <ButtonLink href="/events" variant="primary" size="lg">
                View Events
              </ButtonLink>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-serif font-bold text-center mb-12 text-white"
          >
            What We Offer
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="glass-panel p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <TagIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Educational Posts
              </h3>
              <p className="text-gray-300">
                Explore cutting-edge neuroscience and psychology topics through our carefully curated articles and research insights.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-panel p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Engaging Events
              </h3>
              <p className="text-gray-300">
                Join workshops, seminars, and hands-on activities designed to deepen your understanding of neuroscience and psychology.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass-panel p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Teen Community
              </h3>
              <p className="text-gray-300">
                Connect with like-minded teens passionate about neuroscience and psychology, building lasting friendships.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-gray-800 via-gray-900 to-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
              Join the NeuroGeneration Movement
            </h2>
            <p className="text-xl text-gray-100 mb-8">
              Be part of a community that&apos;s shaping the future of neuroscience and psychology
            </p>
            <ButtonLink href="/about" variant="primary" size="lg">
                Learn More About Us
            </ButtonLink>
          </motion.div>
        </div>
      </section>
    </main>
  )
}