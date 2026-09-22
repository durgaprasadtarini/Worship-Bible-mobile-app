import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ScreenHeader from '../components/ScreenHeader';
import AlbumArt from '../components/AlbumArt';
import Blobs from '../components/Blobs';
import { getSongsForLetter } from '../data/songs';

export default function SongListScreen({ navigation, route }) {
  const { colors } = useTheme();
  const { categoryKey, categoryTitle, letterKey } = route.params ?? {};
  const [query, setQuery] = useState('');

  const songs = useMemo(() => getSongsForLetter(categoryKey, letterKey), [categoryKey, letterKey]);
  const filtered = useMemo(() => {
    if (!query.trim()) return songs;
    const q = query.trim().toLowerCase();
    return songs.filter((s) => s.title.toLowerCase().includes(q));
  }, [songs, query]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title={`${letterKey} · ${categoryTitle}`} onBack={() => navigation.goBack()} />
      <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <Blobs colors={[colors.blobA, colors.blobB]} />
          <View style={[styles.heroIcon, { backgroundColor: colors.surface }]}>
            <Text style={[styles.heroIconLetter, { color: colors.primary }]}>{letterKey}</Text>
          </View>
          <Text style={[styles.heroTitle, { color: colors.textOnPrimary }]} numberOfLines={2}>
            {categoryTitle}
          </Text>
          <View style={[styles.countChip, { backgroundColor: 'rgba(255,255,255,0.16)' }]}>
            <Ionicons name="musical-notes" size={14} color={colors.textOnPrimary} />
            <Text style={[styles.countChipText, { color: colors.textOnPrimary }]}>{songs.length} songs</Text>
          </View>
        </View>

        <View style={[styles.searchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search in this list"
            placeholderTextColor={colors.placeholder}
            style={[styles.searchInput, { color: colors.textPrimary }]}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => navigation.navigate('SongDetail', { song: item, categoryTitle })}
              style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <AlbumArt index={index} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text numberOfLines={1} style={[styles.rowTitle, { color: colors.textPrimary }]}>
                  {item.title}
                </Text>
                <Text numberOfLines={1} style={[styles.rowSubtitle, { color: colors.textSecondary }]}>
                  {categoryTitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.textSecondary }]}>No songs match your search.</Text>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 26,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroIconLetter: {
    fontSize: 26,
    fontWeight: '800',
  },
  heroTitle: {
    fontSize: 19,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  countChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  countChipText: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  listContent: {
    padding: 20,
    paddingTop: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
  },
  rowTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 3,
  },
  rowSubtitle: {
    fontSize: 12,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 13,
  },
});
