'use client'
import { useDashboard } from '@/lib/useDashboard'
import { formatDate, generateId } from '@/lib/utils'
import { useState } from 'react'
import SeventyFiveHoly from './SeventyFiveHoly'
import PushNotifications from './PushNotifications'
import CalendarWidget from './CalendarWidget'
import HabitTracker from './HabitTracker'

export default function TodayView() {
  const { data, update } = useDashboard()
  const today = formatDate(new Date())
  const tasks = data.tasks || []
  const [newTask, setNewTask] = useState('')
  const weeklyFocus = data.weeklyFocus || ''
  const todayTasks = tasks.filter(t => t.createdAt === today)
  const openTasks = todayTasks.filter(t => !t.completed)
  const completedTasks = todayTasks.filter(t => t.
