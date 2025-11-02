'use client'

import { motion } from 'framer-motion'

interface ProductionPlanningProps {
  budget: {
    total: number
    breakdown: Array<{
      category: string
      amount: number
      details: string
    }>
  }
  schedule: {
    startDate: string
    endDate: string
    phases: Array<{
      name: string
      duration: string
      tasks: string[]
    }>
  }
  resources: {
    crew: Array<{
      role: string
      count: number
      responsibilities: string[]
    }>
    equipment: Array<{
      category: string
      items: string[]
    }>
  }
  riskAssessment: Array<{
    risk: string
    impact: 'Low' | 'Medium' | 'High'
    mitigation: string
  }>
}

export function ProductionPlanning({
  budget,
  schedule,
  resources,
  riskAssessment,
}: ProductionPlanningProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount)
  }

  const getImpactColor = (impact: 'Low' | 'Medium' | 'High') => {
    switch (impact) {
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
    <div className="space-y-8 pre-production-doc">
      {/* Budget Section */}
      <section>
        <h2>Budget</h2>
        <div className="space-y-6">
          <div className="card">
            <h3>Total Budget</h3>
            <p className="text-2xl font-bold text-[#e2c376]">
              {formatCurrency(budget.total)}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budget.breakdown.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="card"
              >
                <h3>{item.category}</h3>
                <p className="text-xl font-semibold text-[#e2c376]">
                  {formatCurrency(item.amount)}
                </p>
                <p className="mt-2">{item.details}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section>
        <h2>Schedule</h2>
        <div className="space-y-6">
          <div className="card">
            <div className="flex flex-wrap gap-6">
              <div>
                <h3>Start Date</h3>
                <p>{new Date(schedule.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <h3>End Date</h3>
                <p>{new Date(schedule.endDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {schedule.phases.map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="card"
              >
                <div className="flex flex-wrap items-baseline gap-4">
                  <h3>{phase.name}</h3>
                  <span className="text-[#e2c376]">{phase.duration}</span>
                </div>
                <ul className="mt-4 space-y-2">
                  {phase.tasks.map((task, taskIndex) => (
                    <li key={taskIndex} className="flex items-start gap-2">
                      <span className="text-[#e2c376]">•</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section>
        <h2>Resources</h2>
        <div className="space-y-6">
          {/* Crew */}
          <div>
            <h3>Crew Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.crew.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="card"
                >
                  <div className="flex items-baseline gap-2">
                    <h4>{member.role}</h4>
                    <span className="text-[#e2c376]">×{member.count}</span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {member.responsibilities.map((resp, respIndex) => (
                      <li key={respIndex} className="flex items-start gap-2">
                        <span className="text-[#e2c376]">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div>
            <h3>Equipment Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resources.equipment.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="card"
                >
                  <h4>{category.category}</h4>
                  <ul className="mt-4 space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2">
                        <span className="text-[#e2c376]">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Risk Assessment Section */}
      <section>
        <h2>Risk Assessment</h2>
        <div className="grid grid-cols-1 gap-6">
          {riskAssessment.map((risk, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="card"
            >
              <div className="flex flex-wrap items-baseline gap-4">
                <h3>{risk.risk}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getImpactColor(
                    risk.impact
                  )}`}
                >
                  {risk.impact} Impact
                </span>
              </div>
              <p className="mt-4">{risk.mitigation}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
} 