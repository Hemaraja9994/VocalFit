import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';

export default function AboutScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Logo / Identity */}
        <View style={styles.logoSection}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDeep]}
            style={styles.logoCircle}
          >
            <Text style={styles.logoText}>VF</Text>
          </LinearGradient>
          <Text style={styles.appName}>VocalFit</Text>
          <Text style={styles.version}>Version 1.0.0 · Phase 1</Text>
        </View>

        {/* Description */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About VocalFit</Text>
          <Text style={styles.cardBody}>
            VocalFit is a comprehensive vocal health assessment and therapy app designed for professional voice users. It combines standardized clinical measures with evidence-based therapy exercises to help you monitor, maintain, and improve your vocal health.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Features</Text>
          <Text style={styles.feature}>• Maximum Phonation Time (MPT) measurement</Text>
          <Text style={styles.feature}>• S/Z Ratio analysis</Text>
          <Text style={styles.feature}>• GRBAS perceptual voice quality rating</Text>
          <Text style={styles.feature}>• Voice Handicap Index (VHI) questionnaire</Text>
          <Text style={styles.feature}>• Vocal Fatigue Index (VFI) assessment</Text>
          <Text style={styles.feature}>• Personalized therapy exercise programs</Text>
          <Text style={styles.feature}>• Vocal hygiene tracking & habits</Text>
          <Text style={styles.feature}>• Progress monitoring & report generation</Text>
        </View>

        {/* Clinical References */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Clinical references</Text>
          <Text style={styles.reference}>• VFI: Nanjundeswaran et al. (2015)</Text>
          <Text style={styles.reference}>• VHI: Jacobson et al. (1997)</Text>
          <Text style={styles.reference}>• GRBAS: Hirano (1981)</Text>
          <Text style={styles.reference}>• MPT norms: Kent et al. (1987)</Text>
          <Text style={styles.reference}>• SOVT exercises: Titze (2006)</Text>
        </View>

        {/* Credits */}
        <View style={styles.creditCard}>
          <Text style={styles.creditTitle}>Developed & Designed by</Text>
          <Text style={styles.creditName}>Hemaraja Nayaka S</Text>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            This app is intended for self-monitoring and educational purposes only. It does not provide clinical diagnosis. For professional evaluation, consult a certified speech-language pathologist or voice pathologist.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  header: { padding: spacing.xl, paddingBottom: 0 },
  backBtn: { marginBottom: spacing.sm },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '500' },
  scrollView: { flex: 1 },
  content: { padding: spacing.xl, paddingTop: spacing.md },

  logoSection: { alignItems: 'center', marginBottom: spacing.xxl },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  logoText: { fontSize: 28, fontWeight: '700', color: colors.white },
  appName: { fontSize: 24, fontWeight: '700', color: colors.black, marginBottom: 4 },
  version: { fontSize: 14, color: colors.lightText },

  card: {
    backgroundColor: colors.offWhite, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.lg,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.black, marginBottom: spacing.sm },
  cardBody: { fontSize: 14, color: colors.gray, lineHeight: 22 },
  feature: { fontSize: 14, color: colors.darkSlate, lineHeight: 24, paddingLeft: spacing.xs },
  reference: { fontSize: 13, color: colors.gray, lineHeight: 22, paddingLeft: spacing.xs },

  creditCard: {
    backgroundColor: '#F0FFF0', borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.lg, alignItems: 'center',
    borderWidth: 1, borderColor: '#C8E6C9',
  },
  creditTitle: { fontSize: 13, color: colors.primaryDeep, marginBottom: 4 },
  creditName: { fontSize: 18, fontWeight: '600', color: colors.primaryDarkest },

  disclaimer: {
    backgroundColor: colors.offWhite, borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  disclaimerText: { fontSize: 11, color: colors.lightText, lineHeight: 17, fontStyle: 'italic' },
});
