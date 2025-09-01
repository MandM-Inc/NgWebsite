'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<'mission' | 'current' | 'philosophy'>('mission')

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-serif font-bold mb-6 text-gray-900 dark:text-white">
              About NeuroGeneration
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
              We are NeuroGeneration (NG), a non-profit organization founded by high school students passionate about neuroscience and psychology!
            </p>
            <div className="mt-10">
              <img
                src="/AboutPage.jpg"
                alt="NeuroGeneration team"
                className="mx-auto w-full max-w-4xl rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl font-serif font-bold mb-8 text-gray-900 dark:text-white">
              About Us
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              We are a nationwide alliance of brain science enthusiasts—including students from all around the country, 
              we gathered national BrainBee competition winners, expert advisors, and student clubs—united to build a 
              platform dedicated to mental health, neuroscience, and psychology!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-serif font-bold text-center mb-12 text-gray-900 dark:text-white"
          >
            Our Mission
          </motion.h2>
          
          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-white dark:bg-gray-700 rounded-lg shadow-sm">
              {['mission', 'current', 'philosophy'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as 'mission' | 'current' | 'philosophy')}
                  className={`px-6 py-3 font-medium transition-colors first:rounded-l-lg last:rounded-r-lg ${
                    activeTab === tab
                      ? 'bg-gray-800 dark:bg-gray-700 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {tab === 'mission' ? 'Our Goals' : tab === 'current' ? 'Current Missions' : 'Our Philosophy'}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            key={activeTab}
          >
            {activeTab === 'mission' && (
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Communication Platform
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Build a communication platform for middle school students interested in neuroscience & psychology
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Opportunities
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Provide opportunities for academic sharing, social interaction, and self-expression
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Mental Health
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Promote mental health awareness through science while exploring the wonders of the brain
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'current' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                    Social Media Operations
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    WeChat Official Account, Xiaohongshu, etc.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Your creativity and talent are urgently needed!
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                    Academic Publication
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Popular science articles + original research by students
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    We welcome your submissions!
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-sm">
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                    Neuroscience & Psychology Summit
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">
                    Organizing and co-hosting national neuroscience and psychology forums
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    We connect high school students nationwide to collectively drive neuroscience and psychology education forward in China.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'philosophy' && (
              <div className="max-w-4xl mx-auto text-center">
                <div className="bg-gray-800 dark:bg-gray-700 rounded-2xl p-12 text-white">
                  <h3 className="text-3xl font-serif font-bold mb-6">
                    &ldquo;Mind Matters, Brain Connects.&rdquo;
                  </h3>
                  <p className="text-xl leading-relaxed">
                    Focusing on mental health, grounded in neuroscience and psychology, we aim to explore infinite possibilities of mind and brain!
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-serif font-bold mb-6 text-gray-900 dark:text-white">
              Contact
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              RedNote / WeChat Official Account / Instagram / Twitter: <span className="font-semibold">NeuroGeneration</span>
            </p>
            
            <h3 className="text-2xl font-serif font-bold mt-12 mb-6 text-gray-900 dark:text-white">
              Join Our Community
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Contact us by direct message to join us or sponsor
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  )
}