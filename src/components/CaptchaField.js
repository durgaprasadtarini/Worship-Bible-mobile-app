import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

// Characters chosen to avoid easily-confused glyphs (0/O, 1/I/l).
const CAPTCHA_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXY3456789';

function generateCode(length = 5) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CAPTCHA_CHARS[Math.floor(Math.random() * CAPTCHA_CHARS.length)];
  }
  return code;
}

// A simple client-side captcha (there's no backend to verify one server
// side). Good enough to deter trivial bot form-fills on a local-only app.
const CaptchaField = forwardRef(function CaptchaField({ onValidityChange, error, onFocus }, ref) {
  const { colors } = useTheme();
  const [code, setCode] = useState(() => generateCode());
  const [input, setInput] = useState('');

  useEffect(() => {
    onValidityChange?.(input.trim().toUpperCase() === code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, code]);

  const refresh = () => {
    setCode(generateCode());
    setInput('');
  };

  useImperativeHandle(ref, () => ({ refresh }));

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: colors.textPrimary }]}>Verification code</Text>
      <View style={styles.row}>
        <View style={[styles.codeBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          {code.split('').map((char, idx) => (
            <Text
              key={`${char}-${idx}`}
              style={[
                styles.codeChar,
                {
                  color: colors.primary,
                  transform: [{ rotate: `${idx % 2 === 0 ? '-' : ''}${4 + idx * 2}deg` }],
                },
              ]}
            >
              {char}
            </Text>
          ))}
        </View>
        <Pressable onPress={refresh} hitSlop={10} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>
      <TextInput
        value={input}
        onChangeText={setInput}
        onFocus={onFocus}
        placeholder="Type the code above"
        placeholderTextColor={colors.placeholder}
        autoCapitalize="characters"
        style={[
          styles.input,
          {
            backgroundColor: colors.inputBackground,
            color: colors.textPrimary,
            borderColor: error ? colors.danger : 'transparent',
          },
        ]}
      />
      {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
    </View>
  );
});

export default CaptchaField;

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  codeBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 10,
  },
  codeChar: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
  },
  refreshBtn: {
    marginLeft: 12,
    padding: 8,
  },
  input: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  error: {
    marginTop: 6,
    fontSize: 12.5,
  },
});
