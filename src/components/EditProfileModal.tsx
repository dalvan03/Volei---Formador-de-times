import React, { useState, useRef, useEffect } from 'react';
import { User, Check, X, LogOut, Camera, Shield, Lock } from 'lucide-react';
import { Player } from '../types';
import { PhotoCapture } from './PhotoCapture';

interface EditProfileModalProps {
  player: Player;
  onSave: (updatedPlayer: Player) => void;
  onLogout: () => void;
  onClose: () => void;
  onOpenPlayerScores?: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  player,
  onSave,
  onLogout,
  onClose,
  onOpenPlayerScores,
}) => {
  const [name, setName] = useState(player.name || '');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(player.photoUrl);
  const [errorMsg, setErrorMsg] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [holdProgress, setHoldProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const cancelHold = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timerRef.current = null;
    intervalRef.current = null;
    setHoldProgress(0);
  };

  const startHold = () => {
    if (!player.isAdmin || !onOpenPlayerScores) return;
    cancelHold();

    const startTime = Date.now();
    const duration = 5000; // 5 seconds

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setHoldProgress(pct);
    }, 50);

    timerRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setHoldProgress(100);
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(200);
      }
      onOpenPlayerScores();
      setHoldProgress(0);
    }, duration);
  };

  useEffect(() => {
    return () => {
      cancelHold();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('O nome não pode ficar em branco.');
      return;
    }

    const updated: Player = {
      ...player,
      name: name.trim(),
      photoUrl,
    };

    onSave(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-5 text-white relative flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              onMouseDown={startHold}
              onMouseUp={cancelHold}
              onMouseLeave={cancelHold}
              onTouchStart={startHold}
              onTouchEnd={cancelHold}
              onTouchCancel={cancelHold}
              className={`relative w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 select-none ${
                player.isAdmin ? 'cursor-pointer hover:bg-emerald-500/30 active:scale-95 transition-all' : ''
              }`}
              title={player.isAdmin ? 'Segure por 5 segundos para ver pontuações secretas' : undefined}
            >
              <User className="w-5 h-5 relative z-10" />
              {player.isAdmin && holdProgress > 0 && (
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
                  <circle
                    cx="20"
                    cy="20"
                    r="17"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-amber-400"
                    fill="transparent"
                    strokeDasharray="106.8"
                    strokeDashoffset={106.8 * (1 - holdProgress / 100)}
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold tracking-tight">Editar Perfil</h2>
                {player.isAdmin && (
                  <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] font-bold rounded-md flex items-center gap-0.5 border border-amber-400/30">
                    <Shield className="w-2.5 h-2.5" /> Admin
                  </span>
                )}
              </div>
              {player.isAdmin && holdProgress > 0 ? (
                <p className="text-xs text-amber-300 font-bold animate-pulse flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Segure para acessar... ({Math.max(1, Math.ceil((5000 - (holdProgress / 100 * 5000)) / 1000))}s)
                </p>
              ) : (
                <p className="text-xs text-slate-300">Altere seu nome e foto de perfil</p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Photo Capture Section */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                Foto de Perfil
              </label>
              <PhotoCapture
                photoUrl={photoUrl}
                name={name || 'Atleta'}
                onPhotoCaptured={(url) => {
                  setPhotoUrl(url);
                  setErrorMsg('');
                }}
                onPhotoRemoved={() => setPhotoUrl(undefined)}
              />
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5">
                Nome ou Apelido
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Ex: Lucas Silva"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                required
              />
              {errorMsg && (
                <p className="text-xs text-rose-500 font-semibold mt-1.5">{errorMsg}</p>
              )}
            </div>

            {/* Phone badge read-only info */}
            {player.phone && (
              <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium">Telefone cadastrado:</span>
                <span className="font-bold text-slate-700">📱 {player.phone}</span>
              </div>
            )}

            {/* Save Button */}
            <button
              type="submit"
              disabled={savedSuccess}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                savedSuccess
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white shadow-emerald-600/20'
              }`}
            >
              <Check className="w-5 h-5" />
              <span>{savedSuccess ? 'Alterações Salvas!' : 'Salvar Alterações'}</span>
            </button>
          </form>

          {/* Logout Section */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Deseja trocar de conta?</span>
            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-rose-200/60"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair da Conta
            </button>
          </div>
        </div>

        {/* Large Close Footer Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 px-4 bg-slate-200 hover:bg-slate-300 active:scale-[0.99] text-slate-800 font-black text-sm rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
