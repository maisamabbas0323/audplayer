import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Artwork } from './Artwork';
import { Icon } from './Icon';
import { BottomSheet } from './BottomSheet';
import { EmptyState } from './EmptyState';
import { colors, radius, spacing, type, fontWeight } from '../theme';
import type { Track } from '../types/music';

interface QueueSheetProps {
  visible: boolean;
  onClose: () => void;
  queue: Track[];
  currentId: string | null;
  isPlaying: boolean;
  onPlayIndex: (index: number) => void;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
  onClear: () => void;
}

export function QueueSheet({
  visible,
  onClose,
  queue,
  currentId,
  isPlaying,
  onPlayIndex,
  onRemove,
  onMove,
  onClear,
}: QueueSheetProps) {
  const title =
    queue.length > 0
      ? `Up next · ${queue.length} ${queue.length === 1 ? 'track' : 'tracks'}`
      : 'Queue';

  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      {queue.length === 0 ? (
        <EmptyState
          icon="queue"
          title="Your queue is empty"
          message="Add tracks from your library and they'll appear here."
        />
      ) : (
        <FlatList
          data={queue}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => {
            const isCurrent = item.id === currentId;
            return (
              <View style={[styles.row, isCurrent && styles.rowCurrent]}>
                <Pressable
                  style={styles.main}
                  onPress={() => onPlayIndex(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`Play ${item.title}`}
                >
                  <Artwork
                    uri={item.artworkUri}
                    title={item.title}
                    size={38}
                    radiusSize={radius.sm}
                    iconSize={14}
                  />
                  <View style={styles.textWrap}>
                    <Text
                      style={[styles.title, isCurrent && styles.titleCurrent]}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.meta} numberOfLines={1}>
                      {item.artist ?? 'Unknown artist'}
                    </Text>
                  </View>
                  {isCurrent ? (
                    <Icon
                      name={isPlaying ? 'play' : 'pause'}
                      size={11}
                      color={colors.accent}
                    />
                  ) : null}
                </Pressable>
                <View style={styles.actions}>
                  <Pressable
                    onPress={() => onMove(index, index - 1)}
                    disabled={index === 0}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel="Move up"
                    style={({ pressed }) => [styles.iconBtn, index === 0 && styles.disabled, pressed && styles.iconBtnPressed]}
                  >
                    <Icon name="chevronUp" size={15} color={colors.textMuted} />
                  </Pressable>
                  <Pressable
                    onPress={() => onMove(index, index + 1)}
                    disabled={index === queue.length - 1}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel="Move down"
                    style={({ pressed }) => [
                      styles.iconBtn,
                      index === queue.length - 1 && styles.disabled,
                      pressed && styles.iconBtnPressed,
                    ]}
                  >
                    <Icon name="chevronDown" size={15} color={colors.textMuted} />
                  </Pressable>
                  <Pressable
                    onPress={() => onRemove(index)}
                    hitSlop={6}
                    accessibilityRole="button"
                    accessibilityLabel="Remove from queue"
                    style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
                  >
                    <Icon name="close" size={14} color={colors.textMuted} />
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      )}
      {queue.length > 0 ? (
        <Pressable
          onPress={onClear}
          style={({ pressed }) => [styles.clearBtn, pressed && styles.clearPressed]}
          accessibilityRole="button"
        >
          <Text style={styles.clearLabel}>Clear queue</Text>
        </Pressable>
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  list: {
    flexGrow: 0,
    maxHeight: 420,
  },
  listContent: {
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.sm,
    paddingRight: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    marginHorizontal: spacing.md,
  },
  rowCurrent: {
    backgroundColor: colors.surface,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.text,
    fontSize: type.label,
    fontWeight: fontWeight.medium,
  },
  titleCurrent: {
    color: colors.accent,
  },
  meta: {
    color: colors.textMuted,
    fontSize: type.small,
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  iconBtn: {
    width: 30,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPressed: {
    backgroundColor: colors.border,
  },
  disabled: {
    opacity: 0.3,
  },
  clearBtn: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clearPressed: {
    backgroundColor: colors.surface,
  },
  clearLabel: {
    color: colors.textSecondary,
    fontSize: type.label,
    fontWeight: fontWeight.medium,
  },
});