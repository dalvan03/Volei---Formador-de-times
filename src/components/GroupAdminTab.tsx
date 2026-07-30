import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Phone,
  History,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Volleyball,
  Trash2,
  Edit2,
  Sparkles,
} from 'lucide-react';
import { Player, Match, Position, UserSession, BalanceFeedback } from '../types';

interface GroupAdminTabProps {
  players: Player[];
  pastMatches: Match[];
  balanceFeedbacks: BalanceFeedback[];
  session: UserSession | null;
  onAddPlayer: (player: Omit<Player, 'id' | 'wins' | 'losses' | 'matchesPlayed' | 'ratingCount' | 'avatarBg'>) => void;
  onResetData: () => void;
  onOpenAuth: () => void;
}

export const GroupAdminTab: React.FC<GroupAdminTabProps> = ({
  players,
  pastMatches,
  balanceFeedbacks,
  session,
  onAddPlayer,
  onResetData,
  onOpenAuth,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState<Position>('Ponteiro');
  const [initialRating, setInitialRating] = useState<number>(3.0);

  const isAdmin = session?.isAdmin || false;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('Preencha nome e telefone.');
      return;
    }

    onAddPlayer({
      name: name.trim(),
      phone: phone.replace(/\D/g, ''),
      position,
      rating: initialRating,
      isAdmin: false,
      active: true,
    });

    setName('');
    setPhone('');
    setShowAddForm(false);
  };

  const getMatchBalancePercentage = (matchId: string) => {
    const feedbacks = balanceFeedbacks.filter((f) => f.matchId === matchId);
    if (feedbacks.length === 0) return null;
    const balancedCount = feedbacks.filter((f) => f.wasBalanced).length;
    return Math.round((balancedCount / feedbacks.length) * 100);
  };

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 rounded-3xl shadow-xl space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase rounded-full">
              Painel do Grupo & Admin
            </span>
            <h2 className="text-xl font-extrabold mt-1">Gestão de Atletas</h2>
          </div>
          <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
        </div>
        <p className="text-xs text-slate-300">
          Gerencie os jogadores do seu grupo, adicione novos membros e acompanhe o histórico de partidas.
        </p>

        {!isAdmin && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-amber-200 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <Shield className="w-4 h-4 text-amber-400" />
              Você está navegando como Jogador.
            </span>
            <button
              onClick={onOpenAuth}
              className="text-[11px] font-bold text-amber-300 underline cursor-pointer"
            >
              Entrar como Admin
            </button>
          </div>
        )}
      </div>

      {/* Add New Player Button / Form */}
      {isAdmin && (
        <div className="space-y-3">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              <UserPlus className="w-5 h-5" />
              Cadastrar Novo Jogador
            </button>
          ) : (
            <form onSubmit={handleAddSubmit} className="bg-white rounded-3xl p-5 shadow-md border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Novo Atleta</h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-slate-500 font-semibold"
                >
                  Cancelar
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Roberto Carlos"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Telefone (WhatsApp)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: 11988887777"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Posição</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as Position)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Ponteiro">Ponteiro</option>
                    <option value="Levantador">Levantador</option>
                    <option value="Central">Central</option>
                    <option value="Oposto">Oposto</option>
                    <option value="Líbero">Líbero</option>
                    <option value="Geral">Geral</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nível Inicial (1 a 5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={initialRating}
                    onChange={(e) => setInitialRating(parseFloat(e.target.value) || 3.5)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Salvar Cadastro
              </button>
            </form>
          )}
        </div>
      )}

      {/* Roster Section */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            Lista de Atletas Cadastrados ({players.length})
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {players.map((player) => (
            <div key={player.id} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-full ${player.avatarBg} text-white flex items-center justify-center font-bold text-xs shadow-xs`}
                >
                  {player.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    {player.name}
                    {player.isAdmin && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 rounded-md">
                        Admin
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {player.position} • {player.phone}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-amber-600">★ {player.rating.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Match History */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-600" />
          Histórico de Rodadas Passadas
        </h3>

        <div className="space-y-3">
          {pastMatches.length === 0 ? (
            <p className="text-xs text-slate-500 italic">Nenhuma rodada anterior registrada.</p>
          ) : (
            pastMatches.map((m) => {
              const balancePct = getMatchBalancePercentage(m.id);
              return (
                <div
                  key={m.id}
                  className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{m.title}</p>
                      <p className="text-[10px] text-slate-500">
                        {new Date(m.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    {m.finalScore && (
                      <span className="px-2.5 py-1 bg-slate-900 text-white font-extrabold text-xs rounded-xl">
                        {m.teamA.name} {m.finalScore.teamASets} x {m.finalScore.teamBSets} {m.teamB.name}
                      </span>
                    )}
                  </div>

                  {balancePct !== null && (
                    <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between text-[11px] text-emerald-800 font-medium">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Aprovação do Equilíbrio
                      </span>
                      <strong className="text-emerald-700">{balancePct}% dos atletas acharam equilibrado</strong>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reset Demo Data Option */}
      <div className="pt-2 text-center">
        <button
          onClick={() => {
            if (confirm('Deseja restaurar os dados de demonstração originais?')) {
              onResetData();
            }
          }}
          className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1 mx-auto py-2 px-3 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restaurar Dados Iniciais de Demonstração
        </button>
      </div>
    </div>
  );
};
