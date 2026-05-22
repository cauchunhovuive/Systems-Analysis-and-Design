import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../services/AuthContext';
import { COLORS, SIZES } from '../../constants/theme';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      await register(fullName, email, password);
      Alert.alert('Thành công', 'Tài khoản đã được tạo, vui lòng đăng nhập', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') }
      ]);
    } catch (err) {
      Alert.alert('Đăng ký thất bại', err.response?.data?.message || 'Có lỗi xảy ra');
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

        <View style={styles.card}>
          <Text style={styles.cardTitle}>CRS STUDENT PORTAL</Text>
          <Text style={styles.cardSub}>Tạo tài khoản sinh viên mới</Text>

          <Text style={styles.label}>HỌ VÀ TÊN SINH VIÊN</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Nhập họ và tên đầy đủ"
            placeholderTextColor={COLORS.textMuted}
          />

          <Text style={styles.label}>EMAIL / MSSV</Text>
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
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Nhập mật khẩu"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry
          />

          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>HOÀN TẤT ĐĂNG KÝ</Text>}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.loginLink}>Đăng nhập hệ thống</Text>
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
  btn: {
    backgroundColor: COLORS.primary, borderRadius: 8,
    paddingVertical: 14, alignItems: 'center', marginBottom: 16,
  },
  btnText: { color: '#fff', fontWeight: '700', fontSize: SIZES.sm, letterSpacing: 0.5 },
  loginRow: { flexDirection: 'row', justifyContent: 'center' },
  loginText: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  loginLink: { fontSize: SIZES.sm, color: COLORS.primary, fontWeight: '600' },
  support: { textAlign: 'center', color: COLORS.textMuted, fontSize: SIZES.xs, marginTop: 24 },
});
