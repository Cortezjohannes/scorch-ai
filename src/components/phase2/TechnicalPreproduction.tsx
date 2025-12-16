'use client'

import { motion } from '@/components/ui/ClientMotion'

interface TechnicalPreproductionProps {
  shotList: Array<{
    scene: string
    shots: Array<{
      number: string
      description: string
      duration: string
      camera: string
      notes?: string
    }>
  }>
  equipment: Array<{
    category: string
    items: Array<{
      name: string
      specs: string
      quantity: number
    }>
  }>
  technical: {
    lighting: string[]
    sound: string[]
    setup: string[]
  }
  vfx: Array<{
    scene: string
    description: string
    requirements: string[]
    complexity: 'Low' | 'Medium' | 'High'
  }>
}

export function TechnicalPreproduction({
  shotList,
  equipment,
  technical,
  vfx,
}: TechnicalPreproductionProps) {
  const getComplexityColor = (complexity: 'Low' | 'Medium' | 'High') => {
    switch (complexity) {
      case 'Low':
        return 'bg-green-500/20 text-green-500'
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-500'
      case 'High':
        return 'bg-red-500/20 text-red-500'
      default:
        return 'bg-gray-500/20 text-gray-500'
    }
  }

  return (
    <div className="space-y-8 pre-production-doc technical-doc">
      {/* Shot List Section */}
      <section>
        <h2>Shot List</h2>
        <div className="space-y-6">
          {shotList.map((scene, sceneIndex) => (
            <motion.div
              key={sceneIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: sceneIndex * 0.1 }}
              className="card"
            >
              <h3>{scene.scene}</h3>
              <div className="mt-4 space-y-4">
                {scene.shots.map((shot, shotIndex) => (
                  <div key={shotIndex} className="p-4 bg-[#e2c37610] rounded-lg">
                    <div className="flex flex-wrap items-baseline gap-4">
                      <h4>Shot {shot.number}</h4>
                      <span className="text-[#e2c376]">{shot.duration}</span>
                    </div>
                    <p className="mt-2">{shot.description}</p>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm">
                      <span className="px-3 py-1 rounded-full bg-[#e2c37620]">
                        {shot.camera}
                      </span>
                      {shot.notes && (
                        <span className="px-3 py-1 rounded-full bg-[#e2c37620]">
                          {shot.notes}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Equipment Section */}
      <section>
        <h2>Equipment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {equipment.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="card"
            >
              <h3>{category.category}</h3>
              <div className="mt-4 space-y-4">
                {category.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="p-4 bg-[#e2c37610] rounded-lg space-y-2"
                  >
                    <div className="flex items-baseline justify-between">
                      <h4>{item.name}</h4>
                      <span className="text-[#e2c376]">×{item.quantity}</span>
                    </div>
                    <p className="text-sm">{item.specs}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Technical Requirements Section */}
      <section>
        <h2>Technical Requirements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lighting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="card"
          >
            <h3>Lighting</h3>
            <ul className="mt-4 space-y-2">
              {technical.lighting.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#e2c376]">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Sound */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="card"
          >
            <h3>Sound</h3>
            <ul className="mt-4 space-y-2">
              {technical.sound.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#e2c376]">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Setup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="card"
          >
            <h3>Setup</h3>
            <ul className="mt-4 space-y-2">
              {technical.setup.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#e2c376]">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* VFX Section */}
      <section>
        <h2>Visual Effects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vfx.map((effect, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="card"
            >
              <div className="flex flex-wrap items-baseline gap-4">
                <h3>{effect.scene}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getComplexityColor(
                    effect.complexity
                  )}`}
                >
                  {effect.complexity} Complexity
                </span>
              </div>
              <p className="mt-4">{effect.description}</p>
              <div className="mt-4">
                <h4 className="mb-2">Requirements</h4>
                <ul className="space-y-2">
                  {effect.requirements.map((req, reqIndex) => (
                    <li key={reqIndex} className="flex items-start gap-2">
                      <span className="text-[#e2c376]">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
} 