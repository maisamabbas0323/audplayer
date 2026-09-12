import { Platform } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';
import type { DocumentPickerAsset } from 'expo-document-picker';

import { parseMetadata, titleFromFileName } from './metadata';
import { probeDuration } from './audio';
import { getExtension, randomId, slugify } from './utils';
import type { ImportResult, Track } from '../types/music';
import { AUDIO_EXTENSIONS } from '../types/music';

const MAX_DIR_DEPTH = 6;
const MAX_METADATA_READ = 1024 * 1024 * 24;

function getMusicDir(): Directory {
  const dir = new Directory(Paths.document, 'music');
  try {
    if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  } catch {
    // Directory may already exist or be unreadable; continue.
  }
  return dir;
}

function getArtDir(): Directory {
  const dir = new Directory(Paths.cache, 'art');
  try {
    if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  } catch {
    // ignore
  }
  return dir;
}

export function isSupportedAudio(name: string): boolean {
  const ext = getExtension(name);
  return AUDIO_EXTENSIONS.includes(ext);
}

export function makeTrackId(fileName: string, size: number | null | undefined): string {
  const slug = slugify(fileName);
  const sizePart = size != null && size > 0 ? `-${size}` : '';
  return `${slug}${sizePart}`;
}

export function uniqueFileName(fileName: string): string {
  const ext = getExtension(fileName);
  const base = slugify(fileName.replace(/\.[^.]+$/, ''));
  const stem = `${base}-${randomId()}`;
  return ext ? `${stem}.${ext}` : stem;
}

async function readFirstBytes(file: File, bytes: number): Promise<ArrayBuffer> {
  const size = file.size ?? 0;
  const readLen = Math.min(bytes, size);
  if (readLen <= 0) return new ArrayBuffer(0);
  if (readLen >= size) {
    return (await file.arrayBuffer()).slice(0, bytes);
  }
  const handle = file.open();
  try {
    const chunk = handle.readBytes(readLen);
    return chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength);
  } finally {
    handle.close();
  }
}

async function extractTrackMetadata(
  id: string,
  file: File | null,
  fileName: string,
  size: number | null,
  fullData?: ArrayBuffer,
): Promise<{ title: string; artist: string | null; album: string | null; artworkUri: string | null }> {
  let artworkUri: string | null = null;
  try {
    let data: ArrayBuffer | undefined = fullData;
    if (!data && file && size != null && size > 0) {
      data = await readFirstBytes(file, Math.min(size, MAX_METADATA_READ));
    }
    let parsed = {};
    if (data) {
      parsed = parseMetadata(fileName, data) ?? {};
    }
    const raw = parsed as {
      title?: string;
      artist?: string;
      album?: string;
      artwork?: Uint8Array;
      artworkMime?: string;
    };
    const title = raw.title?.trim() || titleFromFileName(fileName);
    const artist = raw.artist?.trim() || null;
    const album = raw.album?.trim() || null;
    if (raw.artwork && raw.artwork.byteLength > 0) {
      try {
        const ext = (raw.artworkMime || '').includes('png') ? 'png' : 'jpg';
        const artFile = new File(getArtDir(), `${id}.${ext}`);
        if (!artFile.exists) {
          artFile.create();
          artFile.write(raw.artwork);
        }
        artworkUri = artFile.uri;
      } catch {
        artworkUri = null;
      }
    }
    return { title, artist, album, artworkUri };
  } catch {
    return {
      title: titleFromFileName(fileName),
      artist: null,
      album: null,
      artworkUri: null,
    };
  }
}

async function buildTrackFromFile(
  sourceUri: string,
  fileName: string,
  size: number | null,
  copy: boolean,
): Promise<Track> {
  const id = makeTrackId(fileName, size);
  let uri = sourceUri;
  let finalSize = size;

  if (copy) {
    const src = new File(sourceUri);
    const dest = new File(getMusicDir(), uniqueFileName(fileName));
    try {
      src.copy(dest);
      const didCopy = dest.exists;
      if (didCopy) {
        uri = dest.uri;
        finalSize = dest.size != null && dest.size > 0 ? dest.size : size;
      }
    } catch {
      // Keep pointing at the original source; may need relinking later.
    }
  }

  const meta = await extractTrackMetadata(
    id,
    copy ? new File(uri) : null,
    fileName,
    finalSize,
  );

  return {
    id,
    fileName,
    title: meta.title,
    artist: meta.artist,
    album: meta.album,
    uri,
    size: finalSize,
    duration: null,
    addedAt: Date.now(),
    lastPlayedAt: null,
    playCount: 0,
    artworkUri: meta.artworkUri,
    format: getExtension(fileName) || 'audio',
    unavailable: false,
  };
}

