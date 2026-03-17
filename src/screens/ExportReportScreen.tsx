import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { colors, spacing, borderRadius, typography } from '../utils/theme';
import { generateReportHTML } from '../utils/reportGenerator';
import { useStore } from '../store/useStore';
import { NormRating } from '../types';

// Sample assessment for demo — in production pull from useStore().assessments
const SAMPLE_SESSION = {
  id: 'rpt-' + Date.now(),
  date: new Date().toISOString(),
  vocalFitnessScore: 78,
  aerodynamic: { mptSeconds: 18.2, mptRating: 'normal' as NormRating, sSeconds: 16.5, zSeconds: 15, szRatio: 1.1, szRating: 'normal' as NormRating },
  acoustic: { fundamentalFrequency: 210, f0Rating: 'normal' as NormRating, jitterPercent: 0.8, jitterRating: 'normal' as NormRating, shimmerPercent: 3.2, shimmerRating: 'normal' as NormRating, hnrDb: 22, hnrRating: 'normal' as NormRating },
  perceptual: { grade: 1, roughness: 1, breathiness: 0, asthenia: 0, strain: 2, totalScore: 4 },
  vhi: { functional: 8, physical: 12, emotional: 6, totalScore: 26, severity: 'mild' as const },
  interpretation: { overallRating: 'good' as const, primaryConcerns: ['strain'], recommendations: [] },
};

const SAMPLE_VFI = {
  fatigue: 14, physicalDiscomfort: 8, restRecovery: 28, totalScore: 50, severity: 'mild' as const,
};

