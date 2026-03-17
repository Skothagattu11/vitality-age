import { useRef, useState, useEffect, useCallback } from 'react';
import { compressImage } from '@/utils/imageCompress';

interface ImageUploadProps {
  onImageSelected: (file: File, preview: string) => void;
  label?: string;
}

export function ImageUpload({ onImageSelected, label }: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => { stopCamera(); };
  }, [stopCamera]);

  const startCamera = async () => {
    setCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch {
      setCameraError(true);
    }
  };

  const captureFromCamera = async () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const compressed = await compressImage(file);
      const url = URL.createObjectURL(compressed);
      setPreview(url);
      stopCamera();
      onImageSelected(compressed, url);
    }, 'image/jpeg', 0.85);
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const compressed = await compressImage(file);
    const url = URL.createObjectURL(compressed);
    setPreview(url);
    onImageSelected(compressed, url);
  };

  const resetUpload = () => {
    setPreview(null);
    // Restart camera automatically for quick consecutive scans
    startCamera();
  };

  // Auto-start camera on mount
  useEffect(() => {
    startCamera();
  }, []);

  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden mb-3">
        <img src={preview} alt="Label preview" className="w-full max-h-[200px] object-contain rounded-xl"
             style={{ background: 'hsl(var(--ss-surface-raised))' }} />
        <button
          type="button"
          onClick={resetUpload}
          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs"
          style={{ background: 'hsl(0 0% 0% / 0.6)', color: 'white' }}
        >
          &times;
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Live camera viewfinder */}
      {cameraActive && (
        <div className="relative rounded-xl overflow-hidden mb-3">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-xl"
            style={{ maxHeight: '240px', objectFit: 'cover', background: '#000' }}
          />
          {/* Viewfinder overlay */}
          <div className="absolute inset-0 pointer-events-none"
               style={{ border: '2px solid hsl(var(--ss-accent) / 0.4)', borderRadius: '12px' }}>
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 rounded-tl-md"
                 style={{ borderColor: 'hsl(var(--ss-accent))' }} />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 rounded-tr-md"
                 style={{ borderColor: 'hsl(var(--ss-accent))' }} />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 rounded-bl-md"
                 style={{ borderColor: 'hsl(var(--ss-accent))' }} />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 rounded-br-md"
                 style={{ borderColor: 'hsl(var(--ss-accent))' }} />
          </div>
          {/* Capture button */}
          <button
            type="button"
            onClick={captureFromCamera}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{
              background: 'hsl(var(--ss-accent))',
              border: '3px solid white',
              boxShadow: '0 2px 12px hsl(0 0% 0% / 0.4)',
            }}
          >
            <div className="w-5 h-5 rounded-full bg-white" />
          </button>
          {/* Hint text */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-semibold"
               style={{ background: 'hsl(0 0% 0% / 0.5)', color: 'white' }}>
            Point at label or food, then tap
          </div>
        </div>
      )}

      {/* Camera not available — fallback to file upload */}
      {!cameraActive && (
        <>
          {cameraError && (
            <div className="text-[11px] text-center mb-2 px-3 py-1.5 rounded-lg"
                 style={{ background: 'hsl(var(--ss-warn) / 0.1)', color: 'hsl(var(--ss-warn))' }}>
              Camera not available — use file upload instead
            </div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed rounded-xl p-8 text-center mb-3 transition-all active:scale-[0.98]"
            style={{ borderColor: 'hsl(var(--ss-border))', background: 'transparent' }}
          >
            <svg className="w-7 h-7 mx-auto mb-2" style={{ color: 'hsl(var(--ss-text-muted))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
            </svg>
            <p className="text-[13px]" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
              {label || 'Upload supplement label'}
            </p>
            <p className="text-[11px] mt-1" style={{ color: 'hsl(var(--ss-text-muted))' }}>
              JPG, PNG up to 10MB
            </p>
          </button>
        </>
      )}

      {/* Upload from gallery — always available */}
      {cameraActive && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-medium transition-all active:scale-[0.97] mb-3"
          style={{ background: 'hsl(var(--ss-surface))', color: 'hsl(var(--ss-text-secondary))', border: '1px solid hsl(var(--ss-border-soft))' }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
          </svg>
          Upload from Gallery
        </button>
      )}

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
             onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  );
}
