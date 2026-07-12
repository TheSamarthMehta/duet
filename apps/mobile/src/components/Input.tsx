import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, font } from '../theme';

interface Props extends TextInputProps {
  label?: string;
}

export function Input({ label, style, ...props }: Props) {
  const { theme } = useTheme();
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <Text style={[styles.label, { color: theme.textMuted }]}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={theme.textMuted}
        style={[
          styles.input,
          { backgroundColor: theme.card, color: theme.text, borderColor: theme.border },
          style,
        ]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: font.small,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
    fontWeight: '500',
  },
  input: {
    height: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: font.body,
  },
});
