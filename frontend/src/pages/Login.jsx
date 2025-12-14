import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';
import { setUser } from '../utils/auth';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

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
      
      // Navigate to the appropriate dashboard
      navigate(user.role === 'seller' ? '/seller' : '/consumer');
    } catch (error) {
      alert("Usuário não encontrado! Verifique os emails de teste abaixo.");
    }
  };

  const fillEmail = (val) => setEmail(val);

  return (
    <PageContainer maxWidth="max-w-sm">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-black text-gray-800 mb-6 uppercase tracking-widest text-center">
          Entrar
        </h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            type="email"
            label="Email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ex: ada-conceicao@cirino.com"
            required
          />

          <Button 
            type="submit"
            variant="primary"
            fullWidth
          >
            Acessar Conta
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-500">
          <p className="font-bold mb-3 text-gray-400 uppercase tracking-wider">
            Clique para testar:
          </p>
          
          <div className="space-y-3">
            <div>
              <p className="font-bold text-blue-600 mb-1">🛍️ Vendedores</p>
              <button onClick={() => fillEmail('ada-conceicao@cirino.com')} className="block hover:underline mb-1">
                Viana (Seller 1)
              </button>
              <button onClick={() => fillEmail('lunaferreira@da.com')} className="block hover:underline">
                Barros Ferreira (Seller 2)
              </button>
            </div>

            <div>
              <p className="font-bold text-green-600 mb-1">👤 Clientes</p>
              <button onClick={() => fillEmail('aliciacirino@example.com')} className="block hover:underline mb-1">
                Luiz Gustavo (User 10)
              </button>
              <button onClick={() => fillEmail('enrico30@example.org')} className="block hover:underline">
                Eduardo (User 11)
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}