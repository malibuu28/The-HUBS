import { useState, useEffect, useCallback } from 'react'
import { DashboardData } from './types'

export function useDashboard() {
  const [data, setData] = useState<DashboardData>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const save = useCallback(async (newData: DashboardData) => {
    setSaving(true)
    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData),
      })
    } finally {
      setSaving(false)
    }
  }, [])

  const update = useCallback((updates: Partial<DashboardData>) => {
    setData(prev => {
      const newData = { ...prev, ...updates }
      save(newData)
      return newData
    })
  }, [save])

  return { data, loading, saving, update }
}
