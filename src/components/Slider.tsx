import React, { useCallback, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';

import { colors, radius } from '../theme';

interface SliderProps {
  value: number;
  onChange?: (value: number) => void;
  onCommit?: (value: number) => void;
  disabled?: boolean;
  accent?: boolean;
  trackHeight?: number;
}

export function Slider({
  value,
  onChange,
  onCommit,
  disabled,
  accent,
  trackHeight = 4,
}: SliderProps) {
  const widthRef = useRef(1);
  const draggingRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const lastSentRef = useRef<number>(value);

  const compute = useCallback((x: number) => {
    const w = widthRef.current || 1;
    return Math.max(0, Math.min(1, x / w));
  }, []);

  const send = useCallback(
    (v: number) => {
      if (Math.abs(v - lastSentRef.current) > 0.004) {
        lastSentRef.current = v;
        onChange?.(v);
      }
    },
    [onChange],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onStartShouldSetPanResponderCapture: () => !disabled,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (evt) => {
        draggingRef.current = true;
        setDragging(true);
        const v = compute(evt.nativeEvent.locationX);
        lastSentRef.current = v;
        onChange?.(v);
      },
      onPanResponderMove: (evt) => {
        if (!draggingRef.current) return;
        const v = compute(evt.nativeEvent.locationX);
        send(v);
      },
      onPanResponderRelease: (evt) => {
        const v = compute(evt.nativeEvent.locationX);
        draggingRef.current = false;
        setDragging(false);
        onCommit?.(v);
      },
      onPanResponderTerminate: () => {
        draggingRef.current = false;
        setDragging(false);
      },
    }),
  ).current;

  const clamped = Math.max(0, Math.min(1, value));

  return (
    <View
      style={[styles.container, styles.pointer]}
      onLayout={(e) => {
        widthRef.current = e.nativeEvent.layout.width;
      }}
      {...panResponder.panHandlers}
      accessibilityRole="adjustable"
      accessible
    >
      <View
        style={[
          styles.track,
          { height: trackHeight, backgroundColor: disabled ? colors.border : colors.border },
        ]}
      >
        <View
          style={[
            styles.fill,
            {
              width: `${clamped * 100}%`,
              backgroundColor: accent ? colors.accent : colors.textSecondary,
            },
          ]}
        />
      </View>
      <View
        style={[
          styles.knob,
          {
            left: `${clamped * 100}%`,
            backgroundColor: accent ? colors.accent : colors.text,
            transform: [{ translateX: -8 }],
            opacity: dragging || !disabled ? 1 : 0,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
    marginHorizontal: -12,
  },
  pointer: {
    cursor: 'pointer',
  },
  track: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  knob: {
    position: 'absolute',
    top: '50%',
    marginTop: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});