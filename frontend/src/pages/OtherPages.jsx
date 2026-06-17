import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import api from '../utils/api'

export function OrderConfirmedPage() {
  const [searchParams] = useSearchParams()
  const { clearCart } = useCart()
  const orderId = searchParams.get('order')
  const [order, setOrder] = useState(null)

  useEffect(() => {
    clearCart()
    if (orderId) api.get(`/orders/${orderId}`).then(r => setOrder(r.data)).catch(() => {})
  }, [orderId])

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-green-600" />
      </div>
      <h1 className="font-display text-3xl font-bold text-navy-900 mb-3">Commande confirmée !</h1>
      {order && <p className="text-gray-500 mb-2">Numéro de commande : <strong className="text-navy-900">{order.order_number}</strong></p>}
      <p className="text-gray-500 mb-8">Vous recevrez un email de confirmation. Livraison sous 24/48h.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/mes-commandes" className="inline-flex items-center gap-2 bg-navy-900 text-white font-medium px-6 py-3 rounded-xl hover:bg-navy-800 transition-colors">
          <Package size={16} /> Suivre ma commande
        </Link>
        <Link to="/catalogue" className="inline-flex items-center gap-2 border border-gray-200 text-navy-900 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors">
          Continuer mes achats
        </Link>
      </div>
    </div>
  )
}

export function EspaceProPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <span className="inline-block bg-gold-100 text-gold-700 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">Espace Pro</span>
        <h1 className="font-display text-4xl font-bold text-navy-900 mb-4">Des tarifs professionnels<br />pour les professionnels</h1>
        <p className="text-gray-600 text-lg">Accédez à nos prix grossistes et bénéficiez d'avantages exclusifs.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {[
          { emoji: '💰', title: 'Prix grossiste', desc: 'Jusqu\'à 40% de réduction sur tous les produits' },
          { emoji: '📦', title: 'Commandes illimitées', desc: 'Pas de minimum de commande ni de quantité minimale' },
          { emoji: '🤝', title: 'Account manager', desc: 'Un interlocuteur dédié pour vos besoins spécifiques' },
        ].map(({ emoji, title, desc }) => (
          <div key={title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-center">
            <div className="text-3xl mb-3">{emoji}</div>
            <h3 className="font-semibold text-navy-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </div>
      <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-3xl p-8 text-center text-white">
        <h2 className="font-display text-2xl font-bold mb-3">Demandez votre accès pro</h2>
        <p className="text-navy-200 mb-6">Créez votre compte en cochant "Professionnel" ou contactez-nous directement.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/inscription" className="bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-6 py-3 rounded-xl transition-colors">
            Créer un compte Pro
          </Link>
          <Link to="/contact" className="border border-white/20 hover:bg-white/10 text-white font-medium px-6 py-3 rounded-xl transition-colors">
            Nous contacter
          </Link>
        </div>
      </div>
    </div>
  )
}

export function MyOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders/my').then(r => setOrders(r.data)).finally(() => setLoading(false))
  }, [])

  const statusLabel = { pending: 'En attente', processing: 'En cours', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée' }
  const statusColor = { pending: 'bg-yellow-100 text-yellow-700', processing: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-600' }

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-12 text-center text-gray-400">Chargement...</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-navy-900 mb-8">Mes commandes</h1>
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Vous n'avez pas encore de commande</p>
          <Link to="/catalogue" className="mt-4 inline-block text-mint-600 font-medium">Découvrir nos produits →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-semibold text-navy-900">{order.order_number}</span>
                  <span className="text-sm text-gray-400 ml-3">{new Date(order.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[order.status] || 'bg-gray-100 text-gray-600'}`}>
                  {statusLabel[order.status] || order.status}
                </span>
              </div>
              <div className="text-sm text-gray-500 mb-3">
                {order.items?.map(i => `${i.product_name} ×${i.quantity}`).join(', ')}
              </div>
              <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                <span className="font-bold text-navy-900">{order.total?.toFixed(2)}€</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
