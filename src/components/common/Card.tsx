import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, shadows, spacing } from '../../utils/theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated';
}

export function Card({ children, style, variant = 'default' }: Props) {
  return (
    <View style={[
      styles.card,
      variant === 'elevated' && styles.elevated,
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.offWhite,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  elevated: {
    backgroundColor: colors.white,
    ...shadows.card,
    borderWidth: 0.5,
    borderColor: colors.lightGray,
  },
});
