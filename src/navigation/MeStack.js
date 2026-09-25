import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MeScreen from '../screens/MeScreen';
import UsersListScreen from '../screens/UsersListScreen';
import GenerateOtpScreen from '../screens/GenerateOtpScreen';

const Stack = createNativeStackNavigator();

// Mirrors HomeStack — keeps the bottom tab bar visible while an admin
// drills into Users / Signup Code from the Me tab.
export default function MeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MeMain" component={MeScreen} />
      <Stack.Screen name="UsersList" component={UsersListScreen} />
      <Stack.Screen name="GenerateOtp" component={GenerateOtpScreen} />
    </Stack.Navigator>
  );
}
