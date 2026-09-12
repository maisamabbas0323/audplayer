import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BackButton } from '../components/BackButton';
import { NowPlaying } from '../components/NowPlaying';
import { colors, spacing, type, fontWeight } from '../theme';
import { useApp } from '../context/AppProvider';
import { useDockPadding } from '../hooks/useDockPadding';

export function PlayScreen({ onBack }: { onBack: () => void }) {
  const {
    current,
    isPlaying,
    isBuffering,
    position,
    duration,
    shuffle,
    repeat,
    favorites,
    queue,
    error,
    toggle,
    next,
    previous,
    seekTo,
    toggleShuffle,
    cycleRepeat,
    toggleFavorite,
    openQueue,
  } = useApp();

  const bottomPad = useDockPadding();

  return (
    <View style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.backSlot}>
          <BackButton onPress={onBack} />
        </View>
        <Text style={styles.headerTitle}>Now playing</Text>
      </View>

      <View style={styles.body}>
        <NowPlaying
          track={current}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          position={position}
          duration={duration}
          shuffle={shuffle}
          repeat={repeat}
          isFavorite={current ? favorites.includes(current.id) : false}
          hasQueue={queue.length > 0}
          error={error}
          onToggle={toggle}
          onNext={next}
          onPrevious={previous}
          onSeek={seekTo}
          onToggleShuffle={toggleShuffle}
          onCycleRepeat={cycleRepeat}
          onToggleFavorite={() => {
            if (current) toggleFavorite(current.id);
          }}
          onOpenQueue={openQueue}
        />
      </View>

      <View style={[styles.dockSpacer, { height: bottomPad }]} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xs,
  },
  backSlot: {
    position: 'absolute',
    left: spacing.lg,
    top: spacing.md,
  },
  headerTitle: {
    color: colors.textSecondary,
    fontSize: type.small,
    fontWeight: fontWeight.medium,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  body: {
    flex: 1,
  },
  dockSpacer: {
    width: '100%',
  },
});