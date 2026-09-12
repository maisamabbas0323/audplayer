import { Platform } from 'react-native';
import * as MediaLibrary from 'expo-media-library';

import { importAssets, isSupportedAudio, makeTrackId } from './filesystem';
import type { DocumentPickerAsset } from 'expo-document-picker';
import type { ImportResult } from '../types/music';

export function canScanDevice(): boolean {
  return Platform.OS !== 'web';
}

export async function hasScanPermission(): Promise<boolean> {
  if (!canScanDevice()) return false;
  try {
    const perm = await MediaLibrary.getPermissionsAsync(false, ['audio']);
    return perm.granted;
  } catch {
    return false;
  }
}

export async function requestScanPermission(): Promise<boolean> {
  if (!canScanDevice()) return false;
  try {
    const perm = await MediaLibrary.requestPermissionsAsync(false, ['audio']);
    return perm.granted;
  } catch {
    return false;
  }
}

const PAGE_SIZE = 500;
const MAX_ASSETS = 5000;

/**
 * Enumerates every audio asset in the device media library and imports the
 * ones not already in the app's library. Assumes read permission is granted.
 */
export async function scanDeviceAudio(
  existingIds: Set<string>,
  onProgress?: (done: number, total: number) => void,
): Promise<ImportResult> {
  const empty: ImportResult = { added: [], unsupported: [], errors: [], skipped: 0 };
  if (!canScanDevice()) return empty;

  const assets: MediaLibrary.Asset[] = [];
  try {
    let after: string | undefined;
    for (;;) {
      const page = await MediaLibrary.getAssetsAsync({
        mediaType: 'audio',
        first: PAGE_SIZE,
        after,
      });
      assets.push(...page.assets);
      if (!page.hasNextPage || !page.endCursor) break;
      after = page.endCursor;
      if (assets.length >= MAX_ASSETS) break;
    }
  } catch {
    return empty;
  }

  const candidates: DocumentPickerAsset[] = [];
  let unsupportedExt = 0;
  for (const asset of assets) {
    if (!isSupportedAudio(asset.filename)) {
      unsupportedExt += 1;
      continue;
    }
    const id = makeTrackId(asset.filename, undefined);
    if (existingIds.has(id)) continue;
    let uri = asset.uri;
    if (Platform.OS === 'ios' && uri.startsWith('ph://')) {
      try {
        const info = await MediaLibrary.getAssetInfoAsync(asset.id);
        uri = info.localUri ?? uri;
      } catch {
        // fall back to the original asset uri
      }
    }
    candidates.push({
      uri,
      name: asset.filename,
      size: undefined,
      lastModified: asset.modificationTime,
    });
  }

  const result = await importAssets(candidates, {
    existingIds,
    onProgress: (done, total) => onProgress?.(done, total),
  });
  result.skipped += unsupportedExt;

  return result;
}