import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import ScreenHeader from '../components/ScreenHeader';
import { teluguAlphabet } from '../data/teluguAlphabet';
import { getLetterCounts, getTotalCount } from '../data/songs';

// Every left-hand home card opens this, browse-by-first-letter style.
// Letters with songs (from assets/inputs/<category>/*.docx, converted by
// scripts/generate-songs.js) show a count and open SongListScreen; letters
// with none yet show a quick "coming soon" message instead of navigating.
export default function TeluguAlphabetScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { title = 'తెలుగు అక్షరాలు', categoryKey } = route.params ?? {};
  const counts = getLetterCounts(categoryKey);
  const total = getTotalCount(categoryKey);

  const openLetter = (letter) => {
    const count = counts[letter] || 0;
    if (count === 0) {
      Alert.alert('పాటలు లేవు', 'ఈ అక్షరానికి పాటలు త్వరలో జోడించబడతాయి.');
      return;
    }
    navigation.navigate('SongList', { categoryKey, categoryTitle: title, letterKey: letter });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={title} onBack={() => navigation.goBack()} />
      <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
        <FlatList
          data={teluguAlphabet}
          keyExtractor={(item, idx) => `${item}-${idx}`}
          numColumns={4}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          ListHeaderComponent={
            <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>తెలుగు అక్షరాలు</Text>
              <View style={[styles.countBadge, { backgroundColor: colors.accentSoft }]}>
                <Text style={[styles.countText, { color: colors.accent }]}>{total}</Text>
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const count = counts[item] || 0;
            return (
              <Pressable
                onPress={() => openLetter(item)}
                style={[
                  styles.letterTile,
                  { backgroundColor: count > 0 ? colors.accentSoft : colors.surfaceAlt },
                ]}
              >
                <Text style={[styles.letterText, { color: count > 0 ? colors.accent : colors.primary }]}>
                  {item}
                </Text>
                {count > 0 ? (
                  <View style={[styles.miniBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.miniBadgeText}>{count}</Text>
                  </View>
                ) : null}
              </Pressable>
            );
          }}
        />
        <View style={[styles.footNote, { borderColor: colors.border }]}>
          <Text style={[styles.footNoteText, { color: colors.textSecondary }]}>
            {total > 0
              ? 'పాటలు గల అక్షరాలపై నొక్కండి · Tap a highlighted letter to see its songs'
              : 'పాటల జాబితా త్వరలో జోడించబడుతుంది · Songs coming soon'}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginTop: 16,
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  countText: {
    fontWeight: '700',
    fontSize: 13,
  },
  letterTile: {
    flex: 1,
    aspectRatio: 1.3,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: {
    fontSize: 20,
    fontWeight: '700',
  },
  miniBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  miniBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  footNote: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  footNoteText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
