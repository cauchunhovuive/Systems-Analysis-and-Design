import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Dimensions
} from 'react-native';
import api from '../../services/api';
import { COLORS, SIZES } from '../../constants/theme';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const DAY_LABELS = { MON: 'T2', TUE: 'T3', WED: 'T4', THU: 'T5', FRI: 'T6', SAT: 'T7' };
const DAY_MAP = { MONDAY: 'MON', TUESDAY: 'TUE', WEDNESDAY: 'WED', THURSDAY: 'THU', FRIDAY: 'FRI', SATURDAY: 'SAT' };

const HOURS = Array.from({ length: 13 }, (_, i) => i + 7); // 7:00 – 19:00
const HOUR_HEIGHT = 60;

const COURSE_COLORS = [
  { bg: '#E8F0FE', border: '#1E6FF1', text: '#1558C0' },
  { bg: '#D1FAE5', border: '#10B981', text: '#065F46' },
  { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },
  { bg: '#FCE7F3', border: '#EC4899', text: '#9D174D' },
  { bg: '#EDE9FE', border: '#8B5CF6', text: '#5B21B6' },
  { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' },
];

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export default function TimetableScreen() {
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

  const getColor = (idx) => COURSE_COLORS[idx % COURSE_COLORS.length];

  const getCourseStyle = (course) => {
    const startMin = timeToMinutes(course.start_time) - 7 * 60;
    const endMin = timeToMinutes(course.end_time) - 7 * 60;
    const top = (startMin / 60) * HOUR_HEIGHT;
    const height = ((endMin - startMin) / 60) * HOUR_HEIGHT;
    return { top, height };
  };

  const screenW = Dimensions.get('window').width;
  const timeColW = 44;
  const dayColW = (screenW - timeColW - 32) / 6;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Timetable</Text>
        <View style={styles.confirmedBadge}>
          <Text style={styles.confirmedText}>● Confirmed Courses</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} colors={[COLORS.primary]} />}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ paddingHorizontal: 16, paddingBottom: 80 }}>
              {/* Day headers */}
              <View style={[styles.dayHeaderRow, { marginLeft: timeColW }]}>
                {DAYS.map(day => (
                  <View key={day} style={[styles.dayHeader, { width: dayColW }]}>
                    <Text style={styles.dayHeaderText}>{DAY_LABELS[day]}</Text>
                  </View>
                ))}
              </View>

              {/* Grid */}
              <View style={{ flexDirection: 'row' }}>
                {/* Time column */}
                <View style={{ width: timeColW }}>
                  {HOURS.map(h => (
                    <View key={h} style={[styles.timeCell, { height: HOUR_HEIGHT }]}>
                      <Text style={styles.timeText}>{String(h).padStart(2,'0')}:00</Text>
                    </View>
                  ))}
                </View>

                {/* Day columns */}
                {DAYS.map((day, dayIdx) => {
                  const dayCourses = enrollments.filter(e => DAY_MAP[e.day_of_week] === day);
                  return (
                    <View key={day} style={[styles.dayCol, { width: dayColW, height: HOURS.length * HOUR_HEIGHT }]}>
                      {/* Hour lines */}
                      {HOURS.map(h => (
                        <View key={h} style={[styles.hourLine, { top: (h - 7) * HOUR_HEIGHT }]} />
                      ))}
                      {/* Courses */}
                      {dayCourses.map((course, idx) => {
                        const { top, height } = getCourseStyle(course);
                        const color = getColor(enrollments.indexOf(course));
                        return (
                          <View key={course.id} style={[styles.courseBlock, { top, height, backgroundColor: color.bg, borderLeftColor: color.border }]}>
                            <Text style={[styles.courseBlockCode, { color: color.text }]} numberOfLines={1}>{course.course_code}</Text>
                            <Text style={[styles.courseBlockName, { color: color.text }]} numberOfLines={2}>{course.course_name}</Text>
                            <Text style={[styles.courseBlockTime, { color: color.text }]}>{course.start_time?.slice(0,5)}-{course.end_time?.slice(0,5)}</Text>
                          </View>
                        );
                      })}
                    </View>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {enrollments.length === 0 && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyText}>Chưa có lịch học nào</Text>
              <Text style={styles.emptySubText}>Đăng ký học phần để xem thời khóa biểu</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: COLORS.white, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.text },
  confirmedBadge: { backgroundColor: COLORS.success, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  confirmedText: { color: '#fff', fontSize: SIZES.xs, fontWeight: '600' },
  dayHeaderRow: { flexDirection: 'row', marginBottom: 0 },
  dayHeader: { height: 36, justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderColor: COLORS.border, backgroundColor: COLORS.white },
  dayHeaderText: { fontSize: SIZES.xs, fontWeight: '700', color: COLORS.primary },
  timeCell: { justifyContent: 'flex-start', paddingTop: 4, paddingRight: 6, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  timeText: { fontSize: 10, color: COLORS.textMuted, textAlign: 'right' },
  dayCol: { position: 'relative', borderLeftWidth: 0.5, borderLeftColor: COLORS.border },
  hourLine: { position: 'absolute', left: 0, right: 0, borderBottomWidth: 0.5, borderBottomColor: COLORS.border },
  courseBlock: {
    position: 'absolute', left: 2, right: 2,
    borderRadius: 6, borderLeftWidth: 3, padding: 4, overflow: 'hidden',
  },
  courseBlockCode: { fontSize: 9, fontWeight: '700' },
  courseBlockName: { fontSize: 9, fontWeight: '500', lineHeight: 12 },
  courseBlockTime: { fontSize: 8, marginTop: 2 },
  emptyBox: { alignItems: 'center', paddingTop: 60, paddingBottom: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  emptySubText: { fontSize: SIZES.sm, color: COLORS.textSecondary },
});
