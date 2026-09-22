import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import ScreenHeader from '../components/ScreenHeader';
import { sampleBibleTe } from '../data/sampleBibleTe';

export default function BibleScreen({ navigation }) {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="బైబిల్ · Bible" onBack={() => navigation.goBack()} />
      <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.noteBanner, { backgroundColor: colors.accentSoft }]}>
            <Text style={[styles.noteText, { color: colors.textPrimary }]}>{sampleBibleTe.note}</Text>
            <Text style={[styles.noteTextEn, { color: colors.textSecondary }]}>{sampleBibleTe.noteEn}</Text>
          </View>

          {sampleBibleTe.books.map((book) => (
            <View
              key={`${book.book}-${book.chapter}`}
              style={[styles.bookCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={[styles.bookTitle, { color: colors.primary }]}>
                {book.book} {book.chapter} · {book.bookEn} {book.chapter}
              </Text>
              {book.verses.map((v) => (
                <View key={v.num} style={styles.verseRow}>
                  <Text style={[styles.verseNum, { color: colors.accent }]}>{v.num}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.verseTe, { color: colors.textPrimary }]}>{v.te}</Text>
                    <Text style={[styles.verseEn, { color: colors.textSecondary }]}>{v.en}</Text>
                  </View>
                </View>
              ))}
            </View>
          ))}
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
  noteBanner: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
  },
  noteText: {
    fontSize: 13.5,
    fontWeight: '600',
    marginBottom: 2,
  },
  noteTextEn: {
    fontSize: 12,
  },
  bookCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  bookTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    marginBottom: 12,
  },
  verseRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  verseNum: {
    width: 22,
    fontWeight: '700',
    fontSize: 13,
  },
  verseTe: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  verseEn: {
    fontSize: 12.5,
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
