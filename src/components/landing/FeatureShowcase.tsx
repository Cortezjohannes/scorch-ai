'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { ContentSection } from '@/components/layout/ContentSection'

const features = [
  {
    icon: '🎭',
    title: 'AI Story Development',
    description: 'Transform simple ideas into complex, multi-layered narratives with professional story structure.',
    benefits: ['Character arcs', 'Plot development', 'World building']
  },
  {
    icon: '🎬',
    title: 'Pre-Production Planning',
    description: 'Complete technical preparation from script breakdown to casting requirements.',
    benefits: ['Script analysis', 'Resource planning', 'Timeline management']
  },
  {
    icon: '🎞️',
    title: 'Post-Production Tools',
    description: 'Professional editing, effects, and distribution planning for your content.',
    benefits: ['Video editing', 'Effect templates', 'Distribution strategy']
  }
]

export function FeatureShowcase() {
  return (
    <ContentSection
      title="Everything You Need to Create"
      subtitle="From initial idea to final distribution, Scorched AI provides the complete toolkit for modern content creation."
      variant="featured"
    >
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            viewport={{ once: true }}
          >
            <Card variant="content" className="h-full text-center p-6">
              <div className="text-4xl mb-4">{feature.icon}</div>
              
              <h3 className="text-h3 text-high-contrast mb-3 elegant-fire">
                {feature.title}
              </h3>
              
              <p className="text-body text-medium-contrast mb-4">
                {feature.description}
              </p>
              
              <ul className="space-y-2">
                {feature.benefits.map((benefit) => (
                  <li 
                    key={benefit}
                    className="text-caption text-ember-gold flex items-center justify-center gap-2"
                  >
                    <span>🔥</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        ))}
      </div>
    </ContentSection>
  )
}
