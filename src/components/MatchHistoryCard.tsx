import React, { useState } from 'react';
import { Trash2, ChevronDown, ChevronUp, Sparkles, Users, Share2 } from 'lucide-react';
import { Match, Player, UserSession } from '../types';
import { PlayerAvatar } from './PlayerAvatar';
import { UserMatchResultBadge } from './UserMatchResultBadge';
import { ShareStoryModal } from './ShareStoryModal';

interface MatchHistoryCardProps {
  match: Match;
  players: Player[];
  session: UserSession | null;
  onDeleteMatch?: (match: Match) => void;
  balancePct?: number | null;
  defaultExpanded?: boolean;
}

export const MatchHistoryCard: React.FC<MatchHistoryCardProps> = ({
  match,
  players,
  session,
  onDeleteMatch,
  balancePct,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showShareModal, setShowShareModal] = useState(false);

  const isAdmin = session?.isAdmin || false;
  const inA = match.teamA?.playerIds.includes(session?.player?.id || '');
  const inB = match.teamB?.playerIds.includes(session?.player?.id || '');
  const participated = Boolean(inA || inB);
  const userWon = match.finalScore && ((inA && match.finalScore.teamASets > match.finalScore.teamBSets) || (inB && match.finalScore.teamBSets > match.finalScore.teamASets));
  const isDraw = match.finalScore && match.finalScore.teamASets === match.finalScore.teamBSets;

  let sideBorderClass = 'border-l-4 border-l-slate-300';
  if (session?.player && match.finalScore) {
    if (!participated) sideBorderClass = 'border-l-4 border-l-slate-300';
    else if (isDraw) sideBorderClass = 'border-l-4 border-l-amber-400';
    else if (userWon) sideBorderClass = 'border-l-4 border-l-emerald-500';
    else sideBorderClass = 'border-l-4 border-l-rose-400';
  }

  // Get player objects for Team A and Team B
  const teamAPlayers = match.teamA?.playerIds.map((id) => {
    const found = players.find((p) => p.id === id);
    return found || { id, name: 'Atleta', avatarBg: 'bg-blue-600' };
  }) || [];

  const teamBPlayers = match.teamB?.playerIds.map((id) => {
    const found = players.find((p) => p.id === id);
    return found || { id, name: 'Atleta', avatarBg: 'bg-amber-600' };
  }) || [];

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all ${sideBorderClass}`}
    >
      {/* Clickable Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 space-y-2.5 cursor-pointer hover:bg-slate-50/50 transition-colors select-none"
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {match.title || `Rodada de ${match.date}`}
            </h4>
            <p className="text-[10px] text-slate-500 font-medium">
              {new Date(match.date + 'T00:00:00').toLocaleDateString('pt-BR')}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowShareModal(true);
              }}
              title="Compartilhar no Instagram/Facebook Story"
              className="px-2 py-1 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:opacity-90 text-white text-[10px] font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-2xs shrink-0"
            >
              <Share2 className="w-3 h-3 text-white" />
              <span>Story</span>
            </button>

            {isAdmin && onDeleteMatch && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteMatch(match);
                }}
                title="Excluir rodada do histórico"
                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer border border-rose-200/60 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="p-1 text-slate-400">
              {isExpanded ? <ChevronUp className="w-4 h-4 text-emerald-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </div>
        </div>

        {/* Score Balloon */}
        <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl text-xs font-bold gap-2">
          <span className="text-blue-700 font-extrabold truncate w-1/3 text-left">
            {match.teamA?.name || 'Time A'}
          </span>
          <span className="text-slate-900 text-xs font-black shrink-0 px-2.5 py-1 bg-white rounded-lg shadow-2xs border border-slate-200/60">
            {match.finalScore
              ? `${match.finalScore.teamASets} x ${match.finalScore.teamBSets}`
              : 'Sem placar'}
          </span>
          <span className="text-amber-700 font-extrabold truncate w-1/3 text-right">
            {match.teamB?.name || 'Time B'}
          </span>
        </div>

        {/* User Result Badge */}
        {session?.player && match.finalScore && (
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-medium text-[11px]">Seu resultado:</span>
            <UserMatchResultBadge match={match} currentUser={session?.player} />
          </div>
        )}

        {/* Balance Approval Percentage */}
        {balancePct !== undefined && balancePct !== null && (
          <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between text-[11px] text-emerald-800 font-medium">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Aprovação do Equilíbrio
            </span>
            <strong className="text-emerald-700">{balancePct}% dos atletas acharam equilibrado</strong>
          </div>
        )}

        {/* Click indicator */}
        <div className="flex items-center justify-center gap-1 text-[10px] font-semibold text-indigo-600 pt-0.5">
          <Users className="w-3 h-3" />
          <span>{isExpanded ? 'Ocultar escalação' : 'Ver escalação dos times'}</span>
        </div>
      </div>

      {/* Expanded Team Lineups */}
      {isExpanded && (
        <div className="px-3.5 pb-3.5 pt-1 bg-slate-50/80 border-t border-slate-200/60 animate-fadeIn">
          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* Team A List */}
            <div className="bg-white p-2.5 rounded-xl border border-blue-100/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 gap-1">
                <span className="text-xs font-black text-blue-700 truncate">
                  {match.teamA?.name || 'Time A'}
                </span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md shrink-0">
                  {teamAPlayers.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {teamAPlayers.map((p, idx) => (
                  <div key={p.id + idx} className="flex items-center gap-2">
                    <PlayerAvatar player={p} size="xs" />
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {p.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Team B List */}
            <div className="bg-white p-2.5 rounded-xl border border-amber-100/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 gap-1">
                <span className="text-xs font-black text-amber-700 truncate">
                  {match.teamB?.name || 'Time B'}
                </span>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md shrink-0">
                  {teamBPlayers.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {teamBPlayers.map((p, idx) => (
                  <div key={p.id + idx} className="flex items-center gap-2">
                    <PlayerAvatar player={p} size="xs" />
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {p.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showShareModal && (
        <ShareStoryModal
          match={match}
          players={players}
          session={session}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};
