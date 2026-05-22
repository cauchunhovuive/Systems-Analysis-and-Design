import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../services/AuthContext';
import api from '../../services/api';
import { COLORS, SIZES } from '../../constants/theme';

const QuickAction = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress}>
    <Text style={styles.quickIcon}>{icon}</Text>
    <Text style={styles.quickLabel}>{label}</Text>
  </TouchableOpacity>
);

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get('/enrollments');
      setEnrollments(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getInitials = (name = '') =>
    name.split(' ').slice(-2).map(n => n[0]).join('').toUpperCase();

  const currentSemester = 'HK2 (2025-2026)';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[COLORS.primary]} />}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}><Text style={styles.logoText}>CRS</Text></View>
          <Text style={styles.portalName}>CRS PORTAL</Text>
        </View>
        <TouchableOpacity style={styles.avatarBtn} onPress={() => router.push('/(tabs)/profile')}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.fullName)}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Profile card */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>{getInitials(user?.fullName)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{user?.fullName}</Text>
              <View style={styles.roleBadge}><Text style={styles.roleText}>STUDENT</Text></View>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statBox, { borderColor: COLORS.warning }]}>
              <Text style={styles.statLabel}>NHẮC NHỞ MỚI</Text>
              <Text style={[styles.statNum, { color: COLORS.warning }]}>0</Text>
            </View>
            <View style={[styles.statBox, { borderColor: COLORS.primary }]}>
              <Text style={styles.statLabel}>LỚP HỌC PHẦN (HK NÀY)</Text>
              <Text style={[styles.statNum, { color: COLORS.primary }]}>{enrollments.length}</Text>
            </View>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.quickGrid}>
          <QuickAction icon="📆" label="Lịch học theo tuần" onPress={() => router.push('/(tabs)/timetable')} />
          <QuickAction icon="📚" label="Đăng ký học phần" onPress={() => router.push('/(tabs)/courses')} />
          <QuickAction icon="✅" label="Kết quả đăng ký" onPress={() => router.push('/(tabs)/courses')} />
          <QuickAction icon="💰" label="Tra cứu học phí" onPress={() => {}} />
        </View>

        {/* Current enrollments */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Lớp học phần đang học</Text>
          <Text style={styles.semesterTag}>{currentSemester}</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : enrollments.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyText}>Bạn chưa có dữ liệu lớp học phần nào</Text>
            <TouchableOpacity style={styles.enrollBtn} onPress={() => router.push('/(tabs)/courses')}>
              <Text style={styles.enrollBtnText}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        ) : (
          enrollments.map((item) => (
            <View key={item.id} style={styles.enrollCard}>
              <View style={styles.codeTag}><Text style={styles.codeText}>{item.course_code}</Text></View>
              <Text style={styles.courseName}>{item.course_name}</Text>
              <Text style={styles.courseInfo}>👨‍🏫 {item.lecturer_name?.trim()}</Text>
              <Text style={styles.courseInfo}>🕐 {item.start_time?.slice(0,5)} – {item.end_time?.slice(0,5)} ({item.day_of_week})</Text>
              <Text style={styles.courseInfo}>📊 {item.credit} tín chỉ</Text>
            </View>
          ))
        )}

        {/* Progress */}
        <View style={styles.progressCard}>
          <Text style={styles.sectionTitle}>Tiến độ học tập</Text>
          <View style={styles.progressCircle}>
            <Text style={styles.progressNum}>0/162</Text>
            <Text style={styles.progressSub}>Tín chỉ</Text>
          </View>
          <View style={styles.progressDetail}>
            <Text style={styles.progressDetailText}>Bắt buộc: 0 / 120</Text>
            <Text style={styles.progressDetailText}>Tự chọn: 0 / 42</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
    backgroundColor: COLORS.white, borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBox: { width: 32, height: 32, borderRadius: 7, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  logoText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  portalName: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.primary },
  avatarBtn: {},
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  content: { padding: 16, gap: 16 },
  card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, borderWidth: 0.5, borderColor: COLORS.border },
  profileRow: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  avatarLarge: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  avatarLargeText: { fontSize: 20, fontWeight: '700', color: COLORS.primary },
  profileName: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  roleBadge: { backgroundColor: COLORS.primary, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 4 },
  roleText: { color: '#fff', fontSize: SIZES.xs, fontWeight: '700' },
  profileEmail: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 12 },
  statLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 4 },
  statNum: { fontSize: SIZES.xxl, fontWeight: '700' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickAction: {
    width: '47%', backgroundColor: COLORS.white, borderRadius: 10,
    padding: 16, alignItems: 'center', gap: 8,
    borderWidth: 0.5, borderColor: COLORS.border,
  },
  quickIcon: { fontSize: 26 },
  quickLabel: { fontSize: SIZES.xs, color: COLORS.textSecondary, textAlign: 'center', fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.text },
  semesterTag: { fontSize: SIZES.xs, color: COLORS.textSecondary, backgroundColor: COLORS.background, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  emptyBox: { backgroundColor: COLORS.white, borderRadius: 12, padding: 32, alignItems: 'center', borderWidth: 0.5, borderColor: COLORS.border },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginBottom: 16, textAlign: 'center' },
  enrollBtn: { backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 },
  enrollBtnText: { color: '#fff', fontWeight: '600', fontSize: SIZES.sm },
  enrollCard: { backgroundColor: COLORS.white, borderRadius: 10, padding: 14, borderWidth: 0.5, borderColor: COLORS.border, gap: 4 },
  codeTag: { backgroundColor: COLORS.primaryLight, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 2 },
  codeText: { fontSize: SIZES.xs, color: COLORS.primary, fontWeight: '700' },
  courseName: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.text },
  courseInfo: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  progressCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, borderWidth: 0.5, borderColor: COLORS.border, alignItems: 'center', marginBottom: 16 },
  progressCircle: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', margin: 16 },
  progressNum: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.text },
  progressSub: { fontSize: SIZES.xs, color: COLORS.textSecondary },
  progressDetail: { flexDirection: 'row', gap: 24 },
  progressDetailText: { fontSize: SIZES.sm, color: COLORS.textSecondary },
});
