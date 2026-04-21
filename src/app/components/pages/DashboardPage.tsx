import { useEffect, useState, useCallback } from 'react';
import { MetricCard } from '../MetricCard';
import {
  Users,
  UserCog,
  ShieldCheck,
  Building2,
  Calendar,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Activity,
  Award
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface DashboardStats {
  totalUsuarios: number;
  totalAgentes: number;
  totalAdmins: number;
  totalLugares: number;
  totalReservas: number;
  totalPedidos: number;
  receitaTotal: string;
  ticketMedio: string;
}

interface DashboardPageProps {
  accessToken: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#06b6d4'];

export function DashboardPage({ accessToken }: DashboardPageProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [userDistribution, setUserDistribution] = useState<any[]>([]);
  const [popularPlaces, setPopularPlaces] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      
      const [statsRes, growthRes, revenueRes, distributionRes, placesRes, activityRes] = await Promise.all([
        fetch('https://ewyckxscedklztarigha.supabase.co/functions/v1/make-server-b2f35964/dashboard/stats', { headers }),
        fetch('https://ewyckxscedklztarigha.supabase.co/functions/v1/make-server-b2f35964/dashboard/user-growth', { headers }),
        fetch('https://ewyckxscedklztarigha.supabase.co/functions/v1/make-server-b2f35964/dashboard/monthly-revenue', { headers }),
        fetch('https://ewyckxscedklztarigha.supabase.co/functions/v1/make-server-b2f35964/dashboard/user-distribution', { headers }),
        fetch('https://ewyckxscedklztarigha.supabase.co/functions/v1/make-server-b2f35964/dashboard/popular-places', { headers }),
        fetch('https://ewyckxscedklztarigha.supabase.co/functions/v1/make-server-b2f35964/dashboard/recent-activity', { headers })
      ]);

      const statsData = await statsRes.json();
      const growthData = await growthRes.json();
      const revenueData = await revenueRes.json();
      const distributionData = await distributionRes.json();
      const placesData = await placesRes.json();
      const activityData = await activityRes.json();

      setStats(statsData);
      setUserGrowth(Array.isArray(growthData) ? growthData : []);
      setMonthlyRevenue(Array.isArray(revenueData) ? revenueData : []);
      setUserDistribution(Array.isArray(distributionData) ? distributionData : []);
      setPopularPlaces(Array.isArray(placesData) ? placesData.slice(0, 5) : []);
      setRecentActivity(Array.isArray(activityData) ? activityData.slice(0, 5) : []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-slate-700 border-t-blue-500 mx-auto mb-6"></div>
            <Activity className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-400" size={24} />
          </div>
          <h3 className="text-white font-medium mb-1">Carregando Dashboard</h3>
          <p className="text-slate-400 text-sm">Obtendo dados mais recentes...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">Erro ao carregar dados</p>
          <button onClick={fetchDashboardData} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Visão geral da plataforma Caop-B</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdate && (
            <p className="text-xs text-slate-500">
              Atualizado {lastUpdate.toLocaleTimeString('pt-BR')}
            </p>
          )}
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin text-blue-400' : 'text-slate-400'} />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total de Usuários" value={stats.totalUsuarios} icon={Users} color="blue" />
        <MetricCard title="Agentes" value={stats.totalAgentes} icon={UserCog} color="purple" />
        <MetricCard title="Estabelecimentos" value={stats.totalLugares} icon={Building2} color="green" />
        <MetricCard title="Reservas" value={stats.totalReservas} icon={Calendar} color="cyan" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Pedidos" value={stats.totalPedidos} icon={ShoppingCart} color="orange" />
        <MetricCard title="Receita Total" value={`${parseFloat(stats.receitaTotal || '0').toLocaleString('pt-BR')} Kz`} icon={DollarSign} color="green" />
        <MetricCard title="Ticket Médio" value={`${parseFloat(stats.ticketMedio || '0').toLocaleString('pt-BR')} Kz`} icon={TrendingUp} color="blue" />
        <MetricCard title="Admins" value={stats.totalAdmins} icon={ShieldCheck} color="red" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Chart */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Crescimento de Usuários (Últimos 30 dias)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{fill: '#3b82f6'}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* User Distribution Pie Chart */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Distribuição de Usuários</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={userDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="count"
                nameKey="papel"
              >
                {userDistribution.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {userDistribution.map((item: any, index: number) => (
              <div key={item.papel} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}} />
                <span className="text-xs text-slate-400">{item.papel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Receita Mensal (Últimos 12 meses)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} formatter={(value: any) => [`${parseFloat(value || 0).toLocaleString('pt-BR')} Kz`, 'Receita']} />
            <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Popular Places & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Estabelecimentos Populares</h3>
          <div className="space-y-3">
            {popularPlaces.map((place: any, index: number) => (
              <div key={place.id} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{place.nome}</p>
                  <p className="text-slate-400 text-sm">{place.totalReservas || 0} reservas • {place.totalPedidos || 0} pedidos</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-medium">{place.avaliacao?.toFixed(1) || '0.0'}</p>
                  <p className="text-slate-500 text-xs">avaliação</p>
                </div>
              </div>
            ))}
            {popularPlaces.length === 0 && (
              <p className="text-slate-400 text-center py-4">Nenhum estabelecimento encontrado</p>
            )}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Atividade Recente</h3>
          <div className="space-y-3">
            {recentActivity.map((activity: any, index: number) => (
              <div key={activity.id || index} className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.tipo === 'reserva' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {activity.tipo === 'reserva' ? <Calendar size={18} /> : <ShoppingCart size={18} />}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">
                    {activity.tipo === 'reserva' ? 'Nova reserva' : 'Novo pedido'}
                  </p>
                  <p className="text-slate-400 text-xs">{activity.lugar?.nome || 'Estabelecimento'}</p>
                </div>
                <p className="text-slate-500 text-xs">
                  {activity.criado_em ? new Date(activity.criado_em).toLocaleDateString('pt-BR') : ''}
                </p>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-slate-400 text-center py-4">Nenhuma atividade recente</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}