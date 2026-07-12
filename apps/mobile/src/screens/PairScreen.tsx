import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../theme/ThemeContext';
import { spacing, font, radius } from '../theme';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useAuthStore } from '../store/authStore';
import { couplesApi } from '../api';

export function PairScreen() {
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const copyCode = async () => {
    if (user?.inviteCode) {
      await Clipboard.setStringAsync(user.inviteCode);
      Alert.alert('Copied', 'Your invite code is copied. Share it with your partner.');
    }
  };

  const onPair = async () => {
    if (!code.trim()) return Alert.alert("Enter your partner's code");
    setLoading(true);
    try {
      await couplesApi.pair(code.trim());
      await queryClient.invalidateQueries({ queryKey: ['couple'] });
    } catch (e: any) {
      Alert.alert('Could not pair', e?.response?.data?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Connect with your partner</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            Share your code, or enter theirs. Only one of you needs to do this.
          </Text>
        </View>

        <Card style={{ marginBottom: spacing.lg }}>
          <Text style={[styles.label, { color: theme.textMuted }]}>YOUR INVITE CODE</Text>
          <Text style={[styles.code, { color: theme.primary }]} selectable>
            {user?.inviteCode}
          </Text>
          <Button title="Copy my code" variant="ghost" onPress={copyCode} />
        </Card>

        <Text style={[styles.or, { color: theme.textMuted }]}>— or —</Text>

        <Input
          label="Enter partner's code"
          value={code}
          onChangeText={setCode}
          autoCapitalize="none"
          placeholder="paste their code here"
        />
        <Button title="Pair now" onPress={onPair} loading={loading} />

        <Pressable onPress={logout} style={styles.logout}>
          <Text style={{ color: theme.textMuted }}>Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  header: { marginBottom: spacing.xl, alignItems: 'center' },
  title: { fontSize: font.h2, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: font.small, marginTop: spacing.sm, textAlign: 'center', lineHeight: 20 },
  label: { fontSize: font.tiny, letterSpacing: 1, marginBottom: spacing.sm },
  code: {
    fontSize: font.h3,
    fontWeight: '700',
    marginBottom: spacing.md,
    letterSpacing: 1,
  },
  or: { textAlign: 'center', marginVertical: spacing.md },
  logout: { alignItems: 'center', marginTop: spacing.xl },
});
