import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { TherapyExercise } from '../../types';
import { useStore } from '../../store/useStore';
import { THERAPY_EXERCISES } from '../../data/therapyExercises';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RING_SIZE = SCREEN_WIDTH * 0.55;
const STROKE_WIDTH = 12;

const CATEGORY_COLORS: Record<string, string> = {
  sovt: colors.primary,
  vfe: colors.primaryDark,
  rvt: colors.primaryDeep,
  relaxation: '#26A69A',
  breathing: '#42A5F5',
  cooldown: '#78909C',
};

const CATEGORY_LABELS: Record<string, string> = {
  sovt: 'SOVT Exercise',
  vfe: 'Vocal Function Exercise',
  rvt: 'Resonant Voice Therapy',
  relaxation: 'Relaxation',
  breathing: 'Breathing Exercise',
  cooldown: 'Cool-down',
};

type Phase = 'ready' | 'active' | 'rest' | 'done';

export default function ExercisePlayerScreen({ route, navigation }: any) {
  const { exerciseId } = route.params;
  const exercise = THERAPY_EXERCISES.find(e => e.id === exerciseId) || THERAPY_EXERCISES[0];
  const { completeExercise, currentPlan } = useStore();
  const catColor = CATEGORY_COLORS[exercise.category] || colors.primary;

  const [phase, setPhase] = useState<Phase>('ready');
  const [currentRep, setCurrentRep] = useState(1);
  const [timeLeft, setTimeLeft] = useState(exercise.durationSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade in on mount
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Pulse animation when active
  useEffect(() => {
    if (phase === 'active' && !isPaused) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
    pulseAnim.setValue(1);
  }, [phase, isPaused]);

  // Timer logic
  useEffect(() => {
    if (phase === 'active' && !isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleRepComplete();
            return 0;
          }
          // Haptic tick at 3, 2, 1
          if (prev <= 4) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [phase, isPaused, timeLeft]);

  const handleRepComplete = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    if (currentRep >= exercise.repetitions) {
      // All reps done
      setPhase('done');
    } else {
      // Rest between reps
      setPhase('rest');
      setCurrentRep((r) => r + 1);
      setTimeout(() => {
        setTimeLeft(exercise.durationSeconds);
        setPhase('active');
      }, 3000); // 3s rest between reps
    }
  }, [currentRep, exercise]);

  const startExercise = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setPhase('active');
    setTimeLeft(exercise.durationSeconds);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handleDone = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    completeExercise(exercise.id);
    navigation.goBack();
  };

  // Timer ring progress
  const totalTime = exercise.durationSeconds;
  const progress = phase === 'active' ? (totalTime - timeLeft) / totalTime : phase === 'done' ? 1 : 0;
  const radius = (RING_SIZE - STROKE_WIDTH) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}`;
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <View style={[styles.catPill, { backgroundColor: catColor + '18' }]}>
            <Text style={[styles.catPillText, { color: catColor }]}>
              {CATEGORY_LABELS[exercise.category] || exercise.category}
            </Text>
          </View>
          <View style={{ width: 28 }} />
        </View>

        {/* Exercise name */}
        <Text style={styles.exerciseName}>{exercise.name}</Text>
        <Text style={styles.repIndicator}>
          {phase === 'done'
            ? 'Complete!'
            : phase === 'rest'
            ? 'Rest...'
            : `Rep ${currentRep} of ${exercise.repetitions}`}
        </Text>

        {/* Timer Ring */}
        <Animated.View style={[styles.ringContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Svg width={RING_SIZE} height={RING_SIZE} style={styles.ringSvg}>
            <Circle
              cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={radius}
              stroke={colors.lightGray} strokeWidth={STROKE_WIDTH}
              fill="transparent"
            />
            <Circle
              cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={radius}
              stroke={phase === 'done' ? colors.primary : phase === 'rest' ? colors.warning : catColor}
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
            />
          </Svg>
          <View style={styles.ringCenter}>
            {phase === 'ready' && (
              <>
                <Text style={styles.ringBigText}>{formatTime(exercise.durationSeconds)}</Text>
                <Text style={styles.ringSubText}>per rep</Text>
              </>
            )}
            {phase === 'active' && (
              <>
                <Text style={[styles.ringBigText, { color: catColor }]}>{formatTime(timeLeft)}</Text>
                <Text style={styles.ringSubText}>{isPaused ? 'Paused' : 'Remaining'}</Text>
              </>
            )}
            {phase === 'rest' && (
              <>
                <Text style={[styles.ringBigText, { color: colors.warning }]}>Rest</Text>
                <Text style={styles.ringSubText}>Next rep starting...</Text>
              </>
            )}
            {phase === 'done' && (
              <>
                <Text style={[styles.ringBigText, { color: colors.primary, fontSize: 36 }]}>Done!</Text>
                <Text style={styles.ringSubText}>{exercise.repetitions} reps completed</Text>
              </>
            )}
          </View>
        </Animated.View>

        {/* Instructions carousel */}
        <View style={styles.instructionCard}>
          <View style={styles.instructionHeader}>
            <Text style={styles.instructionLabel}>
              Step {currentStep + 1} of {exercise.instructions.length}
            </Text>
            <View style={styles.stepDots}>
              {exercise.instructions.map((_, i) => (
                <View key={i} style={[styles.stepDot, i === currentStep && { backgroundColor: catColor }]} />
              ))}
            </View>
          </View>
          <Text style={styles.instructionText}>
            {exercise.instructions[currentStep]}
          </Text>
          <View style={styles.stepNav}>
            {currentStep > 0 && (
              <TouchableOpacity onPress={() => setCurrentStep(currentStep - 1)}>
                <Text style={[styles.stepNavBtn, { color: catColor }]}>‹ Previous</Text>
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }} />
            {currentStep < exercise.instructions.length - 1 && (
              <TouchableOpacity onPress={() => setCurrentStep(currentStep + 1)}>
                <Text style={[styles.stepNavBtn, { color: catColor }]}>Next ›</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          {phase === 'ready' && (
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: catColor }]} onPress={startExercise} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Start exercise</Text>
            </TouchableOpacity>
          )}
          {phase === 'active' && (
            <View style={styles.activeActions}>
              <TouchableOpacity style={styles.pauseBtn} onPress={togglePause} activeOpacity={0.85}>
                <Text style={[styles.pauseBtnText, { color: catColor }]}>{isPaused ? 'Resume' : 'Pause'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.skipBtn, { backgroundColor: catColor }]}
                onPress={() => {
                  if (timerRef.current) clearInterval(timerRef.current);
                  handleRepComplete();
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.skipBtnText}>
                  {currentRep >= exercise.repetitions ? 'Finish' : 'Next rep ›'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {phase === 'done' && (
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={handleDone} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Mark complete</Text>
            </TouchableOpacity>
          )}
        </View>

      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  container: { flex: 1, padding: spacing.xl },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  closeText: { fontSize: 22, color: colors.lightText, fontWeight: '300' },
  catPill: {
    paddingHorizontal: 12, paddingVertical: 4, borderRadius: borderRadius.pill,
  },
  catPillText: { fontSize: 12, fontWeight: '600' },

  // Title
  exerciseName: {
    fontSize: 24, fontWeight: '700', color: colors.black,
    textAlign: 'center', marginBottom: 4,
  },
  repIndicator: {
    fontSize: 14, color: colors.gray, textAlign: 'center',
    marginBottom: spacing.lg,
  },

  // Ring
  ringContainer: {
    alignSelf: 'center', alignItems: 'center', justifyContent: 'center',
    width: RING_SIZE, height: RING_SIZE, marginBottom: spacing.xl,
  },
  ringSvg: { position: 'absolute' },
  ringCenter: { alignItems: 'center' },
  ringBigText: { fontSize: 44, fontWeight: '700', color: colors.black },
  ringSubText: { fontSize: 13, color: colors.lightText, marginTop: 2 },

  // Instructions
  instructionCard: {
    backgroundColor: colors.offWhite, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.xl, flex: 1, maxHeight: 160,
  },
  instructionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  instructionLabel: { fontSize: 11, color: colors.lightText, fontWeight: '500' },
  stepDots: { flexDirection: 'row', gap: 4 },
  stepDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: colors.lightGray,
  },
  instructionText: {
    fontSize: 15, color: colors.darkSlate, lineHeight: 22, flex: 1,
  },
  stepNav: { flexDirection: 'row', marginTop: spacing.sm },
  stepNavBtn: { fontSize: 13, fontWeight: '600' },

  // Actions
  actions: { paddingBottom: spacing.md },
  primaryBtn: {
    borderRadius: borderRadius.pill, paddingVertical: 18, alignItems: 'center',
  },
  primaryBtnText: { fontSize: 17, fontWeight: '600', color: colors.white },
  activeActions: {
    flexDirection: 'row', gap: spacing.md,
  },
  pauseBtn: {
    flex: 1, borderRadius: borderRadius.pill, paddingVertical: 16,
    alignItems: 'center', borderWidth: 1.5, borderColor: colors.lightGray,
  },
  pauseBtnText: { fontSize: 15, fontWeight: '600' },
  skipBtn: {
    flex: 1, borderRadius: borderRadius.pill, paddingVertical: 16,
    alignItems: 'center',
  },
  skipBtnText: { fontSize: 15, fontWeight: '600', color: colors.white },
});
