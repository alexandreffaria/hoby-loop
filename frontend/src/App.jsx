import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import ConsumerCheckout from './pages/ConsumerCheckout'

// --- Seller Dashboard Component (The one we built before) ---
function SellerDashboard() {
  const [subscriptions, setSubscriptions] = useState([])
  
  useEffect(() => {
    axios.get('http://localhost:8080/sellers/1/subscriptions')
      .then(res => setSubscriptions(res.data.data))
      .catch(console.error)
  }, [])

  return (
    <div className="max-w-md mx-auto min-h-screen p-5 font-sans text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-sm font-black text-gray-400 uppercase tracking-widest">{subscriptions.length} Assinantes</h1>
        <Link to="/checkout/101" className="text-xs bg-gray-200 px-2 py-1 rounded text-blue-600 font-bold">View Consumer Page</Link>
      </div>
      <div className="space-y-4">
        {subscriptions.map(sub => (
           <div key={sub.ID} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
             <h2 className="text-lg font-black uppercase">{sub.user.name}</h2>
             <p className="text-sm text-gray-500 font-medium mb-3">{sub.basket.name}</p>
             <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold uppercase rounded-lg">{sub.frequency}</span>
           </div>
        ))}
      </div>
    </div>
  )
}

// --- Main Router ---
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SellerDashboard />} />
        {/* Pass Basket ID 101 as a test */}
        <Route path="/checkout/:id" element={<ConsumerCheckout />} />
      </Routes>
    </BrowserRouter>
  )
}