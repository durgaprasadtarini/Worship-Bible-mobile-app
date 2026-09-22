import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeStack from './HomeStack';
import ContactUsScreen from '../screens/ContactUsScreen';
import MeScreen from '../screens/MeScreen';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator();

const ICONS = {
  Home: 'home',
  ContactUs: 'call',
  Me: 'person',
};

const LABELS = {
  Home: 'Home',
  ContactUs: 'Contact Us',
  Me: 'Me',
};

export default function MainTabs() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.border,
        },
        tabBarLabel: LABELS[route.name],
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={`${ICONS[route.name]}${focused ? '' : '-outline'}`} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="ContactUs" component={ContactUsScreen} />
      <Tab.Screen name="Me" component={MeScreen} />
    </Tab.Navigator>
  );
}
