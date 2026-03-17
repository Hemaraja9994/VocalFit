import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../utils/theme';
import { useStore } from '../store/useStore';
import { THERAPY_EXERCISES } from '../data/therapyExercises';
import { TherapyPlanItem } from '../types';
import { ProgressRing } from '../components/common/ProgressRing';

const CATEGORY_LABELS: Record<string, string> = {
  sovt: 'SOVT', vfe: 'Vocal function', rvt: 'Resonant voice',
  relaxation: 'Relaxation', breathing: 'Breathing', cooldown: 'Cool-down',
};

const CATEGORY_COLORS: Record<string, string> = {
  sovt: colors.primary, vfe: colors.primaryDark, rvt: colors.primaryDeep,
  relaxation: '#26A69A', breathing: '#42A5F5', cooldown: '#78909C',
};

export default function TherapyHubScreen({ navigation }: any) {
  const { currentPlan, setTherapyPlan, completeExercise } = useStore();

  // Initialize sample plan if none exists
  useEffect(() => {
    if (!currentPlan) {
      const planExercises: TherapyPlanItem[] = [
        THERAPY_EXERCISES[0],   // Lip trill
        THERAPY_EXERCISES[8],   // Yawn-sigh
        THERAPY_EXERCISES[10],  // Resonant voice basic
        THERAPY_EXERCISES[3],   // VFE warm-up
        THERAPY_EXERCISES[13],  // Diaphragmatic breathing
      ].map((exercise, index) => ({
        exercise,
        order: index + 1,
        completed: false,
      }));

      setTherapyPlan({
        id: 'today',
        date: new Date().toISOString().split('T')[0],
        exercises: planExercises,
        completedCount: 0,
      });
    }
  }, []);

  const total = currentPlan?.exercises.length ?? 0;
  const done = currentPlan?.completedCount ?? 0;
  const progress = total > 0 ? done / total : 0;
  const allDone = done === total && total > 0;

  // Navigate to next uncompleted exercise
  const getNextExercise = (): TherapyPlanItem | null => {
    if (!currentPlan) return null;
    return currentPlan.exercises.find((e) => !e.completed) || null;
  };

  const handleExercisePress = (item: TherapyPlanItem) => {
    if (item.completed) return;
    navigation.navigate('ExercisePlayer', {
      exerciseId: item.exercise.id,
    });
  };

  const handleStartWorkout = () => {
    const next = getNextExercise();
    if (next) handleExercisePress(next);
  };

  // Total duration
  const totalDuration = currentPlan?.exercises.reduce(
    (sum, e) => sum + e.exercise.durationSeconds * e.exercise.repetitions, 0
  ) ?? 0;
  const totalMinutes = Math.round(totalDuration / 60);

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Therapy program</Text>
          <Text style={styles.subtitle}>Your personalized vocal workout</Text>
        </View>

        {/* Progress Hero */}
        <View style={styles.progressHero}>
          <ProgressRing
            progress={progress}
            size={100}
            strokeWidth={10}
            color={allDone ? colors.primary : colors.primaryDark}
            value={allDone ? '✓' : `${done}/${total}`}
            label={allDone ? 'Complete' : 'exercises'}
          />
          <View style={styles.progressInfo}>
            <Text style={styles.progressTitle}>
              {allDone ? 'Workout complete!' : `${total - done} exercises left`}
            </Text>
            <Text style={styles.progressSubtitle}>
              {allDone
                ? 'Great job taking care of your voice today.'
                : `About ${Math.round((totalMinutes * (1 - progress)))} min remaining`}
            </Text>
            {!allDone && (
              <TouchableOpacity style={styles.startBtn} onPress={handleStartWorkout} activeOpacity={0.85}>
                <Text style={styles.startBtnText}>
                  {done === 0 ? 'Start workout' : 'Continue workout'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Exercise List */}
        <Text style={styles.sectionLabel}>TODAY'S EXERCISES</Text>
        <View style={styles.exerciseList}>
          {currentPlan?.exercises.map((item, index) => {
            const isNext = !item.completed && (index === 0 || currentPlan.exercises[index - 1]?.completed);
            const catColor = CATEGORY_COLORS[item.exercise.category] || colors.primary;

            return (
              <TouchableOpacity
                key={item.exercise.id}
                style={[
                  styles.exerciseCard,
                  isNext && styles.exerciseCardActive,
                  item.completed && styles.exerciseCardDone,
                ]}
                onPress={() => handleExercisePress(item)}
                activeOpacity={item.completed ? 1 : 0.7}
                disabled={item.completed}
              >
                <View style={styles.exerciseTop}>
                  {/* Number / Check */}
                  <View style={[
                    styles.exerciseNumber,
                    item.completed && { backgroundColor: colors.primary },
                    isNext && { backgroundColor: catColor },
                    !item.completed && !isNext && { backgroundColor: colors.lightGray },
                  ]}>
                    {item.completed ? (
                      <Text style={styles.exerciseCheckmark}>✓</Text>
                    ) : (
                      <Text style={[
                        styles.exerciseNumText,
                        !isNext && { color: colors.lightText },
                      ]}>{item.order}</Text>
                    )}
                  </View>

                  {/* Info */}
                  <View style={styles.exerciseInfo}>
                    <Text style={[
                      styles.exerciseName,
                      item.completed && styles.exerciseNameDone,
                    ]}>{item.exercise.name}</Text>
                    <Text style={styles.exerciseDesc}>{item.exercise.description.slice(0, 60)}...</Text>
                  </View>

                  {/* Status */}
                  <View style={styles.exerciseRight}>
                    {item.completed && <Text style={styles.statusDone}>Done</Text>}
                    {isNext && <Text style={[styles.statusNext, { color: catColor }]}>Start ›</Text>}
                    {!item.completed && !isNext && <Text style={styles.statusPending}>Locked</Text>}
                  </View>
                </View>

                {/* Meta row */}
                <View style={styles.exerciseMeta}>
                  <View style={[styles.categoryPill, { backgroundColor: catColor + '15' }]}>
                    <Text style={[styles.categoryPillText, { color: catColor }]}>
                      {CATEGORY_LABELS[item.exercise.category]}
                    </Text>
                  </View>
                  <Text style={styles.exerciseDuration}>
                    {item.exercise.durationSeconds}s · {item.exercise.repetitions} reps
                  </Text>
                </View>

                {/* Instructions preview */}
                {isNext && (
                  <View style={styles.previewBox}>
                    <Text style={styles.previewTitle}>First step:</Text>
                    <Text style={styles.previewText}>{item.exercise.instructions[0]}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How exercises are chosen</Text>
          <Text style={styles.infoBody}>
            Your therapy plan is generated from your latest vocal assessment.
            Exercises target your specific areas of concern using evidence-based
            techniques including SOVT, VFE, and Resonant Voice Therapy.
            Complete an assessment in the Assessment tab to generate a fresh plan.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  scrollView: { flex: 1 },
  content: { padding: spacing.xl, paddingTop: spacing.md },
  header: { marginBottom: spacing.xl },
  title: { ...typography.largeTitle, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.gray },

  // Progress hero
  progressHero: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.lg,
    backgroundColor: colors.offWhite, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.xl,
  },
  progressInfo: { flex: 1 },
  progressTitle: { fontSize: 17, fontWeight: '600', color: colors.black, marginBottom: 4 },
  progressSubtitle: { fontSize: 13, color: colors.gray, marginBottom: spacing.md },
  startBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.pill,
    paddingVertical: 10, paddingHorizontal: 20, alignSelf: 'flex-start',
  },
  startBtnText: { fontSize: 14, fontWeight: '600', color: colors.white },

  // Section
  sectionLabel: {
    fontSize: 11, fontWeight: '600', color: colors.lightText,
    letterSpacing: 0.5, marginBottom: spacing.md,
  },

  // Exercise list
  exerciseList: { gap: spacing.md, marginBottom: spacing.xxl },
  exerciseCard: {
    backgroundColor: colors.offWhite, borderRadius: borderRadius.lg,
    padding: spacing.lg, borderWidth: 1.5, borderColor: 'transparent',
  },
  exerciseCardActive: {
    backgroundColor: colors.white, borderColor: colors.primary,
  },
  exerciseCardDone: { opacity: 0.7 },
  exerciseTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  exerciseNumber: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  exerciseNumText: { fontSize: 14, fontWeight: '600', color: colors.white },
  exerciseCheckmark: { fontSize: 14, fontWeight: '700', color: colors.white },
  exerciseInfo: { flex: 1 },
  exerciseName: { fontSize: 15, fontWeight: '500', color: colors.black },
  exerciseNameDone: { textDecorationLine: 'line-through', color: colors.gray },
  exerciseDesc: { fontSize: 12, color: colors.lightText, marginTop: 2 },
  exerciseRight: { marginLeft: spacing.sm },
  statusDone: { fontSize: 11, fontWeight: '600', color: colors.primary },
  statusNext: { fontSize: 12, fontWeight: '600' },
  statusPending: { fontSize: 11, fontWeight: '500', color: colors.placeholder },
  exerciseMeta: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginTop: spacing.sm, marginLeft: 48,
  },
  categoryPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: borderRadius.pill },
  categoryPillText: { fontSize: 11, fontWeight: '500' },
  exerciseDuration: { fontSize: 11, color: colors.lightText },

  // Preview
  previewBox: {
    marginTop: spacing.md, marginLeft: 48,
    backgroundColor: colors.offWhite, borderRadius: borderRadius.sm,
    padding: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.primary,
  },
  previewTitle: { fontSize: 10, fontWeight: '600', color: colors.lightText, marginBottom: 3 },
  previewText: { fontSize: 13, color: colors.darkSlate, lineHeight: 18 },

  // Info
  infoCard: { backgroundColor: colors.offWhite, borderRadius: borderRadius.lg, padding: spacing.lg },
  infoTitle: { fontSize: 14, fontWeight: '600', color: colors.black, marginBottom: spacing.sm },
  infoBody: { fontSize: 13, color: colors.gray, lineHeight: 19 },
});
