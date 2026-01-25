import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { t } from '../i18n'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState('clients')
  const [subscriptions, setSubscriptions] = useState([])
  const [baskets, setBaskets] = useState([])
  
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    // Security Check
    if (!user || user.role !== 'seller') {
      navigate('/')
      return
    }

    // Fetch Clients
    axios.get(`http://localhost:8080/sellers/${user.ID}/subscriptions`)
      .then(res => setSubscriptions(res.data.data || []))
      .catch(console.error)

    // Fetch Products
    axios.get(`http://localhost:8080/sellers/${user.ID}/baskets`)
      .then(res => setBaskets(res.data.data || []))
      .catch(console.error)
  }, [])

  const copyLink = (id) => {
    const link = `${window.location.origin}/checkout/${id}`
    navigator.clipboard.writeText(link)
    alert(t("alerts.linkCopied", { link }))
  }

  const logout = () => {
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#000813] text-main-text">
      <div className="max-w-4xl mx-auto p-5 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
              {t('seller.title')}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {t('common.welcome', { name: user?.name })}
            </p>
          </div>
          
          <div className="flex gap-3 items-center">
            <button
              onClick={() => navigate('/config')}
              className="text-2xl hover:scale-110 transition-transform"
              title={t('common.settings')}
            >
              ⚙️
            </button>
            <button
              onClick={logout}
              className="text-sm text-red-400 font-bold hover:text-red-300 transition-colors"
            >
              {t('common.logout')}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-900/50 rounded-xl p-1 mb-8 border border-purple-500/30">
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex-1 px-4 py-3 text-sm font-bold rounded-lg transition-all duration-300 ${
              activeTab === 'clients'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            👥 {t('seller.tabClients')}
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 px-4 py-3 text-sm font-bold rounded-lg transition-all duration-300 ${
              activeTab === 'products'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📦 {t('seller.tabProducts')}
          </button>
        </div>

        {/* Content */}
        {activeTab === 'clients' ? (
          <div className="space-y-4">
            {subscriptions.length === 0 ? (
              <div className="text-center py-12 bg-gray-900/30 rounded-2xl border border-gray-800">
                <p className="text-gray-500 text-lg mb-2">👥</p>
                <p className="text-gray-500 text-sm">{t('seller.noActiveSubscribers')}</p>
              </div>
            ) : (
              subscriptions.map(sub => (
                <div
                  key={sub.ID}
                  className="p-1 rounded-2xl bg-gradient-to-r from-blue-500/30 to-purple-500/30 hover:from-blue-500/40 hover:to-purple-500/40 transition-all"
                >
                  <div className="bg-[#000813] p-5 rounded-xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div className="flex-1">
                        <h2 className="text-xl font-black uppercase text-white mb-1">
                          {sub.user.name}
                        </h2>
                        <p className="text-sm text-gray-400 font-medium mb-3">
                          📦 {sub.basket.name}
                        </p>
                      </div>
                      <Badge variant="info" size="md">
                        {sub.frequency}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {baskets.length === 0 ? (
              <div className="col-span-2 text-center py-12 bg-gray-900/30 rounded-2xl border border-gray-800">
                <p className="text-gray-500 text-lg mb-2">📦</p>
                <p className="text-gray-500 text-sm">{t('seller.noRegisteredProducts')}</p>
              </div>
            ) : (
              baskets.map(basket => (
                <div
                  key={basket.ID}
                  className="p-1 rounded-2xl bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 hover:from-purple-500/40 hover:via-pink-500/40 hover:to-blue-500/40 transition-all cursor-pointer group"
                  onClick={() => navigate(`/seller/orders/${basket.ID}`)}
                >
                  <div className="bg-[#000813] p-5 rounded-xl h-full flex flex-col">
                    <h2 className="text-xl font-black uppercase text-white mb-2 group-hover:text-purple-400 transition-colors">
                      {basket.name}
                    </h2>
                    <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-4">
                      R$ {basket.price}
                    </p>
                    <div className="mt-auto space-y-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          copyLink(basket.ID)
                        }}
                        fullWidth
                        variant="outline"
                      >
                        🔗 {t('common.copyLink')}
                      </Button>
                      <p className="text-xs text-gray-500 text-center">
                        Clique no card para ver pedidos
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}