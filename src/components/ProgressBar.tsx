import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Slider } from './Slider';
import { colors, type } from '../theme';
import { formatDuration } from '../lib/utils';

interface ProgressBarProps {
  position: number;
  duration: number;
  onSeek: (value: number) => void;
  buffering?: boolean;
  variant?: 'time' | 'percent';
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function ProgressBar({ position, duration, onSeek, buffering, variant = 'time' }: ProgressBarProps) {
  const [scrubbing, setScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);

  const isPercent = variant === 'percent';
  const usable = isPercent ? 1 : duration > 0 ? duration : 0;
  const value = isPercent ? clamp01(position) : usable > 0 ? clamp01(position / usable) : 0;
  const shown = scrubbing ? scrubValue : value;

  const leftLabel = isPercent
    ? `${Math.round(shown * 100)}%`
    : formatDuration(scrubbing ? scrubValue * usable : position);
  const rightLabel = isPercent ? '100%' : formatDuration(usable);

  return (
    <View>
      <View style={styles.row}>
        <Text style={[styles.time, scrubbing && styles.activeTime]}>{leftLabel}</Text>
        <Text style={[styles.time, scrubbing && styles.activeTime]}>{rightLabel}</Text>
      </View>
      <Slider
        value={shown}
        accent
        disabled={!isPercent && usable <= 0}
        trackHeight={isPercent ? 6 : 4}
        onChange={(v) => {
          setScrubbing(true);
          setScrubValue(v);
        }}
        onCommit={(v) => {
          setScrubbing(false);
          if (isPercent || usable > 0) onSeek(isPercent ? v : v * usable);
        }}
      />
      {buffering && !scrubbing && !isPercent ? (
        <View style={styles.bufferingBadge}>
          <Text style={styles.bufferingText}>Buffering…</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: -4,
    marginTop: 10,
  },
  time: {
    color: colors.textMuted,
    fontSize: type.small,
    fontVariant: ['tabular-nums'],
  },
  activeTime: {
    color: colors.accent,
  },
  bufferingBadge: {
    marginTop: 2,
  },
  bufferingText: {
    color: colors.textMuted,
    fontSize: type.micro,
    textAlign: 'center',
  },
});