'use client'
import { useState } from 'react'
import { useDashboard } from '@/lib/useDashboard'
import { generateId } from '@/lib/utils'
import { DebtItem } from '@/lib/types'

const COLORS = ['#d68d84', '#7a816c', '#866a5b', '#cfbb9f', '#8e967d']

export default function DebtSnowball() {
  const { data, update } = useDashboard()
  const debts = (data.debts || []).sort((a, b) => a.balance - b.balance)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({
    name: '', balance: '', originalBalance: '', minimumPayment: '', interestRate: ''
  })

  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0)
  const totalOriginal = debts.reduce((sum, d) => sum + d.originalBalance, 0)
  const totalPaid = totalOriginal - totalDebt
  const overallPercent = totalOriginal > 0
    ? Math.round((totalPaid / totalOriginal) * 100) : 0

  const addDebt = () => {
    if (!form.name || !form.balance) return
    const newDebt: DebtItem = {
      id: generateId(),
      name: form.name,
      balance: parseFloat(form.balance),
      originalBalance: parseFloat(form.originalBalance || form.balance),
      minimumPayment: parseFloat(form.minimumPayment || '0'),
      interestRate: parseFloat(form.interestRate || '0'),
      color: COLORS[debts.length % COLORS.length],
    }
    update({ debts: [...debts, newDebt] })
    setForm({ name: '', balance: '', originalBalance: '', minimumPayment: '', interestRate: '' })
    setAdding(false)
  }

  const updateBalance = (id: string, newBalance: number) => {
    update({
      debts: debts.map(d => d.id === id ? { ...d, balance: newBalance } : d)
    })
  }

  const removeDebt = (id: string) => {
    update({ debts: debts.filter(d => d.id !== id) })
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-sand/30">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-deeper">Debt Snowball ❄️</h2>
          <p className="text-sm text-warm">Smallest to largest</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-light text-blush">
            ${totalDebt.toLocaleString()}
          </div>
          <div className="text-xs text-warm">{overallPercent}% paid off</div>
        </div>
      </div>

      <div className="w-full bg-cream rounded-full h-2 mb-5">
        <div
          className="bg-blush h-2 rounded-full transition-all"
          style={{ width: `${overallPercent}%` }}
        />
      </div>

      <div className="space-y-4 mb-4">
        {debts.map((debt, i) => {
          const percent = Math.round(
            ((debt.originalBalance - debt.balance) / debt.originalBalance) * 100
          )
          return (
            <div key={debt.id} className="bg-cream/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {i === 0 && <span className="text-xs bg-blush/20 text-blush px-2 py-0.5 rounded-full">🎯 Focus</span>}
                  <span className="text-sm font-medium text-deeper">{debt.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-deeper">
                    ${debt.balance.toLocaleString()}
                  </span>
                  <button
                    onClick={() => removeDebt(debt.id)}
                    className="text-sand hover:text-blush text-xs"
                  >✕</button>
                </div>
              </div>
              <div className="w-full bg-white rounded-full h-1.5 mb-2">
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{ width: `${percent}%`, backgroundColor: debt.color }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-warm">{percent}% paid · Min: ${debt.minimumPayment}/mo</span>
                <input
                  type="number"
                  placeholder="Update balance"
                  className="text-xs border border-sand/30 rounded-lg px-2 py-1 w-32 text-deeper bg-white"
                  onBlur={e => {
                    if (e.target.value) updateBalance(debt.id, parseFloat(e.target.value))
                    e.target.value = ''
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {adding ? (
        <div className="bg-cream/50 rounded-xl p-4 space-y-2">
          <input
            placeholder="Debt name (e.g. Credit Card)"
            className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Current balance"
              type="number"
              className="border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white"
              value={form.balance}
              onChange={e => setForm({ ...form, balance: e.target.value })}
            />
            <input
              placeholder="Original balance"
              type="number"
              className="border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white"
              value={form.originalBalance}
              onChange={e => setForm({ ...form, originalBalance: e.target.value })}
            />
            <input
              placeholder="Min payment"
              type="number"
              className="border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white"
              value={form.minimumPayment}
              onChange={e => setForm({ ...form, minimumPayment: e.target.value })}
            />
            <input
              placeholder="Interest rate %"
              type="number"
              className="border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white"
              value={form.interestRate}
              onChange={e => setForm({ ...form, interestRate: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={addDebt}
              className="flex-1 bg-deeper text-white rounded-lg py-2 text-sm"
            >Add Debt</button>
            <button
              onClick={() => setAdding(false)}
              className="flex-1 bg-cream text-warm rounded-lg py-2 text-sm border border-sand/30"
            >Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full border border-dashed border-sand rounded-xl py-3 text-sm text-warm hover:bg-cream/50 transition-all"
        >+ Add Debt</button>
      )}
    </div>
  )
}
