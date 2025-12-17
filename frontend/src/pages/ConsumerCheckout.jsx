import { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import PageContainer from '../components/layout/PageContainer'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

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
    <PageContainer maxWidth="max-w-md">
      <div className="space-y-6">
        
        {/* Product Card */}
        <div className="bg-background rounded-3xl p-6 border border-gray-800 text-center">
          {/* Image Placeholder */}
          <div className="w-32 h-32 bg-gray-900 rounded-2xl mx-auto mb-6 flex items-center justify-center text-xs text-gray-500">
            Foto do produto
          </div>
          
          <h1 className="text-2xl font-black uppercase text-main-text mb-6 bg-gradient-secondary-tertiary text-transparent bg-clip-text">
            {basket.name}
          </h1>

          {/* Dropdowns (Visual only for now) */}
          <div className="space-y-4">
            <div className="bg-gray-900 p-3 rounded-xl flex justify-between items-center cursor-pointer">
              <span className="font-medium text-sm">Descrição</span>
              <span className="text-gray-500">▼</span>
            </div>
            
            <div className="bg-gray-900 p-3 rounded-xl flex justify-between items-center cursor-pointer">
              <span className="font-medium text-sm">Durante 6 meses</span>
              <span className="text-gray-500">▼</span>
            </div>

            <div className="bg-gray-900 p-3 rounded-xl flex justify-between items-center cursor-pointer">
              <span className="font-medium text-sm">Mensalmente</span>
              <span className="text-gray-500">▼</span>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-background rounded-3xl p-6 border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-secondary uppercase mb-2">Endereço</h3>
          <div className="flex gap-3">
             <Input placeholder="CEP" className="w-1/3" />
             <Input placeholder="Rua" className="w-2/3" />
          </div>
          <div className="flex gap-3">
             <Input placeholder="Complemento" className="w-2/3" />
             <div className="w-1/3 bg-gray-900 p-3 rounded-xl text-sm flex items-center justify-center text-gray-400 font-bold border border-gray-800">FLN/SC</div>
          </div>
          <Input placeholder="Referência" />
        </div>

        {/* Payment Section */}
        <div className="bg-background rounded-3xl p-6 border border-gray-800 space-y-4">
          <h3 className="text-sm font-bold text-secondary uppercase mb-2">Pagamento</h3>
          
          <div className="flex gap-3">
            <Input placeholder="Dados do Cartão" className="flex-1" />
            <Input placeholder="MM/AA" className="w-24" />
          </div>
          <Input placeholder="Nome impresso no cartão" />
          <Input placeholder="CPF / CNPJ" />
        </div>

        {/* Action Button */}
        <Button
          onClick={handleSubscribe}
          fullWidth
        >
          Assine e Receba
        </Button>

      </div>
    </PageContainer>
  )
}