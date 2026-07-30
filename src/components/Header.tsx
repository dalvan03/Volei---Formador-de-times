import React from 'react';
import { Volleyball, User, Shield, RefreshCw, LogOut } from 'lucide-react';
import { UserSession } from '../types';
import { PlayerAvatar } from './PlayerAvatar';

interface HeaderProps {
  session: UserSession | null;
  onOpenAuth: () => void;
  onLogout?: () => void;
  matchStatus?: string;
}

export const Header: React.FC<HeaderProps> = ({ session, onOpenAuth, onLogout }) => {
  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white w-full shrink-0 z-40 shadow-md border-b border-slate-800">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Volleyball className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-tight">
              Culto de Segunda
            </h1>
            <p className="text-[10px] text-emerald-400 font-medium tracking-wide uppercase">
              Sorteio & Equilíbrio
            </p>
          </div>
        </div>

        {/* User Pill / Login Switcher */}
        {session?.isLoggedIn && session.player ? (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 border border-slate-700/60 rounded-full transition-all cursor-pointer"
              title="Trocar de jogador"
            >
              <PlayerAvatar player={session.player} size="xs" />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-200 leading-tight">
                  {session.player.name.split(' ')[0]}
                </p>
              </div>
              {session.isAdmin ? (
                <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-md flex items-center gap-0.5">
                  <Shield className="w-2.5 h-2.5" /> Admin
                </span>
              ) : (
                <RefreshCw className="w-3 h-3 text-slate-400" />
              )}
            </button>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="p-2 bg-slate-800/80 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700/60 rounded-full transition-all cursor-pointer"
                title="Sair da conta"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-full shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <User className="w-3.5 h-3.5" />
            Entrar
          </button>
        )}
      </div>
    </header>
  );
};
