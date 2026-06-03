'use client'
import { useState } from 'react'
import { useDashboard } from '@/lib/useDashboard'
import { generateId } from '@/lib/utils'
import { ProductItem } from '@/lib/types'

const STATUS_COLORS = {
  idea: 'bg-sand/30 text-warm',
  formulating: 'bg-blush/20 text-blush',
  testing: 'bg-sage/20 text-sage',
  ready: 'bg-moss/20 text-moss',
  launched: 'bg-deeper/20 text-deeper',
}

const STATUS_LABELS = {
  idea: '💡 Idea',
  formulating: '🧪 Formulating',
  testing: '🔬 Testing',
  ready: '✅ Ready',
  launched: '🚀 Launched',
}

export default function ProductTracker() {
  const { data, update } = useDashboard()
  const products = data.products || []
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({
    name: '', line: 'zoe' as const, phase: '1', status: 'idea' as const, notes: ''
  })

  const zoeProducts = products.filter(p => p.line === 'zoe')
  const skincareProducts = products.filter(p => p.line === 'skincare')

  const addProduct = () => {
    if (!form.name) return
    const newProduct: ProductItem = {
      id: generateId(),
      name: form.name,
      line: form.line,
      phase: parseInt(form.phase),
      status: form.status,
      notes: form.notes,
    }
    update({ products: [...products, newProduct] })
    setForm({ name: '', line: 'zoe', phase: '1', status: 'idea', notes: '' })
    setAdding(false)
  }

  const updateStatus = (id: string, status: ProductItem['status']) => {
    update({
      products: products.map(p => p.id === id ? { ...p, status } : p)
    })
  }

  const removeProduct = (id: string) => {
    update({ products: products.filter(p => p.id !== id) })
  }

  const ProductCard = ({ product }: { product: ProductItem }) => (
    <div className="bg-cream/50 rounded-xl p-3 border border-sand/20">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-deeper">{product.name}</p>
          <p className="text-xs text-warm">Phase {product.phase}</p>
        </div>
        <button
          onClick={() => removeProduct(product.id)}
          className="text-sand hover:text-blush text-xs"
        >✕</button>
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        {(Object.keys(STATUS_LABELS) as ProductItem['status'][]).map(s => (
          <button
            key={s}
            onClick={() => updateStatus(product.id, s)}
            className={`text-xs px-2 py-0.5 rounded-full transition-all ${
              product.status === s
                ? STATUS_COLORS[s] + ' font-medium'
                : 'bg-white text-sand border border-sand/20'
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>
      {product.notes && (
        <p className="text-xs text-warm italic">{product.notes}</p>
      )}
    </div>
  )

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-sand/30">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-deeper">Product Lines 🌿</h2>
          <p className="text-sm text-warm">Zoé & Skincare</p>
        </div>
        <span className="text-xs text-warm">{products.length} products</span>
      </div>

      {/* Zoé Line */}
      <div className="mb-5">
        <h3 className="text-xs font-semibold text-warm uppercase tracking-wide mb-2">
          ✨ Zoé Haircare
        </h3>
        <div className="space-y-2">
          {zoeProducts.length === 0 && (
            <p className="text-xs text-sand italic">No products yet</p>
          )}
          {zoeProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>

      {/* Skincare Line */}
      <div className="mb-5">
        <h3 className="text-xs font-semibold text-warm uppercase tracking-wide mb-2">
          🌸 Ayurvedic Skincare
        </h3>
        <div className="space-y-2">
          {skincareProducts.length === 0 && (
            <p className="text-xs text-sand italic">No products yet</p>
          )}
          {skincareProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>

      {adding ? (
        <div className="bg-cream/50 rounded-xl p-4 space-y-2">
          <input
            placeholder="Product name"
            className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              className="border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white"
              value={form.line}
              onChange={e => setForm({ ...form, line: e.target.value as any })}
            >
              <option value="zoe">Zoé Haircare</option>
              <option value="skincare">Ayurvedic Skincare</option>
            </select>
            <select
              className="border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white"
              value={form.phase}
              onChange={e => setForm({ ...form, phase: e.target.value })}
            >
              <option value="1">Phase 1</option>
              <option value="2">Phase 2</option>
              <option value="3">Phase 3</option>
            </select>
          </div>
          <select
            className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white"
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value as any })}
          >
            {(Object.keys(STATUS_LABELS) as ProductItem['status'][]).map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <textarea
            placeholder="Notes (optional)"
            className="w-full border border-sand/30 rounded-lg px-3 py-2 text-sm text-deeper bg-white"
            rows={2}
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
          />
          <div className="flex gap-2">
            <button
              onClick={addProduct}
              className="flex-1 bg-deeper text-white rounded-lg py-2 text-sm"
            >Add Product</button>
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
        >+ Add Product</button>
      )}
    </div>
  )
}
