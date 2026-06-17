import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Eye, X, ChevronDown } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const STATUS_LABEL = { pending: 'En attente', processing: 'En cours', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée', refunded: 'Remboursée' }
const STATUS_COLOR = { pending: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-600', refunded: 'bg-gray-100 text-gray-600' }
const PAYMENT_COLOR = { paid: 'text-green-600', pending: 'text-yellow-600', failed: 'text-red-600' }
const PAYMENT_LABEL = { paid: 'Payé', pending: 'En attente', failed: 'Échoué' }

export default function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [orders, setOrders] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [updating, setUpdating] = useState(false)

  const status = searchParams.get('status') || ''
  const page = parseInt(searchParams.get('page') || '1')

  const load = () => {
    setLoading(true)
    api.get(`/orders/admin/all?status=${status}&search=${search}&page=${page}&limit=15`).then(r => {
      setOrders(r.data.orders)
      setTotal(r.data.total)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [status, search, page])

  const setFilter = (key, val) => {
    const next = new URLSearchParams(searchParams)
    if (val) next.set(key, val); else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(true)
    try {
      await api.put(`/orders/admin/${orderId}/status`, { status: newStatus })
      toast.success('Statut mis à jour')
      if (selected?.id === orderId) setSelected({ ...selected, status: newStatus })
      load()
    } catch { toast.error('Erreur lors de la mise à jour') }
    finally { setUpdating(false) }
  }

  const STATUSES = Object.keys(STATUS_LABEL)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Commandes</h1>
          <p className="text-gray-500 text-sm">{total} commande{total > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter('status', '')}
          className={`text-sm px-4 py-2 rounded-xl font-medium transition-colors ${!status ? 'bg-navy-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-navy-300'}`}>
          Toutes
        </button>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter('status', s)}
            className={`text-sm px-4 py-2 rounded-xl font-medium transition-colors ${status === s ? 'bg-navy-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-navy-300'}`}>
            {STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => { setSearch(e.target.value) }}
          placeholder="Rechercher par numéro ou email..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-mint-400" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 font-medium">Commande</th>
                <th className="text-left px-5 py-3 font-medium">Client</th>
                <th className="text-left px-5 py-3 font-medium">Date</th>
                <th className="text-left px-5 py-3 font-medium">Total</th>
                <th className="text-left px-5 py-3 font-medium">Paiement</th>
                <th className="text-left px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td colSpan={7} className="px-5 py-4"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">Aucune commande trouvée</td></tr>
              ) : orders.map(order => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-navy-900">{order.order_number}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    <div>
                      <p>{order.first_name ? `${order.first_name} ${order.last_name}` : '—'}</p>
                      <p className="text-xs text-gray-400">{order.user_email || order.guest_email || 'Invité'}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-5 py-3 text-sm font-bold text-navy-900">{order.total?.toFixed(2)}€</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium ${PAYMENT_COLOR[order.payment_status] || 'text-gray-500'}`}>
                      {PAYMENT_LABEL[order.payment_status] || order.payment_status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABEL[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => setSelected(order)}
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

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end">
          <div className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-semibold text-navy-900">{selected.order_number}</h2>
                <p className="text-xs text-gray-400">{new Date(selected.created_at).toLocaleString('fr-FR')}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-6">
              {/* Status update */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Changer le statut</label>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map(s => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)} disabled={updating}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border ${selected.status === s ? 'bg-navy-900 text-white border-navy-900' : 'border-gray-200 text-gray-600 hover:border-navy-300'}`}>
                      {STATUS_LABEL[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Client</h3>
                <p className="text-sm font-medium text-navy-900">{selected.first_name} {selected.last_name}</p>
                <p className="text-sm text-gray-500">{selected.user_email || selected.guest_email}</p>
              </div>

              {/* Shipping */}
              {selected.shipping_address && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Adresse de livraison</h3>
                  <p className="text-sm text-gray-700">{selected.shipping_address.street}</p>
                  <p className="text-sm text-gray-700">{selected.shipping_address.postal_code} {selected.shipping_address.city}</p>
                  <p className="text-sm text-gray-700">{selected.shipping_address.country}</p>
                </div>
              )}

              {/* Items */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Articles</h3>
                <div className="space-y-2">
                  {selected.items?.map(item => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-navy-900">{item.product_name}</p>
                        <p className="text-xs text-gray-400">{item.product_price?.toFixed(2)}€ × {item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold text-navy-900">{item.subtotal?.toFixed(2)}€</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-navy-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Sous-total</span><span>{selected.subtotal?.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Livraison</span><span>{selected.shipping_cost?.toFixed(2)}€</span>
                </div>
                {selected.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Remise</span><span>-{selected.discount?.toFixed(2)}€</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-navy-900 border-t border-navy-100 pt-2">
                  <span>Total</span><span>{selected.total?.toFixed(2)}€</span>
                </div>
              </div>

              {selected.notes && (
                <div className="bg-yellow-50 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-yellow-700 mb-1">Notes</h3>
                  <p className="text-sm text-yellow-800">{selected.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
