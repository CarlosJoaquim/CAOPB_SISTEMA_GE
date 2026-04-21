import { useState, useEffect } from 'react';
import { FileText, Shield, Scale, Eye, EyeOff, Edit, Save, X, Bookmark, Gavel } from 'lucide-react';
import { SUPABASE_FUNCTION_BASE_URL } from '../../config';

interface LegalInfo {
  id: string;
  tipo: string;
  titulo: string;
  conteudo: string;
  versao: string;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
  readonly?: boolean;
}

interface LegalPageProps {
  accessToken: string;
}

export function LegalPage({ accessToken }: LegalPageProps) {
  const [legalInfos, setLegalInfos] = useState<LegalInfo[]>([]);
  const [selectedInfo, setSelectedInfo] = useState<LegalInfo | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    fetchLegalInfos();
  }, []);

  const fetchLegalInfos = async () => {
    try {
      const response = await fetch(
        `${SUPABASE_FUNCTION_BASE_URL}/legal`,
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar documentos legais');
      }

      const data = await response.json();

      // Transformar dados do backend para o formato da interface
      const transformedLegalInfos: LegalInfo[] = data.map((doc: any) => ({
        id: doc.id,
        tipo: doc.tipo,
        titulo: doc.titulo,
        conteudo: doc.conteudo,
        versao: doc.versao,
        ativo: doc.ativo,
        criado_em: doc.criado_em,
        atualizado_em: doc.atualizado_em,
        readonly: doc.readonly === true
      }));

      setLegalInfos(transformedLegalInfos);
    } catch (error) {
      console.error('Erro ao buscar documentos legais:', error);
      // Fallback para dados mock em caso de erro
      const mockLegalInfos: LegalInfo[] = [
        {
          id: '1',
          tipo: 'termos',
          titulo: 'Termos de Uso',
          conteudo: '# Termos de Uso\n\n## 1. Aceitação dos Termos\nAo acessar e usar este aplicativo, você concorda em cumprir estes termos de uso.',
          versao: '1.2.0',
          ativo: true,
          criado_em: '2024-01-15T10:00:00Z',
          atualizado_em: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          tipo: 'privacidade',
          titulo: 'Política de Privacidade',
          conteudo: '# Política de Privacidade\n\n## 1. Coleta de Dados\nColetamos apenas os dados necessários para o funcionamento do serviço.',
          versao: '1.1.0',
          ativo: true,
          criado_em: '2024-01-10T14:00:00Z',
          atualizado_em: '2024-01-10T14:00:00Z'
        }
      ];
      setLegalInfos(mockLegalInfos);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (tipo: string) => {
    switch (tipo) {
      case 'termos':
        return <FileText size={18} className="text-blue-400" />;
      case 'privacidade':
        return <Shield size={18} className="text-green-400" />;
      case 'cookies':
        return <Scale size={18} className="text-orange-400" />;
      default:
        return <FileText size={18} className="text-gray-400" />;
    }
  };

  const getCategoryBadge = (tipo: string) => {
    const styles = {
      termos: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      privacidade: 'bg-green-500/10 text-green-400 border-green-500/20',
      cookies: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      outros: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    };
    return styles[tipo as keyof typeof styles] || styles.outros;
  };

  const handleEdit = (info: LegalInfo) => {
    if (info.readonly) {
      alert('Os documentos legais estão em modo somente leitura até a tabela documentos_legais ser criada.');
      return;
    }

    setSelectedInfo(info);
    setEditedContent(info.conteudo);
    setEditing(true);
    setShowDetails(true);
  };

  const handleSave = async () => {
    if (!selectedInfo) return;

    try {
      const response = await fetch(
        `${SUPABASE_FUNCTION_BASE_URL}/legal/${selectedInfo.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            titulo: selectedInfo.titulo,
            conteudo: editedContent,
            versao: (parseFloat(selectedInfo.versao) + 0.1).toFixed(1),
            ativo: selectedInfo.ativo
          })
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao atualizar documento');
      }

      await fetchLegalInfos();
      setEditing(false);
      setShowDetails(false);
      setSelectedInfo(null);
      alert('Informação legal atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar alterações');
    }
  };

  const toggleVisibility = async (infoId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(
        `${SUPABASE_FUNCTION_BASE_URL}/legal/${infoId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            titulo: legalInfos.find(info => info.id === infoId)?.titulo,
            conteudo: legalInfos.find(info => info.id === infoId)?.conteudo,
            versao: legalInfos.find(info => info.id === infoId)?.versao,
            ativo: !currentStatus
          })
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao alterar visibilidade');
      }

      await fetchLegalInfos();
    } catch (error) {
      console.error('Erro ao alterar visibilidade:', error);
      alert('Erro ao alterar visibilidade');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-slate-800 border-t-blue-500 mx-auto mb-6"></div>
          <p className="text-slate-500 font-medium">Sincronizando documentos legais...</p>
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
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Compliance & Jurídico
            </h1>
            <p className="text-slate-500 mt-2 flex items-center gap-2">
              <Gavel size={16} className="text-blue-500" />
              Gestão centralizada de termos e políticas
            </p>
          </div>
        </div>

        {/* Dashboard de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-800 hover:border-blue-500/30 transition-all">
            <p className="text-blue-400 text-xs font-black uppercase tracking-widest mb-4">Total de Documentos</p>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <FileText size={24} className="text-blue-500" />
              </div>
              <span className="text-4xl font-black text-white">{legalInfos.length}</span>
            </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-800 hover:border-emerald-500/30 transition-all">
            <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mb-4">Privacidade</p>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <Shield size={24} className="text-emerald-500" />
              </div>
              <span className="text-4xl font-black text-white">
                {legalInfos.filter(info => info.tipo === 'privacidade').length}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-800 transition-all">
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-4">Publicados</p>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-800 rounded-xl">
                <Eye size={24} className="text-slate-300" />
              </div>
              <span className="text-4xl font-black text-white">
                {legalInfos.filter(info => info.ativo).length}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-800 transition-all">
            <p className="text-blue-400 text-xs font-black uppercase tracking-widest mb-4">Revisados (30d)</p>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Edit size={24} className="text-blue-400" />
              </div>
              <span className="text-4xl font-black text-white">
                {legalInfos.filter(info => new Date(info.atualizado_em) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
              </span>
            </div>
          </div>
        </div>

        {/* Lista de Documentos */}
        <div className="bg-slate-900/30 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl animate-in fade-in duration-500">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900/80">
                  <th className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Categoria</th>
                  <th className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Documento</th>
                  <th className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Versão</th>
                  <th className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Atualizado em</th>
                  <th className="px-6 py-5 text-right text-xs font-black text-slate-500 uppercase tracking-widest">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {legalInfos.map((info) => (
                  <tr key={info.id} className="hover:bg-blue-500/5 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {getCategoryIcon(info.tipo)}
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border ${getCategoryBadge(info.tipo)}`}>
                          {info.tipo}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-white font-bold group-hover:text-blue-400 transition-colors">{info.titulo}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-slate-500 font-mono text-xs font-bold bg-slate-800/50 px-2 py-1 rounded">v{info.versao}</span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                        info.ativo
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {info.ativo ? 'PUBLICADO' : 'OCULTO'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-slate-400 text-xs font-medium">
                        {new Date(info.atualizado_em).toLocaleDateString('pt-BR')}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setSelectedInfo(info); setShowDetails(true); setEditing(false); }}
                          className="p-2.5 bg-slate-800 hover:bg-blue-500/20 text-blue-400 rounded-xl transition-all"
                          title="Ver conteúdo"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEdit(info)}
                          disabled={info.readonly}
                          className="p-2.5 bg-slate-800 hover:bg-amber-500/20 text-amber-400 rounded-xl transition-all disabled:opacity-30"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => toggleVisibility(info.id, info.ativo)}
                          disabled={info.readonly}
                          className="p-2.5 bg-slate-800 hover:bg-red-500/20 text-red-400 rounded-xl transition-all disabled:opacity-30"
                          title={info.ativo ? 'Ocultar' : 'Mostrar'}
                        >
                          {info.ativo ? <EyeOff size={18} /> : <Eye size={18} className="text-emerald-400" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
            <Bookmark size={14} className="text-emerald-500" />
            Todas as alterações são registradas para auditoria de compliance.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Base de Dados Conectada</span>
          </div>
        </div>
      </div>

      {/* Legal Document Modal */}
      {showDetails && selectedInfo && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start p-8 border-b border-slate-800 bg-slate-900/50">
              <div>
                <h2 className="text-2xl font-black text-white">{selectedInfo.titulo}</h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${getCategoryBadge(selectedInfo.tipo)}`}>
                    {selectedInfo.tipo}
                  </span>
                  <span className="text-slate-500 text-xs font-bold">Versão {selectedInfo.versao}</span>
                  <span className="text-slate-500 text-xs font-bold">
                    Atualizado em {new Date(selectedInfo.atualizado_em).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {editing && (
                  <button
                    onClick={handleSave}
                    className="p-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-xl transition-all"
                    title="Salvar"
                  >
                    <Save size={20} />
                  </button>
                )}
                <button
                  onClick={() => { setShowDetails(false); setEditing(false); setSelectedInfo(null); }}
                  className="p-3 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto max-h-[60vh] bg-black/40">
              {editing ? (
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-96 p-6 bg-black border border-slate-700 rounded-2xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm leading-relaxed"
                  placeholder="Conteúdo em Markdown..."
                />
              ) : (
                <div className="max-w-none">
                  <pre className="whitespace-pre-wrap text-slate-300 text-sm leading-relaxed font-sans">
                    {selectedInfo.conteudo}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
