import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AddToPlaylistSheet } from './src/components/AddToPlaylistSheet';
import { ConfirmDialog } from './src/components/ConfirmDialog';
import { Dock } from './src/components/Dock';
import { ImportOverlay } from './src/components/ImportOverlay';
import { PlaylistDetailSheet } from './src/components/PlaylistDetailSheet';
import { QueueSheet } from './src/components/QueueSheet';
import { ToastManager } from './src/components/Toast';
import { TrackOptionsSheet } from './src/components/TrackOptionsSheet';
import { AppProvider, useApp } from './src/context/AppProvider';
import { HomeScreen } from './src/screens/HomeScreen';
import { LibraryScreen } from './src/screens/LibraryScreen';
import { PlayScreen } from './src/screens/PlayScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import type { Track } from './src/types/music';
import { colors, spacing } from './src/theme';
import type { TabKey } from './src/components/FloatingToolbar';

function Shell() {
  const app = useApp();
  const [tab, setTab] = useState<TabKey>('home');

  const optionsTrack: Track | null = app.trackOptionsId
    ? app.tracks.find((t) => t.id === app.trackOptionsId) ?? null
    : null;
  const playlistTarget: Track | null = app.addToPlaylistTrackId
    ? app.tracks.find((t) => t.id === app.addToPlaylistTrackId) ?? null
    : null;

  const renderScreen = () => {
    switch (tab) {
      case 'home':
        return <HomeScreen />;
      case 'play':
        return <PlayScreen key="play" onBack={() => setTab('home')} />;
      case 'library':
        return <LibraryScreen onBack={() => setTab('home')} />;
      case 'settings':
        return <SettingsScreen onBack={() => setTab('home')} />;
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.main} edges={['top']}>
        {renderScreen()}
      </SafeAreaView>

      <View style={styles.bottomLayer} pointerEvents="box-none">
        <Dock
          active={tab}
          onSelect={setTab}
          onAddMusic={app.importFiles}
          nowPlaying={app.isPlaying}
        />
      </View>

      <ToastManager message={app.toast} />
      <ImportOverlay progress={app.importProgress} />
      <ConfirmDialog request={app.confirm} onClose={() => app.requestConfirm(null)} />

      <TrackOptionsSheet
        visible={app.sheets.trackOptions}
        onClose={app.closeSheets}
        track={optionsTrack}
        isFavorite={optionsTrack != null && app.favorites.includes(optionsTrack.id)}
        onToggleFavorite={(t) => app.toggleFavorite(t.id)}
        onPlayNext={(t) => {
          app.playNext(t.id);
          app.notify('Playing next');
        }}
        onAddToQueue={(t) => {
          app.addToQueue(t.id);
          app.notify('Added to queue');
        }}
        onAddToPlaylist={(t) => {
          app.closeSheets();
          app.openAddToPlaylist(t.id);
        }}
        onRemove={(t) =>
          app.requestConfirm({
            title: 'Remove from library?',
            message: `"${t.title}" will be removed from this app. The file on your device stays untouched.`,
            confirmLabel: 'Remove',
            danger: true,
            onConfirm: () => app.removeTracks([t.id]),
          })
        }
      />

      <AddToPlaylistSheet
        visible={app.sheets.addToPlaylist}
        onClose={app.closeSheets}
        track={playlistTarget}
        playlists={app.playlists}
        onAdd={(playlistId, trackId) => {
          app.addToPlaylist(playlistId, trackId);
          app.notify('Added to playlist');
        }}
        onCreate={(name) => {
          app.createPlaylist(name);
          app.notify('Playlist created');
        }}
      />

      <PlaylistDetailSheet
        visible={app.sheets.playlistDetail}
        onClose={app.closeSheets}
        playlist={app.playlists.find((p) => p.id === app.playlistDetailId) ?? null}
        tracks={app.tracks}
        currentId={app.current?.id ?? null}
        onPlayAll={(ids) => app.playCollection(ids)}
        onPlayTrack={(id) => {
          const playlist = app.playlists.find((p) => p.id === app.playlistDetailId);
          if (playlist && playlist.trackIds.includes(id)) {
            app.playCollection(playlist.trackIds, playlist.trackIds.indexOf(id));
          } else {
            app.playTrack(id);
          }
        }}
        onRename={app.renamePlaylist}
        onRemoveTrack={app.removeFromPlaylist}
        onDeleteRequest={(id) =>
          app.requestConfirm({
            title: 'Delete playlist?',
            message: 'This removes the playlist from your library.',
            confirmLabel: 'Delete',
            danger: true,
            onConfirm: () => app.deletePlaylist(id),
          })
        }
      />

      <QueueSheet
        visible={app.sheets.queue}
        onClose={app.closeSheets}
        queue={app.queue}
        currentId={app.current?.id ?? null}
        isPlaying={app.isPlaying}
        onPlayIndex={(index) => {
          const id = app.queue[index]?.id;
          if (id) app.playTrack(id);
        }}
        onRemove={app.removeFromQueue}
        onMove={app.moveInQueue}
        onClear={app.clearQueue}
      />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Shell />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  main: {
    flex: 1,
  },
  bottomLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
  },
});