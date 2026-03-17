import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import {
  getRatingColor,
  getRatingLabel,
  calculateVocalFitnessScore,
  GRBAS_SCALE_LABELS,
} from '../../data/normativeData';
import { rateVFI } from '../../data/vfiItems';
import {
  assessmentToConcerns,
  buildTherapyPlan,
} from '../../data/therapyExercises';
import { useStore } from '../../store/useStore';
import { NormRating } from '../../types';

// Helper to map VHI/VFI severity string to NormRating for color functions
function severityToRating(severity: string): NormRating {
  if (severity === 'minimal') return 'normal';
  if (severity === 'mild') return 'mild';
  if (severity === 'moderate') return 'moderate';
  return 'severe';
}

// Default empty assessment data used when no actual data exists
const EMPTY_DATA = {
  date: new Date().toISOString(),
  aerodynamic: {
    mptSeconds: 0,
    mptRating: 'normal' as NormRating,
    sSeconds: 0,
    zSeconds: 0,
    szRatio: 0,
    szRating: 'normal' as NormRating,
  },
  acoustic: {
    fundamentalFrequency: 0,
    f0Rating: 'normal' as NormRating,
    jitterPercent: 0,
    jitterRating: 'normal' as NormRating,
    shimmerPercent: 0,
    shimmerRating: 'normal' as NormRating,
    hnrDb: 0,
    hnrRating: 'normal' as NormRating,
  },
  perceptual: {
    grade: 0,
    roughness: 0,
    breathiness: 0,
    asthenia: 0,
    strain: 0,
    totalScore: 0,
  },
  vhi: {
    functional: 0,
    physical: 0,
    emotional: 0,
    totalScore: 0,
    severity: 'minimal' as const,
  },
  vfi: {
    fatigue: 0,
    physicalDiscomfort: 0,
    restRecovery: 0,
    totalScore: 0,
    severity: 'minimal' as const,
  },
};

interface DomainRow {
  label: string;
  value: string;
  rating: NormRating;
  norm: string;
}

