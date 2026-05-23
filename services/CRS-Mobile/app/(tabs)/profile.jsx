import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert,
  ScrollView, ActivityIndicator, TextInput
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../services/AuthContext';
import api from '../../services/api';
import { COLORS, SIZES } from '../../constants/theme';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', phone: '', address: '', dob: ''
  });

  useEffect(() => { fetchUserProfile(); }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await api.get('/auth/user');
      if (res.data?.user) {
        setProfile(res.data.user);
        setFormData({
          fullName: res.data.user.fullName || '',
          phone:    res.data.user.phone    || '',
          address:  res.data.user.address  || '',
          dob:      res.data.user.dob ? res.data.user.dob.slice(0, 10) : '',
        });
      }
    } catch (e) {
      console.log('Error fetching profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name = '') =>
    name.split(' ').slice(-2).map(n => n[0]).join('').toUpperCase();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất', style: 'destructive',
        onPress: async () => { await logout(); router.replace('/(auth)/login'); }
      }
    ]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        full_name: formData.fullName,
        phone:     formData.phone    || null,
        address:   formData.address  || null,
        dob:       formData.dob      || null,
      };
      const res = await api.put('/auth/user', payload);
      if (res.data?.user) {
        setProfile(res.data.user);
        updateUser(res.data.user);
        setEditMode(false);
        Alert.alert('Thành công', 'Cập nhật hồ sơ thành công');
      }
    } catch (e) {
      Alert.alert('Lỗi', e?.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phone:    profile.phone    || '',
        address:  profile.address  || '',
        dob:      profile.dob ? profile.dob.slice(0, 10) : '',
      });
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const displayUser = profile || user;

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
      </View>

      {/* Avatar + Name */}
      <View style={styles.profileBox}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(displayUser?.fullName)}</Text>
        </View>
        <Text style={styles.name}>{displayUser?.fullName}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{displayUser?.role || 'STUDENT'}</Text>
        </View>
      </View>

      {/* === THÔNG TIN TÀI KHOẢN (readonly) === */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Thông tin tài khoản</Text>
        {[
          ['Email / Tài khoản', displayUser?.email],
          ['Vai trò',           displayUser?.role],
          ['ID',                `#${displayUser?.id}`],
        ].map(([label, value]) => (
          <View key={label} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value}</Text>
          </View>
        ))}
      </View>

      {/* === THÔNG TIN CÁ NHÂN (editable) === */}
      <View style={styles.card}>
        {/* Card header + nút chỉnh sửa */}
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
          {!editMode ? (
            <TouchableOpacity onPress={() => setEditMode(true)} style={styles.editBtn}>
              <Text style={styles.editBtnText}>✏️ Chỉnh sửa</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.editActions}>
              <TouchableOpacity onPress={handleCancelEdit} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                disabled={saving}
              >
                <Text style={styles.saveBtnText}>{saving ? 'Đang lưu...' : 'Lưu'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Điện thoại */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Điện thoại</Text>
          {editMode ? (
            <TextInput
              style={styles.editInput}
              value={formData.phone}
              onChangeText={t => setFormData(s => ({ ...s, phone: t }))}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#aaa"
              keyboardType="phone-pad"
            />
          ) : (
            <Text style={[styles.infoValue, !displayUser?.phone && styles.emptyValue]}>
              {displayUser?.phone || 'Chưa cập nhật'}
            </Text>
          )}
        </View>

        {/* Địa chỉ */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Địa chỉ</Text>
          {editMode ? (
            <TextInput
              style={styles.editInput}
              value={formData.address}
              onChangeText={t => setFormData(s => ({ ...s, address: t }))}
              placeholder="Nhập địa chỉ"
              placeholderTextColor="#aaa"
            />
          ) : (
            <Text style={[styles.infoValue, !displayUser?.address && styles.emptyValue]}>
              {displayUser?.address || 'Chưa cập nhật'}
            </Text>
          )}
        </View>

        {/* Ngày sinh */}
        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.infoLabel}>Ngày sinh</Text>
          {editMode ? (
            <TextInput
              style={styles.editInput}
              value={formData.dob}
              onChangeText={t => setFormData(s => ({ ...s, dob: t }))}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
            />
          ) : (
            <Text style={[styles.infoValue, !displayUser?.dob && styles.emptyValue]}>
              {displayUser?.dob ? displayUser.dob.slice(0, 10) : 'Chưa cập nhật'}
            </Text>
          )}
        </View>

        {/* Hint khi edit */}
        {editMode && (
          <Text style={styles.editHint}>
            * Nhập ngày sinh theo định dạng YYYY-MM-DD (vd: 2000-01-25)
          </Text>
        )}
      </View>

      {/* Hỗ trợ */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Hỗ trợ</Text>
        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.infoLabel}>📧 Hỗ trợ kỹ thuật</Text>
          <Text style={[styles.infoValue, { color: COLORS.primary }]}>
            support@crs-system.edu
          </Text>
        </View>
      </View>

      {/* Đăng xuất */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: COLORS.background },

  header:      {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  headerTitle: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.text },

  profileBox:  {
    alignItems: 'center',
    padding: 32,
    backgroundColor: COLORS.white,
    marginBottom: 16,
  },
  avatar:      {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  avatarText:  { fontSize: 28, fontWeight: '700', color: COLORS.primary },
  name:        { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  roleBadge:   {
    backgroundColor: COLORS.primary,
    borderRadius: 6, paddingHorizontal: 14, paddingVertical: 4,
  },
  roleText:    { color: '#fff', fontWeight: '700', fontSize: SIZES.sm },

  card:        {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },

  // Card header row: title + action button
  cardHeader:  {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle:   {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Edit / Save / Cancel buttons
  editBtn:         { paddingVertical: 4, paddingHorizontal: 10 },
  editBtnText:     { color: COLORS.primary, fontWeight: '600', fontSize: SIZES.sm },
  editActions:     { flexDirection: 'row', gap: 8 },
  cancelBtn:       { paddingVertical: 4, paddingHorizontal: 10 },
  cancelBtnText:   { color: '#888', fontWeight: '600', fontSize: SIZES.sm },
  saveBtn:         {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: 4, paddingHorizontal: 12,
  },
  saveBtnText:     { color: '#fff', fontWeight: '700', fontSize: SIZES.sm },

  infoRow:     {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  infoLabel:   { fontSize: SIZES.sm, color: COLORS.textSecondary, flex: 1 },
  infoValue:   { fontSize: SIZES.sm, fontWeight: '500', color: COLORS.text, flex: 1, textAlign: 'right' },
  emptyValue:  { color: '#bbb', fontStyle: 'italic' },

  // Input khi chỉnh sửa
  editInput:   {
    flex: 1,
    textAlign: 'right',
    fontSize: SIZES.sm,
    color: COLORS.text,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.primary,
    paddingVertical: 2,
    paddingHorizontal: 4,
    backgroundColor: '#f0f6ff',
    borderRadius: 4,
  },

  editHint:    {
    marginTop: 10,
    fontSize: 11,
    color: '#aaa',
    fontStyle: 'italic',
  },

  logoutBtn:   {
    marginHorizontal: 16, marginBottom: 40,
    backgroundColor: COLORS.dangerLight,
    borderRadius: 10, paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.danger,
  },
  logoutText:  { color: COLORS.danger, fontWeight: '700', fontSize: SIZES.md },
});