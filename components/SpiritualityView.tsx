'use client'
import { useState } from 'react'
import { useDashboard } from '@/lib/useDashboard'
import { formatDate, generateId } from '@/lib/utils'

interface JournalEntry {
  id: string
  date: string
  type: 'morning' | 'evening' | 'gratitude' | 'devotional'
  content: string
}

export default function SpiritualityView() {
  const { data, update } = useDashboard()
  const entries: JournalEntry[] = (data as any).journalEntries || []
  const today = formatDate(new Date())
  const [activeTab, setActiveTab] = useState<'today' | 'history' | 'vision'>('today')
  const [form, setForm] = useState({ type: 'morning' as JournalEntry['type'], content: '' })
  const yearlyVision = data.yearlyVision || ''

  const todayEntries = entries.filter(e => e.date === today)

  const addEntry = () => {
    if (!form.content.trim()) return
    const entry: JournalEntry = {
      id: generateId(),
      date: today,
      type: form.type,
      content: form.content,
    }
    update({ journalEntries: [...entries, entry] } as any)
    setForm({ ...form, content: '' })
  }

  const ENTRY_TYPES = {
    morning: { label: 'Morning with God', icon: '🌅', color: 'text-blush' },
    evening: { label: 'Evening Reflection', icon: '🌙', color: 'text-deeper' },
    gratitude: { label: 'Gratitude', icon: '🙏', color: 'text-sage' },
    devotional: { label: 'Devotional', icon: '📖', color: 'text-moss' },
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/30">
        <h2 className="text-lg font-semibold text-deeper mb-1">Spirituality 🙏</h2>
        <p className="text-xs text-warm mb-4">Your sacred space</p>

        <div className="flex gap-2 mb-4">
          {(['today', 'history', 'vision'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-deeper text-white'
                  : 'bg-cream/50 text-warm border border-sand/20'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'today' && (
          <div className="space-y-4">
            {/* Today's entries */}
            {todayEntries.length > 0 && (
              <div className="space-y-2">
                {todayEntries.map(entry => (
                  <div key={entry.id} className="bg-cream/50 rounded-xl p-3 border border-sand/20">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{ENTRY_TYPES[entry.type].icon}</span>
                      <span className={`text-xs font-medium ${ENTRY_TYPES[entry.type].color}`}>
                        {ENTRY_TYPES[entry.type].label}
                      </span>
                    </div>
                    <p className="text-sm text-deeper">{entry.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add entry */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(ENTRY_TYPES) as JournalEntry['type'][]).map(type => (
                  <button
                    key={type}
                    onClick={() => setForm({ ...form, type })}
                    className={`p-2 rounded-xl text-xs flex items-center gap-2 transition-all ${
                      form.type === type
                        ? 'bg-deeper text-white'
                        : 'bg-cream/50 text-warm border border-sand/20'
                    }`}
                  >
                    <span>{ENTRY_TYPES[type].icon}</span>
                    <span>{ENTRY_TYPES[type].label}</span>
                  </button>
                ))}
              </div>
              <textarea
                placeholder={`Write your ${ENTRY_TYPES[form.type].label.toLowerCase()}...`}
                className="w-full border border-sand/30 rounded-xl px-3 py-2 text-sm text-deeper bg-cream/50 focus:outline-none"
                rows={4}
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
              />
              <button
                onClick={addEntry}
                className="w-full bg-deeper text-white rounded-xl py-2 text-sm"
              >Save Entry</button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-2">
            {entries.length === 0 && (
              <p className="text-xs text-sand italic text-center py-4">No entries yet</p>
            )}
            {[...entries].reverse().map(entry => (
              <div key={entry.id} className="bg-cream/50 rounded-xl p-3 border border-sand/20">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span>{ENTRY_TYPES[entry.type].icon}</span>
                    <span className={`text-xs font-medium ${ENTRY_TYPES[entry.type].color}`}>
                      {ENTRY_TYPES[entry.type].label}
                    </span>
                  </div>
                  <span className="text-xs text-sand">{entry.date}</span>
                </div>
                <p className="text-sm text-deeper">{entry.content}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'vision' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-warm uppercase tracking-wide">
                Yearly Spiritual Vision
              </label>
              <textarea
                placeholder="What does your spiritual life look like at the end of this year?"
                className="w-full mt-2 border border-sand/30 rounded-xl px-3 py-2 text-sm text-deeper bg-cream/50 focus:outline-none"
                rows={4}
                value={yearlyVision}
                onChange={e => update({ yearlyVision: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
