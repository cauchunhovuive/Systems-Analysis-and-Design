import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../services/AuthContext';
import { Redirect } from 'expo-router';

function TabIcon({ focused, label, icon }) {
  return (
    <View style={styles.tabItem}>
      <Text style={[styles.icon, focused && styles.iconActive]}>{icon}</Text>
      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const { user, loading } = useAuth();

  // Chờ auth load xong
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Chưa đăng nhập → về trang login
  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
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