import React from 'react';
import { View, Text, StyleSheet, Switch, Pressable, Alert, Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Blobs from '../components/Blobs';
import RoleBadge from '../components/RoleBadge';

const WHATSAPP_COMMUNITY_LINK = 'https://chat.whatsapp.com/FPrjRW6vfJK8Leuu0LlJts';

export default function MeScreen({ navigation }) {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const isAdmin = user?.role === 'admin';

  const confirmLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const joinWhatsApp = () => {
    Linking.openURL(WHATSAPP_COMMUNITY_LINK).catch(() =>
      Alert.alert('Unable to open link', 'Please make sure WhatsApp is installed.')
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <Blobs colors={[colors.blobA, colors.blobB]} />
          <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
            <Ionicons name="person" size={34} color={colors.primary} />
          </View>
          <Text style={[styles.username, { color: colors.textOnPrimary }]}>{user?.username || 'Guest'}</Text>
          <Text style={[styles.email, { color: colors.textOnPrimary }]}>{user?.email}</Text>
          {user ? (
            <View style={{ marginTop: 10 }}>
              <RoleBadge role={user.role} />
            </View>
          ) : null}
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <View style={[styles.settingIcon, { backgroundColor: colors.accentSoft }]}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={18} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
              <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                Switch between light and dark appearance
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor={colors.surface}
            />
          </View>
        </View>

        {isAdmin ? (
          <>
            <View style={styles.sectionLabelRow}>
              <View style={[styles.sectionLabelBar, { backgroundColor: colors.accent }]} />
              <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Admin</Text>
            </View>

            <Pressable
              onPress={() => navigation.navigate('UsersList')}
              style={[styles.section, styles.settingRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[styles.settingIcon, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name="people-outline" size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Users</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  View everyone and change their account type
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate('GenerateOtp')}
              style={[styles.section, styles.settingRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[styles.settingIcon, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Generate Signup Code</Text>
                <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
                  Create the code new users need to sign up
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </Pressable>
          </>
        ) : null}

        <Pressable
          onPress={joinWhatsApp}
          style={[styles.section, styles.settingRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={[styles.settingIcon, { backgroundColor: '#DCF8C6' }]}>
            <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Join WhatsApp Community</Text>
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
              వార్తలు, ప్రకటనల కోసం మా గ్రూప్‌లో చేరండి
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          onPress={confirmLogout}
          style={[styles.logoutBtn, { backgroundColor: colors.surface, borderColor: colors.danger }]}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    borderRadius: 24,
    paddingVertical: 32,
    marginBottom: 22,
    overflow: 'hidden',
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  username: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    opacity: 0.9,
  },
  section: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: -4,
  },
  sectionLabelBar: {
    width: 4,
    height: 15,
    borderRadius: 2,
    marginRight: 8,
  },
  sectionLabel: {
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 11.5,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 14,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
