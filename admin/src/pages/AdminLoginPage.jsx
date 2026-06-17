import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      if (user.role !== 'admin') {
        toast.error('Accès réservé aux administrateurs')
        return
      }
      toast.success('Connexion réussie')
      navigate('/admin')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Identifiants invalides')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-mint-500/10 rounded-2xl mb-4">
            <Lock size={24} className="text-mint-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">Administration</h1>
          <p className="text-navy-300 text-sm mt-1">Haddley & Cooper</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-navy-800 border border-navy-700 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-navy-300 mb-1">Email</label>
            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full bg-navy-900 border border-navy-700 rounded-xl px-4 py-3 text-sm text-white placeholder-navy-400 focus:outline-none focus:border-mint-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-navy-300 mb-1">Mot de passe</label>
            <div className="relative">
              <input type={show ? 'text' : 'password'} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                className="w-full bg-navy-900 border border-navy-700 rounded-xl px-4 py-3 pr-10 text-sm text-white focus:outline-none focus:border-mint-500 transition-colors" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-white">
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-mint-500 hover:bg-mint-400 disabled:opacity-50 text-navy-900 font-bold py-3 rounded-xl transition-colors mt-2">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className="text-center text-navy-500 text-xs mt-6">Accès réservé aux administrateurs</p>
      </div>
    </div>
  )
}
