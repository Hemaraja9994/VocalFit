import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { GRBAS_LABELS, GRBAS_SCALE_LABELS } from '../../data/normativeData';
import { useStore } from '../../store/useStore';

const GRBAS_DESCRIPTIONS: Record<string, string[]> = {
  grade: [
    'Voice sounds normal — no perceived abnormality.',
    'Slight deviation from normal that most listeners would not notice.',
    'Moderate deviation — voice quality is noticeably different.',
    'Severe deviation — voice quality is extremely abnormal.',
  ],
  roughness: [
    'Voice is smooth and clear — no irregular vibration perceived.',
    'Slight roughness or hoarseness detectable on sustained vowels.',
    'Moderate roughness clearly heard during connected speech.',
    'Severe roughness — voice sounds very rough/gravelly throughout.',
  ],
  breathiness: [
    'No audible air escape during phonation.',
    'Slight breathiness — minor air turbulence heard.',
    'Moderate breathiness — audible air escape during speech.',
    'Severe breathiness — voice is very weak with significant air loss.',
  ],
  asthenia: [
    'Voice has normal strength and projection.',
    'Slight weakness — voice occasionally fades.',
    'Moderate weakness — voice is notably quiet and lacks power.',
    'Severe weakness — voice is extremely faint.',
  ],
  strain: [
    'Voice is produced with normal effort — sounds relaxed.',
    'Slight strain — occasional sense of effortful phonation.',
    'Moderate strain — voice sounds tight and effortful.',
    'Severe strain — voice sounds very pressed and hyperadducted.',
  ],
};

const PARAM_KEYS = ['grade', 'roughness', 'breathiness', 'asthenia', 'strain'] as const;

export default function GRBASScreen({ navigation }: any) {
  const [scores, setScores] = useState<Record<string, number>>({
    grade: 0, roughness: 0, breathiness: 0, asthenia: 0, strain: 0,
  });

  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  const setScore = (key: string, value: number) => {
    setScores((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>GRBAS self-rating</Text>
        <Text style={styles.subtitle}>Rate your voice quality on each dimension</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {PARAM_KEYS.map((key) => (
          <View key={key} style={styles.paramCard}>
            <View style={styles.paramHeader}>
              <Text style={styles.paramName}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
              <Text style={styles.paramScore}>
                {scores[key]}/3 — {GRBAS_SCALE_LABELS[scores[key]]}
              </Text>
            </View>
            <Text style={styles.paramFullLabel}>
              {GRBAS_LABELS[key as keyof typeof GRBAS_LABELS]}
            </Text>

            {/* Selector buttons */}
            <View style={styles.selectorRow}>
              {[0, 1, 2, 3].map((val) => (
                <TouchableOpacity
                  key={val}
                  style={[
                    styles.selectorBtn,
                    scores[key] === val && styles.selectorBtnActive,
                  ]}
                  onPress={() => setScore(key, val)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.selectorNum,
                    scores[key] === val && styles.selectorNumActive,
                  ]}>{val}</Text>
                  <Text style={[
                    styles.selectorLabel,
                    scores[key] === val && styles.selectorLabelActive,
                  ]}>{GRBAS_SCALE_LABELS[val]}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Dynamic description */}
            <View style={styles.descBox}>
              <Text style={styles.descText}>
                {GRBAS_DESCRIPTIONS[key][scores[key]]}
              </Text>
            </View>
          </View>
        ))}

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total GRBAS score</Text>
            <Text style={styles.summaryValue}>{total}/15</Text>
          </View>
          <View style={styles.summaryBarTrack}>
            <View style={[styles.summaryBarFill, { width: `${(total / 15) * 100}%` }]} />
          </View>
          <Text style={styles.summaryNote}>
            {total === 0
              ? 'No voice quality deviation perceived.'
              : total <= 5
              ? 'Mild deviation — voice quality is mostly normal.'
              : total <= 10
              ? 'Moderate deviation — multiple voice quality concerns.'
              : 'Significant deviation — consult your voice pathologist.'}
          </Text>
        </View>

        {/* Save */}
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => {
            const store = useStore.getState();
            if (!store.currentAssessment) store.startAssessment();
            store.updatePerceptual({
              grade: scores.grade,
              roughness: scores.roughness,
              breathiness: scores.breathiness,
              asthenia: scores.asthenia,
              strain: scores.strain,
              totalScore: total,
            });
            Alert.alert('Saved', `GRBAS scores saved.\nG:${scores.grade} R:${scores.roughness} B:${scores.breathiness} A:${scores.asthenia} S:${scores.strain}\nTotal: ${total}/15`);
            navigation.goBack();
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>Save GRBAS scores</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  header: { padding: spacing.xl, paddingBottom: spacing.sm },
  backBtn: { marginBottom: spacing.sm },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '500' },
  title: { ...typography.largeTitle, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.gray },
  scrollView: { flex: 1 },
  content: { padding: spacing.xl, paddingTop: spacing.lg },

  paramCard: {
    backgroundColor: colors.offWhite, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.lg,
  },
  paramHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 4,
  },
  paramName: { fontSize: 17, fontWeight: '600', color: colors.black },
  paramScore: { fontSize: 13, fontWeight: '500', color: colors.primary },
  paramFullLabel: { fontSize: 12, color: colors.gray, marginBottom: spacing.md },

  selectorRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  selectorBtn: {
    flex: 1, backgroundColor: colors.white, borderRadius: borderRadius.md,
    paddingVertical: spacing.md, alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.lightGray,
  },
  selectorBtnActive: {
    backgroundColor: colors.primary, borderColor: colors.primary,
  },
  selectorNum: { fontSize: 18, fontWeight: '600', color: colors.black },
  selectorNumActive: { color: colors.white },
  selectorLabel: { fontSize: 9, color: colors.lightText, marginTop: 2 },
  selectorLabelActive: { color: 'rgba(255,255,255,0.85)' },

  descBox: {
    backgroundColor: colors.white, borderRadius: borderRadius.sm,
    padding: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.primary,
  },
  descText: { fontSize: 13, color: colors.darkSlate, lineHeight: 19 },

  summaryCard: {
    backgroundColor: '#F0FFF0', borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.xl,
    borderWidth: 1, borderColor: '#C8E6C9',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  summaryLabel: { fontSize: 14, fontWeight: '600', color: colors.primaryDarkest },
  summaryValue: { fontSize: 20, fontWeight: '700', color: colors.primaryDarkest },
  summaryBarTrack: {
    height: 8, backgroundColor: '#C8E6C9', borderRadius: 4,
    overflow: 'hidden', marginBottom: spacing.md,
  },
  summaryBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  summaryNote: { fontSize: 13, color: colors.primaryDeep, lineHeight: 19 },

  saveBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.pill,
    paddingVertical: 16, alignItems: 'center', marginBottom: spacing.md,
  },
  saveBtnText: { fontSize: 17, fontWeight: '600', color: colors.white },
});
