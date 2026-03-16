interface TimePickerProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function TimePicker({ icon, label, value, onChange }: TimePickerProps) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl mb-2"
         style={{ background: 'hsl(var(--ss-surface))', border: '1px solid hsl(var(--ss-border))', boxShadow: 'var(--ss-shadow-sm)' }}>
      <span style={{ color: 'hsl(var(--ss-text-muted))' }}>{icon}</span>
      <span className="flex-1 text-sm font-medium" style={{ color: 'hsl(var(--ss-text))' }}>
        {label}
      </span>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="ss-font-mono text-sm font-semibold px-3 py-1.5 rounded-md text-center"
        style={{
          color: 'hsl(var(--ss-accent))',
          background: 'hsl(var(--ss-accent-soft))',
          border: '1px solid hsl(var(--ss-accent) / 0.2)',
          minWidth: '90px',
        }}
      />
    </div>
  );
}
