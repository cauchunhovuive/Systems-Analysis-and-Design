import { Stack } from 'expo-router';
import { useAuth } from '../../services/AuthContext';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '../../constants/theme';

export default function AuthLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Đã đăng nhập rồi → không cho vào trang login nữa
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}