'use client'
import { useState } from 'react'
import { useDashboard } from '@/lib/useDashboard'
import { formatDate, getDaysSince } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function AIAssistant() {
  const { data } = useDashboard()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const buildContext = () => {
    const startDate = data.seventyFiveHolyStart || '2026-06-02'
    const dayNumber = Math.min(getDaysSince(startDate) + 1, 75)
    const today = formatDate(new Date())
    const logs = data.habitLogs || []
    const holyHabits = (data as any).holyHabits || []
    const todayHabits = holyHabits.filter((h: any) =>
      logs.some((l: any) => l.habitId === h.id && l.date === today)
    ).length
    const debts = data.debts || []
    const totalDebt = debts.reduce((sum: number, d: any) => sum + d.balance, 0)
    const sprints = (data as any).sprints || []
    const activeSprint = sprints[sprints.length - 1]
    const tasks = data.tasks || []
    const todayTasks = tasks.filter((t: any) => t.createdAt === today)
    const completedTasks = todayTasks.filter((t: any) => t.completed).length
    const income = (data as any).income || []
    const totalIncome = income.reduce((sum: number, i: any) => sum + i.amount, 0)
    const hairIncome = income.filter((i: any) => i.source === 'hair')
      .reduce((sum: number, i: any) => sum + i.amount, 0)

    return `You are a personal life assistant for Shayonna, a hairstylist and entrepreneur building her dream life. You know her current situation and help her stay focused, motivated, and on track.

SHAYONNA'S CONTEXT:
- She is a hairstylist working toward leaving her day job to be a full-time stylist
- She runs the Zoé haircare product line and an Ayurvedic skincare line
- Her three life pillars are: Spirituality, Business, and Personal Development
- She values Ayurvedic principles, natural ingredients, and holistic wellness

CURRENT DASHBOARD DATA (today, ${today}):
- 75 Holy Challenge: Day ${dayNumber} of 75 — ${todayHabits} habits completed today
- Tasks today: ${completedTasks}/${todayTasks.length} completed
- Total debt: $${totalDebt.toLocaleString()}
- Total income logged: $${totalIncome.toLocaleString()} (Hair: $${hairIncome.toLocaleString()})
- Active sprint: ${activeSprint ? activeSprint.title + ' with ' + activeSprint.projects?.length + ' projects' : 'No active sprint yet'}
- Weekly focus: ${data.weeklyFocus || 'Not set'}
- Yearly vision: ${data.yearlyVision || 'Not set'}

IMPORTANT: Never store or reference previous conversations. Each conversation is fresh. Be warm, direct, and faith-aligned in your responses. Keep responses concise and actionable. You can help with: goal setting, content ideas for her hair business, motivation, habit advice, business strategy, and general life coaching.`
  }

  const send = async () => {
    if (!input.trim() || loading) return
    const userMessage = input.trim()
    setInput('')
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: buildContext(),
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })
      const data = await response.json()
      const reply = data.content?.[0]?.text || 'Sorry, I had trouble responding. Try again!'
      setMessages([...newMessages, { role: 'assistant', content: reply }])
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: 'Something went wrong. Please try again!' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-4 w-12 h-12 bg-deeper text-white rounded-full shadow-lg flex items-center justify-center text-xl z-20"
      >
        {open ? '✕' : '✦'}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-36 right-4 w-80 bg-white rounded-2xl shadow-xl border border-sand/30 z-20 flex flex-col"
          style={{ height: '400px' }}>
          <div className="p-4 border-b border-sand/20">
            <h3 className="text-sm font-semibold text-deeper">Your AI Assistant ✦</h3>
            <p className="text-xs text-warm">Knows your goals. Forgets your chats.</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-xs text-warm text-center py-2">Ask me anything! Try:</p>
                {[
                  "What should I focus on today?",
                  "Give me 3 TikTok ideas for my hair business",
                  "Help me stay motivated",
                ].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="w-full text-left text-xs bg-cream/50 rounded-xl p-2 border border-sand/20 text-warm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs rounded-2xl px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-deeper text-white'
                    : 'bg-cream/50 text-deeper border border-sand/20'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-cream/50 rounded-2xl px-3 py-2 text-sm text-warm border border-sand/20">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-sand/20 flex gap-2">
            <input
              className="flex-1 bg-cream/50 rounded-xl px-3 py-2 text-sm text-deeper border border-sand/20 focus:outline-none"
              placeholder="Ask anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <button
              onClick={send}
              disabled={loading}
              className="bg-deeper text-white rounded-xl px-3 py-2 text-sm"
            >↑</button>
          </div>
        </div>
      )}
    </>
  )
}
