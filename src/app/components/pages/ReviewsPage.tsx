import { useEffect, useState } from 'react';
import { Star, MessageCircle, TrendingUp, ThumbsUp, ThumbsDown, MessageSquareQuote } from 'lucide-react';

interface Review {
  id: string;
  avaliacao: number;
  comentario: string;
  criado_em: string;
  usuario: { nome: string; sobrenome: string };
  lugar: { nome: string };
}

interface ReviewsPageProps {
  accessToken: string;
}

export function ReviewsPage({ accessToken }: ReviewsPageProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        'https://ewyckxscedklztarigha.supabase.co/functions/v1/make-server-b2f35964/reviews',
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-2 border-slate-800 border-t-emerald-500 mx-auto mb-6"></div>
            <Star className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500" size={24} />
          </div>
          <p className="text-slate-500 font-medium">Sincronizando avaliações...</p>
        </div>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? Number((reviews.reduce((sum, r) => sum + r.avaliacao, 0) / reviews.length).toFixed(1))
    : '0.0';

  return (
    <div className="min-h-screen bg-black text-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Feedback da Comunidade
            </h1>
            <p className="text-slate-500 mt-2 flex items-center gap-2 text-sm uppercase tracking-widest font-semibold">
              <TrendingUp size={16} className="text-blue-500" />
              {reviews.length} Depoimentos Registrados
            </p>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-blue-500/20 shadow-xl shadow-blue-500/5">
            <p className="text-blue-400 text-xs font-bold uppercase tracking-tighter mb-4">Média Geral</p>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Star size={32} className="text-blue-400 fill-blue-400" />
              </div>
              <span className="text-5xl font-black text-white">{avgRating}</span>
            </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-emerald-500/20 shadow-xl shadow-emerald-500/5">
            <p className="text-emerald-400 text-xs font-bold uppercase tracking-tighter mb-4">Experiências Positivas</p>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <ThumbsUp size={32} className="text-emerald-400" />
              </div>
              <p className="text-5xl font-black text-white">
                {reviews.filter((r) => r.avaliacao >= 4).length}
              </p>
            </div>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-xl">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-tighter mb-4">Críticas Construtivas</p>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-800 rounded-xl">
                <ThumbsDown size={32} className="text-slate-400" />
              </div>
              <p className="text-5xl font-black text-slate-300">
                {reviews.filter((r) => r.avaliacao <= 2).length}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="group bg-slate-900/30 hover:bg-slate-900/60 transition-all duration-300 rounded-2xl p-6 border border-slate-800 hover:border-blue-500/30">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {review.usuario.nome.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-white font-bold leading-tight">
                      {review.usuario.nome} {review.usuario.sobrenome}
                    </h3>
                    <p className="text-emerald-400 text-xs font-medium uppercase tracking-widest">{review.lugar.nome}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex gap-0.5 mb-1">{renderStars(review.avaliacao)}</div>
                  <p className="text-slate-600 text-[10px] font-mono">
                    {new Date(review.criado_em).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {review.comentario ? (
                <div className="relative">
                  <MessageSquareQuote size={40} className="absolute -top-2 -left-2 text-slate-800/50 -z-10" />
                  <p className="text-slate-300 text-sm leading-relaxed pl-4 border-l-2 border-emerald-500/20">
                    "{review.comentario}"
                  </p>
                </div>
              ) : (
                <p className="text-slate-500 text-sm italic italic">Sem comentário adicional.</p>
              )}
            </div>
          ))}
        </div>

        {reviews.length === 0 && (
          <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
            <MessageCircle size={48} className="text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Nenhuma avaliação encontrada neste período.</p>
          </div>
        )}
      </div>
    </div>
  );
}
