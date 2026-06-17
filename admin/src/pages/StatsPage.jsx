import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../utils/api'

const COLORS = ['#2DD4BF', '#0D1B2A', '#C9A84C', '#6366f1', '#f59e0b', '#ef4444']

export default function StatsPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/stats/dashboard').then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Chargement des statistiques...</div>
  if (!stats) return null

  const pieData = stats.ordersByStatus?.map(s => ({
    name: { pending: 'En attente', processing: 'En cours', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée' }[s.status] || s.status,
    value: s.count
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-navy-900">Statistiques</h1>
        <p className="text-gray-500 text-sm">Vue d'ensemble des performances</p>
      </div>

      {/* Revenue + Orders chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="font-semibold text-navy-900 mb-1">Revenus & Commandes (6 mois)</h3>
        <p className="text-xs text-gray-400 mb-5">Évolution mensuelle</p>
        {stats.revenueByMonth?.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={stats.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip
                formatter={(value, name) => [name === 'revenue' ? `${value?.toFixed(2)}€` : value, name === 'revenue' ? 'CA' : 'Commandes']} />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#2DD4BF" strokeWidth={2.5} dot={{ r: 4, fill: '#2DD4BF' }} />
              <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#0D1B2A" strokeWidth={2} dot={{ r: 3, fill: '#0D1B2A' }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-gray-300 text-sm">Pas encore de données de ventes</div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Orders by status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-navy-900 mb-5">Répartition des commandes</h3>
          {pieData?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-gray-300 text-sm">Aucune commande</div>
          )}
        </div>

        {/* Top products */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-semibold text-navy-900 mb-5">Top produits (CA)</h3>
          {stats.topProducts?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} width={100} />
                <Tooltip formatter={(v) => [`${v?.toFixed(2)}€`, 'CA']} />
                <Bar dataKey="revenue" fill="#0D1B2A" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-gray-300 text-sm">Pas encore de ventes</div>
          )}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Panier moyen', value: stats.totalOrders > 0 ? `${(stats.totalRevenue / stats.totalOrders).toFixed(2)}€` : '—' },
          { label: 'Taux de livraison', value: stats.totalOrders > 0 ? `${Math.round((stats.ordersByStatus?.find(s => s.status === 'delivered')?.count || 0) / stats.totalOrders * 100)}%` : '—' },
          { label: 'Stocks bas', value: stats.lowStock, alert: stats.lowStock > 0 },
          { label: 'En attente', value: stats.pendingOrders, alert: stats.pendingOrders > 0 },
        ].map(({ label, value, alert }) => (
          <div key={label} className={`bg-white rounded-2xl border p-5 shadow-sm ${alert ? 'border-red-200' : 'border-gray-100'}`}>
            <p className={`text-2xl font-bold ${alert ? 'text-red-600' : 'text-navy-900'}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
