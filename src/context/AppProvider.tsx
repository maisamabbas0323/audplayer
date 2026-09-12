import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { AppState, Platform } from 'react-native';

import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { configureAudioMode } from '../lib/audio';
import {
  clearLibraryFiles,
  importAssets,
  importDirectory,
  importWebDirectory,
  relinkMissingFiles,
  removeTrackFile,
  verifyLibrary,
} from '../lib/filesystem';
import { KEYS, loadJSON, saveJSON } from '../lib/storage';
import { randomId } from '../lib/utils';
import {
  canScanDevice,
  hasScanPermission,
  requestScanPermission,
  scanDeviceAudio,
} from '../lib/mediaLibrary';
import type {
  AppSettings,
  ImportResult,
  Playlist,
  RepeatMode,
  SessionSnapshot,
  Track,
} from '../types/music';
import { DEFAULT_SETTINGS } from '../types/music';

export type SheetName = 'trackOptions' | 'addToPlaylist' | 'playlistDetail' | 'queue';

export interface ImportProgress {
  active: boolean;
  phase: 'copy' | 'duration' | 'walking' | 'picking' | 'scanning';
  total: number;
  done: number;
}

export interface ConfirmRequest {
  title: string;
  message?: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
}

interface AppContextValue {
  tracks: Track[];
  favorites: string[];
  playlists: Playlist[];
  settings: AppSettings;
  current: Track | null;
  isPlaying: boolean;
  isBuffering: boolean;
  position: number;
  duration: number;
  shuffle: boolean;
  repeat: RepeatMode;
  volume: number;
  muted: boolean;
  error: string | null;
  queue: Track[];
  favoriteTracks: Track[];
  sheets: Record<SheetName, boolean>;
  trackOptionsId: string | null;
  addToPlaylistTrackId: string | null;
  playlistDetailId: string | null;
  confirm: ConfirmRequest | null;
  toast: string | null;
  importProgress: ImportProgress;

  playCollection: (ids: string[], startIndex?: number) => void;
  playTrack: (id: string) => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seekTo: (seconds: number) => void;
  cycleRepeat: () => void;
  toggleShuffle: () => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  playNext: (id: string) => void;
  addToQueue: (id: string) => void;
  removeFromQueue: (index: number) => void;
  moveInQueue: (from: number, to: number) => void;
  clearQueue: () => void;

  importFiles: () => Promise<void>;
  importFolder: () => Promise<void>;
  scanLibrary: () => Promise<void>;
  removeTracks: (ids: string[]) => void;
  relinkLibrary: () => Promise<void>;
  clearAllLibrary: () => void;

  toggleFavorite: (id: string) => void;
  createPlaylist: (name: string) => void;
  renamePlaylist: (id: string, name: string) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (playlistId: string, trackId: string) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;

  openTrackOptions: (id: string) => void;
  openAddToPlaylist: (id: string) => void;
  openPlaylistDetail: (id: string) => void;
  openQueue: () => void;
  closeSheets: () => void;
  notify: (message: string | null) => void;
  requestConfirm: (req: ConfirmRequest | null) => void;
  updateSettings: (patch: Partial<AppSettings>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
}

function emptySheets(): Record<SheetName, boolean> {
  return { trackOptions: false, addToPlaylist: false, playlistDetail: false, queue: false };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  const [sheets, setSheets] = useState<Record<SheetName, boolean>>(emptySheets);
  const [trackOptionsId, setTrackOptionsId] = useState<string | null>(null);
  const [addToPlaylistTrackId, setAddToPlaylistTrackId] = useState<string | null>(null);
  const [playlistDetailId, setPlaylistDetailId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    active: false,
    phase: 'copy',
    total: 0,
    done: 0,
  });
  const [booted, setBooted] = useState(false);
  const [promptedScan, setPromptedScan] = useState(false);

  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;
  const playlistsRef = useRef(playlists);
  playlistsRef.current = playlists;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const player = useAudioPlayer({
    defaultVolume: settings.defaultVolume,
    autoplayNext: settings.autoplayNext,
    onPlaybackError: (message) => setToast(message),
  });

  const { setSourceResolver, restoreQueue } = player;

  useEffect(() => {
    setSourceResolver((id) => {
      const track = tracksRef.current.find((t) => t.id === id);
      return track ? { uri: track.uri } : null;
    });
  }, [setSourceResolver]);

