import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { BackButton } from '../components/BackButton';
import { Icon, type IconName } from '../components/Icon';
import { ProgressBar } from '../components/ProgressBar';
import { colors, radius, spacing, type, fontWeight } from '../theme';
import { useApp } from '../context/AppProvider';
import { useDockPadding } from '../hooks/useDockPadding';

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const {
    settings,
    updateSettings,
    volume,
    setVolume,
    relinkLibrary,
    importFiles,
    importFolder,
    scanLibrary,
    clearAllLibrary,
    requestConfirm,
  } = useApp();

  const bottomPad = useDockPadding();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <BackButton onPress={onBack} />
        <View style={styles.headerText}>
          <Text style={styles.title}>Settings</Text>
        </View>
      </View>

      <Section title="Playback">
        <Row
          icon="next"
          label="Auto-play next track"
          right={
            <Switch
              value={settings.autoplayNext}
              onValueChange={(v) => updateSettings({ autoplayNext: v })}
              trackColor={{ true: colors.accent, false: colors.border }}
              thumbColor="#fff"
            />
          }
        />
        <Row
          icon="refresh"
          label="Resume playback"
          right={
            <Switch
              value={settings.resumePlayback}
              onValueChange={(v) => updateSettings({ resumePlayback: v })}
              trackColor={{ true: colors.accent, false: colors.border }}
              thumbColor="#fff"
            />
          }
        />
        <Row
          icon="volume"
          label="Background playback"
          right={
            <Switch
              value={settings.backgroundPlayback}
              onValueChange={(v) => updateSettings({ backgroundPlayback: v })}
              trackColor={{ true: colors.accent, false: colors.border }}
              thumbColor="#fff"
            />
          }
        />
        <Row
          icon="queue"
          label="Remember queue on close"
          right={
            <Switch
              value={settings.persistQueue}
              onValueChange={(v) => updateSettings({ persistQueue: v })}
              trackColor={{ true: colors.accent, false: colors.border }}
              thumbColor="#fff"
            />
          }
        />
        <View style={styles.volumeBlock}>
          <View style={styles.volumeHeader}>
            <Icon name="volume" size={17} color={colors.textSecondary} />
            <Text style={styles.rowLabel}>Volume</Text>
          </View>
          <ProgressBar
            position={volume}
            duration={1}
            onSeek={(v) => setVolume(v)}
            variant="percent"
          />
        </View>
      </Section>

      <Section title="Appearance">
        <Row
          icon="list"
          label="Compact track list"
          right={
            <Switch
              value={settings.compactList}
              onValueChange={(v) => updateSettings({ compactList: v })}
              trackColor={{ true: colors.accent, false: colors.border }}
              thumbColor="#fff"
            />
          }
        />
      </Section>

      <Section title="Library">
        <Row
          icon="scan"
          label="Scan device for music"
          onPress={() =>
            requestConfirm({
              title: 'Scan for music?',
              message:
                'Audplayer will look through this device for every audio file and add it to your library. It will ask for permission to read your music.',
              confirmLabel: 'Scan',
              onConfirm: () => {
                void scanLibrary();
              },
            })
          }
          showArrow
        />
        <Row
          icon="plus"
          label="Add music files"
          onPress={importFiles}
          showArrow
        />
        <Row
          icon="folder"
          label="Add a folder"
          onPress={importFolder}
          showArrow
          last
        />
        <Row
          icon="refresh"
          label="Verify & relink library"
          onPress={relinkLibrary}
          showArrow
        />
        <Row
          icon="trash"
          label="Clear entire library"
          tint="danger"
          last
          onPress={() =>
            requestConfirm({
              title: 'Clear your library?',
              message: 'All tracks, favorites and playlists will be removed from this app. Files on your device stay untouched.',
              confirmLabel: 'Clear',
              danger: true,
              onConfirm: clearAllLibrary,
            })
          }
        />
      </Section>

      <View style={styles.about}>
        <Text style={styles.aboutTitle}>Audplayer</Text>
        <Text style={styles.aboutText}>Version 1.0.0 · Your music, on-device.</Text>
      </View>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

interface RowProps {
  icon: IconName;
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
  showArrow?: boolean;
  tint?: 'danger' | 'default';
  last?: boolean;
}

function Row({ icon, label, right, onPress, showArrow, tint = 'default', last }: RowProps) {
  const content = (
    <>
      <View style={styles.rowIconSlot}>
        <Icon
          name={icon}
          size={18}
          color={tint === 'danger' ? colors.danger : colors.textSecondary}
        />
      </View>
      <Text style={[styles.rowLabel, tint === 'danger' && styles.rowLabelDanger]} numberOfLines={1}>
        {label}
      </Text>
      {right ?? null}
      {showArrow ? (
        <Icon name="chevronRight" size={16} color={colors.textMuted} />
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.row, !last && styles.rowBorder, pressed && styles.rowPressed]}
        accessibilityRole="button"
      >
        {content}
      </Pressable>
    );
  }
  return <View style={[styles.row, !last && styles.rowBorder]}>{content}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: fontWeight.bold,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.textMuted,
    fontSize: type.small,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 54,
    paddingVertical: spacing.sm,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowPressed: {
    opacity: 0.75,
  },
  rowIconSlot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    color: colors.text,
    fontSize: type.body,
    fontWeight: fontWeight.medium,
  },
  rowLabelDanger: {
    color: colors.danger,
  },
  volumeBlock: {
    paddingVertical: spacing.md,
  },
  volumeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  about: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  aboutTitle: {
    color: colors.textSecondary,
    fontSize: type.body,
    fontWeight: fontWeight.semibold,
  },
  aboutText: {
    color: colors.textMuted,
    fontSize: type.small,
    marginTop: spacing.xs,
  },
});