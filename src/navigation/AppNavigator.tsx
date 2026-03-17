import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../utils/theme';

import DashboardScreen from '../screens/DashboardScreen';
import AssessmentHubScreen from '../screens/AssessmentScreen';
import TherapyHubScreen from '../screens/TherapyScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ExportReportScreen from '../screens/ExportReportScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import MedicalHistoryScreen from '../screens/profile/MedicalHistoryScreen';
import VocalHygieneSettingsScreen from '../screens/profile/VocalHygieneSettingsScreen';
import AboutScreen from '../screens/profile/AboutScreen';

// Assessment sub-screens
import MPTScreen from '../screens/assessment/MPTScreen';
import SZRatioScreen from '../screens/assessment/SZRatioScreen';
import GRBASScreen from '../screens/assessment/GRBASScreen';
import VHIScreen from '../screens/assessment/VHIScreen';
import VFIScreen from '../screens/assessment/VFIScreen';
import AcousticScreen from '../screens/assessment/AcousticScreen';
import ReportScreen from '../screens/assessment/ReportScreen';
import AssessmentFlowScreen from '../screens/assessment/AssessmentFlowScreen';

// Therapy sub-screens
import ExercisePlayerScreen from '../screens/therapy/ExercisePlayerScreen';
import WorkoutCompleteScreen from '../screens/therapy/WorkoutCompleteScreen';

const Tab = createBottomTabNavigator();
const AssessmentStack = createNativeStackNavigator();
const TherapyStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// ─── Assessment Stack Navigator ─────────────────────────────────
function AssessmentNavigator() {
  return (
    <AssessmentStack.Navigator
      screenOptions={{ headerShown: false }}
    >
      <AssessmentStack.Screen name="AssessmentHub" component={AssessmentHubScreen} />
      <AssessmentStack.Screen name="AssessmentFlow" component={AssessmentFlowScreen} />
      <AssessmentStack.Screen name="MPT" component={MPTScreen} />
      <AssessmentStack.Screen name="SZRatio" component={SZRatioScreen} />
      <AssessmentStack.Screen name="GRBAS" component={GRBASScreen} />
      <AssessmentStack.Screen name="VHI" component={VHIScreen} />
      <AssessmentStack.Screen name="VFI" component={VFIScreen} />
      <AssessmentStack.Screen name="Acoustic" component={AcousticScreen} />
      <AssessmentStack.Screen name="Report" component={ReportScreen} />
    </AssessmentStack.Navigator>
  );
}

// ─── Therapy Stack Navigator ────────────────────────────────────
function TherapyNavigator() {
  return (
    <TherapyStack.Navigator
      screenOptions={{ headerShown: false }}
    >
      <TherapyStack.Screen name="TherapyHub" component={TherapyHubScreen} />
      <TherapyStack.Screen
        name="ExercisePlayer"
        component={ExercisePlayerScreen}
      />
      <TherapyStack.Screen
        name="WorkoutComplete"
        component={WorkoutCompleteScreen}
      />
    </TherapyStack.Navigator>
  );
}

// ─── Profile Stack Navigator ────────────────────────────────────
function ProfileNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{ headerShown: false }}
    >
      <ProfileStack.Screen name="ProfileHub" component={ProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="MedicalHistory" component={MedicalHistoryScreen} />
      <ProfileStack.Screen name="History" component={HistoryScreen} />
      <ProfileStack.Screen name="VocalHygieneSettings" component={VocalHygieneSettingsScreen} />
      <ProfileStack.Screen name="ExportReport" component={ExportReportScreen} />
      <ProfileStack.Screen name="About" component={AboutScreen} />
    </ProfileStack.Navigator>
  );
}

// ─── Tab Icon ───────────────────────────────────────────────────
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '⌂',
    Assessment: '🎤',
    Therapy: '♥',
    Profile: '⚙',
  };

  return (
    <View style={styles.iconContainer}>
      <Text style={[
        styles.iconText,
        { color: focused ? colors.primary : colors.lightText },
      ]}>
        {icons[name] || '•'}
      </Text>
      {focused && <View style={styles.activeDot} />}
    </View>
  );
}

// ─── Main Tab Navigator ─────────────────────────────────────────
export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <TabIcon name={route.name} focused={focused} />
        ),
        tabBarLabel: ({ focused }) => (
          <Text style={[
            styles.tabLabel,
            { color: focused ? colors.primary : colors.lightText },
            focused && styles.tabLabelActive,
          ]}>
            {route.name}
          </Text>
        ),
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabItem,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Assessment" component={AssessmentNavigator} />
      <Tab.Screen name="Therapy" component={TherapyNavigator} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 0.5,
    borderTopColor: colors.lightGray,
    height: Platform.OS === 'ios' ? 90 : 72,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    elevation: 8,
    shadowOpacity: 0.1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 4,
  },
  tabItem: {
    gap: 2,
    paddingVertical: 4,
    minHeight: 48,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    width: 48,
  },
  iconText: {
    fontSize: 22,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 2,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 0,
  },
  tabLabelActive: {
    fontWeight: '600',
  },
});
