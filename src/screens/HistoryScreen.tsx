import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polyline, Circle, Line, Rect } from 'react-native-svg';
import { colors, spacing, borderRadius, typography } from '../utils/theme';
import { getRatingColor } from '../data/normativeData';
import { NormRating, AssessmentSession } from '../types';

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_W = SCREEN_W - 80;
const CHART_H = 140;

// Sample historical data — in production this comes from useStore().assessments
const SAMPLE_HISTORY: AssessmentSession[] = [
  {
    id: '1', date: '2026-02-01T10:00:00Z', vocalFitnessScore: 62,
    aerodynamic: { mptSeconds: 14.5, mptRating: 'mild', sSeconds: 14, zSeconds: 12, szRatio: 1.17, szRating: 'mild' },
    acoustic: { fundamentalFrequency: 205, f0Rating: 'normal', jitterPercent: 1.2, jitterRating: 'mild', shimmerPercent: 4.1, shimmerRating: 'mild', hnrDb: 18, hnrRating: 'mild' },
    perceptual: { grade: 2, roughness: 1, breathiness: 1, asthenia: 1, strain: 2, totalScore: 7 },
    vhi: { functional: 14, physical: 18, emotional: 10, totalScore: 42, severity: 'moderate' },
    interpretation: { overallRating: 'fair', primaryConcerns: ['strain'], recommendations: [] },
  },
  {
    id: '2', date: '2026-02-15T10:00:00Z', vocalFitnessScore: 68,
    aerodynamic: { mptSeconds: 16.1, mptRating: 'normal', sSeconds: 15, zSeconds: 14, szRatio: 1.07, szRating: 'normal' },
    acoustic: { fundamentalFrequency: 208, f0Rating: 'normal', jitterPercent: 1.0, jitterRating: 'normal', shimmerPercent: 3.6, shimmerRating: 'normal', hnrDb: 19, hnrRating: 'mild' },
    perceptual: { grade: 1, roughness: 1, breathiness: 1, asthenia: 0, strain: 2, totalScore: 5 },
    vhi: { functional: 10, physical: 14, emotional: 8, totalScore: 32, severity: 'moderate' },
    interpretation: { overallRating: 'good', primaryConcerns: ['strain'], recommendations: [] },
  },
  {
    id: '3', date: '2026-03-01T10:00:00Z', vocalFitnessScore: 74,
    aerodynamic: { mptSeconds: 17.8, mptRating: 'normal', sSeconds: 16, zSeconds: 15, szRatio: 1.07, szRating: 'normal' },
    acoustic: { fundamentalFrequency: 210, f0Rating: 'normal', jitterPercent: 0.9, jitterRating: 'normal', shimmerPercent: 3.4, shimmerRating: 'normal', hnrDb: 21, hnrRating: 'normal' },
    perceptual: { grade: 1, roughness: 1, breathiness: 0, asthenia: 0, strain: 1, totalScore: 3 },
    vhi: { functional: 8, physical: 10, emotional: 6, totalScore: 24, severity: 'mild' },
    interpretation: { overallRating: 'good', primaryConcerns: [], recommendations: [] },
  },
  {
    id: '4', date: '2026-03-15T10:00:00Z', vocalFitnessScore: 78,
    aerodynamic: { mptSeconds: 18.2, mptRating: 'normal', sSeconds: 16.5, zSeconds: 15, szRatio: 1.1, szRating: 'normal' },
    acoustic: { fundamentalFrequency: 210, f0Rating: 'normal', jitterPercent: 0.8, jitterRating: 'normal', shimmerPercent: 3.2, shimmerRating: 'normal', hnrDb: 22, hnrRating: 'normal' },
    perceptual: { grade: 1, roughness: 1, breathiness: 0, asthenia: 0, strain: 2, totalScore: 4 },
    vhi: { functional: 8, physical: 12, emotional: 6, totalScore: 26, severity: 'mild' },
    interpretation: { overallRating: 'good', primaryConcerns: [], recommendations: [] },
  },
];

// Simple SVG line chart component
function TrendChart({ data, min, max, color, height = CHART_H, label, unit }: {
  data: number[]; min: number; max: number; color: string;
  height?: number; label: string; unit: string;
}) {
  if (data.length < 2) return null;
  const w = CHART_W;
  const h = height;
  const pad = 16;
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = pad + (1 - (val - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  const pointCoords = data.map((val, i) => ({
    x: pad + (i / (data.length - 1)) * (w - pad * 2),
    y: pad + (1 - (val - min) / range) * (h - pad * 2),
    val,
  }));

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartLabel}>{label}</Text>
      <Svg width={w} height={h}>
        {/* Grid lines */}
        <Line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke={colors.lightGray} strokeWidth={0.5} />
        <Line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke={colors.lightGray} strokeWidth={0.5} />
        <Line x1={pad} y1={h / 2} x2={w - pad} y2={h / 2} stroke={colors.lightGray} strokeWidth={0.5} strokeDasharray="4,4" />

        {/* Line */}
        <Polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {pointCoords.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={4} fill={color} stroke="#fff" strokeWidth={2} />
        ))}
      </Svg>
      <View style={styles.chartValueRow}>
        {pointCoords.map((p, i) => (
          <Text key={i} style={[styles.chartPointLabel, { color, left: p.x - 15, width: 30 }]}>
            {Math.round(p.val * 10) / 10}{unit}
          </Text>
        ))}
      </View>
    </View>
  );
}

