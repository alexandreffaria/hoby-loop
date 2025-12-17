import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';
import { setUser } from '../utils/auth';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { t } from '../i18n';

export default function Login() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(ENDPOINTS.LOGIN, { email });
      const user = response.data.data;
      
      // Save user to localStorage using our auth utility
      setUser(user);
      
      // Navigate to the appropriate dashboard based on role
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'seller') {
        navigate('/seller');
      } else {
        navigate('/consumer');
      }
    } catch (error) {
      alert(t("login.userNotFound"));
    }
  };

  const fillEmail = (val) => setEmail(val);

  return (
    <PageContainer maxWidth="max-w-sm">
      <div className="bg-background p-8 rounded-3xl border border-gray-800">
        <h1 className="text-3xl font-black text-main-text mb-6 uppercase tracking-widest text-center bg-gradient-secondary-tertiary text-transparent bg-clip-text">
          {t('login.title')}
        </h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            type="email"
            labelI18nKey="login.email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholderI18nKey="login.emailPlaceholder"
            required
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            i18nKey="login.accessAccount"
          />
        </form>

        <div className="mt-8 pt-6 border-t border-gray-800 text-xs text-gray-400">
          <p className="font-bold mb-4 uppercase tracking-wider text-center">
            {t('login.clickToTest')}
          </p>
          
          <div className="space-y-4">
            <div>
              <p className="font-bold text-tertiary mb-2 text-center">{t('login.administrator')}</p>
              <button onClick={() => fillEmail('admin@hobyloop.com')} className="block w-full text-center hover:text-secondary transition-colors">
                {t('login.adminUser')}
              </button>
            </div>
            
            <div>
              <p className="font-bold text-forth mb-2 text-center">{t('login.sellers')}</p>
              <button onClick={() => fillEmail('ada-conceicao@cirino.com')} className="block w-full text-center hover:text-secondary transition-colors mb-1">
                {t('login.seller1')}
              </button>
              <button onClick={() => fillEmail('lunaferreira@da.com')} className="block w-full text-center hover:text-secondary transition-colors">
                {t('login.seller2')}
              </button>
            </div>

            <div>
              <p className="font-bold text-green-400 mb-2 text-center">{t('login.clients')}</p>
              <button onClick={() => fillEmail('aliciacirino@example.com')} className="block w-full text-center hover:text-secondary transition-colors mb-1">
                {t('login.client1')}
              </button>
              <button onClick={() => fillEmail('enrico30@example.org')} className="block w-full text-center hover:text-secondary transition-colors">
                {t('login.client2')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}