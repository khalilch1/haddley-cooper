import { useState, useEffect } from 'react'
import { Plus, Edit, Eye, EyeOff, Search, AlertTriangle, X } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const EMPTY = { name: '', slug: '', description: '', short_description: '', price: '', pro_price: '', compare_price: '', stock: 0, sku: '', brand: '', unit: 'unité', category_id: '', is_featured: false, is_new: false, is_active: true, images: [], tags: [] }

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)

  const load = () => {
    setLoading(true)
    api.get(`/products/admin/all?search=${search}&page=${page}&limit=15`).then(r => {
      setProducts(r.data.products)
      setTotal(r.data.total)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { api.get('/categories').then(r => setCategories(r.data)) }, [])
  useEffect(() => { load() }, [search, page])

  const handleEdit = (p) => {
    setEditing(p)
    setForm({ ...p, is_featured: p.is_featured === 1, is_new: p.is_new === 1, is_active: p.is_active === 1, images: p.images || [], tags: p.tags || [], price: p.price || '', pro_price: p.pro_price || '', compare_price: p.compare_price || '' })
    setShowForm(true)
  }

  const handleSave = async () => {
    try {
      const payload = { ...form, price: parseFloat(form.price), pro_price: form.pro_price ? parseFloat(form.pro_price) : null, compare_price: form.compare_price ? parseFloat(form.compare_price) : null, stock: parseInt(form.stock) || 0 }
      if (editing) await api.put(`/products/${editing.id}`, payload)
      else await api.post('/products', payload)
      toast.success(editing ? 'Produit mis à jour' : 'Produit créé')
      setShowForm(false); setEditing(null); setForm(EMPTY); load()
    } catch (err) { toast.error(err.response?.data?.error || 'Erreur') }
  }

  const toggleActive = async (p) => {
    await api.put(`/products/${p.id}`, { ...p, is_active: p.is_active === 1 ? 0 : 1, is_featured: p.is_featured === 1, is_new: p.is_new === 1, images: p.images || [], tags: p.tags || [] })
    load()
  }

  const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Produits</h1>
          <p className="text-gray-500 text-sm">{total} produits au total</p>
        </div>
        <button onClick={() => { setEditing(null); setForm(EMPTY); setShowForm(true) }}
          className="flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={16} /> Nouveau produit
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Rechercher par nom ou référence..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-mint-400" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 font-medium">Produit</th>
                <th className="text-left px-5 py-3 font-medium">Catégorie</th>
                <th className="text-left px-5 py-3 font-medium">Prix</th>
                <th className="text-left px-5 py-3 font-medium">Stock</th>
                <th className="text-left px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td colSpan={6} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : products.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-navy-900">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.sku || '—'} · {p.brand || '—'}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{p.category_name || '—'}</td>
                  <td className="px-5 py-3">
                    <p className="text-sm font-bold text-navy-900">{p.price?.toFixed(2)}€</p>
                    {p.pro_price && <p className="text-xs text-gold-600">Pro: {p.pro_price?.toFixed(2)}€</p>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-sm font-medium flex items-center gap-1 ${p.stock <= 10 ? 'text-red-600' : 'text-gray-700'}`}>
                      {p.stock <= 10 && <AlertTriangle size={12} />}{p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => toggleActive(p)} title={p.is_active ? 'Désactiver' : 'Activer'}
                        className="p-1.5 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors">
                        {p.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button onClick={() => handleEdit(p)}
                        className="p-1.5 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end">
          <div className="w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-semibold text-navy-900">{editing ? 'Modifier le produit' : 'Nouveau produit'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value, slug: editing ? form.slug : slugify(e.target.value)})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mint-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Slug *</label>
                <input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mint-400 font-mono" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description courte</label>
                <input value={form.short_description} onChange={e => setForm({...form, short_description: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mint-400" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mint-400 resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Prix *</label>
                  <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mint-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Prix pro</label>
                  <input type="number" step="0.01" value={form.pro_price} onChange={e => setForm({...form, pro_price: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mint-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Prix barré</label>
                  <input type="number" step="0.01" value={form.compare_price} onChange={e => setForm({...form, compare_price: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mint-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Stock</label>
                  <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mint-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">SKU</label>
                  <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mint-400 font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Marque</label>
                  <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mint-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Unité</label>
                  <input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mint-400" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Catégorie</label>
                <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-mint-400 bg-white">
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-4">
                {[['is_featured', 'Mis en avant'], ['is_new', 'Nouveauté'], ['is_active', 'Actif']].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!form[key]} onChange={e => setForm({...form, [key]: e.target.checked})}
                      className="rounded border-gray-300 text-mint-500" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
              <button onClick={handleSave}
                className="w-full bg-navy-900 hover:bg-navy-800 text-white font-semibold py-3 rounded-xl transition-colors">
                {editing ? 'Mettre à jour' : 'Créer le produit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
