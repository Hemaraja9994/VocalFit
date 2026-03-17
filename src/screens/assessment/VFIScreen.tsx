import React, { useState, useMemo } from 'react';
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
import { VFI_ITEMS, VFI_SCALE_OPTIONS, VFI_FACTOR_LABELS, rateVFI } from '../../data/vfiItems';

const ITEMS_PER_PAGE = 5;
const TOTAL_PAGES = Math.ceil(VFI_ITEMS.length / ITEMS_PER_PAGE);

const FACTOR_COLORS = {
  fatigue: '#EF6C00',
  physical_discomfort: '#E53935',
  rest_recovery: '#43A047',
};

const FACTOR_MAX = {
  fatigue: 44,
  physical_discomfort: 36,
  rest_recovery: 36,
};

export default function VFIScreen({ navigation }: any) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [page, setPage] = useState(0);

  const currentItems = VFI_ITEMS.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === VFI_ITEMS.length;

  const factorScores = useMemo(() => {
    const scores = { fatigue: 0, physical_discomfort: 0, rest_recovery: 0 };
    for (const [id, val] of Object.entries(answers)) {
      const item = VFI_ITEMS.find((i) => i.id === Number(id));
      if (item) scores[item.factor] += val;
    }
    return scores;
  }, [answers]);

  const fatigueBurden = factorScores.fatigue + factorScores.physical_discomfort;
  const totalScore = fatigueBurden + factorScores.rest_recovery;

  const setAnswer = (itemId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [itemId]: value }));
  };

  const pageAllAnswered = currentItems.every((item) => answers[item.id] !== undefined);

  const handleFinish = () => {
    const severity = rateVFI(factorScores.fatigue, factorScores.physical_discomfort);
    Alert.alert(
      'VFI Complete',
      `Fatigue Burden: ${fatigueBurden}/80 (${severity})\n\n` +
      `Factor 1 — Tiredness & avoidance: ${factorScores.fatigue}/${FACTOR_MAX.fatigue}\n` +
      `Factor 2 — Physical discomfort: ${factorScores.physical_discomfort}/${FACTOR_MAX.physical_discomfort}\n` +
      `Factor 3 — Recovery with rest: ${factorScores.rest_recovery}/${FACTOR_MAX.rest_recovery}\n\n` +
      `Note: Higher Factor 3 means better recovery — that's a positive sign.`,
      [{ text: 'Save & Close', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Vocal Fatigue Index</Text>
        <Text style={styles.subtitle}>How does vocal fatigue affect you?</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(answeredCount / VFI_ITEMS.length) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{answeredCount}/{VFI_ITEMS.length} answered · Page {page + 1}/{TOTAL_PAGES}</Text>
      </View>

      {/* Factor score cards */}
      <View style={styles.factorRow}>
        {(Object.keys(FACTOR_COLORS) as Array<keyof typeof FACTOR_COLORS>).map((factor) => {
          const c = FACTOR_COLORS[factor];
          const max = FACTOR_MAX[factor];
          const score = factorScores[factor];
          const pct = max > 0 ? score / max : 0;

          return (
            <View key={factor} style={styles.factorCard}>
              <View style={[styles.factorDot, { backgroundColor: c }]} />
              <Text style={styles.factorLabel} numberOfLines={1}>
                {factor === 'fatigue' ? 'Tiredness' : factor === 'physical_discomfort' ? 'Discomfort' : 'Recovery'}
              </Text>
              <Text style={[styles.factorScore, { color: c }]}>{score}/{max}</Text>
              <View style={styles.factorBarTrack}>
                <View style={[styles.factorBarFill, { width: `${pct * 100}%`, backgroundColor: c }]} />
              </View>
            </View>
          );
        })}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {currentItems.map((item, idx) => {
          const globalIdx = page * ITEMS_PER_PAGE + idx + 1;
          const factorColor = FACTOR_COLORS[item.factor];
          const factorLabel = VFI_FACTOR_LABELS[item.factor];

          return (
            <View key={item.id} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <View style={[styles.qBadge, { backgroundColor: factorColor + '20' }]}>
                  <Text style={[styles.qBadgeText, { color: factorColor }]}>
                    Q{globalIdx}
                  </Text>
                </View>
                <View style={[styles.factorPill, { backgroundColor: factorColor + '12' }]}>
                  <View style={[styles.factorPillDot, { backgroundColor: factorColor }]} />
                  <Text style={[styles.factorPillText, { color: factorColor }]}>
                    {factorLabel}
                  </Text>
                </View>
              </View>
              <Text style={styles.questionText}>{item.text}</Text>

              <View style={styles.optionsRow}>
                {VFI_SCALE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.optionBtn,
                      answers[item.id] === opt.value && {
                        borderColor: factorColor,
                        backgroundColor: factorColor,
                      },
                    ]}
                    onPress={() => setAnswer(item.id, opt.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.optionValue,
                      answers[item.id] === opt.value && styles.optionValueActive,
                    ]}>{opt.value}</Text>
                    <Text style={[
                      styles.optionLabel,
                      answers[item.id] === opt.value && styles.optionLabelActive,
                    ]}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}

        {/* Navigation */}
        <View style={styles.navRow}>
          {page > 0 && (
            <TouchableOpacity style={styles.navBtn} onPress={() => setPage(page - 1)}>
              <Text style={styles.navBtnText}>‹ Previous</Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          {page < TOTAL_PAGES - 1 ? (
            <TouchableOpacity
              style={[styles.navBtnPrimary, !pageAllAnswered && styles.navBtnDisabled]}
              onPress={() => pageAllAnswered && setPage(page + 1)}
              disabled={!pageAllAnswered}
            >
              <Text style={styles.navBtnPrimaryText}>Next ›</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navBtnFinish, !allAnswered && styles.navBtnDisabled]}
              onPress={allAnswered ? handleFinish : undefined}
              disabled={!allAnswered}
            >
              <Text style={styles.navBtnFinishText}>Complete VFI</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Interpretation note */}
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>About the VFI</Text>
          <Text style={styles.noteBody}>
            The Vocal Fatigue Index (Nanjundeswaran et al., 2015) measures three dimensions of vocal fatigue experienced by professional voice users.{'\n\n'}
            Factors 1 and 2 (tiredness + discomfort) represent your "fatigue burden" — lower is better.{'\n'}
            Factor 3 (recovery) measures how well rest helps — higher is better.
          </Text>
        </View>

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

  progressContainer: { paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  progressBar: {
    height: 6, backgroundColor: colors.lightGray, borderRadius: 3,
    overflow: 'hidden', marginBottom: spacing.xs,
  },
  progressFill: { height: '100%', backgroundColor: '#EF6C00', borderRadius: 3 },
  progressText: { fontSize: 12, color: colors.lightText },

  factorRow: {
    flexDirection: 'row', paddingHorizontal: spacing.xl,
    gap: spacing.sm, marginBottom: spacing.md,
  },
  factorCard: {
    flex: 1, backgroundColor: colors.offWhite, borderRadius: borderRadius.md,
    padding: spacing.sm + 2,
  },
  factorDot: { width: 6, height: 6, borderRadius: 3, marginBottom: 4 },
  factorLabel: { fontSize: 10, color: colors.gray, marginBottom: 2 },
  factorScore: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  factorBarTrack: { height: 3, backgroundColor: colors.lightGray, borderRadius: 2, overflow: 'hidden' },
  factorBarFill: { height: '100%', borderRadius: 2 },

  scrollView: { flex: 1 },
  content: { padding: spacing.xl, paddingTop: spacing.sm },

  questionCard: {
    backgroundColor: colors.offWhite, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.md,
  },
  questionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    marginBottom: spacing.md,
  },
  qBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.sm },
  qBadgeText: { fontSize: 11, fontWeight: '600' },
  factorPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.pill,
  },
  factorPillDot: { width: 5, height: 5, borderRadius: 3 },
  factorPillText: { fontSize: 10, fontWeight: '500' },
  questionText: { fontSize: 15, color: colors.black, lineHeight: 22, marginBottom: spacing.md },

  optionsRow: { flexDirection: 'row', gap: 6 },
  optionBtn: {
    flex: 1, alignItems: 'center', paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm, borderWidth: 1.5, borderColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  optionValue: { fontSize: 16, fontWeight: '600', color: colors.black },
  optionValueActive: { color: colors.white },
  optionLabel: { fontSize: 8, color: colors.lightText, marginTop: 1 },
  optionLabelActive: { color: 'rgba(255,255,255,0.85)' },

  navRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg, gap: spacing.md },
  navBtn: {
    paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: borderRadius.pill, borderWidth: 1.5, borderColor: colors.lightGray,
  },
  navBtnText: { fontSize: 14, fontWeight: '500', color: colors.gray },
  navBtnPrimary: {
    paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: borderRadius.pill, backgroundColor: '#EF6C00',
  },
  navBtnPrimaryText: { fontSize: 14, fontWeight: '600', color: colors.white },
  navBtnFinish: {
    paddingVertical: 14, paddingHorizontal: 28,
    borderRadius: borderRadius.pill, backgroundColor: '#EF6C00',
  },
  navBtnFinishText: { fontSize: 15, fontWeight: '600', color: colors.white },
  navBtnDisabled: { opacity: 0.4 },

  noteCard: {
    backgroundColor: '#FFF3E0', borderRadius: borderRadius.lg,
    padding: spacing.lg, marginTop: spacing.lg,
    borderWidth: 1, borderColor: '#FFE0B2',
  },
  noteTitle: { fontSize: 14, fontWeight: '600', color: '#E65100', marginBottom: spacing.sm },
  noteBody: { fontSize: 13, color: '#BF360C', lineHeight: 19 },
});
