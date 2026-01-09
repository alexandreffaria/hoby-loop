import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { t } from '../i18n'
import Button from '../components/ui/Button'

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
    alert(t("alerts.linkCopied", { link }))
  }

  // Logout Helper
  const logout = () => {
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <div className="max-w-md mx-auto min-h-screen p-5 font-sans text-main-text">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase bg-gradient-secondary-tertiary text-transparent bg-clip-text">{t('seller.title')}</h1>
          <p className="text-xs text-gray-400">{t('common.welcome', { name: user?.name })}</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => navigate('/config')} className="text-2xl" title={t('common.settings')}>⚙️</button>
          <button onClick={logout} className="text-xs text-red-400 font-bold underline self-center">{t('common.logout')}</button>
        </div>
      </div>
      <div className="flex bg-background rounded-lg p-1 mb-6 border-2 border-transparent bg-gradient-to-r from-secondary to-tertiary">
        <button
          onClick={() => setActiveTab('clients')}
          className={`flex-1 px-3 py-2 text-xs font-bold rounded-md transition-all duration-300 ${activeTab === 'clients' ? 'bg-background text-main-text' : 'text-gray-400'}`}
        >
          {t('seller.tabClients')}
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 px-3 py-2 text-xs font-bold rounded-md transition-all duration-300 ${activeTab === 'products' ? 'bg-background text-main-text' : 'text-gray-400'}`}
        >
          {t('seller.tabProducts')}
        </button>
      </div>

      {activeTab === 'clients' ? (
        <div className="space-y-4">
          {subscriptions.length === 0 && <p className="text-center text-gray-500 text-sm">{t('seller.noActiveSubscribers')}</p>}
          {subscriptions.map(sub => (
            <div key={sub.ID} className="p-1 rounded-2xl bg-gradient-tertiary-forth">
              <div className="bg-background p-4 rounded-xl">
                <h2 className="text-lg font-black uppercase text-main-text">{sub.user.name}</h2>
                <p className="text-sm text-gray-400 font-medium mb-3">{sub.basket.name}</p>
                <span className="px-3 py-1 bg-gray-800 text-secondary text-xs font-bold uppercase rounded-lg">{sub.frequency}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
           {baskets.length === 0 && <p className="text-center text-gray-500 text-sm">{t('seller.noRegisteredProducts')}</p>}
           {baskets.map(basket => (
            <div
              key={basket.ID}
              className="p-1 rounded-2xl bg-gradient-secondary-forth cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate(`/seller/orders/${basket.ID}`)}
            >
              <div className="bg-background p-4 rounded-xl">
                <h2 className="text-lg font-black uppercase text-main-text">{basket.name}</h2>
                <p className="text-xl font-bold text-main-text mb-4">R$ {basket.price}</p>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    copyLink(basket.ID)
                  }}
                  fullWidth
                  i18nKey="common.copyLink"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}