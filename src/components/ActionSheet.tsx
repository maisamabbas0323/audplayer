import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon, type IconName } from './Icon';
import { BottomSheet } from './BottomSheet';
import { colors, radius, spacing, type, fontWeight } from '../theme';

export interface SheetAction {
  key: string;
  label: string;
  icon?: IconName;
  destructive?: boolean;
  tint?: 'danger' | 'accent' | 'default';
  checked?: boolean;
  closeOnPress?: boolean;
  onPress: () => void;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  header?: React.ReactNode;
  actions: SheetAction[];
}

export function ActionSheet({ visible, onClose, title, header, actions }: ActionSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title}>
      {header ? <View style={styles.header}>{header}</View> : null}
      <FlatList
        data={actions}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              item.onPress();
              if (item.closeOnPress !== false) onClose();
            }}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            accessibilityRole="button"
          >
            <View style={[styles.iconSlot, item.checked && styles.iconSlotChecked]}>
              {item.icon ? (
                <Icon
                  name={item.icon}
                  size={19}
                  color={
                    item.tint === 'danger'
                      ? colors.danger
                      : item.tint === 'accent'
                        ? colors.accent
                        : colors.textSecondary
                  }
                />
              ) : null}
            </View>
            <Text
              style={[
                styles.label,
                item.destructive && styles.labelDanger,
                item.tint === 'accent' && styles.labelAccent,
                item.checked && styles.labelChecked,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        )}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 52,
  },
  rowPressed: {
    backgroundColor: colors.surface,
  },
  iconSlot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSlotChecked: {
    backgroundColor: colors.accentSoft,
  },
  label: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: fontWeight.regular,
    flex: 1,
  },
  labelDanger: {
    color: colors.danger,
  },
  labelAccent: {
    color: colors.accent,
  },
  labelChecked: {
    color: colors.accent,
    fontWeight: fontWeight.semibold,
  },
});