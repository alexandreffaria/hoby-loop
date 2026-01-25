import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AdminRoute, SellerRoute, ConsumerRoute } from './components/auth/RoleRoute'
import Login from './pages/Login'
import SellerDashboard from './pages/SellerDashboard'
import SellerOrderManagement from './pages/SellerOrderManagement'
import ConsumerDashboard from './pages/ConsumerDashboard'
import ConsumerCheckout from './pages/ConsumerCheckout'
import ConfigPage from './pages/ConfigPage'
import AdminDashboard from './pages/AdminDashboard'
import Landing from './pages/Landing'
import SellerRegistration from './pages/SellerRegistration'
import SubscriberRegistration from './pages/SubscriberRegistration'
import Unauthorized from './pages/Unauthorized'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/seller-registration" element={<SellerRegistration />} />
        <Route path="/subscriber-registration" element={<SubscriberRegistration />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Admin Routes - Only accessible by admin role */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        
        {/* Seller Routes - Only accessible by seller role */}
        <Route
          path="/seller"
          element={
            <SellerRoute>
              <SellerDashboard />
            </SellerRoute>
          }
        />
        <Route
          path="/seller/orders/:basketId"
          element={
            <SellerRoute>
              <SellerOrderManagement />
            </SellerRoute>
          }
        />
        
        {/* Consumer Routes - Only accessible by consumer role */}
        <Route
          path="/consumer"
          element={
            <ConsumerRoute>
              <ConsumerDashboard />
            </ConsumerRoute>
          }
        />
        <Route
          path="/checkout/:id"
          element={
            <ConsumerRoute>
              <ConsumerCheckout />
            </ConsumerRoute>
          }
        />
        
        {/* Config Route - Accessible by authenticated users (seller or consumer) */}
        <Route
          path="/config"
          element={
            <ConsumerRoute>
              <ConfigPage />
            </ConsumerRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}