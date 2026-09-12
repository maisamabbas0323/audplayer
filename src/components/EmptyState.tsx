import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';

import { Icon, type IconName } from './Icon';
import { colors, radius, spacing, type, fontWeight } from '../theme';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Icon name={icon} size={30} color={colors.textMuted} strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
          accessibilityRole="button"
        >
          <Icon name="plus" size={16} color={colors.onAccent} />
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </Pressable>
      ) : null}
      {secondaryActionLabel && onSecondaryAction ? (
        <Pressable
          onPress={onSecondaryAction}
          style={({ pressed }) => [styles.secondary, pressed && styles.secondaryPressed]}
          accessibilityRole="button"
        >
          <Icon name="scan" size={16} color={colors.textSecondary} />
          <Text style={styles.secondaryLabel}>{secondaryActionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: type.heading,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  message: {
    color: colors.textMuted,
    fontSize: type.body,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    marginTop: spacing.xl,
  },
  actionPressed: {
    backgroundColor: colors.accentPressed,
    transform: [{ scale: 0.98 }],
  },
  actionLabel: {
    color: colors.onAccent,
    fontSize: type.label,
    fontWeight: fontWeight.semibold,
  },
  secondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    marginTop: spacing.md,
  },
  secondaryPressed: {
    backgroundColor: colors.surface,
    transform: [{ scale: 0.98 }],
  },
  secondaryLabel: {
    color: colors.textSecondary,
    fontSize: type.label,
    fontWeight: fontWeight.medium,
  },
});