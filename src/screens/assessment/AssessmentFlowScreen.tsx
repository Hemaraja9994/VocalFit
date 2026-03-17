import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { useStore } from '../../store/useStore';

const FLOW_STEPS = [
  { id: 'MPT', label: 'MPT', desc: 'Maximum phonation time', required: true },
  { id: 'SZRatio', label: 'S/Z', desc: 'S/Z ratio', required: true },
  { id: 'GRBAS', label: 'GRBAS', desc: 'Perceptual self-rating', required: true },
  { id: 'VHI', label: 'VHI', desc: 'Voice Handicap Index', required: false },
  { id: 'VFI', label: 'VFI', desc: 'Vocal Fatigue Index', required: false },
  { id: 'Report', label: 'Report', desc: 'View your results', required: true },
];

export default function AssessmentFlowScreen({ navigation }: any) {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [currentStep, setCurrentStep] = useState(0);

  // Start a new assessment session in the store when flow begins
  React.useEffect(() => {
    const store = useStore.getState();
    if (!store.currentAssessment) {
      store.startAssessment();
    }
  }, []);

  const markComplete = (stepId: string) => {
    setCompletedSteps((prev) => new Set([...prev, stepId]));
  };

  const handleStepPress = (step: typeof FLOW_STEPS[0], index: number) => {
    if (step.id === 'Report') {
      // Navigate to report
      navigation.navigate('Report');
      return;
    }
    setCurrentStep(index);
    navigation.navigate(step.id);
  };

  const handleNext = () => {
    const step = FLOW_STEPS[currentStep];
    markComplete(step.id);

    if (currentStep < FLOW_STEPS.length - 1) {
      const nextStep = FLOW_STEPS[currentStep + 1];
      setCurrentStep(currentStep + 1);

      if (!nextStep.required) {
        // Optional step — ask
        Alert.alert(
          nextStep.label,
          `${nextStep.desc} is optional. Would you like to complete it now?`,
          [
            { text: 'Skip', onPress: () => skipToNext(currentStep + 1) },
            { text: 'Yes', onPress: () => navigation.navigate(nextStep.id) },
          ]
        );
      } else {
        navigation.navigate(nextStep.id);
      }
    }
  };

  const skipToNext = (fromIndex: number) => {
    const nextRequired = FLOW_STEPS.findIndex((s, i) => i > fromIndex && s.required);
    if (nextRequired >= 0) {
      setCurrentStep(nextRequired);
      navigation.navigate(FLOW_STEPS[nextRequired].id);
    }
  };

  const requiredComplete = FLOW_STEPS
    .filter((s) => s.required && s.id !== 'Report')
    .every((s) => completedSteps.has(s.id));

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Full assessment</Text>
        <Text style={styles.subtitle}>Complete each step to generate your vocal health report</Text>
      </View>

      <View style={styles.body}>
        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {FLOW_STEPS.map((step, i) => (
            <View key={step.id} style={styles.dotItem}>
              <View style={[
                styles.dot,
                completedSteps.has(step.id) && styles.dotDone,
                i === currentStep && !completedSteps.has(step.id) && styles.dotCurrent,
              ]}>
                {completedSteps.has(step.id) ? (
                  <Text style={styles.dotCheck}>✓</Text>
                ) : (
                  <Text style={[
                    styles.dotNum,
                    i === currentStep && styles.dotNumCurrent,
                  ]}>{i + 1}</Text>
                )}
              </View>
              <Text style={[
                styles.dotLabel,
                i === currentStep && styles.dotLabelCurrent,
              ]}>{step.label}</Text>
              {!step.required && <Text style={styles.optionalTag}>optional</Text>}
            </View>
          ))}
        </View>

        {/* Step cards */}
        <View style={styles.stepList}>
          {FLOW_STEPS.map((step, i) => {
            const isDone = completedSteps.has(step.id);
            const isCurrent = i === currentStep && !isDone;
            const isLocked = i > currentStep && !isDone;
            const isReport = step.id === 'Report';

            return (
              <TouchableOpacity
                key={step.id}
                style={[
                  styles.stepCard,
                  isDone && styles.stepCardDone,
                  isCurrent && styles.stepCardCurrent,
                  isReport && requiredComplete && styles.stepCardReport,
                ]}
                onPress={() => {
                  if (isReport && !requiredComplete) {
                    Alert.alert('Complete required steps', 'Please finish MPT, S/Z ratio, and GRBAS before viewing the report.');
                    return;
                  }
                  handleStepPress(step, i);
                }}
                activeOpacity={0.7}
                disabled={isLocked && !isReport}
              >
                <View style={[
                  styles.stepNum,
                  isDone && styles.stepNumDone,
                  isCurrent && styles.stepNumCurrent,
                  isReport && requiredComplete && styles.stepNumReport,
                ]}>
                  {isDone ? (
                    <Text style={styles.stepCheckText}>✓</Text>
                  ) : (
                    <Text style={[
                      styles.stepNumText,
                      isCurrent && styles.stepNumTextCurrent,
                      isReport && requiredComplete && styles.stepNumTextReport,
                    ]}>{isReport ? '★' : i + 1}</Text>
                  )}
                </View>
                <View style={styles.stepInfo}>
                  <View style={styles.stepRow}>
                    <Text style={[
                      styles.stepName,
                      isDone && styles.stepNameDone,
                    ]}>{step.desc}</Text>
                    {!step.required && (
                      <View style={styles.optionalPill}>
                        <Text style={styles.optionalPillText}>Optional</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.stepStatus}>
                    {isDone ? 'Completed' : isCurrent ? 'Tap to begin' : isReport ? (requiredComplete ? 'Ready to view' : 'Complete steps above') : 'Upcoming'}
                  </Text>
                </View>
                <Text style={styles.stepChevron}>›</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quick action */}
        {currentStep < FLOW_STEPS.length - 1 && (
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => handleStepPress(FLOW_STEPS[currentStep], currentStep)}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>
              {completedSteps.size === 0 ? 'Begin assessment' : `Continue: ${FLOW_STEPS[currentStep].desc}`}
            </Text>
          </TouchableOpacity>
        )}
        {requiredComplete && (
          <TouchableOpacity
            style={[styles.continueBtn, { backgroundColor: '#2E7D32' }]}
            onPress={() => navigation.navigate('Report')}
            activeOpacity={0.85}
          >
            <Text style={styles.continueBtnText}>View vocal health report</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  header: { padding: spacing.xl, paddingBottom: spacing.md },
  backBtn: { marginBottom: spacing.sm },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '500' },
  title: { ...typography.largeTitle, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.gray },
  body: { flex: 1, padding: spacing.xl, paddingTop: spacing.md },

  // Dots
  dotsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: spacing.xxl, paddingHorizontal: spacing.xs,
  },
  dotItem: { alignItems: 'center', gap: 4 },
  dot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.lightGray, alignItems: 'center', justifyContent: 'center',
  },
  dotDone: { backgroundColor: colors.primary },
  dotCurrent: { backgroundColor: colors.white, borderWidth: 2, borderColor: colors.primary },
  dotCheck: { fontSize: 14, fontWeight: '700', color: colors.white },
  dotNum: { fontSize: 13, fontWeight: '600', color: colors.lightText },
  dotNumCurrent: { color: colors.primary },
  dotLabel: { fontSize: 9, color: colors.lightText },
  dotLabelCurrent: { color: colors.primary, fontWeight: '600' },
  optionalTag: { fontSize: 7, color: colors.lightText },

  // Steps
  stepList: { gap: spacing.sm, marginBottom: spacing.xl },
  stepCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.offWhite, borderRadius: borderRadius.lg,
    padding: spacing.lg, borderWidth: 1.5, borderColor: 'transparent',
  },
  stepCardDone: { backgroundColor: '#F0FFF0', borderColor: '#C8E6C9' },
  stepCardCurrent: { backgroundColor: colors.white, borderColor: colors.primary },
  stepCardReport: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
  stepNum: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.lightGray, alignItems: 'center', justifyContent: 'center',
  },
  stepNumDone: { backgroundColor: colors.primary },
  stepNumCurrent: { backgroundColor: colors.primary },
  stepNumReport: { backgroundColor: '#2E7D32' },
  stepCheckText: { fontSize: 14, fontWeight: '700', color: colors.white },
  stepNumText: { fontSize: 14, fontWeight: '600', color: colors.lightText },
  stepNumTextCurrent: { color: colors.white },
  stepNumTextReport: { color: colors.white },
  stepInfo: { flex: 1 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  stepName: { fontSize: 14, fontWeight: '500', color: colors.black },
  stepNameDone: { color: colors.primaryDeep },
  optionalPill: {
    backgroundColor: '#FFF3E0', paddingHorizontal: 6, paddingVertical: 1,
    borderRadius: borderRadius.pill,
  },
  optionalPillText: { fontSize: 9, color: '#EF6C00', fontWeight: '500' },
  stepStatus: { fontSize: 11, color: colors.lightText, marginTop: 2 },
  stepChevron: { fontSize: 20, color: colors.lightText },

  // Continue
  continueBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.pill,
    paddingVertical: 16, alignItems: 'center', marginBottom: spacing.md,
  },
  continueBtnText: { fontSize: 16, fontWeight: '600', color: colors.white },
});
