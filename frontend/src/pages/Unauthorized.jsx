import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';

/**
 * Unauthorized Page
 * 
 * Displayed when a user tries to access a route they don't have permission for.
 * Provides options to go back or logout.
 */
export default function Unauthorized() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <PageContainer>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30">
              <svg 
                className="w-12 h-12 text-red-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-4">
            Acesso Negado
          </h1>

          {/* Description */}
          <p className="text-gray-400 mb-8 text-lg">
            Você não tem permissão para acessar esta página. 
            Verifique se está usando a conta correta ou entre em contato com o administrador.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGoBack}
              variant="secondary"
              className="px-6 py-3"
            >
              ← Voltar
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="primary"
              className="px-6 py-3"
            >
              Sair da Conta
            </Button>
          </div>

          {/* Additional Help Text */}
          <div className="mt-8 pt-8 border-t border-gray-800">
            <p className="text-sm text-gray-500">
              Se você acredita que deveria ter acesso a esta página, 
              entre em contato com o suporte.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
