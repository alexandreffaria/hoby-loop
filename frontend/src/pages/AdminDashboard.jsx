import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { ENDPOINTS } from '../config/api'
import { t } from '../i18n'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [baskets, setBaskets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Get logged in admin user
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))
  
  // Parse permissions from JSON string
  const permissions = user?.permissions ? JSON.parse(user.permissions) : {}

  useEffect(() => {
    // Security Check - only allow admins
    if (!user || user.role !== 'admin') {
      navigate('/')
      return
    }

    // Check if admin is active
    if (!user.is_active) {
      alert(t('alerts.adminDeactivated'))
      localStorage.removeItem('user')
      navigate('/')
      return
    }

    setIsLoading(true)

    // Configure headers with authentication
    const headers = { 'X-User-ID': user?.ID.toString() }

    // Fetch all users
    axios.get(ENDPOINTS.ADMIN_USERS, { headers })
      .then(res => {
        setUsers(res.data.data || [])
        setIsLoading(false)
      })
      .catch(err => {
        console.error(err)
        setIsLoading(false)
      })

    // Fetch all subscriptions
    axios.get(ENDPOINTS.ADMIN_SUBSCRIPTIONS, { headers })
      .then(res => {
        setSubscriptions(res.data.data || [])
      })
      .catch(console.error)

    // Fetch all baskets
    axios.get(ENDPOINTS.ADMIN_BASKETS, { headers })
      .then(res => {
        setBaskets(res.data.data || [])
      })
      .catch(console.error)
  }, [])

  // Logout Helper
  const logout = () => {
    localStorage.removeItem('user')
    navigate('/')
  }

  // Helper to get user role counts
  const getUserCounts = () => {
    const counts = { seller: 0, consumer: 0, admin: 0 }
    users.forEach(user => {
      if (counts.hasOwnProperty(user.role)) {
        counts[user.role]++
      }
    })
    return counts
  }

  return (
    <div className="max-w-4xl mx-auto min-h-screen p-5 font-sans text-main-text">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase bg-gradient-secondary-tertiary text-transparent bg-clip-text">{t('admin.title')}</h1>
          <p className="text-xs text-gray-400">{t('common.welcome', { name: user?.name })}</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => navigate('/config')} className="text-2xl" title={t('common.settings')}>⚙️</button>
          <button onClick={logout} className="text-xs text-red-400 font-bold underline self-center">{t('common.logout')}</button>
        </div>
      </div>

      {/* Admin Dashboard Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-1 rounded-2xl bg-gradient-secondary-tertiary">
          <div className="bg-background p-4 rounded-xl">
            <h2 className="text-sm font-bold text-gray-400 uppercase">{t('admin.users')}</h2>
            <p className="text-3xl font-black">{users.length}</p>
            <div className="mt-2 text-xs text-gray-500">
              <span className="mr-2">{t('admin.sellers')}: {getUserCounts().seller}</span>
              <span className="mr-2">{t('admin.consumers')}: {getUserCounts().consumer}</span>
              <span>{t('admin.admins')}: {getUserCounts().admin}</span>
            </div>
          </div>
        </div>
        <div className="p-1 rounded-2xl bg-gradient-tertiary-forth">
          <div className="bg-background p-4 rounded-xl">
            <h2 className="text-sm font-bold text-gray-400 uppercase">{t('admin.subscriptions')}</h2>
            <p className="text-3xl font-black">{subscriptions.length}</p>
          </div>
        </div>
        <div className="p-1 rounded-2xl bg-gradient-secondary-forth">
          <div className="bg-background p-4 rounded-xl">
            <h2 className="text-sm font-bold text-gray-400 uppercase">{t('admin.baskets')}</h2>
            <p className="text-3xl font-black">{baskets.length}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-background rounded-lg p-1 mb-6 border-2 border-transparent bg-gradient-to-r from-secondary to-tertiary">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 px-3 py-2 text-xs font-bold rounded-md transition-all duration-300 ${activeTab === 'users' ? 'bg-background text-main-text' : 'text-gray-400'}`}
        >
          {t('admin.tabUsers')}
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`flex-1 px-3 py-2 text-xs font-bold rounded-md transition-all duration-300 ${activeTab === 'subscriptions' ? 'bg-background text-main-text' : 'text-gray-400'}`}
        >
          {t('admin.tabSubscriptions')}
        </button>
        <button
          onClick={() => setActiveTab('baskets')}
          className={`flex-1 px-3 py-2 text-xs font-bold rounded-md transition-all duration-300 ${activeTab === 'baskets' ? 'bg-background text-main-text' : 'text-gray-400'}`}
        >
          {t('admin.tabBaskets')}
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-10">
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      )}

      {/* Users Tab */}
      {!isLoading && activeTab === 'users' && (
        <div className="p-1 rounded-2xl bg-gradient-secondary-tertiary">
          <div className="bg-background p-4 rounded-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('admin.table.name')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('admin.table.email')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('admin.table.role')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('admin.table.status')}</th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-gray-800">
                  {users.map(user => (
                  <tr key={user.ID} className="hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-main-text">{user.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${user.role === 'admin' ? 'bg-purple-900 text-purple-300' :
                          user.role === 'seller' ? 'bg-green-900 text-green-300' :
                          'bg-blue-900 text-blue-300'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${user.is_active !== false ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        {user.is_active !== false ? t('common.active') : t('common.inactive')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}

      {/* Subscriptions Tab */}
      {!isLoading && activeTab === 'subscriptions' && (
        <div className="space-y-4">
          {subscriptions.length === 0 && <p className="text-center text-gray-400 text-sm">{t('admin.noActiveSubscriptions')}</p>}
          {subscriptions.map(sub => (
            <div key={sub.ID} className="p-1 rounded-2xl bg-gradient-tertiary-forth">
              <div className="bg-background p-4 rounded-xl flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-black uppercase text-main-text">{sub.user?.name || t('common.unknown')}</h2>
                  <p className="text-sm text-gray-400">{t('admin.basketInfo', { name: sub.basket?.name || t('common.unknown') })}</p>
                  <p className="text-sm text-gray-400">Status: <span className={`font-bold ${sub.status === 'Active' ? 'text-green-400' : 'text-yellow-400'}`}>{sub.status}</span></p>
                </div>
                <div className="text-right">
                  <span className="block text-lg font-bold text-main-text">R$ {sub.basket?.price || 0}</span>
                  <span className="text-xs text-gray-500 uppercase">{sub.frequency}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Baskets Tab */}
      {!isLoading && activeTab === 'baskets' && (
        <div className="space-y-4">
          {baskets.length === 0 && <p className="text-center text-gray-400 text-sm">{t('admin.noProductsAvailable')}</p>}
          {baskets.map(basket => (
            <div key={basket.ID} className="p-1 rounded-2xl bg-gradient-secondary-forth">
              <div className="bg-background p-4 rounded-xl flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-black uppercase text-main-text">{basket.name}</h2>
                  <p className="text-sm text-gray-400">{basket.description}</p>
                </div>
                <div className="text-right">
                  <span className="block text-lg font-bold text-main-text">R$ {basket.price}</span>
                  <span className="text-xs text-gray-500">{t('admin.sellerId', { id: basket.seller_id || basket.UserID })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}