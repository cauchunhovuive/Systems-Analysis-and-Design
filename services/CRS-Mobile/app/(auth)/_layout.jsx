import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

function TabIcon({ focused, label, icon }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.icon, focused && styles.iconActive]}>{icon}</Text>
      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Bảng điều khiển" icon="🏠" />,
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Học phần" icon="📚" />,
        }}
      />
      <Tabs.Screen
        name="timetable"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Thời khóa biểu" icon="📅" />,
        }}
      />
      <Tabs.Screen
        name="tuition"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Học phí" icon="💰" />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} label="Hồ sơ" icon="👤" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: { alignItems: 'center', gap: 2 },
  icon: { fontSize: 22, opacity: 0.4 },
  iconActive: { opacity: 1 },
  label: { fontSize: 10, color: COLORS.textMuted },
  labelActive: { color: COLORS.primary, fontWeight: '600' },
});