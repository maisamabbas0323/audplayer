export const AUDIO_EXTENSIONS = [
  'mp3',
  'wav',
  'm4a',
  'aac',
  'ogg',
  'oga',
  'opus',
  'flac',
  'wma',
  'mp4',
  'm4b',
  'mid',
  'midi',
  'aiff',
  'aif',
  'ape',
  'wv',
  'amr',
  '3gp',
  'mka',
  'caf',
  'dsf',
  'dff',
  'alac',
];

export type RepeatMode = 'off' | 'all' | 'one';

export interface Track {
  id: string;
  fileName: string;
  title: string;
  artist: string | null;
  album: string | null;
  uri: string;
  size: number | null;
  duration: number | null;
  addedAt: number;
  lastPlayedAt: number | null;
  playCount: number;
  artworkUri: string | null;
  format: string;
  unavailable?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  trackIds: string[];
  createdAt: number;
  updatedAt: number;
}

export interface AppSettings {
  defaultVolume: number;
  resumePlayback: boolean;
  autoplayNext: boolean;
  compactList: boolean;
  persistQueue: boolean;
  backgroundPlayback: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultVolume: 0.8,
  resumePlayback: true,
  autoplayNext: true,
  compactList: false,
  persistQueue: true,
  backgroundPlayback: false,
};

export interface ImportResult {
  added: Track[];
  unsupported: string[];
  errors: string[];
  skipped: number;
}

export interface LibraryStats {
  tracks: number;
  artists: number;
  albums: number;
  favorites: number;
  durationMs: number;
}

export interface QueueState {
  ids: string[];
  currentId: string | null;
}

export interface SessionSnapshot {
  queue: QueueState;
  position: number;
  playing: boolean;
}