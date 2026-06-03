'use client'
import { useDashboard } from '@/lib/useDashboard'
import { formatDate, getDaysSince } from '@/lib/utils'

const HOLY_HABITS = [
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

  const isChecked = (habitId: string) =>
    logs.some(l => l.habitId === habitId && l.date === today)

  const toggle = (habitId: string) => {
    const exists = isChecked(habitId)
    const newLogs = exists
      ? logs.filter(l => !(l.habitId === habitId && l.date === today))
      : [...logs, { habitId, date: today }]
    update({ habitLogs: newLogs })
  }

  const todayCount = HOLY_HABITS.filter(h => isChecked(h.id)).length
  const percent = Math.round((todayCount / HOLY_HABITS.length) * 100)

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-sand/30">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-deeper">75 Holy</h2>
          <p className="text-sm text-warm">Day {dayNumber} of 75</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-light text-sage">{percent}%</div>
          <div className="text-xs text-warm">{todayCount}/{HOLY_HABITS.length} today</div>
        </div>
      </div>

      <div className="w-full bg-cream rounded-full h-2 mb-5">
        <div
          className="bg-sage h-2 rounded-full transition-all"
          style={{ width: `${(dayNumber / 75) * 100}%` }}
        />
      </div>

      <div className="space-y-3">
        {HOLY_HABITS.map(habit => (
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
              isChecked(habit.id)
                ? 'bg-sage border-sage'
                : 'border-sand'
            }`}>
              {isChecked(habit.id) && (
                <span className="text-white text-xs">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
