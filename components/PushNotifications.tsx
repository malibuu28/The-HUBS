'use client'
import { useState, useEffect } from 'react'

export default function PushNotifications() {
  const [status, setStatus] = useState<'idle' | 'subscribed' | 'denied' | 'unsupported'>('idle')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    if (Notification.permission === 'granted') setStatus('subscribed')
    if (Notification.permission === 'denied') setStatus('denied')
  }, [])

  const subscribe = async () => {
    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setStatus('denied')
        return
      }

      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      setStatus('subscribed')
      await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: { endpoint: 'manual', permission: 'granted' } }),
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const testNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('The Hubss ✦', {
        body: `Good morning, Shayonna! 🌅\n\nTime to check in with your 75 Holy habits and set your intention for today.`,
      })
    }
  }

  if (status === 'unsupported') return null

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand/30">
      <h3 className="text-sm font-semibold text-deeper mb-1">
        Morning Notifications 🔔
      </h3>
      <p className="text-xs text-warm mb-3">
        Get a daily reminder to check in with The Hubss
      </p>

      {status === 'idle' && (
        <button
          onClick={subscribe}
          disabled={loading}
          className="w-full bg-deeper text-white rounded-xl py-2 text-sm"
        >
          {loading ? 'Setting up...' : 'Enable Morning Reminders'}
        </button>
      )}

      {status === 'subscribed' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sage text-xs">
            <span>✓</span>
            <span>Notifications enabled!</span>
          </div>
          <button
            onClick={testNotification}
            className="w-full bg-cream border border-sand/30 text-warm rounded-xl py-2 text-sm"
          >
            Send Test Notification
          </button>
        </div>
      )}

      {status === 'denied' && (
        <p className="text-xs text-blush">
          Notifications blocked. Go to your browser settings to allow them for this site.
        </p>
      )}
    </div>
  )
}
