import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Placeholder screens
const DashboardScreen = () => null;
const InvestorsScreen = () => null;
const StartupsScreen = () => null;
const PipelineScreen = () => null;
const ProfileScreen = () => null;

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: '#3b82f6',
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: 'Dashboard',
            tabBarLabel: 'Home',
          }}
        />
        <Tab.Screen
          name="Investors"
          component={InvestorsScreen}
          options={{
            title: 'Investors',
            tabBarLabel: 'Investors',
          }}
        />
        <Tab.Screen
          name="Pipeline"
          component={PipelineScreen}
          options={{
            title: 'Pipeline',
            tabBarLabel: 'Pipeline',
          }}
        />
        <Tab.Screen
          name="Startups"
          component={StartupsScreen}
          options={{
            title: 'Startups',
            tabBarLabel: 'Startups',
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'Profile',
            tabBarLabel: 'Profile',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
