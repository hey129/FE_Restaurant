import { COLORS } from '@/constants/app';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: '#999',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/25/25694.png' }}
              style={{ width: 24, height: 24, tintColor: color }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => (
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png' }}
              style={{ width: 24, height: 24, tintColor: color }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png' }}
              style={{ width: 24, height: 24, tintColor: color }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null, 
        }}
      />
    </Tabs>
  );
}
