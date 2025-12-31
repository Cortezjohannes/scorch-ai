'use client'

import React, { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  opacity: number
  life: number
}

interface CharacterParticlesProps {
  hoveredCharacter: string | null
  characterPositions: Record<string, { x: number; y: number }>
  activeConnections?: Array<{ char1: string; char2: string }>
}

export default function CharacterParticles({ 
  hoveredCharacter, 
  characterPositions,
  activeConnections = []
}: CharacterParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }
    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)

    // Create initial particles
    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      color: '#10B981',
      opacity: Math.random() * 0.5 + 0.2,
      life: Math.random() * 100 + 50
    })

    // Initialize particles
    particlesRef.current = Array.from({ length: 30 }, createParticle)

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life -= 0.5

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Attract to hovered character
        if (hoveredCharacter && characterPositions[hoveredCharacter]) {
          const charPos = characterPositions[hoveredCharacter]
          const targetX = (charPos.x / 100) * canvas.width
          const targetY = (charPos.y / 100) * canvas.height
          
          const dx = targetX - particle.x
          const dy = targetY - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 200) {
            const force = (200 - distance) / 200 * 0.02
            particle.vx += (dx / distance) * force
            particle.vy += (dy / distance) * force
          }
        }

        // Damping
        particle.vx *= 0.98
        particle.vy *= 0.98

        // Reset particle if life expires
        if (particle.life <= 0) {
          particlesRef.current[index] = createParticle()
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color + Math.floor(particle.opacity * 255).toString(16).padStart(2, '0')
        ctx.fill()

        // Add glow effect
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2)
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 2
        )
        gradient.addColorStop(0, particle.color + '40')
        gradient.addColorStop(1, particle.color + '00')
        ctx.fillStyle = gradient
        ctx.fill()
      })

      // Draw connection particles along active connection lines
      if (hoveredCharacter && activeConnections.length > 0) {
        activeConnections.forEach(conn => {
          const pos1 = characterPositions[conn.char1]
          const pos2 = characterPositions[conn.char2]
          
          if (pos1 && pos2) {
            const x1 = (pos1.x / 100) * canvas.width
            const y1 = (pos1.y / 100) * canvas.height
            const x2 = (pos2.x / 100) * canvas.width
            const y2 = (pos2.y / 100) * canvas.height

            // Draw a few particles along the line
            for (let i = 0; i < 3; i++) {
              const t = (Date.now() / 2000 + i * 0.33) % 1
              const x = x1 + (x2 - x1) * t
              const y = y1 + (y2 - y1) * t

              ctx.beginPath()
              ctx.arc(x, y, 3, 0, Math.PI * 2)
              ctx.fillStyle = '#10B981' + '80'
              ctx.fill()
            }
          }
        })
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', updateCanvasSize)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [hoveredCharacter, characterPositions, activeConnections])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  )
}
