import React, { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import { TrackRow } from '../components/TrackRow';
import { colors, radius, spacing, type, fontWeight, shadow } from '../theme';
import { formatDuration, greeting, timeAgo } from '../lib/utils';
import { useApp } from '../context/AppProvider';
import { useDockPadding } from '../hooks/useDockPadding';

export function HomeScreen() {
  const {
    tracks,
    current,
    favorites,
    settings,
    playCollection,
    openTrackOptions,
    importFiles,
    scanLibrary,
  } = useApp();

  const recentlyAdded = useMemo(
    () => [...tracks].sort((a, b) => b.addedAt - a.addedAt).slice(0, 6),
    [tracks],
  );

  const stats = useMemo(() => {
    const artists = new Set(tracks.map((t) => t.artist).filter(Boolean));
    const albums = new Set(tracks.map((t) => t.album).filter(Boolean));
    const durationMs = tracks.reduce((sum, t) => sum + (t.duration ?? 0), 0);
    return { artists: artists.size, albums: albums.size, duration: durationMs };
  }, [tracks]);

  const bottomPad = useDockPadding();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
      showsVerticalScrollIndicator={false}
    >
      {tracks.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="music"
            title="Your music goes here"
            message="Add audio files or a whole folder, and they'll show up in your library with artwork and tags."
            actionLabel="Add music"
            onAction={importFiles}
            secondaryActionLabel={Platform.OS === 'web' ? undefined : 'Scan device'}
            onSecondaryAction={Platform.OS === 'web' ? undefined : () => void scanLibrary()}
          />
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.subGreeting}>
              {favorites.length > 0
                ? `${favorites.length} loved ${favorites.length === 1 ? 'track' : 'tracks'} · ${timeAgo(recentlyAdded[0]?.addedAt ?? null)} added`
                : `Welcome back`}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <StatCard icon="music" label="Tracks" value={tracks.length} />
            <StatCard icon="disc" label="Artists" value={stats.artists} />
            <StatCard icon="list" label="Albums" value={stats.albums} />
            <StatCard icon="heartFill" label="Liked" value={favorites.length} />
          </View>

          {recentlyAdded.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recently added</Text>
                <Pressable
                  onPress={() => playCollection(recentlyAdded.map((t) => t.id))}
                  hitSlop={8}
                  accessibilityRole="button"
                  style={({ pressed }) => [styles.playAll, pressed && styles.playAllPressed]}
                >
                  <Icon name="play" size={14} color={colors.textSecondary} />
                  <Text style={styles.playAllLabel}>Play all</Text>
                </Pressable>
              </View>
              <View style={styles.listCard}>
                {recentlyAdded.map((track) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    compact={settings.compactList}
                    active={current?.id === track.id}
                    isFavorite={favorites.includes(track.id)}
                    onPress={(t) => {
                      const ids = recentlyAdded.map((x) => x.id);
                      playCollection(ids, ids.indexOf(t.id));
                    }}
                    onMore={(t) => openTrackOptions(t.id)}
                  />
                ))}
              </View>
            </View>
          ) : null}

          <View style={styles.footerNote}>
            <Text style={styles.footerText}>
              {formatDuration(stats.duration)} of music · {stats.artists} artists
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function StatCard({ icon, label, value }: { icon: 'music' | 'disc' | 'list' | 'heartFill'; label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Icon name={icon} size={16} color={colors.accent} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: fontWeight.bold,
  },
  subGreeting: {
    color: colors.textMuted,
    fontSize: type.small,
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statValue: {
    color: colors.text,
    fontSize: type.heading,
    fontWeight: fontWeight.bold,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: type.micro,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: type.subtitle,
    fontWeight: fontWeight.semibold,
  },
  playAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  playAllPressed: {
    backgroundColor: colors.surface,
  },
  playAllLabel: {
    color: colors.textSecondary,
    fontSize: type.small,
    fontWeight: fontWeight.medium,
  },
  listCard: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
    ...shadow.sm,
  },
  footerNote: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  footerText: {
    color: colors.textMuted,
    fontSize: type.small,
  },
});