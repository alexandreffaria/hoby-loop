import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { t } from '../i18n'
import Button from '../components/ui/Button'

export default function SellerOrderManagement() {
  const { basketId } = useParams()
  const navigate = useNavigate()
  const [basket, setBasket] = useState(null)
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('all') // all, preparing, shipped, delivered
  
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
        fetchOrders() // Refresh orders
      })
      .catch(err => {
        alert(t('seller.errorUpdatingOrder'))
        console.error(err)
      })
  }

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter)

  const getStatusColor = (status) => {
    switch(status) {
      case 'preparing': return 'bg-yellow-900 text-yellow-300'
      case 'shipped': return 'bg-blue-900 text-blue-300'
      case 'delivered': return 'bg-green-900 text-green-300'
      default: return 'bg-gray-900 text-gray-300'
    }
  }

  return (
    <div className="max-w-4xl mx-auto min-h-screen p-5 font-sans text-main-text">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button 
            onClick={() => navigate('/seller')} 
            className="text-secondary text-sm mb-2 hover:underline"
          >
            ← {t('common.back')}
          </button>
          <h1 className="text-2xl font-black uppercase bg-gradient-secondary-tertiary text-transparent bg-clip-text">
            {basket?.name || t('seller.orderManagement')}
          </h1>
          <p className="text-xs text-gray-400">{t('seller.manageOrders')}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {['all', 'preparing', 'shipped', 'delivered'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              filter === status 
                ? 'bg-gradient-secondary-tertiary text-white' 
                : 'bg-gray-900 text-gray-400 hover:text-white'
            }`}
          >
            {t(`order.filter.${status}`)}
            <span className="ml-2 text-xs">
              ({status === 'all' ? orders.length : orders.filter(o => o.status === status).length})
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">{t('seller.noOrders')}</p>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => (
            <div key={order.ID} className="p-1 rounded-2xl bg-gradient-tertiary-forth">
              <div className="bg-background p-4 rounded-xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-main-text">
                      {order.subscription?.user?.name || t('common.unknown')}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {t('order.orderId')}: #{order.ID}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.CreatedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                    {t(`order.${order.status}`)}
                  </span>
                </div>

                {/* Customer Address */}
                {order.subscription?.user && (
                  <div className="mb-4 p-3 bg-gray-900 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">{t('order.deliveryAddress')}</p>
                    <p className="text-sm text-main-text">
                      {order.subscription.user.address_street}, {order.subscription.user.address_number}
                    </p>
                    <p className="text-sm text-main-text">
                      {order.subscription.user.address_city}, {order.subscription.user.address_state}
                    </p>
                    <p className="text-sm text-gray-400">
                      CEP: {order.subscription.user.address_zip}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  {order.status === 'preparing' && (
                    <Button
                      onClick={() => updateOrderStatus(order.ID, 'shipped')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      🚚 {t('order.markAsShipped')}
                    </Button>
                  )}
                  {order.status === 'shipped' && (
                    <Button
                      onClick={() => updateOrderStatus(order.ID, 'delivered')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      ✅ {t('order.markAsDelivered')}
                    </Button>
                  )}
                  {order.status === 'delivered' && (
                    <span className="text-green-400 text-sm font-bold">
                      ✅ {t('order.completed')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