export default function ReportScreen({ navigation }: any) {
  const { setTherapyPlan, currentAssessment, assessments } = useStore();
  // Use current in-progress assessment, or latest saved, or empty defaults
  const storeData = currentAssessment || (assessments.length > 0 ? assessments[assessments.length - 1] : null);
  const data = {
    date: storeData?.date || EMPTY_DATA.date,
    aerodynamic: storeData?.aerodynamic || EMPTY_DATA.aerodynamic,
    acoustic: storeData?.acoustic || EMPTY_DATA.acoustic,
    perceptual: storeData?.perceptual || EMPTY_DATA.perceptual,
    vhi: storeData?.vhi || EMPTY_DATA.vhi,
    vfi: storeData?.vfi || EMPTY_DATA.vfi,
  };

  // Calculate vocal fitness score
  const fitnessScore = useMemo(() => calculateVocalFitnessScore({
    mptRating: data.aerodynamic.mptRating,
    szRating: data.aerodynamic.szRating,
    f0Rating: data.acoustic.f0Rating,
    jitterRating: data.acoustic.jitterRating,
    shimmerRating: data.acoustic.shimmerRating,
    hnrRating: data.acoustic.hnrRating,
    grbasTotal: data.perceptual.totalScore,
    vhiTotal: data.vhi.totalScore,
  }), []);

  // Generate concerns and therapy plan
  const concerns = useMemo(() => assessmentToConcerns({
    grbasStrain: data.perceptual.strain,
    grbasBreathiness: data.perceptual.breathiness,
    grbasRoughness: data.perceptual.roughness,
    grbasAsthenia: data.perceptual.asthenia,
    mptRating: data.aerodynamic.mptRating,
    szRating: data.aerodynamic.szRating,
    vfiFatigue: data.vfi.fatigue,
    vfiDiscomfort: data.vfi.physicalDiscomfort,
    vfiRecovery: data.vfi.restRecovery,
    vhiTotal: data.vhi.totalScore,
  }), []);

  const recommendedExercises = useMemo(() => buildTherapyPlan(concerns, 6), [concerns]);

  const scoreColor = fitnessScore >= 80 ? colors.primary
    : fitnessScore >= 60 ? colors.warning
    : fitnessScore >= 40 ? '#F97316'
    : colors.danger;

  const scoreLabel = fitnessScore >= 80 ? 'Excellent'
    : fitnessScore >= 60 ? 'Good'
    : fitnessScore >= 40 ? 'Fair'
    : 'Needs attention';

  // Build domain rows
  const aeroRows: DomainRow[] = [
    { label: 'MPT', value: `${data.aerodynamic.mptSeconds}s`, rating: data.aerodynamic.mptRating, norm: 'F: 15–25s  M: 25–35s' },
    { label: 'S/Z ratio', value: `${data.aerodynamic.szRatio}`, rating: data.aerodynamic.szRating, norm: 'Normal: 0.9–1.1' },
  ];

  const acousticRows: DomainRow[] = [
    { label: 'F0', value: `${data.acoustic.fundamentalFrequency} Hz`, rating: data.acoustic.f0Rating, norm: 'F: 165–255  M: 85–155 Hz' },
    { label: 'Jitter', value: `${data.acoustic.jitterPercent}%`, rating: data.acoustic.jitterRating, norm: 'Normal: < 1.04%' },
    { label: 'Shimmer', value: `${data.acoustic.shimmerPercent}%`, rating: data.acoustic.shimmerRating, norm: 'Normal: < 3.81%' },
    { label: 'HNR', value: `${data.acoustic.hnrDb} dB`, rating: data.acoustic.hnrRating, norm: 'Normal: > 20 dB' },
  ];

  const grbasParams = ['grade', 'roughness', 'breathiness', 'asthenia', 'strain'] as const;

  const handleGeneratePlan = () => {
    const planItems = recommendedExercises.map((ex, i) => ({
      exercise: ex,
      order: i + 1,
      completed: false,
    }));
    setTherapyPlan({
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      exercises: planItems,
      completedCount: 0,
    });
    // Save the current assessment to the store
    const store = useStore.getState();
    if (store.currentAssessment) {
      const fitnessScoreVal = calculateVocalFitnessScore({
        mptRating: data.aerodynamic.mptRating,
        szRating: data.aerodynamic.szRating,
        f0Rating: data.acoustic.f0Rating,
        jitterRating: data.acoustic.jitterRating,
        shimmerRating: data.acoustic.shimmerRating,
        hnrRating: data.acoustic.hnrRating,
        grbasTotal: data.perceptual.totalScore,
        vhiTotal: data.vhi.totalScore,
      });
      store.saveAssessment({
        ...store.currentAssessment as any,
        vocalFitnessScore: fitnessScoreVal,
        interpretation: {
          overallRating: fitnessScoreVal >= 80 ? 'excellent' : fitnessScoreVal >= 60 ? 'good' : fitnessScoreVal >= 40 ? 'fair' : 'poor',
          primaryConcerns: concerns,
          recommendations: [],
        },
      });
    }

    Alert.alert(
      'Therapy plan generated',
      `${recommendedExercises.length} exercises have been added to your Therapy tab based on your assessment results.`,
      [{ text: 'Go to Therapy', onPress: () => {
        // Navigate to therapy tab
        navigation.getParent()?.navigate('Therapy');
      }}]
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Vocal health report</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ─── Hero Score Card ─────────────────────────────── */}
        <LinearGradient
          colors={[scoreColor, scoreColor + 'DD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroDecor1} />
          <View style={styles.heroDecor2} />
          <Text style={styles.heroLabel}>VOCAL FITNESS SCORE</Text>
          <View style={styles.heroRow}>
            <Text style={styles.heroScore}>{fitnessScore}</Text>
            <Text style={styles.heroMax}>/100</Text>
          </View>
          <Text style={styles.heroSeverity}>{scoreLabel}</Text>
          <Text style={styles.heroDate}>
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </Text>
        </LinearGradient>

        {/* ─── Domain Breakdown ───────────────────────────── */}
        <Text style={styles.sectionTitle}>Aerodynamic parameters</Text>
        <View style={styles.domainCard}>
          {aeroRows.map((row) => (
            <View key={row.label} style={styles.domainRow}>
              <View style={styles.domainLeft}>
                <Text style={styles.domainLabel}>{row.label}</Text>
                <Text style={styles.domainNorm}>{row.norm}</Text>
              </View>
              <Text style={[styles.domainValue, { color: getRatingColor(row.rating) }]}>{row.value}</Text>
              <View style={[styles.ratingPill, { backgroundColor: getRatingColor(row.rating) + '20' }]}>
                <Text style={[styles.ratingPillText, { color: getRatingColor(row.rating) }]}>
                  {getRatingLabel(row.rating).replace(' range', '')}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Acoustic parameters</Text>
        <View style={styles.domainCard}>
          {acousticRows.map((row) => (
            <View key={row.label} style={styles.domainRow}>
              <View style={styles.domainLeft}>
                <Text style={styles.domainLabel}>{row.label}</Text>
                <Text style={styles.domainNorm}>{row.norm}</Text>
              </View>
              <Text style={[styles.domainValue, { color: getRatingColor(row.rating) }]}>{row.value}</Text>
              <View style={[styles.ratingPill, { backgroundColor: getRatingColor(row.rating) + '20' }]}>
                <Text style={[styles.ratingPillText, { color: getRatingColor(row.rating) }]}>
                  {getRatingLabel(row.rating).replace(' range', '')}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Perceptual — GRBAS</Text>
        <View style={styles.domainCard}>
          {grbasParams.map((key) => {
            const val = data.perceptual[key];
            const barColor = val === 0 ? colors.primary : val === 1 ? colors.warning : val === 2 ? '#F97316' : colors.danger;
            return (
              <View key={key} style={styles.grbasRow}>
                <Text style={styles.grbasLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
                <View style={styles.grbasBarTrack}>
                  <View style={[styles.grbasBarFill, { width: `${(val / 3) * 100}%`, backgroundColor: barColor }]} />
                </View>
                <Text style={[styles.grbasValue, { color: barColor }]}>{val}/3</Text>
                <Text style={styles.grbasRating}>{GRBAS_SCALE_LABELS[val]}</Text>
              </View>
            );
          })}
          <View style={styles.grbasTotalRow}>
            <Text style={styles.grbasTotalLabel}>Total</Text>
            <Text style={styles.grbasTotalValue}>{data.perceptual.totalScore}/15</Text>
          </View>
        </View>

        {/* ─── VHI Summary ────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Voice Handicap Index</Text>
        <View style={styles.domainCard}>
          <View style={styles.vhiGrid}>
            {(['functional', 'physical', 'emotional'] as const).map((sub) => {
              const val = data.vhi[sub];
              const subColors = { functional: '#42A5F5', physical: colors.primary, emotional: '#FF7043' };
              return (
                <View key={sub} style={styles.vhiSubCard}>
                  <View style={[styles.vhiSubDot, { backgroundColor: subColors[sub] }]} />
                  <Text style={styles.vhiSubLabel}>{sub.charAt(0).toUpperCase() + sub.slice(1)}</Text>
                  <Text style={[styles.vhiSubScore, { color: subColors[sub] }]}>{val}/40</Text>
                </View>
              );
            })}
          </View>
          <View style={styles.vhiTotalRow}>
            <Text style={styles.vhiTotalLabel}>Total: {data.vhi.totalScore}/120</Text>
            <View style={[styles.ratingPill, { backgroundColor: getRatingColor(severityToRating(data.vhi.severity)) + '20' }]}>
              <Text style={[styles.ratingPillText, { color: getRatingColor(severityToRating(data.vhi.severity)) }]}>
                {data.vhi.severity.charAt(0).toUpperCase() + data.vhi.severity.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* ─── VFI Summary ────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Vocal Fatigue Index</Text>
        <View style={styles.domainCard}>
          <View style={styles.vfiGrid}>
            <View style={styles.vfiSubCard}>
              <View style={[styles.vfiSubDot, { backgroundColor: '#EF6C00' }]} />
              <Text style={styles.vfiSubLabel}>Tiredness</Text>
              <Text style={[styles.vfiSubScore, { color: '#EF6C00' }]}>{data.vfi.fatigue}/44</Text>
            </View>
            <View style={styles.vfiSubCard}>
              <View style={[styles.vfiSubDot, { backgroundColor: '#E53935' }]} />
              <Text style={styles.vfiSubLabel}>Discomfort</Text>
              <Text style={[styles.vfiSubScore, { color: '#E53935' }]}>{data.vfi.physicalDiscomfort}/36</Text>
            </View>
            <View style={styles.vfiSubCard}>
              <View style={[styles.vfiSubDot, { backgroundColor: '#43A047' }]} />
              <Text style={styles.vfiSubLabel}>Recovery</Text>
              <Text style={[styles.vfiSubScore, { color: '#43A047' }]}>{data.vfi.restRecovery}/36</Text>
            </View>
          </View>
          <View style={styles.vfiBurdenBox}>
            <Text style={styles.vfiBurdenLabel}>
              Fatigue burden: {data.vfi.fatigue + data.vfi.physicalDiscomfort}/80
            </Text>
            <View style={styles.vfiBurdenBarTrack}>
              <View style={[styles.vfiBurdenBarFill, { width: `${((data.vfi.fatigue + data.vfi.physicalDiscomfort) / 80) * 100}%` }]} />
            </View>
            <Text style={styles.vfiBurdenSeverity}>
              Severity: {rateVFI(data.vfi.fatigue, data.vfi.physicalDiscomfort)}
            </Text>
          </View>
        </View>

        {/* ─── Clinical Concerns ──────────────────────────── */}
        <Text style={styles.sectionTitle}>Identified concerns</Text>
        <View style={styles.concernsCard}>
          {concerns.filter(c => c !== 'warmup' && c !== 'cooldown').length === 0 ? (
            <Text style={styles.noConcerns}>No significant concerns identified. Maintain your current vocal habits!</Text>
          ) : (
            <View style={styles.concernsList}>
              {concerns.filter(c => c !== 'warmup' && c !== 'cooldown').map((concern) => {
                const labels: Record<string, string> = {
                  high_strain: 'Hyperfunctional strain detected (GRBAS Strain ≥ 2)',
                  muscle_tension: 'Muscle tension pattern — may benefit from manual therapy',
                  breathiness: 'Breathy voice quality — possible glottal insufficiency',
                  poor_glottal_closure: 'Incomplete glottal closure — elevated S/Z or breathiness',
                  roughness: 'Rough voice quality — irregular vocal fold vibration',
                  weak_voice: 'Asthenic voice — reduced vocal power',
                  short_mpt: 'Reduced phonation time — below expected norms',
                  poor_breath_support: 'Inadequate respiratory support for speech',
                  vocal_fatigue: 'Elevated vocal fatigue (VFI Factor 1 ≥ 22)',
                  elevated_larynx: 'Laryngeal tension / elevated larynx position',
                  voice_projection: 'Difficulty with voice projection (VHI > 56)',
                };
                return (
                  <View key={concern} style={styles.concernItem}>
                    <View style={styles.concernDot} />
                    <Text style={styles.concernText}>
                      {labels[concern] || concern.replace(/_/g, ' ')}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* ─── Recommended Therapy ────────────────────────── */}
        <Text style={styles.sectionTitle}>Recommended therapy program</Text>
        <View style={styles.therapyCard}>
          <Text style={styles.therapyIntro}>
            Based on your assessment, the following {recommendedExercises.length}-exercise program targets your specific concerns:
          </Text>
          {recommendedExercises.map((ex, i) => (
            <View key={ex.id} style={styles.therapyRow}>
              <View style={styles.therapyNum}>
                <Text style={styles.therapyNumText}>{i + 1}</Text>
              </View>
              <View style={styles.therapyInfo}>
                <Text style={styles.therapyName}>{ex.name}</Text>
                <Text style={styles.therapyCat}>{ex.category.toUpperCase()} · {ex.durationSeconds}s · {ex.repetitions} reps</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.generateBtn} onPress={handleGeneratePlan} activeOpacity={0.85}>
            <Text style={styles.generateBtnText}>Send to therapy tab</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Disclaimer ─────────────────────────────────── */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            This report is for self-monitoring purposes and does not constitute a clinical diagnosis. Acoustic parameters are based on self-report and stopwatch data, not instrumental analysis. Consult a certified speech-language pathologist or voice pathologist for clinical evaluation.
          </Text>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.md,
  },
  backBtn: {},
  backText: { fontSize: 16, color: colors.primary, fontWeight: '500' },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: colors.black },
  scrollView: { flex: 1 },
  content: { padding: spacing.xl, paddingTop: spacing.sm },

  // Hero
  heroCard: {
    borderRadius: borderRadius.xl, padding: spacing.xxl,
    marginBottom: spacing.xxl, position: 'relative', overflow: 'hidden',
  },
  heroDecor1: {
    position: 'absolute', top: -20, right: -20, width: 100, height: 100,
    borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.15)',
  },
  heroDecor2: {
    position: 'absolute', bottom: -30, right: 30, width: 80, height: 80,
    borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroLabel: {
    fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.85)',
    letterSpacing: 0.8, marginBottom: spacing.sm,
  },
  heroRow: { flexDirection: 'row', alignItems: 'baseline' },
  heroScore: { fontSize: 56, fontWeight: '700', color: '#FFFFFF' },
  heroMax: { fontSize: 20, color: 'rgba(255,255,255,0.7)', marginLeft: 4 },
  heroSeverity: {
    fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginTop: spacing.sm,
  },
  heroDate: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

  // Sections
  sectionTitle: {
    fontSize: 13, fontWeight: '600', color: colors.gray,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md,
  },

  // Domain cards
  domainCard: {
    backgroundColor: colors.offWhite, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.xl,
  },
  domainRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 0.5, borderBottomColor: colors.lightGray,
  },
  domainLeft: { flex: 1 },
  domainLabel: { fontSize: 14, fontWeight: '500', color: colors.black },
  domainNorm: { fontSize: 11, color: colors.lightText, marginTop: 1 },
  domainValue: { fontSize: 16, fontWeight: '600', marginRight: spacing.sm },
  ratingPill: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.pill,
    minWidth: 70, alignItems: 'center',
  },
  ratingPillText: { fontSize: 10, fontWeight: '600' },

  // GRBAS
  grbasRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  grbasLabel: { width: 80, fontSize: 13, fontWeight: '500', color: colors.black },
  grbasBarTrack: {
    flex: 1, height: 6, backgroundColor: colors.lightGray,
    borderRadius: 3, overflow: 'hidden',
  },
  grbasBarFill: { height: '100%', borderRadius: 3 },
  grbasValue: { fontSize: 13, fontWeight: '600', width: 28, textAlign: 'right' },
  grbasRating: { fontSize: 11, color: colors.lightText, width: 60 },
  grbasTotalRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    borderTopWidth: 0.5, borderTopColor: colors.lightGray,
    paddingTop: spacing.sm, marginTop: spacing.xs,
  },
  grbasTotalLabel: { fontSize: 14, fontWeight: '600', color: colors.black },
  grbasTotalValue: { fontSize: 14, fontWeight: '600', color: colors.black },

  // VHI
  vhiGrid: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  vhiSubCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: borderRadius.md,
    padding: spacing.sm + 2, alignItems: 'center', gap: 3,
  },
  vhiSubDot: { width: 8, height: 8, borderRadius: 4 },
  vhiSubLabel: { fontSize: 10, color: colors.gray },
  vhiSubScore: { fontSize: 16, fontWeight: '600' },
  vhiTotalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  vhiTotalLabel: { fontSize: 14, fontWeight: '600', color: colors.black },

  // VFI
  vfiGrid: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  vfiSubCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: borderRadius.md,
    padding: spacing.sm + 2, alignItems: 'center', gap: 3,
  },
  vfiSubDot: { width: 8, height: 8, borderRadius: 4 },
  vfiSubLabel: { fontSize: 10, color: colors.gray },
  vfiSubScore: { fontSize: 16, fontWeight: '600' },
  vfiBurdenBox: { paddingTop: spacing.sm },
  vfiBurdenLabel: { fontSize: 13, fontWeight: '500', color: colors.black, marginBottom: spacing.xs },
  vfiBurdenBarTrack: {
    height: 6, backgroundColor: '#FFF3E0', borderRadius: 3,
    overflow: 'hidden', marginBottom: spacing.xs,
  },
  vfiBurdenBarFill: { height: '100%', backgroundColor: '#EF6C00', borderRadius: 3 },
  vfiBurdenSeverity: { fontSize: 12, color: '#EF6C00', fontWeight: '500' },

  // Concerns
  concernsCard: {
    backgroundColor: '#FFF8E1', borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.xl,
    borderWidth: 1, borderColor: '#FFE082',
  },
  noConcerns: { fontSize: 14, color: '#558B2F', fontStyle: 'italic' },
  concernsList: { gap: spacing.sm },
  concernItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  concernDot: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#F57F17',
    marginTop: 6,
  },
  concernText: { fontSize: 13, color: '#795548', lineHeight: 19, flex: 1 },

  // Therapy
  therapyCard: {
    backgroundColor: '#F0FFF0', borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.xl,
    borderWidth: 1, borderColor: '#C8E6C9',
  },
  therapyIntro: {
    fontSize: 13, color: colors.primaryDeep, lineHeight: 19, marginBottom: spacing.md,
  },
  therapyRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 0.5, borderBottomColor: '#C8E6C9',
  },
  therapyNum: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  therapyNumText: { fontSize: 13, fontWeight: '600', color: colors.white },
  therapyInfo: { flex: 1 },
  therapyName: { fontSize: 14, fontWeight: '500', color: colors.primaryDarkest },
  therapyCat: { fontSize: 11, color: colors.primaryDeep, marginTop: 1 },
  generateBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.pill,
    paddingVertical: 14, alignItems: 'center', marginTop: spacing.lg,
  },
  generateBtnText: { fontSize: 15, fontWeight: '600', color: colors.white },

  // Disclaimer
  disclaimer: {
    backgroundColor: colors.offWhite, borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  disclaimerText: { fontSize: 11, color: colors.lightText, lineHeight: 17, fontStyle: 'italic' },
});
