import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { LoginPage } from './components/LoginPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { UsersPage } from './components/pages/UsersPage';
import { ReservationsPage } from './components/pages/ReservationsPage';
import { OrdersPage } from './components/pages/OrdersPage';
import { FinancePage } from './components/pages/FinancePage';
import { PlacesPage } from './components/pages/PlacesPage';
import { FavoritesPage } from './components/pages/FavoritesPage';
import { ReviewsPage } from './components/pages/ReviewsPage';
import { NotificationsPage } from './components/pages/NotificationsPage';
import { LegalPage } from './components/pages/LegalPage';
import { Sun, Moon, MapPin, Heart, Star } from 'lucide-react';
import { SUPABASE_FUNCTION_BASE_URL } from './config';
import { publicAnonKey } from '../utils/supabase/info';

export default function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string>('');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loginError, setLoginError] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const functionHeaders = {
    'Content-Type': 'application/json',
    apikey: publicAnonKey
  };

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`${SUPABASE_FUNCTION_BASE_URL}/auth/verify`, {
        headers: {
          ...functionHeaders,
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.authorized === true;
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      return false;
    }
  };

  // Check for stored auth
  useEffect(() => {
    const storedToken = localStorage.getItem('caopb_admin_token');
    if (!storedToken) {
      return;
    }

    verifyToken(storedToken).then((isValid) => {
      if (isValid) {
        setAccessToken(storedToken);
        setIsAuthenticated(true);
        setShowWelcome(false);
      } else {
        localStorage.removeItem('caopb_admin_token');
      }
    });
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setLoginError('');
    try {
      const response = await fetch(`${SUPABASE_FUNCTION_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: functionHeaders,
        body: JSON.stringify({ email, senha: password })
      });

      const data = await response.json().catch(() => ({ error: 'Resposta inválida do servidor' }));

      if (!response.ok) {
        setLoginError(data.error || data.details || 'Erro ao fazer login');
        return;
      }

      if (data.accessToken) {
        setAccessToken(data.accessToken);
        setIsAuthenticated(true);
        setShowWelcome(false);
        localStorage.setItem('caopb_admin_token', data.accessToken);
      } else {
        setLoginError('Token de acesso não recebido');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setLoginError('Erro ao conectar com o servidor');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAccessToken('');
    setCurrentPage('dashboard');
    localStorage.removeItem('caopb_admin_token');
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (showWelcome) {
    return <WelcomeScreen onLogin={() => setShowWelcome(false)} />;
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} error={loginError} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage accessToken={accessToken} />;
      case 'users':
        return <UsersPage accessToken={accessToken} />;
      case 'reservations':
        return <ReservationsPage accessToken={accessToken} />;
      case 'orders':
        return <OrdersPage accessToken={accessToken} />;
      case 'finance':
        return <FinancePage accessToken={accessToken} />;
      case 'places':
        return <PlacesPage accessToken={accessToken} />;
      case 'favorites':
        return <FavoritesPage accessToken={accessToken} />;
      case 'reviews':
        return <ReviewsPage accessToken={accessToken} />;
      case 'notifications':
        return <NotificationsPage accessToken={accessToken} />;
      case 'legal':
        return <LegalPage accessToken={accessToken} />;
      default:
        return <DashboardPage accessToken={accessToken} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onLogout={handleLogout}
        isMobileOpen={isMobileSidebarOpen}
        onMobileToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className={`lg:pl-56 min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'lg:pl-16' : ''}`}>
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-20">
          <div className="px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                className="lg:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <span className="text-white">☰</span>
              </button>
              <h2 className="text-xl font-semibold text-white">
                {currentPage === 'dashboard' && 'Dashboard'}
                {currentPage === 'users' && 'Gestão de Usuários'}
                {currentPage === 'reservations' && 'Reservas & Estatísticas'}
                {currentPage === 'orders' && 'Pedidos & Analytics'}
                {currentPage === 'finance' && 'Análise Financeira'}
                {currentPage === 'places' && 'Estabelecimentos'}
                {currentPage === 'favorites' && 'Favoritos'}
                {currentPage === 'reviews' && 'Avaliações'}
                {currentPage === 'notifications' && 'Sistema de Notificações'}
                {currentPage === 'legal' && 'Informações Legais'}
              </h2>
            </div>

            {/* Theme Toggle - Removido por agora */}
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 bg-slate-900 min-h-screen">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
