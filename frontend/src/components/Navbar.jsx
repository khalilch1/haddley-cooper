import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  ShoppingCart, Search, User, Menu, X, ChevronDown,
  Truck, Sparkles, Droplets, Wind, FlaskConical, Trash2, Waves, LayoutGrid, LogOut, Package
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const categories = [
  { label: 'Hygiène des sols', slug: 'hygiene-sols', icon: Droplets, color: 'text-blue-500', desc: 'Détergents & surodorants' },
  { label: 'Hygiène des surfaces', slug: 'hygiene-surfaces', icon: Sparkles, color: 'text-purple-500', desc: 'Désinfectants & sprays' },
  { label: 'Hygiène des mains', slug: 'hygiene-mains', icon: Wind, color: 'text-green-500', desc: 'Savons & gels hydro' },
  { label: 'Hygiène des sanitaires', slug: 'hygiene-sanitaires', icon: FlaskConical, color: 'text-orange-500', desc: 'WC, robinets & douches' },
  { label: 'Collecte des déchets', slug: 'collecte-dechets', icon: Trash2, color: 'text-gray-500', desc: 'Sacs & poubelles' },
  { label: 'Univers Piscine', slug: 'univers-piscine', icon: Waves, color: 'text-cyan-500', desc: 'Chlore, pH & bassins' },
]

