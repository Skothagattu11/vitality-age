// src/utils/stackEngine.ts

import type { Supplement, UserSchedule, StackOption, TimeSlot, InteractionNote } from '@/types/supplementStacker';
import { SUPPLEMENT_CATALOG, getCatalogSupplement } from './supplementCatalog';

// Convert "06:30" to minutes since midnight
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
}

// Convert minutes since midnight to "7:30 AM" format
function minutesToDisplay(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
}

interface ClassifiedSupplements {
  morningWithFood: Supplement[];
  morningEmpty: Supplement[];
  middayWithFood: Supplement[];
  eveningWithFood: Supplement[];
  eveningEmpty: Supplement[];
}

function classifySupplements(supplements: Supplement[]): ClassifiedSupplements {
  const result: ClassifiedSupplements = {
    morningWithFood: [],
    morningEmpty: [],
    middayWithFood: [],
    eveningWithFood: [],
    eveningEmpty: [],
  };

  for (const supp of supplements) {
    const catalog = getCatalogSupplement(supp.id);
    const timing = catalog?.timing ?? supp.timing ?? 'any';
    const withFood = catalog?.withFood ?? supp.withFood ?? false;
    const isSleepSupport = catalog?.sleepSupport ?? false;

    if (isSleepSupport || timing === 'evening') {
      if (withFood) {
        result.eveningWithFood.push(supp);
      } else {
        result.eveningEmpty.push(supp);
      }
    } else if (timing === 'midday') {
      result.middayWithFood.push(supp);
    } else {
      // morning or any
      if (withFood) {
        result.morningWithFood.push(supp);
      } else {
        result.morningEmpty.push(supp);
      }
    }
  }

  return result;
}

function buildSimpleStack(supplements: Supplement[], schedule: UserSchedule): StackOption {
  const classified = classifySupplements(supplements);

  const morningAll = [...classified.morningWithFood, ...classified.morningEmpty, ...classified.middayWithFood];
  const eveningAll = [...classified.eveningWithFood, ...classified.eveningEmpty];

  const slots: TimeSlot[] = [];

  if (morningAll.length > 0) {
    const breakfastMinutes = timeToMinutes(schedule.breakfastTime);
    slots.push({
      time: minutesToDisplay(breakfastMinutes),
      label: 'with breakfast',
      supplements: morningAll.map(s => s.name),
      reason: 'All morning supplements grouped together for simplicity',
    });
  }

  if (eveningAll.length > 0) {
    const bedMinutes = timeToMinutes(schedule.bedTime);
    const eveningMinutes = bedMinutes - 30; // 30 min before bed
    slots.push({
      time: minutesToDisplay(eveningMinutes),
      label: 'before bed',
      supplements: eveningAll.map(s => s.name),
      reason: 'Sleep-support and evening supplements grouped together',
    });
  }

  return {
    id: 'simple',
    name: 'Simple Stack',
    description: '2 daily windows — easy to remember, minimal disruption',
    slots,
    isRecommended: false,
  };
}

function buildOptimalStack(supplements: Supplement[], schedule: UserSchedule): StackOption {
  const classified = classifySupplements(supplements);

  const slots: TimeSlot[] = [];
  const wakeMinutes = timeToMinutes(schedule.wakeTime);
  const breakfastMinutes = timeToMinutes(schedule.breakfastTime);
  const lunchMinutes = timeToMinutes(schedule.lunchTime);
  const bedMinutes = timeToMinutes(schedule.bedTime);

  // Slot 1: Empty stomach morning (probiotics, iron, vitamin C)
  if (classified.morningEmpty.length > 0) {
    slots.push({
      time: minutesToDisplay(wakeMinutes + 10),
      label: 'on empty stomach',
      supplements: classified.morningEmpty.map(s => s.name),
      reason: 'Best absorbed on an empty stomach before breakfast',
    });
  }

  // Slot 2: With breakfast (fat-soluble, food-requiring)
  if (classified.morningWithFood.length > 0) {
    slots.push({
      time: minutesToDisplay(breakfastMinutes),
      label: 'with breakfast',
      supplements: classified.morningWithFood.map(s => s.name),
      reason: 'Fat-soluble vitamins need dietary fat for absorption',
    });
  }

  // Slot 3: Midday with lunch
  if (classified.middayWithFood.length > 0) {
    slots.push({
      time: minutesToDisplay(lunchMinutes),
      label: 'with lunch',
      supplements: classified.middayWithFood.map(s => s.name),
      reason: 'Spaced from morning dose for sustained levels',
    });
  }

  // Slot 4: Evening (sleep support, relaxation)
  const eveningAll = [...classified.eveningWithFood, ...classified.eveningEmpty];
  if (eveningAll.length > 0) {
    slots.push({
      time: minutesToDisplay(bedMinutes - 60),
      label: 'evening wind-down',
      supplements: eveningAll.map(s => s.name),
      reason: 'Sleep-support supplements taken 1 hour before bed for best effect',
    });
  }

  return {
    id: 'optimal',
    name: 'Optimal Stack',
    description: 'Science-backed timing windows for maximum absorption',
    slots,
    isRecommended: true,
  };
}

export function generateStackOptions(supplements: Supplement[], schedule: UserSchedule): StackOption[] {
  if (supplements.length === 0) return [];
  return [buildSimpleStack(supplements, schedule), buildOptimalStack(supplements, schedule)];
}

export function getInteractions(supplements: Supplement[]): InteractionNote[] {
  const notes: InteractionNote[] = [];
  const selectedIds = new Set(supplements.map(s => s.id));

  for (const supp of supplements) {
    const catalog = getCatalogSupplement(supp.id);
    if (!catalog) continue;

    for (const interaction of catalog.interactions) {
      if (!selectedIds.has(interaction.supplementId)) continue;

      // Avoid duplicate pairs
      const pairKey = [supp.id, interaction.supplementId].sort().join('::');
      if (notes.some(n => {
        const ids = n.supplements.map(name => {
          const found = supplements.find(s => s.name === name);
          return found?.id ?? '';
        }).sort().join('::');
        return ids === pairKey;
      })) continue;

      const otherSupp = supplements.find(s => s.id === interaction.supplementId);
      notes.push({
        type: interaction.type,
        message: interaction.note,
        supplements: [supp.name, otherSupp?.name ?? interaction.supplementId],
      });
    }
  }

  return notes;
}
