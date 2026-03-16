interface PillButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export function PillButton({ label, active, onClick }: PillButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`ss-pill ${active ? 'active' : ''}`}
    >
      {active && (
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
      )}
      {label}
    </button>
  );
}
