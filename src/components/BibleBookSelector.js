import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { bibleBooks } from '../data/bible';

// Bottom-sheet modal: left column browses books by testament, right column
// shows a chapter-number grid for whichever book is highlighted on the
// left. Tapping a chapter commits the selection and closes the sheet —
// browsing the left list alone doesn't change what's being read yet.
export default function BibleBookSelector({ visible, initialSlug, onClose, onSelectChapter }) {
  const { colors } = useTheme();
  const [browsingSlug, setBrowsingSlug] = useState(initialSlug);
  const [query, setQuery] = useState('');

  const browsingBook = useMemo(
    () => bibleBooks.find((b) => b.slug === browsingSlug) || bibleBooks[0],
    [browsingSlug]
  );

  const filteredBooks = useMemo(() => {
    if (!query.trim()) return bibleBooks;
    const q = query.trim().toLowerCase();
    return bibleBooks.filter(
      (b) => b.telugu.toLowerCase().includes(q) || b.english.toLowerCase().includes(q)
    );
  }, [query]);

  const oldTestament = filteredBooks.filter((b) => b.testament === 'old');
  const newTestament = filteredBooks.filter((b) => b.testament === 'new');

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onShow={() => {
        setBrowsingSlug(initialSlug);
        setQuery('');
      }}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <SafeAreaView edges={['bottom']} style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Ionicons name="book-outline" size={18} color={colors.primary} />
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Select Book &amp; Chapter</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={[styles.searchRow, { backgroundColor: colors.inputBackground }]}>
            <Ionicons name="search-outline" size={16} color={colors.textSecondary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search books"
              placeholderTextColor={colors.placeholder}
              style={[styles.searchInput, { color: colors.textPrimary }]}
            />
          </View>

          <View style={styles.body}>
            <ScrollView
              style={[styles.bookList, { backgroundColor: colors.background, borderRightColor: colors.border }]}
              showsVerticalScrollIndicator={false}
            >
              {oldTestament.length > 0 && (
                <Text style={[styles.testamentLabel, { color: colors.textSecondary }]}>Old Testament</Text>
              )}
              {oldTestament.map((b) => (
                <BookRow key={b.slug} book={b} active={b.slug === browsingSlug} onPress={setBrowsingSlug} />
              ))}
              {newTestament.length > 0 && (
                <Text style={[styles.testamentLabel, { color: colors.textSecondary }]}>New Testament</Text>
              )}
              {newTestament.map((b) => (
                <BookRow key={b.slug} book={b} active={b.slug === browsingSlug} onPress={setBrowsingSlug} />
              ))}
              {filteredBooks.length === 0 && (
                <Text style={[styles.noResults, { color: colors.textSecondary }]}>No books match.</Text>
              )}
            </ScrollView>

            <ScrollView style={styles.chapterPane} showsVerticalScrollIndicator={false}>
              <Text style={[styles.chapterHeading, { color: colors.textPrimary }]} numberOfLines={1}>
                {browsingBook.telugu}
              </Text>
              <Text style={[styles.chapterSubheading, { color: colors.textSecondary }]}>
                {browsingBook.english} · {browsingBook.chapterCount} chapters
              </Text>
              <View style={styles.chapterGrid}>
                {Array.from({ length: browsingBook.chapterCount }, (_, i) => i + 1).map((chapterNum) => (
                  <Pressable
                    key={chapterNum}
                    onPress={() => onSelectChapter(browsingBook.slug, chapterNum)}
                    style={[styles.chapterCell, { backgroundColor: colors.accentSoft }]}
                  >
                    <Text style={[styles.chapterCellText, { color: colors.accent }]}>{chapterNum}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function BookRow({ book, active, onPress }) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => onPress(book.slug)}
      style={[styles.bookRow, active && { backgroundColor: colors.accentSoft }]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.bookRowText,
          { color: active ? colors.accent : colors.textPrimary },
          active && styles.bookRowTextActive,
        ]}
      >
        {book.telugu}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: '700',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    height: '100%',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  bookList: {
    width: '38%',
    borderRightWidth: 1,
    paddingVertical: 8,
  },
  testamentLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 6,
  },
  bookRow: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 10,
    marginHorizontal: 6,
  },
  bookRowText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  bookRowTextActive: {
    fontWeight: '800',
  },
  noResults: {
    padding: 20,
    fontSize: 12.5,
    textAlign: 'center',
  },
  chapterPane: {
    flex: 1,
    padding: 16,
  },
  chapterHeading: {
    fontSize: 16,
    fontWeight: '800',
  },
  chapterSubheading: {
    fontSize: 12,
    marginTop: 2,
    marginBottom: 16,
  },
  chapterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chapterCell: {
    width: 48,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chapterCellText: {
    fontSize: 14.5,
    fontWeight: '700',
  },
});
