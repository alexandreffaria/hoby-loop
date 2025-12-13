import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-black text-gray-800 mb-8 uppercase tracking-widest">Hoby Loop</h1>
      
      <div className="grid gap-6 w-full max-w-sm">
        {/* Seller Entry */}
        <Link to="/seller" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 transition-colors group">
          <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600">Sou Vendedor</h2>
          <p className="text-gray-500 text-sm mt-2">Gerenciar clientes e criar produtos.</p>
        </Link>

        {/* Consumer Entry */}
        <Link to="/consumer" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-green-500 transition-colors group">
          <h2 className="text-xl font-bold text-gray-900 group-hover:text-green-600">Sou Cliente</h2>
          <p className="text-gray-500 text-sm mt-2">Ver minhas assinaturas ativas.</p>
        </Link>
      </div>
    </div>
  )
}