  useEffect(() => {
    void configureAudioMode({ shouldPlayInBackground: settings.backgroundPlayback });
  }, [settings.backgroundPlayback]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' && !settingsRef.current.backgroundPlayback) {
        player.pause();
      }
    });
    return () => sub.remove();
  }, [player]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [storedTracks, storedFavorites, storedPlaylists, storedSettings, session, storedPromptedScan] =
        await Promise.all([
          loadJSON<Track[]>(KEYS.tracks, []),
          loadJSON<string[]>(KEYS.favorites, []),
          loadJSON<Playlist[]>(KEYS.playlists, []),
          loadJSON<Partial<AppSettings>>(KEYS.settings, {}),
          loadJSON<SessionSnapshot | null>(KEYS.session, null),
          loadJSON<boolean>(KEYS.promptedScan, false),
        ]);
      if (cancelled) return;
      setPromptedScan(storedPromptedScan);
      setTracks(storedTracks);
      setFavorites(storedFavorites);
      setPlaylists(storedPlaylists);
      const merged: AppSettings = { ...DEFAULT_SETTINGS, ...storedSettings };
      setSettings(merged);
      if (merged.persistQueue && session?.queue) {
        restoreQueue(session.queue.ids, session.queue.currentId);
        if (merged.resumePlayback && session.playing) {
          setTimeout(() => player.play(), 350);
        }
      }
      setBooted(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!booted) return;
    const snapshot: SessionSnapshot = {
      queue: { ids: player.queue, currentId: player.currentId },
      position: player.position,
      playing: player.isPlaying,
    };
    const timer = setTimeout(() => {
      void saveJSON(KEYS.session, snapshot);
    }, 600);
    return () => clearTimeout(timer);
  }, [booted, player.queue, player.currentId, player.isPlaying]);

  useEffect(() => {
    if (!booted) return;
    void saveJSON(KEYS.favorites, favorites);
  }, [booted, favorites]);

  useEffect(() => {
    if (!booted) return;
    void saveJSON(KEYS.playlists, playlists);
  }, [booted, playlists]);

  useEffect(() => {
    if (!booted) return;
    void saveJSON(KEYS.settings, settings);
  }, [booted, settings]);

  const closeSheets = useCallback(() => setSheets(emptySheets()), []);

  const playCollection = useCallback(
    (ids: string[], startIndex = 0) => {
      player.playCollection(ids, startIndex);
      closeSheets();
    },
    [player, closeSheets],
  );

  const playTrack = useCallback(
    (id: string) => {
      player.playTrack(id);
      closeSheets();
    },
    [player, closeSheets],
  );

  const playNext = useCallback((id: string) => player.enqueueNext(id), [player]);
  const addToQueue = useCallback((id: string) => player.enqueueEnd(id), [player]);
  const removeFromQueue = useCallback((index: number) => player.removeFromQueue(index), [player]);
  const moveInQueue = useCallback((from: number, to: number) => player.moveInQueue(from, to), [player]);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const createPlaylist = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPlaylists((prev) => [
      ...prev,
      { id: randomId(), name: trimmed, trackIds: [], createdAt: Date.now(), updatedAt: Date.now() },
    ]);
  }, []);

  const renamePlaylist = useCallback((id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPlaylists((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: trimmed, updatedAt: Date.now() } : p)),
    );
  }, []);

  const deletePlaylist = useCallback((id: string) => {
    setPlaylists((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addToPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId && !p.trackIds.includes(trackId)
          ? { ...p, trackIds: [...p.trackIds, trackId], updatedAt: Date.now() }
          : p,
      ),
    );
  }, []);

  const removeFromPlaylist = useCallback((playlistId: string, trackId: string) => {
    setPlaylists((prev) =>
      prev.map((p) =>
        p.id === playlistId
          ? { ...p, trackIds: p.trackIds.filter((id) => id !== trackId), updatedAt: Date.now() }
          : p,
      ),
    );
  }, []);

  function reportImport(result: ImportResult) {
    if (result.added.length > 0) {
      setTracks((prev) => {
        const next = [...prev, ...result.added];
        void saveJSON(KEYS.tracks, next);
        return next;
      });
      const parts = [`Added ${result.added.length} ${result.added.length === 1 ? 'track' : 'tracks'}`];
      if (result.skipped > 0) parts.push(`${result.skipped} skipped`);
      if (result.unsupported.length > 0) parts.push(`${result.unsupported.length} unsupported`);
      if (result.errors.length > 0) parts.push(`${result.errors.length} failed`);
      setToast(parts.join(' · '));
    } else if (result.skipped > 0) {
      setToast('Already in your library');
    } else if (result.errors.length > 0 || result.unsupported.length > 0) {
      setToast('Nothing could be added');
    }
  }

  const importFiles = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        multiple: true,
        copyToCacheDirectory: false,
      });
      if (result.canceled || result.assets.length === 0) return;
      const existing = new Set(tracksRef.current.map((t) => t.id));
      setImportProgress({ active: true, phase: 'copy', total: 0, done: 0 });
      const imported = await importAssets(result.assets, {
        existingIds: existing,
        onProgress: (done, total) => {
          setImportProgress({ active: true, phase: 'duration', total, done });
        },
      });
      reportImport(imported);
    } catch {
      setToast('Could not import files');
    } finally {
      setImportProgress((p) => ({ ...p, active: false }));
    }
  }, []);

  const importFolder = useCallback(async () => {
    if (Platform.OS === 'web') {
      try {
        const res = await importWebDirectory(
          (phase) => {
            if (phase === 'walk') {
              setImportProgress({ active: true, phase: 'walking', total: 0, done: 0 });
            } else {
              setImportProgress((p) => ({ ...p, phase: 'copy' }));
            }
          },
          (done, total) => {
            setImportProgress({ active: true, phase: 'duration', total, done });
          },
        );
        if (res) reportImport(res);
      } catch {
        setToast('Could not import folder');
      } finally {
        setImportProgress({ active: false, phase: 'copy', total: 0, done: 0 });
      }
      return;
    }
    try {
      const res = await importDirectory(
        (done, total) => {
          setImportProgress({ active: true, phase: 'duration', total, done });
        },
        (phase) => {
          if (phase === 'walk') {
            setImportProgress({ active: true, phase: 'walking', total: 0, done: 0 });
          } else if (phase === 'import') {
            setImportProgress((p) => ({ ...p, phase: 'copy' }));
          } else {
            setImportProgress({ active: true, phase: 'picking', total: 0, done: 0 });
          }
        },
      );
      if (!res) return;
      if ('reason' in res) {
        setToast(res.reason === 'denied' ? 'Folder access denied' : 'Folders are not supported here');
      } else {
        reportImport(res.result);
      }
    } catch {
      setToast('Could not import folder');
    } finally {
      setImportProgress({ active: false, phase: 'copy', total: 0, done: 0 });
    }
  }, []);

  const scanLibrary = useCallback(async () => {
    if (!canScanDevice()) {
      setToast('Scanning is only available on your phone');
      return;
    }
    let granted = await hasScanPermission();
    if (!granted) {
      granted = await requestScanPermission();
      if (!granted) {
        setToast('Permission denied. Allow media access for Audplayer to scan your music.');
        return;
      }
    }
    try {
      setImportProgress({ active: true, phase: 'scanning', total: 0, done: 0 });
      const result = await scanDeviceAudio(
        new Set(tracksRef.current.map((t) => t.id)),
        (done, total) => {
          setImportProgress({ active: true, phase: 'duration', total, done });
        },
      );
      if (result.added.length > 0) {
        reportImport(result);
      } else if (result.skipped > 0 || result.unsupported.length > 0 || result.errors.length > 0) {
        reportImport(result);
      } else {
        setToast('No audio found on this device');
      }
    } catch {
      setToast('Could not scan for music');
    } finally {
      setImportProgress({ active: false, phase: 'copy', total: 0, done: 0 });
    }
  }, []);

  const removeTracks = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids);
      const removed = tracksRef.current.filter((t) => idSet.has(t.id));
      const nextTracks = tracksRef.current.filter((t) => !idSet.has(t.id));
      tracksRef.current = nextTracks;
      setTracks(nextTracks);
      void saveJSON(KEYS.tracks, nextTracks);
      setFavorites((prev) => prev.filter((id) => !idSet.has(id)));
      setPlaylists((prev) =>
        prev.map((p) => ({ ...p, trackIds: p.trackIds.filter((id) => !idSet.has(id)) })),
      );
      player.queue
        .map((id, index) => (idSet.has(id) ? index : -1))
        .filter((index) => index >= 0)
        .sort((a, b) => b - a)
        .forEach((index) => player.removeFromQueue(index));
      removed.forEach((track) => void removeTrackFile(track));
      const removedTitles = removed.map((t) => t.title).slice(0, 2).join(', ');
      setToast(
        removed.length === 1
          ? `Removed ${removedTitles}`
          : removed.length > 1
            ? `Removed ${removed.length} tracks`
            : null,
      );
    },
    [player],
  );

  const relinkLibrary = useCallback(async () => {
    const verified = await verifyLibrary(tracksRef.current);
    const relinked = await relinkMissingFiles(verified);
    tracksRef.current = relinked;
    setTracks(relinked);
    void saveJSON(KEYS.tracks, relinked);
    const missing = relinked.filter((t) => t.unavailable).length;
    setToast(missing === 0 ? 'All tracks are available' : `${missing} still missing`);
  }, []);

  const clearAllLibrary = useCallback(() => {
    setTracks([]);
    tracksRef.current = [];
    setFavorites([]);
    setPlaylists([]);
    playlistsRef.current = [];
    player.clearQueue();
    void clearLibraryFiles();
    void saveJSON(KEYS.tracks, []);
    void saveJSON(KEYS.favorites, []);
    void saveJSON(KEYS.playlists, []);
    setToast('Library cleared');
  }, [player]);

  const openTrackOptions = useCallback((id: string) => {
    setTrackOptionsId(id);
    setSheets((s) => ({ ...s, trackOptions: true }));
  }, []);

  const openAddToPlaylist = useCallback((id: string) => {
    setAddToPlaylistTrackId(id);
    setSheets((s) => ({ ...s, addToPlaylist: true }));
  }, []);

  const openPlaylistDetail = useCallback((id: string) => {
    setPlaylistDetailId(id);
    setSheets((s) => ({ ...s, playlistDetail: true }));
  }, []);

  const openQueue = useCallback(() => {
    setSheets((s) => ({ ...s, queue: true }));
  }, []);

  const notify = useCallback((message: string | null) => setToast(message), []);

  const requestConfirm = useCallback((req: ConfirmRequest | null) => setConfirm(req), []);

  useEffect(() => {
    if (!booted || promptedScan || !canScanDevice()) return;
    if (tracksRef.current.length > 0) return;
    setPromptedScan(true);
    void saveJSON(KEYS.promptedScan, true);
    const timer = setTimeout(() => {
      requestConfirm({
        title: 'Find your music?',
        message:
          'Audplayer can automatically find every audio file on this device and add it to your library. It will ask for permission to read your music.',
        confirmLabel: 'Scan device',
        onConfirm: () => {
          void scanLibrary();
        },
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [booted, promptedScan, requestConfirm, scanLibrary]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const trackById = useMemo(() => {
    const map = new Map<string, Track>();
    tracks.forEach((t) => map.set(t.id, t));
    return map;
  }, [tracks]);

  const current = player.currentId ? trackById.get(player.currentId) ?? null : null;
  const queueTracks = player.queue.map((id) => trackById.get(id)).filter((t): t is Track => t != null);
  const favoriteTracks = favorites
    .map((id) => trackById.get(id))
    .filter((t): t is Track => t != null);

  const value = useMemo<AppContextValue>(
    () => ({
      tracks,
      favorites,
      playlists,
      settings,
      current,
      isPlaying: player.isPlaying,
      isBuffering: player.isBuffering,
      position: player.position,
      duration: player.duration,
      shuffle: player.shuffle,
      repeat: player.repeat,
      volume: player.volume,
      muted: player.muted,
      error: player.error,
      queue: queueTracks,
      favoriteTracks,
      sheets,
      trackOptionsId,
      addToPlaylistTrackId,
      playlistDetailId,
      confirm,
      toast,
      importProgress,
      playCollection,
      playTrack,
      toggle: player.toggle,
      next: player.next,
      previous: player.previous,
      seekTo: player.seekTo,
      cycleRepeat: player.cycleRepeat,
      toggleShuffle: player.toggleShuffle,
      setVolume: player.setVolume,
      toggleMute: player.toggleMute,
      playNext,
      addToQueue,
      removeFromQueue,
      moveInQueue,
      clearQueue: player.clearQueue,
      importFiles,
      importFolder,
      scanLibrary,
      removeTracks,
      relinkLibrary,
      clearAllLibrary,
      toggleFavorite,
      createPlaylist,
      renamePlaylist,
      deletePlaylist,
      addToPlaylist,
      removeFromPlaylist,
      openTrackOptions,
      openAddToPlaylist,
      openPlaylistDetail,
      openQueue,
      closeSheets,
      notify,
      requestConfirm,
      updateSettings,
    }),
    [
      tracks,
      favorites,
      playlists,
      settings,
      current,
      player.isPlaying,
      player.isBuffering,
      player.position,
      player.duration,
      player.shuffle,
      player.repeat,
      player.volume,
      player.muted,
      player.error,
      queueTracks,
      favoriteTracks,
      sheets,
      trackOptionsId,
      addToPlaylistTrackId,
      playlistDetailId,
      confirm,
      toast,
      importProgress,
      playCollection,
      playTrack,
      player.toggle,
      player.next,
      player.previous,
      player.seekTo,
      player.cycleRepeat,
      player.toggleShuffle,
      player.setVolume,
      player.toggleMute,
      playNext,
      addToQueue,
      removeFromQueue,
      moveInQueue,
      player.clearQueue,
      importFiles,
      importFolder,
      scanLibrary,
      removeTracks,
      relinkLibrary,
      clearAllLibrary,
      toggleFavorite,
      createPlaylist,
      renamePlaylist,
      deletePlaylist,
      addToPlaylist,
      removeFromPlaylist,
      openTrackOptions,
      openAddToPlaylist,
      openPlaylistDetail,
      openQueue,
      closeSheets,
      notify,
      requestConfirm,
      updateSettings,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}