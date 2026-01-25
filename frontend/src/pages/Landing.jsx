import { Link } from 'react-router-dom'
import logo from '../assets/hoby-loop-logo.png'
import { t } from '../i18n'

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#000813] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 animate-pulse"></div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <img
            src={logo}
            alt="Hobby Loop"
            className="w-48 md:w-64 mx-auto mb-8 drop-shadow-2xl hover:scale-105 transition-transform duration-300"
          />
          
          <h1 className="text-4xl md:text-6xl font-black uppercase mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text leading-tight">
            Hobby Loop
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            {t('landing.tagline') || 'Conectando produtores locais com consumidores através de assinaturas recorrentes'}
          </p>
          
          {/* Value propositions */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span className="text-green-400">✓</span>
              <span>Entregas Recorrentes</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span className="text-green-400">✓</span>
              <span>Produtos Locais</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span className="text-green-400">✓</span>
              <span>Gestão Simplificada</span>
            </div>
          </div>
        </div>

        {/* Call-to-Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Seller Entry */}
          <Link
            to="/login?type=seller"
            className="group relative p-1 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
          >
            <div className="bg-[#000813] p-8 rounded-xl text-center h-full flex flex-col justify-center">
              <div className="text-5xl mb-4">🏪</div>
              <h2 className="text-2xl font-black uppercase text-white mb-3 tracking-wide">
                {t('landing.sellerTitle')}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {t('landing.sellerDescription')}
              </p>
              <div className="mt-auto pt-4">
                <span className="text-purple-400 font-bold text-sm group-hover:text-pink-400 transition-colors">
                  Acessar Dashboard →
                </span>
              </div>
            </div>
          </Link>
          
          {/* Consumer Entry */}
          <Link
            to="/login?type=subscriber"
            className="group relative p-1 rounded-2xl bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 hover:from-blue-600 hover:via-cyan-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/50"
          >
            <div className="bg-[#000813] p-8 rounded-xl text-center h-full flex flex-col justify-center">
              <div className="text-5xl mb-4">🛒</div>
              <h2 className="text-2xl font-black uppercase text-white mb-3 tracking-wide">
                {t('landing.consumerTitle')}
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {t('landing.consumerDescription')}
              </p>
              <div className="mt-auto pt-4">
                <span className="text-blue-400 font-bold text-sm group-hover:text-cyan-400 transition-colors">
                  Ver Minhas Entregas →
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-500 text-sm">
          <p>© 2026 Hobby Loop - Plataforma de Assinaturas Recorrentes</p>
        </div>
      </div>
    </div>
  )
}