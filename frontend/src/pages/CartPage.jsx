import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useState } from 'react'

export default function CartPage() {
  const { items, updateQty, removeItem, total, clearCart } = useCart()
  const [coupon, setCoupon] = useState('')
  const shipping = total >= 59 ? 0 : 4.90

  if (items.length === 0) return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
      <h1 className="font-display text-2xl font-bold text-navy-900 mb-2">Votre panier est vide</h1>
      <p className="text-gray-500 mb-6">Découvrez nos produits d'hygiène et d'entretien</p>
      <Link to="/catalogue" className="inline-flex items-center gap-2 bg-navy-900 text-white font-medium px-6 py-3 rounded-xl hover:bg-navy-800 transition-colors">
        Voir le catalogue <ArrowRight size={16} />
      </Link>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-display text-3xl font-bold text-navy-900 mb-8">Mon panier ({items.reduce((s, i) => s + i.quantity, 0)} articles)</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="flex gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden">
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">🧴</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/produit/${item.slug}`} className="font-medium text-navy-900 hover:text-mint-600 text-sm leading-tight line-clamp-2">{item.name}</Link>
                {item.brand && <p className="text-xs text-gray-400 mt-0.5">{item.brand}</p>}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => updateQty(item.id, item.quantity - 1)} className="px-2 py-1.5 hover:bg-gray-50">
                      <Minus size={12} />
                    </button>
                    <span className="px-3 text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, item.quantity + 1)} className="px-2 py-1.5 hover:bg-gray-50">
                      <Plus size={12} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-navy-900">{(item.price * item.quantity).toFixed(2)}€</span>
                    <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-600 mt-2">
            Vider le panier
          </button>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="font-semibold text-navy-900 mb-4">Récapitulatif</h2>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Sous-total</span>
                <span>{total.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Livraison</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'Offerte ✓' : `${shipping.toFixed(2)}€`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-400">Livraison offerte dès 59€ ({(59 - total).toFixed(2)}€ restants)</p>
              )}
            </div>

            {/* Coupon */}
            <div className="mb-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Code promo" value={coupon} onChange={e => setCoupon(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-mint-400" />
                </div>
                <button className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  Appliquer
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mb-6">
              <div className="flex justify-between font-bold text-navy-900">
                <span>Total</span>
                <span className="text-xl">{(total + shipping).toFixed(2)}€</span>
              </div>
            </div>

            <Link to="/commande"
              className="block w-full bg-navy-900 hover:bg-navy-800 text-white text-center font-semibold py-3.5 rounded-xl transition-colors">
              Passer la commande <ArrowRight size={16} className="inline ml-1" />
            </Link>
            <Link to="/catalogue" className="block text-center text-sm text-gray-500 hover:text-navy-900 mt-3 transition-colors">
              Continuer les achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
