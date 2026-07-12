import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { spacing, font } from '../theme';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuthStore } from '../store/authStore';

export function RegisterScreen({ navigation }: any) {
  const { theme } = useTheme();
  const register = useAuthStore((s) => s.register);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!name || !email || !password) return Alert.alert('Please fill in all fields');
    if (password.length < 6) return Alert.alert('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(email.trim().toLowerCase(), name.trim(), password);
    } catch (e: any) {
      Alert.alert('Could not sign up', e?.response?.data?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>Create account</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            Begin your shared space.
          </Text>
        </View>

        <View>
          <Input label="Your name" value={name} onChangeText={setName} placeholder="Alex" />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@email.com"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="At least 6 characters"
          />
          <Button title="Create account" onPress={onRegister} loading={loading} style={{ marginTop: spacing.sm }} />

          <Pressable onPress={() => navigation.goBack()} style={styles.link}>
            <Text style={{ color: theme.textMuted }}>
              Already have an account? <Text style={{ color: theme.primary, fontWeight: '600' }}>Sign in</Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  logo: { fontSize: 30, fontWeight: '700', color: '#C97B6B' },
  subtitle: { fontSize: font.body, marginTop: spacing.sm },
  link: { alignItems: 'center', marginTop: spacing.xl },
});
