import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, type, fontWeight } from '../theme';

export interface ImportProgress {
  active: boolean;
  phase: 'copy' | 'duration' | 'walking' | 'picking' | 'scanning';
  total: number;
  done: number;
}

interface ImportOverlayProps {
  progress: ImportProgress;
}

export function ImportOverlay({ progress }: ImportOverlayProps) {
  if (!progress.active) return null;

  const label =
    progress.phase === 'scanning'
      ? 'Finding your music…'
      : progress.phase === 'walking'
        ? 'Looking through the folder…'
        : progress.phase === 'duration'
          ? 'Reading track info'
          : 'Adding music';

  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <ActivityIndicator color={colors.accent} size="small" />
        <View style={styles.textWrap}>
          <Text style={styles.label}>{label}</Text>
          {progress.total > 0 ? (
            <Text style={styles.sub}>
              {Math.min(progress.done, progress.total)} of {progress.total} · {pct}%
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,11,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    minWidth: 220,
    maxWidth: '85%',
  },
  textWrap: {
    flexShrink: 1,
  },
  label: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: fontWeight.semibold,
  },
  sub: {
    color: colors.textMuted,
    fontSize: type.small,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
});