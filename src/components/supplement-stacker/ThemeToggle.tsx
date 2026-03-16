interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
      style={{
        background: 'hsl(var(--ss-surface))',
        border: '1px solid hsl(var(--ss-border))',
      }}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <svg className="w-4 h-4" style={{ color: 'hsl(var(--ss-text-secondary))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
        </svg>
      ) : (
        <svg className="w-4 h-4" style={{ color: 'hsl(var(--ss-text-secondary))' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
        </svg>
      )}
    </button>
  );
}
