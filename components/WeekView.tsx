'use client'
import { useState } from 'react'
import { useDashboard } from '@/lib/useDashboard'
import { getCurrentWeekDays, formatDate, generateId } from '@/lib/utils'
import { format } from 'date-fns'

export default function WeekView() {
  const { data, update } = useDashboard()
  const [weekOffset, setWeekOffset] = useState(0)
  const [newTask, setNewTask] = useState('')
  const days = getCurrentWeekDays(weekOffset)
  const today = formatDate(new Date())
  const tasks = data.tasks || []
  const weeklyFocus = data.weeklyFocus || ''

  const addTask = () => {
    if (!newTask.trim()) return
    const task = {
      id: generateId(),
      text: newTask,
      completed: false,
      createdAt: today,
    }
    update({ tasks: [...tasks, task] })
    setNewTask('')
  }

  const toggleTask = (id: string) => {
    update({
      tasks: tasks.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
    })
  }

  const removeTask = (id: string) => {
    update({ tasks: tasks.filter(t => t.id !== id) })
  }

  const openTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/30">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            className="text-warm p-2 hover:bg-cream rounded-lg"
          >←</button>
          <div className="text-center">
            <p className="text-sm font-medium text-deeper">
              {format(days[0], 'MMM d')} — {format(days[6], 'MMM d, yyyy')}
            </p>
            {weekOffset === 0 && (
              <p className="text-xs text-sage">Current Week</p>
            )}
          </div>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="text-warm p-2 hover:bg-cream rounded-lg"
          >→</button>
        </div>

        {/* Day pills */}
        <div className="grid grid-cols-7 gap-1">
          {days.map(day => {
            const dateStr = formatDate(day)
            const isToday = dateStr === today
            const dayTasks = tasks.filter(t => t.createdAt === dateStr)
            const completed = dayTasks.filter(t => t.completed).length
            return (
              <div
                key={dateStr}
                className={`flex flex-col items-center p-2 rounded-xl ${
                  isToday ? 'bg-deeper text-white' : 'bg-cream/50'
                }`}
              >
                <span className={`text-xs ${isToday ? 'text-cream' : 'text-warm'}`}>
                  {format(day, 'EEE')[0]}
                </span>
                <span className={`text-sm font-medium ${isToday ? 'text-white' : 'text-deeper'}`}>
                  {format(day, 'd')}
                </span>
                {dayTasks.length > 0 && (
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 ${
                    completed === dayTasks.length ? 'bg-sage' : 'bg-blush'
                  }`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Weekly focus */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/30">
        <h3 className="text-xs font-semibold text-warm uppercase tracking-wide mb-2">
          Weekly Focus
        </h3>
        <input
          className="w-full bg-cream/50 rounded-xl px-3 py-2 text-sm text-deeper border border-sand/20 focus:outline-none focus:border-sand"
          placeholder="What's your focus this week?"
          value={weeklyFocus}
          onChange={e => update({ weeklyFocus: e.target.value })}
        />
      </div>

      {/* Tasks */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/30">
        <h3 className="text-xs font-semibold text-warm uppercase tracking-wide mb-3">
          Tasks
        </h3>

        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 bg-cream/50 rounded-xl px-3 py-2 text-sm text-deeper border border-sand/20 focus:outline-none"
            placeholder="Add a task..."
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTask()}
          />
          <button
            onClick={addTask}
            className="bg-deeper text-white rounded-xl px-4 py-2 text-sm"
          >+</button>
        </div>

        <div className="space-y-2">
          {openTasks.map(task => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 bg-cream/50 rounded-xl border border-sand/20"
            >
              <button
                onClick={() => toggleTask(task.id)}
                className="w-5 h-5 rounded-full border-2 border-sand flex-shrink-0"
              />
              <span className="text-sm text-deeper flex-1">{task.text}</span>
              <button
                onClick={() => removeTask(task.id)}
                className="text-sand hover:text-blush text-xs"
              >✕</button>
            </div>
          ))}
          {completedTasks.map(task => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 bg-sage/5 rounded-xl border border-sage/20"
            >
              <div className="w-5 h-5 rounded-full bg-sage border-2 border-sage flex-shrink-0 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-sm text-sage line-through flex-1">{task.text}</span>
              <button
                onClick={() => removeTask(task.id)}
                className="text-sand hover:text-blush text-xs"
              >✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
