import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { Artwork } from './Artwork';
import { Icon } from './Icon';
import { ProgressBar } from './ProgressBar';
import { colors, radius, spacing, type, fontWeight } from '../theme';
import type { RepeatMode, Track } from '../types/music';

interface NowPlayingProps {
  track: Track | null;
  isPlaying: boolean;
  isBuffering: boolean;
  position: number;
  duration: number;
  shuffle: boolean;
  repeat: RepeatMode;
  isFavorite: boolean;
  hasQueue: boolean;
  error: string | null;
  onToggle: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (seconds: number) => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onToggleFavorite: () => void;
  onOpenQueue: () => void;
}

export function NowPlaying({
  track,
  isPlaying,
  isBuffering,
  position,
  duration,
  shuffle,
  repeat,
  isFavorite,
  hasQueue,
  error,
  onToggle,
  onNext,
  onPrevious,
  onSeek,
  onToggleShuffle,
  onCycleRepeat,
  onToggleFavorite,
  onOpenQueue,
}: NowPlayingProps) {
  const { width } = useWindowDimensions();
  const artSize = Math.min(width - spacing.xxxl * 2, 360);

  if (!track) {
    return (
      <View style={styles.emptyWrap}>
        <View style={styles.emptyIcon}>
          <Icon name="disc" size={44} color={colors.textMuted} strokeWidth={1.4} />
        </View>
        <Text style={styles.emptyTitle}>Nothing playing</Text>
        <Text style={styles.emptyMessage}>
          Choose a track from your library to start listening.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {error ? (
        <View style={styles.errorBanner}>
          <Icon name="info" size={15} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.artWrap}>
        <Artwork
          uri={track.artworkUri}
          title={track.title}
          size={artSize}
          radiusSize={radius.xl}
          iconSize={Math.round(artSize * 0.3)}
        />
      </View>

      <View style={styles.titleBlock}>
        <Text style={styles.title} numberOfLines={2}>
          {track.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track.artist ?? 'Unknown artist'}
        </Text>
        {track.album ? (
          <Text style={styles.album} numberOfLines={1}>
            {track.album}
          </Text>
        ) : null}
      </View>

      <View style={styles.progressWrap}>
        <ProgressBar
          position={position}
          duration={duration}
          onSeek={onSeek}
          buffering={isBuffering && isPlaying}
        />
      </View>

      <View style={styles.mainControls}>
        <Pressable
          onPress={onPrevious}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Previous track"
          style={({ pressed }) => [styles.sideBtn, pressed && styles.btnPressed]}
        >
          <Icon name="previous" size={30} color={colors.text} />
        </Pressable>

        <Pressable
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? 'Pause' : 'Play'}
          style={({ pressed }) => [
            styles.playButton,
            pressed && styles.playPressed,
          ]}
        >
          <Icon
            name={isPlaying ? 'pause' : 'play'}
            size={28}
            color={colors.onAccent}
            strokeWidth={2}
          />
        </Pressable>

        <Pressable
          onPress={onNext}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Next track"
          style={({ pressed }) => [styles.sideBtn, pressed && styles.btnPressed]}
        >
          <Icon name="next" size={30} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.secondary}>
        <Pressable
          onPress={onToggleShuffle}
          accessibilityRole="button"
          accessibilityState={{ checked: shuffle }}
          accessibilityLabel="Shuffle"
          style={({ pressed }) => [styles.secBtn, pressed && styles.btnPressed]}
        >
          <Icon
            name="shuffle"
            size={20}
            color={shuffle ? colors.accent : colors.textSecondary}
          />
        </Pressable>
        <Pressable
          onPress={onCycleRepeat}
          accessibilityRole="button"
          accessibilityState={{ checked: repeat !== 'off' }}
          accessibilityLabel={`Repeat: ${repeat}`}
          style={({ pressed }) => [styles.secBtn, pressed && styles.btnPressed]}
>
<Icon
              name="repeat"
              size={20}
              color={repeat !== 'off' ? colors.accent : colors.textSecondary}
            />
          {repeat === 'one' ? <View style={styles.oneDot} /> : null}
        </Pressable>
        <Pressable
          onPress={onToggleFavorite}
          accessibilityRole="button"
          accessibilityState={{ checked: isFavorite }}
          accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          style={({ pressed }) => [styles.secBtn, pressed && styles.btnPressed]}
        >
          <Icon
            name={isFavorite ? 'heartFill' : 'heart'}
            size={20}
            color={isFavorite ? colors.accent : colors.textSecondary}
          />
        </Pressable>
        <Pressable
          onPress={onOpenQueue}
          accessibilityRole="button"
          accessibilityState={{ disabled: !hasQueue }}
          accessibilityLabel="Queue"
          style={({ pressed }) => [styles.secBtn, pressed && styles.btnPressed]}
        >
          <Icon name="queue" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: 24,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: type.heading,
    fontWeight: fontWeight.semibold,
  },
  emptyMessage: {
    color: colors.textMuted,
    fontSize: type.body,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 21,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    alignSelf: 'stretch',
  },
  errorText: {
    color: colors.danger,
    fontSize: type.small,
    flexShrink: 1,
  },
  artWrap: {
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 16 },
    elevation: 18,
  },
  titleBlock: {
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: type.heading,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  artist: {
    color: colors.textSecondary,
    fontSize: type.subtitle,
  },
  album: {
    color: colors.textMuted,
    fontSize: type.small,
  },
  progressWrap: {
    width: '100%',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    marginTop: spacing.md,
  },
  sideBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPressed: {
    transform: [{ scale: 0.92 }],
  },
  playButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  playPressed: {
    backgroundColor: colors.accentPressed,
    transform: [{ scale: 0.96 }],
  },
  secondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.xxl,
  },
  secBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  oneDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
});