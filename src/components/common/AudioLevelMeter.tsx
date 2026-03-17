import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../utils/theme';

interface Props {
  db: number;
  barCount?: number;
  height?: number;
  activeColor?: string;
  isActive?: boolean;
}

function dbToLinear(db: number): number {
  const clamped = Math.max(-60, Math.min(0, db));
  return (clamped + 60) / 60;
}

export function AudioLevelMeter({
  db,
  barCount = 20,
  height = 60,
  activeColor = colors.primary,
  isActive = true,
}: Props) {
  const level = isActive ? dbToLinear(db) : 0;
  const activeBars = Math.round(level * barCount);

  return (
    <View style={[styles.container, { height }]}>
      {Array.from({ length: barCount }).map((_, i) => {
        const isOn = i < activeBars;
        const ratio = i / barCount;
        const barColor = !isOn ? colors.lightGray : ratio < 0.6 ? activeColor : ratio < 0.85 ? '#FBBF24' : '#EF4444';
        const barHeight = isOn ? height : 4;

        return (
          <View
            key={i}
            style={{
              width: 6,
              height: barHeight,
              borderRadius: 3,
              backgroundColor: barColor,
              minHeight: 4,
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 3,
  },
});
