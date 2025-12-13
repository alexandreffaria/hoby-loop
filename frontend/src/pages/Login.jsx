import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Login() {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    
    axios.post('http://localhost:8080/login', { email })
      .then(res => {
        const user = res.data.data
        localStorage.setItem('user', JSON.stringify(user))
        
        if (user.role === 'seller') {
          navigate('/seller')
        } else {
          navigate('/consumer')
        }
      })
      .catch(() => alert("Usuário não encontrado! Verifique os emails de teste abaixo."))
  }

  const fillEmail = (val) => setEmail(val)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-sm w-full bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-black text-gray-800 mb-6 uppercase tracking-widest text-center">Entrar</h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: ada-conceicao@cirino.com"
              className="w-full bg-gray-50 p-4 rounded-xl text-sm outline-none border border-transparent focus:border-blue-500 transition-colors"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl uppercase tracking-wide hover:bg-black transition-transform active:scale-95"
          >
            Acessar Conta
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-500">
          <p className="font-bold mb-3 text-gray-400 uppercase tracking-wider">Clique para testar:</p>
          
          <div className="space-y-3">
            <div>
              <p className="font-bold text-blue-600 mb-1">🛍️ Vendedores</p>
              {/* Updated based on your current data.json */}
              <button onClick={() => fillEmail('ada-conceicao@cirino.com')} className="block hover:underline mb-1">
                Viana (Seller 1)
              </button>
              <button onClick={() => fillEmail('lunaferreira@da.com')} className="block hover:underline">
                Barros Ferreira (Seller 2)
              </button>
            </div>

            <div>
              <p className="font-bold text-green-600 mb-1">👤 Clientes</p>
              {/* Updated based on your current data.json */}
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
    </div>
  )
}