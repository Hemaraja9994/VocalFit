import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../utils/theme';
import { useStore } from '../store/useStore';

const PROFILE_MENU = [
  { id: 'edit', label: 'Edit profile', icon: '👤' },
  { id: 'medical', label: 'Medical history', icon: '🏥' },
  { id: 'history', label: 'Assessment history', icon: '📈' },
  { id: 'hygiene', label: 'Vocal hygiene settings', icon: '🛡' },
  { id: 'export', label: 'Export reports', icon: '📤' },
  { id: 'about', label: 'About VocalFit', icon: 'ℹ️' },
];

export default function ProfileScreen({ navigation }: any) {
  const user = useStore((s) => s.user);
  const displayName = user?.name || 'Dr. Voice User';
  const displayRole = user ? `${user.profession} · ${user.dailySpeakingHours} hrs/day` : 'University faculty · 6 hrs/day';
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const handleMenuPress = (id: string, label: string) => {
    if (id === 'history') {
      navigation.navigate('History');
    } else if (id === 'export') {
      navigation.navigate('ExportReport');
    } else {
      Alert.alert(label, `The ${label.toLowerCase()} screen will be available in a future update.`);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar & Name */}
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDeep]}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userRole}>{displayRole}</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Assessments</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>7</Text>
            <Text style={styles.statLabel}>Day streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>78</Text>
            <Text style={styles.statLabel}>Vocal score</Text>
          </View>
        </View>

        {/* Vocal Demand Badge */}
        <View style={styles.demandCard}>
          <View style={styles.demandLeft}>
            <Text style={styles.demandLabel}>Vocal demand level</Text>
            <Text style={styles.demandValue}>High</Text>
          </View>
          <View style={styles.demandBar}>
            <View style={styles.demandBarFill} />
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuList}>
          {PROFILE_MENU.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.id, item.label)}
              activeOpacity={0.7}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Version */}
        <Text style={styles.version}>VocalFit v1.0.0 · Phase 1</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    paddingTop: spacing.lg,
  },

  // Profile header
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.white,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: colors.lightText,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.offWhite,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.lightText,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.lightGray,
  },

  // Demand card
  demandCard: {
    backgroundColor: colors.offWhite,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
  },
  demandLeft: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  demandLabel: {
    fontSize: 13,
    color: colors.gray,
  },
  demandValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.warning,
  },
  demandBar: {
    height: 6,
    backgroundColor: colors.lightGray,
    borderRadius: 3,
    overflow: 'hidden',
  },
  demandBarFill: {
    width: '75%',
    height: '100%',
    backgroundColor: colors.warning,
    borderRadius: 3,
  },

  // Menu
  menuList: {
    gap: 2,
    marginBottom: spacing.xxl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.lightGray,
    gap: spacing.md,
  },
  menuIcon: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.black,
  },
  menuChevron: {
    fontSize: 20,
    color: colors.placeholder,
  },

  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.placeholder,
  },
});
