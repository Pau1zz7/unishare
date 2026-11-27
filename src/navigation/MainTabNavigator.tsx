import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../store/useAuthStore';
import HomeFeedScreen from '../screens/HomeFeedScreen';
import RouteMatchingScreen from '../screens/RouteMatchingScreen';
import ConversationListScreen from '../screens/ConversationListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminScreen from '../screens/AdminScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

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
          } else if (route.name === 'Admin') {
            iconName = 'shield';
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
        component={ConversationListScreen}
        options={{ tabBarLabel: 'Tin nhắn' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Hồ sơ' }}
      />
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminScreen}
          options={{ tabBarLabel: 'Quản trị' }}
        />
      )}
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
});