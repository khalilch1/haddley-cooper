import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, Shield, Truck, Award, Users, Zap, ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import api from '../utils/api'

const HERO_SLIDES = [
  {
    tag: 'Nettoyage Extérieur',
    title: 'Rénovateur Terrasse Haute Performance',
    sub: 'Mousse, pollution et traces de temps n\'ont qu\'à bien se tenir.',
    cta: 'Découvrir', href: '/catalogue?category=hygiene-sols',
    bg: 'from-navy-900 via-navy-800 to-navy-900',
    accent: 'text-mint-400',
    emoji: '🏡'
  },
  {
    tag: 'Désinfection Pro',
    title: 'Détergent Multi-Surfaces Expert',
    sub: 'La propreté au millimètre. Dégraisse, nettoie et fait briller.',
    cta: 'Voir les produits', href: '/catalogue?category=hygiene-surfaces',
    bg: 'from-navy-900 via-slate-800 to-navy-900',
    accent: 'text-gold-400',
    emoji: '✨'
  },
  {
    tag: 'Univers Piscine',
    title: 'L\'Éclat Cristallin Retrouvé',
    sub: 'Notre formule ultra-concentrée élimine calcaire et impuretés instantanément.',
    cta: 'Explorer', href: '/catalogue?category=univers-piscine',
    bg: 'from-slate-900 via-navy-800 to-navy-900',
    accent: 'text-blue-400',
    emoji: '💦'
  }
]

const CATEGORIES = [
  { label: 'Hygiène des sols', slug: 'hygiene-sols', icon: '🧹', count: null },
  { label: 'Hygiène des surfaces', slug: 'hygiene-surfaces', icon: '🫧', count: null },
  { label: 'Hygiène des mains', slug: 'hygiene-mains', icon: '🧴', count: null },
  { label: 'Hygiène des sanitaires', slug: 'hygiene-sanitaires', icon: '🚿', count: null },
  { label: 'Collecte des déchets', slug: 'collecte-dechets', icon: '♻️', count: null },
  { label: 'Univers Piscine', slug: 'univers-piscine', icon: '🏊', count: null },
]

