/**
 * VocalFit Global Store (Zustand)
 */

import { create } from 'zustand';
import {
  UserProfile,
  AssessmentSession,
  TherapyPlan,
  DailyHygieneLog,
  GRBASResults,
  AerodynamicResults,
  AcousticResults,
  VHIResults,
  VFIResults,
} from '../types';

interface AppState {
  // User
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  isOnboarded: boolean;
  setOnboarded: (val: boolean) => void;

  // Assessments
  assessments: AssessmentSession[];
  currentAssessment: Partial<AssessmentSession> | null;
  startAssessment: () => void;
  updateAerodynamic: (data: AerodynamicResults) => void;
  updateAcoustic: (data: AcousticResults) => void;
  updatePerceptual: (data: GRBASResults) => void;
  updateVHI: (data: VHIResults) => void;
  updateVFI: (data: VFIResults) => void;
  saveAssessment: (session: AssessmentSession) => void;

  // Therapy
  currentPlan: TherapyPlan | null;
  setTherapyPlan: (plan: TherapyPlan) => void;
  completeExercise: (exerciseId: string) => void;

  // Hygiene
  todayLog: DailyHygieneLog | null;
  setTodayLog: (log: DailyHygieneLog) => void;
  toggleHabit: (habitId: string) => void;
  addWater: () => void;
  streakDays: number;
}

export const useStore = create<AppState>((set, get) => ({
  // ─── User ─────────────────────────────────────────────────────
  user: null,
  setUser: (user) => set({ user }),
  updateUser: (updates) => set((s) => ({
    user: s.user ? { ...s.user, ...updates } : null,
  })),
  isOnboarded: false,
  setOnboarded: (val) => set({ isOnboarded: val }),

  // ─── Assessments ──────────────────────────────────────────────
  assessments: [],
  currentAssessment: null,
  startAssessment: () => set({ currentAssessment: { id: Date.now().toString(), date: new Date().toISOString() } }),
  updateAerodynamic: (data) => set((s) => ({
    currentAssessment: { ...s.currentAssessment, aerodynamic: data },
  })),
  updateAcoustic: (data) => set((s) => ({
    currentAssessment: { ...s.currentAssessment, acoustic: data },
  })),
  updatePerceptual: (data) => set((s) => ({
    currentAssessment: { ...s.currentAssessment, perceptual: data },
  })),
  updateVHI: (data) => set((s) => ({
    currentAssessment: { ...s.currentAssessment, vhi: data },
  })),
  updateVFI: (data) => set((s) => ({
    currentAssessment: { ...s.currentAssessment, vfi: data },
  })),
  saveAssessment: (session) => set((s) => ({
    assessments: [...s.assessments, session],
    currentAssessment: null,
  })),

  // ─── Therapy ──────────────────────────────────────────────────
  currentPlan: null,
  setTherapyPlan: (plan) => set({ currentPlan: plan }),
  completeExercise: (exerciseId) => set((s) => {
    if (!s.currentPlan) return {};
    const exercises = s.currentPlan.exercises.map((item) =>
      item.exercise.id === exerciseId
        ? { ...item, completed: true, completedAt: new Date().toISOString() }
        : item
    );
    return {
      currentPlan: {
        ...s.currentPlan,
        exercises,
        completedCount: exercises.filter((e) => e.completed).length,
      },
    };
  }),

  // ─── Hygiene ──────────────────────────────────────────────────
  todayLog: null,
  setTodayLog: (log) => set({ todayLog: log }),
  toggleHabit: (habitId) => set((s) => {
    if (!s.todayLog) return {};
    return {
      todayLog: {
        ...s.todayLog,
        habits: s.todayLog.habits.map((h) =>
          h.id === habitId ? { ...h, completed: !h.completed } : h
        ),
      },
    };
  }),
  addWater: () => set((s) => {
    if (!s.todayLog) return {};
    return {
      todayLog: {
        ...s.todayLog,
        waterGlasses: Math.min(s.todayLog.waterGlasses + 1, 12),
      },
    };
  }),
  streakDays: 0,
}));
