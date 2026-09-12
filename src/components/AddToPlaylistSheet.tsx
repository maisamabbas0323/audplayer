import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Icon } from './Icon';
import { BottomSheet } from './BottomSheet';
import { colors, radius, spacing, type, fontWeight } from '../theme';
import type { Playlist, Track } from '../types/music';

interface AddToPlaylistSheetProps {
  visible: boolean;
  onClose: () => void;
  track: Track | null;
  playlists: Playlist[];
  onAdd: (playlistId: string, trackId: string) => void;
  onCreate: (name: string) => void;
}

export function AddToPlaylistSheet({
  visible,
  onClose,
  track,
  playlists,
  onAdd,
  onCreate,
}: AddToPlaylistSheetProps) {
  const [name, setName] = useState('');

  const reset = () => setName('');

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Add to playlist">
      <View style={styles.createRow}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="New playlist name"
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          accessibilityLabel="New playlist name"
        />
        <Pressable
          onPress={() => {
            const n = name.trim();
            if (!n) return;
            onCreate(n);
            reset();
            onClose();
          }}
          disabled={!name.trim()}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.createBtn,
            !name.trim() && styles.disabled,
            pressed && name.trim() && styles.createPressed,
          ]}
        >
          <Icon name="plus" size={18} color={colors.onAccent} />
        </Pressable>
      </View>

      {playlists.length > 0 ? (
        <FlatList
          data={playlists}
          keyExtractor={(item) => item.id}
          style={styles.list}
          renderItem={({ item }) => {
            const added = track != null && item.trackIds.includes(track.id);
            return (
              <Pressable
                onPress={() => {
                  if (track && !added) onAdd(item.id, track.id);
                  onClose();
                }}
                disabled={added}
                style={({ pressed }) => [
                  styles.row,
                  pressed && styles.rowPressed,
                  added && styles.rowAdded,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${item.name}, ${item.trackIds.length} tracks`}
              >
                <View style={styles.folder}>
                  <Icon name="list" size={17} color={colors.textSecondary} />
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.rowMeta}>
                    {item.trackIds.length} {item.trackIds.length === 1 ? 'track' : 'tracks'}
                  </Text>
                </View>
                {added ? (
                  <Text style={styles.addedLabel}>Added</Text>
                ) : null}
              </Pressable>
            );
          }}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <Text style={styles.hint}>
          Make a playlist and your tracks will stay organised here.
        </Text>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  createRow: {
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
  createBtn: {
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
  disabled: {
    opacity: 0.4,
  },
  list: {
    flexGrow: 0,
    maxHeight: 400,
  },
  listContent: {
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 54,
  },
  rowPressed: {
    backgroundColor: colors.surface,
  },
  rowAdded: {
    opacity: 0.6,
  },
  folder: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowName: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: fontWeight.medium,
  },
  rowMeta: {
    color: colors.textMuted,
    fontSize: type.small,
    marginTop: 1,
  },
  addedLabel: {
    color: colors.success,
    fontSize: type.small,
    fontWeight: fontWeight.semibold,
  },
  hint: {
    color: colors.textMuted,
    fontSize: type.small,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
});