import { useEffect, useState, useMemo } from 'react';
import { Filter, Calendar, Users as UsersIcon, TrendingUp, BarChart3, ArrowUpRight, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Reservation {
  id: string;
  categoria: string;
  data_hora: string;
  convidados: number;
  status: 'PENDENTE' | 'ACEITA' | 'REJEITADA' | 'CONCLUIDA' | 'CANCELADA';
  preco_total: string;
  criado_em: string;
  usuario: { nome: string; sobrenome: string; email: string };
  lugar: { nome: string; categoria: string };
}

interface RestaurantStats {
  nome: string;
  totalReservas: number;
  receitaTotal: number;
  categoria: string;
}

interface ReservationsPageProps {
  accessToken: string;
}

export function ReservationsPage({ accessToken }: ReservationsPageProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [restaurantStats, setRestaurantStats] = useState<RestaurantStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'reservations' | 'analytics'>('reservations');

  useEffect(() => {
    fetchReservations();
    const interval = setInterval(fetchReservations, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await fetch(
        'https://ewyckxscedklztarigha.supabase.co/functions/v1/make-server-b2f35964/reservations',
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      const data = await response.json();
      
      setReservations(data);

      // Calcular estatísticas dos restaurantes
      const stats = data.reduce((acc: { [key: string]: RestaurantStats }, reservation: Reservation) => {
        const key = reservation.lugar.nome;
        if (!acc[key]) {
          acc[key] = {
            nome: reservation.lugar.nome,
            totalReservas: 0,
            receitaTotal: 0,
            categoria: reservation.lugar.categoria
          };
        }
        acc[key].totalReservas += 1;
        acc[key].receitaTotal += parseFloat(reservation.preco_total) || 0;
        return acc;
      }, {});

      const sortedStats = (Object.values(stats) as RestaurantStats[])
        .sort((a: RestaurantStats, b: RestaurantStats) => b.totalReservas - a.totalReservas)
        .slice(0, 10);

      setRestaurantStats(sortedStats);
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredReservations = useMemo(() => {
    let filtered = reservations;
    if (filterStatus) {
      filtered = filtered.filter((res) => res.status === filterStatus);
    }
    return filtered;
  }, [reservations, filterStatus]);


  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(
        `https://ewyckxscedklztarigha.supabase.co/functions/v1/make-server-b2f35964/reservations/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({ status: newStatus })
        }
      );
      fetchReservations();
    } catch (error) {
      console.error('Erro ao atualizar status da reserva:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDENTE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      ACEITA: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      REJEITADA: 'bg-red-500/10 text-red-400 border-red-500/20',
      CONCLUIDA: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      CANCELADA: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    };
    return styles[status as keyof typeof styles] || styles.PENDENTE;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-slate-800 border-t-blue-500 mx-auto mb-6"></div>
          <p className="text-slate-500 font-medium">Carregando fluxo de reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-200 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-500 to-emerald-400 bg-clip-text text-transparent">
              Sistema de Reservas
            </h1>
            <p className="text-slate-500 mt-2 flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-500" />
              Monitoramento em tempo real
            </p>
          </div>

          {/* Tabs Modernas */}
          <div className="flex p-1 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 w-fit">
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'reservations'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Listagem
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Analytics
            </button>
          </div>
        </div>

        {activeTab === 'reservations' ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Filtro Glass */}
            <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-slate-800">
              <div className="relative group">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 group-hover:scale-110 transition-transform" size={18} />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-black/40 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer font-medium"
                >
                  <option value="">Todos os status registrados</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="ACEITA">Aceita</option>
                  <option value="REJEITADA">Rejeitada</option>
                  <option value="CONCLUIDA">Concluída</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>
              </div>
            </div>

            {/* Tabela Dark */}
            <div className="bg-slate-900/30 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80">
                      <th className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Usuário</th>
                      <th className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Estabelecimento</th>
                      <th className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Agendamento</th>
                      <th className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest text-center">Convidados</th>
                      <th className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Faturamento</th>
                      <th className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Controle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredReservations.map((reservation) => (
                      <tr key={reservation.id} className="hover:bg-blue-500/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white font-bold group-hover:text-blue-400 transition-colors">
                              {reservation.usuario.nome} {reservation.usuario.sobrenome}
                            </p>
                            <p className="text-slate-500 text-xs font-mono">{reservation.usuario.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-200 font-medium">{reservation.lugar.nome}</p>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md uppercase font-bold tracking-tighter">
                            {reservation.lugar.categoria}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-slate-300 font-medium">
                              {new Date(reservation.data_hora).toLocaleDateString('pt-BR')}
                            </span>
                            <span className="text-emerald-500 text-xs font-bold">
                              {new Date(reservation.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-white font-black text-xs">
                            {reservation.convidados}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-emerald-400 font-black">
                            €{parseFloat(reservation.preco_total).toFixed(2)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${getStatusBadge(reservation.status)}`}>
                            {reservation.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={reservation.status}
                            onChange={(e) => updateStatus(reservation.id, e.target.value)}
                            className="bg-black border border-slate-700 rounded-lg text-xs font-bold text-slate-300 p-1.5 focus:border-blue-500 outline-none transition-all"
                          >
                            <option value="PENDENTE">Pendente</option>
                            <option value="ACEITA">Aceitar</option>
                            <option value="REJEITADA">Rejeitar</option>
                            <option value="CONCLUIDA">Concluir</option>
                            <option value="CANCELADA">Cancelar</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredReservations.length === 0 && (
                <div className="py-20 text-center">
                  <Calendar size={48} className="text-slate-800 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium tracking-tight">Nenhuma reserva encontrada com este filtro.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Analytics Tab Modernizado */
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Stats Cards Dash */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Fluxo Total', val: reservations.length, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { label: 'Receita Líquida', val: `€${reservations.reduce((sum, r) => sum + parseFloat(r.preco_total), 0).toFixed(2)}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { label: 'Volume Pessoas', val: reservations.reduce((sum, r) => sum + r.convidados, 0), icon: UsersIcon, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                { label: 'Ticket Médio', val: `€${(reservations.reduce((sum, r) => sum + parseFloat(r.preco_total), 0) / (reservations.length || 1)).toFixed(2)}`, icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-400/10' },
              ].map((card, i) => (
                <div key={i} className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-3xl group hover:border-blue-500/30 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-2xl ${card.bg} ${card.color}`}>
                      <card.icon size={24} />
                    </div>
                    <ArrowUpRight size={20} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">{card.label}</p>
                  <h3 className="text-3xl font-black text-white">{card.val}</h3>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-slate-800">
                <h3 className="text-lg font-black text-white mb-8 flex items-center gap-2">
                  <BarChart3 size={20} className="text-blue-500" /> Reservas por Local
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={restaurantStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="nome" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} angle={-15} textAnchor="end" height={50} />
                    <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b', color: '#f1f5f9' }}
                    />
                    <Bar dataKey="totalReservas" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-slate-800">
                <h3 className="text-lg font-black text-white mb-8 flex items-center gap-2">
                  <TrendingUp size={20} className="text-emerald-500" /> Faturamento por Local
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={restaurantStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="nome" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} angle={-15} textAnchor="end" height={50} />
                    <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid #1e293b', color: '#f1f5f9' }}
                      formatter={(value) => [`€${value}`, 'Faturamento']}
                    />
                    <Bar dataKey="receitaTotal" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tabela de Top Performance */}
            <div className="bg-slate-900/30 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
              <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/50">
                <h3 className="text-sm font-black text-slate-300 uppercase tracking-widest">Métricas Detalhadas por Restaurante</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800/50">
                      <th className="px-6 py-4">Posição / Nome</th>
                      <th className="px-6 py-4">Sinalização</th>
                      <th className="px-6 py-4">Reservas</th>
                      <th className="px-6 py-4">Total Bruto</th>
                      <th className="px-6 py-4">Ticket Médio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/30">
                    {restaurantStats.map((restaurant, index) => (
                      <tr key={restaurant.nome} className="hover:bg-slate-800/30 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <span className={`text-xs font-black ${index < 3 ? 'text-emerald-500' : 'text-slate-600'}`}>
                              {(index + 1).toString().padStart(2, '0')}
                            </span>
                            <p className="text-white font-bold">{restaurant.nome}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] px-2 py-1 bg-blue-500/10 text-blue-400 rounded-lg font-black uppercase">
                            {restaurant.categoria}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-300 font-bold">{restaurant.totalReservas}</td>
                        <td className="px-6 py-4 text-emerald-400 font-black">€{restaurant.receitaTotal.toFixed(2)}</td>
                        <td className="px-6 py-4 text-blue-400 font-black">€{(restaurant.receitaTotal / (restaurant.totalReservas || 1)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
