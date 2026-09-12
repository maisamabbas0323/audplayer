import React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { Icon, type IconName } from './Icon';
import { colors, radius, spacing, shadow, type, fontWeight } from '../theme';

export type TabKey = 'home' | 'play' | 'library' | 'settings';

const TABS: { key: TabKey; icon: IconName; label: string }[] = [
  { key: 'home', icon: 'home', label: 'Home' },
  { key: 'play', icon: 'play', label: 'Play' },
  { key: 'library', icon: 'library', label: 'Library' },
  { key: 'settings', icon: 'settings', label: 'Settings' },
];

interface FloatingToolbarProps {
  active: TabKey;
  onSelect: (tab: TabKey) => void;
  nowPlaying?: boolean;
}

export function FloatingToolbar({ active, onSelect, nowPlaying }: FloatingToolbarProps) {
  const { width } = useWindowDimensions();
  const showLabels = width >= 520;

  return (
    <View style={styles.pill} accessibilityRole="tablist">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        const isPlayingTab = tab.key === 'play' && nowPlaying;
        const iconColor =
          tab.key === 'play' && nowPlaying
            ? colors.accent
            : isActive
              ? colors.accent
              : colors.textSecondary;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Icon name={tab.icon} size={20} color={iconColor} strokeWidth={isActive ? 2.2 : 1.8} />
              {isPlayingTab ? (
                <View style={styles.bars} pointerEvents="none">
                  <View style={[styles.bar, { height: 8 }]} />
                  <View style={[styles.bar, { height: 12 }]} />
                  <View style={[styles.bar, { height: 6 }]} />
                </View>
              ) : null}
            </View>
            {showLabels ? (
              <Text style={[styles.label, isActive && styles.labelActive]} numberOfLines={1}>
                {tab.label}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    backgroundColor: colors.bgElevated,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    ...shadow.md,
    alignItems: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minWidth: 64,
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  itemPressed: {
    opacity: 0.8,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.accentSoft,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    position: 'absolute',
    bottom: 3,
    height: 12,
  },
  bar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
  label: {
    color: colors.textSecondary,
    fontSize: type.label,
    fontWeight: fontWeight.medium,
    marginRight: spacing.xs,
  },
  labelActive: {
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
});