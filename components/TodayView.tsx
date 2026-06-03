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
  const completedTasks = todayTasks.filter(t => t.completed)

  const now = new Date()
  const hour = now.getHours()
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' :
    'Good evening'

  const addTask = () => {
    if (!newTask.trim()) return
    update({
      tasks: [...tasks, {
        id: generateId(),
        text: newTask,
        completed: false,
        createdAt: today,
      }]
    })
    setNewTask('')
  }

  const toggleTask = (id: string) => {
    update({
      tasks: tasks.map(t =>
        t.id === id ? { ...t, completed: !t.completed } :
