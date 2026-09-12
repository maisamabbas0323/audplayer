import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Artwork } from './Artwork';
import { Icon } from './Icon';
import { colors, radius, spacing, type, fontWeight } from '../theme';
import { formatDuration } from '../lib/utils';
import type { Track } from '../types/music';

interface TrackRowProps {
  track: Track;
  active?: boolean;
  compact?: boolean;
  showAlbum?: boolean;
  isFavorite?: boolean;
  index?: number;
  onPress?: (track: Track) => void;
  onMore?: (track: Track) => void;
}

export function TrackRow({
  track,
  active,
  compact,
  showAlbum,
  isFavorite,
  onPress,
  onMore,
}: TrackRowProps) {
  const dense = compact;
  const artworkSize = dense ? 38 : 46;

  return (
    <Pressable
      onPress={() => onPress?.(track)}
      style={({ pressed }) => [
        styles.row,
        dense ? styles.rowDense : null,
        pressed && styles.rowPressed,
        active && styles.rowActive,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${track.title}${track.artist ? ` by ${track.artist}` : ''}`}
    >
      <View style={styles.artSlot}>
        <Artwork
          uri={track.artworkUri}
          title={track.title}
          size={artworkSize}
          radiusSize={radius.sm}
          iconSize={dense ? 14 : 17}
        />
        {active ? (
          <View style={styles.playingBadge}>
            <Icon name="play" size={dense ? 10 : 12} color={colors.onAccent} />
          </View>
        ) : null}
      </View>

      <View style={styles.textCol}>
        <View style={styles.titleRow}>
          <Text
            style={[styles.title, active && styles.titleActive]}
            numberOfLines={1}
          >
            {track.title}
          </Text>
          {isFavorite ? (
            <Icon name="heartFill" size={11} color={colors.accent} />
          ) : null}
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {[track.artist, showAlbum ? track.album : null].filter(Boolean).join(' · ') ||
            (track.artist ? track.artist : 'Unknown artist')}
        </Text>
      </View>

      <View style={styles.right}>
        {track.unavailable ? (
          <Text style={[styles.duration, styles.unavailable]}>Missing</Text>
        ) : (
          <Text style={styles.duration}>
            {formatDuration(track.duration)}
          </Text>
        )}
        <Pressable
          onPress={(e) => {
            (e as unknown as { stopPropagation?: () => void }).stopPropagation?.();
            onMore?.(track);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
          style={({ pressed }) => [styles.more, pressed && styles.morePressed]}
          accessibilityRole="button"
          accessibilityLabel={`Options for ${track.title}`}
        >
          <Icon name="more" size={17} color={colors.textMuted} />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    gap: spacing.md,
  },
  rowDense: {
    paddingVertical: spacing.sm - 1,
  },
  rowPressed: {
    backgroundColor: colors.surface,
  },
  rowActive: {
    backgroundColor: colors.surface,
  },
  artSlot: {
    position: 'relative',
  },
  playingBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  textCol: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: type.label,
    fontWeight: fontWeight.medium,
    flexShrink: 1,
  },
  titleActive: {
    color: colors.accent,
  },
  meta: {
    color: colors.textMuted,
    fontSize: type.small,
    marginTop: 2,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  duration: {
    color: colors.textMuted,
    fontSize: type.small,
    fontVariant: ['tabular-nums'],
    minWidth: 42,
    textAlign: 'right',
  },
  unavailable: {
    color: colors.danger,
  },
  more: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  morePressed: {
    backgroundColor: colors.border,
  },
});