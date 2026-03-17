/**
 * VocalFit Type Definitions
 * Complete data model for voice assessment, therapy, and monitoring
 */

// ─── User Profile ───────────────────────────────────────────────
export type Gender = 'male' | 'female' | 'other';
export type Profession = 'teacher' | 'faculty' | 'medical' | 'vocal_coach' | 'other';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  profession: Profession;
  professionOther?: string;
  dailySpeakingHours: number;
  vocalDemands: 'low' | 'moderate' | 'high' | 'extreme';
  medicalHistory: MedicalHistory;
  createdAt: string;
}

export interface MedicalHistory {
  acidReflux: boolean;
  smoking: boolean;
  allergies: boolean;
  asthma: boolean;
  thyroidDisorder: boolean;
  previousVocalSurgery: boolean;
  hearingLoss: boolean;
  notes: string;
}

// ─── Assessment ─────────────────────────────────────────────────
export interface AssessmentSession {
  id: string;
  date: string;
  aerodynamic: AerodynamicResults;
  acoustic: AcousticResults;
  perceptual: GRBASResults;
  vhi?: VHIResults;
  vfi?: VFIResults;
  vocalFitnessScore: number;
  interpretation: ScoreInterpretation;
}

export interface AerodynamicResults {
  mptSeconds: number;       // Maximum Phonation Time
  mptRating: NormRating;
  sSeconds: number;         // Sustained /s/
  zSeconds: number;         // Sustained /z/
  szRatio: number;
  szRating: NormRating;
}

export interface AcousticResults {
  fundamentalFrequency: number;  // F0 in Hz
  f0Rating: NormRating;
  jitterPercent: number;
  jitterRating: NormRating;
  shimmerPercent: number;
  shimmerRating: NormRating;
  hnrDb: number;                 // Harmonics-to-Noise Ratio
  hnrRating: NormRating;
}

export interface GRBASResults {
  grade: number;       // 0-3
  roughness: number;   // 0-3
  breathiness: number; // 0-3
  asthenia: number;    // 0-3
  strain: number;      // 0-3
  totalScore: number;  // Sum 0-15
}

export interface VHIResults {
  functional: number;    // 0-40
  physical: number;      // 0-40
  emotional: number;     // 0-40
  totalScore: number;    // 0-120
  severity: 'minimal' | 'mild' | 'moderate' | 'severe';
}

// ─── Vocal Fatigue Index (Nanjundeswaran et al., 2015) ─────────
export interface VFIResults {
  fatigue: number;            // Factor 1: Tiredness of voice & avoidance (0-44, 11 items)
  physicalDiscomfort: number; // Factor 2: Physical discomfort (0-36, 9 items)
  restRecovery: number;       // Factor 3: Improvement with rest (0-36, 9 items — reverse scored)
  totalScore: number;         // 0-116
  severity: 'minimal' | 'mild' | 'moderate' | 'severe';
}


export type NormRating = 'normal' | 'mild' | 'moderate' | 'severe';

export interface ScoreInterpretation {
  overallRating: 'excellent' | 'good' | 'fair' | 'poor';
  primaryConcerns: string[];
  recommendations: string[];
}

// ─── Therapy ────────────────────────────────────────────────────
export type TherapyCategory =
  | 'sovt'
  | 'vfe'
  | 'rvt'
  | 'relaxation'
  | 'breathing'
  | 'cooldown';

export interface TherapyExercise {
  id: string;
  name: string;
  category: TherapyCategory;
  description: string;
  instructions: string[];
  durationSeconds: number;
  repetitions: number;
  indicatedFor: string[];   // e.g., ['high_strain', 'muscle_tension']
}

export interface TherapyPlan {
  id: string;
  date: string;
  exercises: TherapyPlanItem[];
  completedCount: number;
}

export interface TherapyPlanItem {
  exercise: TherapyExercise;
  order: number;
  completed: boolean;
  completedAt?: string;
}

// ─── Daily Hygiene ──────────────────────────────────────────────
export interface DailyHygieneLog {
  date: string;
  waterGlasses: number;
  waterGoal: number;
  habits: HabitCheckItem[];
  streakDays: number;
}

export interface HabitCheckItem {
  id: string;
  label: string;
  completed: boolean;
}

// ─── Normative Data ─────────────────────────────────────────────
export interface NormativeRange {
  male: { min: number; max: number };
  female: { min: number; max: number };
}
