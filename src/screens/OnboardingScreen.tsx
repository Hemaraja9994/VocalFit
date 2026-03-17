import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../utils/theme';
import { useStore } from '../store/useStore';
import { Gender, Profession, UserProfile } from '../types';

const { width: SCREEN_W } = Dimensions.get('window');

type Step = 0 | 1 | 2 | 3;

const PROFESSIONS: { value: Profession; label: string; emoji: string }[] = [
  { value: 'teacher', label: 'Teacher', emoji: '🏫' },
  { value: 'faculty', label: 'University faculty', emoji: '🎓' },
  { value: 'medical', label: 'Medical professional', emoji: '⚕️' },
  { value: 'vocal_coach', label: 'Vocal coach / Singer', emoji: '🎤' },
  { value: 'other', label: 'Other', emoji: '💼' },
];

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'other', label: 'Other / Prefer not to say' },
];

const DEMANDS = [
  { value: 'low' as const, label: 'Low', desc: '< 2 hours speaking/day' },
  { value: 'moderate' as const, label: 'Moderate', desc: '2–4 hours speaking/day' },
  { value: 'high' as const, label: 'High', desc: '4–6 hours speaking/day' },
  { value: 'extreme' as const, label: 'Extreme', desc: '6+ hours speaking/day' },
];

const MEDICAL_CONDITIONS = [
  { key: 'acidReflux', label: 'Acid reflux / GERD' },
  { key: 'smoking', label: 'Smoking (current or former)' },
  { key: 'allergies', label: 'Allergies / Rhinitis' },
  { key: 'asthma', label: 'Asthma' },
  { key: 'thyroidDisorder', label: 'Thyroid disorder' },
  { key: 'previousVocalSurgery', label: 'Previous vocal surgery' },
  { key: 'hearingLoss', label: 'Hearing loss' },
];

