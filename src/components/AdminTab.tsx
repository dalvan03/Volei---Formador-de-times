import React, { useState } from 'react';
import { Users, UserPlus, Shield, Phone, Edit2, Trash2, Volleyball, RefreshCw, CheckCircle2, RotateCcw, BarChart2 } from 'lucide-react';
import { Player, Match, UserSession } from '../types';
import { PlayerAvatar } from './PlayerAvatar';
import { PhotoCapture } from './PhotoCapture';
import { PlayerScoresModal } from './PlayerScoresModal';

interface AdminTabProps {
  players: Player[];
  pastMatches: Match[];
  session: UserSession | null;
  onAddPlayer: (name: string, phone: string, photoUrl?: string) => void;
  onUpdatePlayer: (player: Player) => void;
  onDeletePlayer?: (playerId: string) => void;
  onToggleAdmin: (playerId: string) => void;
  onOpenAuth: () => void;
  onResetData?: () => void;
  onDeleteMatch?: (matchId: string) => void;
  onResetPlayerStats?: () => void;
}

export const AdminTab: React.FC<AdminTabProps> = ({
  players,
  pastMatches,
  session,
  onAddPlayer,
  onUpdatePlayer,
  onDeletePlayer,
  onToggleAdmin,
  onOpenAuth,
  onDeleteMatch,
  onResetPlayerStats,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState<string | undefined>(undefined);

  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);
  const [showResetStatsModal, setShowResetStatsModal] = useState(false);
  const [showScoresModal, setShowScoresModal] = useState(false);

  const isAdmin = session?.isAdmin || false;

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      alert('Preencha o nome e o telefone.');
      return;
    }
    onAddPlayer(newName.trim(), newPhone.replace(/\D/g, ''), newPhotoUrl);
    setNewName('');
    setNewPhone('');
    setNewPhotoUrl(undefined);
    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;
    onUpdatePlayer(editingPlayer);
    setEditingPlayer(null);
  };

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <span className="px-2.5 py-0.5 bg-teal-500/20 text-teal-300 text-[10px] font-bold uppercase tracking-wider rounded-full inline-block mb-1 border border-teal-500/30">
              Gestão do Grupo
            </span>
            <h2 className="text-xl font-extrabold tracking-tight">Atletas & Histórico</h2>
            <p className="text-xs text-slate-300 mt-1">
              Cadastre novos integrantes e gerencie as permissões do grupo
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-teal-400 shadow-inner">
            <Users className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Current User Card / Admin Notice */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PlayerAvatar player={session?.player} size="md" />
          <div>
            <p className="text-xs text-slate-500 font-medium">Conectado como:</p>
            <h4 className="text-sm font-extrabold text-slate-900">
              {session?.player ? session.player.name : 'Visitante'}
            </h4>
          </div>
        </div>

        <button
          onClick={onOpenAuth}
          className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Alternar Usuário
        </button>
      </div>

      {/* Players Header & Add CTA */}
      <div className="flex items-center justify-between pt-2">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <span>Elenco do Grupo ({players.length})</span>
        </h3>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" /> Novo Atleta
        </button>
      </div>

      {/* Players List */}
      <div className="space-y-2.5">
        {players.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <PlayerAvatar player={p} size="md" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-slate-900 text-sm truncate">{p.name}</h4>
                  {p.isAdmin && (
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-bold rounded-md flex items-center gap-0.5">
                      <Shield className="w-2.5 h-2.5" /> Admin
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-2">
                  <span>📱 {p.phone}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setEditingPlayer(p)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
                title="Editar Jogador"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => onToggleAdmin(p.id)}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  p.isAdmin
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-400 hover:text-slate-600'
                }`}
                title={p.isAdmin ? 'Remover Admin' : 'Tornar Admin'}
              >
                <Shield className="w-4 h-4" />
              </button>

              {isAdmin && onDeletePlayer && (
                <button
                  type="button"
                  onClick={() => setPlayerToDelete(p)}
                  className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer border border-rose-200/60"
                  title="Excluir Atleta do Elenco"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Match History Section */}
      <div className="pt-4 space-y-3">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Volleyball className="w-5 h-5 text-emerald-600" />
          Histórico de Rodadas ({pastMatches.length})
        </h3>

        {pastMatches.length === 0 ? (
          <p className="text-xs text-slate-500 italic">Nenhuma rodada anterior cadastrada.</p>
        ) : (
          <div className="space-y-2.5">
            {pastMatches.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{m.title || `Jogo de ${m.date}`}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">
                      {new Date(m.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </span>
                    {isAdmin && onDeleteMatch && (
                      <button
                        type="button"
                        onClick={() => setMatchToDelete(m)}
                        title="Excluir rodada do histórico"
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer border border-rose-200/60 shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl text-xs font-bold">
                  <span className="text-blue-700">{m.teamA.name}</span>
                  <span className="text-slate-900 text-sm font-extrabold">
                    {m.finalScore ? `${m.finalScore.teamASets} x ${m.finalScore.teamBSets}` : 'Sem placar'}
                  </span>
                  <span className="text-amber-700">{m.teamB.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowScoresModal(true)}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-800 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <BarChart2 className="w-4.5 h-4.5 text-amber-300" />
            Ver Pontuação & Votações de Cada Atleta
          </button>
        )}
      </div>

      {/* Squad Stats Action (Admin) */}
      {isAdmin && onResetPlayerStats && (
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-3">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Estatísticas do Elenco</h3>
            <p className="text-xs text-slate-500 mt-0.5">Zerar contagem de vitórias e derrotas acumuladas de todos os atletas.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowResetStatsModal(true)}
            className="w-full py-3 px-4 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 font-bold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4 text-amber-600" />
            Resetar Vitórias e Derrotas do Elenco
          </button>
        </div>
      )}

      {/* Add Player Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Cadastrar Novo Atleta</h3>

            <PhotoCapture
              photoUrl={newPhotoUrl}
              name={newName || 'Novo Atleta'}
              onPhotoCaptured={(url) => setNewPhotoUrl(url)}
              onPhotoRemoved={() => setNewPhotoUrl(undefined)}
            />

            <form onSubmit={handleCreatePlayer} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Roberto Carlos"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Telefone / WhatsApp (Apenas números)</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ex: 11999990099"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewPhotoUrl(undefined);
                  }}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md"
                >
                  Salvar Atleta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Player Modal */}
      {editingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Editar Atleta</h3>

            <PhotoCapture
              photoUrl={editingPlayer.photoUrl}
              name={editingPlayer.name}
              onPhotoCaptured={(url) => setEditingPlayer({ ...editingPlayer, photoUrl: url })}
              onPhotoRemoved={() => setEditingPlayer({ ...editingPlayer, photoUrl: undefined })}
            />

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={editingPlayer.name}
                  onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Telefone (Apenas números)</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={editingPlayer.phone}
                  onChange={(e) =>
                    setEditingPlayer({ ...editingPlayer, phone: e.target.value.replace(/\D/g, '') })
                  }
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vitórias</label>
                  <input
                    type="number"
                    min="0"
                    value={editingPlayer.wins || 0}
                    onChange={(e) => {
                      const wins = Math.max(0, parseInt(e.target.value) || 0);
                      setEditingPlayer({
                        ...editingPlayer,
                        wins,
                        matchesPlayed: wins + (editingPlayer.losses || 0),
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Derrotas</label>
                  <input
                    type="number"
                    min="0"
                    value={editingPlayer.losses || 0}
                    onChange={(e) => {
                      const losses = Math.max(0, parseInt(e.target.value) || 0);
                      setEditingPlayer({
                        ...editingPlayer,
                        losses,
                        matchesPlayed: (editingPlayer.wins || 0) + losses,
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingPlayer(null)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md"
                >
                  Atualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Match Confirmation Modal */}
      {matchToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Excluir Rodada do Histórico?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Tem certeza que deseja excluir esta rodada do histórico? As vitórias, jogos e avaliações desta rodada serão deduzidos das estatísticas dos jogadores.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMatchToDelete(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteMatch && matchToDelete) {
                    onDeleteMatch(matchToDelete.id);
                  }
                  setMatchToDelete(null);
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-rose-600/20"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Player Confirmation Modal */}
      {playerToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Excluir Atleta do Elenco?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Tem certeza que deseja remover <strong>{playerToDelete.name}</strong> do elenco? O jogador não aparecerá mais nos sorteios.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPlayerToDelete(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeletePlayer && playerToDelete) {
                    onDeletePlayer(playerToDelete.id);
                  }
                  setPlayerToDelete(null);
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-rose-600/20"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Squad Stats Confirmation Modal */}
      {showResetStatsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Resetar Estatísticas do Elenco?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Deseja zerar a contagem de vitórias, derrotas e jogos praticados por todos os atletas do elenco? As avaliações de estrelas não serão alteradas.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetStatsModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onResetPlayerStats) {
                    onResetPlayerStats();
                  }
                  setShowResetStatsModal(false);
                }}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-amber-600/20"
              >
                Sim, Resetar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Player Scores & Votes Modal */}
      <PlayerScoresModal
        isOpen={showScoresModal}
        onClose={() => setShowScoresModal(false)}
        players={players}
        pastMatches={pastMatches}
      />
    </div>
  );
};
