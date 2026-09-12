import { useEffect, useRef, useState } from 'react';
import {
  createAudioPlayer,
  useAudioPlayerStatus,
  type AudioPlayer,
  type AudioSource,
} from 'expo-audio';

import type { RepeatMode } from '../types/music';

interface EngineOptions {
  defaultVolume: number;
  autoplayNext: boolean;
  onTrackStart?: (trackId: string) => void;
  onPlaybackError?: (message: string) => void;
}

interface LoadTarget {
  id: string;
  source: AudioSource;
  autoplay: boolean;
}

export function useAudioPlayer({
  defaultVolume,
  autoplayNext,
  onTrackStart,
  onPlaybackError,
}: EngineOptions) {
  const playerRef = useRef<AudioPlayer | null>(null);
  if (!playerRef.current) {
    playerRef.current = createAudioPlayer(null, { updateInterval: 250 });
  }
  const player = playerRef.current;
  const status = useAudioPlayerStatus(player);

  const [queue, setQueue] = useState<string[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const [shuffle, setShuffle] = useState(false);
  const [volume, setVolumeState] = useState(defaultVolume);
  const [muted, setMutedState] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTargetRef = useRef<LoadTarget | null>(null);
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoplayTargetRef = useRef<string | null>(null);
  const finishedRef = useRef(false);
  const autoplayRef = useRef(autoplayNext);
  const volumeRef = useRef(volume);
  const mutedRef = useRef(muted);
  const repeatRef = useRef(repeat);
  const shuffleRef = useRef(shuffle);
  const currentIdRef = useRef(currentId);
  const queueRef = useRef(queue);
  const aliveRef = useRef(true);
  const shuffleBankRef = useRef<number[]>([]);
  const resolverRef = useRef<(id: string) => AudioSource | null>(() => null);
  const statusIsLoadedRef = useRef(false);

  useEffect(() => {
    autoplayRef.current = autoplayNext;
  }, [autoplayNext]);

  useEffect(() => {
    volumeRef.current = volume;
    player.volume = volume;
  }, [volume, player]);

  useEffect(() => {
    mutedRef.current = muted;
    player.muted = muted;
  }, [muted, player]);

  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  useEffect(() => {
    shuffleRef.current = shuffle;
  }, [shuffle]);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    currentIdRef.current = currentId;
  }, [currentId]);

  useEffect(() => {
    return () => {
      aliveRef.current = false;
      try {
        player.remove();
      } catch {
        // already released
      }
    };
  }, [player]);

  useEffect(() => {
    statusIsLoadedRef.current = status.isLoaded;
    if (status.isLoaded && loadTimerRef.current) {
      clearTimeout(loadTimerRef.current);
      loadTimerRef.current = null;
    }
    if (status.isLoaded) {
      setError(null);
      if (
        autoplayTargetRef.current != null &&
        autoplayTargetRef.current === loadTargetRef.current?.id
      ) {
        autoplayTargetRef.current = null;
        player.play();
      }
    }
  }, [status.isLoaded]);

  const clearLoadTimer = () => {
    if (loadTimerRef.current) {
      clearTimeout(loadTimerRef.current);
      loadTimerRef.current = null;
    }
  };

  const performLoad = (target: LoadTarget) => {
    loadTargetRef.current = target;
    setError(null);
    clearLoadTimer();
    try {
      player.volume = volumeRef.current;
      player.muted = mutedRef.current;
      player.loop = repeatRef.current === 'one';
      player.replace(target.source);
      if (target.autoplay) {
        autoplayTargetRef.current = target.id;
        player.play();
        loadTimerRef.current = setTimeout(() => {
          if (
            aliveRef.current &&
            loadTargetRef.current?.id === target.id &&
            !statusIsLoadedRef.current
          ) {
            setError("Couldn't play this track.");
          }
        }, 4500);
      }
    } catch {
      onPlaybackError?.("Couldn't play this track.");
      setError("Couldn't play this track.");
    }
  };

  const loadTrack = (id: string, autoplay: boolean) => {
    const source = resolverRef.current(id);
    if (!source) {
      onPlaybackError?.('This file is no longer available. Relink it or add it again.');
      setError('This file is no longer available. Relink it or add it again.');
      return false;
    }
    performLoad({ id, source, autoplay });
    return true;
  };

  const setSourceResolver = (resolver: (id: string) => AudioSource | null) => {
    resolverRef.current = resolver;
  };

  const pickNextIndex = (currentIndex: number, count: number): number => {
    if (count <= 1) return -1;
    if (shuffleRef.current) {
      let bank = shuffleBankRef.current;
      if (bank.length === 0) {
        bank = [];
        for (let i = 0; i < count; i++) if (i !== currentIndex) bank.push(i);
        for (let i = bank.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const tmp = bank[i];
          bank[i] = bank[j];
          bank[j] = tmp;
        }
        shuffleBankRef.current = bank;
      }
      const next = bank.shift();
      return next == null ? -1 : next;
    }
    const next = currentIndex + 1;
    if (next < count) return next;
    if (repeatRef.current === 'all') return 0;
    return -1;
  };

  const advance = (manual: boolean) => {
    const q = queueRef.current;
    const id = currentIdRef.current;
    if (q.length === 0 || !id) return;
    const idx = q.indexOf(id);
    const nextIdx = pickNextIndex(idx, q.length);
    if (nextIdx < 0) {
      if (manual) {
        // At the end of the queue; stay put.
        player.seekTo(0).catch(() => {});
        player.pause();
      }
      return;
    }
    const nextId = q[nextIdx];
    setCurrentId(nextId);
    loadTrack(nextId, true);
  };

  useEffect(() => {
    if (status.didJustFinish && !finishedRef.current) {
      finishedRef.current = true;
      const id = currentIdRef.current;
      if (!id) return;
      if (repeatRef.current === 'one') {
        player.seekTo(0).catch(() => {});
        player.play();
        finishedRef.current = false;
        return;
      }
      if (autoplayRef.current || repeatRef.current === 'all') {
        advance(false);
      }
    } else if (!status.didJustFinish) {
      finishedRef.current = false;
    }
  }, [status.didJustFinish, autoplayNext]); // eslint-disable-line react-hooks/exhaustive-deps

  const play = () => {
    if (currentIdRef.current == null) return;
    const pos = player.currentTime;
    const dur = player.duration;
    if (dur > 0 && pos >= dur - 0.4 && pos > 0) {
      player.seekTo(0).catch(() => {});
    }
    player.play();
  };

  const pause = () => player.pause();

  const toggle = () => {
    if (status.playing) pause();
    else play();
  };

  const next = () => advance(true);

  const previous = () => {
    const id = currentIdRef.current;
    if (!id) return;
    if (player.currentTime > 3) {
      player.seekTo(0).catch(() => {});
      return;
    }
    const q = queueRef.current;
    const idx = q.indexOf(id);
    if (idx > 0) {
      const prevId = q[idx - 1];
      setCurrentId(prevId);
      loadTrack(prevId, true);
    } else {
      player.seekTo(0).catch(() => {});
    }
  };

  const seekTo = (seconds: number) => {
    if (!isFinite(seconds) || seconds < 0) return;
    player.seekTo(seconds).catch(() => {});
  };

  const playCollection = (ids: string[], startIndex: number) => {
    if (!ids || ids.length === 0) return;
    const start = Math.max(0, Math.min(startIndex, ids.length - 1));
    shuffleBankRef.current = [];
    setQueue([...ids]);
    const targetId = ids[start];
    setCurrentId(targetId);
    loadTrack(targetId, true);
  };

  const playTrack = (id: string) => {
    const currentQueue = queueRef.current;
    if (currentQueue.includes(id)) {
      setCurrentId(id);
      loadTrack(id, true);
      return;
    }
    const nextQueue = [id, ...currentQueue.filter((x) => x !== id)];
    setQueue(nextQueue);
    setCurrentId(id);
    loadTrack(id, true);
  };

  const restoreQueue = (ids: string[], current: string | null) => {
    if (ids.length === 0) return;
    setQueue([...ids]);
    const target = current && ids.includes(current) ? current : ids[0];
    setCurrentId(target);
    loadTrack(target, false);
  };

  const enqueueEnd = (id: string) => {
    if (queueRef.current.includes(id)) return;
    setQueue([...queueRef.current, id]);
  };

  const enqueueNext = (id: string) => {
    if (queueRef.current.includes(id)) return;
    const idx = currentIdRef.current ? queueRef.current.indexOf(currentIdRef.current) : -1;
    const insertAt = idx >= 0 ? idx + 1 : queueRef.current.length;
    const nextQueue = [...queueRef.current];
    nextQueue.splice(insertAt, 0, id);
    setQueue(nextQueue);
  };

  const removeFromQueue = (index: number) => {
    const q = queueRef.current;
    if (index < 0 || index >= q.length) return;
    const removed = q[index];
    const nextQueue = q.filter((_, i) => i !== index);
    setQueue(nextQueue);
    if (removed === currentIdRef.current) {
      if (nextQueue.length === 0) {
        try {
          player.replace(null);
        } catch {
          // ignore
        }
        setCurrentId(null);
        return;
      }
      const newIdx = Math.min(index, nextQueue.length - 1);
      const nextId = nextQueue[newIdx];
      setCurrentId(nextId);
      loadTrack(nextId, true);
    }
  };

  const moveInQueue = (from: number, to: number) => {
    const q = queueRef.current;
    if (from < 0 || from >= q.length || to < 0 || to >= q.length) return;
    const nextQueue = [...q];
    const [item] = nextQueue.splice(from, 1);
    nextQueue.splice(to, 0, item);
    setQueue(nextQueue);
  };

  const clearQueue = () => {
    setQueue([]);
    shuffleBankRef.current = [];
    try {
      player.replace(null);
    } catch {
      // ignore
    }
    setCurrentId(null);
  };

  const setVolume = (v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    volumeRef.current = clamped;
    if (clamped > 0 && mutedRef.current) {
      setMutedState(false);
    }
    try {
      player.volume = clamped;
    } catch {
      // ignore
    }
  };

  const toggleMute = () => setMutedState((prev) => !prev);

  const toggleShuffle = () => {
    setShuffle((prev) => {
      if (!prev) {
        const id = currentIdRef.current;
        const q = queueRef.current;
        const idx = id ? q.indexOf(id) : -1;
        const bank: number[] = [];
        for (let i = 0; i < q.length; i++) {
          if (i !== idx) bank.push(i);
        }
        for (let i = bank.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          const tmp = bank[i];
          bank[i] = bank[j];
          bank[j] = tmp;
        }
        shuffleBankRef.current = bank;
      } else {
        shuffleBankRef.current = [];
      }
      return !prev;
    });
  };

  const cycleRepeat = () => {
    setRepeat((prev) => {
      const nextMode: RepeatMode = prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off';
      player.loop = nextMode === 'one';
      return nextMode;
    });
  };

  return {
    player,
    status,
    queue,
    currentId,
    repeat,
    shuffle,
    volume,
    muted,
    isPlaying: status.playing,
    position: status.currentTime,
    duration: status.duration,
    isLoaded: status.isLoaded,
    isBuffering: status.isBuffering,
    error,
    clearError: () => setError(null),
    play,
    pause,
    toggle,
    next,
    previous,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    playCollection,
    playTrack,
    restoreQueue,
    enqueueEnd,
    enqueueNext,
    removeFromQueue,
    moveInQueue,
    clearQueue,
    setRepeat,
    setSourceResolver,
  };
}