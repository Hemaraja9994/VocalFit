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
import { WATER_GOAL } from '../../data/hygieneDefaults';

export default function VocalHygieneSettingsScreen({ navigation }: any) {
  const todayLog = useStore((s) => s.todayLog);
  const setTodayLog = useStore((s) => s.setTodayLog);

  const [waterGoal, setWaterGoal] = useState(todayLog?.waterGoal?.toString() || WATER_GOAL.toString());

  const handleSave = () => {
    const goal = parseInt(waterGoal) || WATER_GOAL;
    if (todayLog) {
      setTodayLog({ ...todayLog, waterGoal: goal });
    }
    Alert.alert('Saved', 'Vocal hygiene settings updated.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Vocal hygiene settings</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily water goal</Text>
          <Text style={styles.cardDesc}>How many glasses of water would you like to drink daily?</Text>
          <TextInput
            style={styles.input}
            value={waterGoal}
            onChangeText={setWaterGoal}
            keyboardType="numeric"
            placeholderTextColor={colors.placeholder}
          />
          <Text style={styles.hint}>Recommended: 8 glasses per day for vocal health</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily habits checklist</Text>
          <Text style={styles.cardDesc}>Your current daily vocal hygiene habits:</Text>
          {todayLog?.habits.map((habit, i) => (
            <View key={habit.id} style={styles.habitRow}>
              <Text style={styles.habitNum}>{i + 1}.</Text>
              <Text style={styles.habitLabel}>{habit.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Vocal hygiene tips</Text>
          <Text style={styles.tipItem}>• Stay hydrated throughout the day</Text>
          <Text style={styles.tipItem}>• Avoid shouting or prolonged loud speaking</Text>
          <Text style={styles.tipItem}>• Take vocal naps (10 min silence) regularly</Text>
          <Text style={styles.tipItem}>• Avoid clearing your throat — swallow instead</Text>
          <Text style={styles.tipItem}>• Use steam inhalation to moisturize vocal folds</Text>
          <Text style={styles.tipItem}>• Warm up your voice before heavy speaking days</Text>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>Save settings</Text>
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
  title: { ...typography.largeTitle },
  scrollView: { flex: 1 },
  content: { padding: spacing.xl, paddingTop: spacing.sm },

  card: {
    backgroundColor: colors.offWhite, borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.lg,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: colors.black, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: colors.gray, marginBottom: spacing.md },
  input: {
    backgroundColor: colors.white, borderRadius: borderRadius.md,
    padding: spacing.md, fontSize: 18, fontWeight: '600', color: colors.black,
    borderWidth: 1, borderColor: colors.lightGray, textAlign: 'center', width: 80,
  },
  hint: { fontSize: 12, color: colors.lightText, marginTop: spacing.sm, fontStyle: 'italic' },

  habitRow: { flexDirection: 'row', gap: 8, paddingVertical: 6 },
  habitNum: { fontSize: 14, color: colors.lightText, width: 20 },
  habitLabel: { fontSize: 14, color: colors.black, flex: 1 },

  tipsCard: {
    backgroundColor: '#F0FFF0', borderRadius: borderRadius.lg,
    padding: spacing.lg, marginBottom: spacing.xl,
    borderWidth: 1, borderColor: '#C8E6C9',
  },
  tipsTitle: { fontSize: 15, fontWeight: '600', color: colors.primaryDarkest, marginBottom: spacing.md },
  tipItem: { fontSize: 13, color: colors.primaryDeep, lineHeight: 22 },

  saveBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.pill,
    paddingVertical: 16, alignItems: 'center',
  },
  saveBtnText: { fontSize: 17, fontWeight: '600', color: colors.white },
});
