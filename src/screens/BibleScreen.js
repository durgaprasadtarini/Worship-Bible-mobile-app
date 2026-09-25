import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import BibleBookSelector from '../components/BibleBookSelector';
import { bibleBooks, getBookBySlug, getBookData } from '../data/bible';

const LAST_READ_KEY = '@worship_bible_last_read';
const DEFAULT_SLUG = 'genesis';

export default function BibleScreen({ navigation }) {
  const { colors } = useTheme();
  const [slug, setSlug] = useState(DEFAULT_SLUG);
  const [chapter, setChapter] = useState(1);
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [ready, setReady] = useState(false);

  // Resume where they left off, same idea as the app's other local prefs.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(LAST_READ_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          if (saved?.slug && getBookBySlug(saved.slug)) {
            setSlug(saved.slug);
            setChapter(saved.chapter || 1);
          }
        }
      } catch (e) {
        // ignore, defaults already set
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(LAST_READ_KEY, JSON.stringify({ slug, chapter })).catch(() => {});
  }, [ready, slug, chapter]);

  const book = getBookBySlug(slug);
  const bookIndex = bibleBooks.findIndex((b) => b.slug === slug);
  const bookData = useMemo(() => getBookData(slug), [slug]);
  const verses = useMemo(() => {
    const chapterData = bookData?.chapters.find((c) => c.chapter === String(chapter));
    return chapterData?.verses || [];
  }, [bookData, chapter]);

  const canGoPrev = bookIndex > 0 || chapter > 1;
  const canGoNext = bookIndex < bibleBooks.length - 1 || chapter < book.chapterCount;

  const goPrev = () => {
    if (chapter > 1) {
      setChapter(chapter - 1);
    } else if (bookIndex > 0) {
      const prevBook = bibleBooks[bookIndex - 1];
      setSlug(prevBook.slug);
      setChapter(prevBook.chapterCount);
    }
  };

  const goNext = () => {
    if (chapter < book.chapterCount) {
      setChapter(chapter + 1);
    } else if (bookIndex < bibleBooks.length - 1) {
      const nextBook = bibleBooks[bookIndex + 1];
      setSlug(nextBook.slug);
      setChapter(1);
    }
  };

  const handleSelectChapter = (newSlug, newChapter) => {
    setSlug(newSlug);
    setChapter(newChapter);
    setSelectorVisible(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.primary }}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.textOnPrimary} />
          </Pressable>
          <Pressable style={styles.headerTitleBtn} onPress={() => setSelectorVisible(true)}>
            <Text numberOfLines={1} style={[styles.headerTitle, { color: colors.textOnPrimary }]}>
              {book.telugu} {chapter}
            </Text>
            <Ionicons name="chevron-down" size={16} color={colors.textOnPrimary} />
          </Pressable>
          <View style={styles.headerBtn} />
        </View>
      </SafeAreaView>

      <FlatList
        key={`${slug}-${chapter}`}
        data={verses}
        keyExtractor={(item) => item.verse}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.verseRow}>
            <Text style={[styles.verseNum, { color: colors.accent }]}>{item.verse}</Text>
            <Text style={[styles.verseText, { color: colors.textPrimary }]}>{item.text}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            ఈ అధ్యాయం లభ్యం కాలేదు · Chapter not available.
          </Text>
        }
      />

      <SafeAreaView edges={['bottom']} style={styles.pillWrap} pointerEvents="box-none">
        <View style={[styles.pill, { backgroundColor: colors.primary, shadowColor: colors.cardShadow }]}>
          <Pressable onPress={goPrev} disabled={!canGoPrev} hitSlop={10}>
            <Ionicons
              name="chevron-back"
              size={20}
              color={canGoPrev ? colors.textOnPrimary : 'rgba(255,255,255,0.35)'}
            />
          </Pressable>
          <Pressable onPress={() => setSelectorVisible(true)} style={styles.pillLabelBtn}>
            <Text numberOfLines={1} style={[styles.pillLabel, { color: colors.textOnPrimary }]}>
              {book.telugu} {chapter}
            </Text>
          </Pressable>
          <Pressable onPress={goNext} disabled={!canGoNext} hitSlop={10}>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={canGoNext ? colors.textOnPrimary : 'rgba(255,255,255,0.35)'}
            />
          </Pressable>
        </View>
      </SafeAreaView>

      <BibleBookSelector
        visible={selectorVisible}
        initialSlug={slug}
        onClose={() => setSelectorVisible(false)}
        onSelectChapter={handleSelectChapter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    height: 52,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 16.5,
    fontWeight: '700',
    maxWidth: '85%',
  },
  listContent: {
    padding: 20,
    paddingBottom: 110,
  },
  verseRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  verseNum: {
    width: 24,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  verseText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 26,
  },
  empty: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 13,
  },
  pillWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    marginBottom: 10,
    elevation: 4,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  pillLabelBtn: {
    maxWidth: 200,
  },
  pillLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
});
