import { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'

export default function ConsumerCheckout() {
  const { id } = useParams() // Get basket ID from URL
  const [basket, setBasket] = useState(null)
  const [loading, setLoading] = useState(true)

  // Form State
  const [formData, setFormData] = useState({
    street: '',
    number: '',
    cep: '',
    city: 'Florianópolis/SC', // Hardcoded per PDF
    cardName: '',
    cardNumber: '',
    cvc: '',
    expiry: ''
  })

  useEffect(() => {
    // Fetch the specific basket details
    axios.get(`http://localhost:8080/baskets/${id}`)
      .then(res => {
        setBasket(res.data.data)
        setLoading(false)
      })
      .catch(err => alert("Error loading product"))
  }, [id])

  const handleSubscribe = () => {
    // In a real app, we would validate inputs and process payment here.
    // For this MVP, we just create the subscription in the DB.
    axios.post('http://localhost:8080/subscriptions', {
      user_id: 10, // Hardcoded Consumer "Otto" for demo
      basket_id: parseInt(id),
      frequency: "monthly"
    })
    .then(() => alert("Assinatura realizada com sucesso!"))
    .catch(err => alert("Erro ao assinar."))
  }

  if (loading) return <div className="p-10 text-center">Carregando...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans text-gray-700">
      <div className="max-w-md mx-auto space-y-4">
        
        {/* Product Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm text-center">
          {/* Image Placeholder */}
          <div className="w-32 h-32 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center text-xs text-gray-400">
            Foto do produto
          </div>
          
          <h1 className="text-xl font-black uppercase text-gray-800 mb-6">
            {basket.name}
          </h1>

          {/* Dropdowns (Visual only for now) */}
          <div className="space-y-3">
            <div className="bg-gray-50 p-3 rounded-xl flex justify-between items-center cursor-pointer">
              <span className="font-medium text-sm">Descrição</span>
              <span className="text-gray-400">▼</span>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-xl flex justify-between items-center cursor-pointer">
              <span className="font-medium text-sm">Durante 6 meses</span>
              <span className="text-gray-400">▼</span>
            </div>

            <div className="bg-gray-50 p-3 rounded-xl flex justify-between items-center cursor-pointer">
              <span className="font-medium text-sm">Mensalmente</span>
              <span className="text-gray-400">▼</span>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex gap-3">
             <input placeholder="CEP" className="w-1/3 bg-gray-50 p-3 rounded-xl text-sm outline-none border border-transparent focus:border-blue-500" />
             <input placeholder="Rua" className="w-2/3 bg-gray-50 p-3 rounded-xl text-sm outline-none border border-transparent focus:border-blue-500" />
          </div>
          <div className="flex gap-3">
             <input placeholder="Complemento" className="w-2/3 bg-gray-50 p-3 rounded-xl text-sm outline-none border border-transparent focus:border-blue-500" />
             <div className="w-1/3 bg-gray-50 p-3 rounded-xl text-sm flex items-center justify-center text-gray-500 font-bold">FLN/SC</div>
          </div>
          <input placeholder="Referência" className="w-full bg-gray-50 p-3 rounded-xl text-sm outline-none border border-transparent focus:border-blue-500" />
        </div>

        {/* Payment Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Pagamento</h3>
          
          <div className="flex gap-3">
            <input placeholder="Dados do Cartão" className="flex-1 bg-gray-50 p-3 rounded-xl text-sm outline-none" />
            <input placeholder="MM/AA" className="w-20 bg-gray-50 p-3 rounded-xl text-sm outline-none text-center" />
          </div>
          <input placeholder="Nome impresso no cartão" className="w-full bg-gray-50 p-3 rounded-xl text-sm outline-none" />
          <input placeholder="CPF / CNPJ" className="w-full bg-gray-50 p-3 rounded-xl text-sm outline-none" />
        </div>

        {/* Action Button */}
        <button 
          onClick={handleSubscribe}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 active:scale-95 transition-transform uppercase tracking-wide"
        >
          Assine e Receba
        </button>

      </div>
    </div>
  )
}