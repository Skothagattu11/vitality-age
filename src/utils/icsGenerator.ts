// src/utils/icsGenerator.ts

import type { StackOption, UserSchedule } from '@/types/supplementStacker';

function escapeICS(text: string): string {
  return text.replace(/[\\;,]/g, c => `\\${c}`).replace(/\n/g, '\\n');
}

function padTime(h: number, m: number): string {
  return `${h.toString().padStart(2, '0')}${m.toString().padStart(2, '0')}00`;
}

function parseSlotTime(time: string): { hours: number; minutes: number } {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return { hours: 8, minutes: 0 };

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return { hours, minutes };
}

function generateUID(): string {
  return `ss-${Date.now()}-${Math.random().toString(36).slice(2, 9)}@entropyage`;
}

export function generateICS(stack: StackOption, _schedule: UserSchedule): string {
  const today = new Date();
  const dateStr = [
    today.getFullYear(),
    (today.getMonth() + 1).toString().padStart(2, '0'),
    today.getDate().toString().padStart(2, '0'),
  ].join('');

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Entropy Age//Supplement Stacker//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${stack.name}`,
  ];

  for (const slot of stack.slots) {
    const { hours, minutes } = parseSlotTime(slot.time);
    const startTime = padTime(hours, minutes);
    const endMinutes = minutes + 15;
    const endHours = hours + Math.floor(endMinutes / 60);
    const endTime = padTime(endHours, endMinutes % 60);

    const summary = `Supplements - ${slot.label}`;
    const description = slot.supplements.join(', ') + `\\n\\n${slot.reason}`;

    lines.push(
      'BEGIN:VEVENT',
      `UID:${generateUID()}`,
      `DTSTART:${dateStr}T${startTime}`,
      `DTEND:${dateStr}T${endTime}`,
      'RRULE:FREQ=DAILY',
      `SUMMARY:${escapeICS(summary)}`,
      `DESCRIPTION:${escapeICS(description)}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT5M',
      'ACTION:DISPLAY',
      `DESCRIPTION:Time for your ${slot.label} supplements`,
      'END:VALARM',
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadICS(content: string, filename = 'supplement-stack.ics'): void {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
