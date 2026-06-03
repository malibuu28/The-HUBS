'use client'
import { useState } from 'react'
import { useDashboard } from '@/lib/useDashboard'
import { formatDate, getDaysSince, generateId } from '@/lib/utils'

const DEFAULT_HABITS = [
  { id: 'water', label: '5 Bottles of Water', icon: '💧' },
  { id: 'movement', label: '45 Min Movement', icon: '🏃‍♀️' },
  { id: 'morning_god', label: '10 Min Morning with God', icon: '🙏' },
  { id: 'evening_reflect', label: '10 Min Evening Reflection', icon: '📓' },
  { id: 'no_social', label: 'No Social Before 12pm / After 7pm', icon: '📵' },
  { id: 'whole_foods', label: 'Whole Foods & Meal Prep', icon: '🥗' },
  { id: 'read', label: 'Read 10 Pages', icon: '📖' },
]

export default function SeventyFiveHoly() {
  const { data, update } = useDashboard()
  const startDate = data.seventyFiveHolyStart || '2026-06-02'
  const dayNumber = Math.min(getDaysSince(startDate) + 1, 75)
  const today = formatDate(new Date())
  const logs = data.habitLogs || []
  const holyHabits = (data as any).holyHabits || DEFAULT_HABITS
  const [managing, setManaging] = useState(false)
  const [newHabit, setNewHabit] = useState({ label: '', icon: '⭐' })

  const isChecked = (habitId: string) =>
    logs.some(l => l.habitId === habitId && l.date === today)

  const toggle = (habitId: string) => {
    const exists = isChecked(habitId)
    const newLogs = exists
      ? logs.filter(l => !(l.habitId === habitId && l.date === today))
      : [...logs, { habitId, date: today }]
    update({ habitLogs: newLogs })
  }

  const addHabit = () => {
    if (!newHabit.label.trim()) return
    const habit = { id: generateId(), label: newHabit.label, icon: newHabit.icon }
    update({ holyHabits: [...holyHabits, habit] } as any)
    setNewHabit({ label: '', icon: '⭐' })
  }

  const deleteHabit = (id: string) => {
    update({ holyHabits: holyHabits.filter((h: any) => h.id !== id) } as any)
  }

  const todayCount = holyHabits.filter((h: any) => isChecked(h.id)).length
  const percent = Math.round((todayCount / holyHabits.length) * 100)
  const allDone = todayCount === holyHabits.length

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-sand/30">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-deeper">75 Holy</h2>
          <p className="text-sm text-warm">Day {dayNumber} of 75</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-2xl font-light text-sage">{percent}%</div>
            <div className="text-xs text-warm">{todayCount}/{holyHabits.length} today</div>
          </div>
          <button
            onClick={() => setManaging(!managing)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-cream border border-sand/30 text-warm text-sm"
          >⚙️</button>
        </div>
      </div>

      {allDone && !managing && (
        <div className="bg-sage/10 border border-sage/30 rounded-xl p-3 mb-4 text-center">
          <p className="text-sm text-sage font-medium">🎉 All habits complete today!</p>
        </div>
      )}

      <div className="w-full bg-cream rounded-full h-2 mb-5">
        <div
          className="bg-sage h-2 rounded-full transition-all"
          style={{ width: `${(dayNumber / 75) * 100}%` }}
        />
      </div>

      {managing ? (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-warm uppercase tracking-wide">Manage Habits</p>
          {holyHabits.map((habit: any) => (
            <div key={habit.id} className="flex items-center gap-3 bg-cream/50 rounded-xl p-3 border border-sand/20">
              <span className="text-xl">{habit.icon}</span>
              <span className="text-sm text-deeper flex-1">{habit.label}</span>
              <button
                onClick={() => deleteHabit(habit.id)}
                className="text-sand hover:text-blush text-sm"
              >✕</button>
            </div>
          ))}
          <div className="bg-cream/50 rounded-xl p-3 space-y-2">
            <div className="flex gap-2">
              <input
                placeholder="Emoji icon"
                className="w-16 border border-sand/30 rounded-lg px-2 py-2 text-sm text-center bg-white"
                value={newHabit.icon}
                onChange={e => setNewHabit({ ...newHabit, icon: e.target.value })}
              />
              <input
                placeholder="Habit name"
                className="flex-1 border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white"
                value={newHabit.label}
                onChange={e => setNewHabit({ ...newHabit, label: e.target.value })}
              />
            </div>
            <button
              onClick={addHabit}
              className="w-full bg-deeper text-white rounded-lg py-2 text-sm"
            >+ Add Habit</button>
          </div>
          <button
            onClick={() => setManaging(false)}
            className="w-full bg-cream border border-sand/30 text-warm rounded-xl py-2 text-sm"
          >Done</button>
        </div>
      ) : (
        <div className="space-y-3">
          {holyHabits.map((habit: any) => (
            <button
              key={habit.id}
              onClick={() => toggle(habit.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                isChecked(habit.id)
                  ? 'bg-sage/10 border border-sage/30'
                  : 'bg-cream/50 border border-sand/20'
              }`}
            >
              <span className="text-xl">{habit.icon}</span>
              <span className={`text-sm flex-1 ${
                isChecked(habit.id) ? 'text-sage line-through' : 'text-deeper'
              }`}>
                {habit.label}
              </span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                isChecked(habit.id) ? 'bg-sage border-sage' : 'border-sand'
              }`}>
                {isChecked(habit.id) && <span className="text-white text-xs">✓</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
