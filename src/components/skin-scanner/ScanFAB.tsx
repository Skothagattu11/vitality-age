interface ScanFABProps {
  onClick: () => void;
}

export function ScanFAB({ onClick }: ScanFABProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ss-fab"
      aria-label="Scan skincare label"
    >
      <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
        <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
        <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
        <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
        <line x1="7" x2="17" y1="12" y2="12"/>
      </svg>
    </button>
  );
}
