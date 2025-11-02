'use client'

import { motion } from 'framer-motion'

interface NarrativeProps {
  overview: {
    summary: string
    imageUrl: string
  }
  plotPoints: Array<{
    title: string
    description: string
    imageUrl: string
  }>
  characters: Array<{
    name: string
    description: string
    imageUrl: string
  }>
  themes: Array<{
    name: string
    description: string
    imageUrl: string
  }>
}

export function Narrative({
  overview,
  plotPoints,
  characters,
  themes,
}: NarrativeProps) {
  return (
    <div className="space-y-8 pre-production-doc">
      {/* Overview Section */}
      <section>
        <h2>Overview</h2>
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-lg">{overview.summary}</p>
            </div>
            <div>
              <img
                src={overview.imageUrl}
                alt="Story Overview"
                className="w-full h-64 object-cover rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Plot Points Section */}
      <section>
        <h2>Plot Points</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plotPoints.map((point, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="card"
            >
              <h3>{point.title}</h3>
              <p className="mt-2 mb-4">{point.description}</p>
              <img
                src={point.imageUrl}
                alt={point.title}
                className="w-full h-48 object-cover rounded-xl"
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Characters Section */}
      <section>
        <h2>Characters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {characters.map((character, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="card"
            >
              <img
                src={character.imageUrl}
                alt={character.name}
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <h3>{character.name}</h3>
              <p className="mt-2">{character.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Themes Section */}
      <section>
        <h2>Themes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {themes.map((theme, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="card"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3>{theme.name}</h3>
                  <p className="mt-2">{theme.description}</p>
                </div>
                <div>
                  <img
                    src={theme.imageUrl}
                    alt={theme.name}
                    className="w-full h-32 object-cover rounded-xl"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
} 