async function probeTrackDurations(tracks: Track[], onProgress: (done: number, total: number) => void) {
  const total = tracks.length;
  let done = 0;
  const POOL = Platform.OS === 'web' ? 6 : 3;
  await mapPool(tracks, POOL, async (track) => {
    try {
      track.duration = await probeDuration(track.uri);
    } catch {
      track.duration = null;
    } finally {
      done += 1;
      onProgress(done, total);
    }
  });
}

export interface ImportOptions {
  onProgress?: (done: number, total: number, phase: 'copy' | 'duration') => void;
  existingIds?: Set<string>;
}

export async function importAssets(
  assets: DocumentPickerAsset[],
  options: ImportOptions = {},
): Promise<ImportResult> {
  const result: ImportResult = { added: [], unsupported: [], errors: [], skipped: 0 };
  const existingIds = options.existingIds ?? new Set<string>();

  const copy = Platform.OS !== 'web';
  const complete: Track[] = [];
  const seen = new Set(existingIds);

  for (const asset of assets) {
    if (!isSupportedAudio(asset.name)) {
      result.unsupported.push(asset.name);
      continue;
    }
    const id = makeTrackId(asset.name, asset.size);
    if (seen.has(id)) {
      result.skipped += 1;
      continue;
    }
    seen.add(id);
    try {
      const track = await buildTrackFromFile(asset.uri, asset.name, asset.size ?? null, copy);
      complete.push(track);
    } catch {
      result.errors.push(asset.name);
    }
  }

  let done = 0;
  const total = complete.length;
  await mapPool(complete, 3, async (track) => {
    try {
      const dur = await probeDuration(track.uri);
      track.duration = dur;
    } catch {
      track.duration = null;
    } finally {
      done += 1;
      options.onProgress?.(done, total, 'duration');
    }
  });

  result.added.push(...complete);
  return result;
}

export async function importDirectory(
  onProgress: (processed: number, found: number) => void,
  onPhase: (phase: 'pick' | 'walk' | 'import') => void,
): Promise<{ ok: boolean; result: ImportResult } | { ok: false; reason: 'unsupported' | 'denied' }> {
  if (Platform.OS === 'web') {
    return { ok: false, reason: 'unsupported' };
  }

  let root: Directory;
  try {
    root = (await Directory.pickDirectoryAsync()) as unknown as Directory;
  } catch {
    return { ok: false, reason: 'denied' };
  }
  if (!root) return { ok: false, reason: 'denied' };

  onPhase('walk');
  const found: { uri: string; name: string; size: number | null }[] = [];
  const seenPaths = new Set<string>();

  const walk = (dir: Directory, depth: number) => {
    if (depth > MAX_DIR_DEPTH) return;
    let entries: (Directory | File)[] = [];
    try {
      entries = dir.list();
    } catch {
      return;
    }
    for (const entry of entries) {
      if (!entry) continue;
      const uri = (entry as File).uri;
      if (seenPaths.has(uri)) continue;
      seenPaths.add(uri);
      if (entry instanceof Directory) {
        try {
          if ((entry.info() ?? {}).exists !== false) walk(entry, depth + 1);
        } catch {
          walk(entry, depth + 1);
        }
      } else if (entry instanceof File) {
        const name = entry.name;
        if (!isSupportedAudio(name)) continue;
        const size = (() => {
          try {
            return entry.size != null && entry.size > 0 ? entry.size : null;
          } catch {
            return null;
          }
        })();
        found.push({ uri, name, size });
      }
    }
  };

  walk(root, 0);

  if (found.length === 0) {
    return {
      ok: true,
      result: { added: [], unsupported: [], errors: [], skipped: 0 },
    };
  }

  onPhase('import');
  const assets: DocumentPickerAsset[] = found.map((f) => ({
    uri: f.uri,
    name: f.name,
    size: f.size ?? undefined,
    lastModified: Date.now(),
  }));

  let processed = 0;
  const result = await importAssets(assets, {
    onProgress: (_done, _total) => {
      processed += 1;
      onProgress(processed, found.length);
    },
  });

  return { ok: true, result };
}

