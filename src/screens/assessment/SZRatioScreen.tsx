import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { rateSZRatio, getRatingColor, getRatingLabel } from '../../data/normativeData';
import { useStore } from '../../store/useStore';

type Phase = 'intro' | 's_ready' | 's_recording' | 'z_ready' | 'z_recording' | 'done';

export default function SZRatioScreen({ navigation }: any) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [sTime, setSTime] = useState(0);
  const [zTime, setZTime] = useState(0);
  const [currentElapsed, setCurrentElapsed] = useState(0);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const requestPermissions = async () => {
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      Alert.alert('Permission needed', 'Microphone access is required.');
      return false;
    }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    return true;
  };

  const startTimer = async (sound: 's' | 'z') => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(rec);
      setCurrentElapsed(0);
      startTimeRef.current = Date.now();
      setPhase(sound === 's' ? 's_recording' : 'z_recording');

      timerRef.current = setInterval(() => {
        setCurrentElapsed(Math.round((Date.now() - startTimeRef.current) / 100) / 10);
      }, 100);
    } catch {
      Alert.alert('Error', 'Could not start recording.');
    }
  };

  const stopTimer = async (sound: 's' | 'z') => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;

    if (recording) {
      try { await recording.stopAndUnloadAsync(); } catch {}
      setRecording(null);
    }

    const finalTime = Math.round((Date.now() - startTimeRef.current) / 100) / 10;
    if (sound === 's') {
      setSTime(finalTime);
      setPhase('z_ready');
    } else {
      setZTime(finalTime);
      setPhase('done');
    }
    setCurrentElapsed(0);
  };

  const reset = () => {
    setPhase('intro');
    setSTime(0);
    setZTime(0);
    setCurrentElapsed(0);
  };

  const ratio = zTime > 0 ? Math.round((sTime / zTime) * 100) / 100 : 0;
  const rating = phase === 'done' ? rateSZRatio(ratio) : null;
  const ratingColor = rating ? getRatingColor(rating) : colors.primary;

  const formatTime = (t: number) => `${Math.floor(t)}.${Math.round((t % 1) * 10)}`;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>S/Z ratio</Text>
      </View>

      <View style={styles.body}>
        {/* Intro */}
        {phase === 'intro' && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How this works</Text>
            <Text style={styles.infoStep}>1. First, sustain /s/ ("sssss") as long as possible</Text>
            <Text style={styles.infoStep}>2. Then, sustain /z/ ("zzzzz") as long as possible</Text>
            <Text style={styles.infoStep}>3. The app calculates your S/Z ratio automatically</Text>
            <Text style={styles.infoNote}>
              Normal ratio is 0.9–1.1. A ratio above 1.4 may suggest laryngeal pathology affecting vocal fold vibration.
            </Text>
          </View>
        )}

        {/* Dual timer display */}
        <View style={styles.dualTimers}>
          <View style={[
            styles.timerBox,
            (phase === 's_ready' || phase === 's_recording') && styles.timerBoxActive,
            sTime > 0 && phase !== 's_recording' && styles.timerBoxDone,
          ]}>
            <Text style={styles.timerLabel}>/s/ duration</Text>
            <Text style={[
              styles.timerValue,
              phase === 's_recording' && { color: colors.primary },
            ]}>
              {phase === 's_recording' ? formatTime(currentElapsed) : formatTime(sTime)}
            </Text>
            <Text style={styles.timerSec}>seconds</Text>
            {phase === 's_recording' && (
              <View style={styles.liveRow}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Recording</Text>
              </View>
            )}
          </View>

          <View style={[
            styles.timerBox,
            (phase === 'z_ready' || phase === 'z_recording') && styles.timerBoxActive,
            zTime > 0 && phase !== 'z_recording' && styles.timerBoxDone,
          ]}>
            <Text style={styles.timerLabel}>/z/ duration</Text>
            <Text style={[
              styles.timerValue,
              phase === 'z_recording' && { color: colors.primary },
            ]}>
              {phase === 'z_recording' ? formatTime(currentElapsed) : formatTime(zTime)}
            </Text>
            <Text style={styles.timerSec}>seconds</Text>
            {phase === 'z_recording' && (
              <View style={styles.liveRow}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Recording</Text>
              </View>
            )}
          </View>
        </View>

        {/* Ratio Result */}
        {phase === 'done' && rating && (
          <View style={styles.resultCard}>
            <Text style={styles.ratioLabel}>S/Z Ratio</Text>
            <Text style={[styles.ratioValue, { color: ratingColor }]}>{ratio}</Text>
            <View style={[styles.resultBadge, { backgroundColor: ratingColor + '20' }]}>
              <Text style={[styles.resultBadgeText, { color: ratingColor }]}>
                {getRatingLabel(rating)}
              </Text>
            </View>
            <Text style={styles.resultNote}>
              {ratio <= 1.1
                ? 'Your vocal folds appear to be vibrating efficiently.'
                : ratio <= 1.4
                ? 'Slightly elevated. May indicate mild glottal insufficiency.'
                : 'Elevated ratio suggests possible vocal fold pathology. Consult your voice pathologist.'}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {phase === 'intro' && (
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setPhase('s_ready')} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Begin test</Text>
            </TouchableOpacity>
          )}
          {phase === 's_ready' && (
            <TouchableOpacity style={styles.primaryBtn} onPress={() => startTimer('s')} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Start /s/ recording</Text>
            </TouchableOpacity>
          )}
          {phase === 's_recording' && (
            <TouchableOpacity style={styles.stopBtn} onPress={() => stopTimer('s')} activeOpacity={0.85}>
              <Text style={styles.stopBtnText}>Stop /s/</Text>
            </TouchableOpacity>
          )}
          {phase === 'z_ready' && (
            <TouchableOpacity style={styles.primaryBtn} onPress={() => startTimer('z')} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Start /z/ recording</Text>
            </TouchableOpacity>
          )}
          {phase === 'z_recording' && (
            <TouchableOpacity style={styles.stopBtn} onPress={() => stopTimer('z')} activeOpacity={0.85}>
              <Text style={styles.stopBtnText}>Stop /z/</Text>
            </TouchableOpacity>
          )}
          {phase === 'done' && (
            <>
              <TouchableOpacity style={styles.primaryBtn} onPress={reset} activeOpacity={0.85}>
                <Text style={styles.primaryBtnText}>Try again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.outlineBtn} onPress={() => {
                const store = useStore.getState();
                if (!store.currentAssessment) store.startAssessment();
                const existingAero = store.currentAssessment?.aerodynamic;
                store.updateAerodynamic({
                  mptSeconds: existingAero?.mptSeconds ?? 0,
                  mptRating: existingAero?.mptRating ?? 'normal',
                  sSeconds: sTime,
                  zSeconds: zTime,
                  szRatio: ratio,
                  szRating: rating!,
                });
                Alert.alert('Saved', `S/Z ratio of ${ratio} saved to your assessment.`);
                navigation.goBack();
              }} activeOpacity={0.85}>
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

  infoCard: {
    backgroundColor: colors.offWhite, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.xl,
  },
  infoTitle: { fontSize: 15, fontWeight: '600', color: colors.black, marginBottom: spacing.md },
  infoStep: { fontSize: 14, color: colors.darkSlate, lineHeight: 24, paddingLeft: spacing.sm },
  infoNote: { fontSize: 12, color: colors.gray, marginTop: spacing.md, fontStyle: 'italic', lineHeight: 18 },

  dualTimers: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  timerBox: {
    flex: 1, backgroundColor: colors.offWhite, borderRadius: borderRadius.lg,
    padding: spacing.lg, alignItems: 'center', borderWidth: 2, borderColor: 'transparent',
  },
  timerBoxActive: { borderColor: colors.primary, backgroundColor: colors.white },
  timerBoxDone: { borderColor: colors.lightGray },
  timerLabel: { ...typography.small, marginBottom: spacing.sm },
  timerValue: { fontSize: 36, fontWeight: '700', color: colors.black },
  timerSec: { fontSize: 12, color: colors.lightText, marginTop: 2 },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.sm },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger },
  liveText: { fontSize: 11, color: colors.danger, fontWeight: '500' },

  resultCard: {
    backgroundColor: colors.offWhite, borderRadius: borderRadius.lg,
    padding: spacing.xl, alignItems: 'center', marginBottom: spacing.xl,
  },
  ratioLabel: { ...typography.small, marginBottom: spacing.xs },
  ratioValue: { fontSize: 48, fontWeight: '700', marginBottom: spacing.md },
  resultBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: borderRadius.pill, marginBottom: spacing.md },
  resultBadgeText: { fontSize: 14, fontWeight: '600' },
  resultNote: { fontSize: 13, color: colors.gray, textAlign: 'center', lineHeight: 19 },

  actions: { gap: spacing.md, marginTop: 'auto' as any, paddingBottom: spacing.xl },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: borderRadius.pill, paddingVertical: 16, alignItems: 'center' },
  primaryBtnText: { fontSize: 17, fontWeight: '600', color: colors.white },
  stopBtn: { backgroundColor: colors.danger, borderRadius: borderRadius.pill, paddingVertical: 16, alignItems: 'center' },
  stopBtnText: { fontSize: 17, fontWeight: '600', color: colors.white },
  outlineBtn: { borderWidth: 1.5, borderColor: colors.primary, borderRadius: borderRadius.pill, paddingVertical: 14, alignItems: 'center' },
  outlineBtnText: { fontSize: 15, fontWeight: '600', color: colors.primary },
});
