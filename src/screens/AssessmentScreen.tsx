import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../utils/theme';
import { SectionRow } from '../components/common/SectionRow';
import { useStore } from '../store/useStore';

const ASSESSMENT_ITEMS = [
  { id: 'MPT', title: 'Maximum phonation time', subtitle: 'Sustain /a/ as long as possible', color: colors.primary, icon: '🎤' },
  { id: 'SZRatio', title: 'S/Z ratio', subtitle: 'Measure sustained /s/ and /z/', color: colors.primaryDark, icon: '⏱' },
  { id: 'GRBAS', title: 'GRBAS self-rating', subtitle: 'Rate your voice quality on 5 scales', color: colors.primaryDeep, icon: '📊' },
  { id: 'VHI', title: 'VHI questionnaire', subtitle: 'Voice Handicap Index (30 items)', color: '#558B2F', icon: '📋' },
  { id: 'VFI', title: 'Vocal Fatigue Index', subtitle: 'Fatigue, discomfort & recovery (29 items)', color: '#EF6C00', icon: '🔥' },
  { id: 'Acoustic', title: 'Acoustic analysis', subtitle: 'F0, jitter, shimmer, HNR (coming soon)', color: '#33691E', icon: '🔬' },
];

export default function AssessmentHubScreen({ navigation }: any) {
  const assessments = useStore((s) => s.assessments);
  const latest = assessments.length > 0 ? assessments[assessments.length - 1] : null;
  const hasData = latest !== null;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Vocal check-in</Text>
          <Text style={styles.subtitle}>Complete your voice assessment</Text>
        </View>

        <View style={styles.lastAssessment}>
          <View style={styles.lastAssessmentHeader}>
            <Text style={styles.lastAssessmentLabel}>Last assessment</Text>
            <Text style={styles.lastAssessmentDate}>{hasData ? formatDate(latest!.date) : 'No data yet'}</Text>
          </View>
          <View style={styles.lastAssessmentScores}>
            <View style={styles.miniScore}>
              <Text style={styles.miniScoreValue}>{hasData ? latest!.vocalFitnessScore : '—'}</Text>
              <Text style={styles.miniScoreLabel}>Vocal score</Text>
            </View>
            <View style={styles.miniScoreDivider} />
            <View style={styles.miniScore}>
              <Text style={styles.miniScoreValue}>{hasData ? `${latest!.aerodynamic.mptSeconds}s` : '—'}</Text>
              <Text style={styles.miniScoreLabel}>MPT</Text>
            </View>
            <View style={styles.miniScoreDivider} />
            <View style={styles.miniScore}>
              <Text style={styles.miniScoreValue}>{hasData ? `${latest!.aerodynamic.szRatio}` : '—'}</Text>
              <Text style={styles.miniScoreLabel}>S/Z</Text>
            </View>
            <View style={styles.miniScoreDivider} />
            <View style={styles.miniScore}>
              <Text style={[styles.miniScoreValue, { color: '#EF6C00' }]}>
                {hasData && latest!.vfi ? `${latest!.vfi.fatigue + latest!.vfi.physicalDiscomfort}` : '—'}
              </Text>
              <Text style={styles.miniScoreLabel}>VFI burden</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.startButton} activeOpacity={0.85} onPress={() => navigation.navigate('AssessmentFlow')}>
          <Text style={styles.startButtonText}>Start full assessment</Text>
          <Text style={styles.startButtonSub}>Guided flow: MPT → S/Z → GRBAS → VHI → VFI → Report</Text>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>INDIVIDUAL TESTS</Text>
        <View style={styles.testList}>
          {ASSESSMENT_ITEMS.map((item) => (
            <SectionRow
              key={item.id}
              icon={<View style={[styles.iconCircle, { backgroundColor: item.color }]}><Text style={styles.iconEmoji}>{item.icon}</Text></View>}
              title={item.title}
              subtitle={item.subtitle}
              onPress={() => navigation.navigate(item.id)}
            />
          ))}
        </View>

        <View style={styles.normsCard}>
          <Text style={styles.normsTitle}>Reference norms</Text>
          <Text style={styles.normsBody}>
            Scoring uses published clinical norms:{'\n'}
            • MPT: Males 25–35s, Females 15–25s{'\n'}
            • S/Z Ratio: Normal 0.9–1.1{'\n'}
            • F0: Males 85–155 Hz, Females 165–255 Hz{'\n'}
            • VFI Fatigue burden: {'<'}15 = minimal{'\n'}
            • HNR: Normal {'>'} 20 dB
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
  lastAssessment: { backgroundColor: colors.offWhite, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  lastAssessmentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  lastAssessmentLabel: { fontSize: 13, fontWeight: '500', color: colors.gray },
  lastAssessmentDate: { fontSize: 13, color: colors.lightText },
  lastAssessmentScores: { flexDirection: 'row', alignItems: 'center' },
  miniScore: { flex: 1, alignItems: 'center' },
  miniScoreValue: { fontSize: 18, fontWeight: '600', color: colors.black },
  miniScoreLabel: { fontSize: 10, color: colors.lightText, marginTop: 2 },
  miniScoreDivider: { width: 1, height: 28, backgroundColor: colors.lightGray },
  startButton: { backgroundColor: colors.primary, borderRadius: borderRadius.lg, paddingVertical: 18, alignItems: 'center', marginBottom: spacing.xxl },
  startButtonText: { fontSize: 17, fontWeight: '600', color: colors.white },
  startButtonSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  sectionLabel: { ...typography.small, marginBottom: spacing.md },
  testList: { gap: spacing.md, marginBottom: spacing.xxl },
  iconCircle: { width: 44, height: 44, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  iconEmoji: { fontSize: 18 },
  normsCard: { backgroundColor: '#F0FFF0', borderRadius: borderRadius.lg, padding: spacing.lg, borderWidth: 1, borderColor: '#C8E6C9' },
  normsTitle: { fontSize: 14, fontWeight: '600', color: colors.primaryDarkest, marginBottom: spacing.sm },
  normsBody: { fontSize: 13, color: colors.primaryDeep, lineHeight: 20 },
});
