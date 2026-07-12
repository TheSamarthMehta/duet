import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, font } from '../theme';

interface Props {
  content: string;
  mine: boolean;
  time: string;
  seen?: boolean;
}

export function ChatBubble({ content, mine, time, seen }: Props) {
  const { theme } = useTheme();
  return (
    <View style={[styles.row, { justifyContent: mine ? 'flex-end' : 'flex-start' }]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: mine ? theme.bubbleMine : theme.bubbleTheirs,
            borderColor: theme.border,
            borderWidth: mine ? 0 : 1,
            borderBottomRightRadius: mine ? radius.sm : radius.lg,
            borderBottomLeftRadius: mine ? radius.lg : radius.sm,
          },
        ]}
      >
        <Text
          style={{
            color: mine ? theme.bubbleMineText : theme.bubbleTheirsText,
            fontSize: font.body,
            lineHeight: 22,
          }}
        >
          {content}
        </Text>
        <View style={styles.meta}>
          <Text
            style={{
              color: mine ? theme.bubbleMineText : theme.textMuted,
              fontSize: font.tiny,
              opacity: 0.7,
            }}
          >
            {time}
            {mine ? (seen ? '  ✓✓' : '  ✓') : ''}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: spacing.md, marginVertical: 3 },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.lg,
  },
  meta: { alignSelf: 'flex-end', marginTop: 2 },
});
