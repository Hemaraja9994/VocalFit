import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../../utils/theme';

interface Props {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  rightText?: string;
  rightColor?: string;
  onPress?: () => void;
}

export function SectionRow({ icon, title, subtitle, rightText, rightColor, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.container}
    >
      {icon && <View style={styles.iconBox}>{icon}</View>}
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {rightText && (
        <Text style={[styles.rightText, rightColor ? { color: rightColor } : undefined]}>
          {rightText}
        </Text>
      )}
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.offWhite,
    borderRadius: borderRadius.lg,
    padding: spacing.lg + 2,
    gap: 14,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.black,
  },
  subtitle: {
    fontSize: 12,
    color: colors.lightText,
    marginTop: 2,
  },
  rightText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.primary,
  },
  chevron: {
    fontSize: 20,
    color: colors.lightText,
    marginLeft: 4,
  },
});
