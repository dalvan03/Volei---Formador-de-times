import React from 'react';
import { Player } from '../types';

interface PlayerAvatarProps {
  player?: Partial<Player> | null;
  name?: string;
  photoUrl?: string;
  avatarBg?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  player,
  name: propName,
  photoUrl: propPhotoUrl,
  avatarBg: propAvatarBg,
  className = '',
  size = 'md',
}) => {
  const name = player?.name || propName || '?';
  const photoUrl = player?.photoUrl || propPhotoUrl;
  const avatarBg = player?.avatarBg || propAvatarBg || 'bg-slate-700';

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  if (photoUrl) {
    return (
      <div
        className={`${sizeClass} rounded-2xl overflow-hidden shrink-0 shadow-md border border-slate-200/60 bg-slate-100 ${className}`}
      >
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-2xl ${avatarBg} text-white flex items-center justify-center font-bold shrink-0 shadow-md ${className}`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
};
