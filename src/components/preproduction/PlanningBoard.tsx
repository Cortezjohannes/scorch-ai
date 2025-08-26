'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'

interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignee?: string
  dueDate?: string
  category: string
  estimatedHours?: number
  dependencies?: string[]
  tags?: string[]
  progress?: number
  notes?: string
}

interface BoardColumn {
  id: string
  title: string
  color: string
  tasks: Task[]
  maxTasks?: number
}

export function PlanningBoard({ projectData, onUpdate }: { 
  projectData: any
  onUpdate: (data: any) => void 
}) {
  // Initialize tasks from existing project data
  const initializeTasksFromProject = (data: any): Task[] => {
    const tasks: Task[] = []
    
    // Generate tasks based on existing project content
    if (!data?.script?.elements?.length) {
      tasks.push({
        id: 'script-1',
        title: 'Complete Script Breakdown',
        description: 'Analyze script for technical requirements and scene breakdown',
        priority: 'high',
        category: 'Script',
        estimatedHours: 8,
        assignee: 'Script Supervisor'
      })
    }

    if (!data?.storyboard?.shots?.length) {
      tasks.push({
        id: 'storyboard-1',
        title: 'Create Storyboard',
        description: 'Develop visual shot planning and camera movements',
        priority: 'high',
        category: 'Storyboard',
        estimatedHours: 12,
        dependencies: ['script-1']
      })
    }

    if (!data?.casting?.characters?.length) {
      tasks.push({
        id: 'casting-1',
        title: 'Casting Director Meeting',
        description: 'Finalize casting requirements and schedule auditions',
        priority: 'high',
        category: 'Casting',
        estimatedHours: 6,
        assignee: 'Casting Director'
      })
    }

    if (!data?.location?.locations?.length) {
      tasks.push({
        id: 'location-1',
        title: 'Location Scouting',
        description: 'Find and secure filming locations',
        priority: 'medium',
        category: 'Locations',
        estimatedHours: 16,
        assignee: 'Location Manager'
      })
    }

    if (!data?.production?.equipment?.length) {
      tasks.push({
        id: 'equipment-1',
        title: 'Equipment Planning',
        description: 'Create comprehensive equipment list and booking schedule',
        priority: 'medium',
        category: 'Equipment',
        estimatedHours: 8
      })
    }

    // Add general pre-production tasks
    tasks.push(
      {
        id: 'budget-1',
        title: 'Budget Approval',
        description: 'Finalize budget breakdown and get stakeholder approval',
        priority: 'critical',
        category: 'Budget',
        estimatedHours: 4,
        assignee: 'Producer'
      },
      {
        id: 'permits-1',
        title: 'Filming Permits',
        description: 'Obtain necessary permits for location filming',
        priority: 'medium',
        category: 'Legal',
        estimatedHours: 6,
        dependencies: ['location-1']
      },
      {
        id: 'schedule-1',
        title: 'Production Schedule',
        description: 'Create detailed shooting schedule with all departments',
        priority: 'high',
        category: 'Scheduling',
        estimatedHours: 10,
        dependencies: ['casting-1', 'location-1']
      },
      {
        id: 'insurance-1',
        title: 'Production Insurance',
        description: 'Secure production insurance and liability coverage',
        priority: 'medium',
        category: 'Legal',
        estimatedHours: 4
      }
    )

    return tasks
  }

  const [columns, setColumns] = useState<BoardColumn[]>(() => {
    const initialTasks = initializeTasksFromProject(projectData)
    
    return [
      {
        id: 'backlog',
        title: 'Backlog',
        color: 'border-gray-500',
        tasks: initialTasks.filter(task => ['script-1', 'casting-1', 'budget-1'].includes(task.id))
      },
      {
        id: 'todo',
        title: 'To Do',
        color: 'border-blue-400',
        tasks: initialTasks.filter(task => ['storyboard-1', 'location-1', 'equipment-1'].includes(task.id))
      },
      {
        id: 'in-progress',
        title: 'In Progress',
        color: 'border-yellow-400',
        tasks: initialTasks.filter(task => ['permits-1'].includes(task.id)),
        maxTasks: 3
      },
      {
        id: 'review',
        title: 'Review',
        color: 'border-purple-400',
        tasks: initialTasks.filter(task => ['schedule-1'].includes(task.id))
      },
      {
        id: 'complete',
        title: 'Complete',
        color: 'border-green-400',
        tasks: initialTasks.filter(task => ['insurance-1'].includes(task.id))
      }
    ]
  })

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [draggedTask, setDraggedTask] = useState<string | null>(null)

  // Calculate board statistics
  const totalTasks = columns.reduce((sum, col) => sum + col.tasks.length, 0)
  const completedTasks = columns.find(col => col.id === 'complete')?.tasks.length || 0
  const inProgressTasks = columns.find(col => col.id === 'in-progress')?.tasks.length || 0
  const blockedTasks = columns.flatMap(col => col.tasks).filter(task => task.priority === 'critical').length

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setShowTaskModal(true)
  }

  const handleTaskMove = (taskId: string, newColumnId: string) => {
    setColumns(prevColumns => {
      const newColumns = [...prevColumns]
      
      // Find and remove task from current column
      let movedTask: Task | null = null
      newColumns.forEach(column => {
        const taskIndex = column.tasks.findIndex(task => task.id === taskId)
        if (taskIndex !== -1) {
          movedTask = column.tasks.splice(taskIndex, 1)[0]
        }
      })
      
      // Add task to new column
      if (movedTask) {
        const targetColumn = newColumns.find(col => col.id === newColumnId)
        if (targetColumn) {
          // Check for max tasks limit
          if (targetColumn.maxTasks && targetColumn.tasks.length >= targetColumn.maxTasks) {
            // Don't move if at limit
            // Re-add to original column
            const originalColumn = prevColumns.find(col => 
              col.tasks.some(task => task.id === taskId)
            )
            if (originalColumn) {
              const origCol = newColumns.find(col => col.id === originalColumn.id)
              if (origCol) {
                origCol.tasks.push(movedTask)
              }
            }
            return newColumns
          }
          
          targetColumn.tasks.push(movedTask)
        }
      }
      
      return newColumns
    })
  }

  const handleCreateTask = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: taskData.title || 'New Task',
      description: taskData.description || '',
      priority: taskData.priority || 'medium',
      category: taskData.category || 'General',
      estimatedHours: taskData.estimatedHours || 1,
      assignee: taskData.assignee,
      tags: taskData.tags || []
    }

    setColumns(prevColumns => {
      const newColumns = [...prevColumns]
      const backlogColumn = newColumns.find(col => col.id === 'backlog')
      if (backlogColumn) {
        backlogColumn.tasks.push(newTask)
      }
      return newColumns
    })
  }

  return (
    <div className="space-y-6">
      {/* Board Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-h2 font-bold text-high-contrast elegant-fire">Planning Board</h2>
          <p className="text-body text-medium-contrast">
            Manage tasks and track progress through pre-production workflow
          </p>
        </div>
        
        <button 
          className="burn-button px-6 py-3 text-body touch-target-comfortable"
          onClick={() => {
            setSelectedTask(null)
            setShowTaskModal(true)
          }}
        >
          ✨ Add Task
        </button>
      </div>

      {/* Board Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="status" className="text-center p-4">
          <div className="text-2xl mb-2">📋</div>
          <div className="text-h3 text-ember-gold font-bold">{totalTasks}</div>
          <div className="text-caption text-medium-contrast">Total Tasks</div>
        </Card>
        
        <Card variant="status" className="text-center p-4">
          <div className="text-2xl mb-2">🚀</div>
          <div className="text-h3 text-yellow-400 font-bold">{inProgressTasks}</div>
          <div className="text-caption text-medium-contrast">In Progress</div>
        </Card>
        
        <Card variant="status" className="text-center p-4">
          <div className="text-2xl mb-2">✅</div>
          <div className="text-h3 text-green-400 font-bold">{completedTasks}</div>
          <div className="text-caption text-medium-contrast">Completed</div>
        </Card>
        
        <Card variant="status" className="text-center p-4">
          <div className="text-2xl mb-2">🚨</div>
          <div className="text-h3 text-red-400 font-bold">{blockedTasks}</div>
          <div className="text-caption text-medium-contrast">Critical</div>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 overflow-x-auto">
        {columns.map((column) => (
          <BoardColumn
            key={column.id}
            column={column}
            onTaskClick={handleTaskClick}
            onTaskMove={handleTaskMove}
            draggedTask={draggedTask}
            setDraggedTask={setDraggedTask}
          />
        ))}
      </div>

      {/* Task Modal */}
      <AnimatePresence>
        {showTaskModal && (
          <TaskModal
            task={selectedTask}
            onClose={() => {
              setShowTaskModal(false)
              setSelectedTask(null)
            }}
            onSave={(taskData) => {
              if (selectedTask) {
                // Update existing task
                setColumns(prevColumns => {
                  const newColumns = [...prevColumns]
                  newColumns.forEach(column => {
                    const taskIndex = column.tasks.findIndex(t => t.id === selectedTask.id)
                    if (taskIndex !== -1) {
                      column.tasks[taskIndex] = { ...selectedTask, ...taskData }
                    }
                  })
                  return newColumns
                })
              } else {
                // Create new task
                handleCreateTask(taskData)
              }
              setShowTaskModal(false)
              setSelectedTask(null)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function BoardColumn({ 
  column, 
  onTaskClick, 
  onTaskMove,
  draggedTask,
  setDraggedTask
}: { 
  column: BoardColumn
  onTaskClick: (task: Task) => void
  onTaskMove: (taskId: string, columnId: string) => void
  draggedTask: string | null
  setDraggedTask: (taskId: string | null) => void
}) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (draggedTask) {
      onTaskMove(draggedTask, column.id)
      setDraggedTask(null)
    }
  }

  const isAtLimit = column.maxTasks && column.tasks.length >= column.maxTasks

  return (
    <div 
      className={`
        border-2 border-dashed rounded-lg p-4 min-h-96 transition-all
        ${column.color}
        ${isDragOver ? 'bg-ember-gold/10 border-ember-gold' : ''}
        ${isAtLimit ? 'opacity-60' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-high-contrast text-body elegant-fire">{column.title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-caption text-medium-contrast bg-white/10 px-2 py-1 rounded">
            {column.tasks.length}
            {column.maxTasks && `/${column.maxTasks}`}
          </span>
          {isAtLimit && (
            <span className="text-xs text-yellow-400">⚠️</span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {column.tasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            layout
          >
            <TaskCard 
              task={task} 
              onClick={() => onTaskClick(task)}
              onDragStart={() => setDraggedTask(task.id)}
              onDragEnd={() => setDraggedTask(null)}
              isDragged={draggedTask === task.id}
            />
          </motion.div>
        ))}
        
        {column.tasks.length === 0 && (
          <div className="text-center py-8 text-medium-contrast">
            <div className="text-2xl mb-2">📝</div>
            <p className="text-caption">No tasks yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

function TaskCard({ 
  task, 
  onClick, 
  onDragStart,
  onDragEnd,
  isDragged
}: { 
  task: Task
  onClick: () => void
  onDragStart: () => void
  onDragEnd: () => void
  isDragged: boolean
}) {
  const priorityColors = {
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30'
  }

  const categoryColors = {
    'Script': '📝',
    'Storyboard': '🎬',
    'Casting': '🎭',
    'Locations': '📍',
    'Equipment': '📹',
    'Budget': '💰',
    'Legal': '📋',
    'Scheduling': '📅',
    'General': '📌'
  }

  return (
    <motion.div
      className={`
        cursor-move touch-target-comfortable transition-all duration-200
        ${isDragged ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
      `}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        variant="content" 
        className="cursor-pointer hover:border-ember-gold/50 transition-all p-4"
        onClick={onClick}
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-high-contrast text-body leading-tight flex-1 mr-2">
              {task.title}
            </h4>
            <span className={`
              px-2 py-1 text-xs rounded-full border shrink-0
              ${priorityColors[task.priority]}
            `}>
              {task.priority}
            </span>
          </div>

          <p className="text-medium-contrast text-caption leading-relaxed">
            {task.description}
          </p>

          <div className="flex items-center justify-between text-caption">
            <div className="flex items-center gap-2">
              <span>{categoryColors[task.category as keyof typeof categoryColors] || '📌'}</span>
              <span className="text-ember-gold">{task.category}</span>
            </div>
            {task.estimatedHours && (
              <span className="text-medium-contrast">
                {task.estimatedHours}h
              </span>
            )}
          </div>

          {task.assignee && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-ember-gold/20 rounded-full flex items-center justify-center">
                <span className="text-xs text-ember-gold">
                  {task.assignee.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <span className="text-medium-contrast text-caption">{task.assignee}</span>
            </div>
          )}

          {task.dependencies && task.dependencies.length > 0 && (
            <div className="flex items-center gap-1 text-caption">
              <span className="text-yellow-400">🔗</span>
              <span className="text-medium-contrast">
                Depends on {task.dependencies.length} task{task.dependencies.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {task.progress !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between text-caption">
                <span className="text-medium-contrast">Progress</span>
                <span className="text-ember-gold">{task.progress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div 
                  className="bg-ember-gold h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

function TaskModal({ 
  task, 
  onClose, 
  onSave 
}: { 
  task: Task | null
  onClose: () => void
  onSave: (task: Partial<Task>) => void
}) {
  const [formData, setFormData] = useState<Partial<Task>>(
    task || {
      title: '',
      description: '',
      priority: 'medium',
      category: 'General',
      estimatedHours: 1,
      assignee: '',
      progress: 0
    }
  )

  const categories = ['Script', 'Storyboard', 'Casting', 'Locations', 'Equipment', 'Budget', 'Legal', 'Scheduling', 'General']
  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-400' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-400' },
    { value: 'high', label: 'High', color: 'text-orange-400' },
    { value: 'critical', label: 'Critical', color: 'text-red-400' }
  ]

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-black/90 border border-ember-gold/30 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h2 font-bold text-high-contrast elegant-fire">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-medium-contrast hover:text-high-contrast transition-colors touch-target"
          >
            ✕
          </button>
        </div>

        <form className="space-y-6" onSubmit={(e) => {
          e.preventDefault()
          onSave(formData)
        }}>
          <div>
            <label className="block text-ember-gold text-caption font-medium mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-high-contrast placeholder-medium-contrast focus:border-ember-gold focus:outline-none transition-colors"
              placeholder="Enter task title..."
              required
            />
          </div>

          <div>
            <label className="block text-ember-gold text-caption font-medium mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-high-contrast placeholder-medium-contrast focus:border-ember-gold focus:outline-none transition-colors h-24 resize-none"
              placeholder="Describe the task..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-ember-gold text-caption font-medium mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-high-contrast focus:border-ember-gold focus:outline-none transition-colors"
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-ember-gold text-caption font-medium mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-high-contrast focus:border-ember-gold focus:outline-none transition-colors"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-ember-gold text-caption font-medium mb-2">
                Assignee
              </label>
              <input
                type="text"
                value={formData.assignee || ''}
                onChange={(e) => setFormData({...formData, assignee: e.target.value})}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-high-contrast placeholder-medium-contrast focus:border-ember-gold focus:outline-none transition-colors"
                placeholder="Assign to..."
              />
            </div>

            <div>
              <label className="block text-ember-gold text-caption font-medium mb-2">
                Estimated Hours
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.estimatedHours || 1}
                onChange={(e) => setFormData({...formData, estimatedHours: parseInt(e.target.value)})}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-high-contrast focus:border-ember-gold focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-medium-contrast hover:text-high-contrast transition-colors touch-target"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="burn-button px-6 py-3 touch-target"
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
