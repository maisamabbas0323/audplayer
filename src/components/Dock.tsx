import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddMusicButton } from './AddMusicButton';
import { FloatingToolbar, type TabKey } from './FloatingToolbar';

interface DockProps {
  active: TabKey;
  onSelect: (tab: TabKey) => void;
  onAddMusic: () => void;
  nowPlaying?: boolean;
}

export function Dock({ active, onSelect, onAddMusic, nowPlaying }: DockProps) {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8);
  const [toolbarH, setToolbarH] = useState<number | null>(null);

  return (
    <View style={[styles.dock, { paddingBottom: bottomInset }]} pointerEvents="box-none">
      <View style={styles.centered}>
        <View
          style={styles.toolbarHolder}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            setToolbarH((prev) => (prev && Math.abs(prev - h) < 1 ? prev : h));
          }}
        >
          <FloatingToolbar active={active} onSelect={onSelect} nowPlaying={nowPlaying} />
        </View>
        {toolbarH != null ? (
          <View style={[styles.addSlot, { bottom: toolbarH + 8 }]}>
            <AddMusicButton onPress={onAddMusic} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  centered: {
    alignItems: 'center',
  },
  toolbarHolder: {
    alignItems: 'center',
  },
  addSlot: {
    position: 'absolute',
    right: 0,
  },
});