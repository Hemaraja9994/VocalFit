/**
 * VocalFit Therapy Exercise Library
 *
 * Based on established voice therapy approaches:
 * - Semi-Occluded Vocal Tract (SOVT): Titze (2006)
 * - Vocal Function Exercises: Stemple et al. (1994)
 * - Resonant Voice Therapy: Verdolini (2000)
 * - Circumlaryngeal Massage: Roy et al. (1993)
 * - Yawn-Sigh: Boone (1971)
 */

import { TherapyExercise } from '../types';

export const THERAPY_EXERCISES: TherapyExercise[] = [
  // ─── SOVT Exercises ──────────────────────────────────────────
  {
    id: 'sovt_lip_trill',
    name: 'Lip trill',
    category: 'sovt',
    description: 'Vibrate lips while phonating to balance airflow and reduce vocal fold collision force.',
    instructions: [
      'Relax your face and shoulders.',
      'Take a comfortable breath.',
      'Blow air through closed lips to create a "brr" vibration.',
      'Add voice — glide up and down your pitch range.',
      'Sustain for 5–8 seconds per repetition.',
    ],
    durationSeconds: 60,
    repetitions: 10,
    indicatedFor: ['high_strain', 'muscle_tension', 'vocal_fatigue', 'warmup'],
  },
  {
    id: 'sovt_straw',
    name: 'Straw phonation',
    category: 'sovt',
    description: 'Phonating through a narrow straw creates back-pressure that optimizes vocal fold vibration.',
    instructions: [
      'Use a small-diameter stirring straw (or narrow cocktail straw).',
      'Place the straw between your lips.',
      'Hum or sustain /u/ through the straw at a comfortable pitch.',
      'Feel the vibration in your lips and cheeks.',
      'Glide slowly up and down in pitch.',
    ],
    durationSeconds: 90,
    repetitions: 8,
    indicatedFor: ['high_strain', 'muscle_tension', 'poor_glottal_closure', 'warmup'],
  },
  {
    id: 'sovt_humming',
    name: 'Nasal humming',
    category: 'sovt',
    description: 'Sustained humming on /m/ to achieve easy, forward-focused phonation.',
    instructions: [
      'Close your lips gently.',
      'Take a diaphragmatic breath.',
      'Hum on /m/ at a comfortable pitch.',
      'Feel vibration on your lips and nose.',
      'Sustain each hum for 5–8 seconds.',
    ],
    durationSeconds: 60,
    repetitions: 8,
    indicatedFor: ['muscle_tension', 'warmup', 'poor_resonance'],
  },

  // ─── Vocal Function Exercises ────────────────────────────────
  {
    id: 'vfe_warmup',
    name: 'VFE: warm-up',
    category: 'vfe',
    description: 'Sustain /i/ ("ee") as long as possible on the musical note F above middle C (females) or F below middle C (males).',
    instructions: [
      'Sit or stand with good posture.',
      'Take a deep diaphragmatic breath.',
      'Sustain "ee" as softly as possible.',
      'Focus on a forward, resonant placement.',
      'Hold for as long as you can — aim to match your MPT.',
    ],
    durationSeconds: 30,
    repetitions: 2,
    indicatedFor: ['poor_glottal_closure', 'vocal_fatigue', 'breathiness', 'warmup'],
  },
  {
    id: 'vfe_stretching',
    name: 'VFE: stretching',
    category: 'vfe',
    description: 'Glide from your lowest to your highest note on the word "knoll" without a voice break.',
    instructions: [
      'Begin at your lowest comfortable pitch.',
      'Say "knoll" and glide upward as high as possible.',
      'Keep volume soft and even.',
      'Try not to break into falsetto — stretch gently.',
      'This stretches the vocal folds for flexibility.',
    ],
    durationSeconds: 15,
    repetitions: 2,
    indicatedFor: ['poor_glottal_closure', 'limited_range', 'stiffness'],
  },
  {
    id: 'vfe_contracting',
    name: 'VFE: contracting',
    category: 'vfe',
    description: 'Glide from highest to lowest pitch on the word "knoll."',
    instructions: [
      'Start at your highest comfortable pitch.',
      'Glide downward on "knoll" to your lowest note.',
      'Maintain soft, steady airflow.',
      'This contracts and strengthens the vocal folds.',
    ],
    durationSeconds: 15,
    repetitions: 2,
    indicatedFor: ['poor_glottal_closure', 'breathiness', 'weak_voice'],
  },
  {
    id: 'vfe_power',
    name: 'VFE: power exercise',
    category: 'vfe',
    description: 'Sustain musical notes (C-D-E-F-G) for as long as possible on "knoll" (old method) or /o/.',
    instructions: [
      'Sustain the note C on "ol" (as in "old").',
      'Hold as long as possible with steady airflow.',
      'Repeat on D, E, F, and G.',
      'Aim for maximum duration without strain.',
    ],
    durationSeconds: 20,
    repetitions: 5,
    indicatedFor: ['poor_glottal_closure', 'breathiness', 'vocal_endurance'],
  },

  // ─── Resonant Voice Therapy ──────────────────────────────────
  {
    id: 'rvt_basic',
    name: 'Resonant voice: basic hum',
    category: 'rvt',
    description: 'Produce an easy, humming tone focusing on anterior vibrations (lips, alveolar ridge).',
    instructions: [
      'Gently close your lips.',
      'Produce a soft hum at a comfortable pitch.',
      'Place your finger on your upper lip — you should feel buzzing.',
      'Adjust until the sensation is strongest on your lips/nose.',
      'This is your "resonant voice."',
    ],
    durationSeconds: 60,
    repetitions: 6,
    indicatedFor: ['poor_glottal_closure', 'breathiness', 'muscle_tension'],
  },
  {
    id: 'rvt_chant',
    name: 'Resonant voice: chant talk',
    category: 'rvt',
    description: 'Speak in a chanting, sing-song pattern maintaining the resonant buzz.',
    instructions: [
      'Start with a basic hum.',
      'Transition to "mmm-hmm" (like agreeing).',
      'Progress to "mmm-one, mmm-two, mmm-three" etc.',
      'Maintain the buzzy, forward sensation throughout.',
      'Gradually transition to normal conversational speech.',
    ],
    durationSeconds: 120,
    repetitions: 4,
    indicatedFor: ['poor_glottal_closure', 'breathiness', 'voice_projection'],
  },

  // ─── Relaxation Techniques ───────────────────────────────────
  {
    id: 'relax_yawn_sigh',
    name: 'Yawn-sigh',
    category: 'relaxation',
    description: 'Imitate a yawn then sigh on a descending pitch to lower the larynx and release tension.',
    instructions: [
      'Open your mouth as if starting a big yawn.',
      'Feel your larynx descend and throat open.',
      'At the peak of the yawn, add voice.',
      'Sigh gently on a descending pitch: "haaa..."',
      'Let the sound fade naturally. Do not push.',
    ],
    durationSeconds: 10,
    repetitions: 10,
    indicatedFor: ['high_strain', 'muscle_tension', 'elevated_pitch'],
  },
  {
    id: 'relax_clm',
    name: 'Circumlaryngeal massage',
    category: 'relaxation',
    description: 'Self-massage of the extrinsic laryngeal muscles to reduce musculoskeletal tension.',
    instructions: [
      'Locate the hyoid bone (above the Adam\'s apple).',
      'Using thumb and forefinger, gently massage in circular motions.',
      'Work along the superior border of the thyroid cartilage.',
      'Apply gentle downward pressure — never push hard.',
      'Hum or phonate softly during the massage.',
      'Note: If you feel pain, stop and consult your voice pathologist.',
    ],
    durationSeconds: 120,
    repetitions: 1,
    indicatedFor: ['high_strain', 'muscle_tension', 'elevated_larynx'],
  },
  {
    id: 'relax_head_neck',
    name: 'Head and neck stretches',
    category: 'relaxation',
    description: 'Gentle stretching of neck and shoulder muscles to release tension that affects voice.',
    instructions: [
      'Slowly tilt your head to the right — hold 10 seconds.',
      'Return to center. Tilt left — hold 10 seconds.',
      'Drop your chin to your chest — hold 10 seconds.',
      'Roll your shoulders backward 5 times.',
      'Roll your shoulders forward 5 times.',
    ],
    durationSeconds: 60,
    repetitions: 2,
    indicatedFor: ['muscle_tension', 'warmup', 'vocal_fatigue'],
  },

  // ─── Breathing ───────────────────────────────────────────────
  {
    id: 'breath_diaphragmatic',
    name: 'Diaphragmatic breathing',
    category: 'breathing',
    description: 'Deep abdominal breathing to establish proper breath support for phonation.',
    instructions: [
      'Place one hand on your chest, the other on your abdomen.',
      'Inhale slowly through your nose for 4 counts.',
      'Your abdomen should rise; your chest should stay relatively still.',
      'Exhale slowly through pursed lips for 6 counts.',
      'The goal: effortless, low-belly breathing.',
    ],
    durationSeconds: 180,
    repetitions: 10,
    indicatedFor: ['breathiness', 'poor_breath_support', 'warmup', 'cooldown'],
  },
  {
    id: 'breath_sustained',
    name: 'Sustained exhalation',
    category: 'breathing',
    description: 'Progressively lengthen exhalation to improve breath support and airflow control.',
    instructions: [
      'Inhale for 4 counts.',
      'Exhale on a sustained /s/ for as long as possible.',
      'Rest. Inhale for 4 counts.',
      'Exhale on a sustained /z/ for as long as possible.',
      'Try to make /s/ and /z/ durations equal (s/z = 1.0).',
    ],
    durationSeconds: 60,
    repetitions: 5,
    indicatedFor: ['poor_breath_support', 'breathiness', 'short_mpt'],
  },
];