export default function ExportReportScreen({ navigation }: any) {
  const { user } = useStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfUri, setPdfUri] = useState<string | null>(null);

  const defaultUser = user || {
    id: '0', name: 'Dr. Voice User', age: 35, gender: 'female' as const,
    profession: 'faculty' as const, dailySpeakingHours: 6, vocalDemands: 'high' as const,
    medicalHistory: { acidReflux: false, smoking: false, allergies: true, asthma: false, thyroidDisorder: false, previousVocalSurgery: false, hearingLoss: false, notes: '' },
    createdAt: new Date().toISOString(),
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const html = generateReportHTML({
        user: defaultUser,
        session: SAMPLE_SESSION as any,
        vfi: SAMPLE_VFI,
      });

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      setPdfUri(uri);
      Alert.alert('PDF generated', 'Your vocal health report is ready to share or save.');
    } catch (err) {
      Alert.alert('Error', 'Could not generate PDF. Please try again.');
    }
    setIsGenerating(false);
  };

  const handleShare = async () => {
    if (!pdfUri) return;
    const available = await Sharing.isAvailableAsync();
    if (!available) {
      Alert.alert('Sharing not available', 'Sharing is not supported on this device.');
      return;
    }
    await Sharing.shareAsync(pdfUri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Share Vocal Health Report',
      UTI: 'com.adobe.pdf',
    });
  };

  const handlePreview = async () => {
    if (!pdfUri) {
      // Generate and print directly
      setIsGenerating(true);
      try {
        const html = generateReportHTML({
          user: defaultUser,
          session: SAMPLE_SESSION as any,
          vfi: SAMPLE_VFI,
        });
        await Print.printAsync({ html });
      } catch (err) {
        Alert.alert('Error', 'Could not preview report.');
      }
      setIsGenerating(false);
    } else {
      await Print.printAsync({ uri: pdfUri });
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Export report</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>

        {/* Preview card */}
        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewLogo}>VocalFit</Text>
            <Text style={styles.previewDate}>
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </Text>
          </View>
          <View style={styles.previewBody}>
            <View style={styles.previewScoreCircle}>
              <Text style={styles.previewScore}>{SAMPLE_SESSION.vocalFitnessScore}</Text>
            </View>
            <View style={styles.previewInfo}>
              <Text style={styles.previewName}>{defaultUser.name}</Text>
              <Text style={styles.previewSub}>{defaultUser.profession} · {defaultUser.age} yrs</Text>
            </View>
          </View>
          <View style={styles.previewMetrics}>
            <View style={styles.previewMetric}><Text style={styles.pmValue}>{SAMPLE_SESSION.aerodynamic.mptSeconds}s</Text><Text style={styles.pmLabel}>MPT</Text></View>
            <View style={styles.previewMetric}><Text style={styles.pmValue}>{SAMPLE_SESSION.aerodynamic.szRatio}</Text><Text style={styles.pmLabel}>S/Z</Text></View>
            <View style={styles.previewMetric}><Text style={styles.pmValue}>{SAMPLE_SESSION.perceptual.totalScore}/15</Text><Text style={styles.pmLabel}>GRBAS</Text></View>
            <View style={styles.previewMetric}><Text style={styles.pmValue}>{SAMPLE_SESSION.vhi?.totalScore}/120</Text><Text style={styles.pmLabel}>VHI</Text></View>
          </View>
          <Text style={styles.previewNote}>Full report includes acoustic parameters, VFI, clinical norms, and recommendations</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {!pdfUri ? (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleGeneratePDF}
              disabled={isGenerating}
              activeOpacity={0.85}
            >
              {isGenerating ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.primaryBtnText}>Generate PDF report</Text>
              )}
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleShare} activeOpacity={0.85}>
                <Text style={styles.primaryBtnText}>Share PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.outlineBtn} onPress={handlePreview} activeOpacity={0.85}>
                <Text style={styles.outlineBtnText}>Preview / Print</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ghostBtn} onPress={() => setPdfUri(null)}>
                <Text style={styles.ghostBtnText}>Generate new report</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity style={styles.outlineBtn} onPress={handlePreview} activeOpacity={0.85}>
            <Text style={styles.outlineBtnText}>Quick preview (no save)</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What's in the report?</Text>
          <Text style={styles.infoBody}>
            The PDF contains your complete vocal health assessment:{'\n\n'}
            • Patient information and vocal demand profile{'\n'}
            • Vocal Fitness Score with severity rating{'\n'}
            • Aerodynamic parameters (MPT, S/Z ratio) with norms{'\n'}
            • Acoustic parameters (F0, jitter, shimmer, HNR){'\n'}
            • GRBAS perceptual ratings with bar charts{'\n'}
            • VHI subscale scores and severity{'\n'}
            • VFI fatigue burden and recovery scores{'\n'}
            • Clinical disclaimer and normative references
          </Text>
        </View>

        <View style={{ height: 40 }} />
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

  // Preview
  previewCard: {
    backgroundColor: colors.offWhite, borderRadius: borderRadius.xl,
    padding: spacing.xl, marginBottom: spacing.xl,
    borderWidth: 1, borderColor: colors.lightGray,
  },
  previewHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.lg,
  },
  previewLogo: { fontSize: 20, fontWeight: '700', color: colors.primary },
  previewDate: { fontSize: 12, color: colors.lightText },
  previewBody: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginBottom: spacing.lg,
  },
  previewScoreCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  previewScore: { fontSize: 24, fontWeight: '700', color: colors.white },
  previewInfo: {},
  previewName: { fontSize: 16, fontWeight: '600', color: colors.black },
  previewSub: { fontSize: 13, color: colors.gray, marginTop: 2 },
  previewMetrics: {
    flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md,
  },
  previewMetric: {
    flex: 1, backgroundColor: colors.white, borderRadius: borderRadius.md,
    padding: spacing.sm, alignItems: 'center',
  },
  pmValue: { fontSize: 14, fontWeight: '600', color: colors.black },
  pmLabel: { fontSize: 10, color: colors.lightText, marginTop: 1 },
  previewNote: { fontSize: 11, color: colors.lightText, fontStyle: 'italic' },

  // Actions
  actions: { gap: spacing.md, marginBottom: spacing.xl },
  primaryBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.pill,
    paddingVertical: 16, alignItems: 'center',
  },
  primaryBtnText: { fontSize: 16, fontWeight: '600', color: colors.white },
  outlineBtn: {
    borderWidth: 1.5, borderColor: colors.primary, borderRadius: borderRadius.pill,
    paddingVertical: 14, alignItems: 'center',
  },
  outlineBtnText: { fontSize: 15, fontWeight: '600', color: colors.primary },
  ghostBtn: { alignItems: 'center', paddingVertical: 10 },
  ghostBtnText: { fontSize: 14, color: colors.gray },

  // Info
  infoCard: {
    backgroundColor: '#F0FFF0', borderRadius: borderRadius.lg,
    padding: spacing.lg, borderWidth: 1, borderColor: '#C8E6C9',
  },
  infoTitle: { fontSize: 14, fontWeight: '600', color: colors.primaryDarkest, marginBottom: spacing.sm },
  infoBody: { fontSize: 13, color: colors.primaryDeep, lineHeight: 20 },
});
