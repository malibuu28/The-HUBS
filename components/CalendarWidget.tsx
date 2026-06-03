'use client'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'

interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  location?: string
}

export default function CalendarWidget() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/calendar')
      .then(res => res.json())
      .then(data => {
        setEvents(data.events || [])
        setConnected(data.connected)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayEvents = events.filter(e => e.start.startsWith(today))
  const upcomingEvents = events.filter(e => !e.start.startsWith(today))

  const formatTime = (dateStr: string) => {
    if (!dateStr.includes('T')) return 'All day'
    return format(new Date(dateStr), 'h:mm a')
  }

  if (loading) return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/30">
      <p className="text-xs text-sand">Loading calendar...</p>
    </div>
  )

  if (!connected) return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/30">
      <h3 className="text-sm font-semibold text-deeper mb-1">Google Calendar 📅</h3>
      <p className="text-xs text-warm mb-3">Connect to see your events here</p>
      <a
        href="/api/auth/google"
        className="block w-full bg-deeper text-white rounded-xl py-2 text-sm text-center"
      >
        Connect Google Calendar
      </a>
    </div>
  )

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/30">
      <h3 className="text-xs font-semibold text-warm uppercase tracking-wide mb-3">
        📅 Calendar
      </h3>

      {todayEvents.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-warm mb-2">Today</p>
          <div className="space-y-2">
            {todayEvents.map(event => (
              <div key={event.id} className="bg-blush/10 rounded-xl p-3 border border-blush/20">
                <p className="text-sm font-medium text-deeper">{event.title}</p>
                <p className="text-xs text-warm">{formatTime(event.start)}</p>
                {event.location && (
                  <p className="text-xs text-sand">{event.location}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {upcomingEvents.length > 0 && (
        <div>
          <p className="text-xs text-warm mb-2">Upcoming</p>
          <div className="space-y-2">
            {upcomingEvents.slice(0, 5).map(event => (
              <div key={event.id} className="bg-cream/50 rounded-xl p-3 border border-sand/20">
                <p className="text-sm font-medium text-deeper">{event.title}</p>
                <p className="text-xs text-warm">
                  {format(new Date(event.start), 'EEE MMM d')} · {formatTime(event.start)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <p className="text-xs text-sand italic text-center py-3">
          No upcoming events this week
        </p>
      )}
    </div>
  )
}
