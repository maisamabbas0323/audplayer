import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Artwork } from '../components/Artwork';
import { BackButton } from '../components/BackButton';
import { BottomSheet } from '../components/BottomSheet';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import { SearchBar } from '../components/SearchBar';
import { TrackRow } from '../components/TrackRow';
import { colors, radius, spacing, type, fontWeight, shadow } from '../theme';
import { useApp } from '../context/AppProvider';
import { useDockPadding } from '../hooks/useDockPadding';

export function LibraryScreen({ onBack }: { onBack: () => void }) {
  const {
    tracks,
    current,
    favorites,
    playlists,
    settings,
    favoriteTracks,
    playCollection,
    openTrackOptions,
    openPlaylistDetail,
    createPlaylist,
    importFiles,
    scanLibrary,
  } = useApp();

  const [query, setQuery] = useState('');
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);
  const [playlistName, setPlaylistName] = useState('');

  const allIds = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...tracks].sort((a, b) => a.title.localeCompare(b.title));
    if (!q) return sorted.map((t) => t.id);
    return sorted
      .filter((t) => {
        if (t.title.toLowerCase().includes(q)) return true;
        if (t.artist && t.artist.toLowerCase().includes(q)) return true;
        if (t.album && t.album.toLowerCase().includes(q)) return true;
        return false;
      })
      .map((t) => t.id);
  }, [tracks, query]);

  const likedIds = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return favoriteTracks.map((t) => t.id);
    return favoriteTracks
      .filter((t) => {
        if (t.title.toLowerCase().includes(q)) return true;
        return !!(t.artist && t.artist.toLowerCase().includes(q));
      })
      .map((t) => t.id);
  }, [favoriteTracks, query]);

  const filteredPlaylists = useMemo(() => {
    return playlists
      .map((p) => ({
        ...p,
        available: p.trackIds.filter((id) => tracks.some((t) => t.id === id)).length,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [playlists, tracks]);

  const lookup = (id: string) => tracks.find((t) => t.id === id) ?? null;
  const bottomPad = useDockPadding();

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <BackButton onPress={onBack} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Library</Text>
            <Text style={styles.subtitle}>
              {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
            </Text>
          </View>
        </View>

        {tracks.length === 0 ? (
          <EmptyState
            icon="library"
            title="Nothing here yet"
            message="Import audio files to build your library, or scan a folder."
            actionLabel="Add music"
            onAction={importFiles}
            secondaryActionLabel={Platform.OS === 'web' ? undefined : 'Scan device'}
            onSecondaryAction={Platform.OS === 'web' ? undefined : () => void scanLibrary()}
          />
        ) : (
          <>
            <View style={styles.searchWrap}>
              <SearchBar value={query} onChangeText={setQuery} />
              <Pressable
                onPress={() => setShowNewPlaylist(true)}
                accessibilityRole="button"
                accessibilityLabel="New playlist"
                style={({ pressed }) => [styles.newPlaylistBtn, pressed && styles.newPlaylistPressed]}
              >
                <Icon name="plus" size={18} color={colors.onAccent} />
              </Pressable>
            </View>

            {filteredPlaylists.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Playlists</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.playlistRow}
                >
                  {filteredPlaylists.map((p) => (
                    <Pressable
                      key={p.id}
                      onPress={() => openPlaylistDetail(p.id)}
                      accessibilityRole="button"
                      accessibilityLabel={p.name}
                      style={({ pressed }) => [styles.playlistCard, pressed && styles.playlistPressed]}
                    >
                      <View style={styles.playlistIcon}>
                        <Icon name="playlist" size={20} color={colors.accent} />
                      </View>
                      <Text style={styles.playlistName} numberOfLines={1}>
                        {p.name}
                      </Text>
                      <Text style={styles.playlistCount}>
                        {p.available} {p.available === 1 ? 'track' : 'tracks'}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}

            {likedIds.length > 0 ? (
              <View style={styles.section}>
                <View style={styles.sectionRow}>
                  <Icon name="heartFill" size={15} color={colors.accent} />
                  <Text style={styles.sectionTitle}>Liked</Text>
                </View>
                <View style={styles.listCard}>
                  {likedIds.map((id) => {
                    const track = lookup(id);
                    return track ? (
                      <TrackRow
                        key={id}
                        track={track}
                        compact={settings.compactList}
                        active={current?.id === id}
                        onPress={(t) => playCollection(likedIds, likedIds.indexOf(t.id))}
                        onMore={(t) => openTrackOptions(t.id)}
                      />
                    ) : null;
                  })}
                </View>
              </View>
            ) : null}

            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Icon name="music" size={15} color={colors.textSecondary} />
                <Text style={styles.sectionTitle}>
                  All songs{query ? ` · ${allIds.length} found` : ''}
                </Text>
              </View>
              <View style={styles.listCard}>
                {allIds.length === 0 ? (
                  <Text style={styles.noResults}>No matching tracks</Text>
                ) : (
                  allIds.map((id) => {
                    const track = lookup(id);
                    return track ? (
                      <TrackRow
                        key={id}
                        track={track}
                        compact={settings.compactList}
                        active={current?.id === id}
                        isFavorite={favorites.includes(id)}
                        onPress={(t) => playCollection(allIds, allIds.indexOf(t.id))}
                        onMore={(t) => openTrackOptions(t.id)}
                      />
                    ) : null;
                  })
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <BottomSheet
        visible={showNewPlaylist}
        onClose={() => setShowNewPlaylist(false)}
        title="New playlist"
      >
        <View style={styles.createRow}>
          <Text style={styles.createLabel}>Name</Text>
          <TextInput
            style={styles.input}
            value={playlistName}
            onChangeText={setPlaylistName}
            placeholder="My playlist"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.accent}
            returnKeyType="done"
            onSubmitEditing={() => {
              if (playlistName.trim()) {
                createPlaylist(playlistName);
                setPlaylistName('');
                setShowNewPlaylist(false);
              }
            }}
            accessibilityLabel="Playlist name"
            autoFocus
          />
        </View>
        <Pressable
          onPress={() => {
            if (playlistName.trim()) {
              createPlaylist(playlistName);
              setPlaylistName('');
              setShowNewPlaylist(false);
            }
          }}
          disabled={!playlistName.trim()}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.createBtn,
            !playlistName.trim() && styles.createDisabled,
            pressed && playlistName.trim() && styles.createPressed,
          ]}
        >
          <Text style={styles.createBtnLabel}>Create</Text>
        </Pressable>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: type.small,
    marginTop: spacing.xs,
  },
  searchWrap: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  newPlaylistBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newPlaylistPressed: {
    backgroundColor: colors.accentPressed,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: type.subtitle,
    fontWeight: fontWeight.semibold,
  },
  playlistRow: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
    paddingRight: spacing.lg,
  },
  playlistCard: {
    width: 150,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadow.sm,
  },
  playlistPressed: {
    backgroundColor: colors.surfaceRaised,
    transform: [{ scale: 0.98 }],
  },
  playlistIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistName: {
    color: colors.text,
    fontSize: type.label,
    fontWeight: fontWeight.semibold,
  },
  playlistCount: {
    color: colors.textMuted,
    fontSize: type.small,
  },
  listCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
    ...shadow.sm,
  },
  noResults: {
    color: colors.textMuted,
    fontSize: type.body,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  createLabel: {
    color: colors.textMuted,
    fontSize: type.label,
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
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
  },
  createDisabled: {
    opacity: 0.4,
  },
  createPressed: {
    backgroundColor: colors.accentPressed,
  },
  createBtnLabel: {
    color: colors.onAccent,
    fontSize: type.label,
    fontWeight: fontWeight.semibold,
  },
});