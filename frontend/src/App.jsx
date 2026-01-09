import { BrowserRouter, Routes, Route } from 'react-router-dom'
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/seller/orders/:basketId" element={<SellerOrderManagement />} />
        <Route path="/consumer" element={<ConsumerDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/checkout/:id" element={<ConsumerCheckout />} />
        <Route path="/config" element={<ConfigPage />} />
        <Route path="/seller-registration" element={<SellerRegistration />} />
        <Route path="/subscriber-registration" element={<SubscriberRegistration />} />
      </Routes>
    </BrowserRouter>
  )
}