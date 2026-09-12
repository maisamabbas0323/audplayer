import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Artwork } from './Artwork';
import { Icon } from './Icon';
import { EmptyState } from './EmptyState';
import { BottomSheet } from './BottomSheet';
import { colors, radius, spacing, type, fontWeight } from '../theme';
import type { Playlist, Track } from '../types/music';

interface PlaylistDetailSheetProps {
  visible: boolean;
  onClose: () => void;
  playlist: Playlist | null;
  tracks: Track[];
  currentId: string | null;
  onPlayAll?: (trackIds: string[]) => void;
  onPlayTrack: (trackId: string) => void;
  onRename: (id: string, name: string) => void;
  onRemoveTrack: (playlistId: string, trackId: string) => void;
  onDeleteRequest: (id: string) => void;
}

export function PlaylistDetailSheet({
  visible,
  onClose,
  playlist,
  tracks,
  currentId,
  onPlayAll,
  onPlayTrack,
  onRename,
  onRemoveTrack,
  onDeleteRequest,
}: PlaylistDetailSheetProps) {
  const [name, setName] = useState(playlist?.name ?? '');
  const [editing, setEditing] = useState(false);

  React.useEffect(() => {
    if (playlist) {
      setName(playlist.name);
      setEditing(false);
    }
  }, [playlist]);

  if (!playlist) return null;
  const orderedTracks = playlist.trackIds
    .map((id) => tracks.find((t) => t.id === id))
    .filter((t): t is Track => t != null);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={playlist.name}>
      <View style={styles.actions}>
        <Pressable
          onPress={() => onPlayAll?.(playlist.trackIds)}
          disabled={orderedTracks.length === 0}
          style={({ pressed }) => [
            styles.playAll,
            pressed && styles.playAllPressed,
            orderedTracks.length === 0 && styles.disabled,
          ]}
          accessibilityRole="button"
        >
          <Icon name="play" size={30} color={colors.onAccent} />
        </Pressable>
        <Pressable
          onPress={() => setEditing((v) => !v)}
          accessibilityRole="button"
          style={({ pressed }) => [styles.toolBtn, pressed && styles.toolPressed]}
        >
          <Icon name="edit" size={18} color={colors.textSecondary} />
        </Pressable>
        <Pressable
          onPress={() => onDeleteRequest(playlist.id)}
          accessibilityRole="button"
          style={({ pressed }) => [styles.toolBtn, pressed && styles.toolPressed]}
        >
          <Icon name="trash" size={18} color={colors.danger} />
        </Pressable>
      </View>

      {editing ? (
        <View style={styles.renameRow}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Playlist name"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.accent}
            accessibilityLabel="Playlist name"
          />
          <Pressable
            onPress={() => {
              const n = name.trim();
              if (n) onRename(playlist.id, n);
              setEditing(false);
            }}
            accessibilityRole="button"
            style={({ pressed }) => [styles.renameBtn, pressed && styles.createPressed]}
          >
            <Icon name="check" size={18} color={colors.onAccent} />
          </Pressable>
        </View>
      ) : null}

      {orderedTracks.length === 0 ? (
        <EmptyState
          icon="playlist"
          title="No tracks yet"
          message="Add tracks to this playlist from your library."
        />
      ) : (
        <FlatList
          data={orderedTracks}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={[styles.row, currentId === item.id && styles.rowCurrent]}>
              <Pressable
                style={styles.rowMain}
                onPress={() => onPlayTrack(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`Play ${item.title}`}
              >
                <Artwork uri={item.artworkUri} title={item.title} size={38} radiusSize={radius.sm} iconSize={14} />
                <View style={styles.rowText}>
                  <Text style={styles.rowName} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.rowMeta} numberOfLines={1}>
                    {item.artist ?? 'Unknown artist'}
                  </Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() => onRemoveTrack(playlist.id, item.id)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${item.title} from playlist`}
                style={({ pressed }) => [styles.removeBtn, pressed && styles.removePressed]}
              >
                <Icon name="close" size={14} color={colors.textMuted} />
              </Pressable>
            </View>
          )}
        />
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  playAll: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playAllPressed: {
    backgroundColor: colors.accentPressed,
    transform: [{ scale: 0.95 }],
  },
  disabled: {
    opacity: 0.4,
  },
  toolBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  toolPressed: {
    opacity: 0.7,
  },
  renameRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 44,
    color: colors.text,
    fontSize: type.body,
  },
  renameBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createPressed: {
    backgroundColor: colors.accentPressed,
  },
  list: {
    flexGrow: 0,
    maxHeight: 380,
  },
  listContent: {
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    marginHorizontal: spacing.sm,
  },
  rowCurrent: {
    backgroundColor: colors.surface,
  },
  rowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowName: {
    color: colors.text,
    fontSize: type.label,
    fontWeight: fontWeight.medium,
  },
  rowMeta: {
    color: colors.textMuted,
    fontSize: type.small,
    marginTop: 1,
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePressed: {
    backgroundColor: colors.border,
  },
});