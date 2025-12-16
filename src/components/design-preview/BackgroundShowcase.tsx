'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface BackgroundShowcaseProps {
  theme: 'light' | 'dark'
}

type BackgroundType = 
  | 'particles'
  | 'gradient-mesh'
  | 'animated-grid'
  | 'waves'
  | 'geometric'
  | 'noise'
  | 'radial'
  | 'connections'

export default function BackgroundShowcase({ theme }: BackgroundShowcaseProps) {
  const [selectedBackground, setSelectedBackground] = useState<BackgroundType>('particles')
  const [mounted, setMounted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const isDark = theme === 'dark'
  const prefix = isDark ? 'dark' : 'light'

  useEffect(() => {
    setMounted(true)
  }, [])

  // Canvas-based backgrounds (noise, connections)
  useEffect(() => {
    if (!mounted || !canvasRef.current) return
    if (selectedBackground !== 'noise' && selectedBackground !== 'connections') return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let nodes: Array<{ x: number; y: number; vx: number; vy: number }> = []
    
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      }
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    
    // Also resize on container resize
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas()
      if (selectedBackground === 'connections') {
        // Re-initialize connections when resized
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
        // Re-initialize nodes
        nodes.length = 0
        const nodeCount = 15
        for (let i = 0; i < nodeCount; i++) {
          nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5
          })
        }
      }
    })
    
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement)
    }

    if (selectedBackground === 'noise') {
      // Noise texture
      const imageData = ctx.createImageData(canvas.width, canvas.height)
      const data = imageData.data
      
      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255
        const opacity = isDark ? 0.03 : 0.02
        data[i] = value     // R
        data[i + 1] = value // G
        data[i + 2] = value // B
        data[i + 3] = opacity * 255 // A
      }
      
      ctx.putImageData(imageData, 0, 0)
    } else if (selectedBackground === 'connections') {
      // Animated connection lines
      const nodeCount = 15
      
      // Initialize nodes
      nodes.length = 0
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5
        })
      }

      const animate = () => {
        ctx.fillStyle = isDark ? 'rgba(18, 18, 18, 0.1)' : 'rgba(255, 255, 255, 0.1)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Update nodes
        nodes.forEach(node => {
          node.x += node.vx
          node.y += node.vy

          if (node.x < 0 || node.x > canvas.width) node.vx *= -1
          if (node.y < 0 || node.y > canvas.height) node.vy *= -1
        })

        // Draw connections
        const color = isDark ? 'rgba(0, 255, 153, 0.2)' : 'rgba(0, 255, 153, 0.15)'
        ctx.strokeStyle = color
        ctx.lineWidth = 1

        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const dx = nodes[i].x - nodes[j].x
            const dy = nodes[i].y - nodes[j].y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 150) {
              ctx.globalAlpha = (150 - distance) / 150 * 0.3
              ctx.beginPath()
              ctx.moveTo(nodes[i].x, nodes[i].y)
              ctx.lineTo(nodes[j].x, nodes[j].y)
              ctx.stroke()
            }
          }

          // Draw nodes
          ctx.fillStyle = isDark ? 'rgba(0, 255, 153, 0.4)' : 'rgba(0, 255, 153, 0.3)'
          ctx.beginPath()
          ctx.arc(nodes[i].x, nodes[i].y, 2, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.globalAlpha = 1
        animationRef.current = requestAnimationFrame(animate)
      }

      animate()
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      resizeObserver.disconnect()
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [mounted, selectedBackground, isDark])

  const backgrounds: Array<{ id: BackgroundType; name: string; description: string }> = [
    { id: 'particles', name: 'Floating Particles', description: 'Original animated particles rising from bottom' },
    { id: 'gradient-mesh', name: 'Gradient Mesh', description: 'Animated gradient mesh with smooth color transitions' },
    { id: 'animated-grid', name: 'Animated Grid', description: 'Dynamic grid pattern with subtle animations' },
    { id: 'waves', name: 'Wave Animation', description: 'Smooth wave patterns flowing across the screen' },
    { id: 'geometric', name: 'Geometric Shapes', description: 'Animated geometric shapes with green accents' },
    { id: 'noise', name: 'Noise Texture', description: 'Subtle noise texture for depth and texture' },
    { id: 'radial', name: 'Radial Gradient', description: 'Animated radial gradients with green and gold' },
    { id: 'connections', name: 'Connection Lines', description: 'Interactive nodes connected by animated lines' }
  ]

  return (
    <div className="w-full space-y-12">
      <div>
        <h2 className={`text-3xl font-bold mb-2 ${prefix}-text-primary`}>
          Background Experiments
        </h2>
        <p className={`text-base mb-6 ${prefix}-text-secondary`}>
          Explore 8 different background options for the design system
        </p>
      </div>

      {/* Background Selector */}
      <section className="space-y-4">
        <h3 className={`text-xl font-semibold ${prefix}-text-primary`}>
          Select Background Style
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {backgrounds.map((bg) => (
            <button
              key={bg.id}
              onClick={() => setSelectedBackground(bg.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                selectedBackground === bg.id
                  ? `${prefix}-border-green ${prefix}-bg-accent`
                  : `${prefix}-border ${prefix}-card`
              }`}
            >
              <div className={`font-semibold text-sm mb-1 ${prefix}-text-primary`}>
                {bg.name}
              </div>
              <div className={`text-xs ${prefix}-text-secondary`}>
                {bg.description}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Background Preview */}
      <section className="space-y-4">
        <h3 className={`text-xl font-semibold ${prefix}-text-primary`}>
          Preview: {backgrounds.find(bg => bg.id === selectedBackground)?.name}
        </h3>
        <div className="relative h-[600px] rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-700">
          {/* Background Container */}
          <div className="absolute inset-0 z-0">
            {/* Base background color - must be first */}
            <div
              className={`absolute inset-0 ${
                isDark ? 'bg-[#121212]' : 'bg-white'
              }`}
            />
            
            {/* Particles Background */}
            {selectedBackground === 'particles' && mounted && (
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(12)].map((_, i) => {
                  const baseX = (i * 200) % 1200
                  const baseY = 600 + (i * 50)
                  const baseDuration = 4 + (i % 3)
                  const baseDelay = i * 0.5
                  
                  return (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: isDark ? '#10B981' : '#059669',
                        left: `${baseX}px`,
                        top: `${baseY}px`
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{
                        y: -650,
                        scale: [0, 1, 0],
                        opacity: [0, 0.6, 0]
                      }}
                      transition={{
                        duration: baseDuration,
                        repeat: Infinity,
                        delay: baseDelay,
                        ease: "easeOut"
                      }}
                    />
                  )
                })}
              </div>
            )}

            {/* Gradient Mesh Background */}
            {selectedBackground === 'gradient-mesh' && (
              <div className="absolute inset-0">
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: isDark
                      ? 'radial-gradient(circle at 20% 30%, rgba(0, 255, 153, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(226, 195, 118, 0.3) 0%, transparent 50%)'
                      : 'radial-gradient(circle at 20% 30%, rgba(0, 255, 153, 0.25) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(226, 195, 118, 0.2) 0%, transparent 50%)'
                  }}
                  animate={{
                    backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: isDark
                      ? 'radial-gradient(circle at 60% 40%, rgba(0, 255, 153, 0.3) 0%, transparent 50%)'
                      : 'radial-gradient(circle at 60% 40%, rgba(0, 255, 153, 0.2) 0%, transparent 50%)'
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.6, 0.8, 0.6]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
            )}

            {/* Animated Grid Background */}
            {selectedBackground === 'animated-grid' && (
              <div className="absolute inset-0">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `
                      linear-gradient(${isDark ? 'rgba(0, 255, 153, 0.4)' : 'rgba(0, 255, 153, 0.3)'} 1px, transparent 1px),
                      linear-gradient(90deg, ${isDark ? 'rgba(0, 255, 153, 0.4)' : 'rgba(0, 255, 153, 0.3)'} 1px, transparent 1px)
                    `,
                    backgroundSize: '50px 50px'
                  }}
                />
                <motion.div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `
                      linear-gradient(${isDark ? 'rgba(226, 195, 118, 0.3)' : 'rgba(226, 195, 118, 0.25)'} 1px, transparent 1px),
                      linear-gradient(90deg, ${isDark ? 'rgba(226, 195, 118, 0.3)' : 'rgba(226, 195, 118, 0.25)'} 1px, transparent 1px)
                    `,
                    backgroundSize: '100px 100px',
                    backgroundPosition: '0 0'
                  }}
                  animate={{
                    backgroundPosition: ['0 0', '100px 100px', '0 0']
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </div>
            )}

            {/* Waves Background */}
            {selectedBackground === 'waves' && (
              <div className="absolute inset-0 overflow-hidden">
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 600" preserveAspectRatio="none">
                  <motion.path
                    d="M0,300 Q300,200 600,300 T1200,300 L1200,600 L0,600 Z"
                    fill={isDark ? 'rgba(0, 255, 153, 0.2)' : 'rgba(0, 255, 153, 0.15)'}
                    animate={{
                      d: [
                        "M0,300 Q300,200 600,300 T1200,300 L1200,600 L0,600 Z",
                        "M0,300 Q300,400 600,300 T1200,300 L1200,600 L0,600 Z",
                        "M0,300 Q300,200 600,300 T1200,300 L1200,600 L0,600 Z"
                      ]
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.path
                    d="M0,400 Q400,300 800,400 T1200,400 L1200,600 L0,600 Z"
                    fill={isDark ? 'rgba(226, 195, 118, 0.15)' : 'rgba(226, 195, 118, 0.12)'}
                    animate={{
                      d: [
                        "M0,400 Q400,300 800,400 T1200,400 L1200,600 L0,600 Z",
                        "M0,400 Q400,500 800,400 T1200,400 L1200,600 L0,600 Z",
                        "M0,400 Q400,300 800,400 T1200,400 L1200,600 L0,600 Z"
                      ]
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                  />
                </svg>
              </div>
            )}

            {/* Geometric Shapes Background */}
            {selectedBackground === 'geometric' && (
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(8)].map((_, i) => {
                  const shapes = ['circle', 'square', 'triangle']
                  const shape = shapes[i % 3]
                  const size = 40 + (i % 3) * 20
                  const x = (i * 150) % 1200
                  const y = (i * 100) % 600
                  
                  return (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{
                        left: `${x}px`,
                        top: `${y}px`,
                        width: `${size}px`,
                        height: `${size}px`,
                        backgroundColor: isDark ? 'rgba(0, 255, 153, 0.2)' : 'rgba(0, 255, 153, 0.15)',
                        borderRadius: shape === 'circle' ? '50%' : shape === 'triangle' ? '0' : '0',
                        clipPath: shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined
                      }}
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3]
                      }}
                      transition={{
                        duration: 6 + i,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.3
                      }}
                    />
                  )
                })}
              </div>
            )}

            {/* Noise Texture Background */}
            {selectedBackground === 'noise' && (
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
              />
            )}

            {/* Radial Gradient Background */}
            {selectedBackground === 'radial' && (
              <div className="absolute inset-0">
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: isDark
                      ? 'radial-gradient(circle at 30% 40%, rgba(0, 255, 153, 0.3) 0%, transparent 60%), radial-gradient(circle at 70% 60%, rgba(226, 195, 118, 0.25) 0%, transparent 60%)'
                      : 'radial-gradient(circle at 30% 40%, rgba(0, 255, 153, 0.2) 0%, transparent 60%), radial-gradient(circle at 70% 60%, rgba(226, 195, 118, 0.15) 0%, transparent 60%)'
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: isDark
                      ? 'radial-gradient(circle at 50% 50%, rgba(0, 255, 153, 0.2) 0%, transparent 70%)'
                      : 'radial-gradient(circle at 50% 50%, rgba(0, 255, 153, 0.15) 0%, transparent 70%)'
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                />
              </div>
            )}

            {/* Connection Lines Background */}
            {selectedBackground === 'connections' && (
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
              />
            )}
          </div>

          {/* Content overlay to show how content looks on background */}
          <div className="absolute inset-0 z-10 flex items-center justify-center p-8">
            <div className={`max-w-md w-full p-6 rounded-lg ${prefix}-card ${prefix}-shadow-lg`}>
              <h4 className={`text-xl font-bold mb-2 ${prefix}-text-primary`}>
                Sample Content
              </h4>
              <p className={`text-sm mb-4 ${prefix}-text-secondary`}>
                This is how content appears on the {backgrounds.find(bg => bg.id === selectedBackground)?.name.toLowerCase()} background.
              </p>
              <button className={`px-4 py-2 rounded-lg text-sm font-medium ${prefix}-btn-primary`}>
                Example Button
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Background Info */}
      <section className="space-y-4">
        <h3 className={`text-xl font-semibold ${prefix}-text-primary`}>
          Background Details
        </h3>
        <div className={`p-6 rounded-lg ${prefix}-card-secondary`}>
          <div className={`text-sm space-y-2 ${prefix}-text-secondary`}>
            <p>
              <strong className={prefix + '-text-primary'}>Current:</strong> {backgrounds.find(bg => bg.id === selectedBackground)?.name}
            </p>
            <p>
              <strong className={prefix + '-text-primary'}>Description:</strong> {backgrounds.find(bg => bg.id === selectedBackground)?.description}
            </p>
            <p>
              <strong className={prefix + '-text-primary'}>Theme:</strong> {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

