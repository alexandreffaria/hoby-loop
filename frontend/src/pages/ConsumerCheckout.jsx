import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import PageContainer from '../components/layout/PageContainer'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { t } from '../i18n'

export default function ConsumerCheckout() {
  const { id } = useParams()
  const [basket, setBasket] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch basket details
    axios.get(`http://localhost:8080/baskets/${id}`)
      .then(res => {
        setBasket(res.data.data)
        setLoading(false)
      })
      .catch(err => alert(t('checkout.errorLoading')))
  }, [id])

  // Get frequency display information
  const getFrequencyInfo = () => {
    const frequency = basket.frequency || 'weekly'
    
    const frequencyMap = {
      weekly: {
        label: t('checkout.weeklyDeliveries'),
        description: t('checkout.weeklyDescription'),
        icon: '📅',
        gradient: 'from-purple-500 to-pink-500'
      },
      biweekly: {
        label: t('checkout.biweeklyDeliveries'),
        description: t('checkout.biweeklyDescription'),
        icon: '📆',
        gradient: 'from-blue-500 to-cyan-500'
      },
      monthly: {
        label: t('checkout.monthlyDeliveries'),
        description: t('checkout.monthlyDescription'),
        icon: '🗓️',
        gradient: 'from-indigo-500 to-purple-500'
      }
    }

    return frequencyMap[frequency] || frequencyMap.weekly
  }

  // Handle subscription
  const handleSubscribe = () => {
    // Get authenticated user from localStorage
    const user = JSON.parse(localStorage.getItem('user'))
    
    if (!user || !user.ID) {
      alert(t('checkout.loginRequired'))
      return
    }
    
    // Use basket's frequency or default to weekly with warning
    const subscriptionFrequency = basket.frequency || 'weekly'
    
    if (!basket.frequency) {
      console.warn(t('checkout.frequencyWarning'))
    }
    
    axios.post('http://localhost:8080/subscriptions', {
      user_id: user.ID,
      basket_id: parseInt(id),
      frequency: subscriptionFrequency
    })
    .then(() => alert(t('checkout.successMessage')))
    .catch(err => alert(t('checkout.errorMessage')))
  }

  if (loading) return <div className="p-10 text-center">{t('common.loading')}</div>

  const frequencyInfo = getFrequencyInfo()

  return (
    <div className="min-h-screen bg-[#000813] py-8 px-4">
      <PageContainer maxWidth="max-w-2xl">
        <div className="space-y-6">

          {/* Product Card */}
          <div className="bg-[#000813] rounded-3xl p-6 md:p-8 border-2 border-purple-500/30 text-center shadow-2xl shadow-purple-500/20">
            {/* Image Placeholder */}
            <div className="w-32 h-32 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl mx-auto mb-6 flex items-center justify-center text-xs text-gray-500 border border-purple-500/20">
              📦 {t('checkout.productImage')}
            </div>

            <h1 className="text-3xl md:text-4xl font-black uppercase text-white mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
              {basket.name}
            </h1>
            <p className="text-3xl md:text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-6">
              R$ {basket.price}
            </p>

            {/* Dropdowns (Visual only for now) */}
            <div className="space-y-3">
              <div className="bg-gray-900/50 p-4 rounded-xl flex justify-between items-center cursor-pointer border border-gray-800 hover:border-purple-500/30 transition-colors">
                <span className="font-medium text-sm text-gray-300">{t('checkout.description')}</span>
                <span className="text-gray-500">▼</span>
              </div>

              <div className="bg-gray-900/50 p-4 rounded-xl flex justify-between items-center cursor-pointer border border-gray-800 hover:border-purple-500/30 transition-colors">
                <span className="font-medium text-sm text-gray-300">{t('checkout.sixMonths')}</span>
                <span className="text-gray-500">▼</span>
              </div>
            </div>
          </div>

          {/* Delivery Frequency Card */}
          <div className="bg-[#000813] rounded-3xl p-6 md:p-8 border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20">
            <h3 className="text-sm font-bold text-purple-400 uppercase mb-4 tracking-wide">
              📅 {t('checkout.deliveryFrequency')}
            </h3>
            
            {/* Frequency Display */}
            <div className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${frequencyInfo.gradient} shadow-lg`}>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{frequencyInfo.icon}</span>
                  <div>
                    <h4 className="text-xl md:text-2xl font-black text-white uppercase">
                      {frequencyInfo.label}
                    </h4>
                    <p className="text-sm text-white/90 mt-1">
                      {frequencyInfo.description}
                    </p>
                  </div>
                </div>
                
                {/* Warning if frequency is missing */}
                {!basket.frequency && (
                  <div className="mt-3 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                    <p className="text-xs text-yellow-200">
                      ⚠️ {t('checkout.frequencyWarning')}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
            </div>
            
            {/* Additional info */}
            <div className="mt-4 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
              <p className="text-xs text-gray-400 text-center">
                💡 Esta é a frequência de entrega definida para esta cesta
              </p>
            </div>
          </div>

          {/* Address Section */}
          <div className="bg-[#000813] rounded-3xl p-6 md:p-8 border-2 border-purple-500/30 space-y-4 shadow-2xl shadow-purple-500/20">
            <h3 className="text-sm font-bold text-purple-400 uppercase mb-4 tracking-wide">
              📍 {t('checkout.address')}
            </h3>
            <div className="flex gap-3">
               <Input placeholderI18nKey="checkout.zipCode" className="w-1/3" />
               <Input placeholderI18nKey="checkout.street" className="w-2/3" />
            </div>
            <div className="flex gap-3">
               <Input placeholderI18nKey="checkout.complement" className="w-2/3" />
               <div className="w-1/3 bg-gray-900 p-3 rounded-xl text-sm flex items-center justify-center text-gray-400 font-bold border-2 border-gray-800">FLN/SC</div>
            </div>
            <Input placeholderI18nKey="checkout.reference" />
          </div>

          {/* Payment Section */}
          <div className="bg-[#000813] rounded-3xl p-6 md:p-8 border-2 border-purple-500/30 space-y-4 shadow-2xl shadow-purple-500/20">
            <h3 className="text-sm font-bold text-purple-400 uppercase mb-4 tracking-wide">
              💳 {t('checkout.payment')}
            </h3>

            <div className="flex gap-3">
              <Input placeholderI18nKey="checkout.cardData" className="flex-1" />
              <Input placeholderI18nKey="checkout.expiryDate" className="w-24" />
            </div>
            <Input placeholderI18nKey="checkout.cardName" />
            <Input placeholderI18nKey="checkout.documentNumber" />
          </div>

          {/* Checkout Button */}
          <Button onClick={handleSubscribe} fullWidth variant="primary">
            ✨ {t('login.accessAccount')}
          </Button>

          {/* Back Link */}
          <div className="text-center pt-4">
            <button
              onClick={() => window.history.back()}
              className="text-gray-500 hover:text-gray-400 transition-colors text-sm"
            >
              ← Voltar
            </button>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}
