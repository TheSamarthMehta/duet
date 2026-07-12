import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../theme/ThemeContext';
import { spacing, font, radius } from '../theme';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { useAuthStore } from '../store/authStore';
import { couplesApi } from '../api';

export function SettingsScreen() {
  const { theme, mode, setMode } = useTheme();
  const me = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['couple'], queryFn: couplesApi.me });
  const [showPicker, setShowPicker] = useState(false);

  const onSetAnniversary = async (_: unknown, date?: Date) => {
    setShowPicker(false);
    if (!date) return;
    try {
      await couplesApi.setAnniversary(date.toISOString());
      await queryClient.invalidateQueries({ queryKey: ['couple'] });
      Alert.alert('Saved', 'Your anniversary has been set.');
    } catch {
      Alert.alert('Could not save');
    }
  };

  const confirmLogout = () => {
    Alert.alert('Sign out?', 'You can always sign back in.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: logout },
    ]);
  };

  const cycleTheme = () => {
    setMode(mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

        <Card style={styles.profile}>
          <Avatar name={me?.name || '?'} size={64} />
          <View style={{ marginLeft: spacing.md, flex: 1 }}>
            <Text style={{ color: theme.text, fontSize: font.h3, fontWeight: '700' }}>{me?.name}</Text>
            <Text style={{ color: theme.textMuted, marginTop: 2 }}>{me?.email}</Text>
          </View>
        </Card>

        <Row
          theme={theme}
          label="Theme"
          value={mode === 'system' ? 'System' : mode === 'dark' ? 'Dark' : 'Light'}
          onPress={cycleTheme}
        />
        <Row
          theme={theme}
          label="Anniversary"
          value={
            data?.couple?.anniversary
              ? new Date(data.couple.anniversary).toLocaleDateString()
              : 'Set date'
          }
          onPress={() => setShowPicker(true)}
        />
        <Row theme={theme} label="Partner" value={data?.couple?.partner.name || '—'} />
        <Row theme={theme} label="Days together" value={String(data?.couple?.daysTogether ?? 0)} />

        {showPicker ? (
          <DateTimePicker
            value={data?.couple?.anniversary ? new Date(data.couple.anniversary) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onSetAnniversary}
          />
        ) : null}

        <Pressable onPress={confirmLogout} style={[styles.logout, { borderColor: theme.border }]}>
          <Text style={{ color: '#D9534F', fontWeight: '600' }}>Sign out</Text>
        </Pressable>

        <Text style={[styles.version, { color: theme.textMuted }]}>Duet v0.1.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ theme, label, value, onPress }: any) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <Text style={{ color: theme.text, fontSize: font.body }}>{label}</Text>
      <Text style={{ color: theme.textMuted }}>{value}{onPress ? '  ›' : ''}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontSize: font.h1, fontWeight: '700', marginBottom: spacing.lg },
  profile: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  logout: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  version: { textAlign: 'center', marginTop: spacing.xl, fontSize: font.tiny },
});