export default function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const { setUser, setOnboarded } = useStore();
  const [step, setStep] = useState<Step>(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Form state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender>('female');
  const [profession, setProfession] = useState<Profession>('teacher');
  const [dailyHours, setDailyHours] = useState('4');
  const [vocalDemands, setVocalDemands] = useState<'low' | 'moderate' | 'high' | 'extreme'>('high');
  const [medical, setMedical] = useState<Record<string, boolean>>({
    acidReflux: false, smoking: false, allergies: false, asthma: false,
    thyroidDisorder: false, previousVocalSurgery: false, hearingLoss: false,
  });

  const animateTransition = (nextStep: Step) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setStep(nextStep), 150);
  };

  const handleFinish = () => {
    const profile: UserProfile = {
      id: Date.now().toString(),
      name: name || 'Voice User',
      age: parseInt(age) || 30,
      gender,
      profession,
      dailySpeakingHours: parseInt(dailyHours) || 4,
      vocalDemands,
      medicalHistory: {
        ...medical,
        notes: '',
      } as any,
      createdAt: new Date().toISOString(),
    };
    setUser(profile);
    setOnboarded(true);
    onComplete();
  };

  const canProceed = () => {
    if (step === 1) return name.length > 0 && age.length > 0;
    return true;
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Progress dots */}
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={[styles.dot, i <= step && styles.dotActive, i === step && styles.dotCurrent]} />
          ))}
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>

          {/* ─── Step 0: Welcome ──────────────────────── */}
          {step === 0 && (
            <View style={styles.welcomeContainer}>
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                style={styles.welcomeIcon}
              >
                <Text style={styles.welcomeEmoji}>🎙</Text>
              </LinearGradient>
              <Text style={styles.welcomeTitle}>Welcome to VocalFit</Text>
              <Text style={styles.welcomeSubtitle}>
                Your personal vocal health companion. We'll assess your voice,
                create a therapy program, and help you build healthy vocal habits.
              </Text>
              <View style={styles.featureList}>
                {[
                  { icon: '🎤', text: 'Voice assessment with clinical norms' },
                  { icon: '📊', text: 'VHI, VFI & GRBAS questionnaires' },
                  { icon: '💪', text: 'Personalized therapy exercises' },
                  { icon: '💧', text: 'Daily vocal hygiene tracker' },
                ].map((f) => (
                  <View key={f.text} style={styles.featureRow}>
                    <Text style={styles.featureIcon}>{f.icon}</Text>
                    <Text style={styles.featureText}>{f.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ─── Step 1: Profile ──────────────────────── */}
          {step === 1 && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.stepTitle}>About you</Text>
              <Text style={styles.stepSubtitle}>This helps us personalize your norms and therapy</Text>

              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Dr. Voice User"
                placeholderTextColor={colors.placeholder}
              />

              <Text style={styles.fieldLabel}>Age</Text>
              <TextInput
                style={styles.textInput}
                value={age}
                onChangeText={setAge}
                placeholder="30"
                keyboardType="number-pad"
                placeholderTextColor={colors.placeholder}
              />

              <Text style={styles.fieldLabel}>Gender</Text>
              <View style={styles.chipRow}>
                {GENDERS.map((g) => (
                  <TouchableOpacity
                    key={g.value}
                    style={[styles.chip, gender === g.value && styles.chipActive]}
                    onPress={() => setGender(g.value)}
                  >
                    <Text style={[styles.chipText, gender === g.value && styles.chipTextActive]}>{g.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Profession</Text>
              <View style={styles.professionGrid}>
                {PROFESSIONS.map((p) => (
                  <TouchableOpacity
                    key={p.value}
                    style={[styles.profCard, profession === p.value && styles.profCardActive]}
                    onPress={() => setProfession(p.value)}
                  >
                    <Text style={styles.profEmoji}>{p.emoji}</Text>
                    <Text style={[styles.profLabel, profession === p.value && styles.profLabelActive]}>{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

          {/* ─── Step 2: Vocal Demands ────────────────── */}
          {step === 2 && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.stepTitle}>Vocal demands</Text>
              <Text style={styles.stepSubtitle}>How much do you use your voice professionally?</Text>

              <Text style={styles.fieldLabel}>Daily speaking hours</Text>
              <TextInput
                style={styles.textInput}
                value={dailyHours}
                onChangeText={setDailyHours}
                placeholder="4"
                keyboardType="number-pad"
                placeholderTextColor={colors.placeholder}
              />

              <Text style={styles.fieldLabel}>Vocal demand level</Text>
              <View style={styles.demandList}>
                {DEMANDS.map((d) => (
                  <TouchableOpacity
                    key={d.value}
                    style={[styles.demandCard, vocalDemands === d.value && styles.demandCardActive]}
                    onPress={() => setVocalDemands(d.value)}
                  >
                    <View style={styles.demandLeft}>
                      <Text style={[styles.demandLabel, vocalDemands === d.value && styles.demandLabelActive]}>{d.label}</Text>
                      <Text style={styles.demandDesc}>{d.desc}</Text>
                    </View>
                    <View style={[styles.demandRadio, vocalDemands === d.value && styles.demandRadioActive]}>
                      {vocalDemands === d.value && <View style={styles.demandRadioDot} />}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          )}

          {/* ─── Step 3: Medical History ──────────────── */}
          {step === 3 && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.stepTitle}>Medical history</Text>
              <Text style={styles.stepSubtitle}>Select any conditions that apply (optional)</Text>

              <View style={styles.medicalList}>
                {MEDICAL_CONDITIONS.map((c) => (
                  <TouchableOpacity
                    key={c.key}
                    style={styles.medicalRow}
                    onPress={() => setMedical((prev) => ({ ...prev, [c.key]: !prev[c.key] }))}
                  >
                    <View style={[styles.medCheckbox, medical[c.key] && styles.medCheckboxActive]}>
                      {medical[c.key] && <Text style={styles.medCheck}>✓</Text>}
                    </View>
                    <Text style={styles.medLabel}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.privacyNote}>
                <Text style={styles.privacyText}>
                  Your data stays on your device. VocalFit does not transmit any health
                  information to external servers.
                </Text>
              </View>
            </ScrollView>
          )}

        </Animated.View>

        {/* Bottom actions */}
        <View style={styles.bottomActions}>
          {step > 0 && (
            <TouchableOpacity style={styles.backBtn} onPress={() => animateTransition((step - 1) as Step)}>
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          {step < 3 ? (
            <TouchableOpacity
              style={[styles.nextBtn, !canProceed() && styles.btnDisabled]}
              onPress={() => canProceed() && animateTransition((step + 1) as Step)}
              disabled={!canProceed()}
              activeOpacity={0.85}
            >
              <Text style={styles.nextBtnText}>{step === 0 ? 'Get started' : 'Continue'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.finishBtn} onPress={handleFinish} activeOpacity={0.85}>
              <Text style={styles.finishBtnText}>Start using VocalFit</Text>
            </TouchableOpacity>
          )}
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  dotsRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 8,
    paddingVertical: spacing.md,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.lightGray },
  dotActive: { backgroundColor: colors.primary },
  dotCurrent: { width: 24, borderRadius: 4 },
  content: { flex: 1, paddingHorizontal: spacing.xl },

  // Welcome
  welcomeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcomeIcon: {
    width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  welcomeEmoji: { fontSize: 36 },
  welcomeTitle: { ...typography.largeTitle, textAlign: 'center', marginBottom: spacing.sm },
  welcomeSubtitle: { fontSize: 15, color: colors.gray, textAlign: 'center', lineHeight: 22, marginBottom: spacing.xxl },
  featureList: { gap: spacing.md, width: '100%' },
  featureRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.offWhite, borderRadius: borderRadius.lg, padding: spacing.lg,
  },
  featureIcon: { fontSize: 20 },
  featureText: { fontSize: 14, color: colors.darkSlate, flex: 1 },

  // Steps
  stepTitle: { ...typography.largeTitle, marginBottom: 4, marginTop: spacing.md },
  stepSubtitle: { fontSize: 14, color: colors.gray, marginBottom: spacing.xl },

  fieldLabel: {
    fontSize: 13, fontWeight: '600', color: colors.gray,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm, marginTop: spacing.lg,
  },
  textInput: {
    backgroundColor: colors.offWhite, borderRadius: borderRadius.md, padding: spacing.lg,
    fontSize: 16, color: colors.black, borderWidth: 1, borderColor: colors.lightGray,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: borderRadius.pill,
    borderWidth: 1.5, borderColor: colors.lightGray, backgroundColor: colors.white,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  chipText: { fontSize: 14, color: colors.darkSlate },
  chipTextActive: { color: colors.white, fontWeight: '600' },

  professionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  profCard: {
    width: (SCREEN_W - 60) / 2 - 4, backgroundColor: colors.offWhite,
    borderRadius: borderRadius.lg, padding: spacing.lg, alignItems: 'center',
    borderWidth: 1.5, borderColor: 'transparent',
  },
  profCardActive: { borderColor: colors.primary, backgroundColor: '#F0FFF0' },
  profEmoji: { fontSize: 28, marginBottom: spacing.sm },
  profLabel: { fontSize: 13, color: colors.darkSlate, textAlign: 'center' },
  profLabelActive: { color: colors.primaryDarkest, fontWeight: '600' },

  // Demands
  demandList: { gap: spacing.sm },
  demandCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.offWhite,
    borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1.5, borderColor: 'transparent',
  },
  demandCardActive: { borderColor: colors.primary, backgroundColor: '#F0FFF0' },
  demandLeft: { flex: 1 },
  demandLabel: { fontSize: 15, fontWeight: '500', color: colors.black },
  demandLabelActive: { color: colors.primaryDarkest },
  demandDesc: { fontSize: 12, color: colors.lightText, marginTop: 2 },
  demandRadio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.lightGray,
    alignItems: 'center', justifyContent: 'center',
  },
  demandRadioActive: { borderColor: colors.primary },
  demandRadioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },

  // Medical
  medicalList: { gap: spacing.sm },
  medicalRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.md, borderBottomWidth: 0.5, borderBottomColor: colors.lightGray,
  },
  medCheckbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 1.5, borderColor: colors.lightGray,
    alignItems: 'center', justifyContent: 'center',
  },
  medCheckboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  medCheck: { fontSize: 13, fontWeight: '700', color: colors.white },
  medLabel: { fontSize: 15, color: colors.black, flex: 1 },
  privacyNote: {
    backgroundColor: colors.offWhite, borderRadius: borderRadius.lg, padding: spacing.lg,
    marginTop: spacing.xl,
  },
  privacyText: { fontSize: 12, color: colors.lightText, lineHeight: 18, fontStyle: 'italic' },

  // Bottom
  bottomActions: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.xl, gap: spacing.md,
  },
  backBtn: { paddingVertical: 14, paddingHorizontal: 20 },
  backBtnText: { fontSize: 15, color: colors.gray, fontWeight: '500' },
  nextBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.pill,
    paddingVertical: 14, paddingHorizontal: 32,
  },
  nextBtnText: { fontSize: 16, fontWeight: '600', color: colors.white },
  finishBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.pill,
    paddingVertical: 14, paddingHorizontal: 28, flex: 1, alignItems: 'center',
  },
  finishBtnText: { fontSize: 16, fontWeight: '600', color: colors.white },
  btnDisabled: { opacity: 0.4 },
});