// ─── Therapy Recommendation Engine ─────────────────────────────
export function getRecommendedExercises(concerns: string[]): TherapyExercise[] {
  if (concerns.length === 0) {
    // Default healthy voice maintenance plan
    return THERAPY_EXERCISES.filter(e =>
      e.indicatedFor.includes('warmup') || e.indicatedFor.includes('cooldown')
    );
  }

  const recommended = new Set<string>();

  for (const concern of concerns) {
    for (const exercise of THERAPY_EXERCISES) {
      if (exercise.indicatedFor.includes(concern)) {
        recommended.add(exercise.id);
      }
    }
  }

  return THERAPY_EXERCISES.filter(e => recommended.has(e.id));
}

// Category ordering for a well-structured therapy session
const CATEGORY_ORDER: Record<string, number> = {
  breathing: 0,
  relaxation: 1,
  sovt: 2,
  rvt: 3,
  vfe: 4,
  cooldown: 5,
};

/**
 * Build a structured therapy plan from concerns.
 * Orders exercises: breathing warm-up → relaxation → SOVT → RVT → VFE → cool-down
 * Caps plan at maxExercises to keep sessions manageable.
 */
export function buildTherapyPlan(concerns: string[], maxExercises: number = 6): TherapyExercise[] {
  const exercises = getRecommendedExercises(concerns);

  // Sort by category order
  const sorted = [...exercises].sort((a, b) => {
    const oa = CATEGORY_ORDER[a.category] ?? 3;
    const ob = CATEGORY_ORDER[b.category] ?? 3;
    return oa - ob;
  });

  // Always ensure we have a warm-up (breathing) and cool-down
  const hasBreathing = sorted.some(e => e.category === 'breathing');
  const hasCooldown = sorted.some(e => e.indicatedFor.includes('cooldown'));

  let plan = sorted.slice(0, maxExercises);

  if (!hasBreathing) {
    const breathEx = THERAPY_EXERCISES.find(e => e.id === 'breath_diaphragmatic');
    if (breathEx) plan = [breathEx, ...plan.slice(0, maxExercises - 1)];
  }
  if (!hasCooldown && plan.length < maxExercises) {
    const coolEx = THERAPY_EXERCISES.find(e => e.id === 'breath_diaphragmatic');
    if (coolEx && !plan.find(e => e.id === coolEx.id)) plan.push(coolEx);
  }

  return plan;
}

