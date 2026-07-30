import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, X, RefreshCw, Check, Trash2 } from 'lucide-react';
import { PlayerAvatar } from './PlayerAvatar';

interface PhotoCaptureProps {
  photoUrl?: string;
  name?: string;
  onPhotoCaptured: (base64Url: string) => void;
  onPhotoRemoved?: () => void;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  photoUrl,
  name,
  onPhotoCaptured,
  onPhotoRemoved,
}) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream when component unmounts or modal closes
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  const startCamera = async (mode: 'user' | 'environment' = 'user') => {
    setCameraError(null);
    setCapturedPreview(null);
    stopCameraStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCameraError('Não foi possível acessar a câmera. Tente selecionar da galeria.');
    }
  };

  const handleOpenCamera = () => {
    startCamera(facingMode);
  };

  const handleCloseCameraModal = () => {
    stopCameraStream();
    setIsCameraOpen(false);
    setCapturedPreview(null);
    setCameraError(null);
  };

  const handleSwitchCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  const handleTakePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const size = Math.min(video.videoWidth, video.videoHeight) || 400;
    
    // Crop center square
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;

    canvas.width = 400;
    canvas.height = 400;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mirror if front camera
      if (facingMode === 'user') {
        ctx.translate(400, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, sx, sy, size, size, 0, 0, 400, 400);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
    setCapturedPreview(dataUrl);
  };

  const handleConfirmPhoto = () => {
    if (capturedPreview) {
      onPhotoCaptured(capturedPreview);
      handleCloseCameraModal();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;

        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, sx, sy, size, size, 0, 0, 400, 400);
        }
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        onPhotoCaptured(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-3 my-2">
      <div className="relative group">
        <PlayerAvatar name={name || 'Atleta'} photoUrl={photoUrl} size="xl" />

        {photoUrl && onPhotoRemoved && (
          <button
            type="button"
            onClick={onPhotoRemoved}
            className="absolute -top-1 -right-1 bg-rose-500 text-white p-1 rounded-full shadow-md hover:bg-rose-600 transition-all cursor-pointer"
            title="Remover foto"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Camera and Gallery buttons */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleOpenCamera}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          {photoUrl ? 'Tirar Nova Foto' : 'Tirar Foto'}
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ImageIcon className="w-4 h-4" />
          Galeria
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Live Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-between p-4 animate-fade-in">
          {/* Header */}
          <div className="w-full max-w-sm flex items-center justify-between text-white py-2">
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <Camera className="w-5 h-5 text-indigo-400" /> Tirar Foto do Atleta
            </h3>
            <button
              type="button"
              onClick={handleCloseCameraModal}
              className="p-1.5 bg-white/20 rounded-full hover:bg-white/30 text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Camera / Preview Viewport */}
          <div className="w-full max-w-sm aspect-square bg-slate-900 rounded-3xl overflow-hidden relative border-2 border-indigo-500/50 shadow-2xl flex items-center justify-center">
            {cameraError ? (
              <div className="text-center p-4 text-rose-300 text-sm font-medium">
                <p>{cameraError}</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-3 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs"
                >
                  Carregar da Galeria
                </button>
              </div>
            ) : capturedPreview ? (
              <img
                src={capturedPreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    facingMode === 'user' ? 'scale-x-[-1]' : ''
                  }`}
                />
                {/* Circular Framing Overlay */}
                <div className="absolute inset-0 border-[3px] border-white/40 rounded-full pointer-events-none scale-90" />
              </>
            )}
          </div>

          {/* Controls Footer */}
          <div className="w-full max-w-sm flex items-center justify-center gap-4 py-4">
            {capturedPreview ? (
              <>
                <button
                  type="button"
                  onClick={() => setCapturedPreview(null)}
                  className="px-4 py-2.5 bg-slate-800 text-white font-bold text-xs rounded-2xl border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Tirar Outra
                </button>

                <button
                  type="button"
                  onClick={handleConfirmPhoto}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-5 h-5" /> Confirmar Foto
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSwitchCamera}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full cursor-pointer shadow-md"
                  title="Alternar Câmera"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>

                {/* Shutter Button */}
                <button
                  type="button"
                  onClick={handleTakePhoto}
                  className="w-16 h-16 rounded-full bg-white border-4 border-indigo-600 shadow-xl flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-600" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
