import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, shadow, type, fontWeight } from '../theme';

export interface ConfirmRequest {
  title: string;
  message?: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
}

interface ConfirmDialogProps {
  request: ConfirmRequest | null;
  onClose: () => void;
}

export function ConfirmDialog({ request, onClose }: ConfirmDialogProps) {
  return (
    <Modal
      visible={request != null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Dismiss" />
        <View
          style={styles.card}
          accessibilityRole="alert"
          accessibilityViewIsModal
        >
          <Text style={styles.title}>{request?.title ?? ''}</Text>
          {request?.message ? <Text style={styles.message}>{request.message}</Text> : null}
          <View style={styles.actions}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.btn, styles.btnGhost, pressed && styles.btnPressed]}
              accessibilityRole="button"
            >
              <Text style={styles.btnGhostLabel}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                const fn = request?.onConfirm;
                onClose();
                fn?.();
              }}
              style={({ pressed }) => [
                styles.btn,
                request?.danger ? styles.btnDanger : styles.btnPrimary,
                pressed && styles.btnPressed,
              ]}
              accessibilityRole="button"
            >
              <Text style={styles.btnPrimaryLabel}>{request?.confirmLabel ?? 'OK'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...shadow.lg,
  },
  title: {
    color: colors.text,
    fontSize: type.heading,
    fontWeight: fontWeight.semibold,
  },
  message: {
    color: colors.textSecondary,
    fontSize: type.body,
    marginTop: spacing.sm,
    lineHeight: 21,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  btn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    minWidth: 84,
    alignItems: 'center',
  },
  btnGhost: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnPrimary: {
    backgroundColor: colors.accent,
  },
  btnDanger: {
    backgroundColor: colors.danger,
  },
  btnPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  btnGhostLabel: {
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  btnPrimaryLabel: {
    color: colors.onAccent,
    fontWeight: fontWeight.semibold,
  },
});