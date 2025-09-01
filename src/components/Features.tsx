'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { containerStagger, itemFade, viewportOnce } from '@/lib/motion'

const features = [
  {
    name: 'Next.js 15',
    description: 'The React framework for production with App Router and server components.',
    icon: '⚡',
  },
  {
    name: 'TypeScript',
    description: 'Type-safe development with full IDE support and better code quality.',
    icon: '🔷',
  },
  {
    name: 'Tailwind CSS',
    description: 'Utility-first CSS framework for rapid UI development.',
    icon: '🎨',
  },
  {
    name: 'Framer Motion',
    description: 'Production-ready motion library for React with simple animations.',
    icon: '✨',
  },
  {
    name: 'Supabase',
    description: 'Open source Firebase alternative with PostgreSQL database.',
    icon: '🗄️',
  },
  {
    name: 'ESLint',
    description: 'Code quality and consistency with automated linting.',
    icon: '🔍',
  },
]

export default function Features() {
  const prefersReduced = useReducedMotion()
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-base font-semibold leading-7 text-gradient">
            Tech Stack
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Everything you need to build modern web apps
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <motion.dl
            variants={containerStagger(0.08, 0.15)}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.name}
                variants={itemFade(18, 0.45)}
                whileHover={prefersReduced ? undefined : { y: -4, scale: 1.02 }}
                className="glass-panel flex flex-col p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                  <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600">
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </motion.div>
            ))}
          </motion.dl>
        </div>
      </div>
    </section>
  )
}