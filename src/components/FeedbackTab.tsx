import React, { useState, useMemo } from 'react';
import { Star, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Match, Player, UserSession } from '../types';
import { StarRating } from './StarRating';
import { PlayerAvatar } from './PlayerAvatar';
import { saveBalanceFeedback, savePlayerRatingFeedbacks, getStoredBalanceFeedbacks } from '../utils/storage';

interface FeedbackTabProps {
  currentMatch: Match | null;
  pastMatches: Match[];
  players: Player[];
  session: UserSession | null;
  onOpenAuth: () => void;
  onFeedbackSubmitted: () => void;
}

export const FeedbackTab: React.FC<FeedbackTabProps> = ({
  currentMatch,
  pastMatches,
  players,
  session,
  onOpenAuth,
  onFeedbackSubmitted,
}) => {
  const currentUser = session?.player;
  const userPhone = session?.phone || '';

  // Local state trigger to recalculate pending matches when feedback is submitted
  const [submissionCount, setSubmissionCount] = useState(0);

  // Feedback form state
  const [wasBalanced, setWasBalanced] = useState<boolean | null>(null);
  const [strongerTeam, setStrongerTeam] = useState<'teamA' | 'teamB' | null>(null);
  const [ratingsMap, setRatingsMap] = useState<Record<string, number>>({});

  // Get all finalized matches, sorted by most recent first
  const allFinalizedMatches = useMemo(() => {
    const list = [
      ...(currentMatch?.status === 'finalizada' ? [currentMatch] : []),
      ...pastMatches.filter((m) => m.status === 'finalizada' && m.id !== currentMatch?.id),
    ];
    return list.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
  }, [currentMatch, pastMatches]);

  // Pending unrated matches where the logged in user actually played
  const pendingMatchesToRate = useMemo(() => {
    if (!currentUser || !userPhone) return [];
    const balanceFeedbacks = getStoredBalanceFeedbacks();

    return allFinalizedMatches.filter((m) => {
      const played = m.teamA?.playerIds.includes(currentUser.id) || m.teamB?.playerIds.includes(currentUser.id);
      if (!played) return false;

      const rated = balanceFeedbacks.some((f) => f.matchId === m.id && f.evaluatorPhone === userPhone);
      return !rated;
    });
  }, [allFinalizedMatches, currentUser, userPhone, submissionCount]);

  // Target match is ALWAYS the first unrated match (most recent)
  const targetMatch = pendingMatchesToRate[0] || null;

  if (!session?.isLoggedIn || !currentUser) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 text-center space-y-4 my-4 animate-fade-in">
        <div className="w-14 h-14 mx-auto bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
          <Star className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Identifique-se para Avaliar</h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Digite seu número de telefone para avaliar anonimamente a partida e os companheiros do seu time.
        </p>
        <button
          onClick={onOpenAuth}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer text-sm"
        >
          Informar Meu Telefone
        </button>
      </div>
    );
  }

  // All finalized matches rated or no finalized matches exist
  if (!targetMatch) {
    return (
      <div className="space-y-5 pb-24 animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <span className="px-2.5 py-0.5 bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded-full inline-block mb-1">
                Avaliação Anônima
              </span>
              <h2 className="text-xl font-extrabold tracking-tight">Avaliar Rodada</h2>
              <p className="text-xs text-amber-100 mt-1">Sua nota ajuda a equilibrar o próximo jogo</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white shadow-inner">
              <Star className="w-7 h-7 fill-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/80 text-center space-y-4 my-2">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-extrabold text-slate-900">Todas as Rodadas Avaliadas!</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Você já avaliou todas as rodadas finalizadas em que participou. Obrigado por colaborar para manter os times equilibrados!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Determine user's team in the target match
  const isInTeamA = targetMatch.teamA.playerIds.includes(currentUser.id);
  const isInTeamB = targetMatch.teamB.playerIds.includes(currentUser.id);
  const userTeam = isInTeamA ? targetMatch.teamA : isInTeamB ? targetMatch.teamB : null;

  // Teammates excluding self
  const teammatesToRate = userTeam
    ? userTeam.playerIds
        .filter((id) => id !== currentUser.id)
        .map((id) => players.find((p) => p.id === id))
        .filter(Boolean) as Player[]
    : [];

  const handleRatingChange = (playerId: string, rating: number) => {
    setRatingsMap((prev) => ({ ...prev, [playerId]: rating }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (wasBalanced === null) {
      alert('Por favor, responda se o jogo estava balanceado.');
      return;
    }

    if (wasBalanced === false && !strongerTeam) {
      alert('Por favor, informe qual time estava mais forte.');
      return;
    }

    // Save balance feedback
    saveBalanceFeedback({
      id: `bf_${Date.now()}`,
      matchId: targetMatch.id,
      evaluatorPhone: userPhone,
      wasBalanced,
      strongerTeam,
      createdAt: new Date().toISOString(),
    });

    // Save player ratings
    const ratingsArray: { targetPlayerId: string; rating: number }[] = teammatesToRate.map((p) => ({
      targetPlayerId: p.id,
      rating: Number(ratingsMap[p.id] || 4),
    }));

    savePlayerRatingFeedbacks(targetMatch.id, userPhone, ratingsArray);

    // Reset form state for next round if any
    setWasBalanced(null);
    setStrongerTeam(null);
    setRatingsMap({});
    setSubmissionCount((prev) => prev + 1);

    onFeedbackSubmitted();
  };

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider rounded-full inline-block">
                Avaliação Anônima
              </span>
              {pendingMatchesToRate.length > 1 && (
                <span className="px-2 py-0.5 bg-amber-900/40 text-amber-100 text-[10px] font-extrabold rounded-full">
                  1 de {pendingMatchesToRate.length} pendentes
                </span>
              )}
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">{targetMatch.title}</h2>
            <p className="text-xs text-amber-100 mt-1">
              📅 {new Date(targetMatch.date + 'T00:00:00').toLocaleDateString('pt-BR')} • Placar: {targetMatch.finalScore?.teamASets ?? 0} x {targetMatch.finalScore?.teamBSets ?? 0}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white shadow-inner">
            <Star className="w-7 h-7 fill-white" />
          </div>
        </div>
      </div>

      {!userTeam ? (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-center text-xs text-amber-900">
          <ShieldAlert className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <p className="font-bold text-sm">Você não participou desta rodada</p>
          <p className="mt-1 text-slate-600">
            Apenas os jogadores que estiveram em quadra no <strong>{targetMatch.teamA.name}</strong> ou{' '}
            <strong>{targetMatch.teamB.name}</strong> podem avaliar seus companheiros de time.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Question 1: Balance */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-900">O jogo estava balanceado?</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setWasBalanced(true);
                  setStrongerTeam(null);
                }}
                className={`py-3 px-4 rounded-2xl font-bold text-sm transition-all border cursor-pointer ${
                  wasBalanced === true
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                👍 Sim, foi equilibrado
              </button>

              <button
                type="button"
                onClick={() => setWasBalanced(false)}
                className={`py-3 px-4 rounded-2xl font-bold text-sm transition-all border cursor-pointer ${
                  wasBalanced === false
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                👎 Não, foi desequilibrado
              </button>
            </div>

            {/* Follow up if NOT balanced */}
            {wasBalanced === false && (
              <div className="mt-3 pt-3 border-t border-slate-100 animate-fade-in space-y-2">
                <p className="text-xs font-bold text-slate-800">Qual time estava mais forte?</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStrongerTeam('teamA')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      strongerTeam === 'teamA'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {targetMatch.teamA.name}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStrongerTeam('teamB')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      strongerTeam === 'teamB'
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {targetMatch.teamB.name}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Question 2: Rate teammates */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0">
                2
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Avalie os jogadores do seu time</h3>
                <p className="text-xs text-slate-500">
                  Sua equipe: <strong className="text-emerald-700">{userTeam.name}</strong> (Você não pode se auto-avaliar)
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {teammatesToRate.map((teammate) => {
                const currentVal = ratingsMap[teammate.id] || 0;

                return (
                  <div key={teammate.id} className="py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <PlayerAvatar player={teammate} size="sm" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{teammate.name}</p>
                      </div>
                    </div>

                    <StarRating
                      value={currentVal}
                      onChange={(r) => handleRatingChange(teammate.id, r)}
                      size="md"
                      showLabel
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <CheckCircle2 className="w-5 h-5" />
            Enviar Avaliação Anônima
          </button>
        </form>
      )}
    </div>
  );
};
