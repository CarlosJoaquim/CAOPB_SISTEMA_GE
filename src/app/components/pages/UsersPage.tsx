import { useEffect, useState } from 'react';
import { Search, Filter, Eye, UserX, UserCheck, Plus, Trash2, Mail, Phone, Building2, Users, CheckCircle, XCircle } from 'lucide-react';
import { SUPABASE_FUNCTION_BASE_URL } from '../../config';

interface User {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  papel: 'USUARIO' | 'AGENTE' | 'ADMIN';
  ativo: boolean;
  criado_em: string;
  lugares?: any[];
  produtos?: any[];
}

interface UsersPageProps {
  accessToken: string;
}

export function UsersPage({ accessToken }: UsersPageProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    nome: '',
    sobrenome: '',
    email: '',
    senha: '',
    telefone: '',
    papel: 'USUARIO' as 'USUARIO' | 'AGENTE' | 'ADMIN'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterRole]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `${SUPABASE_FUNCTION_BASE_URL}/users`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      if (!response.ok) {
        throw new Error('Erro ao buscar usuários');
      }
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.sobrenome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole) {
      filtered = filtered.filter((user) => user.papel === filterRole);
    }

    setFilteredUsers(filtered);
  };

  const fetchUserDetails = async (userId: string) => {
    setLoadingDetails(true);
    try {
      const response = await fetch(
        `${SUPABASE_FUNCTION_BASE_URL}/users/${userId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUserDetails(data);
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do usuário:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    fetchUserDetails(user.id);
    setShowDetails(true);
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await fetch(
        `${SUPABASE_FUNCTION_BASE_URL}/users/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({ ativo: !currentStatus })
        }
      );
      fetchUsers();
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
    }
  };

  const createUser = async () => {
    if (!newUser.nome || !newUser.email || !newUser.senha) {
      alert('Nome, email e senha são obrigatórios');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${SUPABASE_FUNCTION_BASE_URL}/users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify(newUser)
        }
      );

      if (response.ok) {
        setShowAddUser(false);
        setNewUser({
          nome: '',
          sobrenome: '',
          email: '',
          senha: '',
          telefone: '',
          papel: 'USUARIO'
        });
        fetchUsers();
      } else {
        const error = await response.json();
        alert(`Erro ao criar usuário: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      alert('Erro ao criar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja remover este usuário permanentemente?')) {
      return;
    }

    try {
      const response = await fetch(
        `${SUPABASE_FUNCTION_BASE_URL}/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        fetchUsers();
      } else {
        const error = await response.json();
        alert(`Erro ao remover usuário: ${error.error}`);
      }
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      alert('Erro ao remover usuário');
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      ADMIN: 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border-red-500/30',
      AGENTE: 'bg-gradient-to-r from-purple-500/20 to-purple-600/20 text-purple-400 border-purple-500/30',
      USUARIO: 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400 border-blue-500/30'
    };
    return styles[role as keyof typeof styles] || styles.USUARIO;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-2 border-slate-700 border-t-blue-500 mx-auto mb-6"></div>
            <Users className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-400" size={24} />
          </div>
          <p className="text-slate-400">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Gestão de Usuários
              </h1>
              <p className="text-slate-400 mt-1">Total: {filteredUsers.length} usuários cadastrados</p>
            </div>
            <button
              onClick={() => setShowAddUser(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus size={18} />
              Adicionar Usuário
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer appearance-none"
              >
                <option value="">Todos os tipos</option>
                <option value="USUARIO">👤 Usuários</option>
                <option value="AGENTE">🤝 Agentes</option>
                <option value="ADMIN">👑 Administradores</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Usuário</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Contato</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
                          <span className="text-blue-400 font-bold text-sm">
                            {user.nome?.charAt(0)?.toUpperCase()}{user.sobrenome?.charAt(0)?.toUpperCase() || ''}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {user.nome} {user.sobrenome}
                          </p>
                          <p className="text-xs text-slate-500">
                            ID: {user.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Mail size={14} />
                          <span className="text-sm">{user.email}</span>
                        </div>
                        {user.telefone && (
                          <div className="flex items-center gap-2 text-slate-500">
                            <Phone size={12} />
                            <span className="text-xs">{user.telefone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadge(user.papel)}`}>
                        {user.papel === 'ADMIN' && '👑 Admin'}
                        {user.papel === 'AGENTE' && '🤝 Agente'}
                        {user.papel === 'USUARIO' && '👤 Usuário'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                        user.ativo
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}>
                        {user.ativo ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {user.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-400 text-sm">
                        {new Date(user.criado_em).toLocaleDateString('pt-BR')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(user)}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors group"
                          title="Ver detalhes"
                        >
                          <Eye size={18} className="text-slate-400 group-hover:text-blue-400" />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user.id, user.ativo)}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors group"
                          title={user.ativo ? 'Desativar' : 'Ativar'}
                        >
                          {user.ativo ? (
                            <UserX size={18} className="text-slate-400 group-hover:text-red-400" />
                          ) : (
                            <UserCheck size={18} className="text-slate-400 group-hover:text-emerald-400" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors group"
                          title="Remover permanentemente"
                        >
                          <Trash2 size={18} className="text-slate-400 group-hover:text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Nenhum usuário encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-w-md w-full animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <div>
                <h2 className="text-xl font-bold text-white">Adicionar Usuário</h2>
                <p className="text-slate-400 text-sm mt-0.5">Preencha os dados do novo usuário</p>
              </div>
              <button
                onClick={() => setShowAddUser(false)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Nome *</label>
                  <input
                    type="text"
                    value={newUser.nome}
                    onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Sobrenome</label>
                  <input
                    type="text"
                    value={newUser.sobrenome}
                    onChange={(e) => setNewUser({ ...newUser, sobrenome: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Sobrenome"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm mb-2">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm mb-2">Senha *</label>
                <input
                  type="password"
                  value={newUser.senha}
                  onChange={(e) => setNewUser({ ...newUser, senha: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Senha"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm mb-2">Telefone</label>
                <input
                  type="tel"
                  value={newUser.telefone}
                  onChange={(e) => setNewUser({ ...newUser, telefone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+351 123 456 789"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm mb-2">Tipo de Usuário</label>
                <select
                  value={newUser.papel}
                  onChange={(e) => setNewUser({ ...newUser, papel: e.target.value as 'USUARIO' | 'AGENTE' | 'ADMIN' })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  <option value="USUARIO">👤 Usuário</option>
                  <option value="AGENTE">🤝 Agente</option>
                  <option value="ADMIN">👑 Administrador</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-700 bg-slate-900/50 rounded-b-2xl">
              <button
                onClick={() => setShowAddUser(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={createUser}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 text-white rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    Criar Usuário
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showDetails && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white">Detalhes do Usuário</h2>
                  <p className="text-slate-400 text-sm mt-0.5">Informações completas da conta</p>
                </div>
                <button
                  onClick={() => { setShowDetails(false); setUserDetails(null); }}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {loadingDetails ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Informações básicas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 rounded-xl p-4">
                      <label className="text-slate-400 text-xs uppercase tracking-wider">Nome Completo</label>
                      <p className="text-white font-medium mt-1">
                        {selectedUser.nome} {selectedUser.sobrenome}
                      </p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4">
                      <label className="text-slate-400 text-xs uppercase tracking-wider">Email</label>
                      <p className="text-white mt-1 break-all">{selectedUser.email}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4">
                      <label className="text-slate-400 text-xs uppercase tracking-wider">Telefone</label>
                      <p className="text-white mt-1">{selectedUser.telefone || 'Não informado'}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4">
                      <label className="text-slate-400 text-xs uppercase tracking-wider">Tipo de Conta</label>
                      <div className="mt-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadge(selectedUser.papel)}`}>
                          {selectedUser.papel}
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4">
                      <label className="text-slate-400 text-xs uppercase tracking-wider">Status</label>
                      <div className="mt-1">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                          selectedUser.ativo
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}>
                          {selectedUser.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                    <div className="bg-slate-900/50 rounded-xl p-4">
                      <label className="text-slate-400 text-xs uppercase tracking-wider">Data de Criação</label>
                      <p className="text-white mt-1">
                        {new Date(selectedUser.criado_em).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {/* Lugares do Agente */}
                  {selectedUser.papel === 'AGENTE' && userDetails?.lugares && userDetails.lugares.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Building2 size={20} className="text-blue-400" />
                        Estabelecimentos ({userDetails.lugares.length})
                      </h3>
                      <div className="grid grid-cols-1 gap-3">
                        {userDetails.lugares.map((lugar: any) => (
                          <div key={lugar.id} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-white">{lugar.nome}</p>
                                <p className="text-sm text-slate-400">{lugar.categoria} • {lugar.endereco}</p>
                                <p className="text-sm text-slate-400">⭐ Avaliação: {lugar.avaliacao}/5</p>
                              </div>
                              <span className={`px-2 py-1 rounded-lg text-xs ${
                                lugar.ativo ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                              }`}>
                                {lugar.ativo ? 'Ativo' : 'Inativo'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Se for agente mas não tiver lugares */}
                  {selectedUser.papel === 'AGENTE' && (!userDetails?.lugares || userDetails.lugares.length === 0) && (
                    <div className="bg-slate-900/50 rounded-xl p-8 text-center">
                      <Building2 size={32} className="text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">Este agente ainda não tem estabelecimentos cadastrados.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;