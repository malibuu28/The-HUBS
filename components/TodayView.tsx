'use client'
import { useDashboard } from '@/lib/useDashboard'
import { formatDate, generateId } from '@/lib/utils'
import { useState } from 'react'
import SeventyFiveHoly from './SeventyFiveHoly'
import PushNotifications from './PushNotifications'
import CalendarWidget from './CalendarWidget'
import HabitTracker from './HabitTracker'

interface RoutineItem { id: string; text: string; type: 'morning' | 'night'; isMed: boolean }
interface RoutineLog { date: string; completedIds: string[] }
interface Affirmation { id: string; text: string }
interface AffirmationLog { date: string; completedIds: string[] }

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
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Scripture & Belief
  const monthlyScripture: string = (data as any).monthlyScripture || ''
  const monthlyBelief: string = (data as any).monthlyBelief || ''
  const [editingScripture, setEditingScripture] = useState(false)
  const [scriptureForm, setScriptureForm] = useState({ scripture: monthlyScripture, belief: monthlyBelief })

  // Routine
  const routineItems: RoutineItem[] = (data as any).routineItems || []
  const routineLogs: RoutineLog[] = (data as any).routineLogs || []
  const todayLog = routineLogs.find(l => l.date === today) || { date: today, completedIds: [] }
  const [routineTab, setRoutineTab] = useState<'morning' | 'night'>('morning')
  const [addingRoutine, setAddingRoutine] = useState(false)
  const [newRoutineText, setNewRoutineText] = useState('')
  const [newRoutineType, setNewRoutineType] = useState<'morning' | 'night'>('morning')
  const [newRoutineIsMed, setNewRoutineIsMed] = useState(false)

  // Affirmations
  const affirmations: Affirmation[] = (data as any).affirmations || []
  const affirmationLogs: AffirmationLog[] = (data as any).affirmationLogs || []
  const todayAffLog = affirmationLogs.find(l => l.date === today) || { date: today, completedIds: [] }
  const [addingAffirmation, setAddingAffirmation] = useState(false)
  const [newAffirmationText, setNewAffirmationText] = useState('')
  const [editingAffirmationId, setEditingAffirmationId] = useState<string | null>(null)
  const [editingAffirmationText, setEditingAffirmationText] = useState('')

  const morningItems = routineItems.filter(r => r.type === 'morning')
  const nightItems = routineItems.filter(r => r.type === 'night')
  const currentItems = routineTab === 'morning' ? morningItems : nightItems
  const completedRoutineCount = currentItems.filter(r => todayLog.completedIds.includes(r.id)).length
  const completedAffCount = affirmations.filter(a => todayAffLog.completedIds.includes(a.id)).length

  const toggleRoutineItem = (id: string) => {
    const completed = todayLog.completedIds.includes(id)
      ? todayLog.completedIds.filter(i => i !== id)
      : [...todayLog.completedIds, id]
    const updatedLogs = routineLogs.filter(l => l.date !== today)
    update({ routineLogs: [...updatedLogs, { date: today, completedIds: completed }] } as any)
  }

  const addRoutineItem = () => {
    if (!newRoutineText.trim()) return
    const item: RoutineItem = { id: generateId(), text: newRoutineText, type: newRoutineType, isMed: newRoutineIsMed }
    update({ routineItems: [...routineItems, item] } as any)
    setNewRoutineText('')
    setNewRoutineIsMed(false)
    setAddingRoutine(false)
  }

  const deleteRoutineItem = (id: string) => {
    update({ routineItems: routineItems.filter(r => r.id !== id) } as any)
  }

  const toggleAffirmation = (id: string) => {
    const completed = todayAffLog.completedIds.includes(id)
      ? todayAffLog.completedIds.filter(i => i !== id)
      : [...todayAffLog.completedIds, id]
    const updatedLogs = affirmationLogs.filter(l => l.date !== today)
    update({ affirmationLogs: [...updatedLogs, { date: today, completedIds: completed }] } as any)
  }

  const addAffirmation = () => {
    if (!newAffirmationText.trim()) return
    update({ affirmations: [...affirmations, { id: generateId(), text: newAffirmationText }] } as any)
    setNewAffirmationText('')
    setAddingAffirmation(false)
  }

  const saveEditAffirmation = () => {
    if (!editingAffirmationText.trim()) return
    update({ affirmations: affirmations.map(a => a.id === editingAffirmationId ? { ...a, text: editingAffirmationText } : a) } as any)
    setEditingAffirmationId(null)
  }

  const deleteAffirmation = (id: string) => {
    update({ affirmations: affirmations.filter(a => a.id !== id) } as any)
  }

  const saveScripture = () => {
    update({ monthlyScripture: scriptureForm.scripture, monthlyBelief: scriptureForm.belief } as any)
    setEditingScripture(false)
  }

  const addTask = () => {
    if (!newTask.trim()) return
    update({ tasks: [...tasks, { id: generateId(), text: newTask, completed: false, createdAt: today }] })
    setNewTask('')
  }

  const toggleTask = (id: string) => {
    update({ tasks: tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t) })
  }

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand/30">
        <h2 className="text-2xl font-light text-deeper mb-1">{greeting}, Shayonna</h2>
        <p className="text-sm text-warm">{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        {weeklyFocus && (
          <div className="mt-3 bg-cream/50 rounded-xl px-3 py-2 border border-sand/20">
            <p className="text-xs text-warm">Weekly Focus</p>
            <p className="text-sm text-deeper">{weeklyFocus}</p>
          </div>
        )}
      </div>

      {/* Monthly Scripture & Belief */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/30">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-deeper">📖 This Month</h3>
            <p className="text-xs text-warm">Scripture & What I'm Believing For</p>
          </div>
          <button onClick={() => { setScriptureForm({ scripture: monthlyScripture, belief: monthlyBelief }); setEditingScripture(!editingScripture) }} className="text-xs border border-sand/30 text-warm rounded-lg px-3 py-1.5">Edit</button>
        </div>
        {editingScripture ? (
          <div className="space-y-2">
            <textarea placeholder="Monthly scripture (e.g. Philippians 4:13)" className="w-full border border-sand/30 rounded-xl px-3 py-2 text-sm text-deeper bg-cream/50 focus:outline-none" rows={3} value={scriptureForm.scripture} onChange={e => setScriptureForm({ ...scriptureForm, scripture: e.target.value })} />
            <textarea placeholder="What I'm believing for this month..." className="w-full border border-sand/30 rounded-xl px-3 py-2 text-sm text-deeper bg-cream/50 focus:outline-none" rows={3} value={scriptureForm.belief} onChange={e => setScriptureForm({ ...scriptureForm, belief: e.target.value })} />
            <div className="flex gap-2">
              <button onClick={saveScripture} className="flex-1 bg-deeper text-white rounded-lg py-2 text-sm">Save</button>
              <button onClick={() => setEditingScripture(false)} className="flex-1 bg-cream border border-sand/30 text-warm rounded-lg py-2 text-sm">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {monthlyScripture ? (
              <div className="bg-cream/50 rounded-xl px-3 py-2 border border-sand/20">
                <p className="text-xs text-warm mb-1">Scripture</p>
                <p className="text-sm text-deeper italic">{monthlyScripture}</p>
              </div>
            ) : (
              <p className="text-xs text-sand italic text-center py-2">No scripture set — tap Edit to add one</p>
            )}
            {monthlyBelief && (
              <div className="bg-cream/50 rounded-xl px-3 py-2 border border-sand/20">
                <p className="text-xs text-warm mb-1">Believing For</p>
                <p className="text-sm text-deeper">{monthlyBelief}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Affirmations */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/30">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-deeper">✨ Affirmations</h3>
            <p className="text-xs text-warm">{completedAffCount}/{affirmations.length} said today</p>
          </div>
          <button onClick={() => setAddingAffirmation(!addingAffirmation)} className="text-xs bg-deeper text-white rounded-lg px-3 py-1.5">+ Add</button>
        </div>
        <div className="space-y-2">
          {affirmations.map(aff => {
            const done = todayAffLog.completedIds.includes(aff.id)
            const isEditing = editingAffirmationId === aff.id
            return (
              <div key={aff.id} className={`rounded-xl border transition-all ${done ? 'bg-sage/10 border-sage/20' : 'bg-cream/50 border-sand/20'}`}>
                {isEditing ? (
                  <div className="p-3 space-y-2">
                    <input className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={editingAffirmationText} onChange={e => setEditingAffirmationText(e.target.value)} />
                    <div className="flex gap-2">
                      <button onClick={saveEditAffirmation} className="flex-1 bg-deeper text-white rounded-lg py-1.5 text-xs">Save</button>
                      <button onClick={() => setEditingAffirmationId(null)} className="flex-1 bg-cream border border-sand/30 text-warm rounded-lg py-1.5 text-xs">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3">
                    <button onClick={() => toggleAffirmation(aff.id)} className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${done ? 'bg-sage border-sage' : 'border-sand'}`}>
                      {done && <span className="text-white text-xs">✓</span>}
                    </button>
                    <p className={`flex-1 text-sm ${done ? 'text-sage line-through' : 'text-deeper'}`}>{aff.text}</p>
                    <button onClick={() => { setEditingAffirmationId(aff.id); setEditingAffirmationText(aff.text) }} className="text-sand text-xs hover:text-warm">✏️</button>
                    <button onClick={() => deleteAffirmation(aff.id)} className="text-sand text-xs hover:text-blush">✕</button>
                  </div>
                )}
              </div>
            )
          })}
          {affirmations.length === 0 && <p className="text-xs text-sand italic text-center py-3">No affirmations yet — add some!</p>}
        </div>
        {addingAffirmation && (
          <div className="mt-3 space-y-2">
            <input placeholder="I am confident and capable..." className="w-full border border-sand/30 rounded-xl px-3 py-2 text-sm text-deeper bg-cream/50" value={newAffirmationText} onChange={e => setNewAffirmationText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addAffirmation()} />
            <div className="flex gap-2">
              <button onClick={addAffirmation} className="flex-1 bg-deeper text-white rounded-lg py-2 text-sm">Add</button>
              <button onClick={() => setAddingAffirmation(false)} className="flex-1 bg-cream border border-sand/30 text-warm rounded-lg py-2 text-sm">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Routine */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/30">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-deeper">Daily Routine</h3>
            <p className="text-xs text-warm">{completedRoutineCount}/{currentItems.length} completed today</p>
          </div>
          <button onClick={() => setAddingRoutine(!addingRoutine)} className="text-xs bg-deeper text-white rounded-lg px-3 py-1.5">+ Add</button>
        </div>
        <div className="flex gap-2 mb-3">
          {(['morning', 'night'] as const).map(tab => (
            <button key={tab} onClick={() => setRoutineTab(tab)} className={`flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-all ${routineTab === tab ? 'bg-deeper text-white' : 'bg-cream/50 text-warm border border-sand/20'}`}>
              {tab === 'morning' ? '🌅 Morning' : '🌙 Night'}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {currentItems.map(item => {
            const done = todayLog.completedIds.includes(item.id)
            return (
              <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${done ? 'bg-sage/10 border-sage/20' : 'bg-cream/50 border-sand/20'}`}>
                <button onClick={() => toggleRoutineItem(item.id)} className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${done ? 'bg-sage border-sage' : 'border-sand'}`}>
                  {done && <span className="text-white text-xs">✓</span>}
                </button>
                <div className="flex-1">
                  <p className={`text-sm ${done ? 'text-sage line-through' : 'text-deeper'}`}>{item.text}</p>
                  {item.isMed && <p className="text-xs text-blush">💊 Medication</p>}
                </div>
                <button onClick={() => deleteRoutineItem(item.id)} className="text-sand text-xs hover:text-blush">✕</button>
              </div>
            )
          })}
          {currentItems.length === 0 && <p className="text-xs text-sand italic text-center py-3">No {routineTab} routine items yet</p>}
        </div>
        {addingRoutine && (
          <div className="mt-3 bg-cream/50 rounded-xl p-3 space-y-2">
            <input placeholder="Routine item (e.g. Take vitamin D)" className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={newRoutineText} onChange={e => setNewRoutineText(e.target.value)} />
            <div className="flex gap-2">
              <select className="flex-1 border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={newRoutineType} onChange={e => setNewRoutineType(e.target.value as any)}>
                <option value="morning">Morning</option>
                <option value="night">Night</option>
              </select>
              <button onClick={() => setNewRoutineIsMed(!newRoutineIsMed)} className={`px-3 py-2 rounded-lg text-xs border transition-all ${newRoutineIsMed ? 'bg-blush/20 border-blush text-blush' : 'bg-white border-sand/30 text-warm'}`}>💊 Med</button>
            </div>
            <div className="flex gap-2">
              <button onClick={addRoutineItem} className="flex-1 bg-deeper text-white rounded-lg py-2 text-sm">Add</button>
              <button onClick={() => setAddingRoutine(false)} className="flex-1 bg-cream border border-sand/30 text-warm rounded-lg py-2 text-sm">Cancel</button>
            </div>
          </div>
        )}
      </div>

      <CalendarWidget />
      <PushNotifications />
      <SeventyFiveHoly />
      <HabitTracker />

      {/* Tasks */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/30">
        <h3 className="text-xs font-semibold text-warm uppercase tracking-wide mb-3">Today's Tasks</h3>
        <div className="flex gap-2 mb-3">
          <input className="flex-1 bg-cream/50 rounded-xl px-3 py-2 text-sm text-deeper border border-sand/20 focus:outline-none" placeholder="Add a task for today..." value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} />
          <button onClick={addTask} className="bg-deeper text-white rounded-xl px-4 py-2 text-sm">+</button>
        </div>
        <div className="space-y-2">
          {openTasks.map(task => (
            <button key={task.id} onClick={() => toggleTask(task.id)} className="w-full flex items-center gap-3 p-3 bg-cream/50 rounded-xl border border-sand/20 text-left">
              <div className="w-5 h-5 rounded-full border-2 border-sand flex-shrink-0" />
              <span className="text-sm text-deeper">{task.text}</span>
            </button>
          ))}
          {completedTasks.map(task => (
            <button key={task.id} onClick={() => toggleTask(task.id)} className="w-full flex items-center gap-3 p-3 bg-sage/5 rounded-xl border border-sage/20 text-left">
              <div className="w-5 h-5 rounded-full bg-sage border-2 border-sage flex-shrink-0 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-sm text-sage line-through">{task.text}</span>
            </button>
          ))}
          {todayTasks.length === 0 && <p className="text-xs text-sand italic text-center py-3">No tasks yet!</p>}
        </div>
      </div>
    </div>
  )
}
