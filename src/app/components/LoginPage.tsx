import React, { useState, useRef } from 'react';
import { Lock, Mail, AlertCircle, Shield, Users, Clock, HeartHandshake, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  error?: string;
}

export function LoginPage({ onLogin, error }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onLogin(email.trim(), password);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const goodPractices = [
    {
      icon: Shield,
      title: "Segurança",
      description: "Nunca compartilhe suas credenciais. Use senhas fortes e únicas.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      icon: Users,
      title: "Responsabilidade",
      description: "Sistema exclusivo para gestão administrativa. Use dados apenas para fins legítimos.",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600"
    },
    {
      icon: Clock,
      title: "Sessões Ativas",
      description: "Sempre faça logout ao finalizar para proteger contra acessos não autorizados.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600"
    },
    {
      icon: HeartHandshake,
      title: "Transparência",
      description: "Mantenha registros precisos. A integridade dos dados é fundamental.",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      iconColor: "text-red-600"
    },
    {
      icon: Sparkles,
      title: "Atualizações",
      description: "Fique informado sobre novas funcionalidades e políticas do sistema.",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Lado Esquerdo - Login */}
          <div className="w-full">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 backdrop-blur-sm">
              {/* Logo */}
              <div className="text-center mb-8">
                <div className="inline-block p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg mb-4">
                  <Lock size={40} className="text-white" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                  Caop-B Admin
                </h1>
                <p className="text-slate-500">Painel Administrativo</p>
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                  <AlertCircle className="text-red-500" size={20} />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Login form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl
                        text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                        focus:border-transparent transition-all"
                      placeholder="admin@caopb.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl
                        text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500
                        focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 
                    text-white font-bold rounded-xl transition-all duration-200 disabled:opacity-50 
                    disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-[1.02]"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-400">
                Acesso restrito a administradores
              </p>
            </div>
          </div>

          {/* Lado Direito - Cards Roláveis */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  📋 Código de Conduta
                </h2>
                <p className="text-slate-500 text-sm">
                  Deslize para ver todas as práticas → 
                </p>
              </div>

              {/* Container com scroll horizontal */}
              <div className="relative group">
                {/* Botão esquerdo */}
                <button
                  onClick={() => scroll('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10
                    bg-white rounded-full p-2 shadow-lg border border-slate-200 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300
                    hover:bg-slate-50 focus:outline-none"
                >
                  <ChevronLeft size={24} className="text-slate-600" />
                </button>

                {/* Cards roláveis */}
                <div
                  ref={scrollContainerRef}
                  className="flex overflow-x-auto gap-4 pb-4 scroll-smooth hide-scrollbar"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {goodPractices.map((practice, index) => {
                    const Icon = practice.icon;
                    return (
                      <div
                        key={index}
                        id={`card-${index}`}
                        className="flex-shrink-0 w-80 bg-white rounded-2xl border border-slate-200 
                          shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105
                          cursor-pointer overflow-hidden group/card"
                        onClick={() => {
                          const element = document.getElementById(`card-${index}`);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                          }
                        }}
                      >
                        {/* Header colorido */}
                        <div className={`h-2 bg-gradient-to-r ${practice.color}`}></div>
                        
                        <div className="p-6">
                          <div className={`inline-block p-3 ${practice.bgColor} rounded-xl mb-4`}>
                            <Icon size={28} className={practice.iconColor} />
                          </div>
                          
                          <h3 className="text-xl font-bold text-slate-800 mb-3">
                            {practice.title}
                          </h3>
                          
                          <p className="text-slate-600 text-sm leading-relaxed">
                            {practice.description}
                          </p>

                          {/* Indicador de clique */}
                          <div className="mt-4 flex justify-end opacity-0 group-hover/card:opacity-100 transition-opacity">
                            <span className="text-xs text-slate-400">Clique para centralizar →</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Botão direito */}
                <button
                  onClick={() => scroll('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10
                    bg-white rounded-full p-2 shadow-lg border border-slate-200 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300
                    hover:bg-slate-50 focus:outline-none"
                >
                  <ChevronRight size={24} className="text-slate-600" />
                </button>
              </div>

              {/* Indicadores de scroll */}
              <div className="flex justify-center gap-2 mt-6">
                {goodPractices.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const element = document.getElementById(`card-${index}`);
                      if (element && scrollContainerRef.current) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                      }
                    }}
                    className="w-2 h-2 rounded-full bg-slate-300 hover:bg-blue-500 transition-colors"
                  />
                ))}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-400 text-center">
                  © 2026 Caop-B - Lazer ao alcance do seu bolso
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Versão mobile */}
        <div className="lg:hidden mt-6">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              📋 Práticas Recomendadas
            </h2>
            <div className="flex overflow-x-auto gap-4 pb-2 scroll-smooth">
              {goodPractices.map((practice, index) => {
                const Icon = practice.icon;
                return (
                  <div
                    key={index}
                    className="flex-shrink-0 w-72 bg-white rounded-xl border border-slate-200 p-4 shadow-md"
                  >
                    <div className={`inline-block p-2 ${practice.bgColor} rounded-lg mb-3`}>
                      <Icon size={20} className={practice.iconColor} />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2 text-sm">
                      {practice.title}
                    </h3>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      {practice.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Estilo para esconder scrollbar */}
      <style >{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}