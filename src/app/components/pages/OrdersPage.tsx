import React, { useEffect, useState } from 'react';
import { Filter, ShoppingBag, Truck, ImageIcon, RefreshCw } from 'lucide-react';

const SUPABASE_BUCKET_URL = 'https://ewyckxscedklztarigha.supabase.co/storage/v1/object/public/';

interface Order {
  id: string;
  quantidade: number;
  preco_total: string;
  modo_entrega: 'RETIRADA' | 'ENTREGA';
  status: 'PENDENTE' | 'ACEITO' | 'REJEITADO' | 'EM_TRANSITO' | 'CONCLUIDO' | 'CANCELADO';
  criado_em: string;
  usuario: { nome: string; sobrenome: string; email: string };
  lugar: { nome: string; categoria: string; url_imagem?: string };
  produto: { nome: string; preco: string; url_imagem?: string };
}

interface OrdersPageProps {
  accessToken: string;
}

export function OrdersPage({ accessToken }: OrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://ewyckxscedklztarigha.supabase.co/functions/v1/make-server-b2f35964/orders',
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      const data = await response.json();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, filterStatus]);

  const filterOrders = () => {
    let filtered = [...orders];

    if (filterStatus) {
      filtered = filtered.filter((order) => order.status === filterStatus);
    }

    setFilteredOrders(filtered);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(
        `https://ewyckxscedklztarigha.supabase.co/functions/v1/make-server-b2f35964/orders/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({ status: newStatus })
        }
      );
      fetchOrders();
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDENTE: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      ACEITO: 'bg-blue-100 text-blue-700 border-blue-200',
      REJEITADO: 'bg-red-100 text-red-700 border-red-200',
      EM_TRANSITO: 'bg-purple-100 text-purple-700 border-purple-200',
      CONCLUIDO: 'bg-green-100 text-green-700 border-green-200',
      CANCELADO: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return styles[status as keyof typeof styles] || styles.PENDENTE;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestão de Pedidos</h1>
          <p className="text-muted-foreground">Total: {filteredOrders.length} pedidos</p>
        </div>
        <button
          onClick={fetchOrders}
          className="p-2 bg-muted hover:bg-accent rounded-lg transition-colors"
          title="Atualizar"
        >
          <RefreshCw size={18} className="text-muted-foreground" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag size={16} className="text-primary" />
            <span className="text-muted-foreground text-xs">Total</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{orders.length}</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-yellow-600 text-xs">Pendente</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            {orders.filter(o => o.status === 'PENDENTE').length}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <Truck size={16} className="text-purple-600" />
            <span className="text-muted-foreground text-xs">Em Trânsito</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {orders.filter(o => o.status === 'EM_TRANSITO').length}
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-green-600 text-xs">Receita</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {orders.reduce((sum, o) => sum + (parseFloat(o.preco_total) || 0), 0).toLocaleString('pt-BR')} Kz
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-lg
              text-foreground focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
          >
            <option value="">Todos os status</option>
            <option value="PENDENTE">Pendente</option>
            <option value="ACEITO">Aceito</option>
            <option value="REJEITADO">Rejeitado</option>
            <option value="EM_TRANSITO">Em Trânsito</option>
            <option value="CONCLUIDO">Concluído</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Produto</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Usuário</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Estabelecimento</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Preço</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Entrega</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {order.produto?.url_imagem || order.lugar?.url_imagem ? (
                          <img
                            src={`${SUPABASE_BUCKET_URL}${order.produto?.url_imagem || order.lugar?.url_imagem}`}
                            alt={order.produto?.nome}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={20} className="text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-foreground font-medium text-sm">{order.produto?.nome}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-foreground font-medium">
                      {order.usuario?.nome} {order.usuario?.sobrenome}
                    </p>
                    <p className="text-muted-foreground text-sm">{order.usuario?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-foreground">{order.lugar?.nome}</p>
                    <p className="text-muted-foreground text-sm">{order.lugar?.categoria}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-green-600 font-semibold">
                      {parseFloat(order.preco_total).toLocaleString('pt-BR')} Kz
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {order.modo_entrega === 'ENTREGA' ? (
                        <Truck size={16} className="text-purple-600" />
                      ) : (
                        <ShoppingBag size={16} className="text-blue-600" />
                      )}
                      <span className="text-foreground text-sm">{order.modo_entrega}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(order.status)}`}>
                      {order.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {order.status === 'PENDENTE' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus(order.id, 'ACEITO')}
                          className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          Aceitar
                        </button>
                        <button
                          onClick={() => updateStatus(order.id, 'REJEITADO')}
                          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                        >
                          Rejeitar
                        </button>
                      </div>
                    )}
                    {order.status === 'ACEITO' && (
                      <button
                        onClick={() => updateStatus(order.id, 'EM_TRANSITO')}
                        className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        Enviar
                      </button>
                    )}
                    {order.status === 'EM_TRANSITO' && (
                      <button
                        onClick={() => updateStatus(order.id, 'CONCLUIDO')}
                        className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        Concluir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}