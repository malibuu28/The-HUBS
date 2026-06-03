import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrentWeekDays(offset = 0) {
  const today = new Date()
  today.setDate(today.getDate() + offset * 7)
  const start = startOfWeek(today, { weekStartsOn: 1 })
  const end = endOfWeek(today, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

export function formatDate(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

export function getQuarterKey(date = new Date()) {
  const q = Math.ceil((date.getMonth() + 1) / 3)
  return `${date.getFullYear()}-Q${q}`
}

export function getSprintKey(startDate: string) {
  return `sprint-${startDate}`
}

export function getDaysSince(dateString: string) {
  const start = new Date(dateString)
  const today = new Date()
  const diff = today.getTime() - start.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function generateId() {
  return Math.random().toString(36).substring(2, 9)
}
