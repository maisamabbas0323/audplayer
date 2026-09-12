import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { colors, radius, spacing, shadow, type, fontWeight } from '../theme';

export interface ToastManagerProps {
  message?: string | null;
}

export function ToastManager({ message: incoming }: ToastManagerProps) {
  const [msg, setMsg] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

  useEffect(() => {
    if (!incoming) return;
    const id = ++idRef.current;
    if (timerRef.current) clearTimeout(timerRef.current);
    setMsg(incoming);
    timerRef.current = setTimeout(() => {
      if (id === idRef.current) setMsg(null);
    }, 2500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [incoming]);

  if (!msg) return null;

  return (
    <View style={styles.wrap} pointerEvents="none">
      <View style={styles.toast}>
        <Text style={styles.text} numberOfLines={2}>
          {msg}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
    paddingHorizontal: spacing.xl,
  },
  toast: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    maxWidth: 480,
    ...shadow.md,
  },
  text: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
});