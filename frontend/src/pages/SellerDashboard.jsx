import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState('clients')
  const [subscriptions, setSubscriptions] = useState([])
  const [baskets, setBaskets] = useState([])
  
  // NEW: Get logged in user
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    // Security Check
    if (!user || user.role !== 'seller') {
      navigate('/')
      return
    }

    // 1. Fetch Clients (Using dynamic user.ID)
    axios.get(`http://localhost:8080/sellers/${user.ID}/subscriptions`)
      .then(res => setSubscriptions(res.data.data))
      .catch(console.error)

    // 2. Fetch Products
    axios.get(`http://localhost:8080/sellers/${user.ID}/baskets`)
      .then(res => setBaskets(res.data.data))
      .catch(console.error)
  }, [])

  const copyLink = (id) => {
    const link = `${window.location.origin}/checkout/${id}`
    navigator.clipboard.writeText(link)
    alert("Link copiado! Envie para seu cliente:\n" + link)
  }

  // Logout Helper
  const logout = () => {
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <div className="max-w-md mx-auto min-h-screen p-5 font-sans text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-800 uppercase">Dashboard</h1>
          <p className="text-xs text-gray-400">Olá, {user?.name}</p>
        </div>
        
        <div className="flex gap-3">
          {/* NEW: Config Button */}
          <button onClick={() => navigate('/config')} className="text-2xl" title="Configurações">⚙️</button>
          <button onClick={logout} className="text-xs text-red-400 font-bold underline self-center">Sair</button>
        </div>
      </div>
           <div className="flex bg-white rounded-lg p-1 shadow-sm border border-gray-100 mb-6">
          <button 
            onClick={() => setActiveTab('clients')}
            className={`flex-1 px-3 py-2 text-xs font-bold rounded-md transition-colors ${activeTab === 'clients' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
          >
            CLIENTES
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`flex-1 px-3 py-2 text-xs font-bold rounded-md transition-colors ${activeTab === 'products' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
          >
            PRODUTOS
          </button>
      </div>

      {activeTab === 'clients' ? (
        <div className="space-y-4">
          {subscriptions.length === 0 && <p className="text-center text-gray-400 text-sm">Nenhum assinante ativo.</p>}
          {subscriptions.map(sub => (
            <div key={sub.ID} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-black uppercase">{sub.user.name}</h2>
              <p className="text-sm text-gray-500 font-medium mb-3">{sub.basket.name}</p>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold uppercase rounded-lg">{sub.frequency}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
           {baskets.length === 0 && <p className="text-center text-gray-400 text-sm">Nenhum produto cadastrado.</p>}
           {baskets.map(basket => (
            <div key={basket.ID} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-black uppercase text-gray-800">{basket.name}</h2>
              <p className="text-xl font-bold text-gray-900 mb-4">R$ {basket.price}</p>
              <button onClick={() => copyLink(basket.ID)} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl text-sm uppercase">
                🔗 Copiar Link
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}