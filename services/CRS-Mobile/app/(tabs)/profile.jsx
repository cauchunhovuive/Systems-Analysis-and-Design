import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../services/AuthContext';
import { COLORS, SIZES } from '../../constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const getInitials = (name = '') =>
    name.split(' ').slice(-2).map(n => n[0]).join('').toUpperCase();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: async () => { await logout(); router.replace('/(auth)/login'); } }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
      </View>

      {/* Avatar + Name */}
      <View style={styles.profileBox}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(user?.fullName)}</Text>
        </View>
        <Text style={styles.name}>{user?.fullName}</Text>
        <View style={styles.roleBadge}><Text style={styles.roleText}>STUDENT</Text></View>
      </View>

      {/* Info card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thông tin tài khoản</Text>
        {[
          ['Email / Tài khoản', user?.email],
          ['Vai trò', user?.role],
          ['ID', `#${user?.id}`],
        ].map(([label, value]) => (
          <View key={label} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Hỗ trợ</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📧 Hỗ trợ kỹ thuật</Text>
          <Text style={[styles.infoValue, { color: COLORS.primary }]}>support@crs-system.edu</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.white, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.text },
  profileBox: { alignItems: 'center', padding: 32, backgroundColor: COLORS.white, marginBottom: 16 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: '700', color: COLORS.primary },
  name: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  roleBadge: { backgroundColor: COLORS.primary, borderRadius: 6, paddingHorizontal: 14, paddingVertical: 4 },
  roleText: { color: '#fff', fontWeight: '700', fontSize: SIZES.sm },
  card: { backgroundColor: COLORS.white, borderRadius: 12, marginHorizontal: 16, marginBottom: 16, padding: 16, borderWidth: 0.5, borderColor: COLORS.border },
  cardTitle: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  infoLabel: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  infoValue: { fontSize: SIZES.sm, fontWeight: '500', color: COLORS.text },
  logoutBtn: { marginHorizontal: 16, marginBottom: 40, backgroundColor: COLORS.dangerLight, borderRadius: 10, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: COLORS.danger },
  logoutText: { color: COLORS.danger, fontWeight: '700', fontSize: SIZES.md },
});
