import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function ConfigPage() {
  const navigate = useNavigate()
  // Load user from session
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    // Initialize new fields from our updated User model
    cnpj: user?.cnpj || '',
    cpf: user?.cpf || '',
    address_street: user?.address_street || '',
    address_number: user?.address_number || '',
    address_zip: user?.address_zip || '',
    address_city: user?.address_city || '',
    address_state: user?.address_state || ''
  })

  const isSeller = user?.role === 'seller'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = () => {
    axios.put(`http://localhost:8080/users/${user.ID}`, formData)
      .then(res => {
        // Merge the response data (which has the updated fields) into the local user object
        const updatedUser = { ...user, ...res.data.data }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        alert("Dados salvos com sucesso!")
        
        // Redirect to the correct dashboard
        navigate(isSeller ? '/seller' : '/consumer')
      })
      .catch(err => alert("Erro ao salvar."))
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-gray-800">
      <div className="max-w-md mx-auto">
        <h1 className="text-xl font-black text-gray-800 uppercase mb-6">
          {isSeller ? 'Dados da Empresa' : 'Meus Dados'}
        </h1>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
          
          {/* --- Dynamic Identity Section --- */}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
              {isSeller ? 'Nome Fantasia' : 'Nome Completo'}
            </label>
            <input name="name" value={formData.name} onChange={handleChange} className="w-full bg-gray-50 p-3 rounded-xl text-sm outline-none font-medium" />
          </div>

          <div className="flex gap-4">
            <div className="w-full">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email</label>
              <input name="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-50 p-3 rounded-xl text-sm outline-none text-gray-500" />
            </div>
            
            {/* Conditional Field: CNPJ or CPF */}
            <div className="w-2/3">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">
                {isSeller ? 'CNPJ' : 'CPF'}
              </label>
              <input 
                name={isSeller ? "cnpj" : "cpf"} 
                // We pick the correct value from state based on role
                value={isSeller ? formData.cnpj : formData.cpf} 
                onChange={handleChange} 
                className="w-full bg-gray-50 p-3 rounded-xl text-sm outline-none font-mono text-gray-600" 
              />
            </div>
          </div>

          {/* --- Address Section (Shared) --- */}
          <div className="pt-4 border-t border-gray-100">
            <span className="block text-xs font-bold text-blue-500 uppercase mb-4">Endereço de Entrega</span>
            
            <div className="flex gap-3 mb-3">
              <div className="w-1/3">
                <input name="address_zip" placeholder="CEP" value={formData.address_zip} onChange={handleChange} className="w-full bg-gray-50 p-3 rounded-xl text-sm outline-none" />
              </div>
              <div className="w-2/3">
                <input name="address_city" placeholder="Cidade" value={formData.address_city} onChange={handleChange} className="w-full bg-gray-50 p-3 rounded-xl text-sm outline-none" />
              </div>
            </div>

            <div className="flex gap-3 mb-3">
              <div className="w-3/4">
                <input name="address_street" placeholder="Rua" value={formData.address_street} onChange={handleChange} className="w-full bg-gray-50 p-3 rounded-xl text-sm outline-none" />
              </div>
              <div className="w-1/4">
                <input name="address_number" placeholder="Nº" value={formData.address_number} onChange={handleChange} className="w-full bg-gray-50 p-3 rounded-xl text-sm outline-none" />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleSave}
              className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl uppercase tracking-wide hover:bg-black transition-transform active:scale-95"
            >
              Salvar Alterações
            </button>
            <button onClick={() => navigate(-1)} className="w-full mt-3 text-gray-400 text-xs font-bold py-2 uppercase hover:text-gray-600">
              Cancelar
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}