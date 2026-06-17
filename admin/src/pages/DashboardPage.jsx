import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Users, Package, Euro, TrendingUp, AlertTriangle, Clock, ArrowUpRight } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import api from '../utils/api'

const STATUS_LABEL = { pending: 'En attente', processing: 'En cours', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée' }
const STATUS_COLOR = { pending: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-600' }

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/stats/dashboard').then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Chargement...</div>
  if (!stats) return null

  const kpis = [
    { label: 'Chiffre d\'affaires', value: `${stats.totalRevenue?.toFixed(2)}€`, icon: Euro, color: 'bg-mint-50 text-mint-600', trend: '+12%' },
    { label: 'Commandes totales', value: stats.totalOrders, icon: ShoppingCart, color: 'bg-blue-50 text-blue-600', trend: '+8%' },
    { label: 'Clients', value: stats.totalCustomers, icon: Users, color: 'bg-purple-50 text-purple-600', trend: '+5%' },
    { label: 'Produits actifs', value: stats.totalProducts, icon: Package, color: 'bg-orange-50 text-orange-600', trend: null },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Bienvenue dans votre espace d'administration</p>
        </div>
        <div className="flex gap-3">
          {stats.pendingOrders > 0 && (
            <Link to="/admin/commandes?status=pending"
              className="flex items-center gap-2 bg-yellow-50 text-yellow-700 text-sm font-medium px-4 py-2 rounded-xl border border-yellow-200 hover:bg-yellow-100 transition-colors">
              <Clock size={14} /> {stats.pendingOrders} commande{stats.pendingOrders > 1 ? 's' : ''} en attente
            </Link>
          )}
          {stats.lowStock > 0 && (
            <Link to="/admin/produits"
              className="flex items-center gap-2 bg-red-50 text-red-600 text-sm font-medium px-4 py-2 rounded-xl border border-red-200 hover:bg-red-100 transition-colors">
              <AlertTriangle size={14} /> {stats.lowStock} stock{stats.lowStock > 1 ? 's' : ''} bas
            </Link>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color, trend }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-xl ${color}`}><Icon size={18} /></div>
              {trend && <span className="flex items-center gap-0.5 text-xs font-medium text-green-600"><TrendingUp size={10} />{trend}</span>}
            </div>
            <p className="text-2xl font-bold text-navy-900">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-navy-900 mb-4">Revenus (6 derniers mois)</h3>
          {stats.revenueByMonth?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip formatter={(v) => [`${v?.toFixed(2)}€`, 'CA']} />
                <Bar dataKey="revenue" fill="#2DD4BF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-300 text-sm">Pas encore de données</div>
          )}
        </div>

        {/* Top products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-semibold text-navy-900 mb-4">Top 5 produits</h3>
          <div className="space-y-3">
            {stats.topProducts?.length > 0 ? stats.topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-5 text-xs font-bold text-gray-300">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.sold} vendus</p>
                </div>
                <span className="text-sm font-bold text-navy-900">{p.revenue?.toFixed(2)}€</span>
              </div>
            )) : (
              <p className="text-gray-300 text-sm text-center py-8">Pas encore de ventes</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-navy-900">Commandes récentes</h3>
          <Link to="/admin/commandes" className="text-xs text-mint-600 hover:underline font-medium flex items-center gap-1">
            Voir tout <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-50">
                <th className="text-left px-5 py-3 font-medium">N° commande</th>
                <th className="text-left px-5 py-3 font-medium">Client</th>
                <th className="text-left px-5 py-3 font-medium">Date</th>
                <th className="text-left px-5 py-3 font-medium">Total</th>
                <th className="text-left px-5 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders?.map(order => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-navy-900">{order.order_number}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{order.user_email || order.guest_email || '—'}</td>
                  <td className="px-5 py-3 text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-5 py-3 text-sm font-bold text-navy-900">{order.total?.toFixed(2)}€</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABEL[order.status] || order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!stats.recentOrders?.length && (
            <div className="text-center py-10 text-gray-300 text-sm">Aucune commande</div>
          )}
        </div>
      </div>
    </div>
  )
}