export default function HistoryScreen({ navigation }: any) {
  const history = SAMPLE_HISTORY;

  const scores = history.map((h) => h.vocalFitnessScore);
  const mpts = history.map((h) => h.aerodynamic.mptSeconds);
  const szRatios = history.map((h) => h.aerodynamic.szRatio);
  const grbas = history.map((h) => h.perceptual.totalScore);
  const vhiScores = history.map((h) => h.vhi?.totalScore ?? 0);

  const latestScore = scores[scores.length - 1];
  const firstScore = scores[0];
  const delta = latestScore - firstScore;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Assessment history</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Summary hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroLabel}>Overall trend</Text>
            <Text style={[styles.heroScore, { color: delta >= 0 ? colors.primary : colors.danger }]}>
              {delta >= 0 ? '+' : ''}{delta} pts
            </Text>
            <Text style={styles.heroSub}>across {history.length} assessments</Text>
          </View>
          <View style={styles.heroRight}>
            <Text style={styles.heroLatestLabel}>Latest</Text>
            <Text style={styles.heroLatest}>{latestScore}</Text>
            <Text style={styles.heroLatestSub}>/100</Text>
          </View>
        </View>

        {/* Vocal Fitness Score trend */}
        <TrendChart
          data={scores}
          min={Math.min(...scores) - 10}
          max={Math.max(...scores) + 10}
          color={colors.primary}
          label="Vocal fitness score"
          unit=""
        />

        {/* MPT trend */}
        <TrendChart
          data={mpts}
          min={Math.min(...mpts) - 3}
          max={Math.max(...mpts) + 3}
          color="#42A5F5"
          label="Maximum phonation time"
          unit="s"
        />

        {/* GRBAS trend (lower is better) */}
        <TrendChart
          data={grbas}
          min={0}
          max={15}
          color="#EF6C00"
          label="GRBAS total (lower = better)"
          unit=""
        />

        {/* VHI trend */}
        <TrendChart
          data={vhiScores}
          min={0}
          max={Math.max(...vhiScores) + 10}
          color="#E53935"
          label="VHI total (lower = better)"
          unit=""
        />

        {/* Assessment timeline */}
        <Text style={styles.sectionTitle}>TIMELINE</Text>
        <View style={styles.timeline}>
          {history.slice().reverse().map((session, i) => {
            const date = new Date(session.date);
            const scoreColor = session.vocalFitnessScore >= 80 ? colors.primary
              : session.vocalFitnessScore >= 60 ? colors.warning : colors.danger;

            return (
              <View key={session.id} style={styles.timelineItem}>
                <View style={styles.timelineLine}>
                  <View style={[styles.timelineDot, { backgroundColor: scoreColor }]} />
                  {i < history.length - 1 && <View style={styles.timelineConnector} />}
                </View>
                <View style={styles.timelineCard}>
                  <View style={styles.timelineCardHeader}>
                    <Text style={styles.timelineDate}>
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                    <View style={[styles.timelineScoreBadge, { backgroundColor: scoreColor + '20' }]}>
                      <Text style={[styles.timelineScoreText, { color: scoreColor }]}>
                        {session.vocalFitnessScore}/100
                      </Text>
                    </View>
                  </View>
                  <View style={styles.timelineMetrics}>
                    <Text style={styles.timelineMetric}>MPT: {session.aerodynamic.mptSeconds}s</Text>
                    <Text style={styles.timelineMetric}>S/Z: {session.aerodynamic.szRatio}</Text>
                    <Text style={styles.timelineMetric}>GRBAS: {session.perceptual.totalScore}/15</Text>
                    {session.vhi && (
                      <Text style={styles.timelineMetric}>VHI: {session.vhi.totalScore}/120</Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  header: { padding: spacing.xl, paddingBottom: spacing.md },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '500', marginBottom: spacing.sm },
  title: { ...typography.largeTitle },
  scrollView: { flex: 1 },
  content: { padding: spacing.xl, paddingTop: 0 },

  // Hero
  heroCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.offWhite, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.xl,
  },
  heroLeft: { flex: 1 },
  heroLabel: { fontSize: 12, color: colors.lightText, marginBottom: 4 },
  heroScore: { fontSize: 32, fontWeight: '700' },
  heroSub: { fontSize: 12, color: colors.lightText, marginTop: 2 },
  heroRight: { alignItems: 'center' },
  heroLatestLabel: { fontSize: 10, color: colors.lightText },
  heroLatest: { fontSize: 36, fontWeight: '700', color: colors.primary },
  heroLatestSub: { fontSize: 13, color: colors.lightText },

  // Chart
  chartContainer: { marginBottom: spacing.xl },
  chartLabel: {
    fontSize: 13, fontWeight: '600', color: colors.gray,
    marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  chartValueRow: { position: 'relative', height: 16 },
  chartPointLabel: { position: 'absolute', fontSize: 9, textAlign: 'center', fontWeight: '600' },

  // Timeline
  sectionTitle: {
    fontSize: 11, fontWeight: '600', color: colors.lightText,
    letterSpacing: 0.5, marginBottom: spacing.md, marginTop: spacing.md,
  },
  timeline: { gap: 0 },
  timelineItem: { flexDirection: 'row', minHeight: 90 },
  timelineLine: { width: 24, alignItems: 'center' },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  timelineConnector: {
    width: 2, flex: 1, backgroundColor: colors.lightGray, marginTop: 4,
  },
  timelineCard: {
    flex: 1, backgroundColor: colors.offWhite, borderRadius: borderRadius.lg,
    padding: spacing.md + 2, marginLeft: spacing.sm, marginBottom: spacing.md,
  },
  timelineCardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.sm,
  },
  timelineDate: { fontSize: 13, fontWeight: '500', color: colors.black },
  timelineScoreBadge: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: borderRadius.pill,
  },
  timelineScoreText: { fontSize: 11, fontWeight: '600' },
  timelineMetrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  timelineMetric: { fontSize: 12, color: colors.gray },
});
