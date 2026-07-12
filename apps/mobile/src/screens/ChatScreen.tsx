import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Socket } from 'socket.io-client';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../theme/ThemeContext';
import { spacing, font, radius } from '../theme';
import { ChatBubble } from '../components/ChatBubble';
import { Avatar } from '../components/Avatar';
import { useAuthStore } from '../store/authStore';
import { chatApi, couplesApi, callApi, Message } from '../api';
import { connectSocket } from '../lib/socket';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ChatScreen() {
  const { theme } = useTheme();
  const me = useAuthStore((s) => s.user);
  const { data: coupleData } = useQuery({ queryKey: ['couple'], queryFn: couplesApi.me });
  const partner = coupleData?.couple?.partner;

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;

    chatApi.history(50).then((h) => {
      if (mounted) setMessages(h);
    });

    connectSocket().then((socket) => {
      if (!mounted) return;
      socketRef.current = socket;

      socket.on('connect', () => socket.emit('ping:presence'));
      socket.emit('ping:presence');
      socket.emit('messageSeen');

      socket.on('receiveMessage', (msg: Message) => {
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
        if (msg.senderId !== me?.id) socket.emit('messageSeen');
      });
      socket.on('typing', () => setPartnerTyping(true));
      socket.on('stopTyping', () => setPartnerTyping(false));
      socket.on('online', () => setPartnerOnline(true));
      socket.on('offline', () => setPartnerOnline(false));
      socket.on('messageSeen', () => {
        setMessages((prev) =>
          prev.map((m) => (m.senderId === me?.id && !m.seenAt ? { ...m, seenAt: new Date().toISOString() } : m))
        );
      });
    });

    return () => {
      mounted = false;
      const s = socketRef.current;
      s?.off('receiveMessage');
      s?.off('typing');
      s?.off('stopTyping');
      s?.off('online');
      s?.off('offline');
      s?.off('messageSeen');
    };
  }, [me?.id]);

  const send = useCallback(() => {
    const content = text.trim();
    if (!content) return;
    socketRef.current?.emit('sendMessage', { content });
    socketRef.current?.emit('stopTyping');
    setText('');
  }, [text]);

  const onChangeText = (value: string) => {
    setText(value);
    socketRef.current?.emit('typing');
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socketRef.current?.emit('stopTyping'), 1500);
  };

  const startCall = async () => {
    try {
      const { url } = await callApi.room();
      socketRef.current?.emit('call:start', { room: url });
      Linking.openURL(url);
    } catch {
      Alert.alert('Could not start call');
    }
  };

  const lastSeenMine = [...messages].reverse().find((m) => m.senderId === me?.id && m.seenAt);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Avatar name={partner?.name || '?'} size={40} />
        <View style={{ flex: 1, marginLeft: spacing.sm }}>
          <Text style={{ color: theme.text, fontWeight: '700', fontSize: font.body }}>
            {partner?.name}
          </Text>
          <Text style={{ color: partnerOnline ? '#5BAE7E' : theme.textMuted, fontSize: font.tiny }}>
            {partnerTyping ? 'typing…' : partnerOnline ? 'online' : 'offline'}
          </Text>
        </View>
        <Pressable onPress={startCall} style={[styles.callBtn, { backgroundColor: theme.primarySoft }]}>
          <Text style={{ fontSize: 20 }}>📹</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ paddingVertical: spacing.md }}
          renderItem={({ item }) => (
            <ChatBubble
              content={item.content}
              mine={item.senderId === me?.id}
              time={formatTime(item.createdAt)}
              seen={!!item.seenAt && item.id === lastSeenMine?.id}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={{ fontSize: 40 }}>💌</Text>
              <Text style={{ color: theme.textMuted, marginTop: spacing.md, textAlign: 'center' }}>
                Say something sweet to start.
              </Text>
            </View>
          }
        />

        {partnerTyping ? (
          <Text style={[styles.typing, { color: theme.textMuted }]}>{partner?.name} is typing…</Text>
        ) : null}

        <View style={[styles.inputBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <TextInput
            value={text}
            onChangeText={onChangeText}
            placeholder="Message…"
            placeholderTextColor={theme.textMuted}
            style={[styles.input, { color: theme.text, backgroundColor: theme.bg }]}
            multiline
            onSubmitEditing={send}
          />
          <Pressable onPress={send} style={[styles.sendBtn, { backgroundColor: theme.primary }]}>
            <Text style={{ color: theme.onPrimary, fontSize: 18, fontWeight: '700' }}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  callBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: spacing.xl },
  typing: { marginLeft: spacing.lg, marginBottom: 4, fontSize: font.tiny, fontStyle: 'italic' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    borderTopWidth: 1,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingTop: 12,
    fontSize: font.body,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
