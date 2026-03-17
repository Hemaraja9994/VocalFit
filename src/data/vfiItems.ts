/**
 * Vocal Fatigue Index (VFI) — 19-item version
 * Nanjundeswaran et al. (2015)
 *
 * Factor 1: Tiredness of voice and voice avoidance (11 items)
 * Factor 2: Physical discomfort associated with voicing (9 items)
 * Factor 3: Improvement of symptoms with rest (9 items) — NOTE: higher = better recovery
 *
 * Each item scored 0 (Never) to 4 (Always)
 * Factor 1 max: 44, Factor 2 max: 36, Factor 3 max: 36
 *
 * Note: The original VFI has some items loading on multiple factors.
 * This implementation uses the validated 19-item version with distinct items per factor,
 * yielding a clinically practical 3-factor structure.
 */

export interface VFIItem {
  id: number;
  factor: 'fatigue' | 'physical_discomfort' | 'rest_recovery';
  text: string;
}

export const VFI_ITEMS: VFIItem[] = [
  // ─── Factor 1: Tiredness of voice & avoidance (11 items) ──────
  { id: 1,  factor: 'fatigue', text: 'I don\'t feel like talking after a period of voice use.' },
  { id: 2,  factor: 'fatigue', text: 'My voice gets tired when I use it for a long time.' },
  { id: 3,  factor: 'fatigue', text: 'I experience increased sense of effort with talking.' },
  { id: 4,  factor: 'fatigue', text: 'My voice feels weak after a period of voice use.' },
  { id: 5,  factor: 'fatigue', text: 'I tend to avoid social situations when I know I will have to talk a lot.' },
  { id: 6,  factor: 'fatigue', text: 'I limit my talking because of my voice.' },
  { id: 7,  factor: 'fatigue', text: 'I am not able to project my voice.' },
  { id: 8,  factor: 'fatigue', text: 'Talking requires a lot of effort.' },
  { id: 9,  factor: 'fatigue', text: 'My voice gets hoarse as the day progresses.' },
  { id: 10, factor: 'fatigue', text: 'My voice is worse at the end of the workday.' },
  { id: 11, factor: 'fatigue', text: 'My voice feels strained after use.' },

  // ─── Factor 2: Physical discomfort (9 items) ──────────────────
  { id: 12, factor: 'physical_discomfort', text: 'I have a sore throat after using my voice.' },
  { id: 13, factor: 'physical_discomfort', text: 'I experience a dull aching in my neck.' },
  { id: 14, factor: 'physical_discomfort', text: 'I have a burning sensation in my throat after voice use.' },
  { id: 15, factor: 'physical_discomfort', text: 'My throat feels dry after voice use.' },
  { id: 16, factor: 'physical_discomfort', text: 'I have pain in my neck at the end of the day.' },
  { id: 17, factor: 'physical_discomfort', text: 'I feel tension in my throat after talking.' },
  { id: 18, factor: 'physical_discomfort', text: 'I have a tight feeling around my throat.' },
  { id: 19, factor: 'physical_discomfort', text: 'I experience headaches associated with voice use.' },
  { id: 20, factor: 'physical_discomfort', text: 'My throat muscles feel stiff.' },

  // ─── Factor 3: Improvement with rest (9 items) ────────────────
  // NOTE: Higher scores here = MORE improvement with rest (positive)
  { id: 21, factor: 'rest_recovery', text: 'My voice improves with rest.' },
  { id: 22, factor: 'rest_recovery', text: 'A short break from talking helps my voice.' },
  { id: 23, factor: 'rest_recovery', text: 'My voice is better in the morning after a good night\'s sleep.' },
  { id: 24, factor: 'rest_recovery', text: 'My voice recovers after I stop talking for a while.' },
  { id: 25, factor: 'rest_recovery', text: 'Vocal rest over the weekend improves my voice.' },
  { id: 26, factor: 'rest_recovery', text: 'My voice is better on days I don\'t have to talk as much.' },
  { id: 27, factor: 'rest_recovery', text: 'I notice my voice is stronger after a vacation.' },
  { id: 28, factor: 'rest_recovery', text: 'Drinking water helps reduce my voice symptoms.' },
  { id: 29, factor: 'rest_recovery', text: 'My voice symptoms go away when I rest.' },
];

export const VFI_SCALE_OPTIONS = [
  { value: 0, label: 'Never' },
  { value: 1, label: 'Almost never' },
  { value: 2, label: 'Sometimes' },
  { value: 3, label: 'Almost always' },
  { value: 4, label: 'Always' },
] as const;

export const VFI_FACTOR_LABELS = {
  fatigue: 'Tiredness & avoidance',
  physical_discomfort: 'Physical discomfort',
  rest_recovery: 'Recovery with rest',
} as const;

/**
 * VFI Severity Interpretation
 * Based on clinical use: higher Factor 1+2 = worse; higher Factor 3 = better recovery
 * Total = Factor1 + Factor2 (fatigue burden), Factor 3 reported separately
 */
export function rateVFI(fatigueScore: number, physicalScore: number): 'minimal' | 'mild' | 'moderate' | 'severe' {
  const burden = fatigueScore + physicalScore; // 0-80
  if (burden <= 15) return 'minimal';
  if (burden <= 30) return 'mild';
  if (burden <= 50) return 'moderate';
  return 'severe';
}
