'use client'
import { useState } from 'react'
import { useDashboard } from '@/lib/useDashboard'
import { generateId, formatDate } from '@/lib/utils'

interface LearningTopic { id: string; title: string; category: string; icon: string; notes: string[]; progress: number }
interface TradeEntry { id: string; date: string; pair: string; direction: 'buy' | 'sell'; outcome: 'win' | 'loss' | 'break-even'; amount: number; notes: string; emotion: string }

export default function LearningTracker() {
 const { data, update } = useDashboard()
 const [activeTab, setActiveTab] = useState<'topics' | 'journal' | 'roadmap'>('topics')
 const topics: LearningTopic[] = (data as any).learningTopics || []
 const trades: TradeEntry[] = (data as any).tradeJournal || []
 const [addingTopic, setAddingTopic] = useState(false)
 const [addingTrade, setAddingTrade] = useState(false)
 const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
 const [newNote, setNewNote] = useState('')
 const [generating, setGenerating] = useState(false)
 const [topicForm, setTopicForm] = useState({ title: '', category: 'Trading', icon: '📈' })
 const [tradeForm, setTradeForm] = useState({ pair: 'EUR/USD', direction: 'buy' as const, outcome: 'win' as const, amount: '', notes: '', emotion: 'Confident' })

 const CATEGORIES = ['Trading', 'Business', 'Spirituality', 'Health', 'Technology', 'Other']
 const EMOTIONS = ['Confident', 'Nervous', 'Greedy', 'Patient', 'Fearful', 'Disciplined', 'Excited']

 const addTopic = () => {
   if (!topicForm.title.trim()) return
   const t: LearningTopic = { id: generateId(), title: topicForm.title, category: topicForm.category, icon: topicForm.icon, notes: [], progress: 0 }
   update({ learningTopics: [...topics, t] } as any)
   setTopicForm({ title: '', category: 'Trading', icon: '📈' })
   setAddingTopic(false)
 }

 const addNote = () => {
   if (!newNote.trim() || !selectedTopic) return
   const updated = topics.map(t => t.id === selectedTopic ? { ...t, notes: [...t.notes, newNote.trim()] } : t)
   update({ learningTopics: updated } as any)
   setNewNote('')
 }

 const updateProgress = (id: string, progress: number) => {
   update({ learningTopics: topics.map(t => t.id === id ? { ...t, progress } : t) } as any)
 }

 const deleteTopic = (id: string) => {
   update({ learningTopics: topics.filter(t => t.id !== id) } as any)
 }

 const addTrade = () => {
   if (!tradeForm.amount) return
   const t: TradeEntry = { id: generateId(), date: formatDate(new Date()), pair: tradeForm.pair, direction: tradeForm.direction, outcome: tradeForm.outcome, amount: parseFloat(tradeForm.amount), notes: tradeForm.notes, emotion: tradeForm.emotion }
   update({ tradeJournal: [...trades, t] } as any)
   setTradeForm({ pair: 'EUR/USD', direction: 'buy', outcome: 'win', amount: '', notes: '', emotion: 'Confident' })
   setAddingTrade(false)
 }

 const generateRoadmap = async () => {
   setGenerating(true)
   try {
     const res = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
       system: 'You are a trading education expert. Be concise and practical.',
       messages: [{ role: 'user', content: 'Give me a beginner forex trading learning roadmap in 8 steps. Format as: Step 1: [title] - [one sentence description]. One step per line.' }]
     }) })
     const json = await res.json()
     const text = json.content?.[0]?.text || ''
     const steps = text.split('\n').filter((l: string) => l.trim() && l.toLowerCase().includes('step')).map((l: string) => ({
       id: generateId(),
       title: l.replace(/^Step \d+:\s*/i, '').split(' - ')[0] || l,
       category: 'Trading',
       icon: '📈',
       notes: [l.split(' - ')[1] || ''].filter(Boolean),
       progress: 0
     }))
     update({ learningTopics: [...topics, ...steps] } as any)
   } catch (e) {}
   setGenerating(false)
 }

 const wins = trades.filter(t => t.outcome === 'win').length
 const losses = trades.filter(t => t.outcome === 'loss').length
 const winRate = trades.length > 0 ? Math.round((wins / trades.length) * 100) : 0
 const totalPnL = trades.reduce((sum, t) => t.outcome === 'win' ? sum + t.amount : t.outcome === 'loss' ? sum - t.amount : sum, 0)

 const activeTopic = topics.find(t => t.id === selectedTopic)

 return (
   <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/30">
     <div className="flex items-center justify-between mb-4">
       <div>
         <h2 className="text-lg font-semibold text-deeper">Learning & Trading 📚</h2>
         <p className="text-sm text-warm">Topics · Trade Journal · Roadmap</p>
       </div>
     </div>

     <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
       {(['topics', 'journal', 'roadmap'] as const).map(tab => (
         <button key={tab} onClick={() => { setActiveTab(tab); setSelectedTopic(null) }} className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${activeTab === tab ? 'bg-deeper text-white' : 'bg-cream/50 text-warm border border-sand/20'}`}>{tab}</button>
       ))}
     </div>

     {activeTab === 'topics' && !selectedTopic && (
       <div className="space-y-3">
         {topics.map(topic => (
           <div key={topic.id} className="bg-cream/50 rounded-xl p-3 border border-sand/20">
             <div className="flex items-center gap-3 mb-2">
               <span className="text-xl">{topic.icon}</span>
               <div className="flex-1">
                 <p className="text-sm font-medium text-deeper">{topic.title}</p>
                 <p className="text-xs text-warm">{topic.category} · {topic.notes.length} notes</p>
               </div>
               <button onClick={() => setSelectedTopic(topic.id)} className="text-xs text-sage border border-sage/30 rounded-lg px-2 py-1">Open</button>
               <button onClick={() => deleteTopic(topic.id)} className="text-sand hover:text-blush text-xs">✕</button>
             </div>
             <div className="flex items-center gap-2">
               <div className="flex-1 bg-white rounded-full h-1.5">
                 <div className="bg-sage h-1.5 rounded-full transition-all" style={{ width: `${topic.progress}%` }} />
               </div>
               <span className="text-xs text-warm">{topic.progress}%</span>
             </div>
             <input type="range" min="0" max="100" value={topic.progress} onChange={e => updateProgress(topic.id, parseInt(e.target.value))} className="w-full mt-1 accent-sage" />
           </div>
         ))}
         {topics.length === 0 && <p className="text-xs text-sand italic text-center py-4">No topics yet — add one or generate a roadmap!</p>}
         {addingTopic ? (
           <div className="bg-cream/50 rounded-xl p-3 space-y-2">
             <div className="flex gap-2">
               <input placeholder="Emoji" className="w-14 border border-sand/30 rounded-lg px-2 py-2 text-sm text-center bg-white" value={topicForm.icon} onChange={e => setTopicForm({ ...topicForm, icon: e.target.value })} />
               <input placeholder="Topic name" className="flex-1 border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={topicForm.title} onChange={e => setTopicForm({ ...topicForm, title: e.target.value })} />
             </div>
             <select className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={topicForm.category} onChange={e => setTopicForm({ ...topicForm, category: e.target.value })}>
               {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
             <div className="flex gap-2">
               <button onClick={addTopic} className="flex-1 bg-deeper text-white rounded-lg py-2 text-sm">Add Topic</button>
               <button onClick={() => setAddingTopic(false)} className="flex-1 bg-cream border border-sand/30 text-warm rounded-lg py-2 text-sm">Cancel</button>
             </div>
           </div>
         ) : (
           <button onClick={() => setAddingTopic(true)} className="w-full border border-dashed border-sand rounded-xl py-3 text-sm text-warm">+ Add Learning Topic</button>
         )}
       </div>
     )}

     {activeTab === 'topics' && selectedTopic && activeTopic && (
       <div className="space-y-3">
         <button onClick={() => setSelectedTopic(null)} className="text-xs text-warm flex items-center gap-1">← Back to topics</button>
         <div className="flex items-center gap-2">
           <span className="text-2xl">{activeTopic.icon}</span>
           <div>
             <h3 className="text-base font-semibold text-deeper">{activeTopic.title}</h3>
             <p className="text-xs text-warm">{activeTopic.category}</p>
           </div>
         </div>
         <div className="space-y-2">
           {activeTopic.notes.map((note, i) => (
             <div key={i} className="bg-cream/50 rounded-xl p-3 border border-sand/20">
               <p className="text-sm text-deeper">{note}</p>
             </div>
           ))}
         </div>
         <div className="flex gap-2">
           <input placeholder="Add a note or insight..." className="flex-1 border border-sand/30 rounded-xl px-3 py-2 text-sm text-deeper bg-cream/50" value={newNote} onChange={e => setNewNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNote()} />
           <button onClick={addNote} className="bg-deeper text-white rounded-xl px-4 py-2 text-sm">+</button>
         </div>
       </div>
     )}

     {activeTab === 'journal' && (
       <div className="space-y-3">
         <div className="grid grid-cols-3 gap-2 mb-2">
           <div className="bg-sage/10 rounded-xl p-3 text-center border border-sage/20">
             <p className="text-lg font-light text-sage">{winRate}%</p>
             <p className="text-xs text-warm">Win Rate</p>
           </div>
           <div className="bg-cream/50 rounded-xl p-3 text-center border border-sand/20">
             <p className="text-lg font-light text-deeper">{trades.length}</p>
             <p className="text-xs text-warm">Trades</p>
           </div>
           <div className={`rounded-xl p-3 text-center border ${totalPnL >= 0 ? 'bg-sage/10 border-sage/20' : 'bg-blush/10 border-blush/20'}`}>
             <p className={`text-lg font-light ${totalPnL >= 0 ? 'text-sage' : 'text-blush'}`}>{totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(0)}</p>
             <p className="text-xs text-warm">P&L</p>
           </div>
         </div>
         <div className="space-y-2">
           {[...trades].reverse().slice(0, 10).map(trade => (
             <div key={trade.id} className={`rounded-xl p-3 border ${trade.outcome === 'win' ? 'bg-sage/10 border-sage/20' : trade.outcome === 'loss' ? 'bg-blush/10 border-blush/20' : 'bg-cream/50 border-sand/20'}`}>
               <div className="flex items-center justify-between mb-1">
                 <div className="flex items-center gap-2">
                   <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trade.direction === 'buy' ? 'bg-sage/20 text-sage' : 'bg-blush/20 text-blush'}`}>{trade.direction.toUpperCase()}</span>
                   <span className="text-sm font-medium text-deeper">{trade.pair}</span>
                 </div>
                 <span className={`text-sm font-semibold ${trade.outcome === 'win' ? 'text-sage' : trade.outcome === 'loss' ? 'text-blush' : 'text-warm'}`}>{trade.outcome === 'win' ? '+' : trade.outcome === 'loss' ? '-' : ''}{trade.amount}</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-xs text-warm">{trade.date} · {trade.emotion}</span>
                 <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${trade.outcome === 'win' ? 'bg-sage/20 text-sage' : trade.outcome === 'loss' ? 'bg-blush/20 text-blush' : 'bg-sand/20 text-warm'}`}>{trade.outcome}</span>
               </div>
               {trade.notes && <p className="text-xs text-warm mt-1 italic">{trade.notes}</p>}
             </div>
           ))}
           {trades.length === 0 && <p className="text-xs text-sand italic text-center py-4">No trades logged yet</p>}
         </div>
         {addingTrade ? (
           <div className="bg-cream/50 rounded-xl p-3 space-y-2">
             <div className="grid grid-cols-2 gap-2">
               <input placeholder="Pair (e.g. EUR/USD)" className="border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={tradeForm.pair} onChange={e => setTradeForm({ ...tradeForm, pair: e.target.value })} />
               <input type="number" placeholder="Amount ($)" className="border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={tradeForm.amount} onChange={e => setTradeForm({ ...tradeForm, amount: e.target.value })} />
             </div>
             <div className="grid grid-cols-2 gap-2">
               <select className="border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={tradeForm.direction} onChange={e => setTradeForm({ ...tradeForm, direction: e.target.value as any })}>
                 <option value="buy">Buy</option>
                 <option value="sell">Sell</option>
               </select>
               <select className="border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={tradeForm.outcome} onChange={e => setTradeForm({ ...tradeForm, outcome: e.target.value as any })}>
                 <option value="win">Win</option>
                 <option value="loss">Loss</option>
                 <option value="break-even">Break Even</option>
               </select>
             </div>
             <select className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={tradeForm.emotion} onChange={e => setTradeForm({ ...tradeForm, emotion: e.target.value })}>
               {EMOTIONS.map(e => <option key={e} value={e}>{e}</option>)}
             </select>
             <input placeholder="Notes (what did you learn?)" className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white" value={tradeForm.notes} onChange={e => setTradeForm({ ...tradeForm, notes: e.target.value })} />
             <div className="flex gap-2">
               <button onClick={addTrade} className="flex-1 bg-deeper text-white rounded-lg py-2 text-sm">Log Trade</button>
               <button onClick={() => setAddingTrade(false)} className="flex-1 bg-cream border border-sand/30 text-warm rounded-lg py-2 text-sm">Cancel</button>
             </div>
           </div>
         ) : (
           <button onClick={() => setAddingTrade(true)} className="w-full border border-dashed border-sand rounded-xl py-3 text-sm text-warm">+ Log Trade</button>
         )}
       </div>
     )}

     {activeTab === 'roadmap' && (
       <div className="space-y-3">
         <button onClick={generateRoadmap} disabled={generating} className="w-full bg-deeper text-white rounded-xl py-3 text-sm font-medium">
           {generating ? 'Generating roadmap...' : '✦ Generate Forex Learning Roadmap'}
         </button>
         <p className="text-xs text-warm text-center">AI will create a step-by-step learning path and add it to your topics</p>
         {topics.filter(t => t.category === 'Trading').map(topic => (
           <div key={topic.id} className="bg-cream/50 rounded-xl p-3 border border-sand/20">
             <div className="flex items-center gap-2 mb-1">
               <span>{topic.icon}</span>
               <p className="text-sm font-medium text-deeper">{topic.title}</p>
             </div>
             {topic.notes.length > 0 && <p className="text-xs text-warm">{topic.notes[0]}</p>}
             <div className="w-full bg-white rounded-full h-1.5 mt-2">
               <div className="bg-moss h-1.5 rounded-full" style={{ width: `${topic.progress}%` }} />
             </div>
           </div>
         ))}
       </div>
     )}
   </div>
 )
}
