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
import { Gender, Profession } from '../../types';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const PROFESSION_OPTIONS: { value: Profession; label: string }[] = [
  { value: 'teacher', label: 'Teacher' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'medical', label: 'Medical' },
  { value: 'vocal_coach', label: 'Vocal Coach' },
  { value: 'other', label: 'Other' },
];

export default function EditProfileScreen({ navigation }: any) {
  const user = useStore((s) => s.user);
  const updateUser = useStore((s) => s.updateUser);

  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [gender, setGender] = useState<Gender>(user?.gender || 'female');
  const [profession, setProfession] = useState<Profession>(user?.profession || 'teacher');
  const [dailyHours, setDailyHours] = useState(user?.dailySpeakingHours?.toString() || '');

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }
    updateUser({
      name: name.trim(),
      age: parseInt(age) || 0,
      gender,
      profession,
      dailySpeakingHours: parseFloat(dailyHours) || 0,
    });
    Alert.alert('Saved', 'Your profile has been updated.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit profile</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.placeholder} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Age</Text>
          <TextInput style={styles.input} value={age} onChangeText={setAge} placeholder="Age" keyboardType="numeric" placeholderTextColor={colors.placeholder} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.optionRow}>
            {GENDER_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.optionBtn, gender === opt.value && styles.optionBtnActive]}
                onPress={() => setGender(opt.value)}
              >
                <Text style={[styles.optionText, gender === opt.value && styles.optionTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Profession</Text>
          <View style={styles.optionRow}>
            {PROFESSION_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.optionBtn, profession === opt.value && styles.optionBtnActive]}
                onPress={() => setProfession(opt.value)}
              >
                <Text style={[styles.optionText, profession === opt.value && styles.optionTextActive]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Daily speaking hours</Text>
          <TextInput style={styles.input} value={dailyHours} onChangeText={setDailyHours} placeholder="e.g. 6" keyboardType="numeric" placeholderTextColor={colors.placeholder} />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>Save changes</Text>
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

  field: { marginBottom: spacing.xl },
  label: { fontSize: 13, fontWeight: '600', color: colors.gray, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: colors.offWhite, borderRadius: borderRadius.md,
    padding: spacing.md, fontSize: 16, color: colors.black,
    borderWidth: 1, borderColor: colors.lightGray,
  },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  optionBtn: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: borderRadius.pill, borderWidth: 1.5, borderColor: colors.lightGray,
    backgroundColor: colors.offWhite,
  },
  optionBtnActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  optionText: { fontSize: 14, fontWeight: '500', color: colors.black },
  optionTextActive: { color: colors.white },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.pill,
    paddingVertical: 16, alignItems: 'center', marginTop: spacing.md,
  },
  saveBtnText: { fontSize: 17, fontWeight: '600', color: colors.white },
});
