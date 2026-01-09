import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { t } from '../i18n'

export default function ConsumerDashboard() {
  const [subscriptions, setSubscriptions] = useState([])
  const [orders, setOrders] = useState({}) // Store orders by subscription ID
  
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  
  useEffect(() => {
    if (!user || user.role !== 'consumer') {
      navigate('/')
      return
    }
    
    // Fetch consumer subscriptions
    axios.get(`http://localhost:8080/consumers/${user.ID}/subscriptions`)
      .then(res => {
        const subs = res.data.data || []
        setSubscriptions(subs)
        
        // Fetch orders for each subscription
        subs.forEach(sub => {
          axios.get(`http://localhost:8080/subscriptions/${sub.ID}/orders`)
            .then(orderRes => {
              setOrders(prev => ({
                ...prev,
                [sub.ID]: orderRes.data.data || []
              }))
            })
            .catch(console.error)
        })
      })
      .catch(console.error)
  }, [])
  
  const logout = () => {
    localStorage.removeItem('user')
    navigate('/')
  }

  // Get the most recent order for a subscription
  const getLatestOrder = (subscriptionId) => {
    const subOrders = orders[subscriptionId]
    if (!subOrders || subOrders.length === 0) return null
    return subOrders[0] // Orders are sorted by created_at DESC
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'preparing': return '📦'
      case 'shipped': return '🚚'
      case 'delivered': return '✅'
      default: return '❓'
    }
  }

  // Get status text
  const getStatusText = (status) => {
    switch(status) {
      case 'preparing': return t('order.preparing')
      case 'shipped': return t('order.shipped')
      case 'delivered': return t('order.delivered')
      default: return status
    }
  }

  return (
    <div className="max-w-md mx-auto min-h-screen p-5 font-sans text-main-text">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase bg-gradient-secondary-tertiary text-transparent bg-clip-text">
            {t('consumer.title')}
          </h1>
          <p className="text-xs text-gray-400">{t('common.welcome', { name: user?.name })}</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => navigate('/config')} className="text-2xl" title={t('common.settings')}>⚙️</button>
          <button onClick={logout} className="text-xs text-red-400 font-bold underline self-center">
            {t('common.logout')}
          </button>
        </div>
      </div>

      {subscriptions.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">{t('consumer.noActiveSubscriptions')}</p>
      ) : (
        <div className="space-y-4">
          {subscriptions.map(sub => {
            const latestOrder = getLatestOrder(sub.ID)
            return (
              <div key={sub.ID} className="p-1 rounded-2xl bg-gradient-secondary-forth">
                <div className="bg-background p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h2 className="text-lg font-black uppercase text-main-text">{sub.basket.name}</h2>
                      <p className="text-sm text-gray-400">
                        {t('common.status')} <span className="text-green-400 font-bold">{sub.status}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="block text-lg font-bold text-main-text">R$ {sub.basket.price}</span>
                      <span className="text-xs text-gray-500 uppercase">{sub.frequency}</span>
                    </div>
                  </div>
                  
                  {/* Order Status */}
                  {latestOrder && (
                    <div className="mt-3 pt-3 border-t border-gray-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getStatusIcon(latestOrder.status)}</span>
                          <div>
                            <p className="text-sm font-bold text-main-text">
                              {getStatusText(latestOrder.status)}
                            </p>
                            {latestOrder.tracking_code && (
                              <p className="text-xs text-gray-500">
                                {t('order.tracking')}: {latestOrder.tracking_code}
                              </p>
                            )}
                          </div>
                        </div>
                        {orders[sub.ID] && orders[sub.ID].length > 1 && (
                          <span className="text-xs text-gray-500">
                            +{orders[sub.ID].length - 1} {t('order.previousOrders')}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
