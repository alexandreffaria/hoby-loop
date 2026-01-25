import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';
import { setUser } from '../utils/auth';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { t } from '../i18n';

export default function Login() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userType = searchParams.get('type') || 'subscriber';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
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
      setError(t("login.userNotFound"));
      setLoading(false);
    }
  };

  const fillEmail = (val) => {
    setEmail(val);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#000813] flex items-center justify-center p-6">
      <PageContainer maxWidth="max-w-md">
        <div className="bg-[#000813] p-8 rounded-3xl border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black uppercase mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
              {t('login.title')}
            </h1>
            <p className="text-gray-400 text-sm">
              {userType === 'seller' ? '🏪 Área do Vendedor' : '🛒 Área do Cliente'}
            </p>
          </div>
          
          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              type="email"
              labelI18nKey="login.email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholderI18nKey="login.emailPlaceholder"
              required
              error={error}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
              i18nKey="login.accessAccount"
            />
          </form>

          {/* Create Account Link */}
          <div className="mt-6 text-center">
            <Link
              to={userType === 'seller' ? '/seller-registration' : '/subscriber-registration'}
              className="text-purple-400 hover:text-pink-400 transition-colors font-bold text-sm inline-flex items-center gap-2"
            >
              <span>✨</span>
              {t('login.createAccount')}
            </Link>
          </div>

          {/* Demo Accounts Section */}
          <div className="mt-8 pt-6 border-t border-gray-800">
            <p className="font-bold mb-4 uppercase tracking-wider text-center text-xs text-gray-500">
              {t('login.clickToTest')}
            </p>
            
            <div className="space-y-4">
              {/* Admin */}
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                <p className="font-bold text-purple-400 mb-2 text-center text-xs uppercase tracking-wide">
                  {t('login.administrator')}
                </p>
                <button
                  onClick={() => fillEmail('admin@hobyloop.com')}
                  className="block w-full text-center text-sm text-gray-300 hover:text-purple-400 transition-colors py-1 rounded hover:bg-gray-800"
                >
                  {t('login.adminUser')}
                </button>
              </div>
              
              {/* Sellers */}
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                <p className="font-bold text-blue-400 mb-2 text-center text-xs uppercase tracking-wide">
                  {t('login.sellers')}
                </p>
                <button
                  onClick={() => fillEmail('ada-conceicao@cirino.com')}
                  className="block w-full text-center text-sm text-gray-300 hover:text-blue-400 transition-colors py-1 rounded hover:bg-gray-800 mb-1"
                >
                  {t('login.seller1')}
                </button>
                <button
                  onClick={() => fillEmail('lunaferreira@da.com')}
                  className="block w-full text-center text-sm text-gray-300 hover:text-blue-400 transition-colors py-1 rounded hover:bg-gray-800"
                >
                  {t('login.seller2')}
                </button>
              </div>

              {/* Clients */}
              <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                <p className="font-bold text-green-400 mb-2 text-center text-xs uppercase tracking-wide">
                  {t('login.clients')}
                </p>
                <button
                  onClick={() => fillEmail('aliciacirino@example.com')}
                  className="block w-full text-center text-sm text-gray-300 hover:text-green-400 transition-colors py-1 rounded hover:bg-gray-800 mb-1"
                >
                  {t('login.client1')}
                </button>
                <button
                  onClick={() => fillEmail('enrico30@example.org')}
                  className="block w-full text-center text-sm text-gray-300 hover:text-green-400 transition-colors py-1 rounded hover:bg-gray-800"
                >
                  {t('login.client2')}
                </button>
              </div>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-gray-500 hover:text-gray-400 transition-colors text-xs"
            >
              ← Voltar para início
            </Link>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}