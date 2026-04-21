import React, { useEffect, useState } from 'react';
import { Search, MapPin, Star, Eye, ImageIcon, MapPinned } from 'lucide-react';

const SUPABASE_BUCKET_URL = 'https://ewyckxscedklztarigha.supabase.co/storage/v1/object/public/';

interface Place {
  id: string;
  nome: string;
  descricao: string;
  endereco: string;
  categoria: string;
  latitude: number;
  longitude: number;
  url_imagem: string;
  faixa_preco: 'BARATO' | 'MODERADO' | 'CARO';
  avaliacao: number;
  ativo: boolean;
  totalReservas: number;
  totalPedidos: number;
  totalAvaliacoes: number;
  receitaTotal: string;
  criado_em: string;
}

interface PlacesPageProps {
  accessToken: string;
}

export function PlacesPage({ accessToken }: PlacesPageProps) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const categorias = [...new Set(places.map(p => p.categoria).filter(Boolean))];

  useEffect(() => {
    fetchPlaces();
  }, []);

  useEffect(() => {
    filterPlaces();
  }, [places, searchTerm, filterCategoria]);

  const fetchPlaces = async () => {
    try {
      const response = await fetch(
        'https://ewyckxscedklztarigha.supabase.co/functions/v1/make-server-b2f35964/places',
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      const data = await response.json();
      setPlaces(data);
      setFilteredPlaces(data);
    } catch (error) {
      console.error('Erro ao buscar lugares:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPlaces = () => {
    let filtered = [...places];

    if (searchTerm) {
      filtered = filtered.filter(
        (place) =>
          place.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          place.categoria.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategoria) {
      filtered = filtered.filter((place) => place.categoria === filterCategoria);
    }

    setFilteredPlaces(filtered);
  };

  const getPriceBadge = (price: string) => {
    const styles = {
      BARATO: 'bg-green-500/10 text-green-400 border-green-500/20',
      MODERADO: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      CARO: 'bg-red-500/10 text-red-400 border-red-500/20'
    };
    return styles[price as keyof typeof styles] || styles.MODERADO;
  };

  const togglePlaceStatus = async (placeId: string, currentStatus: boolean) => {
    try {
      await fetch(
        `https://ewyckxscedklztarigha.supabase.co/functions/v1/make-server-b2f35964/places/${placeId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({ ativo: !currentStatus })
        }
      );
      fetchPlaces();
    } catch (error) {
      console.error('Erro ao alterar status do lugar:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando lugares...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestão de Lugares</h1>
          <p className="text-slate-400">Total: {filteredPlaces.length} estabelecimentos</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg
                text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div className="relative">
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg
                text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer"
            >
              <option value="">Todas as categorias</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Places Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlaces.map((place) => (
          <div
            key={place.id}
            className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/10"
          >
            {/* Image */}
            <div className="relative h-40 bg-slate-700">
              {place.url_imagem ? (
                <img
                  src={`${SUPABASE_BUCKET_URL}${place.url_imagem}`}
                  alt={place.nome}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`hidden absolute inset-0 flex items-center justify-center bg-slate-700 ${!place.url_imagem ? '' : 'hidden'}`}>
                <ImageIcon size={48} className="text-slate-500" />
              </div>
              {/* Category Badge */}
              <span className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs text-white font-medium">
                {place.categoria}
              </span>
              {/* Status Badge */}
              <span className={`absolute top-3 right-3 px-3 py-1 backdrop-blur-sm rounded-full text-xs font-medium ${
                place.ativo
                  ? 'bg-green-500/80 text-white'
                  : 'bg-red-500/80 text-white'
              }`}>
                {place.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            <div className="p-5">
              {/* Nome */}
              <h3 className="text-lg font-bold text-white mb-1 truncate">{place.nome}</h3>

              {/* Location */}
              <div className="flex items-start gap-2 mb-4">
                <MapPin size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-300 line-clamp-2">{place.endereco}</p>
              </div>

              {/* Metrics Row */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-white font-semibold text-sm">{place.avaliacao?.toFixed(1) || 'N/A'}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriceBadge(place.faixa_preco)}`}>
                  {place.faixa_preco}
                </span>
              </div>

              {/* Stats */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Reservas:</span>
                  <span className="text-white font-medium">{place.totalReservas || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Pedidos:</span>
                  <span className="text-white font-medium">{place.totalPedidos || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Avaliações:</span>
                  <span className="text-white font-medium">{place.totalAvaliacoes || 0}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-slate-700">
                  <span className="text-slate-400">Receita Total:</span>
                  <span className="text-green-400 font-bold">
                    {parseFloat(place.receitaTotal || '0').toLocaleString('pt-BR')} Kz
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedPlace(place);
                    setShowDetails(true);
                  }}
                  className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg
                    transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  Detalhes
                </button>
                <button
                  onClick={() => togglePlaceStatus(place.id, place.ativo)}
                  className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm ${
                    place.ativo
                      ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                      : 'bg-green-500/10 hover:bg-green-500/20 text-green-400'
                  }`}
                >
                  {place.ativo ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Place Details Modal */}
      {showDetails && selectedPlace && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-white">Detalhes do Lugar</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm">Nome</label>
                  <p className="text-white font-medium text-lg">{selectedPlace.nome}</p>
                </div>
                <div>
                  <label className="text-slate-400 text-sm">Categoria</label>
                  <p className="text-white">{selectedPlace.categoria}</p>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm">Descrição</label>
                <p className="text-white">{selectedPlace.descricao || 'Sem descrição'}</p>
              </div>

              <div>
                <label className="text-slate-400 text-sm">Endereço</label>
                <p className="text-white">{selectedPlace.endereco}</p>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-900 rounded-lg">
                <div>
                  <p className="text-slate-400 text-sm mb-1">Avaliação</p>
                  <div className="flex items-center gap-1">
                    <Star size={18} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-white font-bold text-lg">
                      {selectedPlace.avaliacao?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Reservas</p>
                  <p className="text-white font-bold text-lg">{selectedPlace.totalReservas}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Pedidos</p>
                  <p className="text-white font-bold text-lg">{selectedPlace.totalPedidos}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm mb-1">Receita</p>
                  <p className="text-green-400 font-bold text-lg">
                    {parseFloat(selectedPlace.receitaTotal).toLocaleString('pt-BR')} Kz
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-sm">Faixa de Preço</label>
                  <p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPriceBadge(selectedPlace.faixa_preco)}`}>
                      {selectedPlace.faixa_preco}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-slate-400 text-sm">Status</label>
                  <p>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${
                        selectedPlace.ativo
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}
                    >
                      {selectedPlace.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-sm">Data de Criação</label>
                <p className="text-white">
                  {new Date(selectedPlace.criado_em).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
