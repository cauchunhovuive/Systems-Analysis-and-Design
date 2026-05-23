import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { router } from 'expo-router';
import { useAuth } from '../../services/AuthContext';
import api from '../../services/api';
import { COLORS, SIZES } from '../../constants/theme';

// ── Vòng tròn tiến độ dùng SVG ──────────────────────────────────────────────
const ProgressRing = ({ earned, total, size = 130, strokeWidth = 10, color }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? Math.min(earned / total, 1) : 0;
  const strokeDashoffset = circumference * (1 - pct);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* track */}
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="#E8EDF2" strokeWidth={strokeWidth} fill="none"
        />
        {/* progress arc — starts from top (rotate -90°) */}
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {/* label bên trong */}
      <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.text }}>
        {earned}/{total}
      </Text>
      <Text style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 2 }}>Tín chỉ</Text>
    </View>
  );
};

// ── Mini bar cho Bắt buộc / Tự chọn ────────────────────────────────────────
const MiniBar = ({ label, earned, total, color }) => {
  const pct = total > 0 ? Math.min(earned / total, 1) : 0;
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: SIZES.xs, color: COLORS.textSecondary }}>{label}</Text>
        <Text style={{ fontSize: SIZES.xs, fontWeight: '600', color }}>
          {earned}/{total}
        </Text>
      </View>
      <View style={{ height: 6, backgroundColor: '#E8EDF2', borderRadius: 3 }}>
        <View style={{
          height: 6, borderRadius: 3,
          backgroundColor: color,
          width: `${Math.round(pct * 100)}%`,
        }} />
      </View>
    </View>
  );
};

// ── Quick action ─────────────────────────────────────────────────────────────
const QuickAction = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.quickAction} onPress={onPress}>
    <Text style={styles.quickIcon}>{icon}</Text>
    <Text style={styles.quickLabel}>{label}</Text>
  </TouchableOpacity>
);

