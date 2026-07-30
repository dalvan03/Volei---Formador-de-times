import React, { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import {
  X,
  Share2,
  Download,
  Check,
  Instagram,
  Facebook,
  Sparkles,
  Trophy,
  Swords,
  Volleyball,
  Users,
} from 'lucide-react';
import { Match, Player, UserSession } from '../types';

interface ShareStoryModalProps {
  match: Match;
  players: Player[];
  session: UserSession | null;
  onClose: () => void;
}

export const ShareStoryModal: React.FC<ShareStoryModalProps> = ({
  match,
  players,
  session,
  onClose,
}) => {
  const storyRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Determine user perspective
  const currentUserId = session?.player?.id;
  const inA = match.teamA?.playerIds.includes(currentUserId || '');
  const inB = match.teamB?.playerIds.includes(currentUserId || '');

  const [perspective, setPerspective] = useState<'teamA' | 'teamB' | 'neutral'>(
    inA ? 'teamA' : inB ? 'teamB' : 'neutral'
  );

  const teamASets = match.finalScore?.teamASets ?? match.teamA?.setWins ?? 0;
  const teamBSets = match.finalScore?.teamBSets ?? match.teamB?.setWins ?? 0;

  const teamAWon = teamASets > teamBSets;
  const teamBWon = teamBSets > teamASets;
  const isDraw = teamASets === teamBSets;

  let resultHeader = {
    title: 'PARTIDA FINALIZADA',
    subtitle: 'Grande jogo em quadra!',
    bgGradient: 'from-amber-500 via-amber-600 to-yellow-500',
    borderColor: 'border-amber-400/40',
    textColor: 'text-amber-200',
    icon: Volleyball,
  };

  if (perspective === 'teamA') {
    if (teamAWon) {
      resultHeader = {
        title: 'VITÓRIA!',
        subtitle: 'Vitória do Time A!',
        bgGradient: 'from-emerald-500 via-teal-600 to-emerald-700',
        borderColor: 'border-emerald-400/50',
        textColor: 'text-emerald-100',
        icon: Trophy,
      };
    } else if (teamBWon) {
      resultHeader = {
        title: 'DERROTA',
        subtitle: 'Jogo disputado até o fim!',
        bgGradient: 'from-rose-600 via-rose-700 to-red-800',
        borderColor: 'border-rose-400/50',
        textColor: 'text-rose-100',
        icon: Swords,
      };
    }
  } else if (perspective === 'teamB') {
    if (teamBWon) {
      resultHeader = {
        title: 'VITÓRIA!',
        subtitle: 'Vitória do Time B!',
        bgGradient: 'from-emerald-500 via-teal-600 to-emerald-700',
        borderColor: 'border-emerald-400/50',
        textColor: 'text-emerald-100',
        icon: Trophy,
      };
    } else if (teamAWon) {
      resultHeader = {
        title: 'DERROTA',
        subtitle: 'Jogo disputado até o fim!',
        bgGradient: 'from-rose-600 via-rose-700 to-red-800',
        borderColor: 'border-rose-400/50',
        textColor: 'text-rose-100',
        icon: Swords,
      };
    }
  }

  // Get full player objects
  const teamAPlayers =
    match.teamA?.playerIds.map((id) => {
      const p = players.find((item) => item.id === id);
      return p || { id, name: 'Atleta', avatarBg: 'bg-blue-600' };
    }) || [];

  const teamBPlayers =
    match.teamB?.playerIds.map((id) => {
      const p = players.find((item) => item.id === id);
      return p || { id, name: 'Atleta', avatarBg: 'bg-amber-600' };
    }) || [];

  const captionText = `🔥 Placar da Rodada: ${match.teamA.name} ${teamASets} x ${teamBSets} ${match.teamB.name}! 🏐 Grande jogo!`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(captionText);
    setCopiedCaption(true);
    showToast('Legenda copiada para a área de transferência!');
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  const generateImageFile = async (): Promise<File | null> => {
    if (!storyRef.current) return null;

    try {
      setIsGenerating(true);
      const dataUrl = await toPng(storyRef.current, {
        cacheBust: true,
        quality: 0.95,
        pixelRatio: 2,
      });

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `vollei-story-${match.date}.png`, {
        type: 'image/png',
      });
      return file;
    } catch (err) {
      console.error('Erro ao gerar imagem:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    const file = await generateImageFile();
    if (!file) return;

    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vollei-story-${match.date}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Imagem do Story baixada com sucesso! 📸');
  };

  const handleNativeShare = async (platformName?: string) => {
    const file = await generateImageFile();

    if (!file) {
      showToast('Erro ao processar imagem para compartilhamento.');
      return;
    }

    // Try Web Share API with image file
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Resultado da Rodada - ${match.date}`,
          text: captionText,
        });
        showToast('Compartilhado com sucesso!');
        return;
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        } else {
          return;
        }
      }
    }

    // Fallback: Download image and show instructions
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vollei-story-${match.date}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    navigator.clipboard.writeText(captionText);

    if (platformName === 'Instagram') {
      showToast('Imagem salva! Abra o Instagram e selecione-a para publicar no Story 📸');
      setTimeout(() => {
        window.open('instagram://story-camera', '_blank');
      }, 800);
    } else if (platformName === 'Facebook') {
      showToast('Imagem salva! Abra o Facebook e selecione-a no seu Story 📘');
    } else {
      showToast('Imagem salva! Compartilhe nos seus Stories!');
    }
  };

  const HeaderIcon = resultHeader.icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl max-w-md w-full my-auto shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white leading-tight">
                Compartilhar no Story
              </h3>
              <p className="text-[10px] text-slate-400">
                Instagram & Facebook Stories
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {/* Perspective Selector */}
          <div className="bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700/60 space-y-2">
            <label className="block text-[11px] font-bold text-slate-300">
              Sua Perspectiva no Card:
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPerspective('teamA')}
                className={`py-2 px-2 rounded-xl border transition-all text-[11px] truncate cursor-pointer ${
                  perspective === 'teamA'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                {match.teamA?.name || 'Time A'}
              </button>
              <button
                type="button"
                onClick={() => setPerspective('teamB')}
                className={`py-2 px-2 rounded-xl border transition-all text-[11px] truncate cursor-pointer ${
                  perspective === 'teamB'
                    ? 'bg-amber-600 text-white border-amber-400 shadow-sm'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                {match.teamB?.name || 'Time B'}
              </button>
              <button
                type="button"
                onClick={() => setPerspective('neutral')}
                className={`py-2 px-2 rounded-xl border transition-all text-[11px] truncate cursor-pointer ${
                  perspective === 'neutral'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-sm'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                Placar Geral
              </button>
            </div>
          </div>

          {/* STORY CARD CANVAS PREVIEW (Aspect 9:16 vertical format) */}
          <div className="flex justify-center my-1">
            <div
              ref={storyRef}
              className="w-[310px] h-[550px] bg-slate-950 text-white rounded-3xl p-5 flex flex-col justify-between relative overflow-hidden shadow-2xl border border-slate-800 select-none shrink-0"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.25), transparent 70%), radial-gradient(circle at 50% 100%, rgba(59, 130, 246, 0.2), transparent 70%)',
              }}
            >
              {/* Decorative court lines background */}
              <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
                <div className="w-[85%] h-[85%] border-2 border-emerald-400 rounded-2xl flex items-center justify-center">
                  <div className="w-full h-0.5 bg-emerald-400" />
                </div>
              </div>

              {/* Top Branding Header */}
              <div className="relative z-10 flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-md shadow-emerald-500/30">
                    <Volleyball className="w-5 h-5 fill-slate-950" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase block">
                      VÔLEI GAME DAY
                    </span>
                    <span className="text-xs font-bold text-slate-200">
                      {match.title || 'Rodada da Semana'}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-slate-400 bg-slate-900/90 px-2.5 py-1 rounded-full border border-slate-800">
                  {new Date(match.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                </span>
              </div>

              {/* Center Victory/Defeat Banner */}
              <div className="relative z-10 my-auto text-center space-y-4">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r ${resultHeader.bgGradient} border ${resultHeader.borderColor} shadow-lg shadow-emerald-950/50 animate-pulse`}
                >
                  <HeaderIcon className="w-4 h-4 text-white" />
                  <span className="text-xs font-black tracking-wider text-white uppercase">
                    {resultHeader.title}
                  </span>
                </div>

                {/* Score Big Display */}
                <div className="bg-slate-900/90 border border-slate-800/90 p-4 rounded-3xl shadow-xl space-y-3">
                  <div className="flex items-center justify-around">
                    {/* Team A */}
                    <div className="flex flex-col items-center gap-1 w-28">
                      <span className="text-xs font-extrabold text-blue-400 truncate max-w-full">
                        {match.teamA?.name || 'Time A'}
                      </span>
                      <span className="text-4xl font-black text-white tracking-tight drop-shadow-md">
                        {teamASets}
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-black text-slate-500 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700">
                        VS
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase">
                        SETS
                      </span>
                    </div>

                    {/* Team B */}
                    <div className="flex flex-col items-center gap-1 w-28">
                      <span className="text-xs font-extrabold text-amber-400 truncate max-w-full">
                        {match.teamB?.name || 'Time B'}
                      </span>
                      <span className="text-4xl font-black text-white tracking-tight drop-shadow-md">
                        {teamBSets}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Team Roster Grid */}
                <div className="grid grid-cols-2 gap-2 text-left">
                  {/* Team A Roster */}
                  <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-blue-500/20 space-y-1.5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                      <span className="text-[10px] font-black text-blue-400 truncate">
                        {match.teamA?.name || 'Time A'}
                      </span>
                      <span className="text-[9px] font-bold text-blue-300 bg-blue-950 px-1.5 py-0.2 rounded">
                        {teamAPlayers.length}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {teamAPlayers.slice(0, 6).map((p, idx) => (
                        <div key={p.id + idx} className="flex items-center gap-1.5">
                          <div className={`w-3.5 h-3.5 rounded-full ${p.avatarBg || 'bg-blue-600'} text-[8px] font-black text-white flex items-center justify-center shrink-0`}>
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[10px] font-semibold text-slate-200 truncate">
                            {p.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Team B Roster */}
                  <div className="bg-slate-900/60 p-2.5 rounded-2xl border border-amber-500/20 space-y-1.5">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                      <span className="text-[10px] font-black text-amber-400 truncate">
                        {match.teamB?.name || 'Time B'}
                      </span>
                      <span className="text-[9px] font-bold text-amber-300 bg-amber-950 px-1.5 py-0.2 rounded">
                        {teamBPlayers.length}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {teamBPlayers.slice(0, 6).map((p, idx) => (
                        <div key={p.id + idx} className="flex items-center gap-1.5">
                          <div className={`w-3.5 h-3.5 rounded-full ${p.avatarBg || 'bg-amber-600'} text-[8px] font-black text-white flex items-center justify-center shrink-0`}>
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-[10px] font-semibold text-slate-200 truncate">
                            {p.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Story Footer */}
              <div className="relative z-10 border-t border-slate-800/80 pt-2.5 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span className="text-slate-400 font-semibold">
                  Partida Oficial de Vôlei
                </span>
                <span className="text-slate-500">
                  {new Date(match.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>

          {/* Toast Notice */}
          {toastMessage && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-bold text-center animate-fade-in">
              {toastMessage}
            </div>
          )}

          {/* Share Actions Grid */}
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => handleNativeShare('Instagram')}
                className="py-3 px-3 bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-pink-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <Instagram className="w-4 h-4 shrink-0" />
                <span>Instagram Story</span>
              </button>

              <button
                type="button"
                disabled={isGenerating}
                onClick={() => handleNativeShare('Facebook')}
                className="py-3 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <Facebook className="w-4 h-4 shrink-0" />
                <span>Facebook Story</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleDownload}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Baixar Imagem</span>
              </button>

              <button
                type="button"
                onClick={handleCopyCaption}
                className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedCaption ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Share2 className="w-4 h-4 text-amber-400" />
                )}
                <span>Copiar Legenda</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
