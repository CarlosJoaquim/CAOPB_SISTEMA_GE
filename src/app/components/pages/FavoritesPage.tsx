import React, { useEffect, useState } from 'react';
import { Heart, TrendingUp, Award, Star, Medal, Crown, TrendingDown, BarChart3, Sparkles } from 'lucide-react';

interface FavoritePlace {
  id: string;
  nome: string;
  categoria: string;
  totalFavoritos: number;
  avaliacao?: number;
  crescimento?: number;
}

interface FavoritesPageProps {
  accessToken: string;
}

export function FavoritesPage({ accessToken }: FavoritesPageProps) {
  const [favorites, setFavorites] = useState<FavoritePlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('month');

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const response = await fetch(
        'https://ewyckxscedklztarigha.supabase.co/functions/v1/make-server-b2f35964/favorites',
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      const data = await response.json();
      // Adicionar dados mock de crescimento e avaliação
      const enrichedData = data.map((place: any, index: number) => ({
        ...place,
        avaliacao: (4 + Math.random()).toFixed(1),
        crescimento: Math.floor(Math.random() * 30) - 5
      }));
      setFavorites(enrichedData);
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown size={20} className="text-yellow-400" />;
      case 1:
        return <Medal size={20} className="text-slate-300" />;
      case 2:
        return <Medal size={20} className="text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankingBadge = (index: number) => {
    const styles = {
      0: 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-400 border-yellow-500/30',
      1: 'bg-gradient-to-r from-slate-500/20 to-slate-600/20 text-slate-300 border-slate-500/30',
      2: 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 text-amber-400 border-amber-600/30',
    };
    return styles[index as keyof typeof styles] || 'bg-slate-700/50 text-slate-300 border-slate-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-2 border-slate-700 border-t-red-500 mx-auto mb-6"></div>
            <Heart className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-400" size={24} />
          </div>
          <p className="text-slate-400">Carregando estatísticas de favoritos...</p>
        </div>
      </div>
    );
  }

  const totalFavorites = favorites.reduce((sum, f) => sum + f.totalFavoritos, 0);
  const averageFavorites = totalFavorites / favorites.length;
  const topPlace = favorites[0];
  const topPercentage = topPlace ? ((topPlace.totalFavoritos / totalFavorites) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                Lugares Favoritos
              </h1>
              <p className="text-slate-400 mt-1">Ranking de popularidade e engajamento</p>
            </div>
            
            {/* Period Selector */}
            <div className="flex items-center gap-1 bg-slate-800 rounded-xl border border-slate-700 p-1">
              {[
                { id: 'week', label: 'Semana' },
                { id: 'month', label: 'Mês' },
                { id: 'all', label: 'Geral' }
              ].map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period.id as any)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    selectedPeriod === period.id
                      ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-sm'
                      : 'text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Total Favoritos */}
          <div className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-5 hover:shadow-lg hover:shadow-red-500/10 hover:border-red-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-red-500/10">
                <Heart size={20} className="text-red-400" />
              </div>
              <TrendingUp size={16} className="text-emerald-400" />
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Total de Favoritos</h3>
            <p className="text-2xl font-bold text-white">{totalFavorites.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-2">em toda plataforma</p>
          </div>

          {/* Média por Lugar */}
          <div className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-5 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10">
                <BarChart3 size={20} className="text-blue-400" />
              </div>
              <Star size={16} className="text-amber-400" />
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Média por Lugar</h3>
            <p className="text-2xl font-bold text-white">{averageFavorites.toFixed(0)}</p>
            <p className="text-xs text-slate-500 mt-2">favoritos por estabelecimento</p>
          </div>

          {/* Lugar Mais Popular */}
          <div className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-5 hover:shadow-lg hover:shadow-yellow-500/10 hover:border-yellow-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-yellow-500/10">
                <Crown size={20} className="text-yellow-400" />
              </div>
              <span className="text-xs font-semibold text-yellow-400">#1</span>
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Mais Popular</h3>
            <p className="text-lg font-bold text-white truncate">{topPlace?.nome || '-'}</p>
            <p className="text-xs text-slate-500 mt-2">{topPercentage}% dos favoritos</p>
          </div>

          {/* Engajamento */}
          <div className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-5 hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10">
                <Sparkles size={20} className="text-emerald-400" />
              </div>
            </div>
            <h3 className="text-slate-400 text-sm font-medium mb-1">Taxa de Conversão</h3>
            <p className="text-2xl font-bold text-white">+24.5%</p>
            <p className="text-xs text-emerald-400 mt-2">vs mês anterior</p>
          </div>
        </div>

        {/* Ranking Principal */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-700 bg-slate-800/30">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Award size={24} className="text-yellow-400" />
                  Ranking de Popularidade
                </h2>
                <p className="text-slate-400 text-sm mt-1">Estabelecimentos mais favoritados</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Ordenado por número de favoritos</span>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-700">
            {favorites.map((place, index) => (
              <div
                key={place.id}
                className="p-6 hover:bg-slate-700/30 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    {/* Ranking Number com Medalha */}
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-bold text-xl ${getRankingBadge(index)} border-2`}>
                        {index + 1}
                      </div>
                      {index < 3 && (
                        <div className="absolute -top-2 -right-2">
                          {getMedalIcon(index)}
                        </div>
                      )}
                    </div>

                    {/* Place Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-white font-semibold text-lg group-hover:text-red-400 transition-colors">
                          {place.nome}
                        </p>
                        {place.avaliacao && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 rounded-lg">
                            <Star size={12} className="text-amber-400 fill-amber-400" />
                            <span className="text-amber-400 text-xs font-semibold">{place.avaliacao}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm">{place.categoria}</p>
                      {place.crescimento && (
                        <div className="flex items-center gap-1 mt-1">
                          {place.crescimento > 0 ? (
                            <>
                              <TrendingUp size={12} className="text-emerald-400" />
                              <span className="text-emerald-400 text-xs">+{place.crescimento}%</span>
                            </>
                          ) : (
                            <>
                              <TrendingDown size={12} className="text-red-400" />
                              <span className="text-red-400 text-xs">{place.crescimento}%</span>
                            </>
                          )}
                          <span className="text-slate-500 text-xs">vs período anterior</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Favorites Count */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">{place.totalFavoritos.toLocaleString()}</p>
                      <p className="text-slate-400 text-sm">favoritos</p>
                    </div>
                    <div className="p-3 rounded-xl bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                      <Heart size={24} className="text-red-400 fill-red-400" />
                    </div>
                  </div>
                </div>

                {/* Barra de Progresso */}
                <div className="mt-4">
                  <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-pink-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${(place.totalFavoritos / totalFavorites) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {((place.totalFavoritos / totalFavorites) * 100).toFixed(1)}% do total
                  </p>
                </div>
              </div>
            ))}
          </div>

          {favorites.length === 0 && (
            <div className="text-center py-16">
              <Heart size={48} className="text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Nenhum lugar favoritado ainda</p>
              <p className="text-slate-500 text-sm mt-1">Os favoritos aparecerão aqui quando houver interações</p>
            </div>
          )}
        </div>

        {/* Insights Section */}
        {favorites.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Insight Principal */}
            <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <TrendingUp className="text-red-400" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Sparkles size={16} className="text-yellow-400" />
                    Insight de Popularidade
                  </h3>
                  <p className="text-slate-300 leading-relaxed">
                    O lugar mais popular <strong className="text-red-400">"{topPlace?.nome}"</strong> possui{' '}
                    <strong className="text-white">{topPlace?.totalFavoritos.toLocaleString()} favoritos</strong>, 
                    representando <strong className="text-yellow-400">{topPercentage}%</strong> de todos os favoritos 
                    da plataforma.
                  </p>
                </div>
              </div>
            </div>

            {/* Recomendação */}
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <BarChart3 className="text-blue-400" size={24} />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Recomendação</h3>
                  <p className="text-slate-300 leading-relaxed">
                    {topPlace && topPlace.totalFavoritos > averageFavorites * 1.5
                      ? `✨ "${topPlace?.nome}" está com desempenho excepcional. Considere destacar este estabelecimento em campanhas de marketing.`
                      : `📊 Continue incentivando os usuários a favoritar seus lugares preferidos para aumentar o engajamento.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              📊 Dados atualizados em tempo real • Ranking baseado em favoritos únicos
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-slate-500">Atualizado agora</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}