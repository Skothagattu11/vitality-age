import { useRef, useState } from 'react';
import { compressImage } from '@/utils/imageCompress';

interface ImageUploadProps {
  onImageSelected: (file: File, preview: string) => void;
  label?: string;
}

export function ImageUpload({ onImageSelected, label }: ImageUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const compressed = await compressImage(file);
    const url = URL.createObjectURL(compressed);
    setPreview(url);
    onImageSelected(compressed, url);
  };

  // Reset input values so the same file can be re-selected
  const resetInputs = () => {
    if (fileRef.current) fileRef.current.value = '';
    if (cameraRef.current) cameraRef.current.value = '';
  };

  if (preview) {
    return (
      <div className="relative rounded-xl overflow-hidden mb-3">
        <img src={preview} alt="Label preview" className="w-full max-h-[200px] object-contain rounded-xl"
             style={{ background: 'hsl(var(--ss-surface-raised))' }} />
        <button
          type="button"
          onClick={() => { setPreview(null); resetInputs(); }}
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
      {/* Camera button — primary action, opens native camera */}
      <button
        type="button"
        onClick={() => cameraRef.current?.click()}
        className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-[14px] font-semibold transition-all active:scale-[0.97] mb-3"
        style={{
          background: 'hsl(var(--ss-accent))',
          color: '#fff',
          boxShadow: '0 2px 12px hsl(var(--ss-accent) / 0.35)',
        }}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
          <circle cx="12" cy="13" r="3"/>
        </svg>
        Take Photo
      </button>

      {/* Upload from gallery — secondary */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[12px] font-medium transition-all active:scale-[0.97] mb-3"
        style={{
          background: 'hsl(var(--ss-surface))',
          color: 'hsl(var(--ss-text-secondary))',
          border: '1px solid hsl(var(--ss-border-soft))',
        }}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
        </svg>
        Upload from Gallery
      </button>

      <p className="text-[10px] text-center" style={{ color: 'hsl(var(--ss-text-muted))' }}>
        {label || 'Point at a supplement label, nutrition facts, or food item'}
      </p>

      {/* Hidden file inputs */}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden"
             onChange={(e) => handleFile(e.target.files?.[0])} />
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
             onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  );
}
