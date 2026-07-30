import React, { useState } from 'react';
import { Trophy, Filter, Medal } from 'lucide-react';
import { Player } from '../types';
import { PlayerAvatar } from './PlayerAvatar';

interface RankingTabProps {
  players: Player[];
}

export const RankingTab: React.FC<RankingTabProps> = ({ players }) => {
  const [sortBy, setSortBy] = useState<'wins' | 'matches'>('wins');

  // Sort
  const sortedPlayers = [...players].sort((a, b) => {
    if (sortBy === 'wins') {
      return b.wins - a.wins;
    }
    return b.matchesPlayed - a.matchesPlayed;
  });

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden border border-indigo-800">
        <div className="flex items-center justify-between">
          <div>
            <span className="px-2.5 py-0.5 bg-indigo-500/30 text-indigo-200 text-[10px] font-bold uppercase tracking-wider rounded-full inline-block mb-1 border border-indigo-400/20">
              Desempenho da Galera
            </span>
            <h2 className="text-xl font-extrabold tracking-tight">Ranking Dinâmico</h2>
            <p className="text-xs text-indigo-200 mt-1">
              Médias formadas pelas avaliações anônimas pós-jogo
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-amber-400 shadow-inner">
            <Trophy className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Controls: Sort */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            Ordenar por:
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSortBy('wins')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                sortBy === 'wins' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏆 Vitórias
            </button>
            <button
              onClick={() => setSortBy('matches')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                sortBy === 'matches' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏐 Jogos
            </button>
          </div>
        </div>
      </div>

      {/* Players Ranking List */}
      <div className="space-y-2.5">
        {sortedPlayers.map((player, idx) => {
          const winRate =
            player.matchesPlayed > 0
              ? Math.round((player.wins / player.matchesPlayed) * 100)
              : 0;

          // Podium badges
          const isGold = idx === 0 && sortBy === 'wins';
          const isSilver = idx === 1 && sortBy === 'wins';
          const isBronze = idx === 2 && sortBy === 'wins';

          return (
            <div
              key={player.id}
              className={`bg-white rounded-3xl p-4 shadow-sm border transition-all flex items-center justify-between gap-3 ${
                isGold
                  ? 'border-amber-300 ring-2 ring-amber-400/30 bg-gradient-to-r from-amber-50/50 via-white to-white'
                  : isSilver
                  ? 'border-slate-300 ring-2 ring-slate-300/30'
                  : isBronze
                  ? 'border-amber-700/20 ring-2 ring-amber-700/10'
                  : 'border-slate-200/80'
              }`}
            >
              {/* Left: Position Rank + Avatar + Name */}
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${
                    isGold
                      ? 'bg-amber-400 text-amber-950 shadow-md'
                      : isSilver
                      ? 'bg-slate-300 text-slate-800'
                      : isBronze
                      ? 'bg-amber-700 text-amber-100'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {idx + 1}º
                </div>

                <PlayerAvatar player={player} size="md" />

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-slate-900 text-sm truncate">{player.name}</h4>
                    {isGold && <Medal className="w-4 h-4 text-amber-500 shrink-0" />}
                  </div>
                </div>
              </div>

              {/* Right: Stats */}
              <div className="text-right shrink-0">
                <div className="text-[11px] font-semibold text-slate-600">
                  <span className="text-emerald-600 font-bold">{player.wins}V</span> -{' '}
                  <span className="text-rose-500 font-bold">{player.losses}D</span> ({winRate}%)
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
