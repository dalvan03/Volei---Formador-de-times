import React from 'react';
import { Trophy, Frown, UserX, MinusCircle } from 'lucide-react';
import { Match, Player } from '../types';

interface UserMatchResultBadgeProps {
  match: Match;
  currentUser: Player | null | undefined;
  compact?: boolean;
}

export const UserMatchResultBadge: React.FC<UserMatchResultBadgeProps> = ({
  match,
  currentUser,
  compact = false,
}) => {
  if (!currentUser || !match.finalScore) {
    return null;
  }

  const inA = match.teamA?.playerIds.includes(currentUser.id);
  const inB = match.teamB?.playerIds.includes(currentUser.id);
  const participated = Boolean(inA || inB);

  const { teamASets, teamBSets } = match.finalScore;
  const teamAWon = teamASets > teamBSets;
  const teamBWon = teamBSets > teamASets;
  const isDraw = teamASets === teamBSets;

  if (!participated) {
    return (
      <span
        title="Você não participou desta partida"
        className={`inline-flex items-center gap-1 font-bold bg-slate-100 text-slate-600 border border-slate-200/80 rounded-full shrink-0 ${
          compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <UserX className={compact ? 'w-3 h-3 text-slate-400' : 'w-3.5 h-3.5 text-slate-500'} />
        <span>Não participou</span>
      </span>
    );
  }

  if (isDraw) {
    return (
      <span
        title="Sua partida terminou em empate"
        className={`inline-flex items-center gap-1 font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-full shrink-0 ${
          compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <MinusCircle className={compact ? 'w-3 h-3 text-amber-500' : 'w-3.5 h-3.5 text-amber-600'} />
        <span>Empate</span>
      </span>
    );
  }

  const userWon = (inA && teamAWon) || (inB && teamBWon);

  if (userWon) {
    return (
      <span
        title="Você estava no time vencedor!"
        className={`inline-flex items-center gap-1 font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs rounded-full shrink-0 ${
          compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
        }`}
      >
        <Trophy className={`text-amber-500 fill-amber-400 ${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'}`} />
        <span>Vitória</span>
      </span>
    );
  }

  return (
    <span
      title="Você estava no time perdedor"
      className={`inline-flex items-center gap-1 font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-full shrink-0 ${
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <Frown className={compact ? 'w-3 h-3 text-rose-500' : 'w-3.5 h-3.5 text-rose-600'} />
      <span>Derrota</span>
    </span>
  );
};
