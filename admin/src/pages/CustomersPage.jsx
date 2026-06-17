import { useState, useEffect } from 'react'
import { Search, Eye, X, Star } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function CustomersPage() {
  const [customers, setCustomers] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)

  const load = () => {
    setLoading(true)
    api.get(`/customers?search=${search}&page=${page}&limit=15`).then(r => {
      setCustomers(r.data.customers)
      setTotal(r.data.total)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [search, page])

  const openDetail = async (c) => {
    setSelected(c)
    const { data } = await api.get(`/customers/${c.id}`)
    setDetail(data)
  }

  const togglePro = async (c) => {
    try {
      await api.put(`/customers/${c.id}`, { is_pro: c.is_pro ? 0 : 1, role: c.role })
      toast.success('Client mis à jour')
      load()
      if (detail?.id === c.id) setDetail({ ...detail, is_pro: c.is_pro ? 0 : 1 })
    } catch { toast.error('Erreur') }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">Clients</h1>
        <p className="text-gray-500 text-sm">{total} client{total > 1 ? 's' : ''}</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Rechercher par nom ou email..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-mint-400" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 font-medium">Client</th>
                <th className="text-left px-5 py-3 font-medium">Commandes</th>
                <th className="text-left px-5 py-3 font-medium">CA total</th>
                <th className="text-left px-5 py-3 font-medium">Type</th>
                <th className="text-left px-5 py-3 font-medium">Inscription</th>
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
              ) : customers.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Aucun client trouvé</td></tr>
              ) : customers.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 text-sm font-bold shrink-0">
                        {c.first_name?.[0] || c.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-navy-900">{c.first_name} {c.last_name}</p>
                        <p className="text-xs text-gray-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-700">{c.order_count}</td>
                  <td className="px-5 py-3 text-sm font-bold text-navy-900">{parseFloat(c.total_spent).toFixed(2)}€</td>
                  <td className="px-5 py-3">
                    {c.is_pro ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-gold-100 text-gold-700 px-2 py-1 rounded-full">
                        <Star size={10} /> Pro
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Particulier</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-400">
                    {new Date(c.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => openDetail(c)}
                      className="p-1.5 text-gray-400 hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer detail panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end">
          <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="font-semibold text-navy-900">{selected.first_name} {selected.last_name}</h2>
              <button onClick={() => { setSelected(null); setDetail(null) }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Email</span>
                  <span className="text-sm text-navy-900">{selected.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Téléphone</span>
                  <span className="text-sm text-navy-900">{selected.phone || '—'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">Inscrit le</span>
                  <span className="text-sm text-navy-900">{new Date(selected.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              {/* Pro toggle */}
              <div className="flex items-center justify-between bg-gold-50 border border-gold-200 rounded-xl p-4">
                <div>
                  <p className="text-sm font-medium text-navy-900">Compte professionnel</p>
                  <p className="text-xs text-gray-500">Accès aux tarifs pro</p>
                </div>
                <button onClick={() => togglePro(detail || selected)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${(detail?.is_pro || selected.is_pro) ? 'bg-gold-500' : 'bg-gray-200'}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${(detail?.is_pro || selected.is_pro) ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {/* Stats */}
              {detail && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-navy-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-navy-900">{detail.orders?.length || 0}</p>
                    <p className="text-xs text-gray-400 mt-1">Commandes</p>
                  </div>
                  <div className="bg-navy-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-navy-900">
                      {detail.orders?.reduce((s, o) => s + (o.total || 0), 0).toFixed(2)}€
                    </p>
                    <p className="text-xs text-gray-400 mt-1">CA total</p>
                  </div>
                </div>
              )}

              {/* Recent orders */}
              {detail?.orders?.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Commandes récentes</h3>
                  <div className="space-y-2">
                    {detail.orders.slice(0, 5).map(order => (
                      <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-navy-900">{order.order_number}</p>
                          <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-navy-900">{order.total?.toFixed(2)}€</p>
                          <p className={`text-xs ${order.status === 'delivered' ? 'text-green-600' : order.status === 'cancelled' ? 'text-red-500' : 'text-blue-600'}`}>
                            {order.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
