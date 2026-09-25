import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import HomeCard from '../components/HomeCard';
import WaveDecoration from '../components/WaveDecoration';
import DailyMessageOverlay from '../components/DailyMessageOverlay';
import { leftCards, rightCards } from '../data/homeCards';
import { paletteAt } from '../data/cardPalette';
import { dailyMessages } from '../data/dailyMessages';
import { shouldShowDailyMessage } from '../utils/appSession';

const LEFT_CARD_IDS = leftCards.map((c) => c.id);
const RIGHT_CARD_IDS = rightCards.map((c) => c.id);
const SHIMMER_INTERVAL_MS = 3000;

// Fisher-Yates-ish sample of n distinct items from arr.
function sampleIds(arr, n) {
  const pool = [...arr];
  const picked = [];
  while (picked.length < n && pool.length) {
    const i = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(i, 1)[0]);
  }
  return picked;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

function getFormattedDate() {
  const today = new Date();
  const weekday = today.toLocaleDateString('en-GB', { weekday: 'long' });
  const day = today.getDate();
  const month = today.toLocaleDateString('en-GB', { month: 'long' });
  return `${weekday}, ${day} ${month}`;
}

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();

  const greeting = useMemo(() => getGreeting(), []);
  const dateLabel = useMemo(() => getFormattedDate(), []);

  // 3 cards "shimmer" at a time, alternating 2-left+1-right / 1-left+2-right
  // each tick — a small living-app touch. `shimmerTick` increments every
  // tick so HomeCard's animation replays even if the same card is picked
  // again on the very next cycle.
  const [shimmerIds, setShimmerIds] = useState([]);
  const [shimmerTick, setShimmerTick] = useState(0);
  const leftHeavyRef = useRef(true);
  useEffect(() => {
    const tick = () => {
      const leftHeavy = leftHeavyRef.current;
      leftHeavyRef.current = !leftHeavy;
      const ids = leftHeavy
        ? [...sampleIds(LEFT_CARD_IDS, 2), ...sampleIds(RIGHT_CARD_IDS, 1)]
        : [...sampleIds(LEFT_CARD_IDS, 1), ...sampleIds(RIGHT_CARD_IDS, 2)];
      setShimmerIds(ids);
      setShimmerTick((t) => t + 1);
    };
    const interval = setInterval(tick, SHIMMER_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  // A random daily encouragement message, shown once per app open.
  const [dailyVisible, setDailyVisible] = useState(false);
  const dailyMessage = useMemo(
    () => dailyMessages[Math.floor(Math.random() * dailyMessages.length)],
    []
  );
  useEffect(() => {
    if (shouldShowDailyMessage()) setDailyVisible(true);
  }, []);

  const openCard = (card) => {
    switch (card.action) {
      case 'alphabet':
        navigation.navigate('TeluguAlphabet', { title: card.title, categoryKey: card.id });
        break;
      case 'bible':
        navigation.navigate('Bible');
        break;
      case 'notes':
        navigation.navigate('Notes');
        break;
      default:
        navigation.navigate('ComingSoon', { title: card.title });
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.surface }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View style={styles.identity}>
            <View style={[styles.avatar, { backgroundColor: colors.accentSoft }]}>
              <Ionicons name="book" size={20} color={colors.accent} />
            </View>
            <View>
              <Text style={[styles.welcomeSmall, { color: colors.textSecondary }]}>Welcome back!</Text>
              <Text style={[styles.welcomeName, { color: colors.textPrimary }]} numberOfLines={1}>
                {user?.username || 'Guest'}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => navigation.navigate('Notes')}
            style={[styles.bellBtn, { backgroundColor: colors.surfaceAlt }]}
          >
            <Ionicons name="notifications-outline" size={18} color={colors.textPrimary} />
          </Pressable>
        </View>

        <LinearGradient
          colors={[colors.accent, colors.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <WaveDecoration />
          <Text style={styles.heroEyebrow}>{greeting.toUpperCase()}</Text>
          <Text style={styles.heroDate}>{dateLabel}</Text>
          <Pressable style={styles.heroCta} onPress={() => navigation.navigate('Bible')}>
            <Ionicons name="book-outline" size={14} color="#FFFFFF" />
            <Text style={styles.heroCtaText}>నేటి వాక్యం చదవండి</Text>
            <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
          </Pressable>
        </LinearGradient>

        <View style={styles.gridSection}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionBar, { backgroundColor: colors.accent }]} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>పాటలు & మరిన్ని</Text>
          </View>

          <View style={styles.grid}>
            <View style={styles.column}>
              {leftCards.map((card, i) => {
                const p = paletteAt(i);
                return (
                  <HomeCard
                    key={card.id}
                    title={card.title}
                    subtitle={card.subtitle}
                    icon={card.icon}
                    iconBg={p.bg}
                    iconFg={p.fg}
                    onPress={() => openCard(card)}
                    shimmerToken={shimmerIds.includes(card.id) ? shimmerTick : null}
                  />
                );
              })}
            </View>
            <View style={styles.column}>
              {rightCards.map((card, i) => {
                const p = paletteAt(i + leftCards.length);
                return (
                  <HomeCard
                    key={card.id}
                    title={card.title}
                    subtitle={card.subtitle}
                    icon={card.icon}
                    iconBg={p.bg}
                    iconFg={p.fg}
                    onPress={() => openCard(card)}
                    shimmerToken={shimmerIds.includes(card.id) ? shimmerTick : null}
                  />
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      <DailyMessageOverlay
        visible={dailyVisible}
        message={dailyMessage}
        onClose={() => setDailyVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeSmall: {
    fontSize: 12,
    marginBottom: 1,
  },
  welcomeName: {
    fontSize: 16.5,
    fontWeight: '800',
    maxWidth: 190,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 78,
    overflow: 'hidden',
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  heroDate: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 18,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 7,
    backgroundColor: 'rgba(0,0,0,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
  },
  heroCtaText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  gridSection: {
    paddingHorizontal: 20,
    marginTop: 22,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionBar: {
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 15.5,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 12,
  },
});
