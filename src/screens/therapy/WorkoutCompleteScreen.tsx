import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { useStore } from '../../store/useStore';

export default function WorkoutCompleteScreen({ navigation }: any) {
  const { currentPlan } = useStore();
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  const totalExercises = currentPlan?.exercises.length ?? 0;
  const totalDuration = currentPlan?.exercises.reduce(
    (sum, e) => sum + e.exercise.durationSeconds * e.exercise.repetitions, 0
  ) ?? 0;
  const totalMinutes = Math.round(totalDuration / 60);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.timing(confettiAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.container}>
        {/* Celebration */}
        <Animated.View style={[styles.celebration, {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }]}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
          <Text style={styles.title}>Workout complete!</Text>
          <Text style={styles.subtitle}>Great job taking care of your voice today</Text>
        </Animated.View>

        {/* Stats */}
        <Animated.View style={[styles.statsCard, { opacity: confettiAnim }]}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalExercises}</Text>
              <Text style={styles.statLabel}>Exercises</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalMinutes}</Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {currentPlan?.exercises.reduce((sum, e) => sum + e.exercise.repetitions, 0) ?? 0}
              </Text>
              <Text style={styles.statLabel}>Total reps</Text>
            </View>
          </View>
        </Animated.View>

        {/* Exercises completed */}
        <Animated.View style={[styles.exerciseList, { opacity: confettiAnim }]}>
          {currentPlan?.exercises.map((item) => (
            <View key={item.exercise.id} style={styles.exerciseRow}>
              <View style={styles.exerciseDone}>
                <Text style={styles.exerciseDoneCheck}>✓</Text>
              </View>
              <Text style={styles.exerciseName}>{item.exercise.name}</Text>
              <Text style={styles.exerciseReps}>{item.exercise.repetitions} reps</Text>
            </View>
          ))}
        </Animated.View>

        {/* Motivational tip */}
        <Animated.View style={[styles.tipCard, { opacity: confettiAnim }]}>
          <Text style={styles.tipText}>
            Consistent vocal exercises build vocal endurance and reduce fatigue over time.
            Try to complete your workout every day for best results!
          </Text>
        </Animated.View>

        {/* Action */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('TherapyHub')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Back to therapy</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  container: { flex: 1, padding: spacing.xl },

  celebration: { alignItems: 'center', marginTop: spacing.xxl, marginBottom: spacing.xxl },
  checkCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  checkMark: { fontSize: 36, fontWeight: '700', color: colors.white },
  title: { ...typography.largeTitle, textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 15, color: colors.gray, textAlign: 'center' },

  statsCard: {
    backgroundColor: colors.offWhite, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.xl,
  },
  statRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700', color: colors.primary },
  statLabel: { fontSize: 11, color: colors.lightText, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: colors.lightGray },

  exerciseList: { gap: spacing.sm, marginBottom: spacing.xl },
  exerciseRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  exerciseDone: {
    width: 24, height: 24, borderRadius: 7,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  exerciseDoneCheck: { fontSize: 12, fontWeight: '700', color: colors.white },
  exerciseName: { flex: 1, fontSize: 14, color: colors.black },
  exerciseReps: { fontSize: 12, color: colors.lightText },

  tipCard: {
    backgroundColor: '#F0FFF0', borderRadius: borderRadius.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: '#C8E6C9',
    marginBottom: spacing.xl,
  },
  tipText: { fontSize: 13, color: colors.primaryDeep, lineHeight: 19, fontStyle: 'italic' },

  actions: { marginTop: 'auto' as any, paddingBottom: spacing.md },
  primaryBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.pill,
    paddingVertical: 18, alignItems: 'center',
  },
  primaryBtnText: { fontSize: 17, fontWeight: '600', color: colors.white },
});
