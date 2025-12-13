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
        // 1. Save user to LocalStorage (Simple Session)
        localStorage.setItem('user', JSON.stringify(user))
        
        // 2. Redirect based on Role
        if (user.role === 'seller') {
          navigate('/seller')
        } else {
          navigate('/consumer')
        }
      })
      .catch(() => alert("Usuário não encontrado! Verifique os emails de teste abaixo."))
  }

  // Helper to quick-fill emails
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
              placeholder="ex: knovais@pires.com"
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
              <button onClick={() => fillEmail('knovais@pires.com')} className="block hover:underline mb-1">
                Alex (Seller 1) - <span className="text-gray-400">knovais@pires.com</span>
              </button>
              <button onClick={() => fillEmail('opimenta@da.com')} className="block hover:underline">
                Pimenta (Seller 2) - <span className="text-gray-400">opimenta@da.com</span>
              </button>
            </div>

            <div>
              <p className="font-bold text-green-600 mb-1">👤 Clientes</p>
              <button onClick={() => fillEmail('vitor04@example.com')} className="block hover:underline mb-1">
                Otto (User 10) - <span className="text-gray-400">vitor04@example.com</span>
              </button>
              <button onClick={() => fillEmail('isabellasilveira@example.org')} className="block hover:underline">
                Carolina (User 16) - <span className="text-gray-400">isabellasilveira@example.org</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}