'use client'

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
    const id = setInterval(() => setBgIndex((i) => (i + 1) % images.length), 10000)
    return () => clearInterval(id)
  }, [images])

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative border-b border-purple-700/40">
        {/* Static background */}
        <div className="absolute inset-0 bg-black" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              NeuroGeneration
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto">
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
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-white">
            What We Offer
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8">
              <div className="w-12 h-12 bg-purple-800 rounded-none flex items-center justify-center mb-4">
                <TagIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Educational Posts
              </h3>
              <p className="text-white/70">
                Explore cutting-edge neuroscience and psychology topics through our carefully curated articles and research insights.
              </p>
            </div>

            <div className="card p-8">
              <div className="w-12 h-12 bg-purple-800 rounded-none flex items-center justify-center mb-4">
                <CalendarIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Engaging Events
              </h3>
              <p className="text-white/70">
                Join workshops, seminars, and hands-on activities designed to deepen your understanding of neuroscience and psychology.
              </p>
            </div>

            <div className="card p-8">
              <div className="w-12 h-12 bg-purple-800 rounded-none flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">
                Teen Community
              </h3>
              <p className="text-white/70">
                Connect with like-minded teens passionate about neuroscience and psychology, building lasting friendships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black border-t border-purple-700/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Join the NeuroGeneration Movement
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Be part of a community that&apos;s shaping the future of neuroscience and psychology
          </p>
          <ButtonLink href="/about" variant="primary" size="lg">
            Learn More About Us
          </ButtonLink>
        </div>
      </section>
    </main>
  )
}
