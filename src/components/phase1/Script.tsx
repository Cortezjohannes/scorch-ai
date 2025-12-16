'use client'

import { motion } from '@/components/ui/ClientMotion'

interface ScriptProps {
  scenes: Array<{
    title: string
    location: string
    time: string
    description: string
    imageUrl: string
  }>
  dialogues: Array<{
    character: string
    lines: Array<{
      text: string
      emotion: string
      direction?: string
    }>
    imageUrl: string
  }>
  directions: Array<{
    type: string
    description: string
    notes: string
    imageUrl: string
  }>
}

export function Script({
  scenes,
  dialogues,
  directions,
}: ScriptProps) {
  return (
    <div className="space-y-6 sm:space-y-8 pre-production-doc">
      {/* Scenes Section */}
      <section>
        <h2 className="text-xl sm:text-2xl mb-3 sm:mb-4">Scenes</h2>
        <div className="space-y-4 sm:space-y-6">
          {scenes.map((scene, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="card p-4 sm:p-6"
            >
              <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <h3 className="text-lg sm:text-xl break-words">{scene.title}</h3>
                  <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-[#e7e7e7]/70 mt-2 mb-3 sm:mb-4">
                    <span>{scene.location}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{scene.time}</span>
                  </div>
                  <p className="text-sm sm:text-base">{scene.description}</p>
                </div>
                <div>
                  <img
                    src={scene.imageUrl}
                    alt={scene.title}
                    className="w-full h-32 sm:h-48 object-cover rounded-lg sm:rounded-xl"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Dialogues Section */}
      <section>
        <h2 className="text-xl sm:text-2xl mb-3 sm:mb-4">Dialogues</h2>
        <div className="space-y-4 sm:space-y-6">
          {dialogues.map((dialogue, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="card p-4 sm:p-6"
            >
              <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-lg sm:text-xl break-words">{dialogue.character}</h3>
                  <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                    {dialogue.lines.map((line, lineIndex) => (
                      <div key={lineIndex} className="pl-3 sm:pl-4 border-l-2 border-[#e2c37640]">
                        <p className="mb-2 text-sm sm:text-base">{line.text}</p>
                        <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-[#e7e7e7]/70">
                          <span>{line.emotion}</span>
                          {line.direction && (
                            <>
                              <span className="hidden sm:inline">•</span>
                              <span>{line.direction}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="order-first md:order-last mb-3 md:mb-0">
                  <img
                    src={dialogue.imageUrl}
                    alt={dialogue.character}
                    className="w-full h-32 sm:h-48 object-cover rounded-lg sm:rounded-xl"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Directions Section */}
      <section>
        <h2 className="text-xl sm:text-2xl mb-3 sm:mb-4">Directions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {directions.map((direction, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="card p-4 sm:p-6"
            >
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h3 className="text-lg sm:text-xl break-words">{direction.type}</h3>
                  <p className="mt-2 text-sm sm:text-base">{direction.description}</p>
                </div>
                <img
                  src={direction.imageUrl}
                  alt={direction.type}
                  className="w-full h-24 sm:h-32 object-cover rounded-lg sm:rounded-xl"
                />
                <p className="text-xs sm:text-sm text-[#e7e7e7]/70">{direction.notes}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
} 