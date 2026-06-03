'use client'
import { useDashboard } from '@/lib/useDashboard'
import { formatDate, generateId } from '@/lib/utils'
import { useState } from 'react'
import SeventyFiveHoly from './SeventyFiveHoly'
import PushNotifications from './PushNotifications'
import CalendarWidget from './CalendarWidget'

export default function TodayView() {
  const { data, update } = useDashboard()
  const today = formatDate(new Date())
  const tasks = data.tasks || []
  const [newTask, setNewTask] = useState('')
  const weeklyFocus = data.weeklyFocus || ''

  const todayTasks = tasks.filter(t => t.createdAt === today)
  const openTasks = todayTasks.filter(t => !t.completed)
  const completedTasks = todayTasks.filter(t => t.completed)

  const now = new Date()
  const hour = now.getHours()
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
    'Good evening'

  const addTask = () => {
    if (!newTask.trim()) return
    update({
      tasks: [...tasks, {
        id: generateId(),
        text: newTask,
        completed: false,
        createdAt: today,
      }]
    })
    setNewTask('')
  }

  const toggleTask = (id: string) => {
    update({
      tasks: tasks.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand/30">
        <h2 className="text-2xl font-light text-deeper mb-1">
          {greeting}, Shayonna ✦
        </h2>
        <p className="text-sm text-warm">
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        {weeklyFocus && (
          <div className="mt-3 bg-cream/50 rounded-xl px-3 py-2 border border-sand/20">
            <p className="text-xs text-warm">Weekly Focus</p>
            <p className="text-sm text-deeper">{weeklyFocus}</p>
          </div>
        )}
      </div>

      {/* Calendar */}
      <CalendarWidget />

      {/* Push Notifications */}
      <PushNotifications />

      {/* 75 Holy */}
      <SeventyFiveHoly />

      {/* Today's Tasks */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/30">
        <h3 className="text-xs font-semibold text-warm uppercase tracking-wide mb-3">
          Today's Tasks
        </h3>
        <div className="flex gap-2 mb-3">
          <input
            className="flex-1 bg-cream/50 rounded-xl px-3 py-2 text-sm text-deeper border border-sand/20 focus:outline-none"
            placeholder="Add a task for today..."
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
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="w-full flex items-center gap-3 p-3 bg-cream/50 rounded-xl border border-sand/20 text-left"
            >
              <div className="w-5 h-5 rounded-full border-2 border-sand flex-shrink-0" />
              <span className="text-sm text-deeper">{task.text}</span>
            </button>
          ))}
          {completedTasks.map(task => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="w-full flex items-center gap-3 p-3 bg-sage/5 rounded-xl border border-sage/20 text-left"
            >
              <div className="w-5 h-5 rounded-full bg-sage border-2 border-sage flex-shrink-0 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-sm text-sage line-through">{task.text}</span>
            </button>
          ))}
          {todayTasks.length === 0 && (
            <p className="text-xs text-sand italic text-center py-3">
              No tasks yet — add one above!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
