import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ENDPOINTS } from '../config/api';
import { getUser, setUser, isSeller } from '../utils/auth';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function ConfigPage() {
  const navigate = useNavigate();
  const [user, setUserState] = useState(getUser());
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    cnpj: user?.cnpj || '',
    cpf: user?.cpf || '',
    address_street: user?.address_street || '',
    address_number: user?.address_number || '',
    address_zip: user?.address_zip || '',
    address_city: user?.address_city || '',
    address_state: user?.address_state || ''
  });

  const userIsSeller = isSeller();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        ENDPOINTS.UPDATE_USER(user.ID), 
        formData
      );
      
      // Merge the response data with the local user object
      const updatedUser = { ...user, ...response.data.data };
      setUser(updatedUser);
      
      alert("Dados salvos com sucesso!");
      navigate(userIsSeller ? '/seller' : '/consumer');
    } catch (error) {
      alert("Erro ao salvar dados. Por favor, tente novamente.");
    }
  };

  return (
    <PageContainer 
      title={userIsSeller ? 'Dados da Empresa' : 'Meus Dados'} 
      maxWidth="max-w-md"
    >
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
        
        {/* Identity Section */}
        <Input
          label={userIsSeller ? 'Nome Fantasia' : 'Nome Completo'}
          name="name"
          value={formData.name}
          onChange={handleChange}
        />

        <div className="flex gap-4">
          <Input
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full"
          />
          
          {/* Conditional Field: CNPJ or CPF */}
          <Input
            label={userIsSeller ? 'CNPJ' : 'CPF'}
            name={userIsSeller ? "cnpj" : "cpf"}
            value={userIsSeller ? formData.cnpj : formData.cpf}
            onChange={handleChange}
            className="w-2/3"
          />
        </div>

        {/* Address Section */}
        <div className="pt-4 border-t border-gray-100">
          <span className="block text-xs font-bold text-blue-500 uppercase mb-4">Endereço de Entrega</span>
          
          <div className="flex gap-3 mb-3">
            <Input
              name="address_zip"
              placeholder="CEP"
              value={formData.address_zip}
              onChange={handleChange}
              className="w-1/3"
            />
            <Input
              name="address_city"
              placeholder="Cidade"
              value={formData.address_city}
              onChange={handleChange}
              className="w-2/3"
            />
          </div>

          <div className="flex gap-3 mb-3">
            <Input
              name="address_street"
              placeholder="Rua"
              value={formData.address_street}
              onChange={handleChange}
              className="w-3/4"
            />
            <Input
              name="address_number"
              placeholder="Nº"
              value={formData.address_number}
              onChange={handleChange}
              className="w-1/4"
            />
          </div>
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleSave}
            fullWidth
          >
            Salvar Alterações
          </Button>
          <button 
            onClick={() => navigate(-1)} 
            className="w-full mt-3 text-gray-400 text-xs font-bold py-2 uppercase hover:text-gray-600"
          >
            Cancelar
          </button>
        </div>

      </div>
    </PageContainer>
  );
}