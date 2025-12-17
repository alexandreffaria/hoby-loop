import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function ConsumerDashboard() {
  const [subscriptions, setSubscriptions] = useState([])
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    if (!user || user.role !== 'consumer') {
      navigate('/')
      return
    }

    // Fetch using dynamic user.ID
    axios.get(`http://localhost:8080/users/${user.ID}/subscriptions`)
      .then(res => setSubscriptions(res.data.data))
      .catch(console.error)
  }, [])

  const logout = () => {
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <div className="max-w-md mx-auto min-h-screen p-5 font-sans text-main-text">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-black uppercase bg-gradient-secondary-tertiary text-transparent bg-clip-text">Minhas Assinaturas</h1>
          <p className="text-xs text-gray-400">Olá, {user?.name}</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => navigate('/config')} className="text-2xl" title="Configurações">⚙️</button>
          <button onClick={logout} className="text-xs text-red-400 font-bold underline self-center">Sair</button>
        </div>
      </div>

      {subscriptions.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">Você ainda não tem assinaturas ativas.</p>
      ) : (
        <div className="space-y-4">
          {subscriptions.map(sub => (
            <div key={sub.ID} className="p-1 rounded-2xl bg-gradient-secondary-forth">
              <div className="bg-background p-4 rounded-xl flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-black uppercase text-main-text">{sub.basket.name}</h2>
                  <p className="text-sm text-gray-400">Status: <span className="text-green-400 font-bold">{sub.status}</span></p>
                </div>
                <div className="text-right">
                  <span className="block text-lg font-bold text-main-text">R$ {sub.basket.price}</span>
                  <span className="text-xs text-gray-500 uppercase">{sub.frequency}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}