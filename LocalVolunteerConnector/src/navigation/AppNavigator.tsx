// Main navigation configuration
// Created by Samsudeen Ashad

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { RootState } from '../store';
import { Colors, Typography } from '../utils/theme';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import WelcomeScreen from '../screens/auth/WelcomeScreen';

// Main Screens
import HomeScreen from '../screens/main/HomeScreen';
import EventsScreen from '../screens/main/EventsScreen';
import ChatScreen from '../screens/main/ChatScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import MapScreen from '../screens/main/MapScreen';

// Detail Screens
import EventDetailsScreen from '../screens/details/EventDetailsScreen';
import ChatRoomScreen from '../screens/details/ChatRoomScreen';
import CreateEventScreen from '../screens/details/CreateEventScreen';
import EditProfileScreen from '../screens/details/EditProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: Colors.primary,
      },
      headerTintColor: Colors.white,
      headerTitleStyle: {
        ...Typography.h3,
        fontWeight: '600',
      },
    }}>
    <Stack.Screen 
      name="Welcome" 
      component={WelcomeScreen} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="Login" 
      component={LoginScreen}
      options={{ title: 'Sign In' }}
    />
    <Stack.Screen 
      name="Register" 
      component={RegisterScreen}
      options={{ title: 'Create Account' }}
    />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: string;

        switch (route.name) {
          case 'Home':
            iconName = 'home';
            break;
          case 'Events':
            iconName = 'event';
            break;
          case 'Map':
            iconName = 'map';
            break;
          case 'Chat':
            iconName = 'chat';
            break;
          case 'Profile':
            iconName = 'person';
            break;
          default:
            iconName = 'home';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textSecondary,      tabBarStyle: {
        backgroundColor: Colors.white,
        borderTopColor: Colors.border,
        paddingVertical: 5,
        height: 60,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: Typography.weights.medium,
        marginBottom: 5,
      },
      headerStyle: {
        backgroundColor: Colors.primary,
      },
      headerTintColor: Colors.white,
      headerTitleStyle: {
        fontSize: 18,
        fontWeight: Typography.weights.bold,
      },
    })}>
    <Tab.Screen 
      name="Home" 
      component={HomeScreen}
      options={{ title: 'Volunteer Connect' }}
    />
    <Tab.Screen 
      name="Events" 
      component={EventsScreen}
      options={{ title: 'Find Events' }}
    />
    <Tab.Screen 
      name="Map" 
      component={MapScreen}
      options={{ title: 'Event Map' }}
    />
    <Tab.Screen 
      name="Chat" 
      component={ChatScreen}
      options={{ title: 'Messages' }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ title: 'My Profile' }}
    />
  </Tab.Navigator>
);

const MainStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: Colors.primary,
      },
      headerTintColor: Colors.white,
      headerTitleStyle: {
        fontSize: 18,
        fontWeight: Typography.weights.bold,
      },
    }}>
    <Stack.Screen 
      name="MainTabs" 
      component={MainTabs} 
      options={{ headerShown: false }}
    />
    <Stack.Screen 
      name="EventDetails" 
      component={EventDetailsScreen}
      options={{ title: 'Event Details' }}
    />
    <Stack.Screen 
      name="ChatRoom" 
      component={ChatRoomScreen}
      options={{ title: 'Chat' }}
    />
    <Stack.Screen 
      name="CreateEvent" 
      component={CreateEventScreen}
      options={{ title: 'Create Event' }}
    />    <Stack.Screen 
      name="EditProfile" 
      component={EditProfileScreen}
      options={{ title: 'Edit Profile' }}
    />
  </Stack.Navigator>
);

const AppNavigator: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