// ── Dashboard ────────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const { user } = useAuth();
  const [enrollments, setEnrollments]     = useState([]);
  const [totalCredits, setTotalCredits]   = useState(0);
  const [requiredCredits, setRequiredCredits] = useState(0);
  const [electiveCredits, setElectiveCredits] = useState(0);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const TOTAL_REQUIRED = 120;
  const TOTAL_ELECTIVE = 42;
  const TOTAL_ALL      = TOTAL_REQUIRED + TOTAL_ELECTIVE; // 162

  const fetchData = async () => {
    try {
      const res  = await api.get('/enrollments');
      const list = res.data || [];
      setEnrollments(list);

      const total = list.reduce((s, it) => s + (it.credit || 0), 0);
      const req   = list.reduce((s, it) => {
        const isReq = it.course_type?.trim() === 'Bắt buộc';
        return s + (isReq ? (it.credit || 0) : 0);
      }, 0);
      const elec  = list.reduce((s, it) => {
        const isElec = it.course_type?.trim() !== 'Bắt buộc';
        return s + (isElec ? (it.credit || 0) : 0);
      }, 0);

      setRequiredCredits(req);
      setElectiveCredits(elec);
      setTotalCredits(total);
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

  // Màu vòng tròn: xanh khi > 50%, cam khi 20-50%, đỏ khi < 20%
  const pct = totalCredits / TOTAL_ALL;
  const ringColor = pct >= 0.5 ? COLORS.primary : pct >= 0.2 ? COLORS.warning : COLORS.danger;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchData(); }}
          colors={[COLORS.primary]}
        />
      }
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}><Text style={styles.logoText}>CRS</Text></View>
          <Text style={styles.portalName}>CRS PORTAL</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
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
          <QuickAction icon="📆" label="Lịch học theo tuần"  onPress={() => router.push('/(tabs)/timetable')} />
          <QuickAction icon="📚" label="Đăng ký học phần"    onPress={() => router.push('/(tabs)/courses')} />
          <QuickAction icon="✅" label="Kết quả đăng ký"     onPress={() => router.push('/(tabs)/courses')} />
          <QuickAction icon="💰" label="Tra cứu học phí" onPress={() => router.push('/(tabs)/tuition')} />
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
              <View style={styles.codeTag}>
                <Text style={styles.codeText}>{item.course_code}</Text>
              </View>
              <Text style={styles.courseName}>{item.course_name}</Text>
              <Text style={styles.courseInfo}>👨‍🏫 {item.lecturer_name?.trim()}</Text>
              <Text style={styles.courseInfo}>🕐 {item.start_time?.slice(0,5)} – {item.end_time?.slice(0,5)} ({item.day_of_week})</Text>
              <Text style={styles.courseInfo}>📊 {item.credit} tín chỉ</Text>
            </View>
          ))
        )}

        {/* ── Tiến độ học tập ── */}
        <View style={styles.progressCard}>
          <Text style={styles.sectionTitle}>Tiến độ học tập</Text>

          {/* % label */}
          <Text style={[styles.pctLabel, { color: ringColor }]}>
            {TOTAL_ALL > 0 ? Math.round((totalCredits / TOTAL_ALL) * 100) : 0}% hoàn thành
          </Text>

          {/* SVG ring */}
          <ProgressRing
            earned={totalCredits}
            total={TOTAL_ALL}
            size={140}
            strokeWidth={12}
            color={ringColor}
          />

          {/* Mini bars */}
          <View style={styles.miniBars}>
            <MiniBar
              label="Bắt buộc"
              earned={requiredCredits}
              total={TOTAL_REQUIRED}
              color={COLORS.primary}
            />
            <View style={{ width: 16 }} />
            <MiniBar
              label="Tự chọn"
              earned={electiveCredits}
              total={TOTAL_ELECTIVE}
              color={COLORS.warning}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: COLORS.background },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
    backgroundColor: COLORS.white, borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  logoRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoBox:    { width: 32, height: 32, borderRadius: 7, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  logoText:   { color: '#fff', fontWeight: '700', fontSize: 12 },
  portalName: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.primary },
  avatar:     { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  content:    { padding: 16, gap: 16 },
  card:       { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, borderWidth: 0.5, borderColor: COLORS.border },
  profileRow: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  avatarLarge:     { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center' },
  avatarLargeText: { fontSize: 20, fontWeight: '700', color: COLORS.primary },
  profileName:  { fontSize: SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  roleBadge:    { backgroundColor: COLORS.primary, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 4 },
  roleText:     { color: '#fff', fontSize: SIZES.xs, fontWeight: '700' },
  profileEmail: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  statsRow: { flexDirection: 'row', gap: 12 },
  statBox:  { flex: 1, borderWidth: 1, borderRadius: 8, padding: 12 },
  statLabel:{ fontSize: 10, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 4 },
  statNum:  { fontSize: SIZES.xxl, fontWeight: '700' },

  quickGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickAction: { width: '47%', backgroundColor: COLORS.white, borderRadius: 10, padding: 16, alignItems: 'center', gap: 8, borderWidth: 0.5, borderColor: COLORS.border },
  quickIcon:   { fontSize: 26 },
  quickLabel:  { fontSize: SIZES.xs, color: COLORS.textSecondary, textAlign: 'center', fontWeight: '500' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle:  { fontSize: SIZES.md, fontWeight: '700', color: COLORS.text },
  semesterTag:   { fontSize: SIZES.xs, color: COLORS.textSecondary, backgroundColor: COLORS.background, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },

  emptyBox:     { backgroundColor: COLORS.white, borderRadius: 12, padding: 32, alignItems: 'center', borderWidth: 0.5, borderColor: COLORS.border },
  emptyIcon:    { fontSize: 36, marginBottom: 8 },
  emptyText:    { fontSize: SIZES.sm, color: COLORS.textSecondary, marginBottom: 16, textAlign: 'center' },
  enrollBtn:    { backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 24, paddingVertical: 10 },
  enrollBtnText:{ color: '#fff', fontWeight: '600', fontSize: SIZES.sm },

  enrollCard: { backgroundColor: COLORS.white, borderRadius: 10, padding: 14, borderWidth: 0.5, borderColor: COLORS.border, gap: 4 },
  codeTag:    { backgroundColor: COLORS.primaryLight, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 2 },
  codeText:   { fontSize: SIZES.xs, color: COLORS.primary, fontWeight: '700' },
  courseName: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.text },
  courseInfo: { fontSize: SIZES.sm, color: COLORS.textSecondary },

  // Progress card
  progressCard: {
    backgroundColor: COLORS.white, borderRadius: 12, padding: 16,
    borderWidth: 0.5, borderColor: COLORS.border,
    alignItems: 'center', gap: 12, marginBottom: 16,
  },
  pctLabel: { fontSize: SIZES.sm, fontWeight: '600' },
  miniBars: { flexDirection: 'row', width: '100%', paddingHorizontal: 4 },
});