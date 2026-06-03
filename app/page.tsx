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
      {/* Header */}
      <div className="sticky
