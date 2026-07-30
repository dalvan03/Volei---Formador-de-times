import React, { useState } from 'react';
import { Phone, UserCheck, Shield, Volleyball, UserPlus, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Player } from '../types';
import { PlayerAvatar } from './PlayerAvatar';
import { PhotoCapture } from './PhotoCapture';

interface LoginPageProps {
  players: Player[];
  onLogin: (phone: string, newPlayerName?: string, photoUrl?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ players, onLogin }) => {
  const [rawPhone, setRawPhone] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState<string | undefined>(undefined);
  const [errorMsg, setErrorMsg] = useState('');

  // Format phone to (XX) XXXXX-XXXX as user types
  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) {
      return digits ? `(${digits}` : '';
    }
    if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    setRawPhone(digits);
    setErrorMsg('');
  };

  const cleanPhone = (p: string) => p.replace(/\D/g, '');

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = cleanPhone(rawPhone);
    if (!cleaned || cleaned.length < 10) {
      setErrorMsg('Digite um telefone válido com DDD (ex: 11999990001).');
      return;
    }

    // Check if phone matches existing player
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
      setErrorMsg('Por favor, informe seu nome ou apelido.');
      return;
    }
    onLogin(cleanPhone(rawPhone), newName.trim(), newPhotoUrl);
  };

  const handleQuickSelect = (player: Player) => {
    onLogin(player.phone);
  };

  return (
    <div className="flex-1 flex flex-col min-h-full bg-slate-900 text-white relative overflow-y-auto">
      {/* Decorative Background Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Hero Banner */}
      <div className="p-6 pt-10 text-center relative z-10 shrink-0">
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 rounded-3xl p-0.5 shadow-xl shadow-emerald-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-slate-900/90 rounded-[22px] flex items-center justify-center">
            <Volleyball className="w-10 h-10 text-emerald-400 animate-bounce-short" />
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-[11px] font-extrabold uppercase tracking-widest rounded-full border border-emerald-400/30 inline-block mb-2">
          Acesso
        </span>
        <h1 className="text-2xl font-black tracking-tight text-white">Culto de Segunda</h1>
        <p className="text-xs text-slate-300 max-w-xs mx-auto mt-1.5 leading-relaxed">
          Informe seu telefone com DDD para acessar as escalações, sorteios e estatísticas das rodadas.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="flex-1 px-5 pb-8 relative z-10 space-y-6">
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-5">
          {!isRegistering ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Telefone / WhatsApp com DDD
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={formatPhoneNumber(rawPhone)}
                    onChange={handlePhoneInputChange}
                    placeholder="(11) 99999-0001"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-white placeholder-slate-500 font-extrabold text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>
                {errorMsg ? (
                  <p className="text-xs text-rose-400 font-semibold mt-2 flex items-center gap-1">
                    ⚠️ {errorMsg}
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Insira apenas os números com DDD do seu celular.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-4 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-[0.98] text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-5 h-5" />
                <span>Entrar no Aplicativo</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fade-in">
              <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-start gap-3 text-emerald-300 text-xs leading-snug">
                <UserPlus className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-extrabold text-emerald-200">Primeiro Acesso Detectado!</p>
                  <p className="text-[11px] text-emerald-300/90 mt-0.5">
                    Telefone <span className="font-bold underline">{formatPhoneNumber(rawPhone)}</span>. Cadastre seu nome rápido para entrar no elenco.
                  </p>
                </div>
              </div>

              <PhotoCapture
                photoUrl={newPhotoUrl}
                name={newName || 'Novo Atleta'}
                onPhotoCaptured={(url) => setNewPhotoUrl(url)}
                onPhotoRemoved={() => setNewPhotoUrl(undefined)}
              />

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Seu Nome Completo ou Apelido
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Lucas Silva"
                  className="w-full px-4 py-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {errorMsg && <p className="text-xs text-rose-400 font-semibold">{errorMsg}</p>}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="w-1/3 py-3 px-3 bg-slate-700/80 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl transition-all text-xs cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Concluir Cadastro
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
