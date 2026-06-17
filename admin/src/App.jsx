import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import AdminLayout from './components/AdminLayout'
import AdminLoginPage from './pages/AdminLoginPage'
import DashboardPage from './pages/DashboardPage'
import ProductsPage from './pages/ProductsPage'
import OrdersPage from './pages/OrdersPage'
import CustomersPage from './pages/CustomersPage'
import CategoriesPage from './pages/CategoriesPage'
import StatsPage from './pages/StatsPage'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/connexion" replace />
  if (user.role !== 'admin') return <Navigate to="/connexion" replace />
  return <AdminLayout>{children}</AdminLayout>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/connexion" element={<AdminLoginPage />} />
      <Route path="/admin" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/admin/produits" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
      <Route path="/admin/commandes" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      <Route path="/admin/clients" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
      <Route path="/admin/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
      <Route path="/admin/stats" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Inter, sans-serif', fontSize: '14px' } }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
