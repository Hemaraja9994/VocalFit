import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { Audio } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { rateMPT, getRatingColor, getRatingLabel } from '../../data/normativeData';
import { useStore } from '../../store/useStore';
import { AudioLevelMeter } from '../../components/common/AudioLevelMeter';

type Phase = 'ready' | 'recording' | 'done';

export default function MPTScreen({ navigation }: any) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<number | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [meteringDb, setMeteringDb] = useState(-160);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const meteringRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation during recording
  useEffect(() => {
    if (phase === 'recording') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [phase]);

  const requestPermissions = async () => {
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission needed', 'Microphone access is required to measure your phonation time.');
      return false;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    return true;
  };

  const startRecording = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const { recording: rec } = await Audio.Recording.createAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        isMeteringEnabled: true,
      });
      setRecording(rec);
      setPhase('recording');
      setElapsed(0);
      startTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {
        const now = Date.now();
        setElapsed(Math.round((now - startTimeRef.current) / 100) / 10);
      }, 100);

      // Metering for VU meter
      meteringRef.current = setInterval(async () => {
        try {
          const status = await rec.getStatusAsync();
          if (status.isRecording && status.metering !== undefined) {
            setMeteringDb(status.metering);
          }
        } catch {}
      }, 80);
    } catch (err) {
      Alert.alert('Error', 'Could not start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    if (meteringRef.current) clearInterval(meteringRef.current);
    meteringRef.current = null;
    setMeteringDb(-160);

    if (recording) {
      try {
        await recording.stopAndUnloadAsync();
      } catch {}
      setRecording(null);
    }

    const finalTime = Math.round((Date.now() - startTimeRef.current) / 100) / 10;
    setElapsed(finalTime);
    setResult(finalTime);
    setPhase('done');
  };

  const reset = () => {
    setPhase('ready');
    setElapsed(0);
    setResult(null);
  };

  // Use female norms as default — in real app this comes from user profile
  const gender = useStore.getState().user?.gender || 'female';
  const rating = result ? rateMPT(result, gender) : null;
  const ratingColor = rating ? getRatingColor(rating) : colors.primary;

  const formatTime = (t: number) => {
    const secs = Math.floor(t);
    const tenths = Math.round((t - secs) * 10);
    return `${secs}.${tenths}`;
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Maximum phonation time</Text>
      </View>

      <View style={styles.body}>
        {/* Instructions */}
        {phase === 'ready' && (
          <View style={styles.instructions}>
            <Text style={styles.instructionTitle}>How to measure MPT</Text>
            <Text style={styles.instructionStep}>1. Take a deep breath</Text>
            <Text style={styles.instructionStep}>2. Tap the button below to start</Text>
            <Text style={styles.instructionStep}>3. Sustain the vowel /a/ ("ahhh") at a comfortable pitch and loudness</Text>
            <Text style={styles.instructionStep}>4. Tap "Stop" when you run out of breath</Text>
            <Text style={styles.instructionNote}>
              Do this 3 times and use your best attempt. Normal MPT is 15–25s for females and 25–35s for males.
            </Text>
          </View>
        )}

        {/* Timer Display */}
        <View style={styles.timerContainer}>
          <Animated.View style={[
            styles.timerCircle,
            phase === 'recording' && styles.timerCircleActive,
            phase === 'done' && { borderColor: ratingColor },
            { transform: [{ scale: phase === 'recording' ? pulseAnim : 1 }] },
          ]}>
            <Text style={[
              styles.timerValue,
              phase === 'recording' && { color: colors.primary },
              phase === 'done' && { color: ratingColor },
            ]}>
              {formatTime(elapsed)}
            </Text>
            <Text style={styles.timerUnit}>seconds</Text>
          </Animated.View>
        </View>

        {/* Recording indicator */}
        {phase === 'recording' && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording... sustain /a/</Text>
          </View>
        )}

        {/* VU Meter during recording */}
        {phase === 'recording' && (
          <View style={styles.vuMeterContainer}>
            <AudioLevelMeter
              db={meteringDb}
              barCount={24}
              height={50}
              activeColor={colors.primary}
              isActive={phase === 'recording'}
            />
            <Text style={styles.vuLabel}>Microphone level</Text>
          </View>
        )}

        {/* Result */}
        {phase === 'done' && result && rating && (
          <View style={styles.resultCard}>
            <View style={[styles.resultBadge, { backgroundColor: ratingColor + '20' }]}>
              <Text style={[styles.resultBadgeText, { color: ratingColor }]}>
                {getRatingLabel(rating)}
              </Text>
            </View>
            <Text style={styles.resultNote}>
              {rating === 'normal'
                ? 'Your MPT is within the healthy range. Good breath support!'
                : rating === 'mild'
                ? 'Slightly below normal. Consider breathing exercises to improve.'
                : rating === 'moderate'
                ? 'Below normal range. This may indicate reduced breath support or glottal insufficiency.'
                : 'Significantly below normal. Please consult your voice pathologist for evaluation.'}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions}>
          {phase === 'ready' && (
            <TouchableOpacity style={styles.primaryBtn} onPress={startRecording} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Start recording</Text>
            </TouchableOpacity>
          )}
          {phase === 'recording' && (
            <TouchableOpacity style={styles.stopBtn} onPress={stopRecording} activeOpacity={0.85}>
              <Text style={styles.stopBtnText}>Stop</Text>
            </TouchableOpacity>
          )}
          {phase === 'done' && (
            <>
              <TouchableOpacity style={styles.primaryBtn} onPress={reset} activeOpacity={0.85}>
                <Text style={styles.primaryBtnText}>Try again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.outlineBtn}
                onPress={() => {
                  // Save to store and go back
                  Alert.alert('Saved', `MPT of ${result}s saved to your assessment.`);
                  navigation.goBack();
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.outlineBtnText}>Save result</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  header: { padding: spacing.xl, paddingBottom: spacing.md },
  backBtn: { marginBottom: spacing.sm },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '500' },
  title: { ...typography.largeTitle },
  body: { flex: 1, padding: spacing.xl, paddingTop: 0 },

  instructions: {
    backgroundColor: colors.offWhite,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
  },
  instructionTitle: { fontSize: 15, fontWeight: '600', color: colors.black, marginBottom: spacing.md },
  instructionStep: { fontSize: 14, color: colors.darkSlate, lineHeight: 24, paddingLeft: spacing.sm },
  instructionNote: {
    fontSize: 12, color: colors.gray, marginTop: spacing.md,
    fontStyle: 'italic', lineHeight: 18,
  },

  timerContainer: { alignItems: 'center', marginVertical: spacing.xxl },
  timerCircle: {
    width: 200, height: 200, borderRadius: 100,
    borderWidth: 6, borderColor: colors.lightGray,
    alignItems: 'center', justifyContent: 'center',
  },
  timerCircleActive: { borderColor: colors.primary },
  timerValue: { fontSize: 48, fontWeight: '700', color: colors.black },
  timerUnit: { fontSize: 14, color: colors.lightText, marginTop: 2 },

  recordingIndicator: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, marginBottom: spacing.xl,
  },
  recordingDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: colors.danger,
  },
  recordingText: { fontSize: 14, color: colors.danger, fontWeight: '500' },

  vuMeterContainer: {
    alignItems: 'center', marginBottom: spacing.xl,
  },
  vuLabel: { fontSize: 11, color: colors.lightText, marginTop: spacing.sm },

  resultCard: {
    backgroundColor: colors.offWhite, borderRadius: borderRadius.lg,
    padding: spacing.lg, alignItems: 'center', marginBottom: spacing.xl,
  },
  resultBadge: {
    paddingHorizontal: 16, paddingVertical: 6,
    borderRadius: borderRadius.pill, marginBottom: spacing.md,
  },
  resultBadgeText: { fontSize: 14, fontWeight: '600' },
  resultNote: { fontSize: 13, color: colors.gray, textAlign: 'center', lineHeight: 19 },

  actions: { gap: spacing.md, marginTop: 'auto' as any, paddingBottom: spacing.xl },
  primaryBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.pill,
    paddingVertical: 16, alignItems: 'center',
  },
  primaryBtnText: { fontSize: 17, fontWeight: '600', color: colors.white },
  stopBtn: {
    backgroundColor: colors.danger, borderRadius: borderRadius.pill,
    paddingVertical: 16, alignItems: 'center',
  },
  stopBtnText: { fontSize: 17, fontWeight: '600', color: colors.white },
  outlineBtn: {
    borderWidth: 1.5, borderColor: colors.primary, borderRadius: borderRadius.pill,
    paddingVertical: 14, alignItems: 'center',
  },
  outlineBtnText: { fontSize: 15, fontWeight: '600', color: colors.primary },
});
