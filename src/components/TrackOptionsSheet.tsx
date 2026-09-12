import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Artwork } from './Artwork';
import { ActionSheet } from './ActionSheet';
import { colors, radius, spacing, type, fontWeight } from '../theme';
import type { Track } from '../types/music';

interface TrackOptionsSheetProps {
  visible: boolean;
  onClose: () => void;
  track: Track | null;
  isFavorite: boolean;
  onToggleFavorite: (track: Track) => void;
  onPlayNext: (track: Track) => void;
  onAddToQueue: (track: Track) => void;
  onAddToPlaylist: (track: Track) => void;
  onRemove: (track: Track) => void;
}

export function TrackOptionsSheet({
  visible,
  onClose,
  track,
  isFavorite,
  onToggleFavorite,
  onPlayNext,
  onAddToQueue,
  onAddToPlaylist,
  onRemove,
}: TrackOptionsSheetProps) {
  return (
    <ActionSheet
      visible={visible}
      onClose={onClose}
      title="Track options"
      header={
        track ? (
          <View style={styles.header}>
            <Artwork uri={track.artworkUri} title={track.title} size={48} radiusSize={radius.sm} iconSize={16} />
            <View style={styles.meta}>
              <Text style={styles.titleName} numberOfLines={1}>
                {track.title}
              </Text>
              <Text style={styles.metaName} numberOfLines={1}>
                {track.artist ?? 'Unknown artist'}
              </Text>
            </View>
          </View>
        ) : null
      }
      actions={
        track
          ? [
              {
                key: 'play-next',
                label: 'Play next',
                icon: 'next',
                onPress: () => onPlayNext(track),
              },
              {
                key: 'add-queue',
                label: 'Add to queue',
                icon: 'queue',
                onPress: () => onAddToQueue(track),
              },
              {
                key: 'add-playlist',
                label: 'Add to playlist',
                icon: 'playlist',
                closeOnPress: false,
                onPress: () => onAddToPlaylist(track),
              },
              {
                key: 'favorite',
                label: isFavorite ? 'Remove from favorites' : 'Add to favorites',
                icon: isFavorite ? 'heartFill' : 'heart',
                tint: isFavorite ? 'accent' : 'default',
                checked: isFavorite,
                onPress: () => onToggleFavorite(track),
              },
              {
                key: 'remove',
                label: 'Remove from library',
                icon: 'trash',
                destructive: true,
                onPress: () => onRemove(track),
              },
            ]
          : []
      }
    />
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: spacing.md,
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  titleName: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: fontWeight.semibold,
  },
  metaName: {
    color: colors.textMuted,
    fontSize: type.small,
    marginTop: 2,
  },
});