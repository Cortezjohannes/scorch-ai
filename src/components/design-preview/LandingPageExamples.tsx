'use client'

import React from 'react'
import Image from 'next/image'

interface LandingPageExamplesProps {
  theme: 'light' | 'dark'
}

export default function LandingPageExamples({ theme }: LandingPageExamplesProps) {
  // Use theme prop for this mockup
  const isLight = theme === 'light'
  const prefix = theme === 'dark' ? 'dark' : 'light'

  // Gold color values
  const goldPrimary = '#C9A961'
  const goldSecondary = '#B8944F'
  const goldAccent = '#F5E6D3'
  const goldHover = '#A67C3D'

  return (
    <div className="w-full space-y-12">
      <div>
        <h2 className={`text-3xl font-bold mb-2 ${prefix}-text-primary`}>
          Landing Page - Light Mode
        </h2>
        <p className={`text-base mb-6 ${prefix}-text-secondary`}>
          Light mode mockup showcasing the landing page with gold and white color scheme. All sections maintain the same structure as dark mode but adapted for optimal readability and visual appeal in light mode.
        </p>
      </div>

      {/* Header Navigation */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            Header Navigation
          </h3>
          <p className={`text-sm ${prefix}-text-secondary`}>
            Fixed header with gold accents, white/off-white background, and dark text for optimal contrast.
          </p>
        </div>

        <div className={`rounded-lg overflow-hidden border ${prefix}-border bg-white shadow-lg`}>
          <div className={`bg-white border-b ${prefix}-border`} style={{ padding: '1rem 1.5rem' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image 
                  src="/greenlitailogo.png" 
                  alt="Greenlit" 
                  width={32} 
                  height={32} 
                  className="object-contain"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(201, 169, 97, 0.4))' }}
                />
                <span className="font-bold text-lg" style={{ color: goldPrimary }}>Greenlit</span>
              </div>
              <nav className="flex items-center gap-6">
                <a href="#" className="text-sm font-medium" style={{ color: '#1A1A1A' }}>Uprising</a>
                <a href="#" className="text-sm font-medium" style={{ color: '#4A5568' }}>Program</a>
                <a href="#" className="text-sm font-medium" style={{ color: '#4A5568' }}>Criteria</a>
                <a href="#" className="text-sm font-medium" style={{ color: '#4A5568' }}>Fund</a>
                <a href="#" className="text-sm font-medium" style={{ color: '#4A5568' }}>Playbook</a>
              </nav>
              <div className="flex items-center gap-3">
                <button className="text-sm font-medium px-4 py-2 rounded" style={{ color: '#4A5568', border: `1px solid ${prefix === 'light' ? '#E2E8F0' : '#475569'}` }}>
                  FAQ
                </button>
                <button className="text-sm font-medium px-4 py-2 rounded text-white" style={{ backgroundColor: goldPrimary }}>
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            Hero Section
          </h3>
          <p className={`text-sm ${prefix}-text-secondary`}>
            Clean white background with dark headline, gold CTA buttons, and subtle gold accents.
          </p>
        </div>

        <div className={`rounded-lg overflow-hidden border ${prefix}-border bg-white shadow-lg`}>
          <div className="relative" style={{ padding: '4rem 2rem', minHeight: '500px' }}>
            {/* Background image with light overlay */}
            <div className="absolute inset-0">
              <Image 
                src="/landingbg1.png" 
                alt="Hero background" 
                fill
                className="object-cover"
                style={{ opacity: 0.65 }}
              />
              <div className="absolute inset-0 bg-white/60"></div>
            </div>
            
            {/* Subtle gold particles/accents */}
            <div className="absolute top-20 right-20 w-2 h-2 rounded-full z-10" style={{ backgroundColor: goldPrimary, opacity: 0.3 }}></div>
            <div className="absolute top-40 left-32 w-1.5 h-1.5 rounded-full z-10" style={{ backgroundColor: goldSecondary, opacity: 0.4 }}></div>
            <div className="absolute bottom-32 right-40 w-2.5 h-2.5 rounded-full z-10" style={{ backgroundColor: goldPrimary, opacity: 0.25 }}></div>

            <div className="max-w-4xl mx-auto text-center relative z-10">
              <div className="mb-6">
                <div className="flex justify-center mb-4">
                  <Image 
                    src="/greenlitailogo.png" 
                    alt="Greenlit" 
                    width={64} 
                    height={64} 
                    className="object-contain"
                    style={{ filter: 'drop-shadow(0 0 12px rgba(201, 169, 97, 0.5))' }}
                  />
                </div>
              </div>
              <h1 className="text-5xl font-bold mb-6" style={{ color: '#1A1A1A', fontFamily: 'League Spartan, sans-serif' }}>
                Stop Waiting for the Call.<br />Make the Show.
              </h1>
              <p className="text-lg mb-8" style={{ color: '#4A5568', maxWidth: '600px', margin: '0 auto 2rem' }}>
                We built a Showrunner for professional actors ready to take control. You bring the talent and the audience; we handle the production grind. Launch your series, own your IP.
              </p>
              <div className="flex items-center justify-center gap-4 mb-4">
                <button className="px-8 py-3 rounded-lg font-semibold text-white shadow-lg" style={{ backgroundColor: goldPrimary }}>
                  Apply to the Producer Program →
                </button>
                <button className="px-8 py-3 rounded-lg font-semibold" style={{ color: goldPrimary, border: `2px solid ${goldPrimary}` }}>
                  Try the Demo
                </button>
              </div>
              <p className="text-sm" style={{ color: '#718096' }}>Response within 72 hours.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Parallax Dividers */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            Parallax Dividers
          </h3>
          <p className={`text-sm ${prefix}-text-secondary`}>
            Background image dividers with overlay text, adapted for light mode with subtle overlays.
          </p>
        </div>

        <div className="space-y-4">
          <div className={`rounded-lg overflow-hidden border ${prefix}-border bg-white shadow-lg`}>
            <div className="relative" style={{ minHeight: '180px' }}>
              <Image 
                src="/landingbg1.png" 
                alt="The old way is fading" 
                fill
                className="object-cover"
                style={{ opacity: 0.75 }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-white/45">
                <h3 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>The old way is fading...</h3>
              </div>
            </div>
          </div>

          <div className={`rounded-lg overflow-hidden border ${prefix}-border bg-white shadow-lg`}>
            <div className="relative" style={{ minHeight: '180px' }}>
              <Image 
                src="/landingbg2.png" 
                alt="Rise above the noise" 
                fill
                className="object-cover"
                style={{ opacity: 0.75 }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-white/45">
                <h3 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>Rise above the noise</h3>
              </div>
            </div>
          </div>

          <div className={`rounded-lg overflow-hidden border ${prefix}-border bg-white shadow-lg`}>
            <div className="relative" style={{ minHeight: '180px' }}>
              <Image 
                src="/landingbg3.png" 
                alt="Join the circle of stars" 
                fill
                className="object-cover"
                style={{ opacity: 0.75 }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-white/45">
                <h3 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>Join the circle of stars</h3>
              </div>
            </div>
          </div>

          <div className={`rounded-lg overflow-hidden border ${prefix}-border bg-white shadow-lg`}>
            <div className="relative" style={{ minHeight: '180px' }}>
              <Image 
                src="/landingbg4.png" 
                alt="Where creativity meets opportunity" 
                fill
                className="object-cover"
                style={{ opacity: 0.75 }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-white/45">
                <h3 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>Where creativity meets opportunity</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            Comparison Section
          </h3>
          <p className={`text-sm ${prefix}-text-secondary`}>
            Old System vs Greenlit Way comparison with white cards, gold borders, and dark text.
          </p>
        </div>

        <div className={`rounded-lg overflow-hidden border ${prefix}-border bg-white shadow-lg`}>
          <div className="bg-white" style={{ padding: '3rem 2rem' }}>
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: '#1A1A1A' }}>
              Hollywood says wait. We say Action.
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* Old System */}
              <div className="rounded-lg p-6" style={{ border: `2px solid #E2E8F0`, backgroundColor: '#F2F3F5' }}>
                <h3 className="text-xl font-bold mb-4" style={{ color: '#1A1A1A' }}>The Old System</h3>
                <ul className="space-y-3">
                  {['Waiting months for auditions', 'Asking producers for permission', 'Giving away your leverage', 'Fighting for scraps of screen time', 'Zero ownership of your work'].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-xl" style={{ color: '#718096' }}>✗</span>
                      <span className="text-sm" style={{ color: '#4A5568' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Greenlit Way */}
              <div className="rounded-lg p-6" style={{ border: `2px solid ${goldPrimary}`, backgroundColor: '#FFFFFF' }}>
                <h3 className="text-xl font-bold mb-4" style={{ color: '#1A1A1A' }}>The Greenlit Way</h3>
                <ul className="space-y-3">
                  {['Launch your series in a fraction of the time', 'You are the producer', 'Full IP ownership and monetization', 'Direct connection to your audience', '70% revenue share guaranteed'].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-xl" style={{ color: goldPrimary }}>✓</span>
                      <span className="text-sm" style={{ color: '#4A5568' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stories Carousel */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            Stories Carousel
          </h3>
          <p className={`text-sm ${prefix}-text-secondary`}>
            Genre showcase with poster cards featuring gold borders and dark genre labels.
          </p>
        </div>

        <div className={`rounded-lg overflow-hidden border ${prefix}-border bg-white shadow-lg`}>
          <div className="bg-white" style={{ padding: '3rem 2rem' }}>
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#1A1A1A' }}>Stories You Can Tell</h2>
            <p className="text-base mb-8" style={{ color: '#4A5568', maxWidth: '700px' }}>
              The possibilities are <span style={{ color: goldPrimary, fontWeight: 600 }}>endless</span>. Our platform empowers you to bring to life the stories that traditional studios would never greenlight.
            </p>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {[
                { genre: 'Psychological Drama', poster: '/images/series-posters/poster-1.JPG' },
                { genre: 'Social Drama', poster: '/images/series-posters/poster-2.JPG' },
                { genre: 'Mystery/Crime', poster: '/images/series-posters/poster-3.JPG' },
                { genre: 'Horror', poster: '/images/series-posters/poster-4.JPG' },
                { genre: 'LGBTQ+ Romance', poster: '/images/series-posters/poster-5.JPG' },
                { genre: 'Coming-of-Age', poster: '/images/series-posters/poster-6.JPG' },
                { genre: 'Sci-Fi Thriller', poster: '/images/series-posters/poster-7.JPG' },
                { genre: 'Family Drama', poster: '/images/series-posters/poster-8.JPG' }
              ].map((item, idx) => (
                <div key={idx} className="flex-shrink-0 w-48">
                  <div className="rounded-lg overflow-hidden mb-2" style={{ border: `2px solid ${goldPrimary}`, aspectRatio: '2/3' }}>
                    <Image 
                      src={item.poster} 
                      alt={item.genre} 
                      width={192} 
                      height={288} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm font-medium text-center" style={{ color: '#1A1A1A' }}>{item.genre}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Producer Program Section */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            Producer Program Section
          </h3>
          <p className={`text-sm ${prefix}-text-secondary`}>
            Criteria cards with gold number badges, white backgrounds, and dark text.
          </p>
        </div>

        <div className={`rounded-lg overflow-hidden border ${prefix}-border bg-white shadow-lg`}>
          <div className="bg-white" style={{ padding: '3rem 2rem' }}>
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#1A1A1A' }}>
              The Accelerator: Building the Next Wave of Showrunners
            </h2>
            <p className="text-base mb-8" style={{ color: '#4A5568' }}>
              We're selecting our first cohort of "Founding Producers." This isn't an audition—it's your chance to pitch the vision you know will hit.
            </p>
            <h3 className="text-xl font-bold mb-4" style={{ color: '#1A1A1A' }}>What It Takes to Get In</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { number: '1', title: 'Chops', desc: 'Demonstrated acting ability through reels, credits, and professional experience.' },
                { number: '2', title: 'Clout', desc: 'An existing fanbase and proven audience engagement across platforms.' },
                { number: '3', title: 'Creativity', desc: 'A clear, compelling vision for the series you want to produce.' }
              ].map((criteria, idx) => (
                <div key={idx} className="rounded-lg p-6 relative" style={{ border: `1px solid #E2E8F0`, backgroundColor: '#FFFFFF' }}>
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: goldPrimary }}>
                    {criteria.number}
                  </div>
                  <h4 className="text-lg font-bold mb-2 mt-4" style={{ color: '#1A1A1A' }}>{criteria.title}</h4>
                  <p className="text-sm" style={{ color: '#4A5568' }}>{criteria.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            How It Works Section
          </h3>
          <p className={`text-sm ${prefix}-text-secondary`}>
            Step cards with gold step numbers, white backgrounds, and clear hierarchy.
          </p>
        </div>

        <div className={`rounded-lg overflow-hidden border ${prefix}-border bg-white shadow-lg`}>
          <div className="bg-white" style={{ padding: '3rem 2rem' }}>
            <h2 className="text-3xl font-bold mb-12 text-center" style={{ color: '#1A1A1A' }}>
              The New Production Pipeline
            </h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                { num: '1', title: 'The Pitch (Apply)', desc: 'Pitch your vision. Show us your chops (talent) and clout (audience). Response within 72 hours.' },
                { num: '2', title: 'The Writers\' Room', desc: 'Accelerate your vision. Co-write with our platform to draft scripts, optimize narratives, and generate story bibles.' },
                { num: '3', title: 'The Action (Production)', desc: 'You\'re Greenlit. You direct and shoot with your co-stars either by yourselves or with a skeleton crew.' },
                { num: '4', title: 'The Magic (Post-Production)', desc: 'Upload your footage. Our platform handles the grind: editing, VFX, audio sync, and formatting.' },
                { num: '5', title: 'The Premiere (Distribution)', desc: 'We launch your series on the Greenlit streaming platform, activate your cast\'s existing fanbase.' },
                { num: '6', title: 'The Bag (Monetization)', desc: 'Own your IP and monetize from Day 1 via subscriptions, PPV, and fan voting. 70% revenue share, guaranteed.' }
              ].map((step, idx) => (
                <div key={idx} className="rounded-lg p-6" style={{ border: `1px solid #E2E8F0`, backgroundColor: '#FFFFFF' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mb-4" style={{ backgroundColor: goldPrimary }}>
                    {step.num}
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#1A1A1A' }}>{step.title}</h3>
                  <p className="text-sm" style={{ color: '#4A5568' }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            Final CTA Section
          </h3>
          <p className={`text-sm ${prefix}-text-secondary`}>
            Prominent gold primary button with dark text on white background.
          </p>
        </div>

        <div className={`rounded-lg overflow-hidden border ${prefix}-border bg-white shadow-lg`}>
          <div className="relative" style={{ minHeight: '400px' }}>
            <Image 
              src="/landingbg5.png" 
              alt="Your moment is now" 
              fill
              className="object-cover"
              style={{ opacity: 0.7 }}
            />
            <div className="absolute inset-0 bg-white/55 flex items-center justify-center">
              <div className="max-w-3xl mx-auto text-center px-4">
                <h2 className="text-4xl font-bold mb-8" style={{ color: '#1A1A1A' }}>
                  You're Already Greenlit.
                </h2>
                <button className="px-10 py-4 rounded-lg font-bold text-white text-lg shadow-xl mb-4" style={{ backgroundColor: goldPrimary }}>
                  Try the Demo →
                </button>
                <button className="text-sm font-medium block mx-auto" style={{ color: '#4A5568' }}>FAQ</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Color Reference */}
      <section className="space-y-4">
        <div className="mb-4">
          <h3 className={`text-2xl font-bold mb-2 ${prefix}-text-primary`}>
            Color Palette Reference
          </h3>
          <p className={`text-sm ${prefix}-text-secondary`}>
            Light mode color tokens used throughout the landing page mockup.
          </p>
        </div>

        <div className={`rounded-lg overflow-hidden border ${prefix}-border bg-white shadow-lg`}>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="w-full h-24 rounded mb-2" style={{ backgroundColor: '#FFFFFF' }}></div>
                <p className="text-xs font-medium" style={{ color: '#1A1A1A' }}>White</p>
                <p className="text-xs" style={{ color: '#718096' }}>#FFFFFF</p>
              </div>
              <div>
                <div className="w-full h-24 rounded mb-2" style={{ backgroundColor: '#F2F3F5' }}></div>
                <p className="text-xs font-medium" style={{ color: '#1A1A1A' }}>Off-White</p>
                <p className="text-xs" style={{ color: '#718096' }}>#F2F3F5</p>
              </div>
              <div>
                <div className="w-full h-24 rounded mb-2" style={{ backgroundColor: goldPrimary }}></div>
                <p className="text-xs font-medium" style={{ color: '#1A1A1A' }}>Gold Primary</p>
                <p className="text-xs" style={{ color: '#718096' }}>#C9A961</p>
              </div>
              <div>
                <div className="w-full h-24 rounded mb-2" style={{ backgroundColor: goldSecondary }}></div>
                <p className="text-xs font-medium" style={{ color: '#1A1A1A' }}>Gold Secondary</p>
                <p className="text-xs" style={{ color: '#718096' }}>#B8944F</p>
              </div>
              <div>
                <div className="w-full h-24 rounded mb-2 border" style={{ backgroundColor: '#1A1A1A' }}></div>
                <p className="text-xs font-medium" style={{ color: '#1A1A1A' }}>Text Primary</p>
                <p className="text-xs" style={{ color: '#718096' }}>#1A1A1A</p>
              </div>
              <div>
                <div className="w-full h-24 rounded mb-2 border" style={{ backgroundColor: '#4A5568' }}></div>
                <p className="text-xs font-medium" style={{ color: '#1A1A1A' }}>Text Secondary</p>
                <p className="text-xs" style={{ color: '#718096' }}>#4A5568</p>
              </div>
              <div>
                <div className="w-full h-24 rounded mb-2" style={{ backgroundColor: goldAccent }}></div>
                <p className="text-xs font-medium" style={{ color: '#1A1A1A' }}>Gold Accent</p>
                <p className="text-xs" style={{ color: '#718096' }}>#F5E6D3</p>
              </div>
              <div>
                <div className="w-full h-24 rounded mb-2 border" style={{ backgroundColor: '#E2E8F0' }}></div>
                <p className="text-xs font-medium" style={{ color: '#1A1A1A' }}>Border</p>
                <p className="text-xs" style={{ color: '#718096' }}>#E2E8F0</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

