import React from 'react';
import { TrendingUp, Shield, Users, MapPin, Calendar, ShoppingCart, Bell, Star, Info, ArrowRight, LogIn, CheckCircle, Zap, Award, Globe } from 'lucide-react';

interface WelcomeScreenProps {
  onLogin: () => void;
}

export function WelcomeScreen({ onLogin }: WelcomeScreenProps) {
  const features = [
    { icon: MapPin, title: 'Estabelecimentos', description: 'Descubra os melhores locais de lazer' },
    { icon: Calendar, title: 'Reservas', description: 'Garanta seu lugar com antecedência' },
    { icon: ShoppingCart, title: 'Pedidos', description: 'Peça produtos para entrega ou retirada' },
    { icon: Star, title: 'Avaliações', description: 'Compartilhe sua experiência' },
  ];

  const adminFeatures = [
    { icon: Users, title: 'Gestão de Utilizadores', description: 'Gerencie usuários, agentes e administradores' },
    { icon: MapPin, title: 'Estabelecimentos', description: 'Controle todos os locais e produtos' },
    { icon: Calendar, title: 'Reservas', description: 'Visualize e gerencie reservas' },
    { icon: ShoppingCart, title: 'Pedidos', description: 'Acompanhe pedidos em tempo real' },
    { icon: Bell, title: 'Notificações', description: 'Comunique-se com os utilizadores' },
    { icon: TrendingUp, title: 'Análises', description: 'Estatísticas e métricas financeiras' },
  ];

  const benefits = [
    { icon: CheckCircle, title: 'Dados em Tempo Real', description: 'Informações sempre atualizadas' },
    { icon: Zap, title: 'Processo Rápido', description: 'Interface ágil e responsiva' },
    { icon: Shield, title: 'Segurança', description: 'Dados protegidos e criptografados' },
    { icon: Award, title: 'Suporte Premium', description: 'Atendimento especializado' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section com imagem de fundo */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&h=1080&fit=crop"
            alt="Restaurant background"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90" />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl mb-6">
              <TrendingUp size={40} className="text-white" />
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
              Caop-B
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Lazer ao alcance do seu bolso
            </p>
            <button
              onClick={onLogin}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-lg font-semibold"
            >
              <LogIn size={20} />
              Acessar Painel Administrativo
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="#ffffff">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" />
          </svg>
        </div>
      </div>

      {/* Seção Sobre o App */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Info size={24} className="text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">O que é o Caop-B?</h2>
            </div>
            <p className="text-lg text-slate-600 leading-relaxed mb-6">
              O <strong className="text-blue-600">Caop-B</strong> é uma plataforma mobile que conecta utilizadores a estabelecimentos de lazer, 
              permitindo <strong>reservas</strong> e <strong>pedidos</strong> de forma simples e rápida.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Com o Caop-B, você pode descobrir lugares de entretenimento, fazer reservas de mesas, 
              pedir produtos para entrega ou retirada, e acompanhar tudo em tempo real.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{feature.title}</p>
                      <p className="text-xs text-slate-500">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop"
              alt="Mobile app interface"
              className="rounded-2xl shadow-2xl"
            />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl -z-10" />
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl -z-10" />
          </div>
        </div>
      </div>

      {/* Seção do Sistema de Gestão */}
      <div className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-4">
              <Shield size={16} className="text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">Painel Administrativo</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Sistema de Gestão Completo</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Ferramentas poderosas para gerenciar toda a plataforma Caop-B
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl w-fit mb-4">
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Seção de Benefícios */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Por que escolher o Caop-B?</h2>
            <p className="text-lg text-slate-600">Benefícios exclusivos para administradores</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="text-center p-6">
                  <div className="inline-flex p-3 bg-green-100 rounded-xl mb-4">
                    <Icon size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-slate-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Seção de Boas Práticas com imagem */}
      <div className="relative py-20 bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&h=1080&fit=crop"
            alt="Best practices"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Boas Práticas de Uso</h2>
              <div className="space-y-6">
                {[
                  { title: 'Mantenha os dados atualizados', description: 'Atualize frequentemente os estabelecimentos e produtos para melhores resultados.' },
                  { title: 'Responda rapidamente', description: 'Aceite ou rejeite reservas e pedidos em tempo útil para melhores avaliações.' },
                  { title: 'Use as notificações', description: 'Envie notificações para comunicar promoções e novidades aos utilizadores.' },
                  { title: 'Monitore estatísticas', description: 'Consulte o dashboard regularmente para entender o desempenho do negócio.' },
                ].map((practice, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-400 text-sm font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold mb-1">{practice.title}</p>
                      <p className="text-slate-300 text-sm">{practice.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1556741533-6e6a3bd8e0d1?w=600&h=500&fit=crop"
                alt="Best practices illustration"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-4 -right-4 w-40 h-40 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl -z-10 opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* CTA Final */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Pronto para começar?</h2>
          <p className="text-lg text-slate-600 mb-8">
            Acesse o painel administrativo e gerencie sua plataforma
          </p>
          <button
            onClick={onLogin}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-lg font-semibold"
          >
            <LogIn size={20} />
            Entrar no Sistema
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-400" />
              <span className="text-white font-semibold">Caop-B</span>
              <span className="text-slate-400 text-sm">Lazer ao alcance do seu bolso</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={16} className="text-slate-500" />
              <p className="text-slate-500 text-sm">© 2026 Caop-B - Painel Administrativo</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}