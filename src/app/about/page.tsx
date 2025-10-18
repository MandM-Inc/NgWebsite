'use client'

import { useState } from 'react'

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<'mission' | 'current' | 'philosophy'>('mission')

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="border-b border-purple-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              About NeuroGeneration
            </h1>
            <p className="text-xl text-white/80 max-w-4xl mx-auto">
              We are NeuroGeneration (NG), a non-profit organization founded by high school students passionate about neuroscience and psychology!
            </p>
            <div className="mt-10">
              <img
                src="/AboutPage.jpg"
                alt="NeuroGeneration team"
                className="mx-auto w-full max-w-4xl rounded-none border border-purple-700/40"
              />
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-white">
              About Us
            </h2>
            <p className="text-lg text-white/80 leading-relaxed">
              We are a nationwide alliance of brain science enthusiasts—including students from all around the country, 
              we gathered national BrainBee competition winners, expert advisors, and student clubs—united to build a 
              platform dedicated to mental health, neuroscience, and psychology!
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-black border-t border-purple-700/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            Our Mission
          </h2>
          
          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-purple-900/30 rounded-none">
              <button
                onClick={() => setActiveTab('mission')}
                className={`px-6 py-3 font-medium transition-colors first:rounded-l-lg last:rounded-r-lg ${
                  activeTab === 'mission'
                    ? 'bg-purple-900/40 text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Our Goals
              </button>
              <button
                onClick={() => setActiveTab('current')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'current'
                    ? 'bg-purple-900/40 text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Current Missions
              </button>
              <button
                onClick={() => setActiveTab('philosophy')}
                className={`px-6 py-3 font-medium transition-colors first:rounded-l-lg last:rounded-r-lg ${
                  activeTab === 'philosophy'
                    ? 'bg-purple-900/40 text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Our Philosophy
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div key={activeTab}>
            {activeTab === 'mission' && (
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <div className="card p-8">
                  <h3 className="text-xl font-semibold mb-4 text-white">
                    Communication Platform
                  </h3>
                  <p className="text-white/70">
                    Build a communication platform for middle school students interested in neuroscience & psychology
                  </p>
                </div>
                <div className="card p-8">
                  <h3 className="text-xl font-semibold mb-4 text-white">
                    Opportunities
                  </h3>
                  <p className="text-white/70">
                    Provide opportunities for academic sharing, social interaction, and self-expression
                  </p>
                </div>
                <div className="card p-8">
                  <h3 className="text-xl font-semibold mb-4 text-white">
                    Mental Health
                  </h3>
                  <p className="text-white/70">
                    Promote mental health awareness through science while exploring the wonders of the brain
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'current' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="card p-8">
                  <h3 className="text-xl font-semibold mb-3 text-white">
                    Social Media Operations
                  </h3>
                  <p className="text-white/70 mb-2">
                    WeChat Official Account, Xiaohongshu, etc.
                  </p>
                  <p className="text-white/80">
                    Your creativity and talent are urgently needed!
                  </p>
                </div>
                <div className="card p-8">
                  <h3 className="text-xl font-semibold mb-3 text-white">
                    Academic Publication
                  </h3>
                  <p className="text-white/70 mb-2">
                    Popular science articles + original research by students
                  </p>
                  <p className="text-white/80">
                    We welcome your submissions!
                  </p>
                </div>
                <div className="card p-8">
                  <h3 className="text-xl font-semibold mb-3 text-white">
                    Neuroscience & Psychology Summit
                  </h3>
                  <p className="text-white/70 mb-2">
                    Organizing and co-hosting national neuroscience and psychology forums
                  </p>
                  <p className="text-white/80">
                    We connect high school students nationwide to collectively drive neuroscience and psychology education forward in China.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'philosophy' && (
              <div className="max-w-4xl mx-auto text-center">
                <div className="card p-12">
                  <h3 className="text-3xl font-bold mb-6 text-white">
                    &ldquo;Mind Matters, Brain Connects.&rdquo;
                  </h3>
                  <p className="text-xl leading-relaxed text-white/80">
                    Focusing on mental health, grounded in neuroscience and psychology, we aim to explore infinite possibilities of mind and brain!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-white">
            Contact
          </h2>
          <p className="text-lg text-white/80 mb-4">
            RedNote / WeChat Official Account / Instagram / Twitter: <span className="font-semibold">NeuroGeneration</span>
          </p>
          
          <h3 className="text-2xl font-bold mt-12 mb-6 text-white">
            Join Our Community
          </h3>
          <p className="text-lg text-white/80">
            Contact us by direct message to join us or sponsor
          </p>
        </div>
      </section>
    </main>
  )
}
