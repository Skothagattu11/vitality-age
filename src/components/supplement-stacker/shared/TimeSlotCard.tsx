import type { TimeSlot } from '@/types/supplementStacker';

interface TimeSlotCardProps {
  slot: TimeSlot;
}

export function TimeSlotCard({ slot }: TimeSlotCardProps) {
  return (
    <div className="rounded-lg p-2.5 mb-1"
         style={{ background: 'hsl(var(--ss-surface-raised))', border: '1px solid hsl(var(--ss-border-soft))' }}>
      <div className="ss-font-mono text-[11px] font-semibold mb-1" style={{ color: 'hsl(var(--ss-accent))' }}>
        {slot.time} <span style={{ color: 'hsl(var(--ss-text-muted))' }}>— {slot.label}</span>
      </div>
      <div className="text-xs" style={{ color: 'hsl(var(--ss-text-secondary))' }}>
        {slot.supplements.join(', ')}
      </div>
      <div className="text-[10px] italic mt-1" style={{ color: 'hsl(var(--ss-text-muted))' }}>
        {slot.reason}
      </div>
    </div>
  );
}
