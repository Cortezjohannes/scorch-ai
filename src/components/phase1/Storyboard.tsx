'use client'

import { motion } from 'framer-motion'

interface StoryboardProps {
  scenes: Array<{
    title: string
    description: string
    shots: Array<{
      description: string
      imageUrl: string
      notes?: string
    }>
  }>
  visualStyle: {
    description: string
    moodboard: Array<{
      imageUrl: string
      description: string
    }>
  }
  transitions: Array<{
    from: string
    to: string
    description: string
    imageUrl: string
  }>
}

export function Storyboard({
  scenes,
  visualStyle,
  transitions,
}: StoryboardProps) {
  return (
    <div className="space-y-8 pre-production-doc">
      {/* Visual Style Section */}
      <section>
        <h2>Visual Style</h2>
        <div className="card">
          <p className="text-lg mb-6">{visualStyle.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visualStyle.moodboard.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <img
                  src={item.imageUrl}
                  alt={item.description}
                  className="w-full h-48 object-cover rounded-xl mb-2"
                />
                <p className="text-sm text-[#e7e7e7]/70">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Scenes Section */}
      <section>
        <h2>Scenes</h2>
        <div className="space-y-6">
          {scenes.map((scene, sceneIndex) => (
            <motion.div
              key={sceneIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: sceneIndex * 0.1 }}
              className="card"
            >
              <h3>{scene.title}</h3>
              <p className="mt-2 mb-6">{scene.description}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scene.shots.map((shot, shotIndex) => (
                  <motion.div
                    key={shotIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: shotIndex * 0.05 }}
                  >
                    <img
                      src={shot.imageUrl}
                      alt={shot.description}
                      className="w-full h-48 object-cover rounded-xl mb-2"
                    />
                    <p className="text-sm mb-2">{shot.description}</p>
                    {shot.notes && (
                      <p className="text-sm text-[#e7e7e7]/70">{shot.notes}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Transitions Section */}
      <section>
        <h2>Transitions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {transitions.map((transition, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="card"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[#e2c376]">{transition.from}</span>
                <span className="text-[#e7e7e7]/50">→</span>
                <span className="text-[#e2c376]">{transition.to}</span>
              </div>
              <p className="mb-4">{transition.description}</p>
              <img
                src={transition.imageUrl}
                alt={`Transition from ${transition.from} to ${transition.to}`}
                className="w-full h-32 object-cover rounded-xl"
              />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
} 