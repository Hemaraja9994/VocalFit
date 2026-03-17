import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../utils/theme';
import { MetricCard } from '../components/common/MetricCard';
import { ProgressRing } from '../components/common/ProgressRing';
import { useStore } from '../store/useStore';
import { DEFAULT_HYGIENE_HABITS, WATER_GOAL } from '../data/hygieneDefaults';

export default function DashboardScreen() {
  const { todayLog, setTodayLog, toggleHabit, addWater, assessments, currentPlan } = useStore();

  // Initialize today's log with clean slate (zero values)
  useEffect(() => {
    if (!todayLog) {
      setTodayLog({
        date: new Date().toISOString().split('T')[0],
        waterGlasses: 0,
        waterGoal: WATER_GOAL,
        habits: DEFAULT_HYGIENE_HABITS.map((h) => ({
          ...h,
          completed: false,
        })),
        streakDays: 0,
      });
    }
  }, []);

  // Get latest assessment data (if any)
  const latestAssessment = assessments.length > 0 ? assessments[assessments.length - 1] : null;
  const mptValue = latestAssessment?.aerodynamic?.mptSeconds ?? null;
  const szValue = latestAssessment?.aerodynamic?.szRatio ?? null;
  const vfiData = latestAssessment?.vfi ?? null;
  const fitnessScore = latestAssessment?.vocalFitnessScore ?? null;

  // Therapy progress from store
  const therapyTotal = currentPlan?.exercises.length ?? 0;
  const therapyDone = currentPlan?.completedCount ?? 0;
  const therapyProgress = therapyTotal > 0 ? therapyDone / therapyTotal : 0;

  // VFI calculations from actual data
  const vfiFatigue = vfiData?.fatigue ?? 0;
  const vfiDiscomfort = vfiData?.physicalDiscomfort ?? 0;
  const vfiRecovery = vfiData?.restRecovery ?? 0;
  const fatigueBurden = vfiFatigue + vfiDiscomfort;
  const fatiguePct = fatigueBurden > 0 ? ((fatigueBurden / 80) * 100) : 0;
  const fatigueSeverity = fatigueBurden < 15 ? 'Minimal' : fatigueBurden < 25 ? 'Mild' : fatigueBurden < 40 ? 'Moderate' : 'Severe';

  const completedHabits = todayLog?.habits.filter((h) => h.completed).length ?? 0;
  const totalHabits = todayLog?.habits.length ?? 1;
  const waterProgress = (todayLog?.waterGlasses ?? 0) / WATER_GOAL;

  const hasAssessment = latestAssessment !== null;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.title}>Your vocal health</Text>
        </View>

        {/* Hero Card — Vocal Fitness Score */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroDecor1} />
          <View style={styles.heroDecor2} />
          <Text style={styles.heroLabel}>VOCAL FITNESS SCORE</Text>
          <View style={styles.heroScoreRow}>
            <Text style={styles.heroScore}>{fitnessScore ?? '—'}</Text>
            {fitnessScore !== null && <Text style={styles.heroMax}>/100</Text>}
          </View>
          <Text style={styles.heroDelta}>
            {hasAssessment
              ? `Based on ${assessments.length} assessment${assessments.length > 1 ? 's' : ''}`
              : 'Complete an assessment to see your score'}
          </Text>
        </LinearGradient>

        {/* Metric Grid */}
        <View style={styles.metricGrid}>
          <MetricCard
            label="MPT"
            value={mptValue !== null ? `${mptValue}` : '—'}
            unit={mptValue !== null ? 's' : ''}
            statusText={mptValue !== null ? 'Measured' : 'Not yet recorded'}
            statusColor={mptValue !== null ? colors.primary : colors.lightText}
          />
          <MetricCard
            label="S/Z RATIO"
            value={szValue !== null ? `${szValue}` : '—'}
            statusText={szValue !== null ? 'Measured' : 'Not yet recorded'}
            statusColor={szValue !== null ? colors.primary : colors.lightText}
          />
          <MetricCard
            label="HYDRATION"
            value={`${todayLog?.waterGlasses ?? 0}`}
            unit={`/${WATER_GOAL}`}
            statusText={waterProgress >= 1 ? 'Goal met!' : waterProgress > 0 ? 'Keep going' : 'Start drinking'}
            statusColor={waterProgress >= 1 ? colors.primary : colors.warning}
          />
          <MetricCard
            label="STREAK"
            value={`${todayLog?.streakDays ?? 0}`}
            unit="days"
            statusText={todayLog?.streakDays ? 'Keep it up!' : 'Start your streak'}
            statusColor={colors.primary}
          />
        </View>

        {/* Water Tracker */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Water intake</Text>
            <TouchableOpacity onPress={addWater} style={styles.addWaterBtn}>
              <Text style={styles.addWaterText}>+ Add glass</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.waterRow}>
            {Array.from({ length: WATER_GOAL }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.waterDot,
                  i < (todayLog?.waterGlasses ?? 0) && styles.waterDotFilled,
                ]}
              />
            ))}
          </View>
          <Text style={styles.waterLabel}>
            {todayLog?.waterGlasses ?? 0} of {WATER_GOAL} glasses today
          </Text>
        </View>

        {/* Daily Hygiene Habits */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's vocal hygiene</Text>
            <Text style={styles.sectionBadge}>
              {completedHabits}/{totalHabits}
            </Text>
          </View>
          {todayLog?.habits.map((habit) => (
            <TouchableOpacity
              key={habit.id}
              style={styles.habitRow}
              onPress={() => toggleHabit(habit.id)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.checkbox,
                habit.completed && styles.checkboxChecked,
              ]}>
                {habit.completed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[
                styles.habitText,
                habit.completed && styles.habitTextDone,
              ]}>
                {habit.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Therapy Progress */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Today's therapy</Text>
          <View style={styles.therapyProgress}>
            <ProgressRing
              progress={therapyProgress}
              size={80}
              strokeWidth={8}
              value={therapyTotal > 0 ? `${therapyDone}/${therapyTotal}` : '0'}
              label="exercises"
            />
            <View style={styles.therapyInfo}>
              <Text style={styles.therapyInfoTitle}>
                {therapyTotal === 0
                  ? 'No plan yet'
                  : therapyDone === therapyTotal
                  ? 'All done!'
                  : 'Keep going!'}
              </Text>
              <Text style={styles.therapyInfoSubtitle}>
                {therapyTotal === 0
                  ? 'Complete an assessment to generate your therapy plan'
                  : therapyDone === therapyTotal
                  ? 'Great job completing your vocal workout today'
                  : `${therapyTotal - therapyDone} more exercise${therapyTotal - therapyDone > 1 ? 's' : ''} to complete today's vocal workout`}
              </Text>
            </View>
          </View>
        </View>

        {/* Vocal Fatigue Monitor */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vocal fatigue monitor</Text>
            <View style={styles.vfiBadge}>
              <Text style={styles.vfiBadgeText}>VFI</Text>
            </View>
          </View>
          {!hasAssessment || !vfiData ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Complete the VFI questionnaire in your assessment to see fatigue metrics here.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.vfiRow}>
                <View style={styles.vfiItem}>
                  <View style={[styles.vfiDot, { backgroundColor: '#EF6C00' }]} />
                  <Text style={styles.vfiLabel}>Tiredness</Text>
                  <Text style={[styles.vfiValue, { color: '#EF6C00' }]}>{vfiFatigue}/44</Text>
                </View>
                <View style={styles.vfiItem}>
                  <View style={[styles.vfiDot, { backgroundColor: '#E53935' }]} />
                  <Text style={styles.vfiLabel}>Discomfort</Text>
                  <Text style={[styles.vfiValue, { color: '#E53935' }]}>{vfiDiscomfort}/36</Text>
                </View>
                <View style={styles.vfiItem}>
                  <View style={[styles.vfiDot, { backgroundColor: '#43A047' }]} />
                  <Text style={styles.vfiLabel}>Recovery</Text>
                  <Text style={[styles.vfiValue, { color: '#43A047' }]}>{vfiRecovery}/36</Text>
                </View>
              </View>
              <View style={styles.vfiBurdenRow}>
                <Text style={styles.vfiBurdenLabel}>Fatigue burden</Text>
                <Text style={styles.vfiBurdenValue}>{fatigueBurden}/80 — {fatigueSeverity}</Text>
              </View>
              <View style={styles.vfiBarTrack}>
                <View style={[styles.vfiBarFill, { width: `${fatiguePct.toFixed(1)}%` as any }]} />
              </View>
              <Text style={styles.vfiTip}>
                {fatigueSeverity === 'Minimal'
                  ? 'Your fatigue levels are minimal. Great vocal health!'
                  : fatigueSeverity === 'Mild'
                  ? 'Mild fatigue detected. Keep up your vocal rest habits.'
                  : fatigueSeverity === 'Moderate'
                  ? 'Moderate fatigue. Consider more vocal rest and hydration.'
                  : 'High fatigue burden. Please consult your voice pathologist.'}
              </Text>
            </>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    paddingTop: spacing.md,
  },
  header: {
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 2,
  },
  title: {
    ...typography.largeTitle,
  },

  // Hero card
  heroCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    marginBottom: spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  heroDecor1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  heroDecor2: {
    position: 'absolute',
    bottom: -30,
    right: 30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  heroScoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  heroScore: {
    ...typography.bigMetric,
  },
  heroMax: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 4,
  },
  heroDelta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing.sm,
  },

  // Metrics
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },

  // Section card
  sectionCard: {
    backgroundColor: colors.offWhite,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.black,
  },
  sectionBadge: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.primaryDeep,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },

  // Water
  addWaterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.pill,
  },
  addWaterText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  waterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.sm,
  },
  waterDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.lightGray,
  },
  waterDotFilled: {
    backgroundColor: colors.primary,
  },
  waterLabel: {
    fontSize: 12,
    color: colors.gray,
  },

  // Habits
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.placeholder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '700',
  },
  habitText: {
    fontSize: 14,
    color: colors.black,
    flex: 1,
  },
  habitTextDone: {
    color: colors.gray,
    textDecorationLine: 'line-through',
  },

  // Therapy
  therapyProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  therapyInfo: {
    flex: 1,
  },
  therapyInfoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  therapyInfoSubtitle: {
    fontSize: 13,
    color: colors.gray,
    lineHeight: 18,
  },

  // Empty state
  emptyState: {
    paddingVertical: spacing.md,
  },
  emptyStateText: {
    fontSize: 13,
    color: colors.lightText,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 19,
  },

  // VFI Monitor
  vfiBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  vfiBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EF6C00',
  },
  vfiRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  vfiItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  vfiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  vfiLabel: {
    fontSize: 10,
    color: colors.gray,
  },
  vfiValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  vfiBurdenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  vfiBurdenLabel: {
    fontSize: 12,
    color: colors.gray,
  },
  vfiBurdenValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF6C00',
  },
  vfiBarTrack: {
    height: 6,
    backgroundColor: '#FFF3E0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  vfiBarFill: {
    height: '100%',
    backgroundColor: '#EF6C00',
    borderRadius: 3,
  },
  vfiTip: {
    fontSize: 12,
    color: colors.gray,
    fontStyle: 'italic',
  },
});
