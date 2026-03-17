import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, typography } from '../../utils/theme';

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  statusText?: string;
  statusColor?: string;
}

export function MetricCard({ label, value, unit, statusText, statusColor }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      {statusText && (
        <Text style={[styles.status, { color: statusColor || colors.primary }]}>
          {statusText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.offWhite,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flex: 1,
  },
  label: {
    ...typography.small,
    marginBottom: spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.black,
  },
  unit: {
    fontSize: 13,
    color: colors.lightText,
    marginLeft: 2,
  },
  status: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
});
