import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import HomeFeedScreen from '../screens/HomeFeedScreen';
import RouteMatchingScreen from '../screens/RouteMatchingScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

function ChatPlaceholderScreen() {
  return (
    <View style={styles.placeholderContainer}>
      <Feather name="message-circle" size={44} color="#2563EB" />
      <Text style={styles.placeholderTitle}>Tin nhắn Realtime</Text>
      <Text style={styles.placeholderSub}>Sẽ được kích hoạt ở Module 3</Text>
    </View>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Feather.glyphMap = 'home';

          if (route.name === 'HomeFeed') {
            iconName = 'home';
          } else if (route.name === 'RouteMatching') {
            iconName = 'map';
          } else if (route.name === 'ChatList') {
            iconName = 'message-square';
          } else if (route.name === 'Profile') {
            iconName = 'user';
          }

          return <Feather name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="HomeFeed"
        component={HomeFeedScreen}
        options={{ tabBarLabel: 'Bảng tin' }}
      />
      <Tab.Screen
        name="RouteMatching"
        component={RouteMatchingScreen}
        options={{ tabBarLabel: 'Tiện đường' }}
      />
      <Tab.Screen
        name="ChatList"
        component={ChatPlaceholderScreen}
        options={{ tabBarLabel: 'Tin nhắn' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Hồ sơ' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 62,
    paddingBottom: 8,
    paddingTop: 6,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 12,
  },
  placeholderSub: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
});