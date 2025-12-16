'use client'

import { motion } from '@/components/ui/ClientMotion'

interface VisualDevelopmentProps {
  conceptArt: {
    description: string
    imageUrl: string
  }
  styleGuide: {
    colorPalette: string[]
    moodDescription: string
    imageUrl: string
  }
  locations: Array<{
    name: string
    description: string
    imageUrl: string
  }>
  costumes: Array<{
    character: string
    description: string
    imageUrl: string
  }>
}

export function VisualDevelopment({
  conceptArt,
  styleGuide,
  locations,
  costumes,
}: VisualDevelopmentProps) {
  return (
    <div className="space-y-8 pre-production-doc">
      {/* Concept Art Section */}
      <section>
        <h2>Concept Art</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p>{conceptArt.description}</p>
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden">
            <img
              src={conceptArt.imageUrl}
              alt="Concept Art"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Style Guide Section */}
      <section>
        <h2>Style Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3>Color Palette</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {styleGuide.colorPalette.map((color, index) => (
                  <div
                    key={index}
                    className="w-12 h-12 rounded-lg shadow-lg"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
            <div>
              <h3>Mood</h3>
              <p>{styleGuide.moodDescription}</p>
            </div>
          </div>
          <div className="relative aspect-video rounded-xl overflow-hidden">
            <img
              src={styleGuide.imageUrl}
              alt="Style Reference"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Locations Section */}
      <section>
        <h2>Locations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {locations.map((location, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="card"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
                <img
                  src={location.imageUrl}
                  alt={location.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <h3>{location.name}</h3>
              <p>{location.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Costumes Section */}
      <section>
        <h2>Costumes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {costumes.map((costume, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="card"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
                <img
                  src={costume.imageUrl}
                  alt={`${costume.character} Costume`}
                  className="object-cover w-full h-full"
                />
              </div>
              <h3>{costume.character}</h3>
              <p>{costume.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
} 