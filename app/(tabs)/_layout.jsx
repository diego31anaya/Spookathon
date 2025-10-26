import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Fontisto from '@expo/vector-icons/Fontisto';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
        <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <Fontisto name="history" size={24} color='rgb(96,48,145)' />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="barcode-scan" size={24} color='rgb(96,48,145)' />,
        }}
      />
      <Tabs.Screen
        name="supplements"
        options={{
          title: 'Supplements',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="barcode-scan" size={24} color='rgb(96,48,145)' />,
        }}
      />
      
    </Tabs>
  );
}
