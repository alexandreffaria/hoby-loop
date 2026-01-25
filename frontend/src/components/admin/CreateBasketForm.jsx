import { useState, useEffect } from 'react'
import axios from 'axios'
import { ENDPOINTS } from '../../config/api'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { t } from '../../i18n'

/**
 * CreateBasketForm - Admin component for creating new baskets for sellers
 * Part of the concierge-first model where admins create baskets on behalf of sellers
 */
export default function CreateBasketForm({ onSuccess }) {
  const [sellers, setSellers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    seller_id: '',
    name: '',
    description: '',
    price: '',
    frequency: 'weekly'
  })

  // Get logged in admin user for authentication
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    // Fetch sellers for dropdown
    const headers = { 'X-User-ID': user?.ID.toString() }
    
    axios.get(`${ENDPOINTS.ADMIN_USERS}`, { headers })
      .then(res => {
        const allUsers = res.data.data || []
        const sellerUsers = allUsers.filter(u => u.role === 'seller')
        setSellers(sellerUsers)
      })
      .catch(err => {
        console.error('Failed to fetch sellers:', err)
        setError(t('admin.errors.fetchSellers'))
      })
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear messages when user starts typing
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    // Validate form
    if (!formData.seller_id || !formData.name || !formData.price || !formData.frequency) {
      setError(t('admin.errors.allFieldsRequired'))
      setIsLoading(false)
      return
    }

    // Validate price is positive
    if (parseFloat(formData.price) <= 0) {
      setError(t('admin.errors.pricePositive'))
      setIsLoading(false)
      return
    }

    try {
      const headers = { 'X-User-ID': user?.ID.toString() }
      
      const basketData = {
        seller_id: parseInt(formData.seller_id),
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        frequency: formData.frequency
      }

      await axios.post(ENDPOINTS.ADMIN_CREATE_BASKET, basketData, { headers })
      
      setSuccess(t('admin.success.basketCreated'))
      
      // Reset form
      setFormData({
        seller_id: '',
        name: '',
        description: '',
        price: '',
        frequency: 'weekly'
      })

      // Call success callback if provided
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500)
      }
    } catch (err) {
      console.error('Failed to create basket:', err)
      const errorMsg = err.response?.data?.error || t('admin.errors.createBasket')
      setError(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-1 rounded-2xl bg-gradient-secondary-tertiary">
      <div className="bg-background p-6 rounded-xl">
        <h2 className="text-xl font-black uppercase bg-gradient-secondary-tertiary text-transparent bg-clip-text mb-4">
          {t('admin.createBasket.title')}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seller Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">
              {t('admin.createBasket.seller')}
            </label>
            <select
              name="seller_id"
              value={formData.seller_id}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#0a0f1e] border-2 border-gray-800 rounded-lg text-main-text focus:border-secondary focus:outline-none transition-colors"
              required
            >
              <option value="">{t('admin.createBasket.selectSeller')}</option>
              {sellers.map(seller => (
                <option key={seller.ID} value={seller.ID}>
                  {seller.name} ({seller.email})
                </option>
              ))}
            </select>
          </div>

          {/* Basket Name */}
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">
              {t('admin.createBasket.basketName')}
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t('admin.createBasket.basketNamePlaceholder')}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">
              {t('admin.createBasket.description')}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t('admin.createBasket.descriptionPlaceholder')}
              className="w-full px-4 py-3 bg-[#0a0f1e] border-2 border-gray-800 rounded-lg text-main-text focus:border-secondary focus:outline-none transition-colors resize-none"
              rows="3"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">
              {t('admin.createBasket.price')}
            </label>
            <Input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              required
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase">
              {t('admin.createBasket.frequency')}
            </label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#0a0f1e] border-2 border-gray-800 rounded-lg text-main-text focus:border-secondary focus:outline-none transition-colors"
              required
            >
              <option value="weekly">{t('admin.createBasket.weekly')}</option>
              <option value="biweekly">{t('admin.createBasket.biweekly')}</option>
              <option value="monthly">{t('admin.createBasket.monthly')}</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-900/20 border-2 border-red-500 rounded-lg">
              <p className="text-red-400 text-sm font-bold">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-900/20 border-2 border-green-500 rounded-lg">
              <p className="text-green-400 text-sm font-bold">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? t('common.loading') : t('admin.createBasket.submit')}
          </Button>
        </form>
      </div>
    </div>
  )
}
