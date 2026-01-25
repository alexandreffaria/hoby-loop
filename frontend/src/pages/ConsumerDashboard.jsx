import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { t } from '../i18n'
import { getConsumerOrders } from '../config/api'
import Badge from '../components/ui/Badge'

export default function ConsumerDashboard() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  
  useEffect(() => {
    if (!user || user.role !== 'consumer') {
      navigate('/')
      return
    }
    
    // Fetch consumer orders using the new API endpoint
    getConsumerOrders(user.ID)
      .then(ordersData => {
        setOrders(ordersData)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error fetching orders:', error)
        setLoading(false)
      })
  }, [])
  
  const logout = () => {
    localStorage.removeItem('user')
    navigate('/')
  }

  // Format date in a user-friendly way
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const options = { weekday: 'long', day: 'numeric', month: 'long' }
    return date.toLocaleDateString('pt-BR', options)
  }

  // Get relative date text (Today, Tomorrow, In X days)
  const getRelativeDate = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)
    
    const diffTime = date - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return t('consumer.today')
    if (diffDays === 1) return t('consumer.tomorrow')
    if (diffDays > 1) return t('consumer.inDays', { days: diffDays })
    if (diffDays === -1) return t('consumer.daysAgo', { days: 1 })
    if (diffDays < -1) return t('consumer.daysAgo', { days: Math.abs(diffDays) })
    
    return ''
  }

  // Check if order is in the past
  const isPastOrder = (dateString) => {
    const date = new Date(dateString)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    date.setHours(0, 0, 0, 0)
    return date < today
  }

  // Get status variant for Badge component
  const getStatusVariant = (status) => {
    const variants = {
      pending: 'pending',
      preparing: 'preparing',
      shipped: 'shipped',
      delivered: 'delivered'
    }
    return variants[status] || 'default'
  }

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return '⏳'
      case 'preparing': return '📦'
      case 'shipped': return '🚚'
      case 'delivered': return '✅'
      default: return '❓'
    }
  }

  // Get status text
  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return t('order.pending')
      case 'preparing': return t('order.preparing')
      case 'shipped': return t('order.shipped')
      case 'delivered': return t('order.delivered')
      default: return status
    }
  }

  // Separate upcoming and past orders
  const upcomingOrders = orders.filter(order => !isPastOrder(order.scheduled_date))
  const pastOrders = orders.filter(order => isPastOrder(order.scheduled_date))

  return (
    <div className="min-h-screen bg-[#000813] text-main-text">
      <div className="max-w-4xl mx-auto p-5 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
              {t('consumer.deliveryCalendar')}
            </h1>
            <p className="text-sm text-gray-400 mt-1">{t('common.welcome', { name: user?.name })}</p>
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

        {loading ? (
          <div className="text-center py-16">
            <div className="animate-pulse text-gray-500 text-lg">⏳ {t('common.loading')}</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-2 border-purple-500/20">
              <p className="text-6xl mb-4">📦</p>
              <p className="text-gray-400 text-lg">{t('consumer.noOrders')}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Deliveries */}
            {upcomingOrders.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-3xl">📅</span>
                  {t('consumer.upcomingDeliveries')}
                </h2>
                <div className="space-y-4">
                  {upcomingOrders.map((order, index) => (
                    <div
                      key={order.ID}
                      className="relative p-1 rounded-2xl bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 hover:from-purple-500/40 hover:via-pink-500/40 hover:to-blue-500/40 transition-all"
                    >
                      {/* Next Delivery Badge */}
                      {index === 0 && (
                        <Badge
                          variant="gradient"
                          size="md"
                          className="absolute -top-3 left-4 shadow-lg"
                        >
                          {t('consumer.nextDelivery')}
                        </Badge>
                      )}
                      
                      <div className="bg-[#000813] p-5 rounded-xl">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                          <div className="flex-1">
                            <h3 className="text-xl md:text-2xl font-black uppercase text-white">
                              {order.subscription?.basket?.name || 'Cesta'}
                            </h3>
                            <p className="text-sm text-gray-400 mt-2">
                              {t('consumer.scheduledFor')} <span className="text-purple-400 font-semibold">{formatDate(order.scheduled_date)}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1 font-bold">
                              {getRelativeDate(order.scheduled_date)}
                            </p>
                          </div>
                          
                          {/* Status Badge */}
                          <Badge
                            variant={getStatusVariant(order.status)}
                            size="lg"
                            icon={getStatusIcon(order.status)}
                          >
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                        
                        {/* Tracking Code */}
                        {order.tracking_code && (order.status === 'shipped' || order.status === 'delivered') && (
                          <div className="mt-4 pt-4 border-t border-gray-800">
                            <p className="text-sm text-gray-400">
                              {t('order.tracking')}: <span className="text-blue-400 font-mono font-semibold">{order.tracking_code}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Deliveries */}
            {pastOrders.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-gray-500 mb-6 flex items-center gap-3">
                  <span className="text-2xl">📋</span>
                  {t('consumer.pastDeliveries')}
                </h2>
                <div className="space-y-3">
                  {pastOrders.map((order) => (
                    <div
                      key={order.ID}
                      className="p-1 rounded-xl bg-gradient-to-r from-gray-700/20 to-gray-600/20 opacity-75 hover:opacity-100 transition-opacity"
                    >
                      <div className="bg-[#000813] p-4 rounded-lg">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-300">
                              {order.subscription?.basket?.name || 'Cesta'}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatDate(order.scheduled_date)}
                            </p>
                          </div>
                          
                          {/* Status Badge */}
                          <Badge
                            variant={getStatusVariant(order.status)}
                            size="sm"
                            icon={getStatusIcon(order.status)}
                          >
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                        
                        {/* Tracking Code */}
                        {order.tracking_code && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">
                              {t('order.tracking')}: <span className="text-gray-400 font-mono">{order.tracking_code}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
