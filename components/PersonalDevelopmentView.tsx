'use client'
import { useState } from 'react'
import { useDashboard } from '@/lib/useDashboard'
import { generateId, getQuarterKey, formatDate } from '@/lib/utils'
import LearningTracker from './LearningTracker'

interface BookItem { id: string; title: string; author: string; status: 'reading' | 'completed' | 'wishlist'; quarterKey: string }
interface BucketListItem { id: string; text: string; completed: boolean; category: string }
interface PDGoal { id: string; quarterKey: string; text: string; completed: boolean }
interface Exercise { id: string; name: string; sets: number; reps: string; duration: string }
interface WorkoutPlan { id: string; name: string; exercises: Exercise[] }
interface WorkoutLog { id: string; date: string; planId: string; planName: string; notes: string; completed: boolean }

export default function PersonalDevelopmentView() {
  const { data, update } = useDashboard()
  const [activeTab, setActiveTab] = useState<'books' | 'bucket' | 'goals' | 'vision' | 'learning' | 'workout'>('books')
  const books: BookItem[] = (data as any).books || []
  const bucketList: BucketListItem[] = (data as any).bucketList || []
  const pdGoals: PDGoal[] = (data as any).pdGoals || []
  const workoutPlans: WorkoutPlan[] = (data as any).workoutPlans || []
  const workoutLogs: WorkoutLog[] = (data as any).workoutLogs || []
  const activePlanId: string = (data as any).activePlanId || ''
  const quarterKey = getQuarterKey()
  const today = formatDate(new Date())

  const [bookForm, setBookForm] = useState({ title: '', author: '', status: 'reading' as BookItem['status'] })
  const [bucketForm, setBucketForm] = useState({ text: '', category: 'Personal' })
  const [goalText, setGoalText] = useState('')
  const [yearlyVisionPD, setYearlyVisionPD] = useState((data as any).yearlyVisionPD || '')

  // Workout state
  const [editingPlan, setEditingPlan] = useState(false)
  const [planName, setPlanName] = useState('')
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [newExercise, setNewExercise] = useState({ name: '', sets: '3', reps: '10', duration: '' })
  const [loggingWorkout, setLoggingWorkout] = useState(false)
  const [workoutNotes, setWorkoutNotes] = useState('')

  const activePlan = workoutPlans.find(p => p.id === activePlanId)

  const currentlyReading = books.filter(b => b.status === 'reading')
  const completedBooks = books.filter(b => b.status === 'completed')
  const currentGoals = pdGoals.filter(g => g.quarterKey === quarterKey)
  const completedBucket = bucketList.filter(b => b.completed).length

  const addBook = () => {
    if (!bookForm.title) return
    const book: BookItem = { id: generateId(), title: bookForm.title, author: bookForm.author, status: bookForm.status, quarterKey }
    update({ books: [...books, book] } as any)
    setBookForm({ title: '', author: '', status: 'reading' })
  }

  const updateBookStatus = (id: string, status: BookItem['status']) => {
    update({ books: books.map(b => b.id === id ? { ...b, status } : b) } as any)
  }

  const addBucketItem = () => {
    if (!bucketForm.text) return
    const item: BucketListItem = { id: generateId(), text: bucketForm.text, completed: false, category: bucketForm.category }
    update({ bucketList: [...bucketList, item] } as any)
    setBucketForm({ text: '', category: 'Personal' })
  }

  const toggleBucket = (id: string) => {
    update({ bucketList: bucketList.map(b => b.id === id ? { ...b, completed: !b.completed } : b) } as any)
  }

  const addGoal = () => {
    if (!goalText.trim()) return
    const goal: PDGoal = { id: generateId(), quarterKey, text: goalText, completed: false }
    update({ pdGoals: [...pdGoals, goal] } as any)
    setGoalText('')
  }

  const toggleGoal = (id: string) => {
    update({ pdGoals: pdGoals.map(g => g.id === id ? { ...g, completed: !g.completed } : g) } as any)
  }

  const addExercise = () => {
    if (!newExercise.name.trim()) return
    setExercises([...exercises, { id: generateId(), name: newExercise.name, sets: parseInt(newExercise.sets) || 3, reps: newExercise.reps, duration: newExercise.duration }])
    setNewExercise({ name: '', sets: '3', reps: '10', duration: '' })
  }

  const savePlan = () => {
    if (!planName.trim() || exercises.length === 0) return
    const plan: WorkoutPlan = { id: generateId(), name: planName, exercises }
    const updated = [...workoutPlans, plan]
    update({ workoutPlans: updated, activePlanId: plan.id } as any)
    setPlanName('')
    setExercises([])
    setEditingPlan(false)
  }

  const logWorkout = () => {
    if (!activePlan) return
    const log: WorkoutLog = { id: generateId(), date: today, planId: activePlan.id, planName: activePlan.name, notes: workoutNotes, completed: true }
    update({ workoutLogs: [...workoutLogs, log] } as any)
    setWorkoutNotes('')
    setLoggingWorkout(false)
  }

  const recentLogs = [...workoutLogs].reverse().slice(0, 5)

  const CATEGORIES = ['Travel', 'Experience', 'Career', 'Personal', 'Health', 'Creative', 'Financial']

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/30">
        <h2 className="text-lg font-semibold text-deeper mb-1">Personal Development 🌱</h2>
        <p className="text-xs text-warm mb-4">Books · Bucket List · Goals · Vision · Learning · Workout</p>
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {(['books', 'bucket', 'goals', 'vision', 'learning', 'workout'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${activeTab === tab ? 'bg-deeper text-white' : 'bg-cream/50 text-warm border border-sand/20'}`}>{tab}</button>
          ))}
        </div>

        {activeTab === 'books' && (
          <div className="space-y-3">
            {currentlyReading.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-warm uppercase tracking-wide mb-2">Currently Reading</p>
                <div className="space-y-2">
                  {currentlyReading.map(book => (
                    <div key={book.id} className="bg-cream/50 rounded-xl p-3 border border-sand/20">
                      <div className="flex items-start justify-between">
                        <div><p className="text-sm font-medium text-deeper">{book.title}</p><p className="text-xs text-warm">{book.author}</p></div>
                        <button onClick={() => updateBookStatus(book.id, 'completed')} className="text-xs bg-moss/20 text-moss px-2 py-1 rounded-lg">Done ✓</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {completedBooks.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-warm uppercase tracking-wide mb-2">Completed ({completedBooks.length})</p>
                <div className="space-y-2">
                  {completedBooks.map(book => (
                    <div key={book.id} className="bg-cream/50 rounded-xl p-3 border border-sand/20">
                      <p className="text-sm text-sage line-through">{book.title}</p>
                      <p className="text-xs text-warm">{book.author}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-cream/50 rounded-xl p-3 space-y-2">
              <input placeholder="Book title" className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} />
              <input placeholder="Author" className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={bookForm.author} onChange={e => setBookForm({ ...bookForm, author: e.target.value })} />
              <select className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={bookForm.status} onChange={e => setBookForm({ ...bookForm, status: e.target.value as any })}>
                <option value="reading">Currently Reading</option>
                <option value="wishlist">Wishlist</option>
                <option value="completed">Completed</option>
              </select>
              <button onClick={addBook} className="w-full bg-deeper text-white rounded-lg py-2 text-sm">Add Book</button>
            </div>
          </div>
        )}

        {activeTab === 'bucket' && (
          <div className="space-y-3">
            <p className="text-xs text-warm">{completedBucket}/{bucketList.length} completed</p>
            <div className="space-y-2">
              {bucketList.map(item => (
                <button key={item.id} onClick={() => toggleBucket(item.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${item.completed ? 'bg-moss/10 border border-moss/30' : 'bg-cream/50 border border-sand/20'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${item.completed ? 'bg-moss border-moss' : 'border-sand'}`}>
                    {item.completed && <span className="text-white text-xs">✓</span>}
                  </div>
                  <div className="flex-1"><p className={`text-sm ${item.completed ? 'text-moss line-through' : 'text-deeper'}`}>{item.text}</p><p className="text-xs text-warm">{item.category}</p></div>
                </button>
              ))}
            </div>
            <div className="bg-cream/50 rounded-xl p-3 space-y-2">
              <input placeholder="Add a bucket list item..." className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={bucketForm.text} onChange={e => setBucketForm({ ...bucketForm, text: e.target.value })} />
              <select className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={bucketForm.category} onChange={e => setBucketForm({ ...bucketForm, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={addBucketItem} className="w-full bg-deeper text-white rounded-lg py-2 text-sm">Add to Bucket List</button>
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-3">
            <p className="text-xs text-warm">{quarterKey} Personal Development Goals</p>
            <div className="space-y-2">
              {currentGoals.map(goal => (
                <button key={goal.id} onClick={() => toggleGoal(goal.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${goal.completed ? 'bg-moss/10 border border-moss/30' : 'bg-cream/50 border border-sand/20'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${goal.completed ? 'bg-moss border-moss' : 'border-sand'}`}>
                    {goal.completed && <span className="text-white text-xs">✓</span>}
                  </div>
                  <span className={`text-sm ${goal.completed ? 'text-moss line-through' : 'text-deeper'}`}>{goal.text}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input placeholder="Add a personal development goal..." className="flex-1 border border-sand/30 rounded-xl px-3 py-2 text-sm text-deeper bg-cream/50" value={goalText} onChange={e => setGoalText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGoal()} />
              <button onClick={addGoal} className="bg-deeper text-white rounded-xl px-4 py-2 text-sm">+</button>
            </div>
          </div>
        )}

        {activeTab === 'vision' && (
          <div className="space-y-3">
            <label className="text-xs font-semibold text-warm uppercase tracking-wide">Personal Development Vision</label>
            <textarea placeholder="Who do you want to become this year?" className="w-full mt-2 border border-sand/30 rounded-xl px-3 py-2 text-sm text-deeper bg-cream/50 focus:outline-none" rows={5} value={yearlyVisionPD} onChange={e => { setYearlyVisionPD(e.target.value); update({ yearlyVisionPD: e.target.value } as any) }} />
          </div>
        )}

        {activeTab === 'workout' && (
          <div className="space-y-3">
            {activePlan ? (
              <div className="bg-cream/50 rounded-xl p-3 border border-sand/20">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-deeper">💪 {activePlan.name}</p>
                    <p className="text-xs text-warm">{activePlan.exercises.length} exercises</p>
                  </div>
                  <button onClick={() => { setPlanName(''); setExercises([]); setEditingPlan(true) }} className="text-xs border border-sand/30 text-warm rounded-lg px-2 py-1">Swap Plan</button>
                </div>
                <div className="space-y-2 mt-2">
                  {activePlan.exercises.map(ex => (
                    <div key={ex.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-sand/20">
                      <p className="text-sm text-deeper">{ex.name}</p>
                      <div className="text-xs text-warm text-right">
                        <p>{ex.sets} sets × {ex.reps} reps</p>
                        {ex.duration && <p>{ex.duration}</p>}
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setLoggingWorkout(true)} className="w-full mt-3 bg-deeper text-white rounded-xl py-2.5 text-sm font-medium">✓ Log Today's Workout</button>
              </div>
            ) : (
              <p className="text-xs text-sand italic text-center py-4">No workout plan yet — create one!</p>
            )}

            {loggingWorkout && (
              <div className="bg-cream/50 rounded-xl p-3 space-y-2">
                <p className="text-sm font-medium text-deeper">Log Workout</p>
                <input placeholder="Notes (how did it feel?)" className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={workoutNotes} onChange={e => setWorkoutNotes(e.target.value)} />
                <div className="flex gap-2">
                  <button onClick={logWorkout} className="flex-1 bg-deeper text-white rounded-lg py-2 text-sm">Save</button>
                  <button onClick={() => setLoggingWorkout(false)} className="flex-1 bg-cream border border-sand/30 text-warm rounded-lg py-2 text-sm">Cancel</button>
                </div>
              </div>
            )}

            {recentLogs.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-warm uppercase tracking-wide mb-2">Recent Workouts</p>
                <div className="space-y-2">
                  {recentLogs.map(log => (
                    <div key={log.id} className="bg-sage/10 rounded-xl p-3 border border-sage/20">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-deeper">{log.planName}</p>
                        <p className="text-xs text-warm">{log.date}</p>
                      </div>
                      {log.notes && <p className="text-xs text-warm mt-1 italic">{log.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!editingPlan ? (
              <button onClick={() => setEditingPlan(true)} className="w-full border border-dashed border-sand rounded-xl py-3 text-sm text-warm">+ Create Workout Plan</button>
            ) : (
              <div className="bg-cream/50 rounded-xl p-3 space-y-3">
                <p className="text-sm font-semibold text-deeper">New Workout Plan</p>
                <input placeholder="Plan name (e.g. Push Day)" className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={planName} onChange={e => setPlanName(e.target.value)} />
                <div className="space-y-2">
                  {exercises.map((ex, i) => (
                    <div key={ex.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-sand/20">
                      <p className="text-sm text-deeper">{ex.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-warm">{ex.sets}×{ex.reps}</p>
                        <button onClick={() => setExercises(exercises.filter((_, idx) => idx !== i))} className="text-sand text-xs hover:text-blush">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="Exercise name" className="col-span-2 border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={newExercise.name} onChange={e => setNewExercise({ ...newExercise, name: e.target.value })} />
                  <input placeholder="Sets" type="number" className="border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={newExercise.sets} onChange={e => setNewExercise({ ...newExercise, sets: e.target.value })} />
                  <input placeholder="Reps" className="border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={newExercise.reps} onChange={e => setNewExercise({ ...newExercise, reps: e.target.value })} />
                  <input placeholder="Duration (optional)" className="col-span-2 border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={newExercise.duration} onChange={e => setNewExercise({ ...newExercise, duration: e.target.value })} />
                </div>
                <button onClick={addExercise} className="w-full border border-dashed border-sand rounded-lg py-2 text-sm text-warm">+ Add Exercise</button>
                <div className="flex gap-2">
                  <button onClick={savePlan} className="flex-1 bg-deeper text-white rounded-lg py-2 text-sm">Save Plan</button>
                  <button onClick={() => setEditingPlan(false)} className="flex-1 bg-cream border border-sand/30 text-warm rounded-lg py-2 text-sm">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {activeTab === 'learning' && <LearningTracker />}
    </div>
  )
}
