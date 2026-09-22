import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import Blobs from '../components/Blobs';

export default function SignInScreen({ navigation }) {
  const { colors } = useTheme();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setFormError('');
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setFormError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    const result = await signIn(trimmedEmail, password);
    setLoading(false);
    if (!result.success) {
      setFormError(result.message);
    }
    // On success, AuthContext flips `isAuthenticated` and RootNavigator
    // automatically swaps to the main app — nothing else to do here.
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={[styles.hero, { backgroundColor: colors.primary }]}>
            <Blobs colors={[colors.blobA, colors.blobB]} />
            <View style={[styles.logoCircle, { backgroundColor: colors.surface }]}>
              <Ionicons name="book" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.textOnPrimary }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.textOnPrimary }]}>
              Sign in to continue your worship journey
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
            <FormField
              label="Email"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
            />
            <FormField
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
            />

            {formError ? <Text style={[styles.formError, { color: colors.danger }]}>{formError}</Text> : null}

            <PrimaryButton title="Sign In" onPress={handleSignIn} loading={loading} style={{ marginTop: 4 }} />

            <Text style={[styles.hint, { color: colors.textSecondary }]}>
              Forgot your details? Just sign up again with the same email to reset them.
            </Text>
          </View>

          <View style={styles.footerRow}>
            <Text style={{ color: colors.textSecondary }}>Don't have an account? </Text>
            <Pressable onPress={() => navigation.navigate('SignUp')}>
              <Text style={[styles.link, { color: colors.accent }]}>Sign Up</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  hero: {
    paddingTop: 72,
    paddingBottom: 56,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14.5,
    opacity: 0.9,
    textAlign: 'center',
  },
  card: {
    marginHorizontal: 20,
    marginTop: -34,
    borderRadius: 24,
    padding: 24,
    elevation: 4,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  formError: {
    marginBottom: 14,
    fontSize: 13.5,
    textAlign: 'center',
  },
  hint: {
    marginTop: 16,
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
    marginBottom: 20,
  },
  link: {
    fontWeight: '700',
  },
});
