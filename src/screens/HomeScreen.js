import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import HomeCard from '../components/HomeCard';
import Blobs from '../components/Blobs';
import DailyMessageOverlay from '../components/DailyMessageOverlay';
import { leftCards, rightCards } from '../data/homeCards';
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
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <Blobs colors={[colors.blobA, colors.blobB, colors.blobC]} />
          <View style={styles.heroTopRow}>
            <View style={[styles.badge, { backgroundColor: colors.surface }]}>
              <Ionicons name="book" size={20} color={colors.primary} />
            </View>
          </View>
          <Text style={[styles.greeting, { color: colors.textOnPrimary }]}>
            {greeting}{user?.username ? `, ${user.username}` : ''}
          </Text>
          <View style={[styles.dateChip, { backgroundColor: 'rgba(255,255,255,0.14)' }]}>
            <Text style={[styles.dateText, { color: colors.textOnPrimary }]}>{dateLabel}</Text>
          </View>
        </View>

        <View style={styles.gridSection}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionBar, { backgroundColor: colors.accent }]} />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>పాటలు & మరిన్ని</Text>
          </View>

          <View style={styles.grid}>
            <View style={styles.column}>
              {leftCards.map((card) => (
                <HomeCard
                  key={card.id}
                  title={card.title}
                  subtitle={card.subtitle}
                  icon={card.icon}
                  onPress={() => openCard(card)}
                  shimmerToken={shimmerIds.includes(card.id) ? shimmerTick : null}
                />
              ))}
            </View>
            <View style={styles.column}>
              {rightCards.map((card) => (
                <HomeCard
                  key={card.id}
                  title={card.title}
                  subtitle={card.subtitle}
                  icon={card.icon}
                  onPress={() => openCard(card)}
                  shimmerToken={shimmerIds.includes(card.id) ? shimmerTick : null}
                />
              ))}
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
  hero: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 14,
  },
  dateChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
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
