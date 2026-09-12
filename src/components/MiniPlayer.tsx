import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Artwork } from './Artwork';
import { Icon } from './Icon';
import { colors, radius, spacing, shadow, type, fontWeight } from '../theme';

interface MiniPlayerProps {
  title: string;
  artist: string | null;
  artworkUri: string | null;
  isPlaying: boolean;
  error: string | null;
  onPlayPause: () => void;
  onNext: () => void;
  onExpand: () => void;
}

export function MiniPlayer({
  title,
  artist,
  artworkUri,
  isPlaying,
  error,
  onPlayPause,
  onNext,
  onExpand,
}: MiniPlayerProps) {
  return (
    <Pressable
      onPress={onExpand}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Now playing: ${title}`}
    >
      <Artwork uri={artworkUri} title={title} size={40} radiusSize={radius.sm} iconSize={14} />
      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={1}>
          {error ? 'Playback unavailable' : title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {error ?? artist ?? 'Unknown artist'}
        </Text>
      </View>
      <View style={styles.controls}>
        <Pressable
          onPress={(e) => {
            (e as unknown as { stopPropagation?: () => void }).stopPropagation?.();
            onPlayPause();
          }}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
          style={({ pressed }) => [styles.roundBtn, pressed && styles.roundBtnPressed]}
        >
          <Icon name={isPlaying ? 'pause' : 'play'} size={15} color={colors.text} />
        </Pressable>
        <Pressable
          onPress={(e) => {
            (e as unknown as { stopPropagation?: () => void }).stopPropagation?.();
            onNext();
          }}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Next track"
          style={({ pressed }) => [styles.roundBtn, pressed && styles.roundBtnPressed]}
        >
          <Icon name="next" size={17} color={colors.textSecondary} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  pressed: {
    backgroundColor: colors.surface,
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.text,
    fontSize: type.label,
    fontWeight: fontWeight.semibold,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: type.small,
    marginTop: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  roundBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundBtnPressed: {
    transform: [{ scale: 0.92 }],
    backgroundColor: colors.surfaceRaised,
  },
});