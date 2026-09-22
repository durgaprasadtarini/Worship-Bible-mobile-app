import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import TeluguAlphabetScreen from '../screens/TeluguAlphabetScreen';
import SongListScreen from '../screens/SongListScreen';
import SongDetailScreen from '../screens/SongDetailScreen';
import BibleScreen from '../screens/BibleScreen';
import ComingSoonScreen from '../screens/ComingSoonScreen';
import NotesScreen from '../screens/NotesScreen';

const Stack = createNativeStackNavigator();

// All Home-tab detail screens live in one stack so the bottom tab bar stays
// visible while the user drills into a card.
export default function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="TeluguAlphabet" component={TeluguAlphabetScreen} />
      <Stack.Screen name="SongList" component={SongListScreen} />
      <Stack.Screen name="SongDetail" component={SongDetailScreen} />
      <Stack.Screen name="Bible" component={BibleScreen} />
      <Stack.Screen name="ComingSoon" component={ComingSoonScreen} />
      <Stack.Screen name="Notes" component={NotesScreen} />
    </Stack.Navigator>
  );
}
