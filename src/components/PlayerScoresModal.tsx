import React, { useState, useMemo } from 'react';
import {
  X,
  Star,
  Trophy,
  BarChart2,
  Search,
  ChevronDown,
  ChevronUp,
  Award,
  Vote,
  Volleyball,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Player, Match, PlayerRatingFeedback } from '../types';
import { getStoredRatingFeedbacks } from '../utils/storage';
import { PlayerAvatar } from './PlayerAvatar';

interface PlayerScoresModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  pastMatches: Match[];
}

export const PlayerScoresModal: React.FC<PlayerScoresModalProps> = ({
  isOpen,
  onClose,
  players,
  pastMatches,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'votes' | 'wins'>('rating');
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);

  // Get all rating feedbacks stored
  const allRatingFeedbacks = useMemo(() => {
    if (!isOpen) return [];
    return getStoredRatingFeedbacks();
  }, [isOpen]);

  // Build match lookup map
  const matchMap = useMemo(() => {
    const map = new Map<string, Match>();
    pastMatches.forEach((m) => map.set(m.id, m));
    return map;
  }, [pastMatches]);

  // Compute aggregated player stats
  const playersWithDetails = useMemo(() => {
    return players.map((player) => {
      const playerFeedbacks = allRatingFeedbacks.filter((f) => f.targetPlayerId === player.id);
      
      const totalVotes = playerFeedbacks.length;
      let avgRating = 3.0;
      
      if (totalVotes > 0) {
        const sum = playerFeedbacks.reduce((acc, curr) => acc + curr.rating, 0);
        avgRating = Number((sum / totalVotes).toFixed(1));
      } else if (player.ratingCount && player.ratingCount > 0 && player.rating) {
        avgRating = player.rating;
      } else {
        avgRating = 3.0;
      }

      // Star breakdown counts
      const breakdown = {
        5: playerFeedbacks.filter((f) => f.rating === 5).length,
        4: playerFeedbacks.filter((f) => f.rating === 4).length,
        3: playerFeedbacks.filter((f) => f.rating === 3).length,
        2: playerFeedbacks.filter((f) => f.rating === 2).length,
        1: playerFeedbacks.filter((f) => f.rating === 1).length,
      };

      // Group feedbacks by match
      const feedbacksByMatch = new Map<string, PlayerRatingFeedback[]>();
      playerFeedbacks.forEach((f) => {
        const list = feedbacksByMatch.get(f.matchId) || [];
        list.push(f);
        feedbacksByMatch.set(f.matchId, list);
      });

      const matchFeedbackDetails = Array.from(feedbacksByMatch.entries()).map(([matchId, feedbacks]) => {
        const match = matchMap.get(matchId);
        const matchAvg = feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length;
        return {
          matchId,
          matchTitle: match?.title || `Rodada de ${match?.date || 'Data N/D'}`,
          matchDate: match?.date || '',
          ratings: feedbacks.map((f) => f.rating),
          matchAvg: Number(matchAvg.toFixed(1)),
        };
      });

      const winRate =
        player.matchesPlayed > 0 ? Math.round((player.wins / player.matchesPlayed) * 100) : 0;

      return {
        ...player,
        computedRating: avgRating,
        totalVotes,
        breakdown,
        matchFeedbackDetails,
        winRate,
      };
    });
  }, [players, allRatingFeedbacks, matchMap]);

  // Filter & Sort
  const filteredPlayers = useMemo(() => {
    return playersWithDetails
      .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'rating') {
          if (b.computedRating !== a.computedRating) {
            return b.computedRating - a.computedRating;
          }
          return b.totalVotes - a.totalVotes;
        }
        if (sortBy === 'votes') {
          if (b.totalVotes !== a.totalVotes) {
            return b.totalVotes - a.totalVotes;
          }
          return b.computedRating - a.computedRating;
        }
        if (sortBy === 'wins') {
          if (b.wins !== a.wins) {
            return b.wins - a.wins;
          }
          return b.winRate - a.winRate;
        }
        return 0;
      });
  }, [playersWithDetails, searchTerm, sortBy]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fade-in">
      <div className="bg-slate-50 w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white p-5 shrink-0 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-400 shadow-inner">
                <BarChart2 className="w-5 h-5" />
              </div>
              <div>
                <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider rounded-full border border-amber-400/30">
                  Painel de Pontuações (Admin)
                </span>
                <h2 className="text-lg font-extrabold tracking-tight mt-0.5">Pontuação & Votações do Elenco</h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-2xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-300 mt-2">
            Acompanhe o desempenho de vitórias e o detalhamento de votos e notas atribuídas aos atletas.
          </p>
        </div>

        {/* Controls: Search & Sort */}
        <div className="p-4 bg-white border-b border-slate-200/80 space-y-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar atleta no elenco..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-0.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
              Ordenar por:
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setSortBy('rating')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  sortBy === 'rating'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                Nota Votações
              </button>
              <button
                type="button"
                onClick={() => setSortBy('votes')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  sortBy === 'votes'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Vote className="w-3.5 h-3.5" />
                Total de Votos
              </button>
              <button
                type="button"
                onClick={() => setSortBy('wins')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  sortBy === 'wins'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                Vitórias
              </button>
            </div>
          </div>
        </div>

        {/* Player List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredPlayers.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Users className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Nenhum atleta encontrado.</p>
            </div>
          ) : (
            filteredPlayers.map((player) => {
              const isExpanded = expandedPlayerId === player.id;

              return (
                <div
                  key={player.id}
                  className="bg-white rounded-3xl p-4 shadow-xs border border-slate-200/90 space-y-3 transition-all"
                >
                  {/* Top Bar: Avatar, Name, Position, Main Scores */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <PlayerAvatar player={player} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-slate-900 text-sm truncate">{player.name}</h4>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          Atleta do Grupo
                        </p>
                      </div>
                    </div>

                    {/* Main Score Badges */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* Rating Score Badge */}
                      <div className="px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-2xl text-center">
                        <div className="flex items-center gap-1 font-extrabold text-amber-900 text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{player.computedRating.toFixed(1)}</span>
                        </div>
                        <span className="text-[9px] font-semibold text-amber-700/80 block">
                          {player.totalVotes} {player.totalVotes === 1 ? 'voto' : 'votos'}
                        </span>
                      </div>

                      {/* Wins Score Badge */}
                      <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-center">
                        <div className="flex items-center gap-1 font-extrabold text-emerald-900 text-xs">
                          <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{player.wins}V</span>
                        </div>
                        <span className="text-[9px] font-semibold text-emerald-700/80 block">
                          {player.winRate}% aprov
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 1: Detailed Rating / Voting breakdown */}
                  <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                        <Vote className="w-3.5 h-3.5 text-purple-600" />
                        Pontuação de Votações
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {player.totalVotes > 0
                          ? `${player.totalVotes} avaliações recebidas`
                          : 'Nenhuma avaliação ainda'}
                      </span>
                    </div>

                    {/* Star distribution bar chart */}
                    {player.totalVotes > 0 ? (
                      <div className="space-y-1.5 pt-1">
                        {[5, 4, 3, 2, 1].map((starVal) => {
                          const count = player.breakdown[starVal as keyof typeof player.breakdown] || 0;
                          const pct = player.totalVotes > 0 ? Math.round((count / player.totalVotes) * 100) : 0;

                          return (
                            <div key={starVal} className="flex items-center gap-2 text-[10px]">
                              <span className="w-8 font-bold text-slate-600 flex items-center gap-0.5 shrink-0">
                                {starVal} <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                              </span>
                              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-amber-400 rounded-full transition-all duration-300"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="w-10 text-right font-extrabold text-slate-700 shrink-0">
                                {count} ({pct}%)
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">
                        O atleta ainda não possui votos registrados pelas avaliações anônimas.
                      </p>
                    )}

                    {/* Collapsible details for per-match votes */}
                    {player.matchFeedbackDetails.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/60">
                        <button
                          type="button"
                          onClick={() => setExpandedPlayerId(isExpanded ? null : player.id)}
                          className="w-full text-left text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center justify-between cursor-pointer py-1"
                        >
                          <span>
                            {isExpanded
                              ? 'Ocultar detalhes por rodada'
                              : `Ver votos por rodada (${player.matchFeedbackDetails.length} rodadas)`}
                          </span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        {isExpanded && (
                          <div className="space-y-2 pt-2 animate-fade-in">
                            {player.matchFeedbackDetails.map((detail, idx) => (
                              <div
                                key={idx}
                                className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between font-bold text-slate-800">
                                  <span className="text-[11px]">{detail.matchTitle}</span>
                                  <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/60">
                                    Média: {detail.matchAvg} ★
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 flex-wrap pt-0.5">
                                  <span className="text-[10px] text-slate-400 font-medium mr-1">Votos:</span>
                                  {detail.ratings.map((r, rIdx) => (
                                    <span
                                      key={rIdx}
                                      className="px-1.5 py-0.5 bg-slate-100 text-slate-800 font-extrabold text-[10px] rounded-md border border-slate-200 flex items-center gap-0.5"
                                    >
                                      {r} <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Section 2: Match / Victory Performance Stats */}
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-2 text-center">
                      <span className="text-[9px] font-bold text-emerald-700 uppercase block">Vitórias</span>
                      <span className="text-xs font-extrabold text-emerald-950">{player.wins}</span>
                    </div>
                    <div className="bg-rose-50/70 border border-rose-200/60 rounded-xl p-2 text-center">
                      <span className="text-[9px] font-bold text-rose-700 uppercase block">Derrotas</span>
                      <span className="text-xs font-extrabold text-rose-950">{player.losses}</span>
                    </div>
                    <div className="bg-slate-100/80 border border-slate-200/60 rounded-xl p-2 text-center">
                      <span className="text-[9px] font-bold text-slate-600 uppercase block">Jogos</span>
                      <span className="text-xs font-extrabold text-slate-900">{player.matchesPlayed}</span>
                    </div>
                    <div className="bg-indigo-50/70 border border-indigo-200/60 rounded-xl p-2 text-center">
                      <span className="text-[9px] font-bold text-indigo-700 uppercase block">Aproveit.</span>
                      <span className="text-xs font-extrabold text-indigo-950">{player.winRate}%</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 text-right shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
