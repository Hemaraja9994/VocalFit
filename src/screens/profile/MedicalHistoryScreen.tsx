import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '../../utils/theme';
import { useStore } from '../../store/useStore';

const MEDICAL_ITEMS = [
  { key: 'acidReflux', label: 'Acid reflux / GERD' },
  { key: 'smoking', label: 'Smoking' },
  { key: 'allergies', label: 'Allergies' },
  { key: 'asthma', label: 'Asthma' },
  { key: 'thyroidDisorder', label: 'Thyroid disorder' },
  { key: 'previousVocalSurgery', label: 'Previous vocal surgery' },
  { key: 'hearingLoss', label: 'Hearing loss' },
] as const;

export default function MedicalHistoryScreen({ navigation }: any) {
  const user = useStore((s) => s.user);
  const updateUser = useStore((s) => s.updateUser);

  const defaultHistory = user?.medicalHistory || {
    acidReflux: false, smoking: false, allergies: false, asthma: false,
    thyroidDisorder: false, previousVocalSurgery: false, hearingLoss: false, notes: '',
  };

  const [history, setHistory] = useState(defaultHistory);

  const toggle = (key: string) => {
    setHistory((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    updateUser({ medicalHistory: history });
    Alert.alert('Saved', 'Medical history updated.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Medical history</Text>
        <Text style={styles.subtitle}>Select any conditions that apply to you</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {MEDICAL_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.itemRow}
            onPress={() => toggle(item.key)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, (history as any)[item.key] && styles.checkboxChecked]}>
              {(history as any)[item.key] && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.itemLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.field}>
          <Text style={styles.label}>Additional notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={history.notes}
            onChangeText={(t) => setHistory((prev) => ({ ...prev, notes: t }))}
            placeholder="Any other medical conditions or medications..."
            placeholderTextColor={colors.placeholder}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.white },
  header: { padding: spacing.xl, paddingBottom: spacing.md },
  backBtn: { marginBottom: spacing.sm },
  backText: { fontSize: 16, color: colors.primary, fontWeight: '500' },
  title: { ...typography.largeTitle, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.gray },
  scrollView: { flex: 1 },
  content: { padding: spacing.xl, paddingTop: spacing.md },

  itemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: colors.lightGray,
  },
  checkbox: {
    width: 24, height: 24, borderRadius: 6, borderWidth: 1.5,
    borderColor: colors.placeholder, alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkmark: { fontSize: 14, color: colors.white, fontWeight: '700' },
  itemLabel: { fontSize: 16, color: colors.black, flex: 1 },

  field: { marginTop: spacing.xl },
  label: { fontSize: 13, fontWeight: '600', color: colors.gray, marginBottom: spacing.sm, textTransform: 'uppercase' },
  input: {
    backgroundColor: colors.offWhite, borderRadius: borderRadius.md,
    padding: spacing.md, fontSize: 15, color: colors.black,
    borderWidth: 1, borderColor: colors.lightGray,
  },
  textArea: { minHeight: 100 },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.pill,
    paddingVertical: 16, alignItems: 'center', marginTop: spacing.xxl,
  },
  saveBtnText: { fontSize: 17, fontWeight: '600', color: colors.white },
});
