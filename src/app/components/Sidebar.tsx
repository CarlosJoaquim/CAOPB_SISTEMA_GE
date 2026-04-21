import {
  LayoutDashboard,
  Users,
  Calendar,
  ShoppingCart,
  DollarSign,
  Bell,
  FileText,
  LogOut,
  Menu,
  X,
  Heart,
  Star,
  MapPin,
  TrendingUp,
  Settings,
  HelpCircle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ currentPage, onPageChange, onLogout, isMobileOpen, onMobileToggle, isCollapsed, onToggleCollapse }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'reservations', label: 'Reservas', icon: Calendar },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
    { id: 'finance', label: 'Financeiro', icon: DollarSign },
    { id: 'places', label: 'Estabelecimentos', icon: MapPin },
    { id: 'favorites', label: 'Favoritos', icon: Heart },
    { id: 'reviews', label: 'Avaliações', icon: Star },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'legal', label: 'Legal', icon: FileText },
  ];

  const bottomItems = [
    { id: 'settings', label: 'Configurações', icon: Settings },
    { id: 'help', label: 'Ajuda', icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={onMobileToggle}
        className="lg:hidden fixed top-5 left-5 z-50 p-2.5 rounded-xl bg-slate-800 shadow-lg border border-slate-700 text-white hover:bg-slate-700 transition-all duration-200"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="hidden lg:flex absolute top-1/2 -right-3 z-50 w-6 h-6 bg-slate-700 rounded-full shadow-lg border border-slate-600 items-center justify-center hover:bg-slate-600 transition-colors"
        title={isCollapsed ? 'Abrir menu' : 'Fechar menu'}
      >
        {isCollapsed ? <ChevronRight size={10} className="text-white" /> : <ChevronLeft size={10} className="text-white" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-slate-900 shadow-xl z-40 border-r border-slate-800
          transform transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          flex flex-col
          ${isCollapsed ? 'w-16' : 'w-56'}
        `}
      >
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <TrendingUp size={20} className="text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Caop-B</h1>
                <p className="text-xs text-blue-400">Painel Admin</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 bg-slate-700/50 rounded-lg">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-medium text-slate-400">v2.0.0</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 ${isCollapsed ? 'px-1' : 'px-3'} py-4 overflow-y-auto`}>
          <div className="mb-4">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu Principal</p>
            )}
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => { onPageChange(item.id); if (isMobileOpen) onMobileToggle(); }}
                      className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive ? 'bg-blue-500 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} ${isCollapsed ? 'justify-center' : ''}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      {isActive && !isCollapsed && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full" />}
                      <Icon size={18} />
                      {!isCollapsed && <><span className="text-sm font-medium">{item.label}</span>{isActive && <ChevronRight size={14} className="ml-auto text-white/70" />}</>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            {!isCollapsed && <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Sistema</p>}
            <ul className="space-y-1">
              {bottomItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => console.log(`Open ${item.id}`)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 group ${isCollapsed ? 'justify-center' : ''}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon size={18} />
                      {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Perfil do Admin */}
        <div className={`p-3 border-t border-slate-800 bg-slate-800/50 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          <div className={`flex items-center gap-3 ${isCollapsed ? 'flex-col' : ''}`}>
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white text-xs font-bold">AD</span>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-slate-900" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">Admin User</p>
                <p className="text-xs text-slate-400 truncate">admin@caopb.com</p>
              </div>
            )}
          </div>
          <button
            onClick={onLogout}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 hover:border-red-500 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all duration-200 group ${isCollapsed ? 'mt-2 w-9 px-0' : 'mt-2'}`}
          >
            <LogOut size={14} className="group-hover:rotate-180 transition-transform duration-300" />
            {!isCollapsed && <span className="text-xs font-medium">Sair</span>}
          </button>
        </div>
      </aside>
    </>
  );
}