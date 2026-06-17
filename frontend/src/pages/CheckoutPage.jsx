import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { Lock } from 'lucide-react'

// REMPLACE PAR TA CLÉ PUBLIQUE STRIPE
const stripePromise = loadStripe('pk_test_YOUR_STRIPE_PUBLISHABLE_KEY')

function CheckoutForm({ orderId, total, onSuccess }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/commande-confirmee?order=${orderId}` }
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button type="submit" disabled={!stripe || loading}
        className="mt-6 w-full bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
        <Lock size={16} />
        {loading ? 'Traitement...' : `Payer ${total.toFixed(2)}€`}
      </button>
    </form>
  )
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [clientSecret, setClientSecret] = useState('')
  const [orderId, setOrderId] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    street: '', city: '', postal_code: '', country: 'France'
  })

  const shipping = total >= 59 ? 0 : 4.90
  const grandTotal = total + shipping

  const handleAddress = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: orderData } = await api.post('/orders', {
        items: items.map(i => ({ product_id: i.id, quantity: i.quantity })),
        shipping_address: { street: form.street, city: form.city, postal_code: form.postal_code, country: form.country },
        guest_email: !user ? form.email : undefined,
      })
      // Mode démo : on saute le paiement et on va directement à la confirmation
      clearCart()
      navigate(`/commande-confirmee?order=${orderData.order_id}`)
    } catch (err) {
      const msg = err.response?.data?.error || 'Erreur lors de la commande'
      toast.error(msg, { duration: 6000 })
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) { navigate('/panier'); return null }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-navy-900 mb-8">Finaliser la commande</h1>

      {/* Steps */}
      <div className="flex items-center gap-3 mb-8">
        {[1, 2].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-navy-900 text-white' : 'bg-gray-100 text-gray-400'}`}>{s}</div>
            <span className={`text-sm ${step >= s ? 'text-navy-900 font-medium' : 'text-gray-400'}`}>{s === 1 ? 'Adresse' : 'Paiement'}</span>
            {s < 2 && <div className={`h-px w-10 ${step > s ? 'bg-navy-900' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2">
          {step === 1 && (
            <form onSubmit={handleAddress} className="space-y-5">
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="font-semibold text-navy-900 mb-4">Informations de contact</h2>
                {!user && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-mint-400" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
                    <input required value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-mint-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                    <input required value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-mint-400" />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-mint-400" />
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="font-semibold text-navy-900 mb-4">Adresse de livraison</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                    <input required value={form.street} onChange={e => setForm({...form, street: e.target.value})}
                      placeholder="12 rue de la Paix"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-mint-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Code postal *</label>
                      <input required value={form.postal_code} onChange={e => setForm({...form, postal_code: e.target.value})}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-mint-400" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ville *</label>
                      <input required value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-mint-400" />
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-colors">
                {loading ? 'Chargement...' : 'Continuer vers le paiement'}
              </button>
            </form>
          )}

          {step === 2 && clientSecret && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <h2 className="font-semibold text-navy-900 mb-6 flex items-center gap-2">
                <Lock size={16} className="text-mint-600" /> Paiement sécurisé
              </h2>
              <Elements stripe={stripePromise} options={{ clientSecret, locale: 'fr', appearance: { theme: 'stripe', variables: { colorPrimary: '#0D1B2A' } } }}>
                <CheckoutForm orderId={orderId} total={grandTotal} />
              </Elements>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5 sticky top-24">
            <h3 className="font-semibold text-navy-900 mb-4">Votre commande</h3>
            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-700 truncate mr-2">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
                  <span className="font-medium whitespace-nowrap">{(item.price * item.quantity).toFixed(2)}€</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span><span>{total.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span className={shipping === 0 ? 'text-green-600' : ''}>{shipping === 0 ? 'Offerte' : `${shipping.toFixed(2)}€`}</span>
              </div>
            </div>
            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-bold text-navy-900">
              <span>Total</span><span>{grandTotal.toFixed(2)}€</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