// Map assessment results to therapy concerns — now includes VFI
export function assessmentToConcerns(params: {
  grbasStrain: number;
  grbasBreathiness: number;
  grbasRoughness: number;
  grbasAsthenia: number;
  mptRating: string;
  szRating: string;
  vfiFatigue?: number;       // Factor 1 score
  vfiDiscomfort?: number;    // Factor 2 score
  vfiRecovery?: number;      // Factor 3 score
  vhiTotal?: number;
}): string[] {
  const concerns: string[] = [];

  // GRBAS-driven
  if (params.grbasStrain >= 2) concerns.push('high_strain', 'muscle_tension');
  if (params.grbasBreathiness >= 2) concerns.push('breathiness', 'poor_glottal_closure');
  if (params.grbasRoughness >= 2) concerns.push('roughness');
  if (params.grbasAsthenia >= 2) concerns.push('weak_voice', 'poor_breath_support');

  // Aerodynamic-driven
  if (params.mptRating === 'moderate' || params.mptRating === 'severe') {
    concerns.push('short_mpt', 'poor_breath_support');
  }
  if (params.szRating !== 'normal') concerns.push('poor_glottal_closure');

  // VFI-driven (new)
  if (params.vfiFatigue !== undefined && params.vfiFatigue >= 22) {
    concerns.push('vocal_fatigue', 'muscle_tension');
  }
  if (params.vfiDiscomfort !== undefined && params.vfiDiscomfort >= 18) {
    concerns.push('muscle_tension', 'high_strain', 'elevated_larynx');
  }
  if (params.vfiRecovery !== undefined && params.vfiRecovery < 18) {
    // Poor recovery — needs more rest-focused exercises
    concerns.push('poor_breath_support', 'cooldown');
  }

  // VHI-driven
  if (params.vhiTotal !== undefined && params.vhiTotal > 56) {
    concerns.push('voice_projection', 'vocal_fatigue');
  }

  // Always include warmup
  concerns.push('warmup');

  return [...new Set(concerns)];
}
