import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ImageBackground, Linking, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import ScreenHeader from '../components/ScreenHeader';

// We don't have a real recording per song yet, so every song links out to
// the same sample Telugu worship video for now — clearly a placeholder,
// swap in a real per-song link/embed later.
const SAMPLE_YOUTUBE_ID = '0-fWHF5ipuI';
const SAMPLE_YOUTUBE_URL = `https://www.youtube.com/watch?v=${SAMPLE_YOUTUBE_ID}`;
const SAMPLE_THUMBNAIL = `https://img.youtube.com/vi/${SAMPLE_YOUTUBE_ID}/hqdefault.jpg`;

export default function SongDetailScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { song, categoryTitle } = route.params ?? {};

  const onShare = () => {
    Share.share({ message: `${song.title}\n\n${song.lyrics}` }).catch(() => {});
  };

  const onWatch = () => {
    Linking.openURL(SAMPLE_YOUTUBE_URL).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={categoryTitle} onBack={() => navigation.goBack()} />
      <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable onPress={onWatch}>
            <LinearGradient colors={[colors.primaryDark, colors.primary]} style={styles.videoCard}>
              <ImageBackground
                source={{ uri: SAMPLE_THUMBNAIL }}
                style={styles.videoBg}
                imageStyle={{ opacity: 0.55 }}
              >
                <View style={styles.videoOverlay}>
                  <View style={styles.playCircle}>
                    <Ionicons name="play" size={26} color="#fff" />
                  </View>
                  <View style={[styles.watchPill, { backgroundColor: colors.surface }]}>
                    <Ionicons name="logo-youtube" size={16} color="#D42F2F" />
                    <Text style={[styles.watchPillText, { color: colors.textPrimary }]}>Watch on YouTube</Text>
                  </View>
                </View>
              </ImageBackground>
            </LinearGradient>
          </Pressable>
          <Text style={[styles.videoNote, { color: colors.textSecondary }]}>
            నమూనా వీడియో మాత్రమే — ఈ పాట కోసం ప్రత్యేక వీడియో త్వరలో జోడించబడుతుంది.
          </Text>

          <View style={[styles.titleCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.titleIcon, { backgroundColor: colors.accentSoft }]}>
              <Ionicons name="musical-notes" size={20} color={colors.accent} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.titleText, { color: colors.textPrimary }]}>{song.title}</Text>
              <Text style={[styles.titleSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                {categoryTitle}
              </Text>
            </View>
            <Pressable onPress={onShare} hitSlop={10}>
              <Ionicons name="share-social-outline" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.lyricsHeaderRow}>
            <Text style={[styles.lyricsHeading, { color: colors.textPrimary }]}>LYRICS</Text>
            <View style={[styles.langBadge, { backgroundColor: colors.accentSoft }]}>
              <Text style={[styles.langBadgeText, { color: colors.accent }]}>తెలుగు</Text>
            </View>
          </View>

          <View style={[styles.lyricsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.lyricsText, { color: colors.textPrimary }]}>{song.lyrics}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  videoCard: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 190,
  },
  videoBg: {
    flex: 1,
  },
  videoOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  playCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
  },
  watchPillText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  videoNote: {
    fontSize: 11.5,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  titleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 22,
  },
  titleIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 3,
  },
  titleSubtitle: {
    fontSize: 12,
  },
  lyricsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  lyricsHeading: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  langBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  langBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  lyricsCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  lyricsText: {
    fontSize: 16,
    lineHeight: 28,
  },
});
