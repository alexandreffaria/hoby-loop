import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import PageContainer from '../components/layout/PageContainer'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { t } from '../i18n'

export default function ConfigPage() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  // Security Check
  useEffect(() => {
    if (!user) {
      navigate('/')
    }
  }, [])

  const userIsSeller = user?.role === 'seller'

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    cpf: user?.cpf || '',
    cnpj: user?.cnpj || '',
    address_zip: user?.address_zip || '',
    address_street: user?.address_street || '',
    address_number: user?.address_number || '',
    address_city: user?.address_city || ''
  })

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // In a real app, this would update the user data
      // For demo purposes, just update local storage
      localStorage.setItem('user', JSON.stringify({...user, ...formData}))

      alert(t('config.successMessage'))
      navigate(userIsSeller ? '/seller' : '/consumer')
    } catch (error) {
      alert(t('config.errorMessage'))
    }
  }

  return (
    <PageContainer
      title={userIsSeller ? t('config.sellerTitle') : t('config.consumerTitle')}
      maxWidth="max-w-md"
    >
      <div className="bg-background p-6 rounded-2xl border border-gray-800 space-y-6">

        <Input
          labelI18nKey={userIsSeller ? 'config.companyName' : 'config.fullName'}
          name="name"
          value={formData.name}
          onChange={handleChange}
        />

        <div className="flex gap-4">
          <Input
            labelI18nKey="config.email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full"
          />
        </div>

        <div>
          <Input
            labelI18nKey={userIsSeller ? 'config.cnpj' : 'config.cpf'}
            name={userIsSeller ? "cnpj" : "cpf"}
            value={userIsSeller ? formData.cnpj : formData.cpf}
            onChange={handleChange}
            className="w-2/3"
          />
        </div>

        {/* Address Section */}
        <div className="pt-6 border-t border-gray-800">
          <span className="block text-xs font-bold text-secondary uppercase mb-4">{t('config.deliveryAddress')}</span>

          <div className="flex gap-3 mb-3">
            <Input
              name="address_zip"
              placeholderI18nKey="config.zipCode"
              value={formData.address_zip}
              onChange={handleChange}
              className="w-1/3"
            />
            <Input
              name="address_city"
              placeholderI18nKey="config.city"
              value={formData.address_city}
              onChange={handleChange}
              className="w-2/3"
            />
          </div>

          <div className="flex gap-3">
            <Input
              name="address_street"
              placeholderI18nKey="config.street"
              value={formData.address_street}
              onChange={handleChange}
              className="w-3/4"
            />
            <Input
              name="address_number"
              placeholderI18nKey="config.number"
              value={formData.address_number}
              onChange={handleChange}
              className="w-1/4"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-800">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            onClick={handleSubmit}
            i18nKey="common.save"
          />
          
          <button
            onClick={() => navigate(-1)}
            className="w-full mt-3 text-gray-500 text-xs font-bold py-2 uppercase hover:text-gray-300 transition-colors"
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    </PageContainer>
  )
}