export default function HomePage() {
  const [slide, setSlide] = useState(0)
  const [products, setProducts] = useState([])
  const [newProducts, setNewProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 6000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    Promise.all([
      api.get('/products?featured=true&limit=8'),
      api.get('/products?new=true&limit=4')
    ]).then(([feat, nov]) => {
      setProducts(feat.data.products)
      setNewProducts(nov.data.products)
    }).finally(() => setLoading(false))
  }, [])

  const current = HERO_SLIDES[slide]

  return (
    <div>
      {/* Hero */}
      <section className={`relative bg-gradient-to-br ${current.bg} text-white overflow-hidden transition-all duration-1000`}>
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-2xl">
            <span className={`inline-block text-xs font-semibold uppercase tracking-widest ${current.accent} mb-4 bg-white/5 px-3 py-1.5 rounded-full`}>
              {current.emoji} {current.tag}
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-6 text-balance">
              {current.title}
            </h1>
            <p className="text-navy-200 text-lg leading-relaxed mb-8">{current.sub}</p>
            <div className="flex flex-wrap gap-3">
              <Link to={current.href}
                className="inline-flex items-center gap-2 bg-mint-500 hover:bg-mint-400 text-navy-900 font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-mint-500/25">
                {current.cta} <ArrowRight size={16} />
              </Link>
              <Link to="/catalogue"
                className="inline-flex items-center gap-2 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200">
                Tout le catalogue
              </Link>
            </div>
          </div>
        </div>
        {/* Slide controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === slide ? 'bg-mint-400 w-6' : 'bg-white/30 hover:bg-white/50'}`} />
          ))}
        </div>
        <button onClick={() => setSlide(s => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
          <ChevronLeft size={20} />
        </button>
        <button onClick={() => setSlide(s => (s + 1) % HERO_SLIDES.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
          <ChevronRight size={20} />
        </button>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[['10+', 'ans d\'expérience'], ['5000+', 'produits référencés'], ['50 000+', 'clients satisfaits'], ['Made in 🇫🇷', 'produits français']].map(([val, label]) => (
            <div key={label}>
              <p className="font-display text-3xl font-bold text-navy-900">{val}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-mint-600 text-sm font-medium uppercase tracking-wide mb-1">Parcourir</p>
            <h2 className="font-display text-3xl font-bold text-navy-900">Nos catégories</h2>
          </div>
          <Link to="/catalogue" className="text-sm font-medium text-navy-700 hover:text-mint-600 flex items-center gap-1 transition-colors">
            Tout voir <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map(cat => (
            <Link key={cat.slug} to={`/catalogue?category=${cat.slug}`}
              className="group flex flex-col items-center gap-3 p-5 bg-gray-50 hover:bg-navy-900 rounded-2xl transition-all duration-300 text-center cursor-pointer">
              <span className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</span>
              <span className="text-sm font-medium text-navy-800 group-hover:text-white transition-colors leading-tight">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="bg-gray-50/50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-mint-600 text-sm font-medium uppercase tracking-wide mb-1">Sélection</p>
              <h2 className="font-display text-3xl font-bold text-navy-900">Nos produits phares</h2>
            </div>
            <Link to="/catalogue?featured=true" className="text-sm font-medium text-navy-700 hover:text-mint-600 flex items-center gap-1 transition-colors">
              Voir tout <ArrowRight size={14} />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Pro banner */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="relative bg-gradient-to-r from-navy-900 to-navy-800 rounded-3xl p-8 md:p-12 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-mint-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-gold-500/10 rounded-full translate-y-1/2" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block bg-gold-500/20 text-gold-400 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
              Espace Professionnel
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Vous êtes professionnel ?
            </h2>
            <p className="text-navy-200 text-lg mb-6">
              Accédez à nos tarifs préférentiels, commandez en grandes quantités et bénéficiez d'un accompagnement dédié.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/espace-pro"
                className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-navy-900 font-semibold px-6 py-3 rounded-xl transition-colors">
                Accéder à l'espace pro <ArrowRight size={16} />
              </Link>
              <Link to="/contact"
                className="inline-flex items-center gap-2 border border-white/20 text-white hover:bg-white/5 font-medium px-6 py-3 rounded-xl transition-colors">
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Nouveautés */}
      {newProducts.length > 0 && (
        <section className="bg-gray-50/50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-mint-600 text-sm font-medium uppercase tracking-wide mb-1">Arrivals</p>
                <h2 className="font-display text-3xl font-bold text-navy-900">Nouveautés du moment</h2>
              </div>
              <Link to="/catalogue?new=true" className="text-sm font-medium text-navy-700 hover:text-mint-600 flex items-center gap-1">
                Voir tout <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {newProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <p className="text-mint-600 text-sm font-medium uppercase tracking-wide mb-1">Avis clients</p>
          <h2 className="font-display text-3xl font-bold text-navy-900">Ils nous font confiance</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Marie L.', role: 'Particulière', rating: 5, text: 'Des produits vraiment professionnels à des prix imbattables. La livraison est rapide et le service client très réactif.' },
            { name: 'Pierre D.', role: 'Restaurateur', rating: 5, text: 'Je commande régulièrement pour mon restaurant. Les produits ANIOS sont de qualité pro. Je recommande vivement !' },
            { name: 'Sophie M.', role: 'Infirmière libérale', rating: 5, text: 'Les gels hydroalcooliques sont parfaits pour ma pratique. Prix correct et livraison en 24h top.' },
          ].map(({ name, role, rating, text }) => (
            <div key={name} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex gap-0.5 mb-3">
                {[...Array(rating)].map((_, i) => <Star key={i} size={14} className="fill-gold-500 text-gold-500" />)}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">"{text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-navy-100 flex items-center justify-center text-navy-700 font-bold text-sm">
                  {name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-navy-900">{name}</p>
                  <p className="text-xs text-gray-400">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
