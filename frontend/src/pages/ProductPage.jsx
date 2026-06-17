import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ShoppingCart, Star, Truck, Shield, RefreshCw, ChevronLeft, Plus, Minus } from 'lucide-react'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'
import api from '../utils/api'

export default function ProductPage() {
  const { slug } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [imgIdx, setImgIdx] = useState(0)
  const { addItem } = useCart()

  useEffect(() => {
    setLoading(true)
    api.get(`/products/${slug}`).then(r => setProduct(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [slug])

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10">
      <div className="aspect-square bg-gray-100 animate-pulse rounded-3xl" />
      <div className="space-y-4">
        {[1,2,3,4].map(i => <div key={i} className="h-6 bg-gray-100 animate-pulse rounded" />)}
      </div>
    </div>
  )

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold text-navy-900 mb-4">Produit non trouvé</h1>
      <Link to="/catalogue" className="text-mint-600 hover:underline">Retour au catalogue</Link>
    </div>
  )

  const handleAdd = () => {
    addItem(product, qty)
    toast.success(`${qty}× ${product.name} ajouté au panier`, { icon: '🛒' })
  }

  const discount = product.compare_price ? Math.round((1 - product.price / product.compare_price) * 100) : null

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-navy-900">Accueil</Link>
        <span>/</span>
        <Link to="/catalogue" className="hover:text-navy-900">Catalogue</Link>
        {product.category_name && <>
          <span>/</span>
          <Link to={`/catalogue?category=${product.category_slug}`} className="hover:text-navy-900">{product.category_name}</Link>
        </>}
        <span>/</span>
        <span className="text-navy-900">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-50 rounded-3xl overflow-hidden mb-3">
            {product.images?.[imgIdx] ? (
              <img src={product.images[imgIdx]} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl opacity-20">🧴</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${i === imgIdx ? 'border-navy-900' : 'border-gray-200'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.brand && <p className="text-mint-600 text-sm font-semibold uppercase tracking-wider mb-2">{product.brand}</p>}
          <h1 className="font-display text-3xl font-bold text-navy-900 mb-2">{product.name}</h1>

          {/* Rating */}
          {product.avg_rating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < Math.round(product.avg_rating) ? 'fill-gold-500 text-gold-500' : 'text-gray-200 fill-gray-200'} />
                ))}
              </div>
              <span className="text-sm text-gray-500">{product.avg_rating} ({product.reviews?.length} avis)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-4xl font-bold text-navy-900">{product.price?.toFixed(2)}€</span>
            {product.compare_price && <span className="text-xl text-gray-400 line-through">{product.compare_price.toFixed(2)}€</span>}
            {discount && <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-lg">-{discount}%</span>}
          </div>
          {product.pro_price && (
            <p className="text-gold-600 font-medium mb-2">Prix Pro : <strong>{product.pro_price.toFixed(2)}€</strong> <Link to="/espace-pro" className="text-xs underline">Accéder au tarif pro</Link></p>
          )}
          <p className="text-xs text-gray-400 mb-6">Prix unitaire / {product.unit}</p>

          {product.short_description && (
            <p className="text-gray-600 mb-6 leading-relaxed">{product.short_description}</p>
          )}

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-700' : 'text-red-600'}`}>
              {product.stock > 0 ? `En stock (${product.stock} disponibles)` : 'Rupture de stock'}
            </span>
          </div>

          {/* Quantity + Add */}
          {product.stock > 0 && (
            <div className="flex gap-3 mb-6">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-3 hover:bg-gray-50 transition-colors">
                  <Minus size={16} />
                </button>
                <span className="px-4 font-medium">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-3 py-3 hover:bg-gray-50 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              <button onClick={handleAdd}
                className="flex-1 flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                <ShoppingCart size={18} />
                Ajouter au panier
              </button>
            </div>
          )}

          {/* Trust icons */}
          <div className="grid grid-cols-3 gap-3 py-4 border-t border-b border-gray-100">
            {[
              { icon: Truck, label: 'Livraison 24/48h' },
              { icon: Shield, label: 'Paiement sécurisé' },
              { icon: RefreshCw, label: 'Retours 30j' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 text-center">
                <Icon size={18} className="text-mint-600" />
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            ))}
          </div>

          {/* SKU / brand */}
          <div className="mt-4 space-y-1 text-sm text-gray-400">
            {product.sku && <p>Référence : <span className="text-gray-600">{product.sku}</span></p>}
            {product.category_name && <p>Catégorie : <Link to={`/catalogue?category=${product.category_slug}`} className="text-mint-600 hover:underline">{product.category_name}</Link></p>}
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-12 border-t border-gray-100 pt-10">
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-4">Description</h2>
          <p className="text-gray-700 leading-relaxed max-w-3xl">{product.description}</p>
        </div>
      )}

      {/* Reviews */}
      {product.reviews?.length > 0 && (
        <div className="mt-12 border-t border-gray-100 pt-10">
          <h2 className="font-display text-2xl font-bold text-navy-900 mb-6">Avis clients</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {product.reviews.map(r => (
              <div key={r.id} className="bg-gray-50 rounded-2xl p-5">
                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < r.rating ? 'fill-gold-500 text-gold-500' : 'text-gray-200 fill-gray-200'} />)}
                </div>
                {r.title && <p className="font-medium text-sm text-navy-900 mb-1">{r.title}</p>}
                <p className="text-sm text-gray-600 mb-3">{r.body}</p>
                <p className="text-xs text-gray-400">{r.first_name} {r.last_name?.[0]}. · {new Date(r.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
