import React, { useState } from 'react';
import { Phone, UserCheck, Shield, Volleyball, UserPlus, Sparkles } from 'lucide-react';
import { Player } from '../types';
import { PlayerAvatar } from './PlayerAvatar';
import { PhotoCapture } from './PhotoCapture';

interface PhoneAuthModalProps {
  players: Player[];
  onLogin: (phone: string, newPlayerName?: string, photoUrl?: string) => void;
  onClose?: () => void;
  currentPhone?: string;
}

export const PhoneAuthModal: React.FC<PhoneAuthModalProps> = ({
  players,
  onLogin,
  onClose,
  currentPhone,
}) => {
  const [inputPhone, setInputPhone] = useState(currentPhone || '');
  const [isRegistering, setIsRegistering] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState<string | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState('');

  // Format phone automatically
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setInputPhone(raw);
    setErrorMsg('');
  };

  const cleanPhone = (p: string) => p.replace(/\D/g, '');

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = cleanPhone(inputPhone);
    if (!cleaned || cleaned.length < 8) {
      setErrorMsg('Por favor, digite um número de telefone válido.');
      return;
    }

    const existing = players.find((p) => cleanPhone(p.phone) === cleaned);
    if (existing) {
      onLogin(existing.phone);
    } else {
      setIsRegistering(true);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setErrorMsg('Digite seu nome completo ou apelido.');
      return;
    }
    onLogin(cleanPhone(inputPhone), newName.trim(), newPhotoUrl);
  };

  const handleQuickSelect = (player: Player) => {
    onLogin(player.phone);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white text-center relative">
          <div className="w-16 h-16 mx-auto mb-3 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-inner">
            <Volleyball className="w-9 h-9 text-white animate-bounce-short" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Culto de Segunda</h2>
          <p className="text-xs text-emerald-100 mt-1">Acesso simples por telefone</p>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {!isRegistering ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Seu Telefone / WhatsApp
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-5 h-5 text-emerald-600" />
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={inputPhone}
                    onChange={handlePhoneChange}
                    placeholder="Ex: 11999990001"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-base"
                    autoFocus
                  />
                </div>
                {errorMsg && <p className="text-xs text-rose-500 font-medium mt-1.5">{errorMsg}</p>}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-5 h-5" />
                Acessar Aplicativo
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-medium">
                <UserPlus className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Primeiro acesso com este telefone! Cadastre seu nome rápido para continuar.</span>
              </div>

              <PhotoCapture
                photoUrl={newPhotoUrl}
                name={newName || 'Novo Atleta'}
                onPhotoCaptured={(url) => setNewPhotoUrl(url)}
                onPhotoRemoved={() => setNewPhotoUrl(undefined)}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Seu Nome ou Apelido
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Lucas Silva"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="w-1/3 py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition-all text-sm cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-600/20 transition-all text-sm cursor-pointer"
                >
                  Concluir Cadastro
                </button>
              </div>
            </form>
          )}

          {/* Quick Switch Demo Bar for convenient testing */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Acesso Rápido de Teste (Atalhos)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {players.slice(0, 4).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleQuickSelect(p)}
                  className="p-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-2xl text-left transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <PlayerAvatar player={p} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-700">
                      {p.name}
                    </p>
                    {p.isAdmin && (
                      <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                        <Shield className="w-2.5 h-2.5" /> Admin
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {onClose && (
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <button
              onClick={onClose}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
