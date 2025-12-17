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

  // Handle subscription
  const handleSubscribe = () => {
    // For demo, we're subscribing a hardcoded user
    // In a real app, this would use the authenticated user
    axios.post('http://localhost:8080/subscriptions', {
      user_id: 10, // Hardcoded Consumer "Otto" for demo
      basket_id: parseInt(id),
      frequency: "monthly"
    })
    .then(() => alert(t('checkout.successMessage')))
    .catch(err => alert(t('checkout.errorMessage')))
  }

  if (loading) return <div className="p-10 text-center">{t('common.loading')}</div>

  return (
    <PageContainer maxWidth="max-w-md">
      <div className="space-y-6">

        {/* Product Card */}
        <div className="bg-background rounded-3xl p-6 border border-gray-800 text-center">
          {/* Image Placeholder */}
          <div className="w-32 h-32 bg-gray-900 rounded-2xl mx-auto mb-6 flex items-center justify-center text-xs text-gray-500">
            {t('checkout.productImage')}
          </div>

          <h1 className="text-2xl font-black uppercase text-main-text mb-6 bg-gradient-secondary-tertiary text-transparent bg-clip-text">
            {basket.name}
          </h1>
          <p className="text-2xl font-bold mb-6">R$ {basket.price}</p>

          {/* Dropdowns (Visual only for now) */}
          <div className="space-y-4">
            <div className="bg-gray-900 p-3 rounded-xl flex justify-between items-center cursor-pointer">
              <span className="font-medium text-sm">{t('checkout.description')}</span>
              <span className="text-gray-500">▼</span>
            </div>

            <div className="bg-gray-900 p-3 rounded-xl flex justify-between items-center cursor-pointer">
              <span className="font-medium text-sm">{t('checkout.sixMonths')}</span>
              <span className="text-gray-500">▼</span>
            </div>

            <div className="bg-gray-900 p-3 rounded-xl flex justify-between items-center cursor-pointer">
              <span className="font-medium text-sm">{t('checkout.monthly')}</span>
              <span className="text-gray-500">▼</span>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-background rounded-3xl p-6 border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-secondary uppercase mb-2">{t('checkout.address')}</h3>
          <div className="flex gap-3">
             <Input placeholderI18nKey="checkout.zipCode" className="w-1/3" />
             <Input placeholderI18nKey="checkout.street" className="w-2/3" />
          </div>
          <div className="flex gap-3">
             <Input placeholderI18nKey="checkout.complement" className="w-2/3" />
             <div className="w-1/3 bg-gray-900 p-3 rounded-xl text-sm flex items-center justify-center text-gray-400 font-bold border border-gray-800">FLN/SC</div>
          </div>
          <Input placeholderI18nKey="checkout.reference" />
        </div>

        {/* Payment Section */}
        <div className="bg-background rounded-3xl p-6 border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-secondary uppercase mb-2">{t('checkout.payment')}</h3>

          <div className="flex gap-3">
            <Input placeholderI18nKey="checkout.cardData" className="flex-1" />
            <Input placeholderI18nKey="checkout.expiryDate" className="w-24" />
          </div>
          <Input placeholderI18nKey="checkout.cardName" />
          <Input placeholderI18nKey="checkout.documentNumber" />
        </div>

        {/* Checkout Button */}
        <Button onClick={handleSubscribe} fullWidth variant="primary" i18nKey="login.accessAccount" />
      </div>
    </PageContainer>
  )
}