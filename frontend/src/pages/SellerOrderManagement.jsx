import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { t } from '../i18n'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'

export default function SellerOrderManagement() {
  const { basketId } = useParams()
  const navigate = useNavigate()
  const [basket, setBasket] = useState(null)
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all')
  
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    if (!user || user.role !== 'seller') {
      navigate('/')
      return
    }

    // Fetch basket details
    axios.get(`http://localhost:8080/baskets/${basketId}`)
      .then(res => setBasket(res.data.data))
      .catch(console.error)

    // Fetch orders for this basket
    fetchOrders()
  }, [basketId])

  const fetchOrders = () => {
    axios.get(`http://localhost:8080/baskets/${basketId}/orders`)
      .then(res => setOrders(res.data.data || []))
      .catch(console.error)
  }

  const updateOrderStatus = (orderId, newStatus) => {
    axios.put(`http://localhost:8080/orders/${orderId}/status`, {
      status: newStatus
    })
      .then(() => {
        alert(t('seller.orderStatusUpdated'))
        fetchOrders()
      })
      .catch(err => {
        alert(t('seller.errorUpdatingOrder'))
        console.error(err)
      })
  }

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter)

  const getStatusVariant = (status) => {
    const variants = {
      pending: 'pending',
      preparing: 'preparing',
      shipped: 'shipped',
      delivered: 'delivered'
    }
    return variants[status] || 'default'
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      preparing: '📦',
      shipped: '🚚',
      delivered: '✅'
    }
    return icons[status] || '❓'
  }

  return (
    <div className="min-h-screen bg-[#000813] text-main-text">
      <div className="max-w-4xl mx-auto p-5 font-sans">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/seller')}
            className="text-purple-400 text-sm mb-3 hover:text-pink-400 transition-colors inline-flex items-center gap-1"
          >
            ← {t('common.back')}
          </button>
          <h1 className="text-3xl md:text-4xl font-black uppercase bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text mb-2">
            {basket?.name || t('seller.orderManagement')}
          </h1>
          <p className="text-sm text-gray-400">{t('seller.manageOrders')}</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {['all', 'preparing', 'shipped', 'delivered'].map(status => {
            const count = status === 'all' ? orders.length : orders.filter(o => o.status === status).length
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap border-2 ${
                  filter === status
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent shadow-lg'
                    : 'bg-gray-900/50 text-gray-400 hover:text-white border-gray-800 hover:border-purple-500/30'
                }`}
              >
                {t(`order.filter.${status}`)}
                <span className="ml-2 px-2 py-0.5 bg-black/30 rounded-full text-xs">
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/30 rounded-2xl border border-gray-800">
            <p className="text-gray-500 text-lg mb-2">📦</p>
            <p className="text-gray-500">{t('seller.noOrders')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map(order => (
              <div
                key={order.ID}
                className="p-1 rounded-2xl bg-gradient-to-r from-purple-500/30 to-blue-500/30 hover:from-purple-500/40 hover:to-blue-500/40 transition-all"
              >
                <div className="bg-[#000813] p-5 rounded-xl">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-black uppercase text-white mb-1">
                        {order.subscription?.user?.name || t('common.unknown')}
                      </h3>
                      <p className="text-sm text-gray-400 mb-2">
                        {t('order.orderId')}: <span className="font-mono text-purple-400">#{order.ID}</span>
                      </p>
                      {order.scheduled_date && (
                        <p className="text-sm font-bold text-pink-400 flex items-center gap-2">
                          <span>📅</span>
                          {t('order.scheduledFor')}: {new Date(order.scheduled_date).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {t('order.createdAt')}: {new Date(order.CreatedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge
                      variant={getStatusVariant(order.status)}
                      size="lg"
                      icon={getStatusIcon(order.status)}
                    >
                      {t(`order.${order.status}`)}
                    </Badge>
                  </div>

                  {/* Customer Address */}
                  {order.subscription?.user && (
                    <div className="mb-4 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                      <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 font-bold">
                        📍 {t('order.deliveryAddress')}
                      </p>
                      <p className="text-sm text-white">
                        {order.subscription.user.address_street}, {order.subscription.user.address_number}
                      </p>
                      <p className="text-sm text-white">
                        {order.subscription.user.address_city}, {order.subscription.user.address_state}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        CEP: {order.subscription.user.address_zip}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 flex-wrap">
                    {order.status === 'preparing' && (
                      <Button
                        onClick={() => updateOrderStatus(order.ID, 'shipped')}
                        variant="primary"
                      >
                        🚚 {t('order.markAsShipped')}
                      </Button>
                    )}
                    {order.status === 'shipped' && (
                      <Button
                        onClick={() => updateOrderStatus(order.ID, 'delivered')}
                        variant="success"
                      >
                        ✅ {t('order.markAsDelivered')}
                      </Button>
                    )}
                    {order.status === 'delivered' && (
                      <Badge variant="success" size="lg" icon="✅">
                        {t('order.completed')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
