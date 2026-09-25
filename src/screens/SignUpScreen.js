import React, { useRef, useState } from 'react';
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

export default function SignUpScreen({ navigation }) {
  const { colors } = useTheme();
  const { signUp } = useAuth();
  const scrollRef = useRef(null);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (!username.trim()) next.username = 'Please enter a username.';
    if (!EMAIL_REGEX.test(email.trim())) next.email = 'Please enter a valid email address.';
    if (password.length < 8) next.password = 'Password must be at least 8 characters.';
    if (!adminCode.trim()) next.adminCode = 'Ask an admin for the current signup code.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true);
    const result = await signUp({
      username: username.trim(),
      email: email.trim(),
      password,
      adminCode: adminCode.trim(),
    });
    setLoading(false);
    if (!result.success) {
      setErrors({ adminCode: result.message });
      return;
    }
    Alert.alert('Account created', 'Please sign in with your new details.', [
      { text: 'OK', onPress: () => navigation.replace('SignIn') },
    ]);
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.hero, { backgroundColor: colors.primary }]}>
            <Blobs colors={[colors.blobA, colors.blobB]} />
            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={12}>
              <Ionicons name="arrow-back" size={22} color={colors.textOnPrimary} />
            </Pressable>
            <Text style={[styles.title, { color: colors.textOnPrimary }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.textOnPrimary }]}>
              Join the worship community
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.cardShadow }]}>
            <FormField
              label="Username"
              icon="person-outline"
              value={username}
              onChangeText={setUsername}
              placeholder="Choose a username"
              autoCapitalize="words"
              error={errors.username}
            />
            <FormField
              label="Email"
              icon="mail-outline"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              error={errors.email}
            />
            <FormField
              label="Password"
              icon="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              placeholder="Minimum 8 characters"
              secureTextEntry
              error={errors.password}
            />
            <FormField
              label="Admin Code"
              icon="shield-checkmark-outline"
              value={adminCode}
              onChangeText={setAdminCode}
              placeholder="Get this from a church admin"
              keyboardType="number-pad"
              error={errors.adminCode}
            />

            <PrimaryButton
              title="Sign Up"
              onPress={handleSignUp}
              loading={loading}
              style={{ marginTop: 4 }}
            />
          </View>

          <View style={styles.footerRow}>
            <Text style={{ color: colors.textSecondary }}>Already have an account? </Text>
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
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14.5,
    opacity: 0.9,
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  link: {
    fontWeight: '700',
  },
});