export default function Navbar() {
  const { count } = useCart()
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const searchRef = useRef(null)
  const catRef = useRef(null)
  const userRef = useRef(null)

  useEffect(() => { setMenuOpen(false); setCatOpen(false); setUserOpen(false); setSearchOpen(false) }, [pathname])

  useEffect(() => {
    const handler = (e) => {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false)
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { if (searchOpen) searchRef.current?.focus() }, [searchOpen])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) { navigate(`/catalogue?search=${encodeURIComponent(searchQuery)}`); setSearchOpen(false); setSearchQuery('') }
  }

  return (
    <>
      {/* Topbar */}
      <div className="bg-navy-900 text-white text-xs py-2 hidden sm:block">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Truck size={12} className="text-mint-400" />
              Livraison offerte dès <strong className="text-mint-400">59€</strong>
            </span>
            <span className="text-navy-300">·</span>
            <span className="text-navy-300">Livraison 24/48h France métro</span>
          </div>
          <div className="flex items-center gap-4 text-navy-300">
            <span>01 23 45 67 89</span>
            <span>·</span>
            <span>Prix grossiste · Made in France 🇫🇷</span>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="bg-white sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-[68px] gap-6">

            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex flex-col leading-none">
              <span className="font-display font-bold text-[22px] text-navy-900 tracking-tight">
                Haddley <span className="text-mint-500">&</span> Cooper
              </span>
              <span className="text-[9px] text-gray-400 tracking-[0.2em] uppercase font-body mt-0.5">Le pro s'invite chez vous</span>
            </Link>

            {/* Center nav */}
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">

              {/* Catalogue dropdown */}
              <div ref={catRef} className="relative">
                <button
                  onClick={() => setCatOpen(v => !v)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150
                    ${catOpen ? 'bg-navy-900 text-white' : 'text-gray-700 hover:bg-gray-100 hover:text-navy-900'}`}>
                  <LayoutGrid size={15} />
                  Catalogue
                  <ChevronDown size={13} className={`transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`} />
                </button>

                {catOpen && (
                  <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-gray-100 w-[520px] p-3 z-50">
                    {/* Arrow */}
                    <div className="absolute -top-[7px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-l border-t border-gray-100 rotate-45" />
                    <div className="grid grid-cols-2 gap-1">
                      {categories.map(cat => {
                        const Icon = cat.icon
                        return (
                          <Link key={cat.slug} to={`/catalogue?category=${cat.slug}`}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                            <div className={`w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform ${cat.color}`}>
                              <Icon size={17} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-navy-900">{cat.label}</p>
                              <p className="text-xs text-gray-400">{cat.desc}</p>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <Link to="/catalogue"
                        className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-navy-50 hover:bg-navy-100 text-navy-900 text-sm font-medium transition-colors">
                        Voir tous les produits →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link to="/catalogue?featured=true"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-navy-900 transition-colors">
                Offres
              </Link>

              <Link to="/espace-pro"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors">
                Espace Pro
              </Link>

              <Link to="/a-propos"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-navy-900 transition-colors">
                À propos
              </Link>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1 flex-shrink-0">

              {/* Search */}
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5">
                  <Search size={15} className="text-gray-400 flex-shrink-0" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Rechercher..."
                    className="bg-transparent text-sm outline-none w-44 text-navy-900 placeholder-gray-400"
                  />
                  <button type="button" onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                </form>
              ) : (
                <button onClick={() => setSearchOpen(true)}
                  className="p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-navy-900 transition-colors">
                  <Search size={19} />
                </button>
              )}

              {/* User dropdown */}
              <div ref={userRef} className="relative hidden sm:block">
                <button onClick={() => setUserOpen(v => !v)}
                  className={`flex items-center gap-1.5 p-2.5 rounded-xl transition-colors
                    ${user ? 'text-navy-900 bg-navy-50 hover:bg-navy-100' : 'text-gray-600 hover:bg-gray-100 hover:text-navy-900'}`}>
                  <User size={19} />
                  {user && <span className="text-xs font-medium max-w-[80px] truncate hidden xl:block">{user.first_name}</span>}
                </button>

                {userOpen && (
                  <div className="absolute top-[calc(100%+8px)] right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 w-52 py-2 z-50">
                    {user ? (
                      <>
                        <div className="px-4 py-2.5 border-b border-gray-100 mb-1">
                          <p className="text-xs text-gray-400 mb-0.5">Connecté en tant que</p>
                          <p className="text-sm font-semibold text-navy-900 truncate">{user.first_name} {user.last_name}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                        <Link to="/mes-commandes" className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg mx-1">
                          <Package size={14} className="text-gray-400" /> Mes commandes
                        </Link>
                        <button onClick={logout} className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg mx-1">
                          <LogOut size={14} /> Déconnexion
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-2 mb-1">
                          <p className="text-xs text-gray-400">Accédez à votre espace</p>
                        </div>
                        <Link to="/connexion" className="block px-4 py-2.5 text-sm font-medium text-navy-900 hover:bg-gray-50 mx-1 rounded-lg">
                          Se connecter
                        </Link>
                        <div className="px-3 pb-2">
                          <Link to="/inscription" className="block text-center py-2 bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium rounded-xl transition-colors">
                            Créer un compte
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link to="/panier"
                className="relative flex items-center gap-2 px-3 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white transition-colors">
                <ShoppingCart size={17} />
                {count > 0 ? (
                  <span className="text-xs font-bold min-w-[16px] text-center">{count > 99 ? '99+' : count}</span>
                ) : (
                  <span className="text-xs hidden sm:block">Panier</span>
                )}
              </Link>

              {/* Mobile menu toggle */}
              <button onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2.5 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors ml-1">
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <div className="max-w-7xl mx-auto px-6 py-4 space-y-1">
              <p className="text-[11px] text-gray-400 uppercase tracking-widest font-medium px-2 mb-2">Catégories</p>
              {categories.map(cat => {
                const Icon = cat.icon
                return (
                  <Link key={cat.slug} to={`/catalogue?category=${cat.slug}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 text-sm text-gray-700">
                    <Icon size={16} className={cat.color} />
                    {cat.label}
                  </Link>
                )
              })}
              <div className="border-t border-gray-100 pt-3 mt-3 space-y-1">
                <Link to="/catalogue" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-mint-600 hover:bg-mint-50">Tous les produits</Link>
                <Link to="/espace-pro" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm font-semibold text-amber-600 hover:bg-amber-50">Espace Pro</Link>
                {user ? (
                  <>
                    <Link to="/mes-commandes" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Mes commandes</Link>
                    <button onClick={() => { logout(); setMenuOpen(false) }} className="block w-full text-left px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50">Déconnexion</button>
                  </>
                ) : (
                  <Link to="/connexion" onClick={() => setMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-sm text-gray-700 hover:bg-gray-50">Connexion / Inscription</Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
