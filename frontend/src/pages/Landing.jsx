import { Link } from 'react-router-dom'
import logo from '../assets/logo.svg'

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <img src={logo} alt="Hoby Loop" className="w-64 mb-12" />
      
      <div className="grid gap-8 w-full max-w-md">
        {/* Seller Entry */}
        <Link to="/login" className="p-1 rounded-2xl bg-gradient-secondary-tertiary hover:bg-gradient-tertiary-forth transition-all duration-300">
          <div className="bg-background p-6 rounded-xl text-center">
            <h2 className="text-xl font-bold text-main-text">Sou Vendedor</h2>
            <p className="text-gray-400 text-sm mt-2">Gerenciar clientes e criar produtos.</p>
          </div>
        </Link>

        {/* Consumer Entry */}
        <Link to="/login" className="p-1 rounded-2xl bg-gradient-secondary-forth hover:bg-gradient-tertiary-forth transition-all duration-300">
          <div className="bg-background p-6 rounded-xl text-center">
            <h2 className="text-xl font-bold text-main-text">Sou Cliente</h2>
            <p className="text-gray-400 text-sm mt-2">Ver minhas assinaturas ativas.</p>
          </div>
        </Link>
      </div>
    </div>
  )
}