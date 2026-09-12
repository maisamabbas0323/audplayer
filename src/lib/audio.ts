import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioStatus,
} from 'expo-audio';

export async function configureAudioMode(options?: { shouldPlayInBackground?: boolean }) {
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: options?.shouldPlayInBackground ?? false,
      interruptionMode: 'mixWithOthers',
      allowsRecording: false,
    });
  } catch {
    // Non-fatal; continue without session tuning.
  }
}

export function probeDuration(uri: string): Promise<number | null> {
  return new Promise((resolve) => {
    let settled = false;
    let player: AudioPlayer | null = null;

    const finish = (value: number | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        player?.remove();
      } catch {
        // already released
      }
      resolve(value);
    };

    const timer = setTimeout(() => finish(null), 9000);

    try {
      player = createAudioPlayer(uri, { updateInterval: 200 });
    } catch {
      finish(null);
      return;
    }

    try {
      player.addListener('playbackStatusUpdate', (status: AudioStatus) => {
        if (status == null) return;
        if (status.isLoaded && status.duration > 0) {
          finish(status.duration);
        }
      });
    } catch {
      finish(player.duration && player.duration > 0 ? player.duration : null);
    }
  });
}

export function isSourceAccessible(status: AudioStatus | null | undefined): boolean {
  return !!status && status.isLoaded;
}