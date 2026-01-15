'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import GlobalThemeToggle from '@/components/navigation/GlobalThemeToggle'
import ActorApplicationModal from '@/components/landing/ActorApplicationModal'

interface GreenlitLandingProps {}

export default function GreenlitLanding({}: GreenlitLandingProps) {
  const { user, isAuthenticated, signOut } = useAuth()
  const { theme } = useTheme()
  const [showFAQModal, setShowFAQModal] = useState(false)
  const [showActorApplicationModal, setShowActorApplicationModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  // FAQ Modal handlers
  const openFAQModal = () => {
    setShowFAQModal(true)
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden'
    }
  }
  const closeFAQModal = () => {
    setShowFAQModal(false)
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'auto'
    }
  }
  
  // Mobile menu handlers  
  const openMobileMenu = () => {
    setShowMobileMenu(true)
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden'
    }
  }
  const closeMobileMenu = () => {
    setShowMobileMenu(false)
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'auto'
    }
  }
  
  // Close modal/menu on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showFAQModal) closeFAQModal()
        if (showMobileMenu) closeMobileMenu()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [showFAQModal, showMobileMenu])

  // Carousel data
  const carouselSlides = [
    { id: 1, poster: '/images/series-posters/poster-1.JPG', genre: 'Psychological Drama', alt: 'Psychological Drama' },
    { id: 2, poster: '/images/series-posters/poster-2.JPG', genre: 'Social Drama', alt: 'Social Drama' },
    { id: 3, poster: '/images/series-posters/poster-3.JPG', genre: 'Mystery/Crime', alt: 'Mystery/Crime' },
    { id: 4, poster: '/images/series-posters/poster-4.JPG', genre: 'Horror', alt: 'Horror' },
    { id: 5, poster: '/images/series-posters/poster-5.JPG', genre: 'LGBTQ+ Romance', alt: 'LGBTQ+ Romance' },
    { id: 6, poster: '/images/series-posters/poster-6.JPG', genre: 'Coming-of-Age', alt: 'Coming-of-Age' },
    { id: 7, poster: '/images/series-posters/poster-7.JPG', genre: 'Sci-Fi Thriller', alt: 'Sci-Fi Thriller' },
    { id: 8, poster: '/images/series-posters/poster-8.JPG', genre: 'Family Drama', alt: 'Family Drama' },
    { id: 9, poster: '/images/series-posters/poster-9.JPG', genre: 'Experimental', alt: 'Experimental' },
    { id: 10, poster: '/images/series-posters/poster-10.JPG', genre: 'Action Thriller', alt: 'Action Thriller' },
    { id: 11, poster: '/images/series-posters/poster-11.JPG', genre: 'Fantasy', alt: 'Fantasy' },
    { id: 12, poster: '/images/series-posters/poster-12.JPG', genre: 'Comedy', alt: 'Comedy' }
  ]

  // Carousel navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length)
  }
  
  const previousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length)
  }

  // Auto-play carousel with pause on hover
  const [isCarouselPaused, setIsCarouselPaused] = useState(false)
  
  useEffect(() => {
    if (isCarouselPaused) return
    const interval = setInterval(nextSlide, 4000)
    return () => clearInterval(interval)
  }, [isCarouselPaused, currentSlide])
  
  // Touch/swipe support for carousel
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)
  
  const minSwipeDistance = 50
  
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }
  
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    })
  }
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const isLeftSwipe = distanceX > minSwipeDistance
    const isRightSwipe = distanceX < -minSwipeDistance
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY)
    
    if (isHorizontalSwipe) {
      if (isLeftSwipe) {
        nextSlide()
      } else if (isRightSwipe) {
        previousSlide()
      }
    }
  }
  
  // Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setCurrentSlide((prev) => (prev + 1) % carouselSlides.length)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [carouselSlides.length])

  // Theme wrapper class for scoped light mode styles
  const themeWrapperClass = theme === 'light' ? 'landing-shell landing-shell-light' : 'landing-shell landing-shell-dark'

  // Apply landing page body styles
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const originalBodyStyle = document.body.style.cssText
      const originalBodyClass = document.body.className
      
      // Apply landing page body styles
      document.body.style.fontFamily = "'Space Grotesk', sans-serif"
      document.body.style.backgroundColor = theme === 'light' ? '#FFFFFF' : '#121212'
      document.body.style.color = theme === 'light' ? '#1A1A1A' : '#ffffff'
      document.body.style.lineHeight = '1.6'
      document.body.style.overflowX = 'hidden'
      
      return () => {
        // Restore original styles on unmount
        document.body.style.cssText = originalBodyStyle
        document.body.className = originalBodyClass
      }
    }
  }, [theme])

  // Inject critical CSS for landing page
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const styleId = 'landing-critical-styles'
      let styleEl = document.getElementById(styleId) as HTMLStyleElement
      
      if (!styleEl) {
        styleEl = document.createElement('style')
        styleEl.id = styleId
        document.head.appendChild(styleEl)
      }
      
      styleEl.textContent = `
        /* CRITICAL: Force dark mode for landing page */
        body {
          background-color: #121212 !important;
          color: #ffffff !important;
        }
        /* CRITICAL: Ensure all text elements have white color by default */
        .landing-shell h1:not(.hero-headline),
        .landing-shell h2,
        .landing-shell h3,
        .landing-shell h4,
        .landing-shell h5,
        .landing-shell h6,
        .landing-shell p,
        .landing-shell li,
        .landing-shell span:not(.header-brand-text),
        .landing-shell div:not(.video-background):not(.particles):not(.geometric-bg) {
          color: #ffffff !important;
        }
        /* Ensure landing page styles take precedence over Tailwind */
        .landing-shell {
          position: relative !important;
          width: 100% !important;
          min-height: 100vh !important;
          isolation: isolate;
          background-color: #121212 !important;
          color: #ffffff !important;
        }
        .landing-shell * {
          box-sizing: border-box;
        }
        /* Override root layout wrapper styles */
        body > div > div > main > div > .landing-shell,
        body > div > div > div > main > div > .landing-shell {
          position: static !important;
          width: 100% !important;
          min-height: 100vh !important;
        }
        /* CRITICAL: Universal text visibility - catch everything */
        .landing-shell h1:not(.hero-headline),
        .landing-shell h2,
        .landing-shell h3,
        .landing-shell h4,
        .landing-shell h5,
        .landing-shell h6,
        .landing-shell p,
        .landing-shell li,
        .landing-shell span:not(.header-brand-text):not(.particle),
        .landing-shell label,
        .landing-shell a,
        .landing-shell div:not(.video-background):not(.particles):not(.geometric-bg):not(.particle):not(.geometric-shape) {
          color: #ffffff !important;
          opacity: 1 !important;
          visibility: visible !important;
        }
        /* Block elements */
        .landing-shell h1:not(.hero-headline),
        .landing-shell h2,
        .landing-shell h3,
        .landing-shell h4,
        .landing-shell h5,
        .landing-shell h6,
        .landing-shell p,
        .landing-shell div:not(.video-background):not(.particles):not(.geometric-bg) {
          display: block !important;
        }
        /* Inline elements */
        .landing-shell span:not(.header-brand-text):not(.particle),
        .landing-shell a {
          display: inline !important;
        }
        /* List items */
        .landing-shell li {
          display: list-item !important;
        }
        /* Ensure sections and containers are visible */
        .landing-shell section,
        .landing-shell .hero-section,
        .landing-shell .comparison-section,
        .landing-shell .stories-carousel-section,
        .landing-shell .producer-program-section,
        .landing-shell .how-it-works-section,
        .landing-shell .development-slate-section,
        .landing-shell .final-cta-section {
          display: block !important;
          opacity: 1 !important;
          visibility: visible !important;
          position: relative !important;
        }
        /* Ensure video background shows */
        .landing-shell .video-background {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: -1 !important;
        }
        .landing-shell .video-background video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
        /* Ensure particles show */
        .landing-shell .particles {
          position: absolute !important;
          width: 100% !important;
          height: 100% !important;
          top: 0 !important;
          left: 0 !important;
          z-index: 2 !important;
          pointer-events: none !important;
          overflow: visible !important;
        }
        .landing-shell .particle {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        /* Ensure geometric shapes show */
        .landing-shell .geometric-bg {
          position: absolute !important;
          width: 100% !important;
          height: 100% !important;
          top: 0 !important;
          left: 0 !important;
          z-index: 2 !important;
          pointer-events: none !important;
          overflow: visible !important;
        }
        .landing-shell .geometric-shape {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        /* Ensure parallax dividers show backgrounds */
        .landing-shell .parallax-divider {
          position: relative !important;
          background-size: cover !important;
          background-position: center !important;
          background-repeat: no-repeat !important;
        }
        /* Ensure hero content is above video */
        .landing-shell .hero-content {
          position: relative !important;
          z-index: 10 !important;
        }
        /* Ensure video overlay shows */
        .landing-shell .video-overlay {
          position: absolute !important;
          z-index: 0 !important;
        }
        /* FIX: Disable problematic animations for hero */
        .landing-shell .hero-headline,
        .landing-shell .hero-subheadline,
        .landing-shell .hero-logo,
        .landing-shell .cta-buttons,
        .landing-shell .micro-copy {
          opacity: 1 !important;
          visibility: visible !important;
          animation: none !important;
        }
        
        /* CRITICAL: Force ALL sections and their content to be visible */
        .landing-shell section,
        .landing-shell .comparison-section,
        .landing-shell .stories-carousel-section,
        .landing-shell .producer-program-section,
        .landing-shell .how-it-works-section,
        .landing-shell .development-slate-section,
        .landing-shell .final-cta-section {
          opacity: 1 !important;
          visibility: visible !important;
          position: relative !important;
          z-index: 5 !important;
        }
        
        /* CRITICAL: Force ALL containers and content divs to be visible */
        .landing-shell .container,
        .landing-shell .comparison-grid,
        .landing-shell .comparison-column,
        .landing-shell .section-headline,
        .landing-shell .stories-content,
        .landing-shell .carousel-container,
        .landing-shell .producer-content,
        .landing-shell .pipeline-steps,
        .landing-shell .pipeline-step,
        .landing-shell .development-content,
        .landing-shell .final-cta-content {
          opacity: 1 !important;
          visibility: visible !important;
          position: relative !important;
          z-index: 6 !important;
        }
        
        /* CRITICAL: Force ALL text within sections to be visible */
        .landing-shell .comparison-section h2,
        .landing-shell .comparison-section h3,
        .landing-shell .comparison-section p,
        .landing-shell .comparison-section li,
        .landing-shell .stories-carousel-section h2,
        .landing-shell .stories-carousel-section p,
        .landing-shell .producer-program-section h2,
        .landing-shell .producer-program-section h3,
        .landing-shell .producer-program-section h4,
        .landing-shell .producer-program-section p,
        .landing-shell .how-it-works-section h2,
        .landing-shell .how-it-works-section h3,
        .landing-shell .how-it-works-section p,
        .landing-shell .development-slate-section h2,
        .landing-shell .development-slate-section h4,
        .landing-shell .development-slate-section p,
        .landing-shell .final-cta-section h2,
        .landing-shell .final-cta-section p {
          color: #ffffff !important;
          opacity: 1 !important;
          visibility: visible !important;
          display: block !important;
          position: relative !important;
          z-index: 7 !important;
        }
        
        /* CRITICAL: Force list items in all sections */
        .landing-shell .comparison-list li,
        .landing-shell ul li,
        .landing-shell ol li {
          color: #ffffff !important;
          opacity: 1 !important;
          visibility: visible !important;
          display: list-item !important;
          position: relative !important;
          z-index: 7 !important;
        }
        
        /* CRITICAL: Force all paragraphs in all sections */
        .landing-shell section p,
        .landing-shell .comparison-section p,
        .landing-shell .stories-carousel-section p,
        .landing-shell .producer-program-section p,
        .landing-shell .how-it-works-section p,
        .landing-shell .development-slate-section p,
        .landing-shell .final-cta-section p {
          color: #ffffff !important;
          opacity: 1 !important;
          visibility: visible !important;
          display: block !important;
        }
        
        /* CRITICAL: Force all headings in all sections */
        .landing-shell section h2,
        .landing-shell section h3,
        .landing-shell section h4,
        .landing-shell .comparison-section h2,
        .landing-shell .comparison-section h3,
        .landing-shell .stories-carousel-section h2,
        .landing-shell .producer-program-section h2,
        .landing-shell .producer-program-section h3,
        .landing-shell .producer-program-section h4,
        .landing-shell .how-it-works-section h2,
        .landing-shell .how-it-works-section h3,
        .landing-shell .development-slate-section h2,
        .landing-shell .development-slate-section h4,
        .landing-shell .final-cta-section h2 {
          color: #ffffff !important;
          opacity: 1 !important;
          visibility: visible !important;
          display: block !important;
        }
        
        /* CRITICAL: Parallax divider text */
        .landing-shell .parallax-divider,
        .landing-shell .parallax-content,
        .landing-shell .parallax-text {
          opacity: 1 !important;
          visibility: visible !important;
          color: #ffffff !important;
          position: relative !important;
          z-index: 7 !important;
        }
        
        /* Hero headline specific styling - ensure it's always visible */
        .landing-shell .hero-headline {
          font-family: 'Orbitron', monospace !important;
          font-weight: 900 !important;
          text-transform: uppercase;
          font-size: clamp(2.5rem, 8vw, 4rem) !important;
          line-height: 1.1;
          margin-bottom: 1rem;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5), 0 0 30px rgba(0, 255, 153, 0.3);
          display: block !important;
          opacity: 1 !important;
          visibility: visible !important;
          /* Gradient text effect */
          background: linear-gradient(135deg, #ffffff 0%, #00FF99 50%, #ffffff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          /* Critical: Ensure text is visible even if gradient fails */
          color: #00FF99 !important;
        }
        /* Force text visibility - override transparent fill if needed */
        .landing-shell .hero-headline {
          -webkit-text-fill-color: transparent !important;
        }
        /* Ensure hero subheadline is visible */
        .landing-shell .hero-subheadline {
          font-size: clamp(1.1rem, 2.5vw, 1.3rem);
          margin-bottom: 2.5rem;
          color: #e0e0e0 !important;
          opacity: 1 !important;
          visibility: visible !important;
          display: block !important;
        }
        /* Ensure all paragraphs are visible */
        .landing-shell p {
          color: #ffffff !important;
          opacity: 1 !important;
          visibility: visible !important;
          display: block !important;
        }
        /* Ensure all headings are visible */
        .landing-shell h2,
        .landing-shell h3,
        .landing-shell h4 {
          color: #ffffff !important;
          opacity: 1 !important;
          visibility: visible !important;
          display: block !important;
        }
        /* Ensure list items are visible */
        .landing-shell .comparison-list li {
          color: #ffffff !important;
          opacity: 1 !important;
          visibility: visible !important;
          display: list-item !important;
        }
        
        /* FINAL CATCH-ALL: Force visibility for ANY text element we might have missed */
        .landing-shell section *,
        .landing-shell .comparison-section *,
        .landing-shell .stories-carousel-section *,
        .landing-shell .producer-program-section *,
        .landing-shell .how-it-works-section *,
        .landing-shell .development-slate-section *,
        .landing-shell .final-cta-section * {
          opacity: 1 !important;
          visibility: visible !important;
        }
        /* But exclude background elements from the catch-all */
        .landing-shell .video-background,
        .landing-shell .particles,
        .landing-shell .geometric-bg,
        .landing-shell .particle,
        .landing-shell .geometric-shape {
          /* Keep their existing styles */
        }
        /* Force text color on all text nodes within sections */
        .landing-shell section h1:not(.hero-headline),
        .landing-shell section h2,
        .landing-shell section h3,
        .landing-shell section h4,
        .landing-shell section h5,
        .landing-shell section h6,
        .landing-shell section p,
        .landing-shell section li,
        .landing-shell section span,
        .landing-shell section div {
          color: #ffffff !important;
        }
      `
    }
  }, [])

  return (
    <div className={themeWrapperClass}>

      {/* Header Navigation */}
      <header className="main-header" id="main-header">
        <div className="header-content">
          <div className="header-logo">
            <Image 
              src="/greenlitailogo.png" 
              alt="Greenlit" 
              width={32} 
              height={32}
              className="header-logo-img" 
            />
            <span className="header-brand-text">Greenlit</span>
          </div>
          <nav className="header-nav">
          </nav>
            <div className="header-actions">
            <button className="faq-link" onClick={openFAQModal}>FAQ</button>
            <GlobalThemeToggle />
            <div id="auth-buttons">
              {isAuthenticated && user ? (
                <>
                  <button 
                    className="login-button" 
                    onClick={() => window.location.href = '/profile'}
                    style={{ background: 'transparent', border: '1px solid #00FF99' }}
                  >
                    👤 {user.displayName || user.email?.split('@')[0] || 'User'}
                  </button>
                  <button 
                    className="login-button" 
                    onClick={() => signOut()}
                    style={{ background: 'rgba(0, 255, 153, 0.1)', color: '#00FF99', marginLeft: '10px' }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button className="login-button" onClick={() => window.location.href = '/login'}>
                  Login
                </button>
              )}
            </div>
            {/* Mobile Menu Button */}
            <button 
              id="mobile-menu-btn" 
              className="mobile-menu-button" 
              aria-label="Toggle menu"
              onClick={openMobileMenu}
            >
              <span className="hamburger-icon"></span>
              <span className="hamburger-icon"></span>
              <span className="hamburger-icon"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div id="mobile-menu" className={`mobile-menu ${showMobileMenu ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          <button 
            className="mobile-nav-link" 
            onClick={() => { openFAQModal(); closeMobileMenu() }}
          >
            FAQ
          </button>
        </div>
      </div>

      {/* Section 1: Hero Section */}
      <section className="hero-section">
        <div className="video-background">
          <video autoPlay muted loop playsInline>
            <source 
              src="https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0fd273d2c6d9a064f3ae35579b2bbdf&profile_id=139&oauth2_token_id=57447761" 
              type="video/mp4"
            />
          </video>
          <div className="video-overlay"></div>
        </div>
        
        {/* Floating Particles */}
        <div className="particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
        
        {/* Geometric Background */}
        <div className="geometric-bg">
          <div className="geometric-shape"></div>
          <div className="geometric-shape"></div>
          <div className="geometric-shape"></div>
        </div>
        
        <div className="hero-content">
          <div className="hero-logo">
            <Image 
              src="/greenlitailogo.png" 
              alt="Greenlit" 
              width={80} 
              height={80}
              className="logo" 
            />
          </div>
          <h1 className="hero-headline">
            Stop Waiting for the Call.<br />Make the Show.
          </h1>
          <p className="hero-subheadline">
            We built a Showrunner for professional actors ready to take control. You bring the talent and the audience; we handle the production grind. Launch your series, own your IP.
          </p>
          <div className="cta-buttons">
            <button 
              className="cta-primary glow-effect"
              onClick={() => setShowActorApplicationModal(true)}
            >
              BE A GREENLIT ACTOR
            </button>
            <button 
              className="cta-secondary demo-button" 
              id="hero-cta-button" 
              onClick={() => window.location.href = isAuthenticated && user ? '/profile' : '/demo'}
            >
              {isAuthenticated && user ? 'Go to Dashboard' : 'Co-write your first show'}
            </button>
          </div>
          <p className="micro-copy">Response within 72 hours.</p>
        </div>
      </section>

      {/* Parallax Divider 1: The old way is fading */}
      <div className="parallax-divider" data-bg="/landingbg1.png">
        <div className="parallax-content">
          <h3 className="parallax-text">The old way is fading...</h3>
        </div>
      </div>

      {/* Section 2: Agitation & Pivot */}
      <section className="comparison-section">
        {/* Floating Particles */}
        <div className="particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
        
        {/* Geometric Background */}
        <div className="geometric-bg">
          <div className="geometric-shape"></div>
          <div className="geometric-shape"></div>
        </div>
        <div className="container">
          <h2 className="section-headline">Hollywood says wait. We say Action.</h2>
          <div className="comparison-grid">
            <div className="comparison-column old-system">
              <h3>The Old System</h3>
              <ul className="comparison-list">
                <li>Waiting months for auditions</li>
                <li>Asking producers for permission</li>
                <li>Giving away your leverage</li>
                <li>Fighting for scraps of screen time</li>
                <li>Zero ownership of your work</li>
              </ul>
            </div>
            <div className="comparison-column greenlit-way">
              <h3>The Greenlit Way</h3>
              <ul className="comparison-list">
                <li>Launch your series in a fraction of the time</li>
                <li>You are the producer</li>
                <li>Full IP ownership and monetization</li>
                <li>Direct connection to your audience</li>
                <li>70% revenue share guaranteed</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Parallax Divider 2: Rise above the noise */}
      <div className="parallax-divider" data-bg="/landingbg2.png">
        <div className="parallax-content">
          <h3 className="parallax-text">Rise above the noise</h3>
        </div>
      </div>

      {/* Section 3: Stories Carousel */}
      <section className="stories-carousel-section">
        {/* Floating Particles */}
        <div className="particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
        
        {/* Geometric Background */}
        <div className="geometric-bg">
          <div className="geometric-shape"></div>
          <div className="geometric-shape"></div>
          <div className="geometric-shape"></div>
        </div>
        
        <div className="container">
          <div className="stories-content">
            <div className="stories-text">
              <h2 className="section-headline">Stories You Can Tell</h2>
              <p className="stories-description">
                The possibilities are <span className="highlight">endless</span>. Our platform empowers you to bring to life the stories that traditional studios would never greenlight. From intimate character studies to bold genre experiments, from underrepresented voices to unconventional narratives—if you can envision it, you can create it.
              </p>
              <p className="stories-tagline">
                No gatekeepers. No compromises. Just pure creative <span className="highlight">freedom</span>.
              </p>
              <p className="stories-vision">
                These are just a glimpse of what creators like you could produce. Your <span className="highlight">vision</span>. Your voice. Your series.
              </p>
            </div>
            
            <div 
              className="carousel-container"
              onMouseEnter={() => setIsCarouselPaused(true)}
              onMouseLeave={() => setIsCarouselPaused(false)}
              onFocus={() => setIsCarouselPaused(true)}
              onBlur={() => setIsCarouselPaused(false)}
            >
              <div className="carousel-wrapper">
                <div 
                  className="carousel-slides" 
                  id="carouselSlides"
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  {carouselSlides.map((slide, index) => {
                    const prevIndex = (currentSlide - 1 + carouselSlides.length) % carouselSlides.length
                    const nextIndex = (currentSlide + 1) % carouselSlides.length
                    let slideClass = 'carousel-slide'
                    if (index === currentSlide) slideClass += ' active'
                    if (index === prevIndex) slideClass += ' prev'
                    if (index === nextIndex) slideClass += ' next'
                    
                    return (
                    <div 
                      key={slide.id} 
                      className={slideClass}
                    >
                      <div className="phone-mockup">
                        <img 
                          src={slide.poster} 
                          alt={slide.alt}
                          className="poster-image" 
                        />
                      </div>
                      <div className="genre-label">{slide.genre}</div>
                    </div>
                    )
                  })}
                </div>
                
                {/* Navigation Controls */}
                <div className="carousel-nav">
                  <button className="carousel-prev" id="carouselPrev" onClick={previousSlide}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  <button className="carousel-next" id="carouselNext" onClick={nextSlide}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Parallax Divider 3: Join the circle of stars */}
      <div className="parallax-divider" data-bg="/landingbg3.png">
        <div className="parallax-content">
          <h3 className="parallax-text">Join the circle of stars</h3>
        </div>
      </div>

      {/* Section 4: Producer Program */}
      <section className="producer-program-section">
        {/* Ambient Particles */}
        <div className="ambient-particles">
          <div className="ambient-particle"></div>
          <div className="ambient-particle"></div>
          <div className="ambient-particle"></div>
          <div className="ambient-particle"></div>
          <div className="ambient-particle"></div>
        </div>
        <div className="container">
          <h2 className="section-headline">The Accelerator: Building the Next Wave of Showrunners</h2>
          <p className="program-description">
            We're selecting our first cohort of "Founding Producers." This isn't an audition—it's your chance to pitch the vision you know will hit.
          </p>
          
          <div className="criteria-section">
            <h3 className="subsection-title">What It Takes to Get In</h3>
            <p className="criteria-intro">
              We keep the bar high because the content has to slap. To qualify for the Accelerator, you need a strong foundation in at least TWO of the Three C's: Chops, Clout, and Creativity.
            </p>
            <div className="criteria-grid">
              <div className="criteria-card">
                <div className="criteria-number">1</div>
                <h4>Chops</h4>
                <p>Demonstrated acting ability through reels, credits, and professional experience.</p>
              </div>
              <div className="criteria-card">
                <h4>Clout</h4>
                <div className="criteria-number">2</div>
                <p>An existing fanbase and proven audience engagement across platforms.</p>
              </div>
              <div className="criteria-card">
                <div className="criteria-number">3</div>
                <h4>Creativity</h4>
                <p>A clear, compelling vision for the series you want to produce.</p>
              </div>
            </div>
          </div>

          <div className="network-section">
            <h3 className="subsection-title">The Greenlit Network: Building Super-Teams</h3>
            <p className="network-description">
              Missing a 'C'? We've got you covered. Greenlit actively connects creators with massive audiences (High Clout) to top-tier, experienced actors (High Chops) to launch projects together as Co-Producers.
            </p>
          </div>

          <div className="prize-section">
            <h3 className="subsection-title">The Prize: Your Talent. Your Terms. Your IP.</h3>
            <div className="prize-grid">
              <div className="prize-item">
                <h4>Ownership</h4>
                <p>As UGC, you own the IP you create. Period.</p>
              </div>
              <div className="prize-item">
                <h4>Monetization</h4>
                <p>Direct-to-fan monetization via subscriptions, PPV, and more.</p>
              </div>
              <div className="prize-item">
                <h4>The Split</h4>
                <p>70% of revenue goes directly to creators.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: How We Build the New Hollywood */}
      <section className="how-it-works-section">
        {/* Floating Particles */}
        <div className="particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
        
        {/* Geometric Background */}
        <div className="geometric-bg">
          <div className="geometric-shape"></div>
          <div className="geometric-shape"></div>
          <div className="geometric-shape"></div>
        </div>
        <div className="container">
          <h2 className="section-headline">The New Production Pipeline</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">The Pitch (Apply)</h3>
              <p>Pitch your vision. Show us your chops (talent) and clout (audience). Response within 72 hours.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">The Writers' Room (Pre-Production)</h3>
              <p>Accelerate your vision. Co-write with our platform to draft scripts, optimize narratives, and generate story bibles and shot lists in minutes—not months. You maintain full creative control.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">The Action (Production)</h3>
              <p>You're Greenlit. You direct and shoot with your co-stars either by yourselves or with a skeleton crew. You are the director and our platform acts as your 1st AD, providing guidance to ensure quality.</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3 className="step-title">The Magic (Post-Production)</h3>
              <p>Upload your footage. Our platform handles the grind: editing, VFX, audio sync, and formatting. You lead with vision, we follow.</p>
            </div>
            <div className="step-card">
              <div className="step-number">5</div>
              <h3 className="step-title">The Premiere (Distribution)</h3>
              <p>We launch your series on the Greenlit streaming platform, activate your cast's existing fanbase, and use our existing audience to attract new viewers.</p>
            </div>
            <div className="step-card">
              <div className="step-number">6</div>
              <h3 className="step-title">The Bag (Monetization)</h3>
              <p>Own your IP and monetize from Day 1 via subscriptions, PPV, and fan voting. 70% revenue share, guaranteed.</p>
            </div>
          </div>
          
          {/* The Greenlit Fund Callout */}
          <div className="greenlit-fund-callout">
            <h3 className="fund-title">The Greenlit Fund: We Back Bold Ideas</h3>
            <p className="fund-description">
              We don't just provide the tools; we invest in the talent. Successful applicants from the Producer Program are eligible for Pilot Grants (up to $20k) to level up production.
            </p>
          </div>
        </div>
      </section>

      {/* Parallax Divider 4: Where creativity meets opportunity */}
      <div className="parallax-divider" data-bg="/landingbg4.png">
        <div className="parallax-content">
          <h3 className="parallax-text">Where creativity meets opportunity</h3>
        </div>
      </div>

      {/* Section 6: Not Yet Pipeline */}
      <section className="development-slate-section">
        <div className="container">
          <h2 className="section-headline">Still building your portfolio or audience?</h2>
          <p className="slate-description">
            Not ready for the Accelerator yet? No stress. Join the Development Slate. We provide the roadmap to get you there.
          </p>
          <div className="slate-benefits">
            <div className="benefit-item">
              <h4>The Writers' Room</h4>
              <p>Access to an exclusive community of developing creators</p>
            </div>
            <div className="benefit-item">
              <h4>Free Resources</h4>
              <p>Industry insights, templates, and production guides</p>
            </div>
            <div className="benefit-item">
              <h4>Preparation Webinars</h4>
              <p>Monthly sessions to help you build toward the next cohort</p>
            </div>
          </div>
          <button className="cta-secondary">Join the Development Slate</button>
        </div>
      </section>

      {/* Parallax Divider 5: Your moment is now */}
      <div className="parallax-divider" data-bg="/landingbg5.png">
        <div className="parallax-content">
          <h3 className="parallax-text">Your moment is now</h3>
        </div>
      </div>

      {/* Section 7: Final CTA */}
      <section className="final-cta-section">
        {/* Floating Particles */}
        <div className="particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
        
        {/* Geometric Background */}
        <div className="geometric-bg">
          <div className="geometric-shape"></div>
          <div className="geometric-shape"></div>
          <div className="geometric-shape"></div>
        </div>
        
        <div className="spotlight-background"></div>
        <div className="container">
          <h2 className="final-headline">You're Already Greenlit.</h2>
          <button 
            className="cta-primary glow-effect maximum-glow" 
            id="footer-cta-button" 
            onClick={() => window.location.href = isAuthenticated && user ? '/profile' : '/demo'}
          >
            {isAuthenticated && user ? 'Go to Dashboard →' : 'Co-write your first show →'}
          </button>
          <button className="faq-link-final" onClick={openFAQModal}>FAQ</button>
        </div>
      </section>

      {/* FAQ Modal */}
      <div id="faqModal" className={`faq-modal ${showFAQModal ? 'show' : ''}`}>
        <div className="faq-modal-overlay" onClick={closeFAQModal}></div>
        <div className="faq-modal-content">
          <div className="faq-modal-header">
            <h2 className="faq-modal-title">Greenlit FAQs</h2>
            <button className="faq-close-btn" onClick={closeFAQModal}>&times;</button>
          </div>
          <div className="faq-modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '10px' }}>
            <div className="faq-item">
              <h3 className="faq-question">Why do I have to apply? I thought there were no gatekeepers.</h3>
              <p className="faq-answer">
                Hollywood gatekeeping is arbitrary and opaque. We use transparent criteria (Chops, Clout, Creativity) because our distribution platform promises premium content. We aren't judging your worth; we're assessing your readiness to produce *right now*.
              </p>
            </div>
            
            <div className="faq-item">
              <h3 className="faq-question">How does the $20k Pilot Grant work?</h3>
              <p className="faq-answer">
                If you qualify for the Funded Producer tier (Tier 1), you are eligible for grants. We prioritize funding concepts that require extra resources (like hiring a skeleton crew or securing locations). It's structured in tranches to support the production timeline.
              </p>
            </div>
            
            <div className="faq-item">
              <h3 className="faq-question">What is the IP deal and revenue split?</h3>
              <p className="faq-answer">
                Simple. You own the IP. Period. The revenue split is 70% to the creators, 30% to Greenlit. We only win when you do.
              </p>
            </div>
            
            <div className="faq-item">
              <h3 className="faq-question">I'm a great actor but I have no followers. Can I still apply?</h3>
              <p className="faq-answer">
                Absolutely. If you have the Chops but lack the Clout, we might place you in our Co-Star Network. This gives you access to roles being cast by our Tier 1 & 2 producers, helping you build experience and audience.
              </p>
            </div>
            
            <div className="faq-item">
              <h3 className="faq-question">What if I get placed in the Development Slate?</h3>
              <p className="faq-answer">
                That's not a rejection; it's an invitation to grow. We provide specific feedback on what needs improvement (based on the 3 C's) and give you access to our community, resources, and Story Maker tools to help you get ready for the next round.
              </p>
            </div>
            
            <div className="faq-item">
              <h3 className="faq-question">Is this platform going to replace human actors or writers?</h3>
              <p className="faq-answer">
                Hell no. Greenlit is built specifically to empower human talent. The platform acts as your production crew—handling the bureaucratic grind so you can focus on the performance and the vision.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Actor Application Modal */}
      <ActorApplicationModal 
        isOpen={showActorApplicationModal}
        onClose={() => setShowActorApplicationModal(false)}
      />
    </div>
  )
}
