import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, BarChart3, Settings, LogOut, Menu, X, Bell, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: ShoppingCart, label: 'Commandes', href: '/admin/commandes', badge: null },
  { icon: Package, label: 'Produits', href: '/admin/produits' },
  { icon: Tag, label: 'Catégories', href: '/admin/categories' },
  { icon: Users, label: 'Clients', href: '/admin/clients' },
  { icon: BarChart3, label: 'Statistiques', href: '/admin/stats' },
]

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(true)
  const location = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/connexion') }

  return (
    <div className="flex h-screen bg-gray-50 font-body overflow-hidden">
      {/* Sidebar */}
      <aside className={`${open ? 'w-60' : 'w-16'} transition-all duration-300 bg-navy-900 flex flex-col shrink-0`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-navy-800">
          {open ? (
            <div className="flex items-center justify-between w-full">
              <div>
                <span className="font-display font-bold text-white text-base">H<span className="text-mint-400">&</span>C</span>
                <span className="text-navy-300 text-xs ml-2">Admin</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-navy-400 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
          ) : (
            <button onClick={() => setOpen(true)} className="text-navy-400 hover:text-white mx-auto">
              <Menu size={18} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV.map(({ icon: Icon, label, href, badge }) => {
            const active = location.pathname === href || (href !== '/admin' && location.pathname.startsWith(href))
            return (
              <Link key={href} to={href}
                className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-colors mb-0.5 group
                  ${active ? 'bg-mint-500/15 text-mint-400' : 'text-navy-300 hover:text-white hover:bg-navy-800'}`}>
                <Icon size={18} className="shrink-0" />
                {open && <span className="text-sm font-medium">{label}</span>}
                {open && badge && <span className="ml-auto bg-mint-500 text-navy-900 text-xs font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User */}
        <div className="border-t border-navy-800 p-3">
          {open ? (
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-mint-500/20 flex items-center justify-center text-mint-400 text-sm font-bold">
                {user?.first_name?.[0] || 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-navy-400 truncate">{user?.email}</p>
              </div>
            </div>
          ) : null}
          <button onClick={handleLogout}
            className={`flex items-center gap-2 w-full px-2 py-2 text-navy-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors ${!open ? 'justify-center' : ''}`}>
            <LogOut size={16} />
            {open && <span className="text-xs">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            {location.pathname.split('/').filter(Boolean).map((seg, i, arr) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <ChevronRight size={12} />}
                <span className={i === arr.length - 1 ? 'text-navy-900 font-medium capitalize' : 'capitalize'}>{seg}</span>
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
              <Bell size={18} />
            </button>
            <Link to="/" target="_blank" className="text-xs text-mint-600 hover:underline font-medium">
              Voir le site →
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
