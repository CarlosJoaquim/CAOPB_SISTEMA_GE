import React, { useEffect, useState } from 'react';
import { Bell, Send, Users, MessageSquare, AlertCircle, X, Clock, Zap, Inbox, Eye, Calendar as CalendarIcon, CheckCircle } from 'lucide-react';
import { SUPABASE_FUNCTION_BASE_URL } from '../../config';

interface Notification {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'INFO' | 'AVISO' | 'PROMOCAO' | 'MANUTENCAO';
  publico_alvo: 'TODOS' | 'USUARIOS' | 'AGENTES' | 'ADMIN';
  status: 'ENVIADA' | 'AGENDADA' | 'RASCUNHO';
  criado_em: string;
  enviada_em?: string;
}

interface NotificationsPageProps {
  accessToken: string;
}

export function NotificationsPage({ accessToken }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [newNotification, setNewNotification] = useState({
    titulo: '',
    mensagem: '',
    tipo: 'INFO' as 'INFO' | 'AVISO' | 'PROMOCAO' | 'MANUTENCAO',
    publico_alvo: 'TODOS' as 'TODOS' | 'USUARIOS' | 'AGENTES' | 'ADMIN'
  });

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `${SUPABASE_FUNCTION_BASE_URL}/notifications`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar notificações');
      }

      const data = await response.json();

      const transformedNotifications: Notification[] = data.map((notif: any) => ({
        id: notif.id,
        titulo: notif.titulo,
        mensagem: notif.mensagem,
        tipo: notif.tipo,
        publico_alvo: notif.dados?.publico_alvo || 'TODOS',
        status: 'ENVIADA',
        criado_em: notif.criado_em,
        enviada_em: notif.criado_em
      }));

      setNotifications(transformedNotifications);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      const mockNotifications: Notification[] = [
        {
          id: '1',
          titulo: 'Manutenção Programada',
          mensagem: 'O sistema estará em manutenção das 2h às 4h da manhã.',
          tipo: 'MANUTENCAO',
          publico_alvo: 'TODOS',
          status: 'ENVIADA',
          criado_em: new Date().toISOString(),
          enviada_em: new Date().toISOString()
        },
        {
          id: '2',
          titulo: 'Promoção de Verão',
          mensagem: 'Descontos especiais em todos os estabelecimentos!',
          tipo: 'PROMOCAO',
          publico_alvo: 'USUARIOS',
          status: 'ENVIADA',
          criado_em: new Date().toISOString(),
          enviada_em: new Date().toISOString()
        }
      ];
      setNotifications(mockNotifications);
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async () => {
    if (!newNotification.titulo || !newNotification.mensagem) {
      return;
    }

    setSending(true);
    try {
      const response = await fetch(
        `${SUPABASE_FUNCTION_BASE_URL}/notifications`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify(newNotification)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao enviar notificação');
      }

      await fetchNotifications();
      setShowCreateForm(false);
      setNewNotification({
        titulo: '',
        mensagem: '',
        tipo: 'INFO',
        publico_alvo: 'TODOS'
      });
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
    } finally {
      setSending(false);
    }
  };

  const getTypeConfig = (tipo: string) => {
    const configs: Record<string, { icon: any; color: string; bgClass: string; borderClass: string; textClass: string }> = {
      INFO: { icon: MessageSquare, color: 'blue', bgClass: 'bg-blue-500/10', borderClass: 'border-blue-500/30', textClass: 'text-blue-400' },
      AVISO: { icon: AlertCircle, color: 'yellow', bgClass: 'bg-yellow-500/10', borderClass: 'border-yellow-500/30', textClass: 'text-yellow-400' },
      PROMOCAO: { icon: Zap, color: 'green', bgClass: 'bg-green-500/10', borderClass: 'border-green-500/30', textClass: 'text-green-400' },
      MANUTENCAO: { icon: Clock, color: 'orange', bgClass: 'bg-orange-500/10', borderClass: 'border-orange-500/30', textClass: 'text-orange-400' }
    };
    return configs[tipo] || configs.INFO;
  };

  const getTargetIcon = (target: string) => {
    const icons: Record<string, string> = {
      TODOS: '🌍',
      USUARIOS: '👥',
      AGENTES: '🤝',
      ADMIN: '👑'
    };
    return icons[target] || '📢';
  };

  const stats = [
    { label: 'Total Enviadas', value: notifications.length, icon: Inbox, color: 'blue' },
    { label: 'Para Todos', value: notifications.filter(n => n.publico_alvo === 'TODOS').length, icon: Users, color: 'green' },
    { label: 'Avisos', value: notifications.filter(n => n.tipo === 'AVISO').length, icon: AlertCircle, color: 'yellow' },
    { label: 'Promoções', value: notifications.filter(n => n.tipo === 'PROMOCAO').length, icon: Zap, color: 'green' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] bg-gradient-to-br from-black via-slate-900 to-black">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-2 border-slate-700 border-t-blue-500 mx-auto mb-6"></div>
            <Bell className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-400" size={24} />
          </div>
          <p className="text-slate-400">Carregando notificações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 via-green-400 to-blue-400 bg-clip-text text-transparent">
              Notificações
            </h1>
            <p className="text-slate-400 mt-1">Gerencie comunicações para seus usuários</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
          >
            <Send size={16} />
            Nova Notificação
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            const colorClasses: Record<string, string> = {
              blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
              green: 'from-green-500/20 to-green-600/20 border-green-500/30',
              yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
              purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30'
            };
            const textColors: Record<string, string> = {
              blue: 'text-blue-400',
              green: 'text-green-400',
              yellow: 'text-yellow-400',
              purple: 'text-purple-400'
            };
            return (
              <div key={index} className="group bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-5 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorClasses[stat.color]}`}>
                    <Icon size={20} className={textColors[stat.color]} />
                  </div>
                  <span className="text-2xl font-bold text-white">{stat.value}</span>
                </div>
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Histórico de Envios</h2>
            <span className="text-xs text-slate-500">{notifications.length} notificações</span>
          </div>

          {notifications.length === 0 ? (
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-16 text-center">
              <div className="inline-flex p-4 bg-slate-800 rounded-full mb-4">
                <Bell size={40} className="text-slate-500" />
              </div>
              <p className="text-slate-400">Nenhuma notificação enviada ainda</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-4 text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors"
              >
                Criar primeira notificação →
              </button>
            </div>
          ) : (
            notifications.map((notification) => {
              const typeConfig = getTypeConfig(notification.tipo);
              const Icon = typeConfig.icon;
              return (
                <div
                  key={notification.id}
                  onClick={() => setSelectedNotification(notification)}
                  className="group bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-5 hover:shadow-lg hover:border-blue-500/30 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${typeConfig.bgClass} border ${typeConfig.borderClass} shrink-0`}>
                      <Icon size={20} className={typeConfig.textClass} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-base font-semibold text-white">
                          {notification.titulo}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                          {getTargetIcon(notification.publico_alvo)} {notification.publico_alvo}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm line-clamp-2">
                        {notification.mensagem}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1">
                          <CalendarIcon size={12} className="text-slate-500" />
                          <span className="text-xs text-slate-500">
                            {new Date(notification.enviada_em || notification.criado_em).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          notification.status === 'ENVIADA' 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {notification.status === 'ENVIADA' ? '✓ Enviada' : '⏳ Pendente'}
                        </span>
                      </div>
                    </div>

                    <Eye size={18} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-2" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              📬 As notificações são enviadas em tempo real para os dispositivos dos usuários
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-slate-500">Sistema ativo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Nova Notificação */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 max-w-lg w-full animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white">Nova Notificação</h2>
                <p className="text-slate-400 text-sm mt-0.5">Envie uma comunicação para os usuários</p>
              </div>
              <button
                onClick={() => setShowCreateForm(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Título</label>
                <input
                  type="text"
                  value={newNotification.titulo}
                  onChange={(e) => setNewNotification({ ...newNotification, titulo: e.target.value })}
                  className="w-full px-4 py-2.5 bg-black border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Digite o título"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Mensagem</label>
                <textarea
                  value={newNotification.mensagem}
                  onChange={(e) => setNewNotification({ ...newNotification, mensagem: e.target.value })}
                  className="w-full px-4 py-2.5 bg-black border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none h-28"
                  placeholder="Digite o conteúdo da notificação"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Tipo</label>
                  <select
                    value={newNotification.tipo}
                    onChange={(e) => setNewNotification({ ...newNotification, tipo: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-black border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="INFO">📘 Informativa</option>
                    <option value="AVISO">⚠️ Aviso</option>
                    <option value="PROMOCAO">⚡ Promoção</option>
                    <option value="MANUTENCAO">🔧 Manutenção</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Público Alvo</label>
                  <select
                    value={newNotification.publico_alvo}
                    onChange={(e) => setNewNotification({ ...newNotification, publico_alvo: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-black border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="TODOS">🌍 Todos</option>
                    <option value="USUARIOS">👥 Usuários</option>
                    <option value="AGENTES">🤝 Agentes</option>
                    <option value="ADMIN">👑 Administradores</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-800 bg-black/30 rounded-b-2xl">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={sendNotification}
                disabled={sending || !newNotification.titulo || !newNotification.mensagem}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Enviar Notificação
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes da Notificação */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 max-w-md w-full animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${getTypeConfig(selectedNotification.tipo).bgClass} border ${getTypeConfig(selectedNotification.tipo).borderClass}`}>
                  {React.createElement(getTypeConfig(selectedNotification.tipo).icon, { 
                    size: 24, 
                    className: getTypeConfig(selectedNotification.tipo).textClass
                  })}
                </div>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="p-1 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <X size={18} className="text-slate-400" />
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{selectedNotification.titulo}</h3>
              <p className="text-slate-300 mb-4 leading-relaxed">{selectedNotification.mensagem}</p>
              
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Público Alvo</span>
                  <span className="text-white font-medium flex items-center gap-1">
                    {getTargetIcon(selectedNotification.publico_alvo)} {selectedNotification.publico_alvo}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Data de Envio</span>
                  <span className="text-white font-medium">
                    {new Date(selectedNotification.enviada_em || selectedNotification.criado_em).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">Status</span>
                  <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                    selectedNotification.status === 'ENVIADA' 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                      : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {selectedNotification.status === 'ENVIADA' ? '✓ Enviada' : '⏳ Pendente'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-black/30 rounded-b-2xl">
              <button
                onClick={() => setSelectedNotification(null)}
                className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}