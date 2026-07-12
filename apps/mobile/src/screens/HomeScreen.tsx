import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../theme/ThemeContext';
import { spacing, font, radius } from '../theme';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { useAuthStore } from '../store/authStore';
import { couplesApi, callApi } from '../api';

function daysUntilAnniversary(anniversary: string | null): number | null {
  if (!anniversary) return null;
  const now = new Date();
  const ann = new Date(anniversary);
  const next = new Date(now.getFullYear(), ann.getMonth(), ann.getDate());
  if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    next.setFullYear(now.getFullYear() + 1);
  }
  return Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function HomeScreen({ navigation }: any) {
  const { theme } = useTheme();
  const me = useAuthStore((s) => s.user);
  const { data } = useQuery({ queryKey: ['couple'], queryFn: couplesApi.me });

  const couple = data?.couple;
  const annCountdown = daysUntilAnniversary(couple?.anniversary ?? null);

  const startCall = async () => {
    try {
      const { url } = await callApi.room();
      Linking.openURL(url);
    } catch {
      Alert.alert('Could not start call', 'Please try again.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.greeting, { color: theme.textMuted }]}>Welcome back,</Text>
        <Text style={[styles.name, { color: theme.text }]}>{me?.name}</Text>

        <Card style={styles.heroCard}>
          <View style={styles.avatars}>
            <Avatar name={me?.name || '?'} size={64} />
            <Text style={[styles.heart, { color: theme.primary }]}>♥</Text>
            <Avatar name={couple?.partner.name || '?'} size={64} />
          </View>
          <Text style={[styles.coupleNames, { color: theme.text }]}>
            {me?.name} & {couple?.partner.name}
          </Text>
          <View style={styles.statsRow}>
            <Stat label="Days together" value={String(couple?.daysTogether ?? 0)} theme={theme} />
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <Stat
              label="Until anniversary"
              value={annCountdown !== null ? `${annCountdown}d` : '—'}
              theme={theme}
            />
          </View>
        </Card>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick actions</Text>
        <View style={styles.actions}>
          <ActionButton
            glyph="✉"
            label="Message"
            onPress={() => navigation.navigate('Chat')}
            theme={theme}
          />
          <ActionButton glyph="📹" label="Video call" onPress={startCall} theme={theme} />
        </View>

        {annCountdown !== null && annCountdown <= 30 ? (
          <Card style={{ marginTop: spacing.lg }}>
            <Text style={{ color: theme.primary, fontWeight: '700', fontSize: font.body }}>
              ♥ Anniversary in {annCountdown} days
            </Text>
            <Text style={{ color: theme.textMuted, marginTop: 4 }}>
              Something to look forward to together.
            </Text>
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, theme }: any) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ color: theme.text, fontSize: font.h2, fontWeight: '700' }}>{value}</Text>
      <Text style={{ color: theme.textMuted, fontSize: font.tiny, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function ActionButton({ glyph, label, onPress, theme }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <Text style={{ fontSize: 28 }}>{glyph}</Text>
      <Text style={{ color: theme.text, marginTop: spacing.sm, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing.lg, paddingBottom: spacing.xxl },
  greeting: { fontSize: font.body, marginTop: spacing.sm },
  name: { fontSize: font.h1, fontWeight: '700', marginBottom: spacing.lg },
  heroCard: { alignItems: 'center' },
  avatars: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heart: { fontSize: 28, marginHorizontal: spacing.sm },
  coupleNames: { fontSize: font.h3, fontWeight: '700', marginTop: spacing.md },
  statsRow: { flexDirection: 'row', marginTop: spacing.lg, width: '100%', alignItems: 'center' },
  divider: { width: 1, height: 36 },
  sectionTitle: { fontSize: font.h3, fontWeight: '700', marginTop: spacing.xl, marginBottom: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.md },
  action: {
    flex: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
