/**
 * VocalFit Normative Data
 *
 * Sources:
 * - MPT norms: Ptacek & Sander (1963); Boone et al. (2010)
 * - F0 norms: Baken & Orlikoff (2000); Titze (1994)
 * - Jitter/Shimmer/HNR: Teixeira et al. (2013); Boersma & Weenink (Praat manual)
 * - VHI: Jacobson et al. (1997)
 * - GRBAS: Hirano (1981)
 * - s/z ratio: Eckel & Boone (1981)
 */

import { Gender, NormRating } from '../types';

// ─── Maximum Phonation Time (seconds) ──────────────────────────
export const MPT_NORMS = {
  male:   { normal: { min: 25, max: 35 }, mild: { min: 15, max: 24 }, moderate: { min: 10, max: 14 } },
  female: { normal: { min: 15, max: 25 }, mild: { min: 10, max: 14 }, moderate: { min: 7, max: 9 } },
} as const;

export function rateMPT(seconds: number, gender: Gender): NormRating {
  const norms = gender === 'male' ? MPT_NORMS.male : MPT_NORMS.female;
  if (seconds >= norms.normal.min) return 'normal';
  if (seconds >= norms.mild.min) return 'mild';
  if (seconds >= norms.moderate.min) return 'moderate';
  return 'severe';
}

// ─── s/z Ratio ──────────────────────────────────────────────────
// Normal: 0.9 – 1.1. Above 1.4 suggests laryngeal pathology
export function rateSZRatio(ratio: number): NormRating {
  if (ratio >= 0.9 && ratio <= 1.1) return 'normal';
  if (ratio > 1.1 && ratio <= 1.4) return 'mild';
  if (ratio > 1.4 && ratio <= 1.8) return 'moderate';
  return 'severe';
}

// ─── Fundamental Frequency (Hz) ─────────────────────────────────
export const F0_NORMS = {
  male:   { min: 85,  max: 155 },
  female: { min: 165, max: 255 },
} as const;

export function rateF0(hz: number, gender: Gender): NormRating {
  const norms = gender === 'male' ? F0_NORMS.male : F0_NORMS.female;
  if (hz >= norms.min && hz <= norms.max) return 'normal';
  const distance = hz < norms.min ? norms.min - hz : hz - norms.max;
  const range = norms.max - norms.min;
  if (distance <= range * 0.3) return 'mild';
  if (distance <= range * 0.6) return 'moderate';
  return 'severe';
}

// ─── Jitter (%) ─────────────────────────────────────────────────
// Normal < 1.04% (Teixeira et al., 2013)
export function rateJitter(percent: number): NormRating {
  if (percent <= 1.04) return 'normal';
  if (percent <= 2.0) return 'mild';
  if (percent <= 3.5) return 'moderate';
  return 'severe';
}

// ─── Shimmer (%) ────────────────────────────────────────────────
// Normal < 3.81% (Teixeira et al., 2013)
export function rateShimmer(percent: number): NormRating {
  if (percent <= 3.81) return 'normal';
  if (percent <= 6.0) return 'mild';
  if (percent <= 10.0) return 'moderate';
  return 'severe';
}

// ─── Harmonics-to-Noise Ratio (dB) ─────────────────────────────
// Normal > 20 dB (Boersma & Weenink)
export function rateHNR(db: number): NormRating {
  if (db >= 20) return 'normal';
  if (db >= 15) return 'mild';
  if (db >= 10) return 'moderate';
  return 'severe';
}

// ─── VHI Severity Cutoffs (Jacobson et al., 1997) ──────────────
export function rateVHI(totalScore: number): 'minimal' | 'mild' | 'moderate' | 'severe' {
  if (totalScore <= 14) return 'minimal';
  if (totalScore <= 28) return 'mild';
  if (totalScore <= 56) return 'moderate';
  return 'severe';
}

// ─── GRBAS (Hirano, 1981) ──────────────────────────────────────
// Each parameter: 0 = normal, 1 = slight, 2 = moderate, 3 = severe
export const GRBAS_LABELS = {
  grade: 'Grade (overall severity)',
  roughness: 'Roughness (irregular vocal fold vibration)',
  breathiness: 'Breathiness (air escape during phonation)',
  asthenia: 'Asthenia (weakness of voice)',
  strain: 'Strain (hyperfunctional effort)',
} as const;

export const GRBAS_SCALE_LABELS = ['Normal', 'Slight', 'Moderate', 'Severe'] as const;

// ─── Vocal Fitness Score Calculator ─────────────────────────────
// Composite 0–100 score weighted across all domains
export function calculateVocalFitnessScore(params: {
  mptRating: NormRating;
  szRating: NormRating;
  f0Rating: NormRating;
  jitterRating: NormRating;
  shimmerRating: NormRating;
  hnrRating: NormRating;
  grbasTotal: number;    // 0–15
  vhiTotal?: number;     // 0–120
}): number {
  const ratingToScore = (r: NormRating): number => {
    switch (r) {
      case 'normal': return 100;
      case 'mild': return 70;
      case 'moderate': return 40;
      case 'severe': return 10;
    }
  };

  // Weights: aerodynamic 25%, acoustic 35%, perceptual 25%, VHI 15%
  const aeroScore = (ratingToScore(params.mptRating) + ratingToScore(params.szRating)) / 2;
  const acousticScore = (
    ratingToScore(params.f0Rating) +
    ratingToScore(params.jitterRating) +
    ratingToScore(params.shimmerRating) +
    ratingToScore(params.hnrRating)
  ) / 4;
  const grbasScore = Math.max(0, 100 - (params.grbasTotal / 15) * 100);

  let totalWeight = 0.25 + 0.35 + 0.25;
  let weighted = aeroScore * 0.25 + acousticScore * 0.35 + grbasScore * 0.25;

  if (params.vhiTotal !== undefined) {
    const vhiScore = Math.max(0, 100 - (params.vhiTotal / 120) * 100);
    weighted += vhiScore * 0.15;
    totalWeight += 0.15;
  }

  return Math.round(weighted / totalWeight);
}

// ─── Rating color helper ────────────────────────────────────────
export function getRatingColor(rating: NormRating): string {
  switch (rating) {
    case 'normal': return '#A4D65E';
    case 'mild': return '#FBBF24';
    case 'moderate': return '#F97316';
    case 'severe': return '#EF4444';
  }
}

export function getRatingLabel(rating: NormRating): string {
  switch (rating) {
    case 'normal': return 'Normal range';
    case 'mild': return 'Mildly deviant';
    case 'moderate': return 'Moderately deviant';
    case 'severe': return 'Severely deviant';
  }
}
