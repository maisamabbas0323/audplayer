import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { Icon } from './Icon';
import { colors, radius } from '../theme';
import { hashString } from '../lib/utils';

const FALLBACK_BG = [
  ['#1E2430', '#141826'],
  ['#20242B', '#16191F'],
  ['#21242C', '#151820'],
  ['#1B2229', '#12181E'],
  ['#232028', '#171419'],
  ['#1F2130', '#141520'],
] as const;

const ACCENTS = [
  '#7EA0FF',
  '#8A93A6',
  '#6E8B7B',
  '#9D8AC1',
  '#B08968',
  '#79A7A3',
] as const;

interface ArtworkProps {
  uri?: string | null;
  title?: string | null;
  size: number;
  radiusSize?: number;
  iconSize?: number;
}

export function Artwork({ uri, title, size, radiusSize, iconSize }: ArtworkProps) {
  const h = hashString(title || 'music');
  const palette = FALLBACK_BG[h % FALLBACK_BG.length];
  const accent = ACCENTS[h % ACCENTS.length];
  const r = radiusSize ?? Math.round(size * 0.16);

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: r }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: r,
          backgroundColor: palette[0],
        },
      ]}
    >
      <View
        style={[
          styles.disc,
          {
            width: size * 0.58,
            height: size * 0.58,
            borderRadius: size * 0.29,
            borderColor: accent,
          },
        ]}
      >
        <Icon
          name="music"
          size={iconSize ?? Math.round(size * 0.26)}
          color={accent}
          strokeWidth={1.6}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  disc: {
    borderWidth: 1.5,
    opacity: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});