import { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Download } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';

interface FinancePageProps {
  accessToken: string;
}

const COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#ec4899'];

export function FinancePage({ accessToken }: FinancePageProps) {
  const [stats, setStats] = useState<any>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([]);
  const [popularPlaces, setPopularPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      const [statsRes, revenueRes, placesRes] = await Promise.all([
        fetch('https://ewyckxscedklztarigha.supabase.co/functions/v1/make-server-b2f35964/dashboard/stats', {
          headers: { Authorization: `Bearer ${accessToken}` }
        }),
        fetch('https://ewyckxscedklztarigha.supabase.co/functions/v1/make-server-b2f35964/dashboard/monthly-revenue', {
          headers: { Authorization: `Bearer ${accessToken}` }
        }),
        fetch('https://ewyckxscedklztarigha.supabase.co/functions/v1/make-server-b2f35964/dashboard/popular-places', {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
      ]);

      const statsData = await statsRes.json();
      const revenueData = await revenueRes.json();
      const placesData = await placesRes.json();

      setStats(statsData);
      setMonthlyRevenue(revenueData);
      setPopularPlaces(placesData.slice(0, 10));
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('Relatório Financeiro - Caop-B', 20, 20);

    doc.setFontSize(12);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);

    // Stats
    doc.setFontSize(14);
    doc.text('Resumo Financeiro', 20, 45);

    doc.setFontSize(10);
    doc.text(`Receita Total: ${parseFloat(stats.receitaTotal).toLocaleString('pt-BR')} Kz`, 20, 55);
    doc.text(`Ticket Médio: ${parseFloat(stats.ticketMedio).toLocaleString('pt-BR')} Kz`, 20, 62);
    doc.text(`Total de Reservas: ${stats.totalReservas}`, 20, 69);
    doc.text(`Total de Pedidos: ${stats.totalPedidos}`, 20, 76);

    // Places ranking
    doc.setFontSize(14);
    doc.text('Top 10 Lugares por Faturamento', 20, 95);

    doc.setFontSize(10);
    let yPosition = 105;
    popularPlaces.forEach((place, index) => {
      doc.text(
        `${index + 1}. ${place.nome} - ${place.totalInteracoes} interações`,
        20,
        yPosition
      );
      yPosition += 7;
    });

    // Footer
    doc.setFontSize(8);
    doc.text('© 2026 Caop-B - Lazer ao alcance do seu bolso', 20, 280);

    doc.save(`relatorio-financeiro-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-slate-400 py-12">
        Erro ao carregar dados
      </div>
    );
  }

  // Prepare revenue by source data
  const revenueBySource = [
    { name: 'Reservas', value: parseFloat(stats.receitaTotal) * 0.6 },
    { name: 'Pedidos', value: parseFloat(stats.receitaTotal) * 0.4 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Análise Financeira</h1>
          <p className="text-slate-400">Visão detalhada da receita e performance</p>
        </div>
        <button
          onClick={exportToPDF}
          className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg
            transition-colors flex items-center gap-2"
        >
          <Download size={20} />
          Exportar PDF
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-green-400" size={24} />
            <p className="text-slate-300 text-sm font-medium">Receita Total</p>
          </div>
          <p className="text-4xl font-bold text-white mb-1">
            {parseFloat(stats.receitaTotal).toLocaleString('pt-BR')} Kz
          </p>
          <p className="text-green-400 text-sm">↑ Performance geral</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-blue-400" size={24} />
            <p className="text-slate-300 text-sm font-medium">Ticket Médio</p>
          </div>
          <p className="text-4xl font-bold text-white mb-1">
            {parseFloat(stats.ticketMedio).toLocaleString('pt-BR')} Kz
          </p>
          <p className="text-blue-400 text-sm">Por transação</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-purple-400" size={24} />
            <p className="text-slate-300 text-sm font-medium">Total de Transações</p>
          </div>
          <p className="text-4xl font-bold text-white mb-1">
            {stats.totalReservas + stats.totalPedidos}
          </p>
          <p className="text-purple-400 text-sm">
            {stats.totalReservas} reservas + {stats.totalPedidos} pedidos
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Receita Mensal (Últimos 12 meses)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => [`${parseFloat(value).toLocaleString('pt-BR')} Kz`, 'Receita']}
              />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Source */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            Receita por Fonte
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={revenueBySource}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value.toLocaleString('pt-BR')} Kz`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueBySource.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
                formatter={(value: any) => `${parseFloat(value).toLocaleString('pt-BR')} Kz`}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Places by Revenue */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Top 10 Lugares por Faturamento</h2>
        </div>

        <div className="p-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={popularPlaces}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="nome"
                stroke="#9ca3af"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="totalInteracoes" fill="#06b6d4" name="Interações" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Places Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Detalhamento por Lugar</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Posição</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Nome</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Avaliação</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Reservas</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Pedidos</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {popularPlaces.map((place, index) => (
                <tr key={place.id} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold
                      ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        index === 1 ? 'bg-slate-500/20 text-slate-300' :
                        index === 2 ? 'bg-orange-500/20 text-orange-400' :
                        'bg-slate-700 text-slate-400'}
                    `}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{place.nome}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-yellow-400 font-semibold">
                      ⭐ {place.avaliacao?.toFixed(1) || 'N/A'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-300">{place.totalReservas || 0}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-slate-300">{place.totalPedidos || 0}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-cyan-400 font-bold">{place.totalInteracoes}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <TrendingUp className="text-cyan-400 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="text-white font-semibold mb-2">💡 Insights Financeiros</h3>
            <ul className="text-slate-300 space-y-2">
              <li>
                • O lugar mais rentável é "{popularPlaces[0]?.nome}" com {popularPlaces[0]?.totalInteracoes} interações
              </li>
              <li>
                • A receita média mensal é de {(parseFloat(stats.receitaTotal) / Math.max(monthlyRevenue.length, 1)).toLocaleString('pt-BR')} Kz
              </li>
              <li>
                • Ticket médio atual: {parseFloat(stats.ticketMedio).toLocaleString('pt-BR')} Kz por transação
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
