import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, ActivityIndicator, RefreshControl, Modal, ScrollView
} from 'react-native';
import api from '../../services/api';
import { COLORS, SIZES } from '../../constants/theme';

const DAY_MAP = {
  MONDAY: 'Thứ 2', TUESDAY: 'Thứ 3', WEDNESDAY: 'Thứ 4',
  THURSDAY: 'Thứ 5', FRIDAY: 'Thứ 6', SATURDAY: 'Thứ 7', SUNDAY: 'CN',
};

export default function CoursesScreen() {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enrollingId, setEnrollingId] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const fetchAll = async () => {
    try {
      const [cRes, eRes] = await Promise.all([api.get('/courses'), api.get('/enrollments')]);
      setCourses(cRes.data);
      setEnrollments(eRes.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const isEnrolled = (courseId) => enrollments.some(e => e.id === courseId || e.course_id === courseId);

  const handleEnroll = async (course) => {
    if (isEnrolled(course.id)) {
      Alert.alert('Thông báo', 'Bạn đã đăng ký học phần này rồi');
      return;
    }
    Alert.alert(
      'Xác nhận đăng ký',
      `Đăng ký học phần ${course.course_name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng ký', onPress: async () => {
            setEnrollingId(course.id);
            try {
              await api.post('/enrollments', { courseId: course.id });
              await fetchAll();
              Alert.alert('Thành công', 'Đăng ký học phần thành công!');
            } catch (e) {
              Alert.alert('Thất bại', e.response?.data?.message || 'Có lỗi xảy ra');
            } finally {
              setEnrollingId(null);
            }
          }
        }
      ]
    );
  };

  const filtered = courses.filter(c =>
    c.course_name.toLowerCase().includes(search.toLowerCase()) ||
    c.course_code.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const enrolled = isEnrolled(item.id);
    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.codeTag}><Text style={styles.codeText}>{item.course_code}</Text></View>
          <TouchableOpacity style={styles.detailBtn} onPress={() => setSelectedCourse(item)}>
            <Text style={styles.detailBtnText}>ℹ Chi tiết</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.courseName}>{item.course_name}</Text>

        <View style={styles.infoGrid}>
          <Text style={styles.infoItem}>👨‍🏫 {item.lecturer_name?.trim()}</Text>
          <Text style={styles.infoItem}>🕐 {item.start_time?.slice(0,5)} – {item.end_time?.slice(0,5)}</Text>
          <Text style={styles.infoItem}>📅 {DAY_MAP[item.day_of_week] || item.day_of_week}</Text>
          <Text style={styles.infoItem}>📊 {item.credit} tín chỉ</Text>
          <Text style={styles.infoItem}>🏷 {item.course_type}</Text>
          <Text style={styles.infoItem}>🎓 {item.level}</Text>
        </View>

        <View style={styles.cardBottom}>
          <Text style={styles.semText}>{item.semester}</Text>
          <TouchableOpacity
            style={[styles.enrollBtn, enrolled && styles.enrolledBtn]}
            onPress={() => handleEnroll(item)}
            disabled={!!enrollingId || enrolled}
          >
            {enrollingId === item.id
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.enrollBtnText}>{enrolled ? '✓ Đã đăng ký' : '+ Đăng ký'}</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Đăng ký học phần</Text>
        <Text style={styles.headerSub}>Học kỳ: HK2 2025-2026</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Tìm mã hoặc tên môn học..."
          placeholderTextColor={COLORS.textMuted}
        />
        {search ? <TouchableOpacity onPress={() => setSearch('')}><Text style={{ fontSize: 18 }}>✕</Text></TouchableOpacity> : null}
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAll(); }} colors={[COLORS.primary]} />}
          ListEmptyComponent={<Text style={styles.emptyText}>Không tìm thấy học phần nào</Text>}
        />
      )}

      {/* Detail Modal */}
      <Modal visible={!!selectedCourse} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ScrollView>
              <View style={styles.modalHeader}>
                <View style={styles.codeTag}><Text style={styles.codeText}>{selectedCourse?.course_code}</Text></View>
                <TouchableOpacity onPress={() => setSelectedCourse(null)}>
                  <Text style={{ fontSize: 22, color: COLORS.textSecondary }}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.modalTitle}>{selectedCourse?.course_name}</Text>

              {[
                ['👨‍🏫 Giảng viên', selectedCourse?.lecturer_name?.trim()],
                ['📅 Thứ', DAY_MAP[selectedCourse?.day_of_week]],
                ['🕐 Thời gian', `${selectedCourse?.start_time?.slice(0,5)} – ${selectedCourse?.end_time?.slice(0,5)}`],
                ['📊 Tín chỉ', selectedCourse?.credit],
                ['🏷 Loại', selectedCourse?.course_type],
                ['🎓 Cấp độ', selectedCourse?.level],
                ['📚 Nhóm', selectedCourse?.group_code],
                ['📆 Học kỳ', selectedCourse?.semester],
              ].map(([label, value]) => (
                <View key={label} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{label}</Text>
                  <Text style={styles.detailValue}>{value}</Text>
                </View>
              ))}

              <TouchableOpacity
                style={[styles.enrollBtn, { marginTop: 16 }, isEnrolled(selectedCourse?.id) && styles.enrolledBtn]}
                onPress={() => { setSelectedCourse(null); handleEnroll(selectedCourse); }}
                disabled={isEnrolled(selectedCourse?.id)}
              >
                <Text style={styles.enrollBtnText}>
                  {isEnrolled(selectedCourse?.id) ? '✓ Đã đăng ký' : '+ Đăng ký học phần này'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { backgroundColor: COLORS.white, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.text },
  headerSub: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.white, marginHorizontal: 16, marginVertical: 12,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 0.5, borderColor: COLORS.border,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: SIZES.md, color: COLORS.text },
  list: { paddingHorizontal: 16, paddingBottom: 80, gap: 12 },
  card: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: COLORS.border },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  codeTag: { backgroundColor: COLORS.primaryLight, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  codeText: { fontSize: SIZES.xs, color: COLORS.primary, fontWeight: '700' },
  detailBtn: { borderWidth: 0.5, borderColor: COLORS.border, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  detailBtnText: { fontSize: SIZES.xs, color: COLORS.textSecondary },
  courseName: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  infoGrid: { gap: 3, marginBottom: 10 },
  infoItem: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  semText: { fontSize: SIZES.xs, color: COLORS.textMuted },
  enrollBtn: { backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 8 },
  enrolledBtn: { backgroundColor: COLORS.success },
  enrollBtnText: { color: '#fff', fontWeight: '600', fontSize: SIZES.sm },
  emptyText: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 40 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  modalTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  detailLabel: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  detailValue: { fontSize: SIZES.sm, color: COLORS.text, fontWeight: '500', maxWidth: '55%', textAlign: 'right' },
});
