import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing } from '../../utils/theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  disabled?: boolean;
}

export function PillButton({ title, onPress, variant = 'primary', size = 'medium', style, disabled }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[
        styles.text,
        styles[`${variant}Text` as keyof typeof styles],
        styles[`${size}Text` as keyof typeof styles],
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  medium: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  large: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary,
  },
  ghostText: {
    color: colors.primary,
  },
  smallText: {
    fontSize: 13,
  },
  mediumText: {
    fontSize: 15,
  },
  largeText: {
    fontSize: 17,
  },
});
