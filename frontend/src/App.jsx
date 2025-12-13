import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login' 
import SellerDashboard from './pages/SellerDashboard'
import ConsumerDashboard from './pages/ConsumerDashboard'
import ConsumerCheckout from './pages/ConsumerCheckout'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/consumer" element={<ConsumerDashboard />} />
        <Route path="/checkout/:id" element={<ConsumerCheckout />} />
      </Routes>
    </BrowserRouter>
  )
}