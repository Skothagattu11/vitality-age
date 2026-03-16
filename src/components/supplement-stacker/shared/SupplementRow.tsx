interface SupplementRowProps {
  name: string;
  dose: string;
  color?: string;
  onRemove?: () => void;
}

export function SupplementRow({ name, dose, color = 'hsl(var(--ss-accent))', onRemove }: SupplementRowProps) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-1.5"
         style={{ background: 'hsl(var(--ss-surface-raised))', border: '1px solid hsl(var(--ss-border-soft))' }}>
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
      <span className="text-[13px] font-semibold flex-1" style={{ color: 'hsl(var(--ss-text))' }}>
        {name}
      </span>
      <span className="ss-font-mono text-[11px] font-medium" style={{ color: 'hsl(var(--ss-accent))' }}>
        {dose}
      </span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 text-xs"
          style={{
            background: 'hsl(var(--ss-surface))',
            border: '1px solid hsl(var(--ss-border))',
            color: 'hsl(var(--ss-text-muted))',
          }}
          aria-label={`Remove ${name}`}
        >
          &times;
        </button>
      )}
    </div>
  );
}
