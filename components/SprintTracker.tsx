'use client'
import { useState } from 'react'
import { useDashboard } from '@/lib/useDashboard'
import { generateId, formatDate } from '@/lib/utils'
import { Sprint, SprintGoal } from '@/lib/types'

const CATEGORIES = ['Spirituality', 'Business', 'Personal Development', 'Health'] as const

export default function SprintTracker() {
  const { data, update } = useDashboard()
  const sprints = data.sprints || []
  const activeSprint = sprints[sprints.length - 1] || null
  const [adding, setAdding] = useState(false)
  const [newGoal, setNewGoal] = useState({ text: '', category: 'Business' as const })
  const [sprintTitle, setSprintTitle] = useState('')

  const createSprint = () => {
    const start = new Date()
    const end = new Date()
    end.setDate(end.getDate() + 90)
    const sprint: Sprint = {
      id: generateId(),
      sprintKey: `sprint-${formatDate(start)}`,
      startDate: formatDate(start),
      endDate: formatDate(end),
      title: sprintTitle || '90-Day Sprint',
      goals: [],
    }
    update({ sprints: [...sprints, sprint] })
    setSprintTitle('')
    setAdding(false)
  }

  const addGoal = () => {
    if (!newGoal.text || !activeSprint) return
    const goal: SprintGoal = {
      id: generateId(),
      sprintKey: activeSprint.sprintKey,
      category: newGoal.category,
      text: newGoal.text,
      completed: false,
    }
    const updated = sprints.map(s =>
      s.id === activeSprint.id
        ? { ...s, goals: [...s.goals, goal] }
        : s
    )
    update({ sprints: updated })
    setNewGoal({ text: '', category: 'Business' })
  }

  const toggleGoal = (goalId: string) => {
    const updated = sprints.map(s =>
      s.id === activeSprint?.id
        ? {
            ...s,
            goals: s.goals.map(g =>
              g.id === goalId ? { ...g, completed: !g.completed } : g
            ),
          }
        : s
    )
    update({ sprints: updated })
  }

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate)
    const today = new Date()
    const diff = end.getTime() - today.getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  const completedCount = activeSprint?.goals.filter(g => g.completed).length || 0
  const totalCount = activeSprint?.goals.length || 0
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-sand/30">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-deeper">90-Day Sprint 🚀</h2>
          <p className="text-sm text-warm">12 Week Year</p>
        </div>
        {activeSprint && (
          <div className="text-right">
            <div className="text-xl font-light text-moss">
              {getDaysLeft(activeSprint.endDate)}
            </div>
            <div className="text-xs text-warm">days left</div>
          </div>
        )}
      </div>

      {!activeSprint ? (
        <div>
          {adding ? (
            <div className="space-y-3">
              <input
                placeholder="Sprint title (e.g. Q3 Growth Sprint)"
                className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-cream/50"
                value={sprintTitle}
                onChange={e => setSprintTitle(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={createSprint}
                  className="flex-1 bg-deeper text-white rounded-lg py-2 text-sm"
                >Start Sprint</button>
                <button
                  onClick={() => setAdding(false)}
                  className="flex-1 bg-cream text-warm rounded-lg py-2 text-sm border border-sand/30"
                >Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="w-full border border-dashed border-sand rounded-xl py-6 text-sm text-warm hover:bg-cream/50 transition-all"
            >+ Start Your 90-Day Sprint</button>
          )}
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <div className="flex justify-between text-xs text-warm mb-1">
              <span>{activeSprint.title}</span>
              <span>{completedCount}/{totalCount} goals</span>
            </div>
            <div className="w-full bg-cream rounded-full h-2">
              <div
                className="bg-moss h-2 rounded-full transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          {CATEGORIES.map(cat => {
            const goals = activeSprint.goals.filter(g => g.category === cat)
            if (goals.length === 0) return null
            return (
              <div key={cat} className="mb-4">
                <h3 className="text-xs font-semibold text-warm uppercase tracking-wide mb-2">
                  {cat}
                </h3>
                <div className="space-y-2">
                  {goals.map(goal => (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                        goal.completed
                          ? 'bg-moss/10 border border-moss/30'
                          : 'bg-cream/50 border border-sand/20'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        goal.completed ? 'bg-moss border-moss' : 'border-sand'
                      }`}>
                        {goal.completed && <span className="text-white text-xs">✓</span>}
                      </div>
                      <span className={`text-sm ${
                        goal.completed ? 'text-moss line-through' : 'text-deeper'
                      }`}>{goal.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}

          <div className="mt-4 bg-cream/50 rounded-xl p-3 space-y-2">
            <input
              placeholder="Add a sprint goal..."
              className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white"
              value={newGoal.text}
              onChange={e => setNewGoal({ ...newGoal, text: e.target.value })}
            />
            <div className="flex gap-2">
              <select
                className="flex-1 border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white"
                value={newGoal.category}
                onChange={e => setNewGoal({ ...newGoal, category: e.target.value as any })}
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                onClick={addGoal}
                className="bg-deeper text-white rounded-lg px-4 py-2 text-sm"
              >Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
