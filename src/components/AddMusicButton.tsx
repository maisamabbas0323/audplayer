import React from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';

import { Icon } from './Icon';
import { colors, shadow } from '../theme';

interface AddMusicButtonProps {
  onPress: () => void;
  style?: object;
}

export function AddMusicButton({ onPress, style }: AddMusicButtonProps) {
  const { width, height } = useWindowDimensions();
  const size = Math.min(width, height) < 520 ? 52 : 60;

  return (
    <View style={[styles.wrap, { width: size, height: size }, style]}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Add music"
        style={({ pressed }) => [
          styles.button,
          { width: size, height: size, borderRadius: size / 2 },
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.iconWrap}>
          <Icon name="plus" size={size < 56 ? 22 : 25} color={colors.onAccent} strokeWidth={2} />
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    zIndex: 5,
  },
  button: {
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.md,
  },
  pressed: {
    backgroundColor: colors.accentPressed,
    transform: [{ scale: 0.92 }],
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});