import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { t } from '../i18n';
import logo from '../assets/hoby-loop-logo.png';

export default function SellerRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    cnpj: '',
    phone: '',
    email: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        role: 'seller',
        cnpj: formData.cnpj,
        address_street: formData.address,
        phone: formData.phone
      };
      
      await axios.post(ENDPOINTS.REGISTER, userData);
      
      // Navigate to login page after successful registration
      navigate('/login?type=seller');
    } catch (error) {
      console.error('Registration error:', error);
      setError(t('registration.seller.error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer maxWidth="max-w-sm">
      <div className="flex justify-center mb-6">
        <img src={logo} alt="Hoby Loop" className="h-12" />
      </div>
      
      <div className="bg-background p-8 rounded-3xl border border-gray-800">
        <h1 className="text-3xl font-black text-main-text mb-6 uppercase tracking-widest text-center bg-gradient-secondary-tertiary text-transparent bg-clip-text">
          {t('registration.seller.title')}
        </h1>
        
        {error && (
          <div className="bg-red-900/20 border border-red-900 p-3 rounded-lg text-red-500 mb-4 text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            label={t('registration.seller.name')}
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          
          <Input
            type="text"
            label={t('registration.seller.company')}
            name="company"
            value={formData.company}
            onChange={handleChange}
            required
          />
          
          <Input
            type="text"
            label={t('registration.seller.cnpj')}
            name="cnpj"
            value={formData.cnpj}
            onChange={handleChange}
            required
          />
          
          <Input
            type="tel"
            label={t('registration.seller.phone')}
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          
          <Input
            type="email"
            label={t('registration.seller.email')}
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          
          <Input
            type="text"
            label={t('registration.seller.address')}
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? t('common.loading') : t('registration.seller.submit')}
          </Button>
        </form>
      </div>
    </PageContainer>
  );
}