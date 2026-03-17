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
import { VHI_ITEMS, VHI_SCALE_OPTIONS } from '../../data/vhiItems';
import { rateVHI, getRatingColor } from '../../data/normativeData';

const ITEMS_PER_PAGE = 5;
const TOTAL_PAGES = Math.ceil(VHI_ITEMS.length / ITEMS_PER_PAGE);

const SUBSCALE_COLORS = {
  functional: '#42A5F5',
  physical: '#A4D65E',
  emotional: '#FF7043',
};

export default function VHIScreen({ navigation }: any) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [page, setPage] = useState(0);

  const currentItems = VHI_ITEMS.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === VHI_ITEMS.length;

  const subscaleScores = useMemo(() => {
    const scores = { functional: 0, physical: 0, emotional: 0 };
    for (const [id, val] of Object.entries(answers)) {
      const item = VHI_ITEMS.find((i) => i.id === Number(id));
      if (item) scores[item.subscale] += val;
    }
    return scores;
  }, [answers]);

  const totalScore = subscaleScores.functional + subscaleScores.physical + subscaleScores.emotional;

  const setAnswer = (itemId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [itemId]: value }));
  };

  const pageAllAnswered = currentItems.every((item) => answers[item.id] !== undefined);

  const handleFinish = () => {
    const severity = rateVHI(totalScore);
    Alert.alert(
      'VHI Complete',
      `Total Score: ${totalScore}/120 (${severity})\n\nFunctional: ${subscaleScores.functional}/40\nPhysical: ${subscaleScores.physical}/40\nEmotional: ${subscaleScores.emotional}/40`,
      [{ text: 'Save & Close', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Voice Handicap Index</Text>
        <Text style={styles.subtitle}>Rate how often each statement applies to you</Text>
      </View>

      {/* Progress bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(answeredCount / 30) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>{answeredCount}/30 answered · Page {page + 1}/{TOTAL_PAGES}</Text>
      </View>

      {/* Subscale mini-scores */}
      <View style={styles.subscaleRow}>
        {(['functional', 'physical', 'emotional'] as const).map((sub) => (
          <View key={sub} style={styles.subscaleItem}>
            <View style={[styles.subscaleDot, { backgroundColor: SUBSCALE_COLORS[sub] }]} />
            <Text style={styles.subscaleLabel}>{sub.charAt(0).toUpperCase() + sub.slice(1)}</Text>
            <Text style={styles.subscaleScore}>{subscaleScores[sub]}/40</Text>
          </View>
        ))}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {currentItems.map((item, idx) => {
          const globalIdx = page * ITEMS_PER_PAGE + idx + 1;
          const subColor = SUBSCALE_COLORS[item.subscale];

          return (
            <View key={item.id} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <View style={[styles.qBadge, { backgroundColor: subColor + '20' }]}>
                  <Text style={[styles.qBadgeText, { color: subColor }]}>
                    Q{globalIdx}
                  </Text>
                </View>
                <View style={[styles.subscalePill, { backgroundColor: subColor + '15' }]}>
                  <Text style={[styles.subscalePillText, { color: subColor }]}>
                    {item.subscale}
                  </Text>
                </View>
              </View>
              <Text style={styles.questionText}>{item.text}</Text>

              <View style={styles.optionsRow}>
                {VHI_SCALE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.optionBtn,
                      answers[item.id] === opt.value && [styles.optionBtnActive, { borderColor: subColor, backgroundColor: subColor }],
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
              style={[styles.navBtnPrimary, !allAnswered && styles.navBtnDisabled]}
              onPress={allAnswered ? handleFinish : undefined}
              disabled={!allAnswered}
            >
              <Text style={styles.navBtnPrimaryText}>Finish</Text>
            </TouchableOpacity>
          )}
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

  progressContainer: { paddingHorizontal: spacing.xl, marginBottom: spacing.sm },
  progressBar: {
    height: 6, backgroundColor: colors.lightGray, borderRadius: 3,
    overflow: 'hidden', marginBottom: spacing.xs,
  },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  progressText: { fontSize: 12, color: colors.lightText },

  subscaleRow: {
    flexDirection: 'row', paddingHorizontal: spacing.xl,
    gap: spacing.lg, marginBottom: spacing.md,
  },
  subscaleItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  subscaleDot: { width: 8, height: 8, borderRadius: 4 },
  subscaleLabel: { fontSize: 11, color: colors.gray },
  subscaleScore: { fontSize: 11, fontWeight: '600', color: colors.black },

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
  subscalePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: borderRadius.pill },
  subscalePillText: { fontSize: 10, fontWeight: '500' },
  questionText: { fontSize: 15, color: colors.black, lineHeight: 22, marginBottom: spacing.md },

  optionsRow: { flexDirection: 'row', gap: 6 },
  optionBtn: {
    flex: 1, alignItems: 'center', paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm, borderWidth: 1.5, borderColor: colors.lightGray,
    backgroundColor: colors.white,
  },
  optionBtnActive: {},
  optionValue: { fontSize: 16, fontWeight: '600', color: colors.black },
  optionValueActive: { color: colors.white },
  optionLabel: { fontSize: 8, color: colors.lightText, marginTop: 1 },
  optionLabelActive: { color: 'rgba(255,255,255,0.85)' },

  navRow: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: spacing.lg, gap: spacing.md,
  },
  navBtn: {
    paddingVertical: 12, paddingHorizontal: 20,
    borderRadius: borderRadius.pill, borderWidth: 1.5, borderColor: colors.lightGray,
  },
  navBtnText: { fontSize: 14, fontWeight: '500', color: colors.gray },
  navBtnPrimary: {
    paddingVertical: 12, paddingHorizontal: 24,
    borderRadius: borderRadius.pill, backgroundColor: colors.primary,
  },
  navBtnPrimaryText: { fontSize: 14, fontWeight: '600', color: colors.white },
  navBtnDisabled: { opacity: 0.4 },
});
