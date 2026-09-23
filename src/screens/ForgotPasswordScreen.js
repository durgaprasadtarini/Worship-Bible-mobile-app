import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import FormField from '../components/FormField';
import PrimaryButton from '../components/PrimaryButton';
import Blobs from '../components/Blobs';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Two steps on one screen: verify the email is a real local account, then
// reveal the new-password fields. There's no backend to send a reset link
// from, so "verification" just means checking AsyncStorage for that email.
export default function ForgotPasswordScreen({ navigation }) {
  const { colors } = useTheme();
  const { checkEmailExists, resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleVerifyEmail = async () => {
    const trimmedEmail = email.trim();
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setErrors({ email: 'Please enter a valid email address.' });
      return;
    }
    setErrors({});
    setLoading(true);
    const exists = await checkEmailExists(trimmedEmail);
    setLoading(false);
    if (!exists) {
      setErrors({ email: 'No account found with this email. Please sign up instead.' });
      return;
    }
    setEmailVerified(true);
  };

  const handleResetPassword = async () => {
    const next = {};
    if (newPassword.length < 8) next.newPassword = 'Password must be at least 8 characters.';
    if (confirmPassword !== newPassword) next.confirmPassword = 'Passwords do not match.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    const result = await resetPassword(email.trim(), newPassword);
    setLoading(false);
    if (!result.success) {
      setErrors({ email: result.message });
      setEmailVerified(false);
      return;
    }
    Alert.alert('Password updated', 'Please sign in with your new password.', [
      { text: 'OK', onPress: () => navigation.replace('SignIn') },
    ]);
  };

  const changeEmail = () => {
    setEmailVerified(false);
    setNewPassword('');
    setConfirmPassword('');
    setErrors({});
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={[styles.hero, { backgroundColor: colors.primary }]}>
            <Blobs colors={[colors.blobA, colors.blobB]} />
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
              <Ionicons name="arrow-back" size={22} color={colors.textOnPrimary} />
            </Pressable>
            <View style={[styles.logoCircle, { backgroundColor: colors.surface }]}>
              <Ionicons name="key" size={36} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.textOnPrimary }]}>Reset Password</Text>
            <Text style={[styles.subtitle, { color: colors.textOnPrimary }]}>
              {emailVerified
                ? 'Choose a new password for your account'
                : 'Enter your email to verify your account'}
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
              error={errors.email}
            />

            {!emailVerified ? (
              <PrimaryButton
                title="Verify Email"
                onPress={handleVerifyEmail}
                loading={loading}
                style={{ marginTop: 4 }}
              />
            ) : (
              <>
                <View style={[styles.verifiedBanner, { backgroundColor: colors.accentSoft }]}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
                  <Text style={[styles.verifiedText, { color: colors.textPrimary }]}>
                    Email verified — you can change it below
                  </Text>
                  <Pressable onPress={changeEmail} hitSlop={8}>
                    <Text style={[styles.changeLink, { color: colors.accent }]}>Change</Text>
                  </Pressable>
                </View>

                <FormField
                  label="New Password"
                  icon="lock-closed-outline"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Minimum 8 characters"
                  secureTextEntry
                  error={errors.newPassword}
                />
                <FormField
                  label="Confirm New Password"
                  icon="lock-closed-outline"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter new password"
                  secureTextEntry
                  error={errors.confirmPassword}
                />

                <PrimaryButton
                  title="Reset Password"
                  onPress={handleResetPassword}
                  loading={loading}
                  style={{ marginTop: 4 }}
                />
              </>
            )}
          </View>

          <View style={styles.footerRow}>
            <Text style={{ color: colors.textSecondary }}>Remembered it after all? </Text>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={[styles.link, { color: colors.accent }]}>Sign In</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  hero: {
    paddingTop: 64,
    paddingBottom: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  backBtn: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.9,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  card: {
    marginHorizontal: 20,
    marginTop: -28,
    borderRadius: 24,
    padding: 24,
    elevation: 4,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 18,
  },
  verifiedText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  changeLink: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  link: {
    fontWeight: '700',
  },
});
