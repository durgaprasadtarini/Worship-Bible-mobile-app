import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStack from './HomeStack';
import ContactUsScreen from '../screens/ContactUsScreen';
import MeStack from './MeStack';
import AppTabBar from '../components/AppTabBar';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <AppTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="ContactUs" component={ContactUsScreen} />
      <Tab.Screen name="Me" component={MeStack} />
    </Tab.Navigator>
  );
}
