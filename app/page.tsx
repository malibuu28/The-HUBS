'use client'
import { useState } from 'react'
import TodayView from '@/components/TodayView'
import SprintTracker from '@/components/SprintTracker'
import SpiritualityView from '@/components/SpiritualityView'
import BusinessView from '@/components/BusinessView'
import PersonalDevelopmentView from '@/components/PersonalDevelopmentView'
import WeekView from '@/components/WeekView'
import AIAssistant from '@/components/AIAssistant'

const TABS = [
  { id: 'today', label: 'Today', icon: '🏠' },
  { id: 'week', label: 'Week', icon: '📅' },
  { id: 'sprint', label: 'Sprint', icon: '🚀' },
  { id: 'spirit', label: 'Spirit', icon: '🙏' },
  { id: 'business', label: 'Business', icon: '💼' },
  { id: 'growth', label: 'Growth', icon: '🌱' },
] as const

type Tab = typeof TABS[number]['id']

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('today')
  const refresh = () => window.location.reload()

  return (
    <main className="min-h-screen bg-cream pb-24">
      <div className="sticky top-0 z-10 bg-cream/95 backdrop-blur-sm border-b border-sand/30 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="w-8" />
          <div className="text-center">
            <h1 className="text-xl font-light text-deeper">The Hubss ✦</h1>
            <p className="text-xs text-warm">Spirituality · Business · Personal Development</p>
          </div>
          <button
            onClick={refresh}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-cream border border-sand/30 text-warm"
          >↻</button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4">
        {activeTab === 'today' && <TodayView />}
        {activeTab === 'week' && <WeekView />}
        {activeTab === 'sprint' && <SprintTracker />}
        {activeTab === 'spirit' && <SpiritualityView />}
        {activeTab === 'business' && <BusinessView />}
        {activeTab === 'growth' && <PersonalDevelopmentView />}
      </div>

      <AIAssistant />

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-sand/30 px-2 py-2 z-10">
        <div className="max-w-2xl mx-auto grid grid-cols-6 gap-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-deeper text-white'
                  : 'text-warm hover:bg-cream'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-xs">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </main>
  )
}
