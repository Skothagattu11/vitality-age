// src/utils/supplementCatalog.ts

export interface CatalogSupplement {
  id: string;
  name: string;
  icon: string;
  defaultDose: string;
  timing: 'morning' | 'evening' | 'any';
  withFood: boolean;
  fatSoluble: boolean;
  sleepSupport: boolean;
  interactions: { supplementId: string; type: 'synergy' | 'separate'; note: string }[];
}

export const SUPPLEMENT_CATALOG: CatalogSupplement[] = [
  {
    id: 'vitamin-d3', name: 'Vitamin D3', icon: '\u2600\uFE0F', defaultDose: '2,000 IU',
    timing: 'morning', withFood: true, fatSoluble: true, sleepSupport: false,
    interactions: [{ supplementId: 'vitamin-k2', type: 'synergy', note: 'D3 + K2 enhance calcium metabolism together' }],
  },
  {
    id: 'magnesium-glycinate', name: 'Magnesium Glycinate', icon: '\uD83E\uDDEA', defaultDose: '400mg',
    timing: 'evening', withFood: false, fatSoluble: false, sleepSupport: true,
    interactions: [{ supplementId: 'creatine', type: 'separate', note: 'Separate Magnesium from Creatine by 1 hour' }],
  },
  {
    id: 'omega-3', name: 'Omega-3 Fish Oil', icon: '\uD83D\uDC1F', defaultDose: '1,000mg',
    timing: 'morning', withFood: true, fatSoluble: true, sleepSupport: false,
    interactions: [],
  },
  {
    id: 'ashwagandha', name: 'Ashwagandha', icon: '\uD83C\uDF3F', defaultDose: '600mg',
    timing: 'evening', withFood: false, fatSoluble: false, sleepSupport: true,
    interactions: [],
  },
  {
    id: 'vitamin-k2', name: 'Vitamin K2', icon: '\uD83E\uDDB4', defaultDose: '100mcg',
    timing: 'morning', withFood: true, fatSoluble: true, sleepSupport: false,
    interactions: [{ supplementId: 'vitamin-d3', type: 'synergy', note: 'K2 directs calcium to bones, not arteries' }],
  },
  {
    id: 'creatine', name: 'Creatine', icon: '\uD83D\uDCAA', defaultDose: '5g',
    timing: 'morning', withFood: true, fatSoluble: false, sleepSupport: false,
    interactions: [{ supplementId: 'magnesium-glycinate', type: 'separate', note: 'Separate from Magnesium by 1 hour' }],
  },
  {
    id: 'vitamin-c', name: 'Vitamin C', icon: '\uD83C\uDF4A', defaultDose: '500mg',
    timing: 'morning', withFood: false, fatSoluble: false, sleepSupport: false,
    interactions: [{ supplementId: 'iron', type: 'synergy', note: 'Vitamin C enhances iron absorption' }],
  },
  {
    id: 'zinc', name: 'Zinc', icon: '\uD83D\uDEE1\uFE0F', defaultDose: '15mg',
    timing: 'morning', withFood: true, fatSoluble: false, sleepSupport: false,
    interactions: [{ supplementId: 'iron', type: 'separate', note: 'Zinc competes with iron for absorption' }],
  },
  {
    id: 'b-complex', name: 'B-Complex', icon: '\u26A1', defaultDose: '1 cap',
    timing: 'morning', withFood: true, fatSoluble: false, sleepSupport: false,
    interactions: [],
  },
  {
    id: 'iron', name: 'Iron', icon: '\uD83E\uDE78', defaultDose: '18mg',
    timing: 'morning', withFood: false, fatSoluble: false, sleepSupport: false,
    interactions: [
      { supplementId: 'vitamin-c', type: 'synergy', note: 'Take with Vitamin C for better absorption' },
      { supplementId: 'zinc', type: 'separate', note: 'Separate from Zinc by 2 hours' },
    ],
  },
  {
    id: 'probiotics', name: 'Probiotics', icon: '\uD83E\uDDA0', defaultDose: '10B CFU',
    timing: 'morning', withFood: false, fatSoluble: false, sleepSupport: false,
    interactions: [],
  },
  {
    id: 'coq10', name: 'CoQ10', icon: '\u2764\uFE0F', defaultDose: '100mg',
    timing: 'morning', withFood: true, fatSoluble: true, sleepSupport: false,
    interactions: [],
  },
  {
    id: 'turmeric', name: 'Turmeric / Curcumin', icon: '\uD83D\uDFE1', defaultDose: '500mg',
    timing: 'morning', withFood: true, fatSoluble: true, sleepSupport: false,
    interactions: [],
  },
  {
    id: 'collagen', name: 'Collagen', icon: '\u2728', defaultDose: '10g',
    timing: 'any', withFood: false, fatSoluble: false, sleepSupport: false,
    interactions: [],
  },
  {
    id: 'l-theanine', name: 'L-Theanine', icon: '\uD83C\uDF75', defaultDose: '200mg',
    timing: 'evening', withFood: false, fatSoluble: false, sleepSupport: true,
    interactions: [],
  },
  {
    id: 'melatonin', name: 'Melatonin', icon: '\uD83C\uDF19', defaultDose: '0.5mg',
    timing: 'evening', withFood: false, fatSoluble: false, sleepSupport: true,
    interactions: [],
  },
];

export const SUPPLEMENT_CATEGORIES = [
  { label: 'Vitamins', ids: ['vitamin-d3', 'vitamin-k2', 'vitamin-c', 'b-complex'] },
  { label: 'Minerals', ids: ['magnesium-glycinate', 'zinc', 'iron'] },
  { label: 'Performance', ids: ['creatine', 'coq10', 'omega-3'] },
  { label: 'Recovery & Sleep', ids: ['ashwagandha', 'l-theanine', 'melatonin', 'collagen'] },
  { label: 'Gut & Inflammation', ids: ['probiotics', 'turmeric'] },
] as const;

export function getCatalogSupplement(id: string): CatalogSupplement | undefined {
  return SUPPLEMENT_CATALOG.find(s => s.id === id);
}
