import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform, Image
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../services/AuthContext';
import { COLORS, SIZES } from '../../constants/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('Đăng nhập thất bại', err.response?.data?.message || 'Sai tài khoản hoặc mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>CRS</Text>
          </View>
          <View>
            <Text style={styles.appName}>COURSE REGISTRATION</Text>
            <Text style={styles.appSub}>MANAGEMENT SYSTEM</Text>
          </View>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CRS STUDENT PORTAL</Text>
          <Text style={styles.cardSub}>Vui lòng đăng nhập để tiếp tục</Text>

          <Text style={styles.label}>TÀI KHOẢN / MSSV</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Nhập email hoặc MSSV"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>MẬT KHẨU</Text>
          <View style={styles.passwordBox}>
            <TextInput
              style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Nhập mật khẩu"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>ĐĂNG NHẬP HỆ THỐNG</Text>}
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.support}>Hỗ trợ kỹ thuật: support@crs-system.edu</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 32 },
  logoBox: {
    width: 48, height: 48, borderRadius: 10,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
  },
  logoText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  appName: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.primary },
  appSub: { fontSize: SIZES.xs, color: COLORS.textSecondary, letterSpacing: 1 },
  card: {
    backgroundColor: COLORS.card, borderRadius: 12,
    padding: 24, borderWidth: 0.5, borderColor: COLORS.border,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardTitle: { fontSize: SIZES.lg, fontWeight: '700', textAlign: 'center', color: COLORS.text, marginBottom: 4 },
  cardSub: { fontSize: SIZES.sm, textAlign: 'center', color: COLORS.textSecondary, marginBottom: 24 },
  label: { fontSize: SIZES.xs, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6, letterSpacing: 0.5 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: SIZES.md,
    color: COLORS.text, backgroundColor: '#fff', marginBottom: 16,
  },
  passwordBox: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 8,
    backgroundColor: '#fff', marginBottom: 20,
  },
  eyeBtn: { padding: 12 },
  eyeText: { fontSize: 16 },
  loginBtn: {
    backgroundColor: COLORS.primary, borderRadius: 8,
    paddingVertical: 14, alignItems: 'center', marginBottom: 16,
  },
  loginBtnText: { color: '#fff', fontWeight: '700', fontSize: SIZES.sm, letterSpacing: 0.5 },
  registerRow: { flexDirection: 'row', justifyContent: 'center' },
  registerText: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  registerLink: { fontSize: SIZES.sm, color: COLORS.primary, fontWeight: '600' },
  support: { textAlign: 'center', color: COLORS.textMuted, fontSize: SIZES.xs, marginTop: 24 },
});
