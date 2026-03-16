import { useRef, useState } from 'react';

interface ImageUploadProps {
  onImageSelected: (file: File, preview: string) => void;
  label?: string;
}

export function ImageUpload({ onImageSelected, label }: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onImageSelected(file, url);
  };

  return (
    <div>
      {preview ? (
        <div className="relative rounded-xl overflow-hidden mb-3">
          <img src={preview} alt="Label preview" className="w-full max-h-[200px] object-contain rounded-xl"
               style={{ background: 'hsl(var(--ss-surface-raised))' }} />
          <button
            type="button"
            onClick={() => { setPreview(null); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs"
            style={{ background: 'hsl(0 0% 0% / 0.6)', color: 'white' }}
          >
            &times;
          </button>
        </div>
      ) : (
        <>
          {/* Upload area */}
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

          {/* Camera button (shows on mobile) */}
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-[13px] font-semibold transition-all active:scale-[0.97] mb-3"
            style={{
              background: 'hsl(var(--ss-accent-soft))',
              border: '1px solid hsl(var(--ss-accent) / 0.2)',
              color: 'hsl(var(--ss-accent))',
            }}
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
              <circle cx="12" cy="13" r="3"/>
            </svg>
            Take Photo
          </button>
        </>
      )}

      {/* Hidden file inputs */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
             onChange={(e) => handleFile(e.target.files?.[0])} />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
             onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  );
}
