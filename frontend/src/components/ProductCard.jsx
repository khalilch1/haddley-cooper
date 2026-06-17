import { Link } from 'react-router-dom'
import { ShoppingCart, Star, Badge } from 'lucide-react'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const { addItem } = useCart()

  const handleAdd = (e) => {
    e.preventDefault()
    addItem(product, 1)
    toast.success(`${product.name} ajouté au panier`, { icon: '🛒' })
  }

  const discount = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : null

  return (
    <Link to={`/produit/${product.slug}`} className="group block bg-white rounded-2xl border border-gray-100 hover:border-navy-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Image */}
      <div className="relative bg-gray-50 aspect-square overflow-hidden">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl opacity-20">🧴</div>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_new === 1 && (
            <span className="bg-mint-500 text-white text-[10px] font-bold uppercase px-2 py-1 rounded-full tracking-wide">Nouveau</span>
          )}
          {discount && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">-{discount}%</span>
          )}
        </div>
        {/* Add to cart hover */}
        <button onClick={handleAdd}
          className="absolute bottom-3 right-3 p-2.5 bg-navy-900 text-white rounded-xl opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 hover:bg-mint-500 shadow-lg">
          <ShoppingCart size={16} />
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        {product.brand && (
          <p className="text-[10px] text-mint-600 font-semibold uppercase tracking-wider mb-1">{product.brand}</p>
        )}
        <h3 className="font-medium text-sm text-navy-900 leading-snug mb-2 line-clamp-2 group-hover:text-navy-700">{product.name}</h3>
        {product.unit && (
          <p className="text-xs text-gray-400 mb-3">{product.unit}</p>
        )}

        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-navy-900">{product.price?.toFixed(2)}€</span>
              {product.compare_price && (
                <span className="text-sm text-gray-400 line-through">{product.compare_price.toFixed(2)}€</span>
              )}
            </div>
            {product.pro_price && (
              <p className="text-xs text-gold-600 font-medium">Pro : {product.pro_price.toFixed(2)}€</p>
            )}
          </div>
          <div className="flex items-center gap-0.5">
            {product.stock > 0 ? (
              <span className="text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">En stock</span>
            ) : (
              <span className="text-[10px] text-red-500 font-medium bg-red-50 px-2 py-0.5 rounded-full">Épuisé</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
