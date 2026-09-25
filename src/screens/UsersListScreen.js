import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, StyleSheet, Modal, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ScreenHeader from '../components/ScreenHeader';
import RoleBadge from '../components/RoleBadge';
import PrimaryButton from '../components/PrimaryButton';
import Blobs from '../components/Blobs';

export default function UsersListScreen({ navigation }) {
  const { colors } = useTheme();
  const { user, fetchAllUsers, changeUserRole } = useAuth();

  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  const load = useCallback(async () => {
    const result = await fetchAllUsers();
    if (result.success) {
      setUsers(result.users);
    } else {
      Alert.alert('Could not load users', result.message);
    }
  }, [fetchAllUsers]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return users;
    const q = query.trim().toLowerCase();
    return users.filter((u) => u.username?.toLowerCase().includes(q));
  }, [users, query]);

  const closeModal = () => setSelected(null);

  const confirmRoleChange = () => {
    if (!selected) return;
    const nextRole = selected.role === 'admin' ? 'normal' : 'admin';
    const isSelf = selected.id === user?.id;
    Alert.alert(
      'Change user type',
      `Change ${selected.username}'s account to ${nextRole === 'admin' ? 'Admin' : 'Normal'}?${
        isSelf ? '\n\nThis is your own account.' : ''
      }`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setUpdating(true);
            const result = await changeUserRole(selected.id, nextRole);
            setUpdating(false);
            if (!result.success) {
              Alert.alert('Could not update', result.message);
              return;
            }
            closeModal();
            load();
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Users" onBack={() => navigation.goBack()} />
      <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <Blobs colors={[colors.blobA, colors.blobB]} />
          <View style={[styles.heroIcon, { backgroundColor: colors.surface }]}>
            <Ionicons name="people" size={26} color={colors.primary} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.textOnPrimary }]}>All Users</Text>
          <View style={[styles.countChip, { backgroundColor: 'rgba(255,255,255,0.16)' }]}>
            <Text style={[styles.countChipText, { color: colors.textOnPrimary }]}>
              {users.length} {users.length === 1 ? 'account' : 'accounts'}
            </Text>
          </View>
        </View>

        <View style={[styles.searchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by username"
            placeholderTextColor={colors.placeholder}
            style={[styles.searchInput, { color: colors.textPrimary }]}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={
            !loading ? (
              <Text style={[styles.empty, { color: colors.textSecondary }]}>No users found.</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelected(item)}
              style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[styles.avatar, { backgroundColor: colors.accentSoft }]}>
                <Text style={[styles.avatarLetter, { color: colors.accent }]}>
                  {item.username?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.username, { color: colors.textPrimary }]} numberOfLines={1}>
                  {item.username}
                  {item.id === user?.id ? '  (You)' : ''}
                </Text>
                <RoleBadge role={item.role} size="sm" />
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        />
      </SafeAreaView>

      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            {selected ? (
              <>
                <View style={[styles.avatarLg, { backgroundColor: colors.accentSoft }]}>
                  <Text style={[styles.avatarLgLetter, { color: colors.accent }]}>
                    {selected.username?.[0]?.toUpperCase() || '?'}
                  </Text>
                </View>
                <Text style={[styles.modalUsername, { color: colors.textPrimary }]}>{selected.username}</Text>
                <View style={{ marginBottom: 20 }}>
                  <RoleBadge role={selected.role} />
                </View>

                <PrimaryButton
                  title={selected.role === 'admin' ? 'Change to Normal' : 'Change to Admin'}
                  onPress={confirmRoleChange}
                  loading={updating}
                  style={{ marginBottom: 12 }}
                />
                <PrimaryButton title="Cancel" variant="outline" onPress={closeModal} />
              </>
            ) : null}
          </View>
        </View>
      </Modal>
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
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  countChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
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
    padding: 14,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 17,
    fontWeight: '800',
  },
  username: {
    fontSize: 14.5,
    fontWeight: '700',
    marginBottom: 6,
  },
  empty: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  modalCard: {
    width: '100%',
    borderRadius: 24,
    padding: 26,
    alignItems: 'center',
  },
  avatarLg: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarLgLetter: {
    fontSize: 26,
    fontWeight: '800',
  },
  modalUsername: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
});
