import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import api from '../utils/api'

export default function CataloguePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [showFilter, setShowFilter] = useState(false)

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const featured = searchParams.get('featured') || ''
  const isNew = searchParams.get('new') || ''
  const sort = searchParams.get('sort') || 'created_at'
  const page = parseInt(searchParams.get('page') || '1')

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (search) params.set('search', search)
    if (featured) params.set('featured', featured)
    if (isNew) params.set('new', isNew)
    params.set('sort', sort)
    params.set('page', page)
    params.set('limit', '12')
    api.get(`/products?${params}`).then(r => {
      setProducts(r.data.products)
      setTotal(r.data.total)
      setPages(r.data.pages)
    }).finally(() => setLoading(false))
  }, [category, search, featured, isNew, sort, page])

  const setFilter = (key, val) => {
    const next = new URLSearchParams(searchParams)
    if (val) next.set(key, val); else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  const activeCategory = categories.find(c => c.slug === category)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-navy-900">
          {search ? `Résultats pour "${search}"` : activeCategory ? activeCategory.name : featured ? 'Offres du moment' : isNew ? 'Nouveautés' : 'Tout le catalogue'}
        </h1>
        <p className="text-gray-500 mt-1">{total} produit{total > 1 ? 's' : ''}</p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar filters */}
        <aside className={`${showFilter ? 'block' : 'hidden'} lg:block w-full lg:w-56 shrink-0`}>
          <div className="sticky top-24 bg-white border border-gray-100 rounded-2xl p-5 space-y-6">
            <div>
              <h3 className="font-semibold text-navy-900 mb-3 text-sm">Catégories</h3>
              <div className="space-y-1">
                <button onClick={() => setFilter('category', '')}
                  className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${!category ? 'bg-navy-900 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>
                  Toutes
                </button>
                {categories.map(cat => (
                  <button key={cat.slug} onClick={() => setFilter('category', cat.slug)}
                    className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${category === cat.slug ? 'bg-navy-900 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>
                    {cat.name}
                    <span className="ml-1 text-xs opacity-60">({cat.product_count})</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-semibold text-navy-900 mb-3 text-sm">Filtrer</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={featured === 'true'} onChange={e => setFilter('featured', e.target.checked ? 'true' : '')}
                    className="rounded border-gray-300 text-mint-500" />
                  <span className="text-sm text-gray-700">Offres du moment</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={isNew === 'true'} onChange={e => setFilter('new', e.target.checked ? 'true' : '')}
                    className="rounded border-gray-300 text-mint-500" />
                  <span className="text-sm text-gray-700">Nouveautés</span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 gap-3">
            <button onClick={() => setShowFilter(!showFilter)} className="lg:hidden flex items-center gap-2 text-sm border border-gray-200 px-3 py-2 rounded-lg">
              <Filter size={14} /> Filtres
            </button>
            <select value={sort} onChange={e => setFilter('sort', e.target.value)}
              className="ml-auto text-sm border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:border-mint-400">
              <option value="created_at">Plus récents</option>
              <option value="price_asc">Prix croissant</option>
              <option value="price_desc">Prix décroissant</option>
              <option value="name">Nom A-Z</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="aspect-square bg-gray-100 animate-pulse rounded-2xl" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="font-display text-xl font-bold text-navy-900 mb-2">Aucun produit trouvé</h2>
              <p className="text-gray-500">Essayez d'autres critères de recherche</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              {/* Pagination */}
              {pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {[...Array(pages)].map((_, i) => (
                    <button key={i} onClick={() => setFilter('page', String(i + 1))}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-navy-900 text-white' : 'border border-gray-200 hover:border-navy-300'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