async function mapPool<T>(
  items: T[],
  poolSize: number,
  fn: (item: T, index: number) => Promise<void>,
): Promise<void> {
  const queue = [...items];
  const workers = Array.from({ length: Math.max(1, Math.min(poolSize, queue.length)) }, async () => {
    while (queue.length > 0) {
      const item = queue.shift();
      if (item === undefined) return;
      const index = items.indexOf(item);
      await fn(item, index);
    }
  });
  await Promise.all(workers);
}

export async function importWebDirectory(
  onPhase: (phase: 'walk' | 'import') => void,
  onProgress: (done: number, total: number) => void,
): Promise<ImportResult | null> {
  if (Platform.OS !== 'web') return null;
  // DOM is only present on web; typed loosely to avoid depending on DOM lib types.
  const gDoc = (globalThis as Record<string, unknown>).document as
    | { createElement: (tag: string) => Record<string, unknown> & { click: () => void } }
    | undefined;
  if (!gDoc) return null;

  return new Promise((resolve) => {
    const input = gDoc.createElement('input');
    input.type = 'file';
    input.multiple = true;
    (input as Record<string, unknown>).webkitdirectory = true;
    input.accept = 'audio/*';
    input.onchange = () => {
      const list = input.files as unknown as
        | ArrayLike<{ name: string; size: number; lastModified: number }>
        | null;
      const files = list ? Array.from(list) : [];
      if (files.length === 0) {
        resolve(null);
        return;
      }
      onPhase('walk');
      const assets: DocumentPickerAsset[] = files.map((file) => ({
        uri: URL.createObjectURL(file as unknown as Parameters<typeof URL.createObjectURL>[0]),
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
      }));
      onPhase('import');
      void importAssets(assets, {
        onProgress: (done, total) => onProgress(done, total),
      }).then(resolve, () => resolve(null));
    };
    input.oncancel = () => resolve(null);
    input.click();
  });
}

export async function fileIsAvailable(uri: string): Promise<boolean> {
  try {
    if (Platform.OS === 'web') {
      if (!uri.startsWith('blob:')) return true;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      try {
        const res = await fetch(uri, { method: 'HEAD', signal: controller.signal });
        return res.ok;
      } finally {
        clearTimeout(timer);
      }
    }
    return new File(uri).exists;
  } catch {
    return false;
  }
}

export async function verifyLibrary(tracks: Track[]): Promise<Track[]> {
  const updated = [...tracks];
  await mapPool(updated, 5, async (track) => {
    const ok = await fileIsAvailable(track.uri);
    if (ok !== !track.unavailable) {
      track.unavailable = !ok;
    }
  });
  return updated;
}

export async function relinkMissingFiles(tracks: Track[]): Promise<Track[]> {
  const missing = tracks.filter((t) => t.unavailable);
  if (missing.length === 0) return tracks;

  const dir = getMusicDir();
  let files: File[] = [];
  try {
    files = dir.list().filter((e): e is File => e instanceof File);
  } catch {
    files = [];
  }

  const updated = [...tracks];
  for (const track of missing) {
    if (!track.unavailable) continue;
    const candidate = files.find((f) => f.name === track.fileName);
    if (candidate && candidate.exists) {
      const idx = updated.findIndex((t) => t.id === track.id);
      if (idx >= 0) {
        updated[idx] = { ...track, uri: candidate.uri, unavailable: false };
      }
    }
  }
  return updated;
}

export function trackTotalSize(tracks: Track[]): number {
  return tracks.reduce((sum, t) => sum + (t.size ?? 0), 0);
}

export async function clearLibraryFiles(): Promise<void> {
  try {
    const music = getMusicDir();
    if (music.exists) music.delete();
    const art = getArtDir();
    if (art.exists) art.delete();
  } catch {
    // Some files may be held open; metadata handles the cleanup.
  }
}

export async function removeTrackFile(track: Track): Promise<void> {
  try {
    if (Platform.OS === 'web') return;
    const f = new File(track.uri);
    if (f.exists && track.uri.startsWith('file://')) f.delete();
  } catch {
    // ignore
  }
  if (track.artworkUri) {
    try {
      const a = new File(track.artworkUri);
      if (a.exists) a.delete();
    } catch {
      // ignore
    }
  }
}