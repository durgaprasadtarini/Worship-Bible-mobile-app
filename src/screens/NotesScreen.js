import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ScreenHeader from '../components/ScreenHeader';
import PrimaryButton from '../components/PrimaryButton';
import Watermark from '../components/Watermark';

function notesKeyFor(email) {
  return `@worship_notes_${email || 'guest'}`;
}

export default function NotesScreen({ navigation }) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const storageKey = notesKeyFor(user?.email);

  const [notes, setNotes] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [titleInput, setTitleInput] = useState('');
  const [bodyInput, setBodyInput] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        setNotes(raw ? JSON.parse(raw) : []);
      } catch (e) {
        setNotes([]);
      }
    })();
  }, [storageKey]);

  const persist = useCallback(
    async (next) => {
      setNotes(next);
      try {
        await AsyncStorage.setItem(storageKey, JSON.stringify(next));
      } catch (e) {
        // Ignore write errors — the in-memory list still reflects the change.
      }
    },
    [storageKey]
  );

  const openNewNote = () => {
    setEditingId(null);
    setTitleInput('');
    setBodyInput('');
    setModalVisible(true);
  };

  const openExistingNote = (note) => {
    setEditingId(note.id);
    setTitleInput(note.title);
    setBodyInput(note.body);
    setModalVisible(true);
  };

  const saveNote = async () => {
    if (!titleInput.trim() && !bodyInput.trim()) {
      setModalVisible(false);
      return;
    }
    const now = new Date().toISOString();
    if (editingId) {
      const next = notes.map((n) =>
        n.id === editingId ? { ...n, title: titleInput.trim() || 'Untitled', body: bodyInput.trim(), updatedAt: now } : n
      );
      await persist(next);
    } else {
      const newNote = {
        id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
        title: titleInput.trim() || 'Untitled',
        body: bodyInput.trim(),
        updatedAt: now,
      };
      await persist([newNote, ...notes]);
    }
    setModalVisible(false);
  };

  const deleteNote = (id) => {
    Alert.alert('Delete note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => persist(notes.filter((n) => n.id !== id)),
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Watermark />
      <ScreenHeader title="My Notes" onBack={() => navigation.goBack()} />
      <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={40} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No notes yet. Tap + to add your first one.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => openExistingNote(item)}
              onLongPress={() => deleteNote(item.id)}
              style={[styles.noteCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.noteTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                  {item.title}
                </Text>
                {item.body ? (
                  <Text style={[styles.noteBody, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.body}
                  </Text>
                ) : null}
                <Text style={[styles.noteDate, { color: colors.textSecondary }]}>
                  {new Date(item.updatedAt).toLocaleString()}
                </Text>
              </View>
              <Pressable onPress={() => deleteNote(item.id)} hitSlop={10}>
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </Pressable>
            </Pressable>
          )}
        />

        <Pressable
          onPress={openNewNote}
          style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.cardShadow }]}
        >
          <Ionicons name="add" size={26} color={colors.textOnPrimary} />
        </Pressable>
      </SafeAreaView>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalHeading, { color: colors.textPrimary }]}>
              {editingId ? 'Edit note' : 'New note'}
            </Text>
            <TextInput
              value={titleInput}
              onChangeText={setTitleInput}
              placeholder="Title"
              placeholderTextColor={colors.placeholder}
              style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.textPrimary }]}
            />
            <TextInput
              value={bodyInput}
              onChangeText={setBodyInput}
              placeholder="Write your note..."
              placeholderTextColor={colors.placeholder}
              multiline
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor: colors.inputBackground, color: colors.textPrimary },
              ]}
            />
            <View style={styles.modalActions}>
              <PrimaryButton
                title="Cancel"
                variant="outline"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1, marginRight: 10 }}
              />
              <PrimaryButton title="Save" onPress={saveNote} style={{ flex: 1 }} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 20,
    paddingBottom: 100,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 13.5,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  noteTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  noteBody: {
    fontSize: 13,
    marginBottom: 8,
    lineHeight: 18,
  },
  noteDate: {
    fontSize: 11,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    paddingBottom: 32,
  },
  modalHeading: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 16,
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14.5,
    marginBottom: 14,
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 4,
  },
});
