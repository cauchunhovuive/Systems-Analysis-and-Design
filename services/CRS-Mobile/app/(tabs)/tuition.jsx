import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  ActivityIndicator, TouchableOpacity, RefreshControl
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { router } from 'expo-router';
import api from '../../services/api';
import { COLORS, SIZES } from '../../constants/theme';

const PRICE_PER_CREDIT = 800_000;

const fmt = (n) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

// Vòng tròn mini hiển thị % nộp
const MiniRing = ({ pct, size = 64, stroke = 7, color }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size/2} cy={size/2} r={r} stroke="#E8EDF2" strokeWidth={stroke} fill="none" />
        <Circle
          cx={size/2} cy={size/2} r={r}
          stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - Math.min(pct, 1))}
          strokeLinecap="round"
          rotation="-90" origin={`${size/2},${size/2}`}
        />
      </Svg>
      <Text style={{ fontSize: 11, fontWeight: '700', color }}>{Math.round(pct * 100)}%</Text>
    </View>
  );
};

export default function TuitionScreen() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [refreshing, setRefreshing]   = useState(false);

  const fetchData = async () => {
    try {
      const res  = await api.get('/enrollments');
      const list = (res.data || []).filter(e => e.status === 'SUCCESS');
      setEnrollments(list);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const totalCredits = enrollments.reduce((s, e) => s + (e.credit || 0), 0);
  const totalFee     = totalCredits * PRICE_PER_CREDIT;

  const bbtCredits = enrollments.reduce((s, e) =>
    s + (e.course_type?.trim() === 'Bắt buộc' ? (e.credit || 0) : 0), 0);
  const tcCredits  = enrollments.reduce((s, e) =>
    s + (e.course_type?.trim() !== 'Bắt buộc' ? (e.credit || 0) : 0), 0);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[COLORS.primary]} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💰 Tra cứu học phí</Text>
        <Text style={styles.headerSub}>800.000 ₫ / tín chỉ · HK2 (2025-2026)</Text>
      </View>

      <View style={styles.content}>

        {/* Tổng học phí banner */}
        <View style={styles.totalBanner}>
          <View>
            <Text style={styles.bannerLabel}>TỔNG HỌC PHÍ PHẢI NỘP</Text>
            <Text style={styles.bannerAmount}>{fmt(totalFee)}</Text>
          </View>
          <Text style={{ fontSize: 40, opacity: 0.3 }}>🧾</Text>
        </View>

        {/* 3 summary cards */}
        <View style={styles.summaryRow}>
          {/* Tổng tín chỉ */}
          <View style={[styles.summaryCard, { flex: 1 }]}>
            <Text style={styles.summaryLabel}>Tổng tín chỉ</Text>
            <Text style={[styles.summaryNum, { color: COLORS.text }]}>{totalCredits}</Text>
            <Text style={styles.summarySub}>tín chỉ</Text>
          </View>

          {/* Bắt buộc */}
          <View style={[styles.summaryCard, { flex: 1, borderLeftWidth: 3, borderLeftColor: COLORS.primary }]}>
            <Text style={styles.summaryLabel}>Bắt buộc</Text>
            <MiniRing pct={bbtCredits / 120} size={52} stroke={6} color={COLORS.primary} />
            <Text style={[styles.summarySub, { color: COLORS.primary }]}>{bbtCredits} TC</Text>
          </View>

          {/* Tự chọn */}
          <View style={[styles.summaryCard, { flex: 1, borderLeftWidth: 3, borderLeftColor: COLORS.warning }]}>
            <Text style={styles.summaryLabel}>Tự chọn</Text>
            <MiniRing pct={tcCredits / 42} size={52} stroke={6} color={COLORS.warning} />
            <Text style={[styles.summarySub, { color: COLORS.warning }]}>{tcCredits} TC</Text>
          </View>
        </View>

        {/* Chi tiết từng môn */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Chi tiết từng học phần</Text>

          {enrollments.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>📂</Text>
              <Text style={{ color: COLORS.textSecondary, fontSize: SIZES.sm }}>
                Bạn chưa đăng ký học phần nào
              </Text>
              <TouchableOpacity
                style={[styles.enrollBtn, { marginTop: 12 }]}
                onPress={() => router.push('/(tabs)/courses')}
              >
                <Text style={styles.enrollBtnText}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Table header */}
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Môn học</Text>
                <Text style={[styles.tableCell, styles.tableCenterCell]}>TC</Text>
                <Text style={[styles.tableCell, styles.tableRightCell]}>Học phí</Text>
              </View>

              {enrollments.map((e, idx) => (
                <View
                  key={e.id}
                  style={[styles.tableRow, idx % 2 === 0 && { backgroundColor: '#f8faff' }]}
                >
                  <View style={{ flex: 2 }}>
                    <Text style={styles.courseCode}>{e.course_code}</Text>
                    <Text style={styles.courseName} numberOfLines={1}>{e.course_name}</Text>
                    <View style={[
                      styles.typeBadge,
                      { backgroundColor: e.course_type?.trim() === 'Bắt buộc' ? '#eff6ff' : '#fffbeb' }
                    ]}>
                      <Text style={[
                        styles.typeText,
                        { color: e.course_type?.trim() === 'Bắt buộc' ? COLORS.primary : COLORS.warning }
                      ]}>
                        {e.course_type || 'Bắt buộc'}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.tableCell, styles.tableCenterCell, { fontWeight: '700' }]}>
                    {e.credit}
                  </Text>
                  <Text style={[styles.tableCell, styles.tableRightCell, { color: COLORS.primary, fontWeight: '700' }]}>
                    {fmt((e.credit || 0) * PRICE_PER_CREDIT)}
                  </Text>
                </View>
              ))}

              {/* Footer tổng */}
              <View style={[styles.tableRow, styles.tableFooter]}>
                <Text style={[styles.tableCell, { flex: 2, fontWeight: '700' }]}>Tổng cộng</Text>
                <Text style={[styles.tableCell, styles.tableCenterCell, { fontWeight: '700' }]}>
                  {totalCredits}
                </Text>
                <Text style={[styles.tableCell, styles.tableRightCell, { color: COLORS.primary, fontWeight: '700' }]}>
                  {fmt(totalFee)}
                </Text>
              </View>
            </>
          )}
        </View>

        <Text style={styles.note}>
          * Học phí tính theo đơn giá 800.000 ₫ / tín chỉ.{'\n'}
          Liên hệ phòng tài vụ để biết thêm chi tiết.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  backBtn:    { marginBottom: 8 },
  backText:   { color: COLORS.primary, fontWeight: '600', fontSize: SIZES.sm },
  headerTitle:{ fontSize: SIZES.xl, fontWeight: '700', color: COLORS.text },
  headerSub:  { fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },

  content: { padding: 16, gap: 14 },

  totalBanner: {
    borderRadius: 14,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  bannerLabel:  { color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  bannerAmount: { color: '#fff', fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },

  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10, padding: 12,
    alignItems: 'center', gap: 4,
    borderWidth: 0.5, borderColor: COLORS.border,
  },
  summaryLabel: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '700', textTransform: 'uppercase' },
  summaryNum:   { fontSize: 22, fontWeight: '700' },
  summarySub:   { fontSize: SIZES.xs, color: COLORS.textSecondary, fontWeight: '600' },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12, padding: 16,
    borderWidth: 0.5, borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: SIZES.sm, fontWeight: '700',
    color: COLORS.textSecondary, textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 12,
  },

  tableRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  tableHeader: { backgroundColor: '#f8faff' },
  tableFooter: { backgroundColor: '#f0f6ff', borderBottomWidth: 0 },
  tableCell:   { fontSize: SIZES.sm, color: COLORS.text },
  tableCenterCell: { width: 36, textAlign: 'center', color: COLORS.text },
  tableRightCell:  { width: 110, textAlign: 'right', color: COLORS.text },

  courseCode: { fontSize: SIZES.xs, color: COLORS.primary, fontWeight: '700' },
  courseName: { fontSize: SIZES.sm, color: COLORS.text, fontWeight: '500', marginVertical: 2 },
  typeBadge:  { alignSelf: 'flex-start', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 },
  typeText:   { fontSize: 10, fontWeight: '600' },

  enrollBtn:     { backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 8 },
  enrollBtnText: { color: '#fff', fontWeight: '600', fontSize: SIZES.sm },

  note: { fontSize: 11, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 18, marginBottom: 24 